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
