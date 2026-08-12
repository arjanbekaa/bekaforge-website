# DGS Private Feedback Ingestion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serve DGS remote configuration from the public website, accept sanitized schema-2 feedback through a Cloudflare Worker, and store each accepted report as one JSON file in `arjanbekaa/dgs-ai-reports`, a private GitHub repository.

**Architecture:** GitHub Pages serves a fail-closed public configuration document at the URL already compiled into DGS. A small TypeScript Cloudflare Worker validates and redacts submitted reports, rate-limits by anonymous DGS installation ID, then writes a server-created envelope through GitHub's Contents API. The GitHub token exists only as a Worker secret; no public endpoint can read reports.

**Tech Stack:** GitHub Pages, Cloudflare Workers, TypeScript 7.0.2, Wrangler 4.121.0, Node.js 24 built-in test runner, GitHub REST Contents API, existing Unity Editor feedback client.

## Global Constraints

- Preserve all existing tracked and untracked screenshot changes in `E:\Beka Forge\bekaforge-website`; stage only explicit allowlisted files.
- Do not reset, clean, checkout, force-push, or rewrite shared history.
- Do not edit the dirty Unity project unless a verified client-contract mismatch requires a narrow test or source change.
- Keep `feedbackEnabled` and `feedback.enabled` false until private storage, secret installation, synthetic live submission, and Unity consent checks succeed.
- Never commit, print, log, copy into chat, or place in command history the GitHub token or Cloudflare credentials.
- The Worker accepts at most 128 KiB of UTF-8 JSON and supports only DGS payload `schemaVersion: 2` from `source: dgs-unity-editor`.
- The Worker strips `originalUserPrompt`, `systemPrompt`, `userPrompt`, and `rawResponse` recursively before storage.
- The Worker stores no source IP, request headers, user agent, or Cloudflare request identifier.
- Rate limit schema-valid submission attempts to five per 60 seconds per `anonymousInstallId`.
- No public route may list, read, update, or delete report files.
- DGS interactive sends still require **Send Report**; automatic AI Authoring reporting remains locally controlled and disabled by default.
- AI Extension remains Coming Soon; backend readiness does not change its publication gate.

## File Structure

Public website repository:

- `dgs-config/v1/config.json`: public, fail-closed DGS configuration; final activation edits only its endpoint, version, and two enabled flags.
- `tests/dgs-remote-config.test.mjs`: schema, URL, fail-closed, and credential-leak tests for the public configuration.
- `services/dgs-feedback/package.json`: isolated Worker toolchain and scripts.
- `services/dgs-feedback/package-lock.json`: exact dependency lock.
- `services/dgs-feedback/tsconfig.json`: strict Worker and Node-test type checking.
- `services/dgs-feedback/wrangler.jsonc`: Worker name, non-secret GitHub target, observability setting, and rate-limit binding.
- `services/dgs-feedback/src/types.ts`: public payload, stored envelope, environment, dependency, and error types.
- `services/dgs-feedback/src/redaction.ts`: recursive denied-key removal and secret/path/email redaction.
- `services/dgs-feedback/src/contract.ts`: strict top-level schema validation, bounds, and sanitized payload construction.
- `services/dgs-feedback/src/github-store.ts`: unique report envelope/path creation and GitHub Contents API retries.
- `services/dgs-feedback/src/index.ts`: HTTP routing, body limits, rate limiting, response mapping, and default Worker export.
- `services/dgs-feedback/test/fixtures/valid-report.ts`: production-shaped DGS payload fixture.
- `services/dgs-feedback/test/redaction.test.ts`: recursive privacy tests.
- `services/dgs-feedback/test/contract.test.ts`: schema and bound tests.
- `services/dgs-feedback/test/github-store.test.ts`: GitHub request/retry/error tests.
- `services/dgs-feedback/test/worker.test.ts`: route, method, size, rate-limit, storage, and response tests.
- `services/dgs-feedback/README.md`: local test, secret installation, deploy, rollback, and rotation instructions.
- `scripts/verify-dgs-feedback-live.mjs`: safe live health/invalid/synthetic submission verifier that never accepts or prints a token.

Private repository:

