# DGS Private Feedback Ingestion Design

Date: 2026-08-12
Status: Approved architecture; written specification awaiting owner review
Owners: Beka Forge

## Summary

Dialogue Graph System (DGS) already contains an opt-in Unity Editor feedback client and a remotely configurable endpoint. This change supplies the missing public remote-configuration document and a small Cloudflare Worker that accepts sanitized DGS AI failure reports. Each accepted report is written as one JSON file to a dedicated private GitHub repository.

The public website and Unity package never contain a GitHub credential. The Worker is the only component permitted to write to the private repository. The repository remains visible only to its owner and explicitly invited collaborators.

## Goals

- Make the existing DGS remote configuration URL return a valid schema-version-1 document.
- Keep documentation, support, review, and feedback destinations editable through GitHub without rebuilding the Unity package.
- Accept DGS feedback payload schema version 2 over HTTPS.
- Save exactly one immutable JSON file for each accepted report in a private GitHub repository.
- Preserve the existing interactive Unity consent flow, JSON preview, and separately controlled automatic-report opt-in.
- Keep all GitHub credentials and deployment credentials out of Unity, browser assets, source control, responses, and logs.
- Fail closed on malformed, oversized, unsupported, or rate-limited requests.
- Provide tests and a live smoke procedure that prove both storage privacy and end-to-end delivery.

## Non-goals

- A public report browser or administration dashboard.
- Anonymous read access to stored reports.
- Automatically opening public GitHub issues.
- Storing user prompts, dialogue text, graph contents, project files, AI provider keys, GitHub tokens, or Cloudflare credentials.
- Changing AI Extension release status or claiming that the AI Extension is publish-ready.
- Replacing the existing public website/documentation issue forms. Those remain public and separate from private in-product AI failure reports.
- Adding a general-purpose analytics or telemetry platform.

## Existing Client Contract

The existing Unity Editor client is authoritative for the submission contract:

- Remote configuration URL: `https://bekaforge.com/dgs-config/v1/config.json`
- Configuration schema version: `1`
- Cache location: `Library/DialogSystem/RemoteConfigCache.json`
- Default cache lifetime: 12 hours
- Feedback request method: `POST`
- Feedback content type: `application/json`
- Client marker: `X-DGS-Client: DialogGraphSystemEditor`
- Request timeout: 20 seconds
- Feedback payload schema version: `2`
- Interactive consent: no interactive report is sent until the user selects **Send Report**
- Preview: enabled by remote configuration so the user can inspect the JSON before sending
- Automatic AI Authoring reports: controlled by the local `EnableAutoFailureFeedbackReports` setting, disabled by default, and not enabled by remote configuration
- Offline/invalid-config behavior: use the bundled safe fallback, with feedback disabled

The implementation must not silently broaden or bypass this contract.

## Selected Architecture

### 1. Public, GitHub-editable remote configuration

The website repository gains:

`dgs-config/v1/config.json`

GitHub Pages serves that file at the exact URL already compiled into DGS. It contains public URLs and feature switches only. It contains no authentication material.

The initial production document uses the current DGS schema, keeps feedback disabled until live storage verification succeeds, and includes all required sections:

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

The Wrangler deployment output supplies the assigned HTTPS `workers.dev` hostname. That exact hostname is written into both feedback endpoint fields only after live verification. A future `reports.bekaforge.com` custom domain can replace it by editing this one configuration file; no Unity update is required.

The deployment sequence keeps `feedback.enabled` and legacy `feedbackEnabled` false until the Worker, private repository, secret, and live storage test all pass. Enabling feedback is the final activation step.

### 2. Public write-only ingestion endpoint

Worker source lives in the public website repository under:

`services/dgs-feedback/`

The Worker exposes only:

- `POST /v1/reports`: validate, sanitize again, and store one report.
- `GET /health`: return a minimal service/version response without testing or exposing the GitHub credential.

All other paths or methods return `404` or `405`. There is no endpoint to list, fetch, search, update, or delete stored reports.

The Worker may be publicly reachable, but the stored data is not publicly readable. Public reachability is necessary for Unity customers to submit a report; it does not grant access to the private GitHub repository.

### 3. Dedicated private report repository

Create a private repository owned by `arjanbekaa`:

`arjanbekaa/dgs-ai-reports`

Each report is created as a new file on the default branch:

`reports/YYYY/MM/DD/YYYYMMDDTHHMMSSZ-<report-id>.json`

Example:

`reports/2026/08/12/20260812T143052Z-dgs_8c31f0c8bcae.json`

The owner accesses reports by signing into GitHub and opening the private repository. Only the owner and explicitly invited collaborators can read it.

The repository contains a short private README describing the envelope schema, retention process, and deletion procedure. No GitHub Pages site is enabled for this repository.

## Stored Report Format

The Worker saves a server-created envelope rather than treating client timestamps or identifiers as trusted server metadata:

