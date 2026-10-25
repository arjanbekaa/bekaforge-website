import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const exists = async (path) => {
  try {
    await access(new URL(`../${path}`, import.meta.url));
    return true;
  } catch {
    return false;
  }
};

const coverage = JSON.parse(await read("assets/unity-preview/data/coverage.json"));
const surfaceIds = coverage.windows.map((window) => window.id);

test("coverage ledger records windows, modules, stylesheets, and pinned sources", async () => {
  assert.equal(coverage.schema, 1);
  assert.equal(coverage.source.project, "DialogueGraphSystem");
  assert.match(coverage.source.commit, /^[0-9a-f]{8}$/);
  assert.equal(coverage.evidenceSummary.nativeCaptures, "NOT OBSERVED");
  assert.deepEqual(
    surfaceIds.slice().sort(),
    ["ai-providers", "banter", "dgs", "dgs-ai", "dgs-dialogs", "inspectors", "sound", "themes"]
  );
  assert.ok(coverage.sourceFiles.length >= 40, "expected the audited source list");

  for (const window of coverage.windows) {
    assert.ok(await exists(window.module), `missing module for window '${window.id}'`);
    assert.ok(window.stylesheets.length >= 1, `window '${window.id}' records no stylesheet`);
    for (const stylesheet of window.stylesheets) {
      assert.ok(await exists(stylesheet), `missing stylesheet '${stylesheet}' for window '${window.id}'`);
    }
  }

  for (const source of coverage.sourceFiles) {
    assert.match(source.sha256, /^[0-9a-f]{64}$/, `bad hash for ${source.path}`);
    assert.ok(source.usedBy.length >= 1, `source ${source.path} is not referenced by any window`);
    assert.ok(source.usedBy.every((id) => surfaceIds.includes(id)), `source ${source.path} references an unknown window`);
  }
});

test("preview app registry matches the coverage ledger and loads real modules", async () => {
  const app = await read("assets/unity-preview/app.js");
  for (const window of coverage.windows) {
    assert.match(app, new RegExp(`"${window.id}"|\\b${window.id}:\\s*\\{`), `app.js does not register window '${window.id}'`);
  }

  for (const window of coverage.windows) {
    const module = await import(new URL(`../${window.module}`, import.meta.url));
    assert.ok(Array.isArray(module.entries) && module.entries.length > 0, `window '${window.id}' exposes no entries`);
    const ids = module.entries.map((entry) => entry.id);
    assert.equal(new Set(ids).size, ids.length, `window '${window.id}' has duplicate entry ids`);
    assert.equal(typeof module.render, "function", `window '${window.id}' does not export render()`);
    assert.equal(typeof module.note, "string", `window '${window.id}' does not export an evidence note`);
  }
});

test("entry pages and embed shell load the preview assets", async () => {
  const pages = [
    "Dialogue Graph System/preview/index.html",
    "AI Providers/preview/index.html",
    "assets/unity-preview/embed.html"
  ];
  for (const page of pages) {
    const html = await read(page);
    assert.match(html, /unity-preview\/app\.js|src="app\.js"/, `${page} does not load app.js`);
    assert.match(html, /preview\.css/, `${page} does not load preview.css`);
    assert.match(html, /banter\.css/, `${page} does not load banter.css`);
    assert.match(html, /sound\.css/, `${page} does not load sound.css`);
    assert.match(html, /themes\.css/, `${page} does not load themes.css`);
    assert.match(html, /ai-panel\.css/, `${page} does not load ai-panel.css`);
  }
  assert.match(await read("Dialogue Graph System/preview/index.html"), /assets\/unity-preview\/dgs\.css/);
  assert.match(await read("AI Providers/preview/index.html"), /data-window="ai-providers"/);
  assert.match(await read("assets/unity-preview/embed.html"), /data-embed="1"/);
});

