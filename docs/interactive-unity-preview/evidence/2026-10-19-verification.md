# Interactive Unity preview — verification record (2026-10-19)

Pinned source: `DialogueGraphSystem` @ `codex/dgs-4.0-final` `5fb59bc4`, Unity `6000.3.6f1`.
Coverage ledger: `assets/unity-preview/data/coverage.json` (79 source files, 8 windows).

## Commands run and results

| Check | Command | Result |
|---|---|---|
| Preview JS syntax | `node --check` per module plus ESM import load of every `assets/unity-preview/**/*.js` | `JS_ALL_OK`; `PREVIEW_MODULES_IMPORT_OK` (app.js expects a browser window) |
| Site validator | `node scripts/validate-site.mjs` | `SITE_VALIDATION_OK` (75 HTML files, 791 literal references, 45 resource bindings) |
| Existing site tests | `node --test tests/site-launch.test.mjs` | 11 pass, 0 fail |
| Preview tests | `node --test tests/unity-preview.test.mjs` | 10 pass, 0 fail |
| Source drift | `node scripts/check-unity-preview-sources.mjs` | `UNITY_PREVIEW_DRIFT_OK` (79/79 files match hashes) |
| Browser render | `node scripts/check-unity-preview-render.mjs` | `UNITY_PREVIEW_BROWSER_OK` (48/48 targets, headless Chrome 155.0.8059.80) |

The preview test suite includes a micro-DOM render smoke test: every window renders
every exported surface plus its default surface without exceptions, and surface modules
are rejected if they call `fetch`, `XMLHttpRequest`, `WebSocket`, `localStorage`,
`sessionStorage`, or `document.cookie`.

## Browser rendering (attempted and observed)

`scripts/check-unity-preview-render.mjs` serves the site root locally, loads each target
in headless Chrome, asserts the fallback error text never renders, asserts a per-target
sentinel, and writes a PNG into `docs/interactive-unity-preview/evidence/screenshots/`.
Render targets cover all eight windows, the embed shell, the camera, interaction, and
AI assistant additions (all nine `dgs-ai` surfaces), the eleven `dgs-dialogs`
dialog/window surfaces (welcome, public information, four create-asset modes, validation
panel, rewrite preview, save graph, import preview, add language, translation choice,
localization import/export, AI model picker), the duplicate AI profile utility, both
`sound` graph states (attached strip and detached window), the Home inline create row and
the Graphs toolbar, three narrow (380 px) cases, the tutorial embed pilot at 1440 and 768 px, and four
rollout pages (Graph Editor, AI Authoring guide, Creating a Dialog guide, AI Providers
home) that each carry at least one embedded preview. All 48 targets rendered without the
fallback
error and produced non-trivial screenshots. Screenshots were visually reviewed for the
DGS home, Text settings, themes workbench, the 380 px variable inspector, the
Interactable, Interactor, and Camera Controller Manager inspectors, the DGS AI
Assistant surfaces (including the expanded activity panel and the apply-blocker overlay
states), and the `dgs-dialogs` slice; defects found and fixed during review: a
"Create & Open" button wrap in `preview.css`, fabricated "Recommended:" readouts in the
Interactor surface (`inspectors.js`), unused imports and a missing `sectionTitle` import
in `ai-panel.js`, the graph plan preview's Cancel/Apply actions being buried inside the
scroll region instead of a fixed footer (`ai-panel.js`), jammed metadata labels plus a
clipped activity card in the authoring activity overlay (`ai-panel.css`), toggle rows
inside the localization import/export dialog losing their check state (moved to
`checkbox` rows), and Add Language / model picker search filters rebuilding the surface
and dropping focus (changed to local DOM filtering).

This upgrades browser behavior evidence from NOT OBSERVED to headless-render OBSERVED for
the listed targets. It is still not a comparison against native Unity captures.

## H2 full-preview review (interaction, accessibility, source honesty)

The H2 review ran as three passes: an interaction/accessibility audit over every module
and the rendered micro-DOM, a rendered-visual audit at 1440/1024/768/380/320 px, and a
source-honesty re-check of the preview docs against the implementation. Every finding was
fixed in place; the fix rules were: no dead clicks (excluded behavior answers with an
explicit demo toast), no rerender from text input `oninput` (focus/caret preservation),
and no new network/storage/serialization calls.

Fixes applied:

