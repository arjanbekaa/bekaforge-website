const DENIED_KEYS = new Set([
  "originaluserprompt",
  "systemprompt",
  "userprompt",
  "rawresponse"
]);

const REDACTIONS: ReadonlyArray<readonly [RegExp, string]> = [
  [/\bBearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [REDACTED_SECRET]"],
  [/\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g, "[REDACTED_SECRET]"],
  [/\bsk-[A-Za-z0-9_-]{8,}\b/g, "[REDACTED_SECRET]"],
  [
    /\b(api[_-]?key|access[_-]?token|auth[_-]?token|password|secret|token)\s*[:=]\s*["']?[^\s,"']+/gi,
    "$1=[REDACTED_SECRET]"
  ],
  [/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[REDACTED_EMAIL]"],
  [/[A-Za-z]:\\(?:Users|Documents and Settings)\\[^\r\n"']+/g, "[REDACTED_PATH]"],
  [/\/(?:Users|home|mnt|tmp|var)\/[^\s\r\n"'<>]+/g, "[REDACTED_PATH]"]
];

function redactString(value: string): string {
  return REDACTIONS.reduce(
    (result, [pattern, replacement]) => result.replace(pattern, replacement),
    value
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function redactValue(value: unknown): unknown {
  if (typeof value === "string") {
    return redactString(value);
  }

  if (Array.isArray(value)) {
    return value.map((entry) => redactValue(entry));
  }

  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([childKey]) => !DENIED_KEYS.has(childKey.toLowerCase()))
        .map(([childKey, childValue]) => [childKey, redactValue(childValue)])
    );
  }

  return value;
}