```json
{
  "storageSchemaVersion": 1,
  "reportId": "dgs_8c31f0c8bcae",
  "receivedAtUtc": "2026-08-12T14:30:52.000Z",
  "client": {
    "schemaVersion": 2,
    "source": "dgs-unity-editor",
    "packageName": "Dialogue Graph System",
    "packageVersion": "3.0.0",
    "unityVersion": "2022.3.62f3",
    "featureName": "Graph Authoring",
    "failureStage": "request"
  }
}
```

The `client` object contains the validated DGS payload fields, including its sanitized diagnostic object. The complete schema is derived from `DialogAiFeedbackPayload`; arbitrary top-level fields are rejected.

The server-generated `reportId` uses cryptographically secure random bytes and is not derived from an IP address, installation ID, graph name, user, or machine name. The server-generated `receivedAtUtc` is authoritative. Client-provided timestamps remain inside `client` for diagnostic ordering only.

The Worker does not persist source IP addresses, request headers, user-agent strings, or Cloudflare request identifiers in the report file.

## Validation and Privacy Controls

Every request passes all checks before any GitHub API call:

1. Path is exactly `/v1/reports` and method is `POST`.
2. `Content-Type` is `application/json`.
3. Declared and actual UTF-8 body size are at most 128 KiB.
4. Body is a JSON object, not an array or primitive.
5. `schemaVersion` is exactly `2`.
6. `source` is exactly `dgs-unity-editor`.
7. Required scalar fields have the expected type.
8. String and array counts are bounded to the client contract.
9. Unsupported top-level fields are rejected.
10. High-risk diagnostic keys are blanked before storage: `originalUserPrompt`, `systemPrompt`, `userPrompt`, and `rawResponse`.
11. All stored strings receive a second server-side redaction pass for bearer tokens, common API-key formats, email addresses, Windows and Unix absolute paths, and obvious credential assignments.
12. The sanitized result is serialized again and must still be no larger than 128 KiB.

The server-side pass is defense in depth. It does not replace the Unity sanitizer, interactive consent preview, or local automatic-report setting. If the user explicitly enables automatic AI Authoring reports, the request may be sent without a per-failure prompt, but the Worker still removes the high-risk diagnostic fields listed above.

The Worker never logs the request body, stored envelope, GitHub token, or GitHub response body. Operational logs may include only the generated report ID, status class, validation error code, and request duration.

## Abuse Protection

A Cloudflare Workers Rate Limiting binding applies before GitHub storage:

- 5 accepted or attempted submissions per 10 minutes per source IP.
- The source IP is used only as the transient rate-limit key and is not persisted by application code.
- Rate-limited requests return `429` with `Retry-After`.
- The Worker never accepts browser credentials and returns no permissive credentialed CORS headers.

The 128 KiB body cap, strict schema, route restriction, and rate limit bound both GitHub commit noise and Worker/GitHub API consumption.

## GitHub Authentication

The first production version uses one fine-grained personal access token because this is a single-owner, single-repository integration. The token is:

- Owned by the repository owner.
- Restricted to only `arjanbekaa/dgs-ai-reports`.
- Granted only repository `Contents: write` and the automatically required metadata read access.
- Given an explicit expiration date and rotated before expiration.
- Stored only as the Cloudflare Worker secret `GITHUB_REPORTS_TOKEN`.

Non-secret Worker variables identify `GITHUB_OWNER`, `GITHUB_REPO`, and `GITHUB_BRANCH`.

The token is never committed, placed in `.dev.vars`, copied into the remote configuration, returned by the Worker, printed by tests, or sent to Unity. Local tests use a fake token and a mocked GitHub API.

A GitHub App can replace the fine-grained token later if multiple owners, organizations, or higher-scale automation require it. That expansion is outside this V1.

## GitHub Write Behavior

For every accepted report, the Worker calls GitHub's create-file Contents API with:

- A unique report path.
- Base64-encoded stored-envelope JSON.
- Commit message `report: store <report-id>`.
- The configured default branch.

Successful GitHub creation returns HTTP `201`. The Worker maps that to:

```json
{
  "ok": true,
  "reportId": "dgs_8c31f0c8bcae"
}
```

The Worker retries GitHub `409`, `429`, and transient `5xx` responses at most twice with short jittered backoff. It does not retry authentication or validation failures. Because every path is unique, an existing-file response is treated as an internal collision and retried once with a new report ID.

## Error Contract

Responses are JSON and contain no submitted content or upstream secret details:

- `201`: stored successfully; returns `ok` and `reportId`.
- `400`: malformed JSON or invalid schema.
- `404`: unknown route.
- `405`: unsupported method.
- `413`: request or sanitized result exceeds 128 KiB.
- `415`: unsupported content type.
- `429`: rate limited.
- `502`: GitHub storage temporarily failed.
- `503`: server configuration or secret is unavailable.

Error bodies use a stable public code such as `invalid_schema`, `payload_too_large`, `rate_limited`, or `storage_unavailable`. Internal GitHub errors are not forwarded.