- `README.md`: private envelope and retention guide.
- `reports/.gitkeep`: initial dated-report tree anchor.

---

### Task 1: Publish a fail-closed DGS remote configuration

**Files:**

- Create: `dgs-config/v1/config.json`
- Create: `tests/dgs-remote-config.test.mjs`

**Interfaces:**

- Consumes: the Unity client's schema-1 contract and exact URL `https://bekaforge.com/dgs-config/v1/config.json`.
- Produces: a valid public configuration with feedback disabled and no secret values.

- [ ] **Step 1: Write the failing public-config test**

Create `tests/dgs-remote-config.test.mjs` with tests that parse the file, assert the exact schema and required sections, compare legacy and nested feedback fields, verify HTTPS/mailto schemes, and scan for credentials:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const configUrl = new URL("../dgs-config/v1/config.json", import.meta.url);

test("DGS remote config is schema 1 and fail-closed before activation", async () => {
  const text = await readFile(configUrl, "utf8");
  const config = JSON.parse(text);

  assert.equal(config.schemaVersion, 1);
  assert.equal(config.ttlHours, 12);
  assert.ok(config.links && config.feedback && config.reviewPrompt);
  assert.equal(config.feedbackEnabled, false);
  assert.equal(config.feedback.enabled, false);
  assert.equal(config.feedbackEndpoint, config.feedback.endpoint);
  assert.equal(config.feedback.endpointVersion, "v1");
  assert.equal(config.feedback.showReportPreview, true);
  assert.equal(config.feedback.maxStackTraceLength, 6000);
  assert.match(config.links.documentation, /^https:\/\//);
  assert.match(config.links.support, /^(https:\/\/|mailto:)/);
  assert.doesNotMatch(text, /(github[_-]?token|cloudflare[_-]?api|bearer\s+|gh[pousr]_[A-Za-z0-9_]+)/i);
});
```

- [ ] **Step 2: Run the test and verify the missing-file failure**

Run:

```powershell
node --test tests/dgs-remote-config.test.mjs
```

Expected: FAIL with `ENOENT` for `dgs-config/v1/config.json`.

- [ ] **Step 3: Create the production-shaped disabled configuration**

Create `dgs-config/v1/config.json` with this exact fail-closed content:

```json
{
  "schemaVersion": 1,
  "configVersion": "2026-08-12.1",
  "ttlHours": 12,
  "docsUrl": "https://bekaforge.com/Dialogue%20Graph%20System/index.html",
  "supportUrl": "mailto:bekaforge@gmail.com",
  "feedbackEnabled": false,
  "feedbackEndpoint": "",
  "links": {
    "website": "https://bekaforge.com/",
    "documentation": "https://bekaforge.com/Dialogue%20Graph%20System/index.html",
    "discord": "https://discord.gg/hD8e6WFFWT",
    "support": "mailto:bekaforge@gmail.com",
    "assetStore": "",
    "review": "",
    "changelog": "https://bekaforge.com/Dialogue%20Graph%20System/changelog.html"
  },
  "feedback": {
    "enabled": false,
    "endpoint": "",
    "endpointVersion": "v1",
    "showReportPreview": true,
    "maxStackTraceLength": 6000
  },
  "reviewPrompt": {
    "enabled": false,
    "minEditorSessions": 3,
    "minGraphOpens": 5,
    "minGraphEdits": 10,
    "cooldownDays": 30
  },
  "welcome": {
    "releaseNotes": "",
    "footerText": ""
  }
}
```

- [ ] **Step 4: Run public-config and whole-site tests**

Run:

```powershell
node --test tests/dgs-remote-config.test.mjs
node --test tests/*.test.mjs
node scripts/validate-site.mjs
```

Expected: all Node tests pass with nonzero totals and validator prints `SITE_VALIDATION_OK`.

- [ ] **Step 5: Commit only the config and its test**

```powershell
git add -- dgs-config/v1/config.json tests/dgs-remote-config.test.mjs
git diff --cached --check
git commit -m "feat: publish fail-closed DGS remote config"
```

Expected: exactly two files in the commit; screenshot changes remain unstaged.

---

### Task 2: Build strict validation and recursive privacy redaction

**Files:**

- Create: `services/dgs-feedback/package.json`
- Create: `services/dgs-feedback/package-lock.json`
- Create: `services/dgs-feedback/tsconfig.json`
- Create: `services/dgs-feedback/src/types.ts`
- Create: `services/dgs-feedback/src/redaction.ts`
- Create: `services/dgs-feedback/src/contract.ts`
- Create: `services/dgs-feedback/test/fixtures/valid-report.ts`
- Create: `services/dgs-feedback/test/redaction.test.ts`
- Create: `services/dgs-feedback/test/contract.test.ts`

**Interfaces:**

- Produces: `validateReport(value: unknown): DgsFeedbackPayload`, `redactValue(value: unknown, key?: string): unknown`, `PublicError`, `DgsFeedbackPayload`, `StoredReportEnvelope`, and `MAX_BODY_BYTES`.

- [ ] **Step 1: Create the isolated Worker toolchain**

Create `package.json` with exact scripts and pinned development dependencies:

```json
{
  "name": "@bekaforge/dgs-feedback",
  "private": true,
  "type": "module",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "node --test test/*.test.ts",
    "check": "npm run typecheck && npm test",
    "deploy": "wrangler deploy"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "5.20260812.1",
    "@types/node": "26.2.0",
    "typescript": "7.0.2",
    "wrangler": "4.121.0"
  }
}
```

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2023", "WebWorker"],
    "types": ["@cloudflare/workers-types", "node"],
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "allowImportingTsExtensions": true
  },
  "include": ["src/**/*.ts", "test/**/*.ts"]
}
```

Run `npm.cmd install` inside `services/dgs-feedback` to create the lockfile.

- [ ] **Step 2: Define exact boundary types**

In `src/types.ts`, define:

```ts
export const MAX_BODY_BYTES = 128 * 1024;