test("verbatim strings from the pinned source are present in the surfaces", async () => {
  const expected = {
    "assets/unity-preview/surfaces/dgs.js": [
      "Dialogue Graph System",
      "The graph canvas is a fixed example",
      "Please enter a valid graph name."
    ],
    "assets/unity-preview/surfaces/nodes.js": [
      "Format Layout",
      "Layout is fixed in this preview"
    ],
    "assets/unity-preview/surfaces/banter.js": [
      "Banter Getting Started",
      "Banter Catalog Validation",
      "banter-decision-trace v1"
    ],
    "assets/unity-preview/surfaces/sound.js": [
      "Create Play Mode rig",
      "Demo only: this preview does not inspect open scenes. In Unity, open a scene first.",
      "sound-sequence-window",
      "Detach this graph's sound editor into its own window. The graph panel folds.",
      "Return to graph",
      "Detached from"
    ],
    "assets/unity-preview/surfaces/themes.js": [
      "One bottom card holding speaker, text and choices together.",
      "No DGS UI theme catalog exists yet."
    ],
    "assets/unity-preview/surfaces/inspectors.js": [
      "Beka Forge · Dialogue Graph System",
      "Runtime variables can be injected with {variableKey}, for example {playerName}. Missing variables keep the token visible.",
      "Beka Forge · Camera Controller",
      "Live Operation State",
      "Interaction System · Interactable",
      "Interaction System · Interactor",
      "Assign action…",
      "No compatible action components",
      "Reach origin is missing. Assign the Transform used to measure interaction distance.",
      "No active input adapter"
    ],
    "assets/unity-preview/surfaces/ai-panel.js": [
      "AI Assistant",
      "Hide AI Assistant",
      "AI Extension 2.1 is included with DGS 4.0. AI authoring requires AI Providers 2.2, supplied separately.",
      "What would you like to create?",
      "Enter for a new line  ·  Ctrl/Cmd+Enter to run",
      "Ready — test passed",
      "No runs yet.",
      "Rewrite the current prompt into a clearer AI-ready graph authoring request.",
      "AI Draft - Dialog Nodes",
      "Nodes were added but the graph has issues. Review below.",
      "AI Translation Preview - French (example)",
      "Selected rows will be committed together from the footer.",
      "AI Batch Rewrite Preview",
      "Review 2 proposed rewrite(s). Toggle rows on/off, edit text inline, then press Apply Selected.",
      "Review Generated Dialog Flow",
      "No linear nodes. The choice will attach directly to the anchor.",
      "Review Banter · Warden",
      "This review is no longer attached to a Character. Close it and reopen Banter review.",
      "Hosted surface: CharacterFillSectionSurfaceElement",
      "No current proposal.",
      "Review AI Graph Plan",
      "There is no AI plan to preview.",
      "The AI response required JSON recovery. Review the plan carefully before applying.",
      "Strict mode. Any blocked operations prevent all mutation.",
      "Apply valid operations only",
      "AI activity",
      "2 represented activities",
      "1 running · 1 needs attention",
      "Expand AI activity",
      "Collapse AI activity",
      "Expand activity details",
      "Collapse activity details",
      "AI - Validating...",
      "AI - Preview ready",
      "Review the generated preview before applying.",
      "A generated preview is ready for review.",
      "Beka Forge AI",
      "Restoring graph interaction",
      "The operation finished, but graph interaction could not be restored. Retry restoration before continuing.",
      "Retry restoration",
      "Decision required"
    ],
    "assets/unity-preview/surfaces/dgs-dialogs.js": [
      "WELCOME",
      "Bundled copy — Online request unavailable",
      "Create Scene Context",
      "Bundle environment, characters and intent.",
      "Graph Validation",
      "No visible issues",
      "Review Rewrite",
      "Choose how to save the current graph.",
      "Apply accepted",
      "Legacy CSV carries no completion evidence. Complete/Review statuses remain unverified until re-confirmed.",
      "Add Target Languages",
      "Select one or more languages to add as translation columns. Source language remains the master.",
      "AI Extension 2.1 — Included Module. Core manual localization remains fully available.",
      "Localization Export / Import",
      "Import Reviewed Rows",
      "Choose model",
      "No matching models. Try another search."
    ],
    "assets/unity-preview/surfaces/ai-providers.js": [
      "Configuration is copied into a new asset. Credentials, account state, and connection-test history are not copied.",
      "Duplicate profile"
    ]
  };

  for (const [path, strings] of Object.entries(expected)) {
    const source = await read(path);
    for (const text of strings) {
      assert.ok(source.includes(text), `${path} is missing verbatim string: ${text}`);
    }
  }
});

test("every window renders every surface without touching a real backend", async () => {
  installMicroDom();

  const { demo, resetDemo } = await import(new URL("../assets/unity-preview/state.js", import.meta.url));
  const forbidden = /fetch\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage|document\.cookie/;

  for (const window of coverage.windows) {
    const module = await import(new URL(`../${window.module}`, import.meta.url));
    const moduleSource = await read(window.module);
    assert.doesNotMatch(moduleSource, forbidden, `window '${window.id}' may not call a network or storage API`);

    const rendered = [];
    for (const entry of module.entries) {
      resetDemo();
      const host = document.createElement("div");
      await module.render(host, { surface: entry.id, embed: true, state: demo, rerender: () => {} });
      assert.ok(host.children.length > 0, `window '${window.id}' surface '${entry.id}' rendered nothing`);
      rendered.push(host.children.length);
    }

    resetDemo();
    const host = document.createElement("div");
    await module.render(host, { surface: "", embed: true, state: demo, rerender: () => {} });
    assert.ok(host.children.length > 0, `window '${window.id}' default surface rendered nothing`);
  }
});

test("dialog preview controls respond without network or storage access", async () => {
  installMicroDom();
  const { demo, resetDemo } = await import(new URL("../assets/unity-preview/state.js", import.meta.url));
  const module = await import(new URL("../assets/unity-preview/surfaces/dgs-dialogs.js", import.meta.url));

  for (const entry of module.entries) {
    resetDemo();
    const host = document.createElement("div");
    await module.render(host, { surface: entry.id, embed: true, state: demo, rerender: () => {} });
    walk(host, (node) => {
      for (const handler of node.listeners.click || []) handler({ target: node });
      for (const handler of node.listeners.change || []) handler({ target: { checked: true, value: node.value || "test" } });
      for (const handler of node.listeners.input || []) handler({ target: { value: "zz" } });
    });
    assert.ok(host.children.length > 0, `dialog surface '${entry.id}' stopped rendering after its controls ran`);
  }
});

function walk(node, visit) {
  if (!node || typeof node !== "object") return;
  visit(node);
  for (const child of node.children || []) walk(child, visit);
}

