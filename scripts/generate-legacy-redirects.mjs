import { mkdir, writeFile } from "node:fs/promises";
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
  const label = route === "index.html" ? "Dialogue Graph System 3.0 documentation" : route;
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

console.log(`Generated ${routes.length} legacy redirects.`);