export interface DgsFeedbackPayload {
  schemaVersion: 2;
  source: "dgs-unity-editor";
  receivedAtUtc: string;
  packageName: string;
  packageVersion: string;
  unityVersion: string;
  os: string;
  editorPlatform: string;
  featureName: string;
  failureStage: string;
  providerName: string;
  providerType: string;
  activeGraphName: string;
  activeGraphPath: string;
  sanitizedErrorMessage: string;
  sanitizedStackTrace: string;
  sanitizedReportBody: string;
  diagnostic: Record<string, unknown> | null;
  truncated: boolean;
  truncationReason: string;
  omittedSections: string[];
  configVersion: string;
  feedbackEndpointVersion: string;
  timestampUtc: string;
  anonymousInstallId: string;
  anonymousSessionId: string;
}

export interface StoredReportEnvelope {
  storageSchemaVersion: 1;
  reportId: string;
  receivedAtUtc: string;
  client: DgsFeedbackPayload;
}

export class PublicError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string) {
    super(code);
    this.status = status;
    this.code = code;
  }
}
```

- [ ] **Step 3: Write failing redaction and contract tests**

Use Node's `node:test` and `node:assert/strict`. The fixture must contain every top-level `DialogAiFeedbackPayload` field. Tests must assert:

```ts
test("redaction removes denied diagnostic content recursively", () => {
  const result = redactValue({
    nested: {
      originalUserPrompt: "private dialogue",
      systemPrompt: "secret system text",
      userPrompt: "private request",
      rawResponse: "provider response",
      safe: "Authorization: Bearer abc C:\\Users\\name\\Project developer@example.com"
    }
  }) as Record<string, unknown>;
  const json = JSON.stringify(result);
  assert.doesNotMatch(json, /private dialogue|secret system|private request|provider response|Bearer abc|developer@example.com|C:\\\\Users/);
  assert.match(json, /\[REDACTED_/);
});

test("contract accepts only schema-2 DGS objects", () => {
  assert.equal(validateReport(validReport).schemaVersion, 2);
  assert.throws(() => validateReport({ ...validReport, schemaVersion: 3 }), /invalid_schema/);
  assert.throws(() => validateReport({ ...validReport, source: "browser" }), /invalid_source/);
  assert.throws(() => validateReport({ ...validReport, extra: true }), /unsupported_field/);
});
```

- [ ] **Step 4: Run the tests and verify missing-export failures**

```powershell
node --test test/redaction.test.ts test/contract.test.ts
```

Expected: FAIL because `redactValue` and `validateReport` are not implemented.

- [ ] **Step 5: Implement minimal strict validation and redaction**

In `redaction.ts`, recursively copy arrays/objects, blank the four denied keys, and apply deterministic regex replacements to every string for bearer tokens, `sk-`/`gh*` token forms, credential assignments, email addresses, Windows user paths, and `/Users`, `/home`, `/mnt`, `/tmp`, or `/var` absolute paths.

In `contract.ts`:

- Allow exactly the 25 top-level fields defined by `DgsFeedbackPayload`.
- Require `schemaVersion === 2`, `source === "dgs-unity-editor"`, nonempty `anonymousInstallId`, and correct scalar/array/object types.
- Bound strings by a field-specific map: stack trace 20,000; report body 20,000; error 2,000; graph path/name 160; all other strings 512.
- Bound `omittedSections` to 64 items of 512 characters.
- Accept `diagnostic` only as an object or null.
- Pass the copied payload through `redactValue` and reject the sanitized serialization if it exceeds `MAX_BODY_BYTES`.

- [ ] **Step 6: Run type checking and focused tests**

```powershell
npm.cmd run check
```

Expected: TypeScript succeeds and all focused tests pass with nonzero totals.

- [ ] **Step 7: Commit the contract slice**

```powershell
git add -- services/dgs-feedback/package.json services/dgs-feedback/package-lock.json services/dgs-feedback/tsconfig.json services/dgs-feedback/src/types.ts services/dgs-feedback/src/redaction.ts services/dgs-feedback/src/contract.ts services/dgs-feedback/test/fixtures/valid-report.ts services/dgs-feedback/test/redaction.test.ts services/dgs-feedback/test/contract.test.ts
git diff --cached --check
git commit -m "feat: validate and redact DGS feedback payloads"
```

---

### Task 3: Store one immutable report file through GitHub

**Files:**

- Create: `services/dgs-feedback/src/github-store.ts`
- Create: `services/dgs-feedback/test/github-store.test.ts`

**Interfaces:**

- Consumes: `DgsFeedbackPayload`, `StoredReportEnvelope`, `PublicError`.
- Produces: `storeReport(payload, config, dependencies): Promise<{ reportId: string; path: string }>`.

- [ ] **Step 1: Write failing GitHub storage tests**

Define a fake fetch that captures URL, headers, and JSON body. Assert a successful call:

```ts
const result = await storeReport(validReport, {
  owner: "arjanbekaa",
  repo: "dgs-ai-reports",
  branch: "main",
  token: "test-token"
}, {
  fetch: fakeFetchReturning(201),
  now: () => new Date("2026-08-12T14:30:52.000Z"),
  randomBytes: () => Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8]),
  sleep: async () => {}
});