test("node gallery state covers the audited NodeKind list without the None sentinel", async () => {
  const { demo } = await import(new URL("../assets/unity-preview/state.js", import.meta.url));
  const kinds = demo.nodes.map((node) => node.kind);
  assert.equal(kinds.length, 20, "expected the 20 creatable NodeKind values");
  assert.equal(new Set(kinds).size, 20, "node kinds must be unique");
  assert.ok(!kinds.includes("None"), "None is an enum sentinel and is not a creatable node");
  for (const required of ["Start", "End", "Dialog", "Choice", "Action", "Condition", "VariableMutation", "GraphJump", "Outcome", "RandomBranch", "Switch", "Wait", "WaitFor"]) {
    assert.ok(kinds.includes(required), `missing node kind ${required}`);
  }
});

test("surface routing keeps tab and inspector URLs reload-safe", async () => {
  const { surfaceForMainTab, withSurface } = await import(new URL("../assets/unity-preview/surface-route.js", import.meta.url));

  assert.equal(surfaceForMainTab("graphs"), "graph-editor");
  assert.equal(surfaceForMainTab("health"), "project-health");
  assert.equal(surfaceForMainTab("settings", "audio"), "settings-audio");
  assert.equal(surfaceForMainTab("settings", "missing"), "settings-text");

  const next = new URL(withSurface("http://example.test/preview/index.html?window=dgs&surface=settings-text&embed=1", "graph-editor"));
  assert.equal(next.searchParams.get("window"), "dgs");
  assert.equal(next.searchParams.get("surface"), "graph-editor");
  assert.equal(next.searchParams.get("embed"), "1");

  const cleared = new URL(withSurface(next.href, ""));
  assert.equal(cleared.searchParams.get("surface"), null);
});

test("node previews expose the authored Wait For and camera fields", async () => {
  const { nodePreviewRows } = await import(new URL("../assets/unity-preview/surfaces/nodes.js", import.meta.url));

  const waitFor = nodePreviewRows({ kind: "WaitFor" }).map((row) => row.label);
  assert.ok(waitFor.includes("Wait for"));
  assert.ok(waitFor.includes("Variable"));
  assert.ok(waitFor.includes("Operator"));
  assert.ok(!waitFor.includes("Wait duration"), "Wait For must not use the invented duration field");

  const cameraMove = nodePreviewRows({ kind: "CameraMove" }).map((row) => row.label);
  assert.deepEqual(cameraMove, ["Target ID", "Look-at Target ID", "Duration", "Ease", "Wait for completion"]);

  const followTarget = nodePreviewRows({ kind: "CameraFollowTarget" }).map((row) => row.label);
  assert.deepEqual(followTarget, ["Target ID", "Smoothing", "Local Offset", "Also Look At"]);
});

test("node gallery render never invokes handlers during render", async () => {
  installMicroDom();
  const { demo, resetDemo } = await import(new URL("../assets/unity-preview/state.js", import.meta.url));
  const { renderNodeGallery } = await import(new URL("../assets/unity-preview/surfaces/nodes.js", import.meta.url));
  resetDemo();

  let rerenders = 0;
  const host = document.createElement("div");
  host.append(renderNodeGallery({ state: demo, rerender: () => { rerenders += 1; } }));

  assert.equal(rerenders, 0, "rendering the gallery must not call rerender/click handlers eagerly");
  assert.ok(host.children.length > 0, "gallery should render content");
});

test("every focused component renders alone without invoking mutation handlers", async () => {
  installMicroDom();
  const { demo, resetDemo } = await import(new URL("../assets/unity-preview/state.js", import.meta.url));
  const { componentCatalog } = await import(new URL("../assets/unity-preview/components/registry.js", import.meta.url));
  for (const component of componentCatalog) {
    resetDemo();
    const [kind, id] = component.split(":");
    const module = await import(new URL(`../assets/unity-preview/components/${kind}.js`, import.meta.url));
    const host = document.createElement("div");
    let rerenders = 0;
    const rendered = await module.render(host, id, { state: demo, rerender() { rerenders++; } });
    assert.equal(rendered, true, component);
    assert.ok(host.children.length > 0, `${component}: blank component`);
    assert.equal(rerenders, 0, `${component}: render invoked a mutation handler`);
  }
});

