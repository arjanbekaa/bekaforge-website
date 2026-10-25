/* Source drift check for the interactive Unity preview.
   Compares assets/unity-preview/data/coverage.json against the pinned Unity project:
   - every recorded source file must still exist and match its recorded SHA-256
   - every recorded preview module and stylesheet must exist in this repository
   Read-only: this script never edits Unity files.
   Usage: node scripts/check-unity-preview-sources.mjs [--root <Unity project path>]
   Root resolution: --root, then DGS_SOURCE_ROOT, then the recorded defaultLocalRoot. */

import { createHash } from "node:crypto";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const coveragePath = join(repoRoot, "assets/unity-preview/data/coverage.json");

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!existsSync(coveragePath)) {
  fail("UNITY_PREVIEW_DRIFT_FAILED: assets/unity-preview/data/coverage.json is missing.");
}

let coverage;
try {
  coverage = JSON.parse(readFileSync(coveragePath, "utf8"));
} catch (error) {
  fail(`UNITY_PREVIEW_DRIFT_FAILED: coverage.json is not valid JSON (${error.message}).`);
}

const args = process.argv.slice(2);
const rootArgIndex = args.indexOf("--root");
const rootArg = rootArgIndex !== -1 ? args[rootArgIndex + 1] : null;
const candidates = [rootArg, process.env.DGS_SOURCE_ROOT, coverage.source?.defaultLocalRoot].filter(Boolean);
const sourceRoot = candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isDirectory());

if (!sourceRoot) {
  console.log("UNITY_PREVIEW_DRIFT_SKIPPED: Unity source project not found.");
  console.log("Set DGS_SOURCE_ROOT or pass --root <path> to run the drift check.");
  process.exit(0);
}

const problems = [];
const sourceFiles = Array.isArray(coverage.sourceFiles) ? coverage.sourceFiles : [];
if (sourceFiles.length === 0) problems.push("coverage.json records no source files.");

for (const record of sourceFiles) {
  const absolute = join(sourceRoot, record.path);
  if (!existsSync(absolute)) {
    problems.push(`missing source: ${record.path}`);
    continue;
  }
  const hash = createHash("sha256").update(readFileSync(absolute)).digest("hex");
  if (hash !== record.sha256) {
    problems.push(`changed source: ${record.path} (recorded ${record.sha256.slice(0, 12)}…, found ${hash.slice(0, 12)}…)`);
  }
}

const windows = Array.isArray(coverage.windows) ? coverage.windows : [];
for (const window of windows) {
  for (const relative of [window.module, ...(window.stylesheets || [])]) {
    if (!relative) continue;
    if (!existsSync(join(repoRoot, relative))) {
      problems.push(`missing preview asset for window '${window.id}': ${relative}`);
    }
  }
}

if (problems.length > 0) {
  console.error(`UNITY_PREVIEW_DRIFT_FAILED: ${problems.length} problem(s) against ${sourceRoot}`);
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(`UNITY_PREVIEW_DRIFT_OK: ${sourceFiles.length} source files across ${windows.length} windows match pin ${coverage.source?.commit || "unknown"} (${sourceRoot}).`);
