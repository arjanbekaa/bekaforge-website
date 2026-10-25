import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

test("every configured Inspector topic has both compatibility URLs and an existing destination", async () => {
  const config = JSON.parse(await read("assets/data/site-config.json"));
  for (const [topic, value] of Object.entries(config.documentation)) {
    const destination = new URL(value);
    const html = await read(decodeURIComponent(destination.pathname).slice(1));
    if (destination.hash) assert.ok(html.includes(`id="${destination.hash.slice(1)}"`), `${topic}: missing section`);
    for (const alias of [`${topic}.html`, `${topic}/index.html`]) {
      const redirect = await read(`dgs-docs/${alias}`);
      assert.ok(redirect.includes(`data-resource-href="documentation.${topic}"`));
      assert.ok(redirect.includes("BekaForgeConfigReady"));
      assert.ok(redirect.includes(value));
    }
  }
});

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

async function loadResources(config) {
  const source = await read("assets/data/textresources.js");
  const document = {
    currentScript: { src: "https://bekaforge.com/assets/data/textresources.js" },
    readyState: "complete",
    querySelectorAll() { return []; },
    addEventListener() {}
  };
  const sandbox = {
    URL,
    Set,
    Date,
    document,
    window: {},
    console: { info() {} },
    fetch: async () => ({ ok: true, json: async () => config })
  };
  vm.runInNewContext(source, sandbox, { filename: "textresources.js" });
  await sandbox.window.BekaForgeConfigReady;
  const resources = sandbox.window.BekaForgeResources;
  resources.applyTextResources = sandbox.window.applyBekaForgeTextResources;
  return resources;
}

