import test from "node:test";
import assert from "node:assert/strict";
import {
  createHandler,
  type DgsFeedbackEnv,
  type HandlerDependencies
} from "../src/index.ts";
import { validReport } from "./fixtures/valid-report.ts";

interface Harness {
  handler: ReturnType<typeof createHandler>;
  env: DgsFeedbackEnv;
  githubCalls: Array<{ url: string; init?: RequestInit }>;
  rateLimitKeys: string[];
}

function createHarness(options?: {
  githubStatus?: number;
  rateLimitSuccess?: boolean;
  token?: string;
}): Harness {
  const githubCalls: Array<{ url: string; init?: RequestInit }> = [];
  const rateLimitKeys: string[] = [];
  const dependencies: HandlerDependencies = {
    fetch: (async (input: RequestInfo | URL, init?: RequestInit) => {
      githubCalls.push({ url: String(input), init });
      return new Response("{}", { status: options?.githubStatus ?? 201 });
    }) as typeof fetch,
    now: () => new Date("2026-08-12T14:30:52.000Z"),
    randomBytes: () => Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8]),
    sleep: async () => {}
  };

  const env = {
    GITHUB_REPORTS_TOKEN: options?.token ?? "test-token",
    GITHUB_OWNER: "arjanbekaa",
    GITHUB_REPO: "dgs-ai-reports",
    GITHUB_BRANCH: "main",
    REPORT_RATE_LIMITER: {
      limit: async ({ key }: { key: string }) => {
        rateLimitKeys.push(key);
        return { success: options?.rateLimitSuccess ?? true };
      }
    }
  } as unknown as DgsFeedbackEnv;

  return {
    handler: createHandler(dependencies),
    env,
    githubCalls,
    rateLimitKeys
  };
}

function reportRequest(
  body: string,
  headers: Record<string, string> = { "content-type": "application/json" }
): Request {
  return new Request("https://worker.test/v1/reports", {
    method: "POST",
    headers,
    body
  });
}

async function responseJson(response: Response): Promise<Record<string, unknown>> {
  return (await response.json()) as Record<string, unknown>;
}

test("health exposes only service status and does not touch storage", async () => {
  const harness = createHarness();

  const response = await harness.handler.fetch(
    new Request("https://worker.test/health"),
    harness.env
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await responseJson(response), {
    ok: true,
    service: "dgs-feedback",
    version: "v1"
  });
  assert.equal(harness.githubCalls.length, 0);
  assert.equal(harness.rateLimitKeys.length, 0);
});

test("valid report is rate-limited then stored exactly once", async () => {
  const harness = createHarness();

  const response = await harness.handler.fetch(
    reportRequest(JSON.stringify(validReport)),
    harness.env
  );

  assert.equal(response.status, 201);
  assert.deepEqual(await responseJson(response), {
    ok: true,
    reportId: "dgs_0102030405060708"
  });
  assert.deepEqual(harness.rateLimitKeys, [validReport.anonymousInstallId]);
  assert.equal(harness.githubCalls.length, 1);
  assert.notEqual(response.headers.get("access-control-allow-credentials"), "true");
});

test("unknown routes and unsupported report methods fail before storage", async () => {
  const harness = createHarness();

  const unknown = await harness.handler.fetch(
    new Request("https://worker.test/v1/reports/anything"),
    harness.env
  );
  const method = await harness.handler.fetch(
    new Request("https://worker.test/v1/reports"),
    harness.env
  );

  assert.equal(unknown.status, 404);
  assert.deepEqual(await responseJson(unknown), { ok: false, error: "not_found" });
  assert.equal(method.status, 405);
  assert.equal(method.headers.get("allow"), "POST");
  assert.deepEqual(await responseJson(method), {
    ok: false,
    error: "method_not_allowed"
  });
  assert.equal(harness.githubCalls.length, 0);
});

test("unsupported content type fails before reading or storage", async () => {
  const harness = createHarness();
  const response = await harness.handler.fetch(
    reportRequest("{}", { "content-type": "text/plain" }),
    harness.env
  );

  assert.equal(response.status, 415);
  assert.deepEqual(await responseJson(response), {
    ok: false,
    error: "unsupported_media_type"
  });
  assert.equal(harness.githubCalls.length, 0);
  assert.equal(harness.rateLimitKeys.length, 0);
});

test("declared and actual oversized bodies return 413 before storage", async () => {
  const harness = createHarness();
  const declared = await harness.handler.fetch(
    reportRequest("{}", {
      "content-type": "application/json",
      "content-length": String(128 * 1024 + 1)
    }),
    harness.env
  );
  const actual = await harness.handler.fetch(
    reportRequest(`"${"x".repeat(128 * 1024)}"`),
    harness.env
  );

  assert.equal(declared.status, 413);
  assert.equal(actual.status, 413);
  assert.equal(harness.githubCalls.length, 0);
  assert.equal(harness.rateLimitKeys.length, 0);
});

test("malformed JSON and invalid DGS schema return stable 400 errors", async () => {
  const harness = createHarness();
  const malformed = await harness.handler.fetch(reportRequest("{"), harness.env);
  const invalid = await harness.handler.fetch(reportRequest("{}"), harness.env);

  assert.equal(malformed.status, 400);
  assert.deepEqual(await responseJson(malformed), {
    ok: false,
    error: "invalid_json"
  });
  assert.equal(invalid.status, 400);
  assert.deepEqual(await responseJson(invalid), {
    ok: false,
    error: "invalid_schema"
  });
  assert.equal(harness.githubCalls.length, 0);
  assert.equal(harness.rateLimitKeys.length, 0);
});

test("rate-limit denial returns 429 and never calls GitHub", async () => {
  const harness = createHarness({ rateLimitSuccess: false });
  const response = await harness.handler.fetch(
    reportRequest(JSON.stringify(validReport)),
    harness.env
  );

  assert.equal(response.status, 429);
  assert.equal(response.headers.get("retry-after"), "60");
  assert.deepEqual(await responseJson(response), {
    ok: false,
    error: "rate_limited"
  });
  assert.equal(harness.githubCalls.length, 0);
});

test("missing secret and GitHub rejection use non-secret public errors", async () => {
  const missing = createHarness({ token: "" });
  const rejected = createHarness({ githubStatus: 403 });

  const missingResponse = await missing.handler.fetch(
    reportRequest(JSON.stringify(validReport)),
    missing.env
  );
  const rejectedResponse = await rejected.handler.fetch(
    reportRequest(JSON.stringify(validReport)),
    rejected.env
  );

  assert.equal(missingResponse.status, 503);
  assert.deepEqual(await responseJson(missingResponse), {
    ok: false,
    error: "storage_unavailable"
  });
  assert.equal(rejectedResponse.status, 502);
  const rejectedJson = await responseJson(rejectedResponse);
  assert.deepEqual(rejectedJson, {
    ok: false,
    error: "storage_unavailable"
  });
  assert.doesNotMatch(JSON.stringify(rejectedJson), /test-token|github/i);
  assert.equal(missing.githubCalls.length, 0);
  assert.equal(rejected.githubCalls.length, 1);
});
