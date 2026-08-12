class VerificationError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

function resolveEndpoint() {
  const raw = process.env.DGS_REPORT_ENDPOINT ?? "";
  let endpoint;
  try {
    endpoint = new URL(raw);
  } catch {
    throw new VerificationError("invalid_endpoint");
  }

  const loopback = endpoint.hostname === "127.0.0.1" || endpoint.hostname === "localhost";
  const allowedScheme = endpoint.protocol === "https:" || (loopback && endpoint.protocol === "http:");
  if (
    !allowedScheme ||
    endpoint.pathname !== "/v1/reports" ||
    endpoint.username ||
    endpoint.password ||
    endpoint.search ||
    endpoint.hash
  ) {
    throw new VerificationError("invalid_endpoint");
  }

  return endpoint;
}

async function readJson(response, failureCode) {
  try {
    return await response.json();
  } catch {
    throw new VerificationError(failureCode);
  }
}

async function request(url, init, failureCode) {
  try {
    return await fetch(url, {
      ...init,
      signal: AbortSignal.timeout(20_000)
    });
  } catch {
    throw new VerificationError(failureCode);
  }
}

async function verifyHealth(endpoint) {
  const healthUrl = new URL("/health", endpoint);
  const response = await request(healthUrl, { method: "GET" }, "health_check_failed");
  const body = await readJson(response, "health_check_failed");
  if (
    response.status !== 200 ||
    body?.ok !== true ||
    body?.service !== "dgs-feedback" ||
    body?.version !== "v1"
  ) {
    throw new VerificationError("health_check_failed");
  }

  console.log("DGS_FEEDBACK_LIVE_HEALTH_OK");
}

async function verifyInvalidRejection(endpoint) {
  const response = await request(
    endpoint,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-dgs-client": "DgsFeedbackLiveVerifier"
      },
      body: "{}"
    },
    "invalid_rejection_failed"
  );
  const body = await readJson(response, "invalid_rejection_failed");
  if (response.status !== 400 || body?.ok !== false || body?.error !== "invalid_schema") {
    throw new VerificationError("invalid_rejection_failed");
  }

  console.log("DGS_FEEDBACK_LIVE_INVALID_REJECTED");
}

function syntheticPayload() {
  const timestamp = new Date().toISOString();
  return {
    schemaVersion: 2,
    source: "dgs-unity-editor",
    receivedAtUtc: timestamp,
    packageName: "Dialogue Graph System",
    packageVersion: "3.0.0",
    unityVersion: "2022.3.62f3",
    os: "Synthetic",
    editorPlatform: "SyntheticEditor",
    featureName: "Live Verifier",
    failureStage: "verification",
    providerName: "Synthetic Provider",
    providerType: "test",
    activeGraphName: "Synthetic Graph",
    activeGraphPath: "Assets/[REDACTED_PATH]",
    sanitizedErrorMessage: "Synthetic verification report.",
    sanitizedStackTrace: "Synthetic stack trace.",
    sanitizedReportBody: "No user or project content.",
    diagnostic: {
      run: { status: "synthetic", originalUserPrompt: "" },
      planner: { history: [] }
    },
    truncated: false,
    truncationReason: "",
    omittedSections: [],
    configVersion: "live-verifier",
    feedbackEndpointVersion: "v1",
    timestampUtc: timestamp,
    anonymousInstallId: "synthetic-live-verifier",
    anonymousSessionId: `synthetic-${Date.now()}`
  };
}

async function sendSynthetic(endpoint) {
  const response = await request(
    endpoint,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-dgs-client": "DgsFeedbackLiveVerifier"
      },
      body: JSON.stringify(syntheticPayload())
    },
    "synthetic_store_failed"
  );
  const body = await readJson(response, "synthetic_store_failed");
  if (
    response.status !== 201 ||
    body?.ok !== true ||
    typeof body?.reportId !== "string" ||
    !/^dgs_[a-f0-9]{16}$/.test(body.reportId)
  ) {
    throw new VerificationError("synthetic_store_failed");
  }

  console.log(`DGS_FEEDBACK_LIVE_SYNTHETIC_STORED ${body.reportId}`);
}

async function main() {
  const endpoint = resolveEndpoint();
  await verifyHealth(endpoint);
  await verifyInvalidRejection(endpoint);

  if (process.env.DGS_SEND_SYNTHETIC === "1") {
    await sendSynthetic(endpoint);
  }
}

main().catch((error) => {
  const code = error instanceof VerificationError ? error.code : "unexpected_error";
  console.error(`DGS_FEEDBACK_LIVE_FAILED ${code}`);
  process.exitCode = 1;
});
