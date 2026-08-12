import {
  PublicError,
  type DgsFeedbackPayload,
  type StoredReportEnvelope
} from "./types.ts";

export interface GitHubStoreConfig {
  owner: string;
  repo: string;
  branch: string;
  token: string;
}

export interface StoreDependencies {
  fetch: typeof fetch;
  now: () => Date;
  randomBytes: (length: number) => Uint8Array;
  sleep: (milliseconds: number) => Promise<void>;
  logStorageFailure: (event: StorageFailureEvent) => void;
}

export interface StorageFailureEvent {
  event: "dgs_github_storage_failed";
  reportId: string;
  reason: "network_error" | "upstream_status";
  status?: number;
}

export interface StoredReportResult {
  reportId: string;
  path: string;
}

interface PendingReport extends StoredReportResult {
  envelopeJson: string;
}

const RETRY_DELAYS = [100, 250] as const;

function assertConfiguration(config: GitHubStoreConfig): void {
  if (
    !config.owner.trim() ||
    !config.repo.trim() ||
    !config.branch.trim() ||
    !config.token.trim()
  ) {
    throw new PublicError(503, "storage_unavailable");
  }
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}

function compactTimestamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function createPendingReport(
  payload: DgsFeedbackPayload,
  dependencies: StoreDependencies
): PendingReport {
  const now = dependencies.now();
  const reportId = `dgs_${toHex(dependencies.randomBytes(8))}`;
  const year = now.getUTCFullYear().toString().padStart(4, "0");
  const month = (now.getUTCMonth() + 1).toString().padStart(2, "0");
  const day = now.getUTCDate().toString().padStart(2, "0");
  const path = `reports/${year}/${month}/${day}/${compactTimestamp(now)}-${reportId}.json`;
  const envelope: StoredReportEnvelope = {
    storageSchemaVersion: 1,
    reportId,
    receivedAtUtc: now.toISOString(),
    client: payload
  };

  return {
    reportId,
    path,
    envelopeJson: `${JSON.stringify(envelope, null, 2)}\n`
  };
}

function encodePath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}

function encodeBase64(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  const chunkSize = 8_192;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }

  return btoa(binary);
}

function requestUrl(config: GitHubStoreConfig, path: string): string {
  const owner = encodeURIComponent(config.owner);
  const repo = encodeURIComponent(config.repo);
  return `https://api.github.com/repos/${owner}/${repo}/contents/${encodePath(path)}`;
}

function isTransient(status: number): boolean {
  return status === 409 || status === 429 || status >= 500;
}

function logStorageFailure(
  dependencies: StoreDependencies,
  event: StorageFailureEvent
): void {
  try {
    dependencies.logStorageFailure(event);
  } catch {
    // Telemetry must never alter the public failure contract.
  }
}

async function putReport(
  pending: PendingReport,
  config: GitHubStoreConfig,
  dependencies: StoreDependencies
): Promise<Response> {
  return dependencies.fetch(requestUrl(config, pending.path), {
    method: "PUT",
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${config.token}`,
      "content-type": "application/json",
      "x-github-api-version": "2022-11-28",
      "user-agent": "BekaForge-DGS-Feedback"
    },
    body: JSON.stringify({
      message: `report: store ${pending.reportId}`,
      content: encodeBase64(pending.envelopeJson),
      branch: config.branch
    })
  });
}

export async function storeReport(
  payload: DgsFeedbackPayload,
  config: GitHubStoreConfig,
  dependencies: StoreDependencies
): Promise<StoredReportResult> {
  assertConfiguration(config);

  let pending = createPendingReport(payload, dependencies);
  let collisionRetried = false;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    let response: Response;
    try {
      response = await putReport(pending, config, dependencies);
    } catch {
      if (attempt < RETRY_DELAYS.length) {
        await dependencies.sleep(RETRY_DELAYS[attempt]);
        continue;
      }

      logStorageFailure(dependencies, {
        event: "dgs_github_storage_failed",
        reportId: pending.reportId,
        reason: "network_error"
      });
      throw new PublicError(502, "storage_unavailable");
    }

    if (response.status === 201) {
      return { reportId: pending.reportId, path: pending.path };
    }

    if (response.status === 422 && !collisionRetried) {
      collisionRetried = true;
      pending = createPendingReport(payload, dependencies);
      continue;
    }

    if (isTransient(response.status) && attempt < RETRY_DELAYS.length) {
      await dependencies.sleep(RETRY_DELAYS[attempt]);
      continue;
    }

    logStorageFailure(dependencies, {
      event: "dgs_github_storage_failed",
      reportId: pending.reportId,
      reason: "upstream_status",
      status: response.status
    });
    throw new PublicError(502, "storage_unavailable");
  }

  throw new PublicError(502, "storage_unavailable");
}