assert.equal(result.reportId, "dgs_0102030405060708");
assert.equal(result.path, "reports/2026/08/12/20260812T143052Z-dgs_0102030405060708.json");
assert.match(captured.url, /repos\/arjanbekaa\/dgs-ai-reports\/contents\/reports\/2026/);
assert.equal(captured.headers.authorization, "Bearer test-token");
```

Also assert the decoded Base64 content is the server envelope, transient `409`, `429`, and `5xx` retry at most twice, `401`/`403` do not retry, and public errors never contain the token or GitHub body.

- [ ] **Step 2: Run the focused test and verify failure**

```powershell
node --test test/github-store.test.ts
```

Expected: FAIL because `storeReport` does not exist.

- [ ] **Step 3: Implement report ID, envelope, path, encoding, and retries**

Implement `storeReport` with these exact rules:

```ts
export interface GitHubStoreConfig {
  owner: string;
  repo: string;
  branch: string;
  token: string;
}

export interface StoreDependencies {
  fetch: typeof fetch;
  now: () => Date;
  randomBytes: (length: number) => Uint8Array;
  sleep: (milliseconds: number) => Promise<void>;
}
```

- Generate `dgs_` plus 16 lowercase hex digits.
- Build a UTC path with slash-separated year/month/day and compact ISO timestamp.
- Serialize the envelope with two-space indentation and a trailing newline.
- Encode each report-path segment independently, preserve `/` separators, and PUT to `https://api.github.com/repos/{owner}/{repo}/contents/{path}` with GitHub JSON accept/version headers, bearer authorization, commit message `report: store {reportId}`, Base64 content, and branch.
- Return only on HTTP `201`.
- Retry status `409`, `429`, and `500`-`599` after 100 ms then 250 ms.
- Retry `422` once with a new ID/path, then fail.
- Map missing config to `503 storage_unavailable` and exhausted/upstream failures to `502 storage_unavailable`.
- Never include response bodies, URLs containing private paths, or tokens in thrown public errors.

