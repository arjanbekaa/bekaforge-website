# Live component documentation — 2026-10-20

## Delivered

- Shared node renderer extracted into `assets/unity-preview/components/node.js`; graph, gallery and focused examples use the same forms.
- Exact component route registry: 20 node kinds and 23 inspector views, including Dialog Manager and the actual custom Dialog Node object Inspector.
- Node and inspector references, matching tutorial embeds, and Camera/Interaction/UI setup guide. Each reference has numbered Unity steps, an exercise and an expected result. Existing Sound, Banter, theme and AI Providers pages reuse window-specific examples.
- Examples load on request, resize after asynchronous rendering and subsequent edits, reset independently and unload on close. Standalone links remain available without documentation JavaScript.
- Shared reading styles, compact reference navigation, unique heading anchors, mobile navigation, accessible numeric field names and simple flow diagrams. No dependencies or build step added.
- Preview corrections: forced-surface navigation, Sound seek/retime bounds and ruler coordinates, detached Banter feedback, Character input focus, truthful demo-only actions, and source-specific Dialog Node/Manager fields.

## Observed verification

| Check | Result | Evidence boundary |
|---|---|---|
| Node, inspector, documentation lifecycle and site tests | PASS — 38/38 | DOM simulation and static checks; includes whole-site link/config validator |
| Every documented focused component in real in-app browser | PASS — 43/43 | Actual `.up-component__body` content observed, beyond the shell |
| Dialog edit and isolated reset; Choice Add Option and automatic height | PASS | Real browser interactions |
| Wait For mode switch; custom Dialog Node name trim and GUID regeneration | PASS | Real browser interactions; name persisted after rerender |
| Sound Add binding from forced Sequencer surface | PASS | Real browser reached Spatial binding rather than reverting to Sequencer |
| Narrow documentation at 390-pixel viewport | PASS | Body content width 375px equals scroll width; embedded Dialog fits; Menu and camera page filter work |
| Source drift ledger | PASS — 80 files, 8 windows | Recorded current bytes match source checkout at `5fb59bc4`; Unity files were read only |
| Git whitespace check | PASS | Existing dirty checkout preserved; nothing staged, committed or published |
| Complete pixel parity with native Unity | NOT OBSERVED | No paired native screenshot comparison in this work |
| Unity runtime, real audio, provider calls and graph export | NOT OBSERVED / outside browser demo | Preview edits remain temporary; browser examples do not perform these operations |

Browser review used separate tabs and preserved the user's existing Sound tab and example state. The local no-cache preview server remains at `http://127.0.0.1:8890/`.

## Maintenance

See `../MAINTAINING.md` for routes, shared renderer ownership, embed markup and verification commands. Keep older dated reviews as historical snapshots; this record describes the current documentation integration without treating static checks as native Unity acceptance.

## Follow-up: tutorial-by-tutorial source audit

Three Luna workers reviewed 32 existing pages, including 256 ordered instruction items, code samples and all 43 reference exercises. No public HTML pages were added. Every page below was source-reviewed; browser acceptance is reported separately rather than inferred from that review.