test("provider tutorial templates create source-specific defaults and initialized form controls", async () => {
  installMicroDom();
  document.body = document.createElement("body");
  document.addEventListener = () => {};
  Node.prototype.remove = function () {};
  const { demo, resetDemo } = await import("../assets/unity-preview/state.js");
  const providers = await import("../assets/unity-preview/surfaces/ai-providers.js");
  const expected = [
    ["OpenAI", "https://api.openai.com", "/v1/chat/completions", "gpt-4.1-mini"],
    ["OpenAI Compatible", "", "/v1/chat/completions", ""],
    ["DeepSeek", "https://api.deepseek.com", "/chat/completions", "deepseek-chat"],
    ["Gemini", "https://generativelanguage.googleapis.com", undefined, "gemini-2.5-flash"],
    ["Ollama", "http://localhost:11434", "/api/chat", "gpt-oss:20b"],
    ["Custom JSON", "", "/v1/chat", ""],
    ["Codex", undefined, undefined, undefined],
    ["Claude Code", undefined, undefined, undefined]
  ];
  const find = (root, predicate) => { let found; walk(root, (node) => { if (!found && predicate(node)) found = node; }); return found; };
  const click = (button) => { assert.ok(button); for (const handler of button.listeners.click || []) handler({ currentTarget: button, target: button }); };
  for (const [label, baseUrl, endpoint, model] of expected) {
    resetDemo();
    document.body.replaceChildren();
    const host = document.createElement("div");
    const ctx = { state: demo, surface: "profiles", rerender() {} };
    await providers.render(host, ctx);
    click(find(host, (node) => node.tagName === "button" && node.textContent.includes("Add profile")));
    const choice = find(document.body, (node) => node.tagName === "button" && node.children.some((child) => child.textContent === label));
    const available = [];
    walk(document.body, (node) => { if (node.tagName === "strong") available.push(node.textContent); });
    assert.ok(choice, `${label}: available templates ${available.join(", ")}`);
    click(choice);
    const profile = demo.aiProviders.profiles.find((item) => item.id === demo.aiProviders.selectedProfile);
    assert.deepEqual([profile.baseUrl, profile.endpoint, profile.model], [baseUrl, endpoint, model], label);
    assert.equal(profile.apiKey, "", "tutorial examples start without credentials");
    assert.equal(profile.status, "NeedsTest");
    host.replaceChildren();
    await providers.render(host, ctx);
    if (label === "Gemini") assert.equal(find(host, (node) => node.tagName === "label" && node.children.some((child) => child.textContent === "Endpoint")), undefined);
    if (label === "Custom JSON") {
      const body = find(host, (node) => node.tagName === "textarea" && node.children.some((child) => child.textContent.includes("{MESSAGES_JSON}")));
      assert.ok(body, "Custom Body Template must initialize textarea content, not its ignored value attribute");
      assert.equal(profile.customFields.httpMethod, "POST");
      assert.equal(profile.customFields.responseTextPath, "");
    }
  }
});

test("native Dialog Node inspector preserves identity and validates local edits", async () => {
  installMicroDom();
  const { demo, resetDemo } = await import("../assets/unity-preview/state.js");
  const inspector = await import("../assets/unity-preview/components/inspector.js");
  resetDemo();
  const host = document.createElement("div");
  inspector.render(host, "dialogue-node", { state: demo, rerender() {} });
  const find = (predicate) => { let found; walk(host, (node) => { if (!found && predicate(node)) found = node; }); return found; };
  const rowLabel = (node, label) => node.className === "bf-field" && node.children[0]?.children.some((child) => child.textContent === label);
  const nameRow = find((node) => rowLabel(node, "Node Name"));
  const name = nameRow.children[1].children[0];
  const initialName = demo.inspectors.node.name;
  const edit = (input, value) => { for (const handler of input.listeners.input || []) handler({ target: { value } }); };
  edit(name, "   ");
  assert.equal(demo.inspectors.node.name, initialName, "blank names must preserve the asset name");
  edit(name, "  Gate line  ");
  assert.equal(demo.inspectors.node.name, "Gate line");
  const duration = find((node) => node.getAttribute?.("aria-label") === "Display Time (s)");
  edit(duration, "-5");
  assert.equal(demo.inspectors.node.displayTime, 0);
  edit(duration, "Infinity");
  assert.equal(demo.inspectors.node.displayTime, 0);
  const guidRow = find((node) => rowLabel(node, "GUID"));
  assert.equal(guidRow.children[1].children[0].getAttribute("disabled"), "");
});

test("theme tutorial sample edits update their canvas without rerendering the input", async () => {
  installMicroDom();
  const { demo, resetDemo } = await import("../assets/unity-preview/state.js");
  const themes = await import("../assets/unity-preview/surfaces/themes.js");
  resetDemo();
  demo.themes.sampleOpen = true;
  let rerenders = 0;
  const host = document.createElement("div");
  const ctx = { state: demo, surface: "workbench", rerender() { rerenders++; } };
  await themes.render(host, ctx);
  let row;
  let line;
  walk(host, (node) => {
    if (node.className === "bf-field" && node.children[0]?.children.some((child) => child.textContent === "Sample line")) row = node;
    if (node.className === "theme-preview__line") line = node;
  });
  const input = row.children[1].children[0];
  input.closest = (selector) => { assert.equal(selector, ".up-window"); return { querySelector(selector) { assert.equal(selector, ".theme-preview__line"); return line; } }; };
  for (const handler of input.listeners.input || []) handler({ target: { value: "Updated tutorial line" } });
  assert.equal(demo.themes.sampleLine, "Updated tutorial line");
  assert.equal(line.textContent, "Updated tutorial line");
  assert.equal(rerenders, 0, "typing must preserve the existing input and its caret");
  host.replaceChildren();
  await themes.render(host, ctx);
  walk(host, (node) => { if (node.className === "theme-preview__line") line = node; });
  assert.equal(line.textContent, "Updated tutorial line", "later setting changes must retain edited sample content");
});

