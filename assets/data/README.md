# Website Text Resources

`site-config.json` is the public configuration for release statuses, prices, versions, store links, publisher links, product website/support/changelog URLs, and the whitelisted `documentation` topic map. Edit it on the website repository's `main` branch when publishing public website links. `textresources.js` contains browser-safe fallbacks plus product names, descriptions, CTA labels, docs paths, screenshot paths, and icon paths.

## How to edit

1. Edit `site-config.json` directly on the website repository's `main` branch.
2. Keep only the existing `publisher`, `support`, `products`, and `documentation` sections and their existing string fields/topic slugs.
3. Use HTTPS for every `documentation` topic and for `websiteUrl`, `supportUrl`, and `changelogUrl`; leave unknown optional store, video, price, or version values as empty strings.
4. Run `node --test tests/public-url-registry.test.mjs` before publishing.

The file is downloaded by every page after safe defaults are rendered. If it is missing, malformed, offline, or contains a disallowed URL scheme, the loader keeps its defaults. Never place GitHub tokens, API keys, passwords, webhook secrets, private report data, or other credentials here; GitHub Pages serves this file publicly.

Product names, descriptions, canonical relative docs paths, screenshots, and icons remain in `textresources.js`. Keep that file browser-compatible because this site has no build step. DGS remains prepared and unpublished; publishing website documentation does not publish the Unity asset or change its store listing.

## Public reports

`support.reportIssueUrl` points to the repository's public GitHub Issue Forms chooser. Visitors can submit website or documentation reports without any credential embedded in the site. The resulting report and its contents are public unless repository visibility or GitHub permissions are changed outside this site.

## Optional HTML binding

Pages can bind values with:

- `data-resource-href="products.dialogueGraphSystem.assetStoreUrl"`
- `data-resource-href="documentation.getting-started"`
- `data-resource-src="products.dialogueGraphSystem.iconPath"`
- `data-resource-text="products.dialogueGraphSystem.name"`
- `data-current-year`

Relative documentation and image paths resolve from the website root, including when a binding appears on a nested documentation page. If a static page cannot use the binding without becoming harder to maintain, keep the literal HTML aligned with this file and mention the page in the edit summary.

## Unity editor link consumer

Only AI Providers currently fetches this JSON from Unity, through its `AiProvidersOnlineLinks.cs` consumer, on an explicit Documentation or Website click. It reads `products.aiProviders.docsPath` and `products.aiProviders.websiteUrl` from the raw GitHub `main/assets/data/site-config.json` URL, accepts HTTPS destinations, and caches valid links locally for offline use. `docsPath` can be a site-relative path or an absolute HTTPS URL. DGS and the included AI Extension do not currently fetch these values from Unity; their URLs are available to the website's own documentation bindings. The AI Extension's support and changelog links point to the DGS product pages because it is included in DGS 4.0. Keep all public fields free of credentials.