| Existing page (under Dialogue Graph System unless prefixed) | Ordered items | Main source/control checks |
|---|---:|---|
| getting-started.html | 11 | Active graph Home, default Choice row, manager registry, DialogPlayer |
| installation.html | 7 | Package dependencies, TMP and sample paths; no simulated installer |
| quick-tutorial.html | 12 | Choice starts with one row in Unity; two-row browser specimen is explicitly separate |
| guides/creating-a-dialog.html | 15 | Active create menus, Dialog fields, answer ports, validation sidebar |
| guides/integrating-actions.html | 7 | DialogActionSO CreateAssetMenu, ActionNodeView, handler/runner contracts |
| components/runtime-ui.html | 7 | DialogUIController, DialogUIManager, prefab and component references |
| api/dialog-action-runner.html | 0 | Three API samples, runner/fallback/handler signatures |
| api/dialog-manager.html | 4 | Registry, playback, events, transcript, DialogPlayer signatures |
| modules/graph-editor.html | 0 | Active main window/controller and legacy editor distinction |
| modules/runtime-dialog-flow.html | 0 | Runtime flow and two API samples |
| modules/settings-system.html | 3 | SettingsTabController, DgsThemesPanel, Runtime UI and theme exercises |
| modules/history-and-transcripts.html | 0 | Recorded history and transcript API examples |
| modules/import-export.html | 0 | Production controls, import bridge and transaction behavior |
| architecture.html | 0 | Active editor ownership and runtime/code examples |
| core-concepts.html | 0 | Node model, Choice prompt boundary, validation and runtime APIs |
| faq.html | 0 | Direct graph startup, actions and history APIs |
| troubleshooting.html | 0 | Registry, UI, validation, import, history, Banter and sound |
| guides/banter-setup.html | 23 | Getting Started/Exchange/Catalog Validation editors and MarketDemoBanter |
| guides/walla-setup.html | 23 | Sequencer, graph panel, binding preparation/freshness gate/runtime bridge |
| guides/ai-generation-workflow.html | 9 | Sidebar, operation-plan and flow-draft review/apply controls |
| guides/camera-interaction-ui.html | 19 | Camera/interaction components, Themes integration, manager overrides, localization |
| modules/ai-extension.html | 0 | Existing redirect to AI authoring guide |
| node-reference.html | 60 | All 20 native node types and 20 corresponding renderer exercises |
| inspector-reference.html | 46 | All 23 source-specific inspectors and exercises, including editability |
| AI Providers/index.html | 0 | Provider families, release boundaries, profile example |
| AI Providers/getting-started.html | 5 | Configure/test steps, request/cancellation sample, template defaults |
| AI Providers/architecture.html | 0 | Async HttpClient vs coroutine UnityWebRequest vs local-tool transports |
| AI Providers/troubleshooting.html | 5 | Readiness, credentials, cancellation, retry and model-list behavior |
| AI Providers/api/public-api.html | 0 | Coroutine/async snapshot signatures and result types |
| AI Providers/modules/provider-assets.html | 0 | Six HTTP families plus two editor-only subscriptions |
| AI Providers/modules/request-pipeline.html | 0 | Coroutine/async/stream samples; provider-specific streaming support |
| AI Providers/modules/settings-and-keys.html | 0 | GUID-scoped keys, protected storage, duplicate-profile behavior |

### Corrections and acceptance

- Corrected Choice row counts, action asset creation path, active architecture and Themes routes. Developer-only Walla diagnostics now name `BEKA_FORGE_DEVELOPMENT` rather than implying they exist in a normal installation. Fixed an invalid C# namespace in the binding helper example.
- Replaced generic inspector opener steps with the owning Project asset or Hierarchy component. Exercises distinguish read-only object references, staged variable types and simple field editing from actual scene queries or separate rendered previews.
- Corrected AI profile template labels/defaults, Custom JSON multiline initialization, Gemini endpoint omission, empty example credentials, subscription model edits and Codex duplicate restrictions. Corrected Graph Jump's Asset Path label.
- The theme Sample line now updates its own canvas on input without rebuilding the input or losing the value on later setting changes. The exercise opens Sample content before asking for those controls.
- PASS: 40 automated tests, including eight template creation paths, Custom textarea initialization, Graph Jump label, and theme typing without rerender/value loss. Whole-site validation includes deferred embed paths. Source ledger expanded to the three newly relied-on sources (83 files total).
- PASS in real browser: corrected Home name/confirmation exercise, Choice edit/add-row exercise, Action raw payload/completion controls, Custom JSON initial fields/body, and immediate theme text plus portrait toggle retaining the edited text.
- All 43 reference exercises were checked against their renderer callbacks. This is source/DOM acceptance, not proof that every Unity authoring or Play Mode step was executed.
- NOT OBSERVED: compilation/execution of all C# tutorial snippets in Unity, native scene authoring, audio, real provider/local-tool calls, full native visual parity. No credentials, source-project changes, commits or publication.

## User-supplied clean native captures

- Reviewed the `DGS-Screenshots` folder: 53 PNG originals. Imported the explicitly Clean shortcut image instead of its alternate. Kept the full theme-workbench capture as reference-only because its bottom strip shows `InvalidCastException`.
- The existing gallery now displays 51 original PNGs; 15 existing documentation pages use the matched captures, with 29 references verified for paths and actual image dimensions. No public HTML page was added.
- Source/destination bytes and SHA-256 match for all 51 displayed originals. Images were copied without cropping, retouching or re-encoding. Original filenames and unknown capture-time provenance are recorded in the gallery manifest. All 13 earlier captures remain unchanged.
- PASS: 40 automated tests, site validation, whitespace check, and real-browser loading/zoom of the new Home PNG at its original 1915×992 dimensions.
- Missing replacements, the theme retake and the two uncovered node kinds are listed in `../CAPTURE_CHECKLIST.md`; the second batch covers the remaining native Inspector references. Earlier provider/runtime/Banter setup and standalone Sound Sequence pictures remain where the supplied set has no matching replacement.