test("sound seeking and retiming use committed bounded values and preserve frame coordinates", async () => {
  installMicroDom();
  const { demo, resetDemo } = await import(new URL("../assets/unity-preview/state.js", import.meta.url));
  const sound = await import(new URL("../assets/unity-preview/surfaces/sound.js", import.meta.url));
  resetDemo();
  Object.assign(demo.sound, { frameRate: 30, durationFrames: 120, playhead: 0, seekFrame: 0 });
  demo.sound.tracks = [{ name: "Test", clip: "Example", startFrame: 15, durationFrames: 30 }];
  const find = (root, predicate) => { let found; walk(root, (node) => { if (!found && predicate(node)) found = node; }); return found; };
  const host = document.createElement("div");
  let route;
  await sound.render(host, { surface: "sequencer", state: demo, rerender() {}, navigateSurface(value) { route = value; } });
  const input = (label) => find(host, (node) => node.getAttribute?.("aria-label") === label);
  const click = (text) => { const button = find(host, (node) => node.tagName === "button" && node.textContent === text); assert.ok(button, text); for (const handler of button.listeners.click || []) handler({ currentTarget: button, target: button }); };
  for (const handler of input("Seek to frame").listeners.change || []) handler({ target: { value: "999" } });
  assert.equal(demo.sound.seekFrame, 120);
  click("Seek");
  assert.equal(demo.sound.playhead, 120);
  for (const handler of input("Retime to (fps)").listeners.change || []) handler({ target: { value: "60" } });
  click("Apply retime");
  assert.equal(demo.sound.frameRate, 60);
  assert.equal(demo.sound.durationFrames, 240);
  assert.equal(demo.sound.tracks[0].startFrame, 30);
  assert.equal(demo.sound.tracks[0].durationFrames, 60);
  click("Add binding");
  assert.equal(route, "binding");
  const ruler = find(host, (node) => node.className === "walla-ruler");
  const ticks = ruler.children.filter((node) => node.className === "walla-ruler__tick");
  assert.equal(ticks[8].textContent, "120f");
  assert.equal(ticks[8].style.left, "384px", "ruler labels use the same scale as clips and seeking");
  const invalid = { value: "Infinity" };
  for (const handler of input("Retime to (fps)").listeners.change || []) handler({ target: invalid });
  assert.equal(demo.sound.retimeTargetFrameRate, 60, "non-finite edits must not corrupt preview state");
});

test("gallery nodes render Unity authoring controls and directional ports", async () => {
  installMicroDom();
  const { demo, resetDemo } = await import(new URL("../assets/unity-preview/state.js", import.meta.url));
  const { renderNodeGallery } = await import(new URL("../assets/unity-preview/surfaces/nodes.js", import.meta.url));
  resetDemo();
  const host = renderNodeGallery({ state: demo, rerender() {} });
  const nodes = [];
  walk(host, (node) => { if (node.dataset?.nodeKind || node.getAttribute?.("data-node-kind")) nodes.push(node); });
  const find = (kind) => nodes.find((node) => (node.dataset?.nodeKind || node.getAttribute?.("data-node-kind")) === kind);
  const descendants = (node, predicate) => { const found = []; walk(node, (child) => { if (predicate(child)) found.push(child); }); return found; };
  const hasClass = (node, name) => (node.className || "").split(/\s+/).includes(name);
  const controls = (node) => descendants(node, (child) => /^(input|select|textarea)$/i.test(child.tagName));

  for (const kind of demo.nodes.map((node) => node.kind)) {
    const node = find(kind);
    assert.ok(node, `${kind}: missing node representation`);
    if (kind === "Start" || kind === "End") {
      assert.equal(controls(node).length, 0, `${kind}: must remain header-only`);
      assert.equal(descendants(node, (child) => hasClass(child, "dgs-port--in")).length, kind === "End" ? 1 : 0);
      assert.equal(descendants(node, (child) => hasClass(child, "dgs-port--out")).length, kind === "Start" ? 1 : 0);
    } else {
      assert.ok(descendants(node, (child) => hasClass(child, "dgs-port--in")).length, `${kind}: input port missing`);
      assert.ok(descendants(node, (child) => hasClass(child, "dgs-port--out")).length, `${kind}: output port missing`);
      if (kind !== "CameraRestore") assert.ok(controls(node).length, `${kind}: summary text replaced the authored controls`);
      if (!["Choice", "Switch", "RandomBranch", "Wait"].includes(kind)) {
        const strip = descendants(node, (child) => hasClass(child, "dgs-node__port-row"))[0];
        assert.ok(descendants(strip, (child) => hasClass(child, "dgs-port--out")).length, `${kind}: ordinary outputs belong beside In in the top port strip`);
      }
    }
  }
  for (const [kind, labels] of Object.entries({
    Dialog: ["Line ID", "Speaker", "Character", "AI Rewrite", "Details"],
    Choice: ["Requirements", "Add Option"],
    Action: ["Action ID", "Registered Action", "Payload & Timing", "Before Action (sec)", "After Action (sec)"],
    GraphJump: ["Target Graph", "Optional Reference Data", "Asset Path"],
    Switch: ["Variable", "Type", "Default", "Add case"],
    RandomBranch: ["Weights", "Percentages", "Probability", "Add branch"],
    Wait: ["After the wait", "Seconds"],
    CameraSwitch: ["Rig ID", "Blend Duration", "Ease", "Wait for completion"],
    CameraMove: ["Target ID", "Look-at Target ID", "Duration", "Ease", "Wait for completion"],
    CameraLookAt: ["Target ID", "Duration", "Ease", "Wait for completion"],
    CameraFollowPoint: ["Target ID"],
    CameraFollowTarget: ["Smoothing", "Local Offset", "Also Look At"],
    CameraShake: ["Strength", "Frequency", "Duration", "Wait for completion"]
  })) {
    const text = collectText(find(kind));
    for (const label of labels) assert.ok(text.includes(label), `${kind}: missing '${label}'`);
  }
  assert.ok(!collectText(find("GraphJump")).includes("Graph Path"));
  const actionFold = descendants(find("Action"), (node) => node.tagName === "details" && collectText(node).includes("Payload & Timing"))[0];
  assert.ok(actionFold, "Action must own the advanced timing foldout");
  assert.equal(actionFold.getAttribute("open"), undefined, "Action timing starts collapsed");
  assert.equal(controls(find("CameraRestore")).length, 0, "Camera Restore has no authored fields");
  walk(host, (node) => {
    if (node.tagName !== "button") return;
    assert.equal(descendants(node, (child) => child !== node && /^(button|input|select|textarea)$/i.test(child.tagName)).length, 0,
      "node gallery must not nest authoring controls inside a button");
  });
});

