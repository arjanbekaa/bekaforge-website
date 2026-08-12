# Documentation Screenshot Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish current DGS documentation screenshots, refreshed AI Providers branding, and a responsive AI Extension Coming Soon showcase that displays full artwork without clipping.

**Architecture:** Preserve the static GitHub Pages architecture and replace documentation images in place where their semantic role is unchanged. Add separately named polished showcase assets where marketing presentation differs from technical evidence, then enforce the release boundary and hero sizing through static tests and browser verification.

**Tech Stack:** Static HTML5, inline/shared CSS, browser JavaScript, PNG assets, Node.js built-in `node:test`, GitHub Pages.

## Global Constraints

- Dialogue Graph AI Extension remains `Coming Soon` and has no purchase action or public technical-documentation navigation.
- DGS and AI Providers remain released products; AI Providers remains free.
- Preserve all unrelated dirty-worktree files and stage only an explicit allowlist.
- Use supplied images only; do not generate or invent product UI.
- Technical documentation uses raw current UI captures; landing showcases may use polished presentation frames.
- The AI Extension hero shows the complete artwork at desktop and mobile widths without overflow or clipping.

---

## File map

- `tests/site-launch.test.mjs`: screenshot contract, Coming Soon boundary, and responsive hero assertions.
- `Dialogue Graph System/assets/images/*.png`: current technical captures and polished DGS showcase frames.
- `Dialogue Graph System/index.html`: polished DGS visual tour.
- `Dialogue Graph System/modules/graph-editor.html`: current graph editor surface gallery.
- `Dialogue Graph System/modules/settings-system.html`: current settings surface gallery.
- `Dialogue Graph AI Extension/assets/images/*.png`: polished planned-workflow previews.
- `Dialogue Graph AI Extension/index.html`: full-art hero and planned preview gallery.
- `AI Providers/brand/*.png`: June 4 brand refresh.
- `assets/data/textresources.js`: homepage AI Providers card path.

---

### Task 1: Lock the screenshot and Coming Soon contracts

**Files:**
- Modify: `tests/site-launch.test.mjs`

**Interfaces:**
- Consumes: static HTML/CSS and resource paths.
- Produces: regression checks for the full-art hero and approved showcase paths.

- [ ] **Step 1: Add failing assertions**

Extend the AI Extension test to require `.preview{min-width:0}`, `.preview img{display:block;width:100%;height:auto;object-fit:contain}`, three `showcase-*.png` references, and planned-preview language. Add a test requiring `products.aiProviders.screenshotPath` to use `ai-providers-card-420x280.png` and DGS landing/gallery references to the new showcase assets.

- [ ] **Step 2: Run tests and verify RED**

Run `node --test tests/site-launch.test.mjs` and expect failures for the missing CSS contract and missing showcase/card references.

- [ ] **Step 3: Commit the contract test**

Stage only `tests/site-launch.test.mjs` and commit with `test: lock screenshot showcase contracts`.

### Task 2: Refresh DGS technical and showcase media

**Files:**
- Modify: `Dialogue Graph System/assets/images/*.png`
- Modify: `Dialogue Graph System/index.html`
- Modify: `Dialogue Graph System/modules/graph-editor.html`
- Modify: `Dialogue Graph System/modules/settings-system.html`

**Interfaces:**
- Consumes: the approved source-to-destination map in the design specification.
- Produces: stable local image URLs used by DGS documentation.

- [ ] **Step 1: Copy the approved raw images**

Copy each mapped source to its exact destination, add the eight newly named technical assets, and compare destination SHA-256 hashes with their sources.

- [ ] **Step 2: Add the polished DGS visual tour**

Copy the four polished DGS frames as `showcase-graph.png`, `showcase-launcher.png`, `showcase-localization.png`, and `showcase-nodes.png`. Add a four-card section to `Dialogue Graph System/index.html` with descriptive captions, `loading="lazy"`, and `width="1536" height="1024"`.

- [ ] **Step 3: Update focused technical galleries**

