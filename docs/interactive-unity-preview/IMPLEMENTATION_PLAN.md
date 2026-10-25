# Interactive Unity documentation preview

Prepared on 19 October 2026. Planning deliverable only; no preview has been implemented by this document.

## 1. The requested result

Build one complete browser preview of the current Dialogue Graph System and AI Providers interfaces. Start by translating the existing USS into CSS and rebuilding the visible C# UI hierarchy as HTML. Match the current product, including its windows, tabs, settings, ScriptableObject inspectors, native component inspectors, popups, and individual node appearances.

Visitors should be able to select things, switch tabs and windows, expand sections, inspect tooltips, select example references, and change example field values. This is an interactive visual reference. It does not need a Unity runtime, functioning asset pipeline, graph authoring engine, AI backend, or general C#-to-web converter.

**Delivery order is important:** finish the full preview page first. Then embed the same working components into the existing tutorials, with explanations beside the actual interactive view. Do not build a separate imitation for each tutorial.

### Latest graph scope

- Required: every current node type has its actual USS-based appearance, visible fields, ports, and selected state in a node gallery.
- Required: selecting a node exposes its relevant details and explanation.
- Useful if straightforward: a fixed example graph that allows selection and simple movement of visual node cards.
- Optional: placing additional example node cards, only if the existing preview makes this trivial.
- Excluded: graph execution, graph persistence, connection authoring, graph import/export, generating real DGS graphs, downloadable Unity assets, and porting the graph runtime. Do not add these to make the preview seem complete.
- A complete node gallery is the agreed fallback if a graph canvas adds too much work. The graph canvas must not delay coverage of all nodes, windows, or inspectors.

## 2. What was verified locally

Source project:

`C:\Users\arjan\Desktop\BekaForge\DialogueGraphSystem`

- Branch: `codex/dgs-4.0-final`.
- HEAD at inspection: `5fb59bc4f3b98c852baa3bc79231ee1336fbc5fb`.
- Project version: Unity `6000.3.6f1`.
- The checkout contains substantial existing tracked and untracked work. The **current files on disk**, including that work, are the preview reference. HEAD alone is not a sufficient source fingerprint.

Selected website:

`C:\Users\arjan\Desktop\BekaForge\bekaforge-website-dgs4-release`

- HEAD at inspection: `939545208772f77d53f40538af95f319f96a5a69`.
- The website was in detached HEAD and already contained other ongoing changes. Preserve both facts; do not switch or reset it as part of implementation.
- Existing architecture: static HTML, CSS, and JavaScript. Its README explicitly says not to add React, Vite, Astro, Eleventy, or another build system without an approved tradeoff.
- Existing documentation shells: `Dialogue Graph System/assets/app.js`, `Dialogue Graph System/assets/styles.css`, and the corresponding `AI Providers/assets/` files.
- Existing checks: `node --test tests/site-launch.test.mjs` and `node scripts/validate-site.mjs`.
- Existing screenshot references: `Dialogue Graph System/4.0/screenshots/`. They can guide inspection but need provenance checks before being used as current visual acceptance baselines.

The accompanying [source inventory](2026-10-19-source-inventory.json) records a read-only seed scan:

| Discovery | Candidates found |
|---|---:|
| Direct `EditorWindow` declarations | 35 |
| Direct `PopupWindowContent` declaration | 1 |
| `CustomEditor` registrations | 64 |
| `CustomPropertyDrawer` registrations | 5 |
| Direct `MonoBehaviour` / `ScriptableObject` declarations | 140 |
| USS files | 34 |
| UXML files | 1 |
| Hashed UI source files | 700 |

These are **discovery counts, not finished interface coverage**. The scan does not resolve inheritance, conditional compilation, reachability, default inspectors, or all inline UI construction. Some windows are compatibility redirects or developer tools. Some public interfaces live in plain VisualElements or IMGUI and will not appear as a window declaration. Resolve those during the initial implementation audit.

