/* Browser render check for the interactive Unity preview.
   Serves the website root locally, loads each preview window in headless Chrome,
   asserts the fallback error text never appears and a sentinel is present, and
   captures a PNG per target into the evidence folder.
   Usage: node scripts/check-unity-preview-render.mjs [--chrome <path>] [--out <dir>]
   Skips cleanly (exit 0) when no Chrome/Edge binary is available. */

import { createServer } from "node:http";
import { readFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

const chromeCandidates = [
  process.env.CHROME_PATH,
  join(process.env["ProgramFiles"] || "C:/Program Files", "Google/Chrome/Application/chrome.exe"),
  join(process.env["ProgramFiles(x86)"] || "C:/Program Files (x86)", "Google/Chrome/Application/chrome.exe"),
  join(process.env["ProgramFiles(x86)"] || "C:/Program Files (x86)", "Microsoft/Edge/Application/msedge.exe"),
  join(process.env["ProgramFiles"] || "C:/Program Files", "Microsoft/Edge/Application/msedge.exe")
].filter(Boolean);

const args = process.argv.slice(2);
const chromeArg = args.indexOf("--chrome");
const outArg = args.indexOf("--out");
const chrome = [chromeArg !== -1 ? args[chromeArg + 1] : null, ...chromeCandidates].filter(Boolean).find((path) => existsSync(path));
const outDir = join(repoRoot, outArg !== -1 ? args[outArg + 1] : "docs/interactive-unity-preview/evidence/screenshots");

if (!chrome) {
  console.log("UNITY_PREVIEW_BROWSER_SKIPPED: no Chrome or Edge binary found (set CHROME_PATH to enable).");
  process.exit(0);
}

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".svg": "image/svg+xml"
};

