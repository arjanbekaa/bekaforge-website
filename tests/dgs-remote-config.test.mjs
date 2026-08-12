import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const configUrl = new URL("../dgs-config/v1/config.json", import.meta.url);

test("DGS remote config activates the verified private feedback endpoint", async () => {
  const text = await readFile(configUrl, "utf8");
  const config = JSON.parse(text);
  const endpoint =
    "https://dgs-feedback-ingest.bekaforge-dgs-feedback.workers.dev/v1/reports";

  assert.equal(config.schemaVersion, 1);
  assert.equal(config.configVersion, "2026-08-12.2");
  assert.equal(config.ttlHours, 12);
  assert.ok(config.links && config.feedback && config.reviewPrompt);
  assert.equal(config.feedbackEnabled, true);
  assert.equal(config.feedback.enabled, true);
  assert.equal(config.feedbackEndpoint, endpoint);
  assert.equal(config.feedback.endpoint, endpoint);
  assert.equal(config.feedback.endpointVersion, "v1");
  assert.equal(config.feedback.showReportPreview, true);
  assert.equal(config.feedback.maxStackTraceLength, 6000);
  assert.match(config.links.documentation, /^https:\/\//);
  assert.match(config.links.support, /^(https:\/\/|mailto:)/);
  assert.doesNotMatch(
    text,
    /(github[_-]?token|cloudflare[_-]?api|bearer\s+|gh[pousr]_[A-Za-z0-9_]+)/i
  );
});

test("DGS remote config exposes only safe public URL schemes", async () => {
  const config = JSON.parse(await readFile(configUrl, "utf8"));
  const urls = [
    config.docsUrl,
    config.supportUrl,
    ...Object.values(config.links)
  ].filter(Boolean);

  for (const value of urls) {
    assert.match(value, /^(https:\/\/|mailto:)/, `${value} uses an unsafe scheme`);
  }
});