- [ ] **Step 4: Run the Worker checks**

```powershell
npm.cmd run check
```

Expected: all contract, redaction, and GitHub storage tests pass.

- [ ] **Step 5: Commit the GitHub storage slice**

```powershell
git add -- services/dgs-feedback/src/github-store.ts services/dgs-feedback/test/github-store.test.ts
git diff --cached --check
git commit -m "feat: store private DGS reports in GitHub"
```

---

### Task 4: Add the write-only Worker routes and rate limit

**Files:**

- Create: `services/dgs-feedback/src/index.ts`
- Create: `services/dgs-feedback/test/worker.test.ts`
- Create: `services/dgs-feedback/wrangler.jsonc`

**Interfaces:**

- Consumes: `validateReport`, `storeReport`, `MAX_BODY_BYTES`, Worker environment bindings.
- Produces: default `ExportedHandler<Env>` and `createHandler(dependencies)` test seam.

- [ ] **Step 1: Write failing HTTP-boundary tests**

Use `createHandler` with fake storage/fetch and a fake rate limiter. Cover:

```ts
test("valid report is rate-limited then stored exactly once", async () => {
  const response = await handler.fetch(new Request("https://worker.test/v1/reports", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(validReport)
  }), env, executionContext);

  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { ok: true, reportId: "dgs_0102030405060708" });
  assert.deepEqual(rateLimitKeys, [validReport.anonymousInstallId]);
  assert.equal(githubCalls.length, 1);
});
```

Add cases for `/health`, unknown route, GET/PUT on report route, wrong content type, declared and actual oversized bodies, invalid JSON, invalid contract, missing secret/config, rate-limit denial, and GitHub error mapping. Assert every failure before storage produces zero GitHub calls. Assert no response has `Access-Control-Allow-Credentials: true`.

- [ ] **Step 2: Run the Worker test and verify failure**

```powershell
node --test test/worker.test.ts
```

Expected: FAIL because the handler is not implemented.

- [ ] **Step 3: Implement the handler**

Define the environment exactly:

```ts
interface Env {
  GITHUB_REPORTS_TOKEN: string;
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
  GITHUB_BRANCH: string;
  REPORT_RATE_LIMITER: RateLimit;
}
```

Handler order:

1. `GET /health` returns `{ "ok": true, "service": "dgs-feedback", "version": "v1" }`.
2. Unknown paths return `404 not_found`.
3. Non-POST report methods return `405 method_not_allowed` with `Allow: POST`.
4. Reject non-JSON content type with `415 unsupported_media_type`.
5. Reject declared length above 131072 before reading.
6. Read `arrayBuffer`, reject actual length above 131072, decode UTF-8, parse JSON.
7. Call `validateReport`.
8. Call `REPORT_RATE_LIMITER.limit({ key: payload.anonymousInstallId })`; on denial return `429 rate_limited` and `Retry-After: 60`.
9. Call `storeReport` with environment target and secret.
10. Return `201` with only `ok` and `reportId`.
11. Map `PublicError` to its stable status/code; map all other errors to `500 internal_error` without logging submitted data.

The default dependency clock uses `new Date()`, randomness uses `crypto.getRandomValues`, fetch uses global `fetch`, and sleep uses `scheduler.wait` or a Promise timer compatible with Workers.

- [ ] **Step 4: Add deploy configuration**

