import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";

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

test("public config exposes the DGS 4.0 bundle and separate AI Providers without unsupported price claims", async () => {
  const config = JSON.parse(await read("assets/data/site-config.json"));

  assert.deepEqual(Object.keys(config).sort(), ["products", "publisher", "support"]);
  assert.equal(config.products.dialogueGraphSystem.version, "4.0.0");
  assert.equal(config.products.dialogueGraphSystem.price, "");
  assert.match(config.products.dialogueGraphSystem.status, /not published/i);
  assert.equal(config.products.dialogueGraphSystem.assetStoreUrl, "https://assetstore.unity.com/packages/tools/gui/dialogue-graph-system-332234");
  assert.equal(config.products.aiProviders.price, "");
  assert.equal(config.products.aiProviders.version, "1.0.0");
  assert.match(config.products.aiProviders.status, /Published 1\.0\.0.*unpublished 2\.2\.0.*DGS 4\.0 AI/i);
  assert.match(config.products.aiProviders.assetStoreUrl, /ai-providers-for-unity-beka-forge-384482$/);
  assert.equal(config.products.aiExtension.status, "Included in DGS 4.0.0");
  assert.equal(config.products.aiExtension.assetStoreUrl, "");
});

test("resource loader keeps defaults and fetches same-origin config", async () => {
  const source = await read("assets/data/textresources.js");

  assert.match(source, /site-config\.json/);
  assert.match(source, /BekaForgeConfigReady/);
  assert.match(source, /384482/);
  assert.match(source, /Included in DGS 4\.0\.0/);
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

  assert.match(home, /Build branching dialogue\s*<span>visually in Unity\./s);
  assert.match(home, /data-resource-src="products\.dialogueGraphSystem\.iconPath"/);
  assert.match(home, /\.hero-visual img\s*\{[^}]*object-fit:\s*contain/s);
  assert.match(home, /One complete DGS package/);
  assert.match(home, /release has not been published/i);
  assert.match(home, /AI Providers remains a separate package/i);
  assert.doesNotMatch(home, /products\.aiExtension\.(?:assetStoreUrl|docsPath)/);
  assert.match(docs, /Which documentation do you need/);
  assert.match(publicPages, /support\.reportIssueUrl/);
  assert.match(home, /products\.aiProviders\.assetStoreUrl/);
  assert.doesNotMatch(
    publicPages,
    /store link pending|public asset placeholders|own public folder/i
  );
  assert.doesNotMatch(docs, /modules\/command-workflows\.html/);
});

test("DGS public docs consistently describe the prepared 4.0 package", async () => {
  const files = await htmlFiles("Dialogue Graph System");
  const combined = (await Promise.all(files.map(read))).join("\n");
  const landing = await read("Dialogue Graph System/index.html");

  assert.doesNotMatch(combined, /Dialogue Graph System v2\.0\.0/);
  assert.match(landing, /version 4\.0\.0/i);
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
  assert.match(combined, /Core, Banter, Sound\/Walla, AI Extension, Camera Controller, and Interaction/);
  assert.match(combined, /AI Providers remains the only separate package/i);
  assert.match(combined, /AI Providers 2\.2\.0, which has not been published/i);
  assert.match(combined, /current public listing is 1\.0\.0 and does not meet that prerequisite/i);
  assert.match(combined, /release has not been published/i);
  assert.doesNotMatch(combined, /Dialogue Graph System 3\.0|\$24\.99|AI Extension is a separate product/i);
  assert.doesNotMatch(combined, /fed to the AI extension|shipped AI extension/i);
});

test("DGS setup matches the 4.0 package minimum, dependencies, and exported samples", async () => {
  const gettingStarted = await read("Dialogue Graph System/getting-started.html");
  const installation = await read("Dialogue Graph System/installation.html");
  const landing = await read("Dialogue Graph System/index.html");
  const actions = await read("Dialogue Graph System/guides/integrating-actions.html");
  const tutorial = await read("Dialogue Graph System/quick-tutorial.html");
  const graphEditor = await read("Dialogue Graph System/modules/graph-editor.html");
  const settings = await read("Dialogue Graph System/modules/settings-system.html");
  const importExport = await read("Dialogue Graph System/modules/import-export.html");
  const currentSetup = `${gettingStarted}\n${installation}\n${landing}\n${actions}`;

  assert.match(currentSetup, /Unity 6000\.3 or newer/i);
  assert.match(currentSetup, /Windows.*Unity 6000\.3\.6f1|Unity 6000\.3\.6f1.*Windows/i);
  assert.doesNotMatch(currentSetup, /Unity 2021\.3 LTS or newer|Unity 2022\.3/);
  assert.match(installation, /com\.unity\.ugui.*2\.0\.0/i);
  assert.match(installation, /com\.unity\.nuget\.newtonsoft-json.*3\.2\.2/i);
  assert.match(installation, /TMP Essential Resources are project content and are not included/i);
  assert.match(installation, /Do not add the separate.*com\.unity\.textmeshpro.*shim/i);
  assert.doesNotMatch(installation, /(?:declared|required|runtime\/editor) dependenc(?:y|ies)[^<]{0,140}com\.unity\.textmeshpro/i);
  assert.match(currentSetup, /Assets\/Beka Forge\/Dialogue Graph System\/Samples\/2DMarketDemo\/Scenes\/MarketDemo\.unity/);
  assert.doesNotMatch(currentSetup, /DemoScenes\/DialogueDemo\.unity|three sample graphs|Demo_ControlRoomActions/);
  assert.match(installation, /base Interaction Playground/);
  assert.match(installation, /optional typed Input System adapter/);
  assert.match(installation, /SimpleInteractionDemo.*not included/);
  assert.match(landing, /Bundled Dungeon Market sample/);
  assert.doesNotMatch(landing, /3 playable graphs|three playable graphs/i);
  const currentMenus = `${installation}\n${tutorial}\n${graphEditor}\n${settings}\n${importExport}\n${actions}`;
  assert.doesNotMatch(currentMenus, /Tools â†|Tools &gt; Dialogue Graph System/);
  assert.match(importExport, /Production.*Import \/ Export/);
});