- Keystroke rerenders removed: text fields in `definitions.js`, `inspectors.js`,
  `themes.js`, `banter.js`, `sound.js`, `production.js`, `dgs-dialogs.js`, `ai-providers.js`,
  and `ai-panel.js` now persist on change into runtime state keys (wiped cleanly by
  `resetDemo`) instead of rebuilding the surface per keypress.
- `dgs-dialogs.js`: every dialog footer action is wired (create asset, rewrite preview,
  save graph, import preview, add language, translation, model picker, cancel/close);
  translation choice cards are selectable with `aria-pressed`; localization IO source-graph
  enum, export/import paths, browse buttons, export action, and both import override
  checkboxes are stateful; Welcome and Public Information links show the real URL text in a
  demo toast instead of navigating.
- `ai-providers.js`: the duplicate-profile dialog Cancel/Duplicate profile buttons respond
  and close, Escape/focus binding is applied, the toolbar `Duplicate…` entry opens the
  dialog, `Edit Manually`, `Create profile`, and request-timeout persistence are wired.
- `ai-panel.js`: apply-blocker Dismiss/Retry, draft option add/remove, deadline gear, and
  draft field persistence are wired; the drag affordance tooltip now says panel position is
  fixed in the preview rather than implying a working drag.
- Other surfaces: Action ID persistence (`definitions.js`), Cancel/Apply type
  (`inspectors.js`), description and state chips (`themes.js`), ping actions
  (`banter.js`), seek/automation/mute-solo with `aria-pressed` (`sound.js`), import
  validation (`production.js`), canvas nodes as keyboard-focusable `role="button"`
  elements plus full-text titles (`nodes.js`), node-gallery tab bar routing to the real
  tabs and Home graph search filtering rows locally (`dgs.js`).
- Accessibility: labels are bound with `for`/`id`, toggle rows carry `aria-label`, the tab
  strip is a `tablist`, overlays are `role="dialog"` with Escape close and initial focus
  (`bindOverlay` in `controls.js`), `messageBox` has a working default OK, and
  `:focus-visible` outlines cover buttons, tabs, chips, rows, cards, and canvas nodes.
- Responsive: Home grid children get `min-width: 0` and helper text wraps long paths;
  toggle/checkbox rows stay inline at ≤900 px; toolbar groups and selects can shrink. A
  focused headless overflow check reports `overflow=0` for dgs-home@1024/768,
  inspectors-interactor@320, dgs-ai@768, sound@380, and ai-providers@768.

Accepted residual (reviewed, not a defect): the tutorial page at 768 px wraps a long
inline asset path mid-token using the existing site wrapping rules; nothing is clipped and
no overflow occurs. Unity native capture comparison remains NOT OBSERVED.

Coverage and drift are unchanged by this review (79/79 source files; 44/44 render targets
at the time of the H2 review, 48/48 after the I3 rollout targets were added); visual
acceptance is recorded here separately from the coverage ledger, and the
new explanatory toast strings are EXAMPLE ONLY additions — no existing verbatim string was
altered.

## Evidence classification

| Item | Status |
|---|---|
| Strings, labels, control names, help texts | VERBATIM from pinned source |
| Layout and control geometry as seen in Unity | APPROXIMATE browser recreation |
| Browser rendering of the listed targets | OBSERVED (headless Chrome 155, screenshots in `evidence/screenshots/`) |
| Unity screenshots vs browser rendering | NOT OBSERVED (no paired native captures) |
| Native Unity interaction behavior | NOT OBSERVED (example interactions only) |
| Audio output, provider contact, asset writes | NOT IMPLEMENTED by design |

## Window coverage

| Window | Entries | Notes |
|---|---|---|
| `dgs` | 14 | Shell, graph editor example, node gallery (20 NodeKind values), definitions, production, project health, 8 settings categories incl. recovery demo |
| `ai-providers` | 5 | Setup, profiles, prompt defaults, About, duplicate AI profile utility; fictitious values only |
| `banter` | 3 | Getting Started, Catalog Validation, Decision Debugger |
| `sound` | 5 | Sequencer, spatial binding, inspectors, graph-attached sound strip, detached sound window |
| `themes` | 3 | Workbench, layout families, catalog |
| `inspectors` | 8 | Dialogue Node, Variable Definition, Dialogue Variable Store, DGS asset header, Camera Controller Manager, Camera Rig & Target, Interactable, Interactor |
| `dgs-ai` | 9 | Floating AI Assistant panel (chrome, command form, missing-extension ad), AI draft preview window (dialog nodes / choice node / action node modes), translation preview, batch rewrite preview, dialog flow draft preview, character banter review, character fill review, graph operation plan preview (overview tiles, operation cards, warnings, blocked operations, partial-apply gate), authoring activity overlay (edge notification, activity panel, stage timeline, decision card, apply-blocker overlay) |
| `dgs-dialogs` | 11 | Welcome, public information, create asset (character / action / environment / scene context), validation panel, rewrite preview, save graph, import preview, add language, translation choice, localization import/export, AI model picker |

