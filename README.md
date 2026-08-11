# bekaforge-website

Official static website for Beka Forge Unity tools.

## Architecture

This site is plain static HTML. Do not add Vite, Astro, Eleventy, React, or another build system unless the tradeoff is approved first.

Primary public pages:

- `index.html` - Beka Forge multi-product homepage
- `docs.html` - generic documentation hub
- `roadmap.html` - product-grouped public roadmap
- `Dialogue Graph System/` - Dialogue Graph System product docs
- `AI Providers/` - published AI Providers for Unity documentation
- `Dialogue Graph AI Extension/index.html` - public Coming Soon teaser only

Shared public product metadata lives in:

- `assets/data/site-config.json`
- `assets/data/textresources.js`
- `assets/data/README.md`

The public JSON file is the small GitHub-backed configuration layer. Edit it on GitHub to change approved store, publisher, support, price, version, or status values without rebuilding the site. `textresources.js` validates those overrides and keeps safe defaults when the JSON request fails.

When adding or changing product names, descriptions, docs paths, screenshots, or icons, update `assets/data/textresources.js` and keep static HTML aligned with it. Do not add secrets, API keys, tokens, private report endpoints, or privileged GitHub credentials to either public file.

## Product Areas

Current public product areas:

- Dialogue Graph System 3.0.0 - available for $24.99
- AI Providers for Unity 1.0.0 - available free
- Dialogue Graph AI Extension - Coming Soon teaser only

The detailed AI Extension pages are retained for future release work but must not be linked from public navigation while the product is Coming Soon. Do not invent store links, video links, prices, release dates, compatibility claims, or feature claims. Use `ProjectDocs` from the source project as the source of truth.

## Public reports

Website and documentation reports use GitHub Issue Forms under `.github/ISSUE_TEMPLATE/`. Reports are public GitHub issues. The static site never receives a GitHub token and has no private server-side report collector.

## Validation

Run the launch tests and whole-site validator with Node:

```powershell
node --test tests/site-launch.test.mjs
node scripts/validate-site.mjs
```

The validator checks local links and images, dynamic resource bindings, release statuses, forbidden stale copy, the teaser-only AI boundary, and secret-like public config fields.

## Asset Planning

Internal screenshot capture instructions live in:

- `assets/screenshots/dialogue-graph-system/README.md`
- `assets/screenshots/ai-extension/README.md`
- `assets/screenshots/ai-providers/README.md`
- `assets/screenshots/shared/README.md`

Icon requirements live in:

- `assets/icons/README.md`
- `assets/icons/products/README.md`
- `assets/icons/ui/README.md`
- `assets/icons/social/README.md`
