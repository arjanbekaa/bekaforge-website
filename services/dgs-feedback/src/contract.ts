import { redactValue } from "./redaction.ts";
import {
  MAX_BODY_BYTES,
  PublicError,
  type DgsFeedbackPayload
} from "./types.ts";

const STRING_LIMITS = {
  receivedAtUtc: 512,
  packageName: 512,
  packageVersion: 512,
  unityVersion: 512,
  os: 512,
  editorPlatform: 512,
  featureName: 160,
  failureStage: 512,
  providerName: 512,
  providerType: 512,
  activeGraphName: 160,
  activeGraphPath: 160,
  sanitizedErrorMessage: 2_000,
  sanitizedStackTrace: 20_000,
  sanitizedReportBody: 20_000,
  truncationReason: 512,
  configVersion: 512,
  feedbackEndpointVersion: 512,
  timestampUtc: 512,
  anonymousInstallId: 512,
  anonymousSessionId: 512
} as const;

const ALLOWED_FIELDS = new Set([
  "schemaVersion",
  "source",
  ...Object.keys(STRING_LIMITS),
  "diagnostic",
  "truncated",
  "omittedSections"
]);

const MAX_DIAGNOSTIC_DEPTH = 16;
const MAX_DIAGNOSTIC_NODES = 4_096;
const MAX_DIAGNOSTIC_COLLECTION_SIZE = 512;
const MAX_DIAGNOSTIC_KEY_LENGTH = 128;
const MAX_DIAGNOSTIC_STRING_LENGTH = 20_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function readString(
  source: Record<string, unknown>,
  field: keyof typeof STRING_LIMITS
): string {
  const value = source[field];
  if (typeof value !== "string" || value.length > STRING_LIMITS[field]) {
    throw new PublicError(400, "invalid_field");
  }

  return value;
}

function readOmittedSections(value: unknown): string[] {
  if (
    !Array.isArray(value) ||
    value.length > 64 ||
    value.some((entry) => typeof entry !== "string" || entry.length > 512)
  ) {
    throw new PublicError(400, "invalid_field");
  }

  return [...value];
}

function validateDiagnosticValue(
  value: unknown,
  depth: number,
  budget: { nodes: number }
): void {
  budget.nodes += 1;
  if (depth > MAX_DIAGNOSTIC_DEPTH || budget.nodes > MAX_DIAGNOSTIC_NODES) {
    throw new PublicError(400, "invalid_field");
  }

  if (value === null || typeof value === "boolean") {
    return;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new PublicError(400, "invalid_field");
    }
    return;
  }

  if (typeof value === "string") {
    if (value.length > MAX_DIAGNOSTIC_STRING_LENGTH) {
      throw new PublicError(400, "invalid_field");
    }
    return;
  }

  if (Array.isArray(value)) {
    if (value.length > MAX_DIAGNOSTIC_COLLECTION_SIZE) {
      throw new PublicError(400, "invalid_field");
    }
    for (const entry of value) {
      validateDiagnosticValue(entry, depth + 1, budget);
    }
    return;
  }

  if (!isRecord(value)) {
    throw new PublicError(400, "invalid_field");
  }

  const entries = Object.entries(value);
  if (
    entries.length > MAX_DIAGNOSTIC_COLLECTION_SIZE ||
    entries.some(([key]) => key.length > MAX_DIAGNOSTIC_KEY_LENGTH)
  ) {
    throw new PublicError(400, "invalid_field");
  }

  for (const [, childValue] of entries) {
    validateDiagnosticValue(childValue, depth + 1, budget);
  }
}

export function validateReport(value: unknown): DgsFeedbackPayload {
  if (!isRecord(value)) {
    throw new PublicError(400, "invalid_schema");
  }

  if (value.schemaVersion !== 2) {
    throw new PublicError(400, "invalid_schema");
  }

  if (value.source !== "dgs-unity-editor") {
    throw new PublicError(400, "invalid_source");
  }

  if (Object.keys(value).some((field) => !ALLOWED_FIELDS.has(field))) {
    throw new PublicError(400, "unsupported_field");
  }

  if (typeof value.truncated !== "boolean") {
    throw new PublicError(400, "invalid_field");
  }

  if (value.diagnostic !== null && !isRecord(value.diagnostic)) {
    throw new PublicError(400, "invalid_field");
  }
  validateDiagnosticValue(value.diagnostic, 0, { nodes: 0 });

  const stringValues = Object.fromEntries(
    (Object.keys(STRING_LIMITS) as Array<keyof typeof STRING_LIMITS>).map(
      (field) => [field, readString(value, field)]
    )
  ) as { [K in keyof typeof STRING_LIMITS]: string };

  if (stringValues.anonymousInstallId.trim().length === 0) {
    throw new PublicError(400, "invalid_field");
  }

  const payload: DgsFeedbackPayload = {
    schemaVersion: 2,
    source: "dgs-unity-editor",
    ...stringValues,
    diagnostic: value.diagnostic,
    truncated: value.truncated,
    omittedSections: readOmittedSections(value.omittedSections)
  };

  const sanitized = redactValue(payload) as DgsFeedbackPayload;
  if (new TextEncoder().encode(JSON.stringify(sanitized)).byteLength > MAX_BODY_BYTES) {
    throw new PublicError(413, "payload_too_large");
  }

  return sanitized;
}
