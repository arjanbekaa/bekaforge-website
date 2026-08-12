import { validateReport } from "./contract.ts";
import { storeReport, type StoreDependencies } from "./github-store.ts";
import { MAX_BODY_BYTES, PublicError } from "./types.ts";

export interface DgsFeedbackEnv {
  GITHUB_REPORTS_TOKEN: string;
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
  GITHUB_BRANCH: string;
  INSTALL_RATE_LIMITER: RateLimit;
  IP_RATE_LIMITER: RateLimit;
}

export type HandlerDependencies = StoreDependencies;

export interface DgsFeedbackHandler {
  fetch(request: Request, env: DgsFeedbackEnv): Promise<Response>;
}

const JSON_HEADERS = {
  "cache-control": "no-store",
  "content-type": "application/json; charset=utf-8",
  "x-content-type-options": "nosniff"
} as const;

function jsonResponse(
  status: number,
  body: Record<string, unknown>,
  headers?: Record<string, string>
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, ...headers }
  });
}

function errorResponse(error: PublicError): Response {
  const headers = error.status === 429 ? { "retry-after": "60" } : undefined;
  return jsonResponse(error.status, { ok: false, error: error.code }, headers);
}

function isJsonContentType(request: Request): boolean {
  const value = request.headers.get("content-type") ?? "";
  return value.split(";", 1)[0].trim().toLowerCase() === "application/json";
}

function exceedsDeclaredLimit(request: Request): boolean {
  const value = request.headers.get("content-length");
  if (value === null) {
    return false;
  }

  const length = Number(value);
  return Number.isFinite(length) && length > MAX_BODY_BYTES;
}

async function parseBody(request: Request): Promise<unknown> {
  if (exceedsDeclaredLimit(request)) {
    throw new PublicError(413, "payload_too_large");
  }

  const reader = request.body?.getReader();
  const chunks: Uint8Array[] = [];
  let byteLength = 0;
  if (reader) {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        byteLength += value.byteLength;
        if (byteLength > MAX_BODY_BYTES) {
          await reader.cancel();
          throw new PublicError(413, "payload_too_large");
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
  }

  const bytes = new Uint8Array(byteLength);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new PublicError(400, "invalid_json");
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new PublicError(400, "invalid_json");
  }
}

function normalizeClientIp(request: Request): string {
  const value = request.headers.get("cf-connecting-ip")?.trim().toLowerCase() ?? "";
  if (
    value.length === 0 ||
    value.length > 128 ||
    value.includes(",") ||
    /[\u0000-\u0020\u007f]/.test(value)
  ) {
    throw new PublicError(503, "storage_unavailable");
  }

  return value;
}

async function hashClientIp(clientIp: string): Promise<string> {
  try {
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(clientIp)
    );
    return `ip:${Array.from(new Uint8Array(digest), (byte) =>
      byte.toString(16).padStart(2, "0")
    ).join("")}`;
  } catch {
    throw new PublicError(503, "storage_unavailable");
  }
}

async function requireRateLimit(limiter: RateLimit, key: string): Promise<void> {
  let result: { success: boolean };
  try {
    result = await limiter.limit({ key });
  } catch {
    throw new PublicError(503, "storage_unavailable");
  }

  if (!result.success) {
    throw new PublicError(429, "rate_limited");
  }
}

async function handleReport(
  request: Request,
  env: DgsFeedbackEnv,
  dependencies: HandlerDependencies
): Promise<Response> {
  if (!isJsonContentType(request)) {
    throw new PublicError(415, "unsupported_media_type");
  }

  const payload = validateReport(await parseBody(request));
  if (!env.INSTALL_RATE_LIMITER?.limit || !env.IP_RATE_LIMITER?.limit) {
    throw new PublicError(503, "storage_unavailable");
  }

  const hashedIp = await hashClientIp(normalizeClientIp(request));
  await requireRateLimit(env.INSTALL_RATE_LIMITER, payload.anonymousInstallId);
  await requireRateLimit(env.IP_RATE_LIMITER, hashedIp);

  const result = await storeReport(
    payload,
    {
      owner: env.GITHUB_OWNER ?? "",
      repo: env.GITHUB_REPO ?? "",
      branch: env.GITHUB_BRANCH ?? "",
      token: env.GITHUB_REPORTS_TOKEN ?? ""
    },
    dependencies
  );

  return jsonResponse(201, { ok: true, reportId: result.reportId });
}

export function createHandler(
  dependencies: HandlerDependencies
): DgsFeedbackHandler {
  return {
    async fetch(request, env) {
      const url = new URL(request.url);

      if (url.pathname === "/health" && request.method === "GET") {
        return jsonResponse(200, {
          ok: true,
          service: "dgs-feedback",
          version: "v1"
        });
      }

      if (url.pathname !== "/v1/reports") {
        return jsonResponse(404, { ok: false, error: "not_found" });
      }

      if (request.method !== "POST") {
        return jsonResponse(
          405,
          { ok: false, error: "method_not_allowed" },
          { allow: "POST" }
        );
      }

      try {
        return await handleReport(request, env, dependencies);
      } catch (error) {
        if (error instanceof PublicError) {
          return errorResponse(error);
        }

        return jsonResponse(500, { ok: false, error: "internal_error" });
      }
    }
  };
}

const defaultDependencies: HandlerDependencies = {
  fetch: globalThis.fetch.bind(globalThis),
  now: () => new Date(),
  randomBytes: (length) => crypto.getRandomValues(new Uint8Array(length)),
  sleep: (milliseconds) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds)),
  logStorageFailure: (event) => console.error(JSON.stringify(event))
};

export default createHandler(defaultDependencies) satisfies ExportedHandler<DgsFeedbackEnv>;