Replace the separate stale Characters and Actions cards with the combined current capture plus Context, Environments, and Variables cards. Expand the settings gallery with current Graph View, Runtime UI, and AI settings captures while retaining only copy that accurately describes each image.

- [ ] **Step 4: Run tests and site validation**

Run `node --test tests/site-launch.test.mjs` and `node scripts/validate-site.mjs`; any failure blocks the commit.

### Task 3: Repair and enrich the AI Extension teaser

**Files:**
- Modify: `Dialogue Graph AI Extension/index.html`
- Create: `Dialogue Graph AI Extension/assets/images/showcase-ai-assistant.png`
- Create: `Dialogue Graph AI Extension/assets/images/showcase-ai-localization.png`
- Create: `Dialogue Graph AI Extension/assets/images/showcase-ai-translation-preview.png`

**Interfaces:**
- Consumes: polished 1536x1024 AI presentation frames.
- Produces: a teaser-only visual gallery with no routes to detailed AI documentation.

- [ ] **Step 1: Fix grid and image sizing**

Set `.hero > *` and `.preview` to `min-width:0`; render the hero image as a block with `width:100%`, `height:auto`, and `object-fit:contain`. Keep the rounded border and shadow without a fixed crop.

- [ ] **Step 2: Add the planned-preview gallery**

Add three preview cards below the feature cards. Label the section `Planned workflow previews`, state that UI and capabilities may change before release, and use planned-tense captions for assistant commands, localization, and review-before-apply translation.

- [ ] **Step 3: Run the focused test**

Run `node --test --test-name-pattern="Providers is available free and AI Extension is teaser-only" tests/site-launch.test.mjs` and expect PASS.

### Task 4: Refresh AI Providers brand media

**Files:**
- Modify: `AI Providers/brand/ai-providers-card-1536x1024.png`
- Modify: `AI Providers/brand/ai-providers-cover-1950x1300.png`
- Modify: `AI Providers/brand/ai-providers-icon-1254x1254.png`
- Modify: `AI Providers/brand/ai-providers-social-1200x630.png`
- Create: `AI Providers/brand/ai-providers-card-420x280.png`
- Create: `AI Providers/brand/ai-providers-icon-160x160.png`
- Modify: `assets/data/textresources.js`

**Interfaces:**
- Consumes: approved June 4 AI Providers brand assets.
- Produces: updated homepage and documentation branding at existing public paths.

- [ ] **Step 1: Copy and hash-check the brand assets**

Copy the matching 1731x909, 1254x1254, 1536x1024, 420x280, and 160x160 sources to the documented paths and verify source/destination SHA-256 equality.

- [ ] **Step 2: Switch the homepage card path**

Update both fallback path entries in `assets/data/textresources.js` to `AI Providers/brand/ai-providers-card-420x280.png` while leaving the documentation nav icon on the high-resolution icon path.

- [ ] **Step 3: Run tests and validator**

Run the full Node test suite and whole-site validator; expect all tests to pass and `SITE_VALIDATION_OK`.

### Task 5: Browser verification, review, and publication

**Files:**
- Review: all files changed by Tasks 1-4.

**Interfaces:**
- Consumes: locally served static website.
- Produces: verified commit and GitHub Pages deployment.

- [ ] **Step 1: Serve and inspect**

Start a local static server. Verify the root page, DGS docs landing, graph editor/settings pages, AI Providers landing, and AI Extension teaser at 1440x900 and 390x844. Check that images load, the full AI hero is visible, no horizontal overflow occurs, and the browser console is clean.

- [ ] **Step 2: Review the explicit diff**

Confirm no detailed AI Extension documentation links were added and no unrelated dirty `Screenshots/`, `assets/icons/`, or `assets/screenshots/` entries are staged.

- [ ] **Step 3: Run final verification**

Run `node --test tests/site-launch.test.mjs` and `node scripts/validate-site.mjs` again. Record exact totals and validator output.

- [ ] **Step 4: Commit and push**

Stage the explicit implementation allowlist, commit with `docs: refresh product screenshots`, push the current feature branch, then fast-forward the same verified commit to `main` without force-pushing.