## Tutorial embedding (I1–I3)

The embed entry (`assets/unity-preview/embed.html` and the `?embed=1` query on both
product preview entries) renders the same surface modules without the website toolbar and
evidence note. The I2 pilot lives in `Dialogue Graph System/modules/settings-system.html`
and links to the full preview.

The I3 rollout adds 16 embeds across 12 pages, all using the same renderers:

| Page | Embedded surfaces |
|---|---|
| `Dialogue Graph System/modules/settings-system.html` (pilot) | `dgs/settings-text` |
| `Dialogue Graph System/modules/graph-editor.html` | `dgs/graph-editor`, `dgs/node-gallery` |
| `Dialogue Graph System/modules/import-export.html` | `dgs/production` |
| `Dialogue Graph System/guides/ai-generation-workflow.html` | `dgs-ai/floating-panel`, `dgs-ai/plan-preview` |
| `Dialogue Graph System/guides/creating-a-dialog.html` | `dgs/home`, `dgs-dialogs/validation-panel` |
| `Dialogue Graph System/guides/integrating-actions.html` | `dgs/definitions`, `dgs/graph-editor` |
| `Dialogue Graph System/guides/banter-setup.html` | `banter/decisions` |
| `Dialogue Graph System/guides/walla-setup.html` | `sound/sequencer` |
| `AI Providers/index.html` | `ai-providers/profiles` |
| `AI Providers/getting-started.html` | `ai-providers/profiles` |
| `AI Providers/troubleshooting.html` | `ai-providers/profile-duplicate` |
| `AI Providers/modules/settings-and-keys.html` | `ai-providers/profile-duplicate` |
| `AI Providers/modules/provider-assets.html` | `ai-providers/profiles` |

Every embed uses the shared `.preview-embed` figure, states in its caption that values are
examples and nothing is saved, and links to the full preview (AI Providers gained the
matching `.preview-embed` rules in `AI Providers/assets/styles.css`). A focused headless
check loaded each embedded page, forced the nested iframe to load, and confirmed rendered
content (8/8 sampled pages returned live preview text, e.g. the graph editor, production,
AI Assistant, banter debugger, sound sequencer, and AI Providers profiles).

Pages intentionally left without embeds: `runtime-dialog-flow.html` and
`history-and-transcripts.html` (no matching editor surface — runtime systems, not editor
UI), `AI Providers/architecture.html` and `AI Providers/modules/request-pipeline.html`
(service architecture, no UI surface), `ai-extension.html` (redirect stub only), and
`AI Providers/modules/settings-and-keys.html` keeps one embed rather than duplicating the
static profile screenshot with two.

Maintainer instructions for continuing this rollout live in
`docs/interactive-unity-preview/MAINTAINING.md`.

## Known gaps

- No native Unity capture comparison was performed; visual parity must be reviewed in a
  browser before that claim is made.
- The UI Themes surface reproduces the workbench, layout families, and catalog states that
  were extracted verbatim; deeper per-binding authoring fields are represented by the
  extraction only to the level recorded in the surface notes.
- The `dgs-ai` window covers the floating panel, the draft/review windows (AI draft
  preview, translation preview, batch rewrite preview, dialog flow draft preview,
  character banter review, character fill review, graph operation plan preview), and the
  authoring activity overlay, completing plan item G5. The batch test runner window is
  developer-only. The AI model picker popup is now covered by `dgs-dialogs/ai-model-picker`.
- The `dgs-dialogs` window completes the H1 classification slice: every public and
  developer-documented window/popup in
  `docs/interactive-unity-preview/2026-10-19-window-classification.md` is covered, with the
  three `Excluded` developer-only/unreachable rows (rows 33, 34, 36) as the only
  exceptions. The current-surface fidelity follow-ups were also closed: the Home browser has
  the inline Name field with `Create & Open` and the `Invalid Name` validation dialog, and
  the Graphs toolbar has `Save`, `Format Layout`, `Validate`, and `Hide Sidebar` / `Show Sidebar`.
- Site pages other than the settings-system pilot do not yet embed the preview; the
  component-by-component tutorial rollout is plan item I3.
