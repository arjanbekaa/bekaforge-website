# Documentation Screenshot Refresh Design

Date: 2026-08-12
Status: Approved

## Goal

Replace stale documentation captures with the supplied current DGS screenshots, refresh AI Providers branding, and turn the AI Extension teaser into an accurate Coming Soon preview without exposing its detailed technical documentation.

## Approved visual strategy

- Technical documentation uses the newest raw Unity captures from `C:\Users\arjan\Desktop\Dialog System Scrs` because they preserve legibility and accurately show the current editor/runtime.
- Product landings may use the polished 1536x1024 presentation frames from `C:\Users\arjan\Desktop\ArjanBeka` as visual summaries.
- The AI Extension remains clearly marked `Coming Soon`. Its teaser may show the assistant, localization, and translation-preview workflows, but every caption describes them as planned previews.
- The AI Extension hero must display its entire 3:2 product artwork. Grid children may shrink, and the image uses block layout with `width: 100%`, `height: auto`, and `object-fit: contain`; it must never render as the giant clipped crop shown in `Screenshot_26.png`.
- AI Providers uses the newer June 4 brand set from `C:\Users\arjan\Desktop\DGS Brand`.

## Documentation replacement map

| Website asset | Approved source |
| --- | --- |
| `Dialogue Graph System/assets/images/demo-main-menu.png` | `Dialog System Scrs/DGS-Menu.png` |
| `Dialogue Graph System/assets/images/graph-editor-overview.png` | `Dialog System Scrs/Graph.png` |
| `Dialogue Graph System/assets/images/graph-editor-branching-example.png` | `Dialog System Scrs/Graph+Validate.png` |
| `Dialogue Graph System/assets/images/nodes-overview.png` | `Dialog System Scrs/Nodes.png` |
| `Dialogue Graph System/assets/images/graph-launcher.png` | `Dialog System Scrs/Launcher.png` |
| `Dialogue Graph System/assets/images/runtime-dialog-ui.png` | `Dialog System Scrs/Runtime-Dialogue.png` |
| `Dialogue Graph System/assets/images/runtime-history-panel.png` | `Dialog System Scrs/Runtime-History.png` |
| `Dialogue Graph System/assets/images/runtime-settings-overlay.png` | `Dialog System Scrs/Runtime-Settings.png` |
| `Dialogue Graph System/assets/images/settings-text.png` | `Dialog System Scrs/Settings-Text.png` |
| `Dialogue Graph System/assets/images/settings-choices.png` | `Dialog System Scrs/Settings-Choice.png` |
| `Dialogue Graph System/assets/images/settings-audio.png` | `Dialog System Scrs/Settings-Audio.png` |

Add current captures for Characters and Actions, Context, Environments, Variables, Graph View settings, Runtime UI settings, and AI settings under descriptive kebab-case names. Update the graph-editor and settings galleries so these images appear only where the surrounding copy describes the visible surface.

Keep existing screenshots that have no accurate replacement, including the DialogManager inspector, import/export tool, JSON panels, new-dialogue popup, and transcript reconstruction view.

## Product previews

- Add the four polished DGS frames (`Graph`, `Launcher`, `Localization`, and `Nodes`) as a compact visual tour on the DGS landing page.
- Add the three polished AI frames (`AI_Assistant`, `AI_Localization`, and `AI_Translation_Preview`) to the AI Extension teaser below the planned-direction copy.
- Keep detailed AI Extension pages in the repository but unlinked from public navigation.
- Use concise, descriptive alt text; provide intrinsic width and height where new markup is added; lazy-load all below-fold images.

## AI Providers branding

- Replace the current large card, icon, cover, and social artwork with the matching June 4 files.
- Add the clean 420x280 card and final 160x160 icon to the brand folder.
- Point the homepage product card at the clean 420x280 asset while retaining the larger cover and icon for higher-resolution contexts.

## Safety and verification

- Preserve all pre-existing dirty `Screenshots/`, `assets/icons/`, and `assets/screenshots/` changes; stage only the explicit documentation, brand, test, and specification allowlist.
- Extend static tests to enforce the Coming Soon boundary, the non-cropping hero rules, polished preview references, and current homepage card reference.
- Run Node tests and whole-site link validation.
- Serve the repository locally and verify the AI Extension page at desktop and mobile widths, checking full-image visibility, overflow, image loading, and browser console errors.

