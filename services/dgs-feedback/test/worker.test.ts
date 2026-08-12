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
  installRateLimitKeys: string[];
  ipRateLimitKeys: string[];
}

function createHarness(options?: {
  githubStatus?: number;
  installRateLimitSuccess?: boolean;
  ipRateLimitSuccess?: boolean;
  omitInstallRateLimiter?: boolean;
  omitIpRateLimiter?: boolean;
  token?: string;
}): Harness {
  const githubCalls: Array<{ url: string; init?: RequestInit }> = [];
  const installRateLimitKeys: string[] = [];
  const ipRateLimitKeys: string[] = [];
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
    INSTALL_RATE_LIMITER: options?.omitInstallRateLimiter ? undefined : {
      limit: async ({ key }: { key: string }) => {
        installRateLimitKeys.push(key);
        return { success: options?.installRateLimitSuccess ?? true };
      }
    },
    IP_RATE_LIMITER: options?.omitIpRateLimiter ? undefined : {
      limit: async ({ key }: { key: string }) => {
        ipRateLimitKeys.push(key);
        return { success: options?.ipRateLimitSuccess ?? true };
      }
    }
  } as unknown as DgsFeedbackEnv;

  return {
    handler: createHandler(dependencies),
    env,
    githubCalls,
    installRateLimitKeys,
    ipRateLimitKeys
  };
}

function reportRequest(
  body: string,
  headers: Record<string, string> = {},
  clientIp: string | null = "203.0.113.42"
): Request {
  const requestHeaders: Record<string, string> = {
    "content-type": "application/json",
    ...headers
  };
  if (clientIp !== null) {
    requestHeaders["cf-connecting-ip"] = clientIp;
  }

  return new Request("https://worker.test/v1/reports", {
    method: "POST",
    headers: requestHeaders,
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
  assert.equal(harness.installRateLimitKeys.length, 0);
  assert.equal(harness.ipRateLimitKeys.length, 0);
});

test("valid report passes independent install and hashed-IP limits before one store", async () => {
  const harness = createHarness();
  const reportWithDeniedDiagnosticFields = {
    ...validReport,
    diagnostic: {
      ...validReport.diagnostic,
      originalUserPrompt: "private prompt",
      rawResponse: "private provider response"
    }
  };

  const response = await harness.handler.fetch(
    reportRequest(JSON.stringify(reportWithDeniedDiagnosticFields)),
    harness.env
  );

  assert.equal(response.status, 201);
  assert.deepEqual(await responseJson(response), {
    ok: true,
    reportId: "dgs_0102030405060708"
  });
  assert.deepEqual(harness.installRateLimitKeys, [validReport.anonymousInstallId]);
  assert.deepEqual(harness.ipRateLimitKeys, [
    "ip:17af1cf3d1b5332c53349fc789abdc853bbeea7ed33eff727ff794ab741ccac9"
  ]);
  assert.equal(harness.githubCalls.length, 1);
  const githubBody = JSON.parse(String(harness.githubCalls[0].init?.body)) as {
    content: string;
  };
  const storedJson = Buffer.from(githubBody.content, "base64").toString("utf8");
  assert.doesNotMatch(
    storedJson,
    /originalUserPrompt|rawResponse|private prompt|private provider response/
  );
  assert.doesNotMatch(storedJson, /203\.0\.113\.42|17af1cf3d1b5332c/);
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
  assert.equal(harness.installRateLimitKeys.length, 0);
  assert.equal(harness.ipRateLimitKeys.length, 0);
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
  assert.equal(harness.installRateLimitKeys.length, 0);
  assert.equal(harness.ipRateLimitKeys.length, 0);
});

test("streaming body is cancelled as soon as it crosses the size limit", async () => {
  const harness = createHarness();
  let cancelled = false;
  let pullCount = 0;
  const body = new ReadableStream<Uint8Array>({
    pull(controller) {
      pullCount += 1;
      if (pullCount === 1) {
        controller.enqueue(new Uint8Array(100 * 1024));
      } else if (pullCount === 2) {
        controller.enqueue(new Uint8Array(40 * 1024));
      } else {
        controller.close();
      }
    },
    cancel() {
      cancelled = true;
    }
  });
  const request = new Request("https://worker.test/v1/reports", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    duplex: "half"
  } as RequestInit & { duplex: "half" });

  const response = await harness.handler.fetch(request, harness.env);

  assert.equal(response.status, 413);
  assert.equal(cancelled, true);
  assert.equal(harness.githubCalls.length, 0);
  assert.equal(harness.installRateLimitKeys.length, 0);
  assert.equal(harness.ipRateLimitKeys.length, 0);
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
  assert.equal(harness.installRateLimitKeys.length, 0);
  assert.equal(harness.ipRateLimitKeys.length, 0);
});

