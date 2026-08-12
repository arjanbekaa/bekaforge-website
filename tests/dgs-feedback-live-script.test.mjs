import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { once } from "node:events";

const repositoryRoot = new URL("../", import.meta.url);

async function runVerifier(environment) {
  const child = spawn(
    process.execPath,
    ["scripts/verify-dgs-feedback-live.mjs"],
    {
      cwd: repositoryRoot,
      env: { ...process.env, ...environment },
      stdio: ["ignore", "pipe", "pipe"]
    }
  );
  let stdout = "";
  let stderr = "";
  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  child.stdout.on("data", (chunk) => {
    stdout += chunk;
  });
  child.stderr.on("data", (chunk) => {
    stderr += chunk;
  });

  const [code] = await once(child, "close");
  return { code, stdout, stderr };
}

async function withServer(handler, action) {
  const server = createServer(handler);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const endpoint = `http://127.0.0.1:${address.port}/v1/reports`;

  try {
    return await action(endpoint);
  } finally {
    server.close();
    await once(server, "close");
  }
}

test("live verifier checks health and invalid rejection without sending a report", async () => {
  const requests = [];
  const result = await withServer(async (request, response) => {
    let body = "";
    for await (const chunk of request) {
      body += chunk;
    }
    requests.push({ method: request.method, url: request.url, body });

    response.setHeader("content-type", "application/json");
    if (request.url === "/health") {
      response.writeHead(200).end(
        JSON.stringify({ ok: true, service: "dgs-feedback", version: "v1" })
      );
      return;
    }

    response.writeHead(400).end(
      JSON.stringify({ ok: false, error: "invalid_schema" })
    );
  }, (endpoint) => runVerifier({ DGS_REPORT_ENDPOINT: endpoint }));

  assert.equal(result.code, 0, result.stderr);
  assert.match(result.stdout, /DGS_FEEDBACK_LIVE_HEALTH_OK/);
  assert.match(result.stdout, /DGS_FEEDBACK_LIVE_INVALID_REJECTED/);
  assert.doesNotMatch(result.stdout, /anonymousInstallId|sanitizedErrorMessage/);
  assert.deepEqual(
    requests.map(({ method, url }) => ({ method, url })),
    [
      { method: "GET", url: "/health" },
      { method: "POST", url: "/v1/reports" }
    ]
  );
  assert.equal(requests[1].body, "{}");
});

test("live verifier sends one synthetic report only after explicit opt-in", async () => {
  const reportBodies = [];
  const result = await withServer(async (request, response) => {
    let body = "";
    for await (const chunk of request) {
      body += chunk;
    }
    response.setHeader("content-type", "application/json");

    if (request.url === "/health") {
      response.writeHead(200).end(
        JSON.stringify({ ok: true, service: "dgs-feedback", version: "v1" })
      );
      return;
    }

    if (body === "{}") {
      response.writeHead(400).end(
        JSON.stringify({ ok: false, error: "invalid_schema" })
      );
      return;
    }

    reportBodies.push(JSON.parse(body));
    response.writeHead(201).end(
      JSON.stringify({ ok: true, reportId: "dgs_0102030405060708" })
    );
  }, (endpoint) =>
    runVerifier({
      DGS_REPORT_ENDPOINT: endpoint,
      DGS_SEND_SYNTHETIC: "1"
    })
  );

  assert.equal(result.code, 0, result.stderr);
  assert.match(
    result.stdout,
    /DGS_FEEDBACK_LIVE_SYNTHETIC_STORED dgs_0102030405060708/
  );
  assert.equal(reportBodies.length, 1);
  assert.equal(reportBodies[0].schemaVersion, 2);
  assert.equal(reportBodies[0].source, "dgs-unity-editor");
  assert.equal(reportBodies[0].anonymousInstallId, "synthetic-live-verifier");
  assert.doesNotMatch(result.stdout, /anonymousInstallId|sanitizedErrorMessage/);
});

test("live verifier exits nonzero on an invalid endpoint", async () => {
  const result = await runVerifier({ DGS_REPORT_ENDPOINT: "http://example.com/v1/reports" });

  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /DGS_FEEDBACK_LIVE_FAILED invalid_endpoint/);
  assert.doesNotMatch(result.stderr, /example\.com/);
});
