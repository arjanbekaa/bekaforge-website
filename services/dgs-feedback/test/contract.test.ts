import test from "node:test";
import assert from "node:assert/strict";
import { validateReport } from "../src/contract.ts";
import { MAX_BODY_BYTES } from "../src/types.ts";
import { validReport } from "./fixtures/valid-report.ts";

test("contract accepts a complete schema-2 DGS payload", () => {
  const result = validateReport(validReport);

  assert.equal(result.schemaVersion, 2);
  assert.equal(result.source, "dgs-unity-editor");
  assert.notEqual(result, validReport);
});

test("contract rejects unsupported schemas and sources", () => {
  assert.throws(
    () => validateReport({ ...validReport, schemaVersion: 3 }),
    /invalid_schema/
  );
  assert.throws(
    () => validateReport({ ...validReport, source: "browser" }),
    /invalid_source/
  );
});

test("contract rejects unsupported top-level fields", () => {
  assert.throws(
    () => validateReport({ ...validReport, extra: true }),
    /unsupported_field/
  );
});

test("contract rejects wrong scalar, array, and diagnostic types", () => {
  assert.throws(
    () => validateReport({ ...validReport, featureName: 42 }),
    /invalid_field/
  );
  assert.throws(
    () => validateReport({ ...validReport, omittedSections: "none" }),
    /invalid_field/
  );
  assert.throws(
    () => validateReport({ ...validReport, diagnostic: [] }),
    /invalid_field/
  );
});

test("contract requires an anonymous installation identifier", () => {
  assert.throws(
    () => validateReport({ ...validReport, anonymousInstallId: "" }),
    /invalid_field/
  );
});

test("contract enforces field and array bounds", () => {
  assert.throws(
    () => validateReport({ ...validReport, sanitizedErrorMessage: "x".repeat(2001) }),
    /invalid_field/
  );
  assert.throws(
    () => validateReport({ ...validReport, omittedSections: Array(65).fill("section") }),
    /invalid_field/
  );
});

test("contract redacts nested diagnostic values before returning", () => {
  const result = validateReport({
    ...validReport,
    diagnostic: {
      originalUserPrompt: "private prompt",
      nested: { rawResponse: "private response", message: "apiKey=secret" }
    }
  });
  const json = JSON.stringify(result);

  assert.doesNotMatch(json, /private prompt|private response|apiKey=secret/);
  assert.match(json, /\[REDACTED_/);
});

test("body-size constant remains exactly 128 KiB", () => {
  assert.equal(MAX_BODY_BYTES, 128 * 1024);
});