DGS already treats non-success HTTP results as a failed send and does not crash or mutate project content. No local retry queue is added in this change.

## Repository and Deployment Layout

Public website repository additions:

```text
dgs-config/
  v1/
    config.json
services/
  dgs-feedback/
    package.json
    package-lock.json
    tsconfig.json
    wrangler.jsonc
    src/
      index.ts
      contract.ts
      redaction.ts
      github-store.ts
    test/
      fixtures/
      worker.test.ts
      contract.test.ts
      redaction.test.ts
    README.md
tests/
  dgs-remote-config.test.mjs
```

The existing GitHub Pages deployment publishes `dgs-config/v1/config.json`. Worker deployment is independent and uses Wrangler from `services/dgs-feedback`.

Private report repository initial content:

```text
README.md
reports/
  .gitkeep
```

## Test Strategy

### Static website/config tests

- The exact remote-config path exists.
- JSON parses and `schemaVersion` is `1`.
- Required `links`, `feedback`, and `reviewPrompt` sections exist.
- Both legacy and nested feedback fields agree.
- All production URLs use allowed HTTPS or mailto schemes.
- No token-like values occur in public config or Worker source.

### Worker unit tests

- Valid DGS schema-2 fixture produces one GitHub create-file request and `201`.
- Saved path follows the dated one-file-per-report convention.
- Stored envelope uses a server timestamp and random report ID.
- Invalid method, route, content type, JSON, source, schema, field type, and size fail before storage.
- High-risk diagnostic keys are blanked.
- Tokens, emails, and absolute paths are redacted recursively.
- Request bodies and secrets are absent from logs and responses.
- Rate-limited requests return `429` and never call GitHub.
- GitHub authentication errors, transient failures, collisions, and retry exhaustion map to the documented public errors.
- GitHub request permissions are limited to creating the report file; no issue, workflow, delete, or repository-administration API is used.

### Unity contract tests

- Existing remote-config tests accept the production-shaped config.
- Existing feedback tests prove opt-in send, cancel, do-not-ask-again, sanitizer behavior, HTTPS enforcement, timeout handling, and no-throw failures.
- Existing AI Authoring tests prove automatic reporting is disabled by default and can run only after the user enables its local setting.
- Add or update only narrow contract fixtures if the production endpoint reveals a contract mismatch; do not change the payload or consent behavior unnecessarily.

### Live acceptance

Activation requires all of the following evidence:

1. `https://bekaforge.com/dgs-config/v1/config.json` returns `200`, valid JSON, and the intended cache headers.
2. Worker `/health` returns `200` without exposing secret or repository information.
3. Invalid and oversized live submissions are rejected with the documented status and create no report.
4. One valid synthetic schema-2 fixture returns `201` and a report ID.
5. The matching JSON file exists in the private repository at the dated path and matches the sanitized envelope.
6. An unauthenticated GitHub API request cannot read the private report file.
7. A Unity Editor submission made by pressing **Send Report** succeeds and creates exactly one additional private JSON file.
8. Cancelling the Unity prompt creates no request and no file.
9. With automatic failure reports left at their default disabled setting, an AI Authoring failure creates no request and no file.
10. With the local automatic-report setting explicitly enabled, one eligible failed AI Authoring run creates exactly one additional private JSON file without storing denied high-risk fields.
11. Public repository and deployed-asset scans find no GitHub or Cloudflare credential.

Unit tests, static source inspection, or a successful Worker deployment do not substitute for the live storage and Unity consent checks.

## Activation, Rollback, and Operations

Activation order:

1. Merge/publish the public remote-config file with feedback disabled.
2. Create the private report repository.
3. Create and install the restricted GitHub token as a Worker secret.
4. Deploy the Worker and run all live invalid/valid storage checks.
5. Run the consented Unity submission check.
6. Update `configVersion`, endpoint, and both feedback-enabled fields in the public config.
7. Verify the live config after GitHub Pages deployment.

Immediate rollback requires only setting both `feedbackEnabled` and `feedback.enabled` to `false` and incrementing `configVersion`. Existing DGS clients pick up the change on refresh or after the 12-hour cache lifetime. The Worker can remain deployed while disabled or be removed separately.

Token rotation does not require a website or Unity change. Install the replacement Worker secret, verify a synthetic report, then revoke the old token.

Reports are retained until the owner deletes them. Deletion is an explicit owner action in the private repository and is not exposed through the Worker.

## Completion Criteria

This feature is ready only when:

- Public config, Worker source, tests, and operations documentation are committed and pushed.
- The report repository is confirmed private.
- The restricted token exists only in the Worker secret store.
- Automated tests pass with nonzero totals.
- Live configuration and Worker checks pass.
- Both synthetic and Unity-consented reports are proven as private one-file-per-report entries.
- Cancel/no-consent behavior and the default-disabled automatic-report setting are proven to create no report.
- Credential scans are clean.
- Feedback can be disabled through the public config without rebuilding DGS.

Until the live checks succeed, the public remote configuration must keep feedback disabled.