const server = createServer((request, response) => {
  try {
    const url = new URL(request.url, "http://127.0.0.1");
    const pathname = decodeURIComponent(url.pathname);
    let filePath = join(repoRoot, pathname);
    if (existsSync(filePath) && statSync(filePath).isDirectory()) filePath = join(filePath, "index.html");
    if (!filePath.startsWith(repoRoot) || !existsSync(filePath)) {
      response.writeHead(404).end("not found");
      return;
    }
    response.writeHead(200, { "content-type": mime[extname(filePath).toLowerCase()] || "application/octet-stream" });
    response.end(readFileSync(filePath));
  } catch {
    response.writeHead(500).end("server error");
  }
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const targets = [
  { name: "dgs-home", path: "Dialogue Graph System/preview/index.html?window=dgs", sentinel: "Interactive preview" },
  { name: "dgs-graphs-toolbar", path: "Dialogue Graph System/preview/index.html?window=dgs&surface=graphs", sentinel: "Format Layout" },
  { name: "dgs-settings-text", path: "Dialogue Graph System/preview/index.html?window=dgs&surface=settings-text", sentinel: "Control dialogue reveal speed" },
  { name: "dgs-node-gallery", path: "Dialogue Graph System/preview/index.html?window=dgs&surface=node-gallery", sentinel: "Node gallery" },
  { name: "dgs-definitions-character", path: "Dialogue Graph System/preview/index.html?window=dgs&surface=definitions", sentinel: "Banter Library" },
  { name: "dgs-production", path: "Dialogue Graph System/preview/index.html?window=dgs&surface=production", sentinel: "Production" },
  { name: "dgs-project-health", path: "Dialogue Graph System/preview/index.html?window=dgs&surface=project-health", sentinel: "Project health" },
  { name: "ai-providers-setup", path: "AI Providers/preview/index.html?window=ai-providers", sentinel: "AI Providers" },
  { name: "ai-providers-profile-duplicate", path: "AI Providers/preview/index.html?window=ai-providers&surface=profile-duplicate", sentinel: "Configuration is copied into a new asset. Credentials, account state, and connection-test history are not copied." },
  { name: "banter-getting-started", path: "Dialogue Graph System/preview/index.html?window=banter", sentinel: "Banter Getting Started" },
  { name: "sound-sequencer", path: "Dialogue Graph System/preview/index.html?window=sound", sentinel: "Sound Sequencer" },
  { name: "sound-graph-attached", path: "Dialogue Graph System/preview/index.html?window=sound&surface=graph-attached", sentinel: "Open in separate window" },
  { name: "sound-graph-detached", path: "Dialogue Graph System/preview/index.html?window=sound&surface=graph-detached", sentinel: "Detached from MarketLever." },
  { name: "themes-workbench", path: "Dialogue Graph System/preview/index.html?window=themes", sentinel: "UI Theme Workbench" },
  { name: "inspectors-dialogue-node", path: "Dialogue Graph System/preview/index.html?window=inspectors", sentinel: "Dialogue Node" },
  { name: "inspectors-character", path: "Dialogue Graph System/preview/index.html?window=inspectors&surface=asset-character", sentinel: "Banter Library" },
  { name: "inspectors-camera-manager", path: "Dialogue Graph System/preview/index.html?window=inspectors&surface=camera-manager", sentinel: "Live Operation State" },
  { name: "inspectors-camera-rig", path: "Dialogue Graph System/preview/index.html?window=inspectors&surface=camera-components", sentinel: "Beka Camera Rig" },
  { name: "inspectors-interactable", path: "Dialogue Graph System/preview/index.html?window=inspectors&surface=interactable", sentinel: "Interaction System · Interactable" },
  { name: "inspectors-interactor", path: "Dialogue Graph System/preview/index.html?window=inspectors&surface=interactor", sentinel: "Interaction System · Interactor" },
  { name: "inspectors-interactor-narrow-380", path: "Dialogue Graph System/preview/index.html?window=inspectors&surface=interactor", sentinel: "Interaction System · Interactor", size: "380,800" },
  { name: "dgs-ai-floating-panel", path: "Dialogue Graph System/preview/index.html?window=dgs-ai", sentinel: "AI Assistant" },
  { name: "dgs-ai-draft-preview", path: "Dialogue Graph System/preview/index.html?window=dgs-ai&surface=draft-preview", sentinel: "AI Draft - Dialog Nodes" },
  { name: "dgs-ai-localization-preview", path: "Dialogue Graph System/preview/index.html?window=dgs-ai&surface=localization-preview", sentinel: "AI Translation Preview - French (example)" },
  { name: "dgs-ai-batch-rewrite", path: "Dialogue Graph System/preview/index.html?window=dgs-ai&surface=batch-rewrite-preview", sentinel: "AI Batch Rewrite Preview" },
  { name: "dgs-ai-flow-draft", path: "Dialogue Graph System/preview/index.html?window=dgs-ai&surface=flow-draft-preview", sentinel: "Review Generated Dialog Flow" },
  { name: "dgs-ai-banter-review", path: "Dialogue Graph System/preview/index.html?window=dgs-ai&surface=character-banter-review", sentinel: "Review Banter · Warden" },
  { name: "dgs-ai-fill-review", path: "Dialogue Graph System/preview/index.html?window=dgs-ai&surface=character-fill-review", sentinel: "Review Warden · Overview" },
  { name: "dgs-ai-plan-preview", path: "Dialogue Graph System/preview/index.html?window=dgs-ai&surface=plan-preview", sentinel: "Review AI Graph Plan" },
  { name: "dgs-ai-authoring-progress", path: "Dialogue Graph System/preview/index.html?window=dgs-ai&surface=authoring-progress", sentinel: "AI activity" },
  { name: "dgs-welcome", path: "Dialogue Graph System/preview/index.html?window=dgs-dialogs&surface=welcome", sentinel: "WELCOME" },
  { name: "dgs-public-information", path: "Dialogue Graph System/preview/index.html?window=dgs-dialogs&surface=public-information", sentinel: "Dialogue Graph System Documentation" },
  { name: "dgs-create-asset", path: "Dialogue Graph System/preview/index.html?window=dgs-dialogs&surface=create-asset", sentinel: "Fill in the fields below and click Create." },
  { name: "dgs-validation-panel", path: "Dialogue Graph System/preview/index.html?window=dgs-dialogs&surface=validation-panel", sentinel: "Graph Validation" },
  { name: "dgs-rewrite-preview", path: "Dialogue Graph System/preview/index.html?window=dgs-dialogs&surface=rewrite-preview", sentinel: "Review Rewrite" },
  { name: "dgs-save-graph", path: "Dialogue Graph System/preview/index.html?window=dgs-dialogs&surface=save-graph", sentinel: "Choose how to save the current graph." },
  { name: "dgs-import-preview", path: "Dialogue Graph System/preview/index.html?window=dgs-dialogs&surface=import-preview", sentinel: "Review production CSV" },
  { name: "dgs-add-language", path: "Dialogue Graph System/preview/index.html?window=dgs-dialogs&surface=add-language", sentinel: "Add Target Languages" },
  { name: "dgs-translation-choice", path: "Dialogue Graph System/preview/index.html?window=dgs-dialogs&surface=translation-choice", sentinel: "AI Localization" },
  { name: "dgs-localization-io", path: "Dialogue Graph System/preview/index.html?window=dgs-dialogs&surface=localization-io", sentinel: "Export Strings" },
  { name: "dgs-ai-model-picker", path: "Dialogue Graph System/preview/index.html?window=dgs-dialogs&surface=ai-model-picker", sentinel: "Choose model" },
  { name: "embed-dgs-settings-text", path: "assets/unity-preview/embed.html?window=dgs&surface=settings-text", sentinel: "Control dialogue reveal speed" },
  { name: "embed-narrow-380", path: "assets/unity-preview/embed.html?window=dgs&surface=settings-text", sentinel: "Control dialogue reveal speed", size: "380,800" },
  { name: "inspector-narrow-380", path: "Dialogue Graph System/preview/index.html?window=inspectors&surface=variable-definition", sentinel: "Variable Definition", size: "380,800" },
  { name: "tutorial-embed-pilot", path: "Dialogue Graph System/modules/settings-system.html", sentinel: "preview-embed__frame" },
  { name: "tutorial-768", path: "Dialogue Graph System/modules/settings-system.html", sentinel: "preview-embed__frame", size: "768,900" },
  { name: "tutorial-graph-editor", path: "Dialogue Graph System/modules/graph-editor.html", sentinel: "Interactive preview: <strong>Graphs &gt; Graph editor</strong>" },
  { name: "tutorial-ai-generation", path: "Dialogue Graph System/guides/ai-generation-workflow.html", sentinel: "Interactive preview: the <strong>AI Assistant floating panel</strong>" },
  { name: "tutorial-creating-a-dialog", path: "Dialogue Graph System/guides/creating-a-dialog.html", sentinel: "Interactive preview: <strong>Home</strong>" },
  { name: "tutorial-ai-providers-home", path: "AI Providers/index.html", sentinel: "Interactive preview: <strong>AI Providers &gt; Profiles</strong>" }
];

mkdirSync(outDir, { recursive: true });

const onlyArg = args.indexOf("--only");
const only = onlyArg !== -1 ? args[onlyArg + 1] : "";
const selectedTargets = only ? targets.filter((target) => target.name.includes(only)) : targets;
if (only && selectedTargets.length === 0) {
  console.error(`No render targets match --only ${only}`);
  process.exit(1);
}

const failures = [];
for (const target of selectedTargets) {
  const [pathPart, queryPart] = target.path.split("?");
  const url = `${origin}/${pathPart.split("/").map(encodeURIComponent).join("/")}${queryPart ? `?${queryPart}` : ""}`;
  const screenshot = join(outDir, `${target.name}.png`);

  try {
    const { stdout } = await execFileAsync(chrome, [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--virtual-time-budget=6000",
      `--window-size=${target.size || "1440,1000"}`,
      `--screenshot=${screenshot}`,
      "--dump-dom",
      url
    ], { maxBuffer: 64 * 1024 * 1024, timeout: 60000 });

    if (stdout.includes("The preview could not be rendered safely.")) {
      failures.push(`${target.name}: fallback error rendered`);
      continue;
    }
    if (!stdout.includes(target.sentinel)) {
      failures.push(`${target.name}: sentinel "${target.sentinel}" missing from DOM`);
      continue;
    }
    if (!existsSync(screenshot) || statSync(screenshot).size < 20000) {
      failures.push(`${target.name}: screenshot missing or suspiciously small`);
      continue;
    }
    console.log(`ok ${target.name} (${Math.round(statSync(screenshot).size / 1024)} KB)`);
  } catch (error) {
    const stderr = String(error.stderr || "").split("\n").filter(Boolean).slice(-3).join(" | ");
    failures.push(`${target.name}: ${error.message.split("\n")[0]}${stderr ? ` :: ${stderr}` : ""}`);
  }
}

server.close();

if (failures.length > 0) {
  console.error(`UNITY_PREVIEW_BROWSER_FAILED: ${failures.length} of ${selectedTargets.length} targets failed (${chrome})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`UNITY_PREVIEW_BROWSER_OK: ${selectedTargets.length} targets rendered in headless browser, screenshots in ${outDir}`);
console.log(`Browser: ${chrome}`);