test("install rate-limit denial returns 429 before IP limiting or GitHub", async () => {
  const harness = createHarness({ installRateLimitSuccess: false });
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
  assert.deepEqual(harness.installRateLimitKeys, [validReport.anonymousInstallId]);
  assert.equal(harness.ipRateLimitKeys.length, 0);
  assert.equal(harness.githubCalls.length, 0);
});

test("IP rate-limit denial returns the same 429 and never calls GitHub", async () => {
  const harness = createHarness({ ipRateLimitSuccess: false });
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
  assert.equal(harness.installRateLimitKeys.length, 1);
  assert.equal(harness.ipRateLimitKeys.length, 1);
  assert.equal(harness.githubCalls.length, 0);
});

test("missing Cloudflare source IP fails closed before either limiter or GitHub", async () => {
  const harness = createHarness();
  const response = await harness.handler.fetch(
    reportRequest(JSON.stringify(validReport), {}, null),
    harness.env
  );

  assert.equal(response.status, 503);
  assert.deepEqual(await responseJson(response), {
    ok: false,
    error: "storage_unavailable"
  });
  assert.equal(harness.installRateLimitKeys.length, 0);
  assert.equal(harness.ipRateLimitKeys.length, 0);
  assert.equal(harness.githubCalls.length, 0);
});

test("missing either limiter binding fails closed before any limiting or storage", async () => {
  const missingInstall = createHarness({ omitInstallRateLimiter: true });
  const missingIp = createHarness({ omitIpRateLimiter: true });

  const missingInstallResponse = await missingInstall.handler.fetch(
    reportRequest(JSON.stringify(validReport)),
    missingInstall.env
  );
  const missingIpResponse = await missingIp.handler.fetch(
    reportRequest(JSON.stringify(validReport)),
    missingIp.env
  );

  assert.equal(missingInstallResponse.status, 503);
  assert.equal(missingIpResponse.status, 503);
  assert.equal(missingInstall.installRateLimitKeys.length, 0);
  assert.equal(missingInstall.ipRateLimitKeys.length, 0);
  assert.equal(missingIp.installRateLimitKeys.length, 0);
  assert.equal(missingIp.ipRateLimitKeys.length, 0);
  assert.equal(missingInstall.githubCalls.length, 0);
  assert.equal(missingIp.githubCalls.length, 0);
});

test("invalid source IP forms fail closed without exposing their values", async () => {
  const harness = createHarness();
  const commaSeparated = await harness.handler.fetch(
    reportRequest(JSON.stringify(validReport), {}, "203.0.113.42, 198.51.100.7"),
    harness.env
  );
  const oversized = await harness.handler.fetch(
    reportRequest(JSON.stringify(validReport), {}, "1".repeat(129)),
    harness.env
  );

  assert.equal(commaSeparated.status, 503);
  assert.equal(oversized.status, 503);
  assert.deepEqual(await responseJson(commaSeparated), {
    ok: false,
    error: "storage_unavailable"
  });
  assert.equal(harness.installRateLimitKeys.length, 0);
  assert.equal(harness.ipRateLimitKeys.length, 0);
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
