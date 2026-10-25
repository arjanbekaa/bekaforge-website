import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const routes = [
  "api/dialog-action-runner.html",
  "api/dialog-manager.html",
  "architecture.html",
  "components/runtime-ui.html",
  "core-concepts.html",
  "faq.html",
  "getting-started.html",
  "guides/ai-generation-workflow.html",
  "guides/creating-a-dialog.html",
  "guides/integrating-actions.html",
  "index.html",
  "installation.html",
  "maintainer-notes.html",
  "node-reference.html",
  "inspector-reference.html",
  "guides/banter-setup.html",
  "guides/walla-setup.html",
  "guides/camera-interaction-ui.html",
  "modules/ai-extension.html",
  "modules/graph-editor.html",
  "modules/history-and-transcripts.html",
  "modules/import-export.html",
  "modules/runtime-dialog-flow.html",
  "modules/settings-system.html",
  "quick-tutorial.html",
  "roadmap.html",
  "troubleshooting.html",
  "changelog.html",
  "license.html",
  "support.html"
];

const projectRoot = path.resolve(import.meta.dirname, "..");

for (const route of routes) {
  const legacyFile = path.join(projectRoot, "dgs-docs", route);
  const targetFile = path.join(projectRoot, "Dialogue Graph System", route);
  const relativeTarget = path
    .relative(path.dirname(legacyFile), targetFile)
    .split(path.sep)
    .map(encodeURIComponent)
    .join("/");
  const canonical = `https://bekaforge.com/Dialogue%20Graph%20System/${route
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
  const label = route === "index.html" ? "Dialogue Graph System 4.0 documentation" : route;
  const source = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="refresh" content="0; url=${relativeTarget}">
  <link rel="canonical" href="${canonical}">
  <title>Documentation moved | Dialogue Graph System</title>
</head>
<body>
  <p>This Dialogue Graph System page moved to <a href="${relativeTarget}">${label}</a>.</p>
</body>
</html>
`;

  await mkdir(path.dirname(legacyFile), { recursive: true });
  await writeFile(legacyFile, source, "utf8");
}

const config = JSON.parse(await readFile(path.join(projectRoot, "assets/data/site-config.json"), "utf8"));
for (const [topic, target] of Object.entries(config.documentation)) {
  if (!/^[a-z-]+$/.test(topic)) throw new Error(`Invalid documentation topic: ${topic}`);
  const destination = new URL(target);
  if (destination.origin !== "https://bekaforge.com") throw new Error(`Invalid documentation origin: ${topic}`);
  const targetFile = path.join(projectRoot, decodeURIComponent(destination.pathname).slice(1));
  await readFile(targetFile);
  for (const alias of [`${topic}.html`, `${topic}/index.html`]) {
    const file = path.join(projectRoot, "dgs-docs", alias);
    const relative = path.relative(path.dirname(file), targetFile).split(path.sep).map(encodeURIComponent).join("/") + destination.search + destination.hash;
    const resources = path.relative(path.dirname(file), path.join(projectRoot, "assets/data/textresources.js")).split(path.sep).join("/");
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="canonical" href="${target}"><title>Documentation moved | Beka Forge</title>
<noscript><meta http-equiv="refresh" content="0; url=${relative}"></noscript>
</head><body>
<p>Continue to <a href="${relative}" data-resource-href="documentation.${topic}">the ${topic} documentation</a>.</p>
<script src="${resources}"></script>
<script>Promise.resolve(window.BekaForgeConfigReady).then(function () {
  location.replace(window.BekaForgeResources?.documentation?.[${JSON.stringify(topic)}] || ${JSON.stringify(relative)});
}, function () { location.replace(${JSON.stringify(relative)}); });</script>
</body></html>
`, "utf8");
  }
}
console.log(`Generated ${routes.length} legacy page redirects and ${Object.keys(config.documentation).length * 2} configured topic aliases.`);
