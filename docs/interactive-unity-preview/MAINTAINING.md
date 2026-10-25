# Maintaining the interactive Unity preview

This document is for maintainers of the browser recreation under
`assets/unity-preview/` and its embedding in the product documentation. The goals and
fidelity rules live in `IMPLEMENTATION_PLAN.md`; this file covers daily upkeep.

## Layout

| Path | Purpose |
|---|---|
| `assets/unity-preview/app.js` | Registry and renderer entry for all eight windows (`dgs`, `ai-providers`, `banter`, `sound`, `themes`, `inspectors`, `dgs-ai`, `dgs-dialogs`) |
| `assets/unity-preview/state.js` | Example state tree; `resetDemo()` replaces runtime edits from a frozen snapshot |
| `assets/unity-preview/controls.js` | Shared control builders (`h`, `field`, `textRow`, `checkbox`, `sliderRow`, `tabs`, `foldout`, `messageBox`, `toastOn`, `bindOverlay`) |
| `assets/unity-preview/preview.css` | Shell, toolbar, form and focus styles |
| `assets/unity-preview/surfaces/*.js` | One module per window; each exports `entries`, notes and `render(host, ctx)` |
| `assets/unity-preview/components/registry.js` | Exact allowlist for 20 node and 23 inspector component routes |
| `assets/unity-preview/components/node.js` | Shared node forms used by graph, gallery and focused examples |
| `assets/unity-preview/components/inspector.js` | Focused entry to the existing source-specific inspector renderers |
| `assets/unity-preview/component.css` | Natural-size focused component layout |
| `assets/documentation/live-previews.js`, `live-docs.css` | On-demand example loading, isolated reset/close, automatic height and shared reading styles |
| `assets/unity-preview/*.css` | Per-window styles (`dgs.css`, `nodes.css`, `banter.css`, `sound.css`, `themes.css`, `ai-panel.css`, `ai-providers.css`, `dgs-dialogs.css`, `product.css`) |
| `Dialogue Graph System/preview/index.html`, `AI Providers/preview/index.html` | Product entry pages (`?window=`, `?surface=`, `?component=node:Dialog`, `?embed=1`) |
| `assets/unity-preview/embed.html` | Minimal embed shell used by tutorials |
| `assets/unity-preview/data/coverage.json` | Coverage ledger: windows, modules, stylesheets, pinned source file hashes |
| `docs/interactive-unity-preview/` | Plan, window classification, evidence record, screenshots |

## Checking source drift

The preview is pinned to the Unity checkout recorded in `coverage.json` (`source`) and in
the evidence document. Verify without touching the Unity project:

```powershell
node scripts/check-unity-preview-sources.mjs
```

Expected output: `UNITY_PREVIEW_DRIFT_OK: <n> source files across 8 windows match pin
<commit>`. The script hashes every file listed in the ledger and reports drift; it never
edits Unity files.

When the pin moves:

1. Read the changed Unity files and update the matching surface modules.
2. Recompute the `sha256` values in `coverage.json` for every changed entry and update the
   `source` pin and `updated` date.
3. Re-run the drift check and tests, then verify the changed views in a real browser.
4. Record the new pin and any newly observed strings in
   `docs/interactive-unity-preview/evidence/2026-10-19-verification.md` (or its successor).

## Translating styles and adding controls

- Follow the fidelity rules in `IMPLEMENTATION_PLAN.md` §4: match the source region at the
  agreed desktop size, keep product themes distinct, never replace every palette with the
  website theme, and record any substitution instead of silently dropping a USS property.
- Use the shared builders in `controls.js`. Controls that rerender must commit on
  `change`; a rerender from `oninput` destroys focus and caret. Plain field edits may
  update local state on input when they preserve the existing DOM.
- Overlays created outside `messageBox`/`toastOn` must call
  `queueMicrotask(() => bindOverlay(overlay))` after appending so Escape closes them and
  focus enters.
- Excluded behavior (file IO, provider calls, graph serialization, storage) must answer
  with an explicit explanatory toast; a dead click with no response is a defect.
- Runtime demo edits belong on the existing `ctx.state.<window>` objects. `resetDemo()`
  replaces the whole tree, so added keys reset cleanly; never edit Unity files.

## Adding a surface or an embed

1. Add the entry and render branch to the window module; keep every user-visible string
   that exists in Unity verbatim (the tests assert a sentinel map).
2. Add the surface to `tests/unity-preview.test.mjs` sentinels if it introduces new
   highlighted strings.
3. Add a browser target to `scripts/check-unity-preview-render.mjs` (name, path, sentinel).
4. To embed in a tutorial page, use the established figure (both products ship the
   `.preview-embed` CSS):

   ```html
   <figure class="preview-embed"><iframe class="preview-embed__frame" data-preview-src="../assets/unity-preview/embed.html?component=node%3ADialog&amp;embed=1" title="Dialog node field example" loading="lazy" hidden></iframe><figcaption>Example Dialog node fields; nothing is saved. <a href="../assets/unity-preview/embed.html?component=node%3ADialog">Open the standalone preview</a>.</figcaption></figure>
   ```

   Adjust the relative path for the document depth. Keep `data-preview-src` and `hidden`:
   the product documentation app adds Try/Reset/Close controls and loads only on request.
   Focused routes render the same forms as full views; inspectors use `component=inspector%3Adialog-manager`.
   For a whole window use `?window=sound&surface=sequencer&embed=1` instead.
   Include a standalone link, a concrete exercise, numbered Unity setup steps and an expected result.
   The caption must state that values are examples and nothing is saved. Never present a screenshot as an interactive control.
5. Update the ledger (`coverage.json`) when files, modules or stylesheets change.

## Verification checklist

Run from the repository root:

```powershell
node --test tests/unity-preview.test.mjs
node --test tests/site-launch.test.mjs
node --test tests/documentation-preview.test.mjs
node scripts/validate-site.mjs
node scripts/check-unity-preview-sources.mjs
```

In a real browser check a node edit, repeatable rows, reset, close/reopen, inspector foldouts,
documentation navigation and a narrow viewport. Preserve the user's open preview state by
using a separate review tab. Then update the evidence record with fresh counts, screenshots and accepted
residuals. Keep coverage, browser behavior and visual acceptance reported separately, and
do not claim visual parity against Unity without paired native captures.

## Boundaries

- The Unity checkout is read-only reference; do not modify it.
- Do not add provider calls, credential access, storage writes, graph serialization or
  real navigation from the preview.
- Do not reset, clean, stash, stage unrelated changes, commit, push or publish as a side
  effect of preview work.
