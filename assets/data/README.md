# Website Text Resources

`site-config.json` is the public, GitHub-editable configuration for release statuses, prices, versions, store links, publisher links, and support links. `textresources.js` contains the browser-safe defaults plus product names, descriptions, CTA labels, docs paths, screenshot paths, and icon paths.

## How to edit

1. Edit `site-config.json` directly on the website repository's GitHub branch.
2. Keep only the existing `publisher`, `support`, and `products` sections and their existing string fields.
3. Leave unknown optional store, video, price, or version values as empty strings.
4. Run `node --test tests/site-launch.test.mjs` before publishing.

The file is downloaded by every page after safe defaults are rendered. If it is missing, malformed, offline, or contains a disallowed URL scheme, the loader keeps its defaults. Never place GitHub tokens, API keys, passwords, webhook secrets, private report data, or other credentials here; GitHub Pages serves this file publicly.

Product names, descriptions, local paths, screenshots, and icons remain in `textresources.js`. Keep that file browser-compatible because this site has no build step.

## Public reports

`support.reportIssueUrl` points to the repository's public GitHub Issue Forms chooser. Visitors can submit website or documentation reports without any credential embedded in the site. The resulting report and its contents are public unless repository visibility or GitHub permissions are changed outside this site.

## Optional HTML binding

Pages can bind values with:

- `data-resource-href="products.dialogueGraphSystem.assetStoreUrl"`
- `data-resource-src="products.dialogueGraphSystem.iconPath"`
- `data-resource-text="products.dialogueGraphSystem.name"`
- `data-current-year`

If a static page cannot use the binding without becoming harder to maintain, keep the literal HTML aligned with this file and mention the page in the edit summary.

## AI Providers editor links

AI Providers 2.2.0 reads `products.aiProviders.docsPath` and `products.aiProviders.websiteUrl` from this JSON on an explicit Documentation or Website click. The request uses the raw GitHub `main/assets/data/site-config.json` URL, accepts HTTPS destinations, and caches valid links locally for offline use. `docsPath` can be a site-relative path or an absolute HTTPS URL. `supportUrl` and `changelogUrl` identify the product help pages for website links. Keep these public fields free of credentials.