Create `wrangler.jsonc`:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "dgs-feedback-ingest",
  "main": "src/index.ts",
  "compatibility_date": "2026-08-12",
  "workers_dev": true,
  "observability": { "enabled": true, "head_sampling_rate": 0.1 },
  "vars": {
    "GITHUB_OWNER": "arjanbekaa",
    "GITHUB_REPO": "dgs-ai-reports",
    "GITHUB_BRANCH": "main"
  },
  "ratelimits": [
    {
      "name": "REPORT_RATE_LIMITER",
      "namespace_id": "38448201",
      "simple": { "limit": 5, "period": 60 }
    }
  ]
}
```

Do not place `GITHUB_REPORTS_TOKEN` in this file.

- [ ] **Step 5: Run focused and complete Worker checks**

```powershell
npm.cmd run check
npx.cmd wrangler deploy --dry-run
```

Expected: all tests/type checking pass; dry run bundles successfully and lists `GITHUB_REPORTS_TOKEN` as an unresolved secret rather than embedding a value.

- [ ] **Step 6: Commit the HTTP Worker slice**

```powershell
git add -- services/dgs-feedback/src/index.ts services/dgs-feedback/test/worker.test.ts services/dgs-feedback/wrangler.jsonc
git diff --cached --check
git commit -m "feat: add write-only DGS feedback worker"
```

---

### Task 5: Add operations documentation and safe live verifier

**Files:**

- Create: `services/dgs-feedback/README.md`
- Create: `scripts/verify-dgs-feedback-live.mjs`
- Create: `tests/dgs-feedback-live-script.test.mjs`

**Interfaces:**

- Produces: a token-free command-line verifier consuming `DGS_REPORT_ENDPOINT` and optionally `DGS_SEND_SYNTHETIC=1`.

- [ ] **Step 1: Write the failing verifier contract test**

Test the script as a child process against a local HTTP server. The test must prove health and invalid checks run by default, synthetic valid submission requires the explicit environment flag, responses never print submitted payloads, and a non-2xx result exits nonzero.

```js
const result = spawnSync(process.execPath, ["scripts/verify-dgs-feedback-live.mjs"], {
  cwd: repositoryRoot,
  env: { ...process.env, DGS_REPORT_ENDPOINT: localEndpoint },
  encoding: "utf8"
});
assert.equal(result.status, 0, result.stderr);
assert.match(result.stdout, /DGS_FEEDBACK_LIVE_HEALTH_OK/);
assert.match(result.stdout, /DGS_FEEDBACK_LIVE_INVALID_REJECTED/);
assert.doesNotMatch(result.stdout, /anonymousInstallId|sanitizedErrorMessage/);
```

- [ ] **Step 2: Run the contract test and verify failure**

```powershell
node --test tests/dgs-feedback-live-script.test.mjs
```

Expected: FAIL because the verifier script is missing.

- [ ] **Step 3: Implement the live verifier**

The script must:

- Require an HTTPS `DGS_REPORT_ENDPOINT` outside loopback tests.
- Derive `/health` from the endpoint origin.
- Verify health returns `200` and the exact service/version fields.
- POST `{}` and require `400 invalid_schema`.
- When `DGS_SEND_SYNTHETIC=1`, submit a complete schema-2 fixture containing only synthetic values and require `201` plus a `dgs_` report ID.
- Print only stable success markers and the returned report ID.
- Never accept a GitHub token argument or environment variable.

- [ ] **Step 4: Document exact owner operations**

`services/dgs-feedback/README.md` must document:

- `npm.cmd install`, `npm.cmd run check`, and dry-run commands.
- Private repository name and one-file-per-report path.
- Fine-grained token scope: selected repository only, `Contents: write`, explicit expiry.
- `npx.cmd wrangler secret put GITHUB_REPORTS_TOKEN` interactive installation.
- `npx.cmd wrangler deploy` deployment and recording its HTTPS endpoint.
- Health, invalid, and explicit synthetic verifier commands.
- Remote-config activation only after private-file inspection.
- Rollback by disabling both config flags and incrementing `configVersion`.
- Token rotation before expiry and immediate revocation procedure.
- Clear warning never to paste credentials into source, chat, logs, or command arguments.

- [ ] **Step 5: Run all public and Worker verification**

```powershell
node --test tests/*.test.mjs
node scripts/validate-site.mjs
Set-Location services/dgs-feedback
npm.cmd run check
npx.cmd wrangler deploy --dry-run
```

Expected: all tests have nonzero totals and zero failures; site validator succeeds; Worker dry run bundles.

- [ ] **Step 6: Commit the operations slice**

```powershell
git add -- services/dgs-feedback/README.md scripts/verify-dgs-feedback-live.mjs tests/dgs-feedback-live-script.test.mjs
git diff --cached --check
git commit -m "docs: add DGS feedback deployment runbook"
```

---

### Task 6: Create the private repository and deploy the disabled backend

**Files:**

- Create in private repository: `README.md`
- Create in private repository: `reports/.gitkeep`
- No public configuration activation yet.

**Interfaces:**

- Consumes: GitHub owner session, Cloudflare owner session, tested Worker source.
- Produces: confirmed-private `arjanbekaa/dgs-ai-reports`, installed Worker secret, deployed HTTPS Worker URL.

- [ ] **Step 1: Create and verify the private repository**

Using the authenticated GitHub owner session, create `arjanbekaa/dgs-ai-reports` with visibility **Private**, no Pages site, and default branch `main`. Add a private README describing the storage envelope and manual retention/deletion policy plus `reports/.gitkeep`.

Verify in repository Settings that visibility reads **Private**. From an unauthenticated GitHub API request, verify `GET https://api.github.com/repos/arjanbekaa/dgs-ai-reports` does not return repository content.

- [ ] **Step 2: Create the least-privilege GitHub credential**

In GitHub Settings > Developer settings > Personal access tokens > Fine-grained tokens:

- Resource owner: `arjanbekaa`.
- Repository access: only `dgs-ai-reports`.
- Repository permission: `Contents: Read and write`; all configurable unrelated permissions remain `No access`.
- Expiration: 90 days or the shortest practical owner-approved interval.

Do not expose the generated value to logs, source files, shell arguments, or chat.

- [ ] **Step 3: Authenticate Wrangler and install the secret interactively**

From `services/dgs-feedback`:

```powershell
npx.cmd wrangler login
npx.cmd wrangler secret put GITHUB_REPORTS_TOKEN
```

Expected: browser login succeeds; secret input is interactive and Wrangler confirms secret creation without echoing its value.

- [ ] **Step 4: Deploy the Worker while public DGS feedback remains disabled**

```powershell
npx.cmd wrangler deploy
```

Expected: deployment succeeds for `dgs-feedback-ingest`, returns an HTTPS `workers.dev` URL, and lists the rate-limit binding plus non-secret GitHub target variables.

- [ ] **Step 5: Run live health, rejection, and one explicit synthetic write**

Set `DGS_REPORT_ENDPOINT` to the deployed `/v1/reports` URL in the current process, then run:

```powershell
node scripts/verify-dgs-feedback-live.mjs
$env:DGS_SEND_SYNTHETIC = "1"
node scripts/verify-dgs-feedback-live.mjs
Remove-Item Env:\DGS_SEND_SYNTHETIC
```

Expected: health and invalid markers succeed; the explicit synthetic run returns one report ID.

- [ ] **Step 6: Verify private storage and absence of public access**

In the authenticated private repository:

- Confirm exactly one new dated JSON file matches the returned report ID.
- Confirm its envelope is schema 1, client payload is schema 2, server time is present, high-risk fields are empty, and no credential/path/email test values remain.
- Confirm commit message is `report: store {reportId}`.

Repeat the report-file API request unauthenticated and verify it does not return file content. Confirm the Worker has no read/list route.

---

### Task 7: Activate public configuration and prove Unity behavior

**Files:**

- Modify: `dgs-config/v1/config.json`
- Modify: `tests/dgs-remote-config.test.mjs`

**Interfaces:**

- Consumes: verified deployed Worker HTTPS endpoint and private-storage proof.
- Produces: live DGS endpoint discovery with rollback switch and end-to-end Unity evidence.

- [ ] **Step 1: Change the public-config test to the activated contract**

Replace the fail-closed assertions with:

```js
assert.equal(config.feedbackEnabled, true);
assert.equal(config.feedback.enabled, true);
assert.equal(config.feedbackEndpoint, config.feedback.endpoint);
assert.match(config.feedback.endpoint, /^https:\/\/[a-z0-9.-]+\.workers\.dev\/v1\/reports$/);
assert.equal(config.configVersion, "2026-08-12.2");
```

- [ ] **Step 2: Run the test and verify it fails against disabled config**

```powershell
node --test tests/dgs-remote-config.test.mjs
```

Expected: FAIL because both feedback flags are false and the endpoint is empty.

- [ ] **Step 3: Activate the exact deployed endpoint**

Edit only these values in `dgs-config/v1/config.json`:

- `configVersion`: `2026-08-12.2`.
- `feedbackEnabled`: `true`.
- `feedbackEndpoint`: exact deployed HTTPS `/v1/reports` URL.
- `feedback.enabled`: `true`.
- `feedback.endpoint`: the same exact deployed URL.

- [ ] **Step 4: Run full verification and credential scans**

```powershell
node --test tests/*.test.mjs
node scripts/validate-site.mjs
Set-Location services/dgs-feedback
npm.cmd run check
npx.cmd wrangler deploy --dry-run
Set-Location ../..
rg -n -i "(gh[pousr]_[A-Za-z0-9_]{20,}|github_reports_token\s*[:=]\s*[^A-Z]|cloudflare_api_token\s*[:=]\s*[^A-Z]|authorization:\s*bearer\s+[A-Za-z0-9])" dgs-config services scripts tests
```

Expected: all tests and validation succeed, dry run bundles, and secret scan has zero matches.

- [ ] **Step 5: Commit and push only implementation files**

```powershell
git add -- dgs-config/v1/config.json tests/dgs-remote-config.test.mjs
git diff --cached --check
git commit -m "feat: activate private DGS feedback reporting"
git push origin codex/website-3.0-launch
```

Expected: push succeeds without force; unrelated screenshot changes remain uncommitted.

- [ ] **Step 6: Verify GitHub Pages serves the exact active config**

Fetch `https://bekaforge.com/dgs-config/v1/config.json` without using a browser cache. Require `200`, JSON content, config version `2026-08-12.2`, both enabled flags true, and the exact Worker endpoint.

- [ ] **Step 7: Prove interactive Unity consent and private storage**

In Unity Editor:

1. Refresh remote configuration and confirm the live config version is loaded.
2. Trigger one eligible feedback prompt.
3. Inspect the JSON preview.
4. Select **Cancel** and prove no HTTP request/file is created.
5. Trigger the prompt again with a distinct eligible failure and select **Send Report**.
6. Require a successful send result.
7. Confirm exactly one additional private JSON file with matching feature/stage metadata.

Do not claim this step from static tests, compilation, Worker health, or synthetic POST evidence.

- [ ] **Step 8: Prove automatic-report opt-in boundaries**

With the local automatic AI Authoring report setting disabled, trigger an eligible failed run and prove no request/file. Then explicitly enable it, trigger one eligible failed run, and prove exactly one additional private file whose denied prompt/raw-response keys are blank. Restore the default disabled setting after the test.

- [ ] **Step 9: Record completion evidence**

Add a dated deployment-evidence section to `services/dgs-feedback/README.md` containing only non-secret facts: public config URL/version, Worker hostname, Worker deployment version, private repository name/visibility, automated test totals, synthetic report ID, Unity consent/no-consent result, automatic-report disabled/enabled result, and credential-scan result. Commit and push that README-only evidence update.

## Completion Audit

Before declaring the goal complete, verify every approved design completion criterion against current evidence:

- Public config path is live and editable from GitHub.
- Worker code/tests/runbook are committed and pushed.
- Private repository visibility is confirmed from authenticated settings and unauthenticated read failure.
- Exactly one JSON file is produced per accepted synthetic or Unity report.
- The Worker secret is installed and absent from source/logs/responses.
- Invalid, oversized, rate-limited, and upstream-failure paths are covered by passing tests.
- Live health, invalid rejection, and synthetic storage pass.
- Unity **Cancel**, **Send Report**, default-disabled automatic reporting, and explicitly enabled automatic reporting are verified separately.
- Public and deployed credential scans are clean.
- Rollback is proven by the two public config flags and version bump procedure.
- AI Extension publication status remains unchanged.