The canonical `E:\Beka Forge\Brand_Book.md` was unavailable. This is a reproduction task: use current source and observed rendering as the visual reference, without substituting the older Lore proposal or inventing a redesign.

## 3. The direct-port approach

Use three inputs together:

1. **USS:** colors, variants, borders, typography, spacing, dimensions, states, node families, and layout rules.
2. **C# / UXML:** actual hierarchy, displayed labels, field order, tabs, conditional visibility, defaults, toolbar composition, menus, and inline style overrides.
3. **Unity references:** real control geometry, default Unity styling, text wrapping, icons, scroll behavior, and selected/expanded/error examples.

USS supplies styling, not the complete UI tree or behavior. Unity documents USS as CSS-inspired with Unity-specific customizations; it also supports its own property set. A direct port therefore needs explicit translations for Unity-only properties and controls. See [Unity 6.3 styling](https://docs.unity3d.com/6000.3/Documentation/Manual/UIE-USS.html), [supported USS properties](https://docs.unity3d.com/6000.3/Documentation/Manual/UIE-USS-SupportedProperties.html), and the [UI Toolkit Debugger](https://docs.unity3d.com/6000.3/Documentation/Manual/UIE-ui-debugger.html).

### Keep the implementation small

- Use ordinary ES modules, semantic HTML, CSS, and browser events.
- Reuse the source class names where useful so the CSS mapping is easy to review.
- Translate styles directly. A small repeatable token-copy/check script is acceptable if it avoids duplicated palette values; a universal USS/C# transpiler is not part of this work.
- Build a small set of shared browser controls, then write each rich window layout to match its C# owner. Do not flatten every custom inspector into the same generated form.
- Use simple JavaScript objects for example selections, field values, open sections, and current window. Keep this state in memory; provide Reset demo.
- Use fixture data prepared for documentation. Do not scan or publish arbitrary project assets, local settings, private conversation content, provider credentials, or the private Co-op repository.
- Do not build a desktop window manager, docking engine, backend, database, authentication system, graph model, or provider transport.

### Proposed file layout

This is a suggested organization, not a requirement to create empty files. Create files when a real surface needs them.

```text
assets/unity-preview/
  preview.css                  browser reset, shell and control styles
  dgs.css                      translated DGS USS
  nodes.css                    translated node USS
  banter.css                   translated Banter USS
  sound.css                    translated Walla/Sound USS
  themes.css                   translated theme workbench USS
  ai-providers.css             translated AI Providers USS
  app.js                       select full-page or embedded surface
  controls.js                  only controls actually shared
  fixtures.js                  public example values, no real secrets
  surfaces/                    real window/component renderers
  data/coverage.json           explicit coverage and source references
  media/                       required permitted icons/fonts/examples

Dialogue Graph System/preview/index.html
AI Providers/preview/index.html
assets/unity-preview/embed.html
tests/unity-preview.test.mjs
scripts/check-unity-preview-sources.mjs
docs/interactive-unity-preview/evidence/
```

Use shared assets from the site root so neither product becomes a copied implementation of the other. The AI Providers full-page entry opens its own window by default; DGS opens the DGS main workspace. The DGS preview offers a way to inspect the other windows without pretending that all are simultaneous main tabs.

The complete preview lives in a dedicated document so ordinary documentation typography does not change its appearance. When tutorial embedding begins, a same-origin iframe can load the same entry and select a surface, for example:

```text
assets/unity-preview/embed.html?surface=dgs.settings.text&field=charsPerSecond
assets/unity-preview/embed.html?surface=dgs.nodes.choice
assets/unity-preview/embed.html?surface=ai-providers.profiles
```

These are proposed stable IDs. Validate URL values against the known surface and field list. Unknown IDs show a useful unavailable message and return link. They never become arbitrary module paths or injected HTML. A messaging protocol is unnecessary unless a real tutorial interaction needs it later.

## 4. Fidelity rules

### What should match

At an agreed desktop preview size and 100% zoom, match the source's content region: structure, labels, order, padding, typography, colors, borders, control geometry, icons, selection, foldouts, toolbars, split panes, and scrolling. Match actual supported theme choices rather than creating arbitrary themes.

Do not spend time reproducing the operating system title bar, all of Unity's surrounding editor chrome, or general-purpose docking. Keep a small website-owned preview toolbar outside the reproduced interface, with surface selection, Reset demo, and a return to documentation.

### Distinguish the existing surfaces

| Source surface | Browser treatment |
|---|---|
| Native component Inspector | Match Unity's native component controls, compact Beka Forge header, and actual custom diagnostics. Do not apply the SO theme. |
| ScriptableObject Inspector | Match its real themed authoring layout and specialized controls. Reuse the equivalent workbench component when the source does. |
| Product window/workbench | Port its actual source layout and product-specific styles. |
| Runtime UI/theme preview | Show the selected authored UI appearance; editor branding must not recolor the game UI. |
| Dialog, popup, or context menu | Match its source content and selection behavior within the preview. |

DGS source currently supports editor theme selection through `BekaForgePalette.cs`; inspect its actual variants. AI Providers applies the warm palette through its own generated palette snapshot. Banter and Walla have product-specific palette sheets. Never replace all of them with the website's orange theme.

Keep runtime appearances `Minimal Clean` and `Open Adventure` distinct from layout choices and from editor themes.

### Translation details to check

| Unity source | Browser equivalent / check |
|---|---|
| Flex containers | Explicit `display: flex`; preserve direction, grow/shrink, min sizes, and scroll ownership. Unity defaults and browser defaults differ. |
| `-unity-font-style` | Corresponding `font-weight` / `font-style`. |
| `-unity-text-align` | Appropriate text alignment plus flex alignment where the control needs it. |
| Text overflow properties | Translate to white-space, wrapping, text-overflow, overflow, and line height. |
| Unity background tint/icons | Use actual permitted image assets; preserve tint/alpha with a suitable CSS/SVG technique. |
| Unity font references | Use the intended available font or record the substitution. Check inclusion rights before copying fonts or built-in Unity assets. |
| C# `style.*` assignments | Apply the resolved values in the same source-defined context; USS alone can be overridden by them. |
| `PropertyField`, `ObjectField`, ranges, enum fields | Reproduce the resolved visual control and use example values; retain real labels, bounds, and enum options. |
| Inspector defaults and drawers | Inspect their owning types, attributes, inheritance and drawers, rather than counting only CustomEditor registrations. |
| IMGUI inspectors | Rebuild their visible layout as HTML; there may be no USS to copy. |
| Node ports/edges | CSS/SVG visual elements. Ports need no connection-creation behavior. |
| Timeline/curves | Reproduce the visible editor with sample data. A full audio or curve-authoring engine is unnecessary. |

Do not silently drop an unsupported USS property. Record its CSS replacement or visual limitation. Preserve readable text, keyboard focus, and useful labels when mapping native controls.

For phones and narrow documentation columns, adapt the outer documentation frame and allow a focused/expanded view. Keep the reference desktop layout available; do not claim a rearranged mobile view is a pixel-identical desktop match. Avoid shrinking text into an unreadable screenshot-like scale.

## 5. Surface coverage

Use one coverage list keyed by stable surface ID. Each record should identify its source file(s), parent/window, stylesheet(s), browser renderer, example state, explanation, and verification state. Simple JSON is sufficient. Do not build a schema framework around it.

### DGS main workspace

The current `DialogSystemMainWindow.cs` builds these six main tabs:

| Area | Required visible coverage |
|---|---|
| Home | Graph browser, lists/cards, search/filter controls, categories, recent/open selection, empty and selected examples. |
| Graphs | Existing graph-editor toolbar and side panel, example selection, node details. Use the complete node gallery if a canvas is expensive. |
| Definitions → Characters | Actual character/cast workbench sections, identity, writing/voice context, delivery, state responses, Banter references, and actual conditional UI. |
| Definitions → Actions | Action definitions and payload-schema authoring appearance, selection, fields, and existing collection controls. |
| Definitions → Variables | Definition defaults and runtime-store views with visibly separate example state. |
| Definitions → Context | Scene/environment/context and delivery-related authoring appearance, selection, and references. |
| Production → Localization | Graph/language selection, tables, missing/translated examples, and relevant dialogs. |
| Production → Import / Export | Faithful interface and example text/report views only. No functional graph import/export. |
| Production → Tracker | Actual production-tracker list/detail UI and import-preview appearance, using sample records. |
| Project health | Actual categories, severity, results, selected issue details, and navigation to the affected preview field. No real project scan. |
| Settings | Text, Choices, Audio, Runtime UI, Graph AI, Graph editor, UI themes, About, and missing-settings/recovery appearance where applicable. |

Important source detail: `InputPanel.cs` exists, but Input is not currently a separate category in the inspected `SettingsTabController`. `DialogTabRouting.cs` contains an Excel enum entry, but the inspected production builder adds Localization, Import / Export, and Tracker only. Do not invent active tabs from class names or enum entries. Trace reachability and classify unused/compatibility surfaces explicitly.

### Node gallery

Audit the actual node factory/loading paths and both node source locations. Initial source-backed list:

- Start, Dialogue, Choice, Action, Condition, Variable Mutation, Graph Jump, Outcome, End.
- Random Branch, Switch, Wait, Wait For.
- Camera Switch, Move, Look At, Follow Point, Follow Target, Shake, Restore.
- Reroutes and other graph helper elements if they appear in the current editor; classify helpers separately from authored node types.

For each node show its real header, family color, icon, ports, field layout, expanded/collapsed presentation if supported, and selected state. Use `NodeBase.uss`, `NodeTypes.uss`, the graph sheets, and the feature sheets under `Assets/Beka Forge/Dialogue Graph System/Nodes/Editor/`. The browser fixture is not a serialized DGS graph.

### Inspector coverage

Cover custom registrations **and** ordinary product components/assets that use a default inspector. Resolve inherited targets, custom property drawers, nested serialized fields, public fields, `SerializeField`, `HideInInspector`, ranges, headers, tooltips, and conditionally shown fields. Do not turn hidden implementation fields into documentation controls simply because they occur in C#.

Required groups include:

- Dialogue manager/player, action runner, variable store, UI manager/controller, history, runtime settings/language controls, and relevant helper components.
- Graph and node assets, characters, actions, variables, delivery presets, environments, scene context, voice/localization assets, settings assets, branding, and UI theme/catalog assets.
- Banter collection, exchange, director profile, speech policy, HUD/view/appearance, and related shipped components.
- Walla/Sound sequence asset, player and graph binding inspectors; preserve the source distinction between a summary inspector and an Open workbench action.
- Camera Controller and Interaction component inspectors and their useful custom diagnostics.
- Provider definition inspectors and template-specific fields.
- AI extension settings and actual user-visible authoring/review surfaces.

Each inspector needs a selectable example, all normally reachable sections, meaningful field help, and source-matched conditional visibility. Reference fields choose from safe sample assets. Browser edits only affect the local example.

### Other windows and panels

The inventory contains all 35 discovered direct window declarations, with source paths and lines. Classify each as current customer UI, embedded/secondary UI, compatibility redirect, or developer-only. Current customer and secondary UI must be covered; compatibility routes should take the visitor to the current equivalent. Developer-only tools remain in the internal coverage ledger and need not become customer-facing pages.

Include the actual visible content of:

- Welcome/create/save/validation/report dialogs and the graph sidebar.
- Localization language/import/review dialogs.
- AI floating composer, activity/review state, draft/rewrite/localization previews, character fill/Banter review, and operation-plan preview where currently reachable.
- Banter Getting Started, catalog validation, and decision debugger.
- Graph Sound/Walla sequencer views, track/cue selection, property pane and curve appearance.
- UI theme workbench, bindings/catalog views and preview surfaces.
- Nested import preview and other dialogs that are not standalone public menu entries.

Avoid displaying obsolete windows as new main product features. For example, the inspected `DialogSettingsEditorWindow.Open()` forwards to the unified main window.

### AI Providers full window

Use `AiProvidersSettingsWindow.cs`, `AiProvidersSettingsPanel.cs`, `AiLocalConnectionPanel.cs`, `AiProfilePicker.cs`, `AiModelPickerField.cs`, `AiProvidersUiTheme.cs`, and both provider USS files.

The inspected window has four section links: **Setup, Profiles, Prompt defaults, About**. Reproduce those, including:

- Header/status, first-run checklist, global preferences, and source-defined save/status presentation.
- Provider profile selection, creation dialog appearance, defaults, remove/disconnect examples, capability summaries, and applicable fields.
- OpenAI, OpenAI-compatible, DeepSeek, Gemini, Ollama, Custom, Codex, and Claude Code template appearances, as defined by the current template catalog. They are source examples, not current account or model-availability claims.
- Model picker/manual entry/list appearance and template-dependent endpoint/base URL fields.
- API/local connection and editor subscription/CLI panels, with example-only disconnected/connecting/connected/error/cancel states where those states exist in source.
- Generation controls, prompt section builder, full-prompt option, and source-defined conditional sampling/limits.
- Provider asset inspectors and applicable child types, not just the main setup window.

Use obvious fictitious values for protected fields. A visitor must not need to provide a real key, sign into an account, contact localhost/Ollama, invoke a CLI, or pay for a provider request to inspect the documentation.

## 6. Interaction contract

| Control/action | Required browser behavior |
|---|---|
| Tabs, lists, search, filters, foldouts | Work on the displayed sample content and keep selection coherent. |
| Fields, toggles, sliders, enums | Update the current example and corresponding conditional display; preserve source ranges/options. |
| Object reference picker | Open a source-like picker with a small safe sample list and None where valid. |
| Selecting a node/row/issue | Show the matching details and field explanation; never stale details from a previous selection. |
| Tooltips/help | Reachable by pointer and keyboard; do not rely on hover alone for important documentation. |
| Unity-only create/save/validate actions | Show the matching example dialog/state or a short explanation of what the real Unity action does. They do not modify real assets. |
| Graph import/export | Present the actual visual controls and example report/text views. Do not implement file upload/download or a graph format. |
| Provider connection/generation actions | Show clearly identified example states. No network requests or real authentication. |
| Audio play/audition | Selection and visible sample playback state are enough for this view-focused scope. Real audio is not required. |
| Reset demo | Restore the known example values and selection without touching the real project or site content. |

Keep one concise, persistent note outside the replicated UI: changes affect demonstration data only. Preserve source labels inside the replica; avoid filling every panel with implementation disclaimers. Any simulated success/error output must still be recognizable as an example.

For source actions whose real behavior is excluded, an explanatory response is acceptable. A dead click with no response is not. Do not port the excluded behavior just to make the button clickable.

## 7. Ordered implementation tasks

Complete A–H as the full-preview milestone. Begin I only after that milestone is honestly documented. Work in small surface-by-surface slices; each row names its owner, dependency, result and verification.

| ID | Responsibility and likely files | Depends on | Acceptance and verification |
|---|---|---|---|
| A1 | Read-only inventory reconciliation; `data/coverage.json` and source-check notes | None | Resolve active vs legacy/developer surfaces, inherited/default inspectors, node factory, source styles and assets. Every candidate is accounted for. Check references against current files. |
| A2 | Visual reference worksheet and example fixture set; `fixtures.js`, evidence notes | A1 | Record current source hashes, reference theme/size, empty/selected/expanded/error examples, and source-derived defaults. Mark missing native captures NOT OBSERVED. No real secrets or private data. |
| B1 | Standalone full-page entry and shared shell; preview HTML, `app.js`, `preview.css` | A2 | Opens locally, selects DGS or AI Providers, Reset demo works, and browser navigation remains usable. Smoke-test direct URLs and keyboard focus. |
| B2 | Shared native-looking controls; `controls.js`, `preview.css`, focused tests | B1 | Text, multiline, numeric, slider, checkbox, enum, foldout, reference field and help states match one representative source form. Test long text, keyboard use and numeric ranges. Add other controls only when a real surface needs them. |
| B3 | Direct DGS palette/control/layout translation; `dgs.css`, required media, source-check script | B2 | Preserve loaded stylesheet order, theme scoping, inline overrides and source classes. Record every Unity-only translation. Compare representative screenshots at 100% zoom. |
| C1 | DGS main shell + Home/graph browser renderer | B3 | Exact six main tabs, selected list/card state, search/categories and empty sample. Main shell content/footer geometry matches the reference. |
| C2 | Text settings renderer and SO inspector entry | C1 | Full actual Text form with all source fields/options, conditional presentation and help. Test field order, foldout persistence within the session, slider readout and screenshot match. This is the first complete visual slice. |
| C3 | Choices and Input-related visible controls | C2 | Port actual active layouts; classify standalone inactive InputPanel correctly. Every visible field is reachable and explained. |
| C4 | Audio and Runtime UI settings | C2 | Port both actual forms and their nested controls/reference selections; keep appearance separate from layout. Compare empty and populated states. |
| C5 | Graph AI, Graph editor, About and recovery settings | C2 | Exact active navigation and forms, source-defined missing/dependency states, and example recovery dialogs. No provider calls. |
| D1 | Character workbench and inspector; character surface module + relevant CSS | C1 | All active character sections, specialized delivery/state/Banter UI, field help and example reference selection. Reuse the same character renderer in both hosts. |
| D2 | Action workbench and inspectors | C1 | Match scalar/schema/collection appearance and active selection; no action execution. Test empty/selected/conditional states. |
| D3 | Variables and Context workbenches and inspectors | C1 | Match source forms and runtime-vs-authored example distinction. Review field completeness and details selection. Split into two slices if more than five files are needed. |
| D4 | Localization tab and dialogs | C1 | Language/table selection, sample statuses, dialogs and AI preview appearance. No translation service calls. |
| D5 | Import / Export, Tracker and Project health views | C1 | Complete visible interfaces with sample reports/issues, selected details and explanatory action responses. No real import/export or project scan. Implement each renderer in its own small slice. |
| E1 | Core node gallery | B3 | Every core node appearance, relevant fields, ports, icon/family style and selection details matches source. Use a coverage assertion against the audited node list. |
| E2 | Feature/camera node gallery | E1 | Random Branch, Switch, Wait, Wait For and all camera families are included. No generic substitute card for a custom node. |
| E3 | Graph-tab host for the gallery; optional fixed visual canvas | E2 | Graph tab makes all nodes discoverable and selectable. Add simple dragging only if straightforward. Gallery completion is sufficient; no graph model/export. |
| F1 | Banter workbenches, inspectors and visible utility windows | D1 | Source-matched product theme, all sections and catalog/debugger/getting-started selections. Do one concrete surface per slice. |
| F2 | Sound/Walla workbenches and inspectors | B3 | Graph sound view, track/cue selection, property pane/curve appearance, asset summary and player inspector. Source-matched visual fixtures; real playback unnecessary. |
| F3 | UI theme workbench, catalog/binding and inspector views | C4 | Match source layout and sample appearance selections. Preserve Minimal Clean/Open Adventure distinction. |
| F4 | Camera Controller and Interaction inspector views | B2 | Match native appearance, custom diagnostics, conditional fields and references. Do not load the SO authoring skin. |
| F5 | Remaining default/custom inspectors and nested drawers | D–F relevant slices | Every active in-scope inspector target has a real preview or its shared current equivalent. Reconcile the coverage ledger; never count a generic placeholder as done. |
| G1 | AI Providers shell, Setup and About | B2 | Match warm theme, header, four section links, checklist and statuses. Test desktop/narrow reachability. |
| G2 | Profiles, profile dialog and provider inspector variants | G1 | Every source template has the right fields and conditional visibility; picker/model examples work locally. Verify each template individually. |
| G3 | Local/CLI/subscription connection panels and model picker | G2 | Faithful states and selection using fictitious data, with explicit example results. Verify no provider/localhost/CLI requests. |
| G4 | Prompt defaults, limits, builder and full-prompt UI | G2 | Source fields, ranges and conditional choices are reproduced; example editing works. No rewrite/generation backend. |
| G5 | DGS floating AI panel and reachable review/draft/dialog views | C5, G1 | Full visible authoring/review interface using static sample proposals. No real graph operations or AI requests. Port each source window in a small slice. |
| H1 | Remaining windows/popups and legacy-route reconciliation | C–G | Every discovered window is classified, every current user-facing one is covered, and compatibility routes reach the appropriate current surface. |
| H2 | Full-preview visual, interaction, accessibility and source-drift review | H1 | Fix failures, run existing site checks plus focused preview checks, and record coverage separately from visual acceptance. No tutorial integration needed to pass this milestone. |
| I1 | Reusable focused/embed entry | H2 | The same component can render alone by stable surface/field ID without copying layout or CSS. Test full and embedded modes produce the same content and field behavior. |
| I2 | One pilot tutorial: Text settings | I1 | Real preview beside explanation; selecting/focusing a field exposes its description, expected use and relevant guidance. Direct-linking to a field works. |
| I3 | Component-by-component tutorial rollout | I2 | Embed existing components into relevant DGS and AI Providers documentation pages. Each step preserves the same source mapping; no screenshot is presented as an interactive control. |

For tasks naming a family of surfaces, repeat the slice per concrete surface rather than putting the whole family into one giant patch. Keep shared CSS/control changes serialized and verify existing consumers after changing a shared control.

### Checkpoints

1. **Representative port:** DGS shell + full Text settings + its SO inspector demonstrate that direct USS/C# translation works. Correct fidelity problems before multiplying the pattern.
2. **Main workspace:** all current DGS main tabs and settings are reachable; the complete node gallery exists.
3. **Product coverage:** remaining inspectors, Banter, Sound/Walla, themes, AI Providers and secondary windows are accounted for and implemented.
4. **Full preview ready:** source coverage, browser behavior and visual evidence are reported separately. Resolve defects before embedding the interface into tutorials.
5. **Live documentation:** the pilot tutorial uses the same renderer, then the rest of the documentation adopts it component by component.

These are evidence checkpoints, not recurring permission prompts. Continue authorized work through fixes. Do not claim completion because a milestone looks attractive while the coverage ledger still contains unimplemented customer surfaces.

## 8. Verification and honest completion

### Source coverage

- Audit the seed inventory against actual entry points, factories, inheritance, default inspectors and loaded assets.
- Maintain a list of source UI files used and their SHA-256 values. The source-check script reports drift without editing Unity files.
- Each public surface has a renderer, example state and useful explanation. Every omitted declaration has a concrete classification/reason.
- Check labels, defaults and field options against source, including inline overrides and conditional branches.

### Browser behavior

- Tabs, list selections, search, foldouts, enum choices, sample asset pickers and reference navigation work.
- Selected details always correspond to the selected example.
- Keyboard access and visible focus work; page shortcuts do not steal typing input.
- No clipped prose, off-center slider thumb, unreachable field, broken overlay, or footer displaced by empty content.
- All required nodes are individually visible/selectable. Optional node movement never becomes a graph-authoring dependency.
- No graph serialization/export endpoints, provider calls, localhost calls, credential storage or real project mutations are introduced.

### Visual comparisons

Record the Unity version, theme, control state, content fixture, content-region dimensions, display scale and browser device pixel ratio for each paired comparison. Compare matching regions at matching scale. An old screenshot or mismatched sample state cannot establish exact parity.

Use side-by-side and transparent overlays for representative full windows and each distinct control/node/inspector family. Where screenshot-diff tooling is available, record tolerances and mask only known nondeterministic content, not layout defects. Text rasterization differences may remain; note them rather than promising universal pixel identity.

Check desktop reference widths, narrow 320/380px inspector cases, and documentation frames at 768, 1024 and 1440px. Keep windows and inspector scroll behavior distinct. Test the actual browser you will ship against; add a second engine when available and record any untested matrix.

### Existing website checks

Run from the selected website root:

```powershell
node --test tests/site-launch.test.mjs
node scripts/validate-site.mjs
```

Add focused meaningful preview checks for selection/conditional visibility, sample reset, source drift, inventory coverage, URL validation and the absence of live provider/graph-export behavior. Use the available browser tooling for rendered checks; Node checks alone do not prove appearance.

### Report separately

| Acceptance area | Possible result |
|---|---|
| Inventory and implemented surface coverage | PASS / PARTIAL / FAIL |
| Browser navigation and sample interaction | PASS / PARTIAL / FAIL / NOT OBSERVED |
| Visual match against current Unity references | PASS / PARTIAL / FAIL / NOT OBSERVED |
| Tutorial embedding | PASS / PARTIAL / FAIL / NOT OBSERVED |
| Existing website regression checks | PASS / PARTIAL / FAIL / NOT OBSERVED |
| Public deployment | NOT OBSERVED unless separately authorized and actually verified |

A complete source inventory is not visual acceptance. Browser example feedback is not a working Unity operation or provider connection. If Unity references cannot be captured, complete the source-based preview and report visual parity as PARTIAL/NOT OBSERVED with the precise remaining capture list; do not stop independent implementation or invent proof.

## 9. Ownership and scope boundaries

- Website implementation belongs in the selected website checkout only. Preserve existing ongoing changes, including its current product documentation and AI Providers work.
- Treat the Unity project as read-only source/reference. Do not change its runtime, inspectors, USS, assets, scenes, project settings or package definitions to make the browser version easier.
- Do not reset, clean, stash, broadly restore, stage unrelated changes, switch the current checkout, commit, push, or publish as a side effect.
- Do not inspect credential stores, request a real API key, or invoke provider services/CLI tools.
- Do not include private `BekaForge-Coop` content.
- Preserve existing `/dgs-docs/<feature>` links and current public release-status wording. New preview links supplement the current docs.
- Add a new dependency only if a concrete required control cannot reasonably use the existing environment or platform. This visual-preview scope should normally need none.

## 10. Deliverables

### First milestone: full preview

1. Full DGS preview page with the current main workspace, settings and discoverable secondary surfaces.
2. Full AI Providers preview entry using the same shared browser assets.
3. Complete individually selectable USS-based node gallery; optional simple visual canvas.
4. Complete active inspector coverage, including themed SOs and native components.
5. Source mapping, coverage ledger, focused checks and honest visual evidence.

### Second milestone: live documentation

1. Focused/embed entry using the same renderers.
2. Text settings pilot tutorial with interactive field explanations.
3. Component-by-component rollout across relevant tutorials and documentation.
4. Maintainer instructions for updating translated styles and rechecking source drift.

No graph editor/exporter, Unity runtime clone, provider backend, or general conversion framework is needed to satisfy this plan.
