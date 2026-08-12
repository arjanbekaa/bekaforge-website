import test from "node:test";
import assert from "node:assert/strict";
import { redactValue } from "../src/redaction.ts";

test("redaction removes denied diagnostic content recursively", () => {
  const result = redactValue({
    nested: {
      originalUserPrompt: "private dialogue",
      systemPrompt: "secret system text",
      userPrompt: "private request",
      rawResponse: "provider response",
      safe: "Authorization: Bearer abc C:\\Users\\name\\Project developer@example.com"
    }
  });
  const json = JSON.stringify(result);

  assert.doesNotMatch(
    json,
    /private dialogue|secret system|private request|provider response|Bearer abc|developer@example.com|C:\\\\Users/
  );
  assert.match(json, /\[REDACTED_/);
});

test("redaction covers common credential and absolute-path forms", () => {
  const result = redactValue({
    github: "ghp_abcdefghijklmnopqrstuvwxyz1234567890",
    openAi: "sk-proj-abcdefghijklmnopqrstuvwxyz123456",
    assignment: "apiKey=private-value",
    unix: "/home/arjan/projects/private/file.json",
    mac: "/Users/arjan/project/file.json",
    safeUrl: "https://bekaforge.com/dgs-config/v1/config.json"
  });
  const json = JSON.stringify(result);

  assert.doesNotMatch(json, /ghp_|sk-proj|private-value|\/home\/arjan|\/Users\/arjan/);
  assert.match(json, /https:\/\/bekaforge\.com\/dgs-config\/v1\/config\.json/);
});

test("redaction preserves primitive types and recursively copies arrays", () => {
  const source = { values: [true, 42, null, "safe"] };
  const result = redactValue(source) as typeof source;

  assert.deepEqual(result, source);
  assert.notEqual(result, source);
  assert.notEqual(result.values, source.values);
});

