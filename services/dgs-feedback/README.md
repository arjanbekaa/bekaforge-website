# DGS Feedback Worker

This Cloudflare Worker accepts sanitized Dialogue Graph System feedback and writes one JSON file per accepted report to the private `arjanbekaa/dgs-ai-reports` GitHub repository.

The public Worker has no report-read route. `GET /health` exposes only service status, and `POST /v1/reports` is the only storage route.

## Local verification

From this directory:

```powershell
npm.cmd install
npm.cmd run check
npx.cmd wrangler deploy --dry-run
```

Expected evidence is nonzero tests with zero failures, successful strict type checking, and a Wrangler bundle listing the rate-limit binding plus the non-secret repository target variables.

## Private repository

Create `arjanbekaa/dgs-ai-reports` with **Private** visibility, GitHub Pages disabled, and default branch `main`.

Initial contents:

```text
README.md
reports/.gitkeep
```

Accepted reports use this immutable path convention:

```text
reports/YYYY/MM/DD/YYYYMMDDTHHMMSSZ-dgs_<16-lowercase-hex-digits>.json
```

Each file contains a server-created storage-schema-1 envelope around the validated client-schema-2 payload. Reports remain until the owner explicitly deletes them in the private repository.

## GitHub credential

Create a fine-grained personal access token with:

- Resource owner: `arjanbekaa`
- Repository access: only `dgs-ai-reports`
- Repository permission: `Contents: Read and write`
- All unrelated configurable permissions: `No access`
- Expiration: 90 days or a shorter practical owner-approved interval

Never paste a credential into source, configuration JSON, chat, logs, command arguments, or `.dev.vars`. Install it through Wrangler's interactive secret prompt:

```powershell
npx.cmd wrangler login
npx.cmd wrangler secret put GITHUB_REPORTS_TOKEN
```

The prompt must not echo the value. Confirm secret creation, then clear the clipboard if it was used to transfer the token from GitHub.

## Deploy while DGS feedback remains disabled

Keep both public configuration flags false and both endpoints empty while deploying:

```powershell
npx.cmd wrangler deploy
```

Record the returned HTTPS `workers.dev` origin. The report endpoint is that origin plus `/v1/reports`.

Run health and invalid-request checks without creating a report:

```powershell
$env:DGS_REPORT_ENDPOINT = "https://deployment-host.workers.dev/v1/reports"
node ..\..\scripts\verify-dgs-feedback-live.mjs
```

The `deployment-host.workers.dev` text above is an example command shape; replace it locally with Wrangler's exact returned hostname before execution.

Create one deliberately synthetic report only after the private repository and Worker secret are confirmed:

```powershell
$env:DGS_SEND_SYNTHETIC = "1"
node ..\..\scripts\verify-dgs-feedback-live.mjs
Remove-Item Env:\DGS_SEND_SYNTHETIC
```

The verifier prints only stable result markers and the generated report ID. It never accepts a GitHub token.

## Verify private storage

After the explicit synthetic run:

1. Open the private repository while signed into the owner account.
2. Locate the dated JSON path containing the returned report ID.
3. Confirm `storageSchemaVersion` is `1`, `client.schemaVersion` is `2`, and the server timestamp is present.
4. Confirm `originalUserPrompt`, `systemPrompt`, `userPrompt`, and `rawResponse` are empty wherever present.
5. Confirm the commit message is `report: store <report-id>`.
6. Repeat the report-file API request without authentication and confirm it does not return file content.

## Activate DGS discovery

Only after the live synthetic storage check succeeds, edit `dgs-config/v1/config.json`:

- Increment `configVersion`.
- Set `feedbackEndpoint` and `feedback.endpoint` to the same exact HTTPS `/v1/reports` URL.
- Set `feedbackEnabled` and `feedback.enabled` to `true`.
- Keep `showReportPreview` true.

Commit, push, and verify `https://bekaforge.com/dgs-config/v1/config.json` without browser cache before testing Unity.

## Unity acceptance

- Refresh the DGS remote configuration.
- Trigger an eligible interactive feedback prompt and inspect the preview.
- Select **Cancel** and prove no file is created.
- Trigger a distinct eligible report, select **Send Report**, and prove exactly one private JSON file is created.
- Leave automatic AI Authoring reporting disabled and prove a failed run creates no file.
- Explicitly enable automatic reporting, prove one eligible failed run creates exactly one file, then restore the disabled default.

Static checks or synthetic POST evidence do not replace these Unity consent checks.

## Rollback

Set both `feedbackEnabled` and `feedback.enabled` to `false`, increment `configVersion`, commit, and push. DGS refreshes on demand or after its 12-hour cache lifetime. The Worker may remain deployed while discovery is disabled.

## Token rotation and revocation

Before token expiry:

1. Create a replacement token with the same single-repository `Contents: write` boundary.
2. Install it with `npx.cmd wrangler secret put GITHUB_REPORTS_TOKEN`.
3. Run one explicit synthetic verification and inspect the private file.
4. Revoke the old token immediately.

If exposure is suspected, revoke the token first, disable public feedback discovery, then install and verify a replacement.