test("node edits stay with their instance and Wait For modes reveal the relevant controls", async () => {
  installMicroDom();
  const { demo, resetDemo } = await import(new URL("../assets/unity-preview/state.js", import.meta.url));
  const { renderGraphEditor, renderNodeGallery } = await import(new URL("../assets/unity-preview/surfaces/nodes.js", import.meta.url));
  resetDemo();
  let rerenders = 0;
  const ctx = { state: demo, rerender() { rerenders++; } };
  const find = (root, predicate) => { let found; walk(root, (node) => { if (!found && predicate(node)) found = node; }); return found; };
  const data = (node, name) => node.dataset?.[name] || node.getAttribute?.(`data-${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`);
  const control = (root, label) => {
    if (!root || root.hidden || root.getAttribute?.("hidden") !== undefined) return undefined;
    if (root.getAttribute?.("aria-label") === label) return root;
    for (const child of root.children || []) { const result = control(child, label); if (result) return result; }
  };
  const graph = renderGraphEditor(ctx);
  const action = find(graph, (node) => data(node, "nodeId") === "action-1");
  const actionInput = control(action, "Action ID");
  assert.ok(actionInput);
  for (const handler of actionInput.listeners.input || []) handler({ target: { value: "PreviewOnlyAction" } });
  assert.equal(demo.exampleGraph.nodes.find((node) => node.id === "action-1").fields["Action ID"], "PreviewOnlyAction");
  assert.equal(demo.exampleGraph.nodes.find((node) => node.id === "action-2").fields["Action ID"], "MarketReward");

  const mara = find(graph, (node) => data(node, "nodeId") === "dialog-2");
  for (const handler of mara.listeners.click || []) handler({ target: mara, currentTarget: mara });
  assert.equal(demo.dgs.selectedNodeId, "dialog-2");
  const updated = renderGraphEditor(ctx);
  const inspector = find(updated, (node) => (node.className || "").split(/\s+/).includes("dgs-inspector"));
  assert.equal(control(inspector, "Speaker").getAttribute("value"), "Mara", "selected inspector must use the selected Dialogue instance");

  const waitFor = demo.nodes.find((node) => node.kind === "WaitFor");
  waitFor.fields = { "Wait for": "GameplayEvent", "Event ID": "" };
  let gallery = renderNodeGallery(ctx);
  let waitNode = find(gallery, (node) => data(node, "nodeKind") === "WaitFor");
  assert.ok(control(waitNode, "Event ID"));
  assert.equal(control(waitNode, "Variable"), undefined);
  const mode = control(waitNode, "Wait for");
  for (const handler of mode.listeners.change || []) handler({ target: { value: "VariableCondition", dataset: {} }, currentTarget: mode });
  assert.equal(waitFor.fields["Wait for"], "VariableCondition");
  gallery = renderNodeGallery(ctx);
  waitNode = find(gallery, (node) => data(node, "nodeKind") === "WaitFor");
  assert.ok(control(waitNode, "Variable"));
  assert.equal(control(waitNode, "Event ID"), undefined);
  assert.equal(control(waitNode, "Value"), undefined, "IsTrue has no comparison value field");
  waitFor.fields.Type = "Integer";
  gallery = renderNodeGallery(ctx);
  waitNode = find(gallery, (node) => data(node, "nodeKind") === "WaitFor");
  assert.deepEqual(control(waitNode, "Operator").children.map((node) => node.getAttribute("value")), ["Equals", "NotEquals", "Greater", "Less", "GreaterOrEqual", "LessOrEqual"]);
  assert.ok(control(waitNode, "Value"), "numeric comparisons require a value field");
  const mutation = demo.nodes.find((node) => node.kind === "VariableMutation");
  mutation.fields = { Type: "Boolean", Operation: "Toggle" };
  gallery = renderNodeGallery(ctx);
  const mutationNode = find(gallery, (node) => data(node, "nodeKind") === "VariableMutation");
  assert.deepEqual(control(mutationNode, "Operation").children.map((node) => node.getAttribute("value")), ["Set", "Toggle"]);
  assert.equal(control(mutationNode, "Value"), undefined, "Toggle does not take a value literal");
});

