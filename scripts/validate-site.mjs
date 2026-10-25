import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

const projectRoot = path.resolve(import.meta.dirname, "..");
const siteRoots = [
  "index.html",
  "docs.html",
  "roadmap.html",
  "Dialogue Graph System",
  "AI Providers",
  "Dialogue Graph AI Extension",
  "dgs-docs"
];
const errors = [];

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function collectHtml(entry) {
  const absolute = path.join(projectRoot, entry);
  const details = await stat(absolute);
  if (details.isFile()) return [absolute];

  const results = [];
  for (const child of await readdir(absolute, { withFileTypes: true })) {
    const childEntry = path.join(entry, child.name);
    if (child.isDirectory()) results.push(...await collectHtml(childEntry));
    else if (child.name.endsWith(".html")) results.push(path.join(projectRoot, childEntry));
  }
  return results;
}

function display(file) {
  return path.relative(projectRoot, file).replaceAll(path.sep, "/");
}

function isExternal(reference) {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(reference);
}

async function resolveLocalReference(sourceFile, reference) {
  const withoutQuery = reference.split(/[?#]/, 1)[0];
  if (!withoutQuery || isExternal(withoutQuery)) return true;

  let decoded;
  try {
    decoded = decodeURIComponent(withoutQuery);
  } catch {
    errors.push(`${display(sourceFile)} has malformed URL encoding: ${reference}`);
    return false;
  }

  const candidate = decoded.startsWith("/")
    ? path.join(projectRoot, decoded.slice(1))
    : path.resolve(path.dirname(sourceFile), decoded);
  const relative = path.relative(projectRoot, candidate);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    errors.push(`${display(sourceFile)} points outside the site: ${reference}`);
    return false;
  }

  if (await exists(candidate)) {
    const details = await stat(candidate);
    if (!details.isDirectory() || await exists(path.join(candidate, "index.html"))) return true;
  }

  errors.push(`${display(sourceFile)} has a broken local reference: ${reference}`);
  return false;
}

function flatten(value, prefix = "", output = new Map()) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) {
      flatten(child, prefix ? `${prefix}.${key}` : key, output);
    }
  } else {
    output.set(prefix, value);
  }
  return output;
}

async function loadDefaultResources() {
  const source = await readFile(path.join(projectRoot, "assets/data/textresources.js"), "utf8");
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
    fetch: async () => { throw new Error("offline validator"); }
  };
  vm.runInNewContext(source, sandbox, { filename: "textresources.js" });
  await sandbox.window.BekaForgeConfigReady;
  return sandbox.window.BekaForgeResources;
}

function validateConfig(config) {
  const exactKeys = (value, expected, label) => {
    const actual = Object.keys(value || {}).sort();
    const wanted = [...expected].sort();
    if (JSON.stringify(actual) !== JSON.stringify(wanted)) {
      errors.push(`${label} keys must be exactly: ${wanted.join(", ")}`);
    }
  };

  exactKeys(config, ["publisher", "support", "products"], "site config");
  exactKeys(config.publisher, ["assetStoreUrl", "youtubeUrl", "githubUrl"], "publisher config");
  exactKeys(config.support, ["emailUrl", "reportIssueUrl"], "support config");
  exactKeys(config.products, ["dialogueGraphSystem", "aiProviders", "aiExtension"], "products config");

  for (const [name, product] of Object.entries(config.products || {})) {
    exactKeys(
      product,
      ["status", "price", "version", "assetStoreUrl", "youtubeUrl", "docsPath"],
      `${name} config`
    );
  }

  if (config.products?.dialogueGraphSystem?.version !== "4.0.0") {
    errors.push("Dialogue Graph System must identify the prepared 4.0.0 documentation.");
  }
  if (config.products?.dialogueGraphSystem?.price !== "" || !/not published/i.test(config.products?.dialogueGraphSystem?.status || "")) {
    errors.push("DGS 4.0 must not claim a price or publication before release.");
  }
  if (config.products?.dialogueGraphSystem?.assetStoreUrl !== "https://assetstore.unity.com/packages/tools/gui/dialogue-graph-system-332234") {
    errors.push("DGS must keep the verified current single Asset Store listing URL.");
  }
  if (!/published 1\.0\.0.*unpublished 2\.2\.0.*DGS 4\.0 AI/i.test(config.products?.aiProviders?.status || "") || config.products?.aiProviders?.version !== "1.0.0" || config.products?.aiProviders?.price !== "") {
    errors.push("AI Providers must distinguish its published 1.0.0 listing from pending DGS 4.0 compatibility.");
  }
  if (!/\/packages\/tools\/ai-ml-integration\/ai-providers-for-unity-beka-forge-384482\/?$/.test(config.products?.aiProviders?.assetStoreUrl || "")) {
    errors.push("AI Providers must use its current verified Asset Store listing URL.");
  }

  const extension = config.products?.aiExtension || {};
  if (extension.status !== "Included in DGS 4.0.0" || extension.assetStoreUrl || extension.price || extension.docsPath !== "Dialogue Graph System/guides/ai-generation-workflow.html") {
    errors.push("AI Extension must remain an included DGS component without a separate listing.");
  }

  const flat = flatten(config);
  for (const [key, value] of flat) {
    if (/(?:token|secret|password|api.?key|private.?key|access.?key|webhook)/i.test(key)) {
      errors.push(`Secret-like config field is not allowed: ${key}`);
    }
    if (typeof value === "string" && /(?:github_pat_|ghp_[a-z0-9]{20,}|sk-[a-z0-9]{20,})/i.test(value)) {
      errors.push(`Secret-like config value is not allowed: ${key}`);
    }
    if (/(?:assetStoreUrl|youtubeUrl|githubUrl|reportIssueUrl)$/.test(key) && value && !/^https:\/\//.test(value)) {
      errors.push(`${key} must be an HTTPS URL.`);
    }
    if (key.endsWith("emailUrl") && value && !/^mailto:/i.test(value)) {
      errors.push(`${key} must be a mailto URL.`);
    }
  }
}

