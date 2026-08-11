import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

export async function htmlFiles(directory) {
  const root = new URL(`../${directory}/`, import.meta.url);
  const results = [];

  async function walk(url, prefix) {
    for (const entry of await readdir(url, { withFileTypes: true })) {
      const relative = `${prefix}${entry.name}`;
      if (entry.isDirectory()) {
        await walk(new URL(`${entry.name}/`, url), `${relative}/`);
      } else if (entry.name.endsWith(".html")) {
        results.push(`${directory}/${relative}`);
      }
    }
  }

  await walk(root, "");
  return results;
}

test("public config exposes only approved public sections", async () => {
  const config = JSON.parse(await read("assets/data/site-config.json"));

  assert.deepEqual(Object.keys(config).sort(), ["products", "publisher", "support"]);
  assert.equal(config.products.dialogueGraphSystem.version, "3.0.0");
  assert.equal(config.products.aiProviders.price, "Free");
  assert.equal(config.products.aiExtension.status, "Coming Soon");
  assert.equal(config.products.aiExtension.assetStoreUrl, "");
});

test("resource loader keeps defaults and fetches same-origin config", async () => {
  const source = await read("assets/data/textresources.js");

  assert.match(source, /site-config\.json/);
  assert.match(source, /BekaForgeConfigReady/);
  assert.match(source, /384482/);
  assert.match(source, /Coming Soon/);
  assert.doesNotMatch(source, /store link pending/i);
});

test("public reports use GitHub Issue Forms without a token", async () => {
  const config = JSON.parse(await read("assets/data/site-config.json"));
  const form = await read(".github/ISSUE_TEMPLATE/website-report.yml");
  const featureForm = await read(".github/ISSUE_TEMPLATE/feature-request.yml");
  const chooser = await read(".github/ISSUE_TEMPLATE/config.yml");

  assert.equal(
    config.support.reportIssueUrl,
    "https://github.com/arjanbekaa/bekaforge-website/issues/new/choose"
  );
  assert.match(form, /^name: Website or documentation report/m);
  assert.match(form, /required: true/);
  assert.match(form, /This report will be public/);
  assert.match(featureForm, /^name: Feature request/m);
  assert.match(chooser, /blank_issues_enabled: true/);

  const publicFiles = [
    JSON.stringify(config),
    form,
    featureForm,
    chooser
  ].join("\n");
  assert.doesNotMatch(
    publicFiles,
    /(github[_-]?token|api[_-]?key|password|webhook[_-]?secret)\s*:/i
  );
});

test("root pages present the approved release matrix", async () => {
  const home = await read("index.html");
  const docs = await read("docs.html");
  const roadmap = await read("roadmap.html");
  const publicPages = `${home}\n${docs}\n${roadmap}`;

  assert.match(home, /Build branching dialogue visually in Unity/);
  assert.match(home, /Available Free/);
  assert.match(home, /Coming Soon/);
  assert.match(docs, /Which documentation do you need/);
  assert.match(publicPages, /support\.reportIssueUrl/);
  assert.match(home, /products\.aiProviders\.assetStoreUrl/);
  assert.doesNotMatch(
    publicPages,
    /store link pending|public asset placeholders|own public folder/i
  );
  assert.doesNotMatch(docs, /modules\/command-workflows\.html/);
});

test("DGS public docs are consistently version 3.0.0", async () => {
  const files = await htmlFiles("Dialogue Graph System");
  const combined = (await Promise.all(files.map(read))).join("\n");
  const landing = await read("Dialogue Graph System/index.html");

  assert.doesNotMatch(combined, /Dialogue Graph System v2\.0\.0/);
  assert.match(landing, /version 3\.0\.0/i);
  assert.match(landing, /changelog\.html/);
  assert.match(landing, /license\.html/);
  assert.match(landing, /support\.html/);

  for (const page of ["changelog.html", "license.html", "support.html"]) {
    assert.ok(
      files.includes(`Dialogue Graph System/${page}`),
      `${page} should exist in the DGS docs`
    );
  }

  assert.doesNotMatch(
    combined,
    /Dialogue Graph AI Extension\/modules\/command-workflows/
  );
  assert.doesNotMatch(combined, /fed to the AI extension|shipped AI extension/i);
});

test("Providers is available free and AI Extension is teaser-only", async () => {
  const providers = await read("AI Providers/index.html");
  const extension = await read("Dialogue Graph AI Extension/index.html");

  assert.match(providers, /Available Free/);
  assert.match(providers, /products\.aiProviders\.assetStoreUrl/);
  assert.match(providers, /package\/384482/);
  assert.match(extension, /Coming Soon/);
  assert.doesNotMatch(
    extension,
    /(getting-started|architecture|modules\/|api\/public-api)\.html/
  );
  assert.doesNotMatch(extension, /production.ready|install|purchase|price/i);
});

test("legacy DGS documentation URLs redirect to the 3.0 documentation", async () => {
  const legacyPages = [
    "dgs-docs/index.html",
    "dgs-docs/installation.html",
    "dgs-docs/quick-tutorial.html",
    "dgs-docs/troubleshooting.html",
    "dgs-docs/changelog.html",
    "dgs-docs/license.html",
    "dgs-docs/support.html"
  ];

  for (const page of legacyPages) {
    const source = await read(page);
    assert.match(source, /http-equiv="refresh"/i, `${page} needs a redirect`);
    assert.match(source, /rel="canonical"/i, `${page} needs a canonical URL`);
    assert.match(source, /Dialogue Graph System/);
  }
});