test("AI Providers has one separate listing and the old AI Extension URL redirects into DGS", async () => {
  const providers = await read("AI Providers/index.html");
  const extension = await read("Dialogue Graph AI Extension/index.html");

  assert.match(providers, /Separate package/);
  assert.match(providers, /DGS 4\.0 requires the unpublished 2\.2\.0 update/i);
  assert.match(providers, /products\.aiProviders\.assetStoreUrl/);
  assert.match(providers, /ai-providers-for-unity-beka-forge-384482/);
  assert.doesNotMatch(providers, /Available Free|Get free on Asset Store/i);
  assert.match(extension, /url=\.\.\/Dialogue%20Graph%20System\/guides\/ai-generation-workflow\.html/);
  assert.match(extension, /rel="canonical"/);
  assert.match(extension, /noindex/);
});

test("current DGS captures back the guides and preserve earlier artwork files", async () => {
  const gallery = await read("Dialogue Graph System/4.0/screenshots/index.html");
  const manifest = JSON.parse(await read("Dialogue Graph System/4.0/screenshots/manifest.json"));
  const nav = await read("Dialogue Graph System/assets/app.js");
  const walla = await read("Dialogue Graph System/guides/walla-setup.html");
  const banter = await read("Dialogue Graph System/guides/banter-setup.html");
  assert.equal(manifest.screenshots.length, 51);
  assert.equal(new Set(manifest.screenshots.map(row => row.file)).size, 51);
  for (const capture of manifest.screenshots) {
    const bytes = await readFile(new URL(`../Dialogue Graph System/4.0/screenshots/${capture.file}`, import.meta.url));
    assert.match(capture.file, /^clean\/[a-z0-9-]+\.png$/);
    assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", `${capture.file} must remain an original PNG`);
    assert.equal(bytes.readUInt32BE(16), capture.width);
    assert.equal(bytes.readUInt32BE(20), capture.height);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), capture.sha256);
    assert.equal(bytes.length, capture.bytes);
    assert.match(gallery, new RegExp(`src="${capture.file}"`));
    assert.match(gallery, new RegExp(`width="${capture.width}" height="${capture.height}"`));
    assert.ok(capture.caption && capture.sourceFile && capture.importedUtc);
    assert.equal(capture.sourceSet, "user-supplied-clean");
    assert.equal(capture.captureTime, "Not supplied");
  }
  assert.equal(manifest.retainedScreenshots.length, 13);
  for (const capture of manifest.retainedScreenshots) {
    const bytes = await readFile(new URL(`../Dialogue Graph System/4.0/screenshots/${capture.file}`, import.meta.url));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), capture.sha256, "earlier captures must remain unchanged");
  }
  assert.ok(manifest.referenceOnlyScreenshots.some((capture) => capture.sourceFile === "UI-Theme-Settings.png" && capture.excludedFromPublicGallery.includes("InvalidCastException")));
  assert.doesNotMatch(gallery, /src="clean\/ui-theme-settings\.png"/);
  assert.match(nav, /guides\/banter-setup\.html/);
  assert.match(nav, /guides\/walla-setup\.html/);
  assert.match(nav, /4\.0\/screenshots\/index\.html/);
  assert.ok(walla.indexOf("Duration (frames)") < walla.indexOf("Add Cue"));
  assert.match(walla, /clean\/dgs-graph-walla\.png/);
  assert.match(banter, /banter-catalog\.jpg/);
  assert.match(banter, /Try your own exchange in the working sample/);
  assert.doesNotMatch(`${walla}\n${banter}`, /Screenshot slot/);
  for (const image of ["showcase-ai-assistant.png", "showcase-ai-localization.png", "showcase-ai-translation-preview.png"]) {
    await access(new URL(`../Dialogue Graph AI Extension/assets/images/${image}`, import.meta.url));
  }
});

test("legacy DGS documentation URLs continue to redirect to the 4.0 docs", async () => {
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

test("whole-site validator completes successfully", async () => {
  const { spawnSync } = await import("node:child_process");
  const result = spawnSync(process.execPath, ["scripts/validate-site.mjs"], {
    cwd: new URL("..", import.meta.url),
    encoding: "utf8"
  });

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /SITE_VALIDATION_OK/);
});

test("documentation tables wrap long code paths on mobile", async () => {
  for (const stylesheet of [
    "Dialogue Graph System/assets/styles.css",
    "AI Providers/assets/styles.css"
  ]) {
    const source = await read(stylesheet);
    assert.match(source, /table-layout:\s*fixed/);
    assert.match(source, /td code\s*\{[^}]*overflow-wrap:\s*anywhere/s);
    assert.match(source, /:not\(pre\)\s*>\s*code\s*\{[^}]*overflow-wrap:\s*anywhere/s);
  }
});