const htmlFiles = (await Promise.all(siteRoots.map(collectHtml))).flat();
const htmlSources = new Map();
let referenceCount = 0;

for (const file of htmlFiles) {
  const source = await readFile(file, "utf8");
  htmlSources.set(file, source);
  for (const match of source.matchAll(/(?:^|\s)(?:href|src|data-preview-src)\s*=\s*["']([^"']+)["']/gim)) {
    referenceCount += 1;
    await resolveLocalReference(file, match[1]);
  }
}

const resources = await loadDefaultResources();
const resourcePaths = flatten(resources);
let bindingCount = 0;
for (const [file, source] of htmlSources) {
  for (const match of source.matchAll(/data-resource-(?:href|src|text)=["']([^"']+)["']/gi)) {
    bindingCount += 1;
    if (!resourcePaths.has(match[1])) {
      errors.push(`${display(file)} uses unknown resource key: ${match[1]}`);
    }
  }
}

for (const [key, value] of resourcePaths) {
  if (!/(?:docsPath|screenshotPath|iconPath)$/.test(key) || !value) continue;
  await resolveLocalReference(path.join(projectRoot, "index.html"), value);
}

const config = JSON.parse(await readFile(path.join(projectRoot, "assets/data/site-config.json"), "utf8"));
validateConfig(config);

const publicFiles = htmlFiles.filter((file) => {
  const relative = display(file);
  return !relative.startsWith("Dialogue Graph AI Extension/") || relative === "Dialogue Graph AI Extension/index.html";
});
const publicSource = publicFiles.map((file) => htmlSources.get(file)).join("\n");
const dgsSetupPages = [
  "getting-started.html",
  "installation.html",
  "index.html",
  "quick-tutorial.html",
  "guides/creating-a-dialog.html",
  "guides/integrating-actions.html",
  "modules/graph-editor.html",
  "modules/settings-system.html",
  "modules/import-export.html"
].map((page) => htmlSources.get(path.join(projectRoot, "Dialogue Graph System", page)) || "").join("\n");
const stalePatterns = [
  /store link pending/i,
  /public asset placeholders/i,
  /own public folder/i,
  /Dialogue Graph System v2\.0\.0/i,
  /Dialogue Graph System 3\.0(?:\.0)?/i,
  /\$24\.99/,
  /Available Free|Get free on Asset Store/i,
  /AI Extension is a separate product/i,
  /AI Extension.*Coming Soon/i,
  /Unity 2021\.3 LTS or newer/i,
  /DemoScenes\/DialogueDemo\.unity|three sample graphs|Demo_ControlRoomActions/i,
  /fed to the AI extension/i,
  /shipped AI extension/i
];
for (const pattern of stalePatterns) {
  if (pattern.test(publicSource)) errors.push(`Public pages contain forbidden stale copy: ${pattern}`);
}

if (!/Unity 6000\.3 or newer/i.test(dgsSetupPages) || !/Unity 6000\.3\.6f1/i.test(dgsSetupPages)) {
  errors.push("Current DGS setup pages must separate the declared Unity minimum from the observed 6000.3.6f1 environment.");
}
if (!/com\.unity\.ugui.*2\.0\.0/i.test(dgsSetupPages) || !/com\.unity\.nuget\.newtonsoft-json.*3\.2\.2/i.test(dgsSetupPages)) {
  errors.push("Current DGS setup pages must list the declared uGUI and Newtonsoft dependencies.");
}
if (!/TMP Essential Resources.*not included/i.test(dgsSetupPages) || !/Do not add the separate.*com\.unity\.textmeshpro/i.test(dgsSetupPages)) {
  errors.push("Current DGS setup pages must explain TMP Essentials and reject the separate TextMeshPro shim.");
}
if (!/Samples\/2DMarketDemo\/Scenes\/MarketDemo\.unity/i.test(dgsSetupPages)) {
  errors.push("Current DGS setup pages must point to the sample scene present in the prepared bundle.");
}
if (/Tools\s*(?:â†|&gt;)\s*Dialogue Graph System|DemoScenes\/DialogueDemo\.unity|3 playable graphs/i.test(dgsSetupPages)) {
  errors.push("Current DGS setup pages contain an obsolete menu, demo path, or sample count.");
}
if (!/base Interaction Playground/i.test(dgsSetupPages) || !/optional typed Input System adapter/i.test(dgsSetupPages) || !/SimpleInteractionDemo.*not included/i.test(dgsSetupPages)) {
  errors.push("Current DGS setup pages must state the included Interaction sample/adapter boundary.");
}

const extensionLegacyRoute = htmlSources.get(path.join(projectRoot, "Dialogue Graph AI Extension", "index.html"));
if (!/url=\.\.\/Dialogue%20Graph%20System\/guides\/ai-generation-workflow\.html/i.test(extensionLegacyRoute || "")) {
  errors.push("Legacy AI Extension URL must redirect to the included DGS AI authoring guide.");
}

if (errors.length) {
  console.error(`SITE_VALIDATION_FAILED (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`HTML files: ${htmlFiles.length}`);
  console.log(`Literal references: ${referenceCount}`);
  console.log(`Resource bindings: ${bindingCount}`);
  console.log("SITE_VALIDATION_OK");
}
