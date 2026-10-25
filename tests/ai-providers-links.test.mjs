import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';
import vm from 'node:vm';

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('Updated Providers articles contain no leftover legacy sections', async () => {
  const directory = new URL('../AI Providers/', import.meta.url);
  for (const entry of await readdir(directory, {recursive: true})) {
    if (!entry.endsWith('.html')) continue;
    const html = await read('AI Providers/' + entry.replaceAll('\\', '/'));
    assert.doesNotMatch(html, /using AiProviders\.Runtime|Minimal blocking request|When to prefer the coroutine path/, entry);
    if (html.includes('data-doc-content')) {
      assert.equal((html.match(/<article\b[^>]*\bdata-doc-content\b/g) || []).length, 1, entry);
      assert.equal((html.match(/<h1\b/g) || []).length, 1, entry);
      assert.equal((html.match(/<article\b/g) || []).length, (html.match(/<\/article>/g) || []).length, entry);
    }
  }
});

test('Providers registry supplies its product URLs without changing published versions', async () => {
  const config = JSON.parse(await read('assets/data/site-config.json'));
  const provider = config.products.aiProviders;
  assert.equal(provider.version, '1.0.0');
  assert.equal(provider.docsPath, 'AI Providers/index.html');
  assert.equal(provider.websiteUrl, 'https://bekaforge.com/');
  assert.equal(provider.supportUrl, 'https://bekaforge.com/AI%20Providers/support.html');
  assert.equal(provider.changelogUrl, 'https://bekaforge.com/AI%20Providers/changelog.html');
  assert.equal(config.products.dialogueGraphSystem.version, '4.0.0');
  assert.match(config.products.dialogueGraphSystem.status, /not published/);
});

test('Providers documentation matches 2.2 setup, credential storage and online links', async () => {
  const setup = await read('AI Providers/getting-started.html');
  const keys = await read('AI Providers/modules/settings-and-keys.html');
  const home = await read('AI Providers/index.html');
  const pipeline = await read('AI Providers/modules/request-pipeline.html');
  assert.match(setup, /Tools &gt; Beka Forge &gt; AI Providers &gt; Settings/);
  assert.match(setup, /2022\.3/);
  assert.match(setup, /BekaForge\.AIProviders\.Runtime/);
  assert.match(setup, /LlmPromptRequest\.CreateUserOnly/);
  assert.match(home, /2\.2\.0/);
  assert.match(home, /release candidate/i);
  assert.match(keys, /protected OS-backed/);
  assert.match(keys, /site-config\.json/);
  assert.doesNotMatch(keys, /Keys are stored in <code>PlayerPrefs<\/code>|not encrypted at rest|Secrets are not an encrypted vault/);
  assert.match(pipeline, /Retry-After/);
  assert.match(await read('AI Providers/support.html'), /support\.emailUrl/);
  assert.match(await read('AI Providers/changelog.html'), /2\.2\.0/);
  const legacy = await read('dgs-docs/ai-providers/index.html');
  assert.match(legacy, /BekaForgeConfigReady/);
  assert.match(legacy, /products\.aiProviders\.docsPath/);
});

test('Website resource loader applies the same new public links and rejects unsafe overrides', async () => {
  const config = JSON.parse(await read('assets/data/site-config.json'));
  const document = {
    currentScript: {src: 'https://bekaforge.com/assets/data/textresources.js'},
    readyState: 'complete', querySelectorAll: () => []
  };
  const window = {};
  const context = {window, document, URL, console, fetch: async () => ({ok: true, json: async () => config})};
  vm.runInNewContext(await read('assets/data/textresources.js'), context);
  await window.BekaForgeConfigReady;
  assert.equal(window.BekaForgeResources.products.aiProviders.websiteUrl, config.products.aiProviders.websiteUrl);
  assert.equal(window.BekaForgeResources.products.aiProviders.supportUrl, config.products.aiProviders.supportUrl);
  config.products.aiProviders.websiteUrl = 'javascript:alert(1)';
  const freshWindow = {};
  vm.runInNewContext(await read('assets/data/textresources.js'), {...context, window: freshWindow});
  await freshWindow.BekaForgeConfigReady;
  assert.equal(freshWindow.BekaForgeResources.products.aiProviders.websiteUrl, 'https://bekaforge.com/');
});