test("DGS and included AI Extension expose canonical docs and HTTPS product URLs", async () => {
  const config = JSON.parse(await read("assets/data/site-config.json"));
  assert.deepEqual(Object.keys(config).sort(), ["documentation", "products", "publisher", "support"]);
  const expected = {
    dialogueGraphSystem: {
      docsPath: "Dialogue Graph System/index.html",
      websiteUrl: "https://bekaforge.com/Dialogue%20Graph%20System/index.html",
      supportUrl: "https://bekaforge.com/Dialogue%20Graph%20System/support.html",
      changelogUrl: "https://bekaforge.com/Dialogue%20Graph%20System/changelog.html"
    },
    aiProviders: {
      docsPath: "AI Providers/index.html",
      websiteUrl: "https://bekaforge.com/",
      supportUrl: "https://bekaforge.com/AI%20Providers/support.html",
      changelogUrl: "https://bekaforge.com/AI%20Providers/changelog.html"
    },
    aiExtension: {
      docsPath: "Dialogue Graph System/guides/ai-generation-workflow.html",
      websiteUrl: "https://bekaforge.com/Dialogue%20Graph%20System/guides/ai-generation-workflow.html",
      supportUrl: "https://bekaforge.com/Dialogue%20Graph%20System/support.html",
      changelogUrl: "https://bekaforge.com/Dialogue%20Graph%20System/changelog.html"
    }
  };

  for (const [product, fields] of Object.entries(expected)) {
    for (const [field, value] of Object.entries(fields)) {
      assert.equal(config.products[product][field], value, `${product}.${field}`);
    }
    for (const field of ["websiteUrl", "supportUrl", "changelogUrl"]) {
      assert.match(config.products[product][field], /^https:\/\//i, `${product}.${field} must use HTTPS`);
    }
  }

  const resources = await loadResources({});
  assert.equal(resources.paths.dgsScreenshot, "Dialogue Graph System/4.0/screenshots/clean/graph-far.png");
  assert.equal(resources.products.dialogueGraphSystem.screenshotPath, "Dialogue Graph System/4.0/screenshots/clean/graph-far.png");
  assert.equal(resources.products.dialogueGraphSystem.websiteUrl, expected.dialogueGraphSystem.websiteUrl);
  assert.equal(resources.products.aiExtension.supportUrl, expected.aiExtension.supportUrl);
});

test("documentation registry maps all audited Unity topics to HTTPS pages", async () => {
  const config = JSON.parse(await read("assets/data/site-config.json"));
  const expected = {
    "getting-started": "getting-started.html",
    "dialogue-runtime": "modules/runtime-dialog-flow.html",
    actions: "guides/integrating-actions.html",
    history: "modules/history-and-transcripts.html",
    localization: "inspector-reference.html#localization",
    "ui-themes": "modules/settings-system.html",
    variables: "inspector-reference.html#variable-definition",
    "dialogue-graphs": "modules/graph-editor.html",
    characters: "inspector-reference.html#asset-character",
    banter: "guides/banter-setup.html",
    audio: "inspector-reference.html#asset-voice-table",
    delivery: "inspector-reference.html#asset-delivery-preset",
    "scene-context": "inspector-reference.html#asset-scene-context",
    branding: "inspector-reference.html#asset-welcome-branding",
    "runtime-ui": "components/runtime-ui.html",
    settings: "modules/settings-system.html",
    "camera-controller": "guides/camera-interaction-ui.html",
    interaction: "guides/camera-interaction-ui.html",
    walla: "guides/walla-setup.html",
    "ai-extension": "guides/ai-generation-workflow.html",
    upgrade: "installation.html#upgrade"
  };
  assert.deepEqual(Object.keys(config.documentation).sort(), Object.keys(expected).sort());
  for (const [slug, path] of Object.entries(expected)) {
    assert.equal(
      config.documentation[slug],
      `https://bekaforge.com/Dialogue%20Graph%20System/${path}`,
      `documentation.${slug}`
    );
  }

  const defaults = await loadResources({});
  assert.deepEqual(Object.keys(defaults.documentation).sort(), Object.keys(expected).sort());
  assert.equal(defaults.documentation.localization, config.documentation.localization);
});

test("public product URL overrides accept HTTPS and reject unsafe schemes", async () => {
  const defaults = await loadResources({});
  const resources = await loadResources({
    products: {
      dialogueGraphSystem: {
        websiteUrl: "https://docs.example.test/dgs",
        supportUrl: "javascript:alert(1)",
        changelogUrl: "http://docs.example.test/changelog"
      }
    }
  });

  assert.equal(resources.products.dialogueGraphSystem.websiteUrl, "https://docs.example.test/dgs");
  assert.equal(resources.products.dialogueGraphSystem.supportUrl, defaults.products.dialogueGraphSystem.supportUrl);
  assert.equal(resources.products.dialogueGraphSystem.changelogUrl, defaults.products.dialogueGraphSystem.changelogUrl);
});

test("topic overrides are whitelist-only and relative bindings resolve from the site root", async () => {
  const resources = await loadResources({
    documentation: {
      "getting-started": "https://docs.example.test/quickstart",
      localization: "javascript:alert(1)",
      "unreviewed-topic": "https://docs.example.test/other"
    }
  });
  assert.equal(resources.documentation["getting-started"], "https://docs.example.test/quickstart");
  assert.equal(
    resources.documentation.localization,
    "https://bekaforge.com/Dialogue%20Graph%20System/inspector-reference.html#localization"
  );
  assert.equal(Object.hasOwn(resources.documentation, "unreviewed-topic"), false);

  const attrs = { "data-resource-href": "products.dialogueGraphSystem.docsPath" };
  const hrefElement = {
    getAttribute(name) { return attrs[name]; },
    setAttribute(name, value) { attrs[name] = value; },
    removeAttribute(name) { delete attrs[name]; }
  };
  resources.applyTextResources({
    querySelectorAll(selector) {
      return selector === "[data-resource-href]" ? [hrefElement] : [];
    }
  });
  assert.equal(attrs.href, "https://bekaforge.com/Dialogue%20Graph%20System/index.html");
});
