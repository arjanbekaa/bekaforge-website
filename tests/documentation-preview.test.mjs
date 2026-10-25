import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { componentCatalog, nodeKinds, inspectorSurfaceIds, resolveComponent } from "../assets/unity-preview/components/registry.js";
import { enhanceLivePreviews } from "../assets/documentation/live-previews.js";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("focused component routes match the node and inspector catalogs exactly", async () => {
  const { demo } = await import("../assets/unity-preview/state.js");
  const { entries } = await import("../assets/unity-preview/surfaces/inspectors.js");
  assert.deepEqual(nodeKinds.slice().sort(), demo.nodes.map((node) => node.kind).sort());
  assert.deepEqual(inspectorSurfaceIds.slice().sort(), entries.map((entry) => entry.id).sort());
  assert.equal(new Set(componentCatalog).size, nodeKinds.length + inspectorSurfaceIds.length);
  for (const route of componentCatalog) assert.equal(resolveComponent(route).available, true, route);
  for (const route of ["node:Dialog:extra", "node:None", "inspector:missing", "node:../../state.js", "", "Dialog"]) {
    assert.equal(resolveComponent(route).available, false, route);
  }
  const shared = await import("../assets/unity-preview/components/node.js");
  const surfaces = await import("../assets/unity-preview/surfaces/nodes.js");
  assert.equal(shared.renderNodeVisual, surfaces.renderNodeVisual, "full views and focused embeds must use the same renderer");
  assert.doesNotMatch(await read("assets/unity-preview/components/node.js"), /from\s+["'][^"']*surfaces\//, "components must not depend on their full-window consumer");
});

test("every node and inspector reference has matching deferred examples, steps and outcomes", async () => {
  for (const [file, prefix, ids] of [["node-reference.html", "node", nodeKinds], ["inspector-reference.html", "inspector", inspectorSurfaceIds]]) {
    const html = await read(`Dialogue Graph System/${file}`);
    const sections = [...html.matchAll(/<section\b[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g)];
    assert.ok(sections.length >= ids.length, `${file}: missing reference sections`);
    for (const id of ids) {
      const component = `${prefix}:${id}`;
      const section = sections.find(([, , body]) => [...body.matchAll(/data-preview-src="([^"]+)"/g)].some(([, source]) => new URL(source.replaceAll("&amp;", "&"), "https://docs.test/Dialogue%20Graph%20System/").searchParams.get("component") === component));
      assert.ok(section, `${file}: no live example for ${component}`);
      assert.match(section[2], /<ol\b/, `${component}: needs numbered setup steps`);
      assert.match(section[2], /class="try-it"/, `${component}: needs a concrete sandbox exercise`);
      assert.match(section[2], /class="expected-result"/, `${component}: needs an expected outcome`);
      assert.match(section[2], /<iframe[^>]*title="[^"]+"[^>]*hidden/, `${component}: iframe needs a title and must load on request`);
      assert.doesNotMatch(section[2], /<h[23]>boundary<\//, `${component}: use its real name`);
    }
  }
});

async function htmlFiles(folder) {
  const entries = await readdir(new URL(`../${folder}/`, import.meta.url), { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => entry.isDirectory() ? htmlFiles(`${folder}/${entry.name}`) : entry.name.endsWith(".html") ? [`${folder}/${entry.name}`] : []));
  return nested.flat();
}

test("documentation component links resolve to supported routes with working fallback links", async () => {
  const files = [...await htmlFiles("Dialogue Graph System"), ...await htmlFiles("AI Providers")];
  let examples = 0;
  for (const file of files) {
    const html = await read(file);
    for (const [, figure] of html.matchAll(/<figure\b[^>]*class="preview-embed"[^>]*>([\s\S]*?)<\/figure>/g)) {
      const source = figure.match(/(?:data-preview-src|src)="([^"]+)"/)?.[1];
      if (!source) continue;
      const url = new URL(source.replaceAll("&amp;", "&"), `https://docs.test/${file}`);
      const component = url.searchParams.get("component");
      if (!component) continue;
      examples++;
      assert.equal(resolveComponent(component).available, true, `${file}: ${component}`);
      assert.match(figure, /<a\s[^>]*href="[^"]+"/, `${file}: needs a standalone link when scripts are unavailable`);
    }
  }
  assert.ok(examples >= componentCatalog.length, "every component needs an accessible documentation entry");
});

test("live examples load on request, reset independently and unload on close", () => {
  class Element {
    constructor() { this.dataset = {}; this.attributes = {}; this.children = []; this.listeners = {}; this.style = {}; this.hidden = false; this.loads = 0; }
    setAttribute(key, value) { this.attributes[key] = String(value); }
    getAttribute(key) { return this.attributes[key] ?? null; }
    removeAttribute(key) { delete this.attributes[key]; }
    append(...nodes) { this.children.push(...nodes); }
    prepend(node) { this.children.unshift(node); }
    addEventListener(type, handler) { this.listeners[type] = handler; }
    set src(value) { this.attributes.src = value; this.loads++; }
  }
  const figures = [1, 2].map((index) => {
    const frame = new Element();
    frame.title = `Dialog example ${index}`;
    frame.dataset.previewSrc = `../assets/unity-preview/embed.html?component=node:Dialog&embed=1`;
    frame.contentDocument = { querySelector() { return { scrollHeight: 300 }; } };
    const figure = new Element();
    figure.querySelector = () => frame;
    return { figure, frame };
  });
  const oldDocument = globalThis.document;
  const oldMutationObserver = globalThis.MutationObserver;
  const observers = [];
  globalThis.MutationObserver = class {
    constructor(callback) { this.callback = callback; observers.push(this); }
    observe() {}
    disconnect() { this.disconnected = true; }
  };
  figures.forEach(({ frame }) => { frame.contentDocument.body = {}; });
  const head = new Element();
  globalThis.document = { head, querySelector() { return head.children[0]; }, createElement() { return new Element(); } };
  try {
    const root = { querySelectorAll() { return figures.map(({ figure }) => figure); } };
    enhanceLivePreviews(root);
    enhanceLivePreviews(root);
    assert.equal(head.children.length, 1);
    const { figure, frame } = figures[0];
    const [toggle, reset] = figure.children[0].children;
    assert.equal(figure.children.length, 1, "enhancement is idempotent");
    assert.equal(frame.hidden, true);
    assert.equal(frame.loads, 0);
    toggle.listeners.click();
    frame.listeners.load();
    assert.equal(frame.hidden, false);
    assert.equal(frame.loads, 1);
    assert.equal(frame.style.height, "308px");
    frame.contentDocument.querySelector = () => ({ scrollHeight: 420 });
    observers[0].callback();
    assert.equal(frame.style.height, "428px", "later component rendering and replacements resize the frame");
    reset.listeners.click();
    frame.listeners.load();
    assert.equal(frame.loads, 2);
    assert.equal(figures[1].frame.loads, 0, "reset must not touch another example");
    toggle.listeners.click();
    assert.equal(frame.hidden, true);
    assert.equal(frame.getAttribute("src"), null, "closed examples must release their live document");
    assert.equal(toggle.getAttribute("aria-expanded"), "false");
    assert.ok(observers.every((observer) => observer.disconnected), "reset and close release document observers");
  } finally { globalThis.document = oldDocument; globalThis.MutationObserver = oldMutationObserver; }
});