test("every fixed graph edge resolves to the correct directional port", async () => {
  installMicroDom();
  const { demo, resetDemo } = await import(new URL("../assets/unity-preview/state.js", import.meta.url));
  const { renderGraphEditor } = await import(new URL("../assets/unity-preview/surfaces/nodes.js", import.meta.url));
  resetDemo();
  const graph = renderGraphEditor({ state: demo, rerender() {} });
  const nodes = new Map();
  walk(graph, (node) => { if ((node.className || "").split(/\s+/).includes("dgs-node--canvas")) nodes.set(node.dataset.nodeId, node); });
  for (const edge of demo.exampleGraph.edges) {
    for (const [id, portId, direction] of [[edge.from, edge.sourcePort, "out"], [edge.to, edge.targetPort, "in"]]) {
      const ports = [];
      walk(nodes.get(id), (node) => {
        if (node.getAttribute?.("data-port-id") === portId && (node.className || "").split(/\s+/).includes(`dgs-port--${direction}`)) ports.push(node);
      });
      assert.equal(ports.length, 1, `${id}: edge anchor '${portId}' must resolve once on the ${direction} side`);
    }
    assert.notEqual(nodes.get(edge.from)?.dataset.nodeKind, "End", "End nodes cannot have outgoing edges");
  }
});

test("repeatable node rows use authored counts, weights, independent requirements and zero vectors", async () => {
  installMicroDom();
  const { demo, resetDemo } = await import(new URL("../assets/unity-preview/state.js", import.meta.url));
  const { renderNodeGallery } = await import(new URL("../assets/unity-preview/surfaces/nodes.js", import.meta.url));
  resetDemo();
  const random = demo.nodes.find((node) => node.kind === "RandomBranch");
  random.fields = { Mode: "Weight", Branches: [0, 1, 3].map((weight, index) => ({ id: `branch${index}`, label: `Route ${index}`, weight })) };
  demo.nodes.find((node) => node.kind === "CameraFollowTarget").fields = { "Local Offset": "0, 0, 0" };
  const find = (root, predicate) => { let found; walk(root, (node) => { if (!found && predicate(node)) found = node; }); return found; };
  let host = renderNodeGallery({ state: demo, rerender() {} });
  const randomView = find(host, (node) => node.dataset?.nodeKind === "RandomBranch");
  for (const probability of ["0.0%", "25.0%", "75.0%"]) assert.ok(collectText(randomView).includes(`Probability: ${probability}`));
  for (const axis of ["X", "Y", "Z"]) {
    const input = find(host, (node) => node.getAttribute?.("aria-label") === `Local Offset ${axis}`);
    assert.equal(input.getAttribute("value"), "0", `${axis}: authored zero must be retained`);
  }
  const choice = find(host, (node) => node.dataset?.nodeKind === "Choice");
  const add = find(choice, (node) => node.tagName === "button" && node.textContent === "Add Requirement");
  for (const handler of add.listeners.click || []) handler({ stopPropagation() {} });
  const model = demo.nodes.find((node) => node.kind === "Choice");
  assert.equal(model.fields.Choices[0].requirements.length, 1);
  assert.equal(model.fields.Choices[1].requirements.length, 0);
  model.fields.Choices.push({ id: "third", text: "Third answer", requirements: [] });
  host = renderNodeGallery({ state: demo, rerender() {} });
  assert.ok(find(host, (node) => node.getAttribute?.("aria-label") === "Option 3"), "authored third options must render");
  resetDemo();
  host = renderNodeGallery({ state: demo, rerender() {} });
  const fresh = find(host, (node) => node.dataset?.nodeKind === "Choice");
  assert.ok(!collectText(fresh).includes("Requirements (1)"), "editing one preview must not mutate shared defaults");
});

test("launcher Favorites and Recent filters constrain the actual graph results", async () => {
  installMicroDom();
  const { demo, resetDemo } = await import(new URL("../assets/unity-preview/state.js", import.meta.url));
  const { render } = await import(new URL("../assets/unity-preview/surfaces/dgs.js", import.meta.url));
  resetDemo();
  const results = async () => {
    const host = document.createElement("div");
    await render(host, { surface: "home", state: demo, rerender() {} });
    const names = [];
    walk(host, (node) => { if ((node.className || "").split(/\s+/).includes("dgs-graph-row-title")) names.push(collectText(node).trim()); });
    return names;
  };
  demo.dgs.favoritesOnly = true;
  demo.dgs.favoriteGraphs = [];
  assert.deepEqual(await results(), []);
  demo.dgs.favoriteGraphs = ["MarketGate"];
  assert.deepEqual(await results(), ["Market Gate"]);
  demo.dgs.favoritesOnly = false;
  demo.dgs.recentOnly = true;
  assert.deepEqual((await results()).sort(), demo.graphs.filter((graph) => graph.recent).map((graph) => graph.title).sort());
  resetDemo();
  let rerenders = 0;
  const host = document.createElement("div");
  await render(host, { surface: "home", state: demo, rerender() { rerenders++; } });
  let search;
  walk(host, (node) => { if (node.getAttribute?.("placeholder") === "Search graphs") search = node; });
  for (const handler of search.listeners.input || []) handler({ target: { value: "Sanctum" } });
  const names = [];
  let currentSearch;
  walk(host, (node) => {
    if ((node.className || "").split(/\s+/).includes("dgs-graph-row-title")) names.push(collectText(node).trim());
    if (node.getAttribute?.("placeholder") === "Search graphs") currentSearch = node;
  });
  assert.deepEqual(names, ["Market Sanctum Exit"]);
  assert.equal(currentSearch, search, "typing must retain the focused input element");
  assert.equal(rerenders, 0, "search updates results without replacing the whole window");
});

