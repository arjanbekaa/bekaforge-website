import test from "node:test";
import assert from "node:assert/strict";
import {
  storeReport,
  type StorageFailureEvent,
  type StoreDependencies
} from "../src/github-store.ts";
import { PublicError, type StoredReportEnvelope } from "../src/types.ts";
import { validReport } from "./fixtures/valid-report.ts";

interface CapturedRequest {
  url: string;
  init: RequestInit;
}

const config = {
  owner: "arjanbekaa",
  repo: "dgs-ai-reports",
  branch: "main",
  token: "test-token-private"
};

function sequenceFetch(
  statuses: number[],
  captured: CapturedRequest[]
): typeof fetch {
  let index = 0;
  return (async (input: RequestInfo | URL, init?: RequestInit) => {
    captured.push({ url: String(input), init: init ?? {} });
    const status = statuses[Math.min(index, statuses.length - 1)];
    index += 1;
    return new Response(JSON.stringify({ message: "upstream private detail" }), {
      status,
      headers: { "content-type": "application/json" }
    });
  }) as typeof fetch;
}

function dependencies(
  captured: CapturedRequest[],
  statuses = [201],
  randomBytes?: (length: number) => Uint8Array
): StoreDependencies & {
  delays: number[];
  failureEvents: StorageFailureEvent[];
} {
  const delays: number[] = [];
  const failureEvents: StorageFailureEvent[] = [];
  return {
    fetch: sequenceFetch(statuses, captured),
    now: () => new Date("2026-08-12T14:30:52.000Z"),
    randomBytes:
      randomBytes ??
      (() => Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8])),
    sleep: async (milliseconds) => {
      delays.push(milliseconds);
    },
    logStorageFailure: (event) => {
      failureEvents.push(event);
    },
    delays,
    failureEvents
  };
}

function decodeStoredEnvelope(request: CapturedRequest): StoredReportEnvelope {
  const body = JSON.parse(String(request.init.body)) as { content: string };
  return JSON.parse(Buffer.from(body.content, "base64").toString("utf8"));
}

test("storage creates one dated JSON file with a server envelope", async () => {
  const captured: CapturedRequest[] = [];
  const result = await storeReport(validReport, config, dependencies(captured));

  assert.equal(result.reportId, "dgs_0102030405060708");
  assert.equal(
    result.path,
    "reports/2026/08/12/20260812T143052Z-dgs_0102030405060708.json"
  );
  assert.equal(captured.length, 1);
  assert.match(
    captured[0].url,
    /repos\/arjanbekaa\/dgs-ai-reports\/contents\/reports\/2026\/08\/12\//
  );
  assert.equal(captured[0].init.method, "PUT");

  const headers = new Headers(captured[0].init.headers);
  assert.equal(headers.get("authorization"), "Bearer test-token-private");
  assert.equal(headers.get("accept"), "application/vnd.github+json");
  assert.equal(headers.get("x-github-api-version"), "2022-11-28");

  const requestBody = JSON.parse(String(captured[0].init.body));
  assert.equal(requestBody.message, "report: store dgs_0102030405060708");
  assert.equal(requestBody.branch, "main");

  const envelope = decodeStoredEnvelope(captured[0]);
  assert.equal(envelope.storageSchemaVersion, 1);
  assert.equal(envelope.reportId, result.reportId);
  assert.equal(envelope.receivedAtUtc, "2026-08-12T14:30:52.000Z");
  assert.deepEqual(envelope.client, validReport);
});

test("storage removes surrounding whitespace from the GitHub secret", async () => {
  const captured: CapturedRequest[] = [];

  await storeReport(
    validReport,
    { ...config, token: "\r\n  test-token-private  \r\n" },
    dependencies(captured)
  );

  const headers = new Headers(captured[0].init.headers);
  assert.equal(headers.get("authorization"), "Bearer test-token-private");
});

test("storage retries transient GitHub responses twice with bounded delays", async () => {
  const captured: CapturedRequest[] = [];
  const deps = dependencies(captured, [409, 503, 201]);

  const result = await storeReport(validReport, config, deps);

  assert.equal(result.reportId, "dgs_0102030405060708");
  assert.equal(captured.length, 3);
  assert.deepEqual(deps.delays, [100, 250]);
});

test("storage retries one 422 collision with a new report ID", async () => {
  const captured: CapturedRequest[] = [];
  let randomCall = 0;
  const deps = dependencies(captured, [422, 201], () => {
    randomCall += 1;
    return randomCall === 1
      ? Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8])
      : Uint8Array.from([9, 10, 11, 12, 13, 14, 15, 16]);
  });

  const result = await storeReport(validReport, config, deps);

  assert.equal(result.reportId, "dgs_090a0b0c0d0e0f10");
  assert.equal(captured.length, 2);
  assert.notEqual(captured[0].url, captured[1].url);
});

test("storage does not retry authentication failures", async () => {
  const captured: CapturedRequest[] = [];

  await assert.rejects(
    () => storeReport(validReport, config, dependencies(captured, [401])),
    (error: unknown) =>
      error instanceof PublicError &&
      error.status === 502 &&
      error.code === "storage_unavailable"
  );
  assert.equal(captured.length, 1);
});

test("storage rejects missing configuration before any fetch", async () => {
  const captured: CapturedRequest[] = [];

  await assert.rejects(
    () =>
      storeReport(
        validReport,
        { ...config, token: "" },
        dependencies(captured)
      ),
    (error: unknown) =>
      error instanceof PublicError &&
      error.status === 503 &&
      error.code === "storage_unavailable"
  );
  assert.equal(captured.length, 0);
});

test("storage errors never expose token or GitHub response details", async () => {
  const captured: CapturedRequest[] = [];
  const deps = dependencies(captured, [403]);

  const error = await storeReport(
    validReport,
    config,
    deps
  ).catch((caught: unknown) => caught);
  const serialized = JSON.stringify(error, Object.getOwnPropertyNames(error));

  assert.doesNotMatch(serialized, /test-token-private|upstream private detail/);
  assert.deepEqual(deps.failureEvents, [
    {
      event: "dgs_github_storage_failed",
      reportId: "dgs_0102030405060708",
      reason: "upstream_status",
      status: 403
    }
  ]);
  assert.doesNotMatch(JSON.stringify(deps.failureEvents), /token|private detail|reports\//i);
});