test("switching existing preview surfaces applies Home and can reopen the gallery", async () => {
  installMicroDom();
  const { demo, resetDemo } = await import(new URL("../assets/unity-preview/state.js", import.meta.url));
  const { render } = await import(new URL("../assets/unity-preview/surfaces/dgs.js", import.meta.url));
  resetDemo();
  for (const [surface, title] of [["graph-editor", "fixed sample"], ["home", "Dialogue Graph Browser"], ["node-gallery", "Node gallery"], ["home", "Dialogue Graph Browser"], ["node-gallery", "Node gallery"]]) {
    const host = document.createElement("div");
    await render(host, { surface, state: demo, rerender() {} });
    assert.ok(collectText(host).includes(title), `${surface}: surface changed without applying its content`);
    if (surface === "home") demo.dgs.galleryDismissed = true;
  }
});

test("character workbench renders every Character Bible domain", async () => {
  installMicroDom();
  const { demo, resetDemo } = await import(new URL("../assets/unity-preview/state.js", import.meta.url));
  const { renderCharacterWorkbench } = await import(new URL("../assets/unity-preview/character-workbench.js", import.meta.url));
  resetDemo();

  const host = document.createElement("div");
  host.append(renderCharacterWorkbench(demo.characters[0], { state: demo, rerender() {} }));
  const text = collectText(host);

  for (const expected of [
    "Character ID",
    "Display Name",
    "Visuals",
    "Writing Context",
    "Voice & Texture",
    "Register & Personality",
    "Speech Style & Guidance",
    "Example Lines",
    "Pronunciation",
    "Preset & Inline Delivery",
    "Text Reveal",
    "Punctuation Pauses",
    "State Responses",
    "Body & Condition",
    "Authored Baselines",
    "Activity",
    "Banter Library"
  ]) {
    assert.ok(text.includes(expected), `character workbench is missing '${expected}'`);
  }
});

function collectText(node) {
  if (!node || typeof node !== "object") return "";
  return `${node.textContent || ""} ${(node.children || []).map(collectText).join(" ")}`;
}

test("unknown surface ids fall back instead of failing", async () => {  installMicroDom();
  const { demo, resetDemo } = await import(new URL("../assets/unity-preview/state.js", import.meta.url));
  resetDemo();

  const module = await import(new URL("../assets/unity-preview/surfaces/dgs.js", import.meta.url));
  const host = document.createElement("div");
  await module.render(host, { surface: "../../etc/passwd", embed: true, state: demo, rerender: () => {} });
  assert.ok(host.children.length > 0, "unknown surface should render the default view");
});

test("settings-system page embeds the Text settings pilot", async () => {
  const html = await read("Dialogue Graph System/modules/settings-system.html");
  assert.match(html, /class="preview-embed"/);
  assert.match(html, /preview\/index\.html\?window=dgs&amp;surface=settings-text&amp;embed=1/);
  assert.match(html, /Open the full preview/);

  const css = await read("Dialogue Graph System/assets/styles.css");
  assert.match(css, /\.preview-embed__frame/);
});

test("source drift check runs and reports its status honestly", async () => {
  try {
    const { stdout } = await execFileAsync(process.execPath, ["scripts/check-unity-preview-sources.mjs"], { cwd: new URL("..", import.meta.url) });
    assert.match(stdout, /UNITY_PREVIEW_DRIFT_(OK|SKIPPED)/);
  } catch (error) {
    // A separately edited Unity checkout can advance without changing the pinned browser demo.
    assert.equal(error.code, 1);
    assert.match(error.stderr, /UNITY_PREVIEW_DRIFT_FAILED:/);
    assert.match(error.stderr, /changed source:|missing source:/);
    console.info("Unity source drift detected; this diagnostic is separate from website test acceptance.");
  }
});

function installMicroDom() {
  if (globalThis.__microDomInstalled) return;
  globalThis.__microDomInstalled = true;

  class FakeNode {
    constructor(tag) {
      this.tagName = tag;
      this.children = [];
      this.attributes = {};
      this.style = {};
      this.dataset = {};
      this.listeners = {};
      this._text = "";
    }
    get textContent() {
      return this._text;
    }
    set textContent(value) {
      this._text = value === undefined || value === null ? "" : String(value);
    }
    setAttribute(name, value) {
      this.attributes[name] = String(value);
    }
    getAttribute(name) {
      return this.attributes[name];
    }
    removeAttribute(name) {
      delete this.attributes[name];
    }
    appendChild(child) {
      this.children.push(child);
      return child;
    }
    replaceChildren(...nodes) {
      this.children = [];
      this._text = "";
      this.append(...nodes);
    }
    append(...nodes) {
      for (const node of nodes) {
        if (node === undefined || node === null || node === false) continue;
        this.children.push(node);
      }
    }
    addEventListener(type, handler) {
      (this.listeners[type] ||= []).push(handler);
    }
    removeEventListener() {}
    querySelector() {
      return null;
    }
    closest() {
      return null;
    }
  }

  globalThis.Node = FakeNode;
  globalThis.document = {
    createElement: (tag) => new FakeNode(tag),
    createElementNS: (_ns, tag) => new FakeNode(tag),
    createTextNode: (text) => {
      const node = new FakeNode("#text");
      node.textContent = String(text);
      return node;
    }
  };
}
