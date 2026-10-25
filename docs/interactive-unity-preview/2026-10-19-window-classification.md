# H1 window & popup classification

Read-only audit of every `EditorWindow` and `PopupWindowContent` declaration reachable from the
Dialogue Graph System and Beka Forge AI Providers editor code.

- Unity repository: `DialogueGraphSystem`
- Branch / commit: `codex/dgs-4.0-final` @ `5fb59bc4`
- Classifications: `PUBLIC-WINDOW`, `PUBLIC-MODAL/NESTED`, `LEGACY-COMPATIBILITY`,
  `DEVELOPER-ONLY`, `UNUSED/UNREACHABLE`
- Scope: 35 `EditorWindow` classes + `AiModelPickerPopup` (`PopupWindowContent`).

## Classification rules

- **PUBLIC-WINDOW** — current menu/UI entry point opens it as a standalone editor window.
- **PUBLIC-MODAL/NESTED** — current public UI opens it as a modal, popup, docked panel, or
  embedded tab surface.
- **LEGACY-COMPATIBILITY** — retained only for serialized layouts, obsolete menu routes, or
  redirects; must route to the current surface in the preview.
- **DEVELOPER-ONLY** — compiled only behind `BEKA_FORGE_DEVELOPMENT`, exposed only on developer
  menus, or used exclusively by tests/build tooling.
- **UNUSED/UNREACHABLE** — no production entry point in the audited tree.

## Inventory

| # | Declaration | Classification | Entry evidence | Preview coverage |
|---|---|---|---|---|
| 1 | `DialogSystemMainWindow` | PUBLIC-WINDOW | `MenuItem` Tools/Beka Forge/Dialogue Graph System/Open Editor, `DialogSystemMainWindow.cs:100` | Covered — `dgs` shell |
| 2 | `DialogWelcomeWindow` | PUBLIC-WINDOW | Auto-opened by `DialogWelcomeStartup`; `GetWindow<DialogWelcomeWindow>`, `DialogWelcomeWindow.cs:46` | **New — `dgs-dialogs/welcome`** |
| 3 | `DialogPublicInformationWindow` | PUBLIC-WINDOW | `DialogPublicInformationCatalog.Open`, `DialogPublicInformationCatalog.cs:76` | **New — `dgs-dialogs/public-information`** |
| 4 | `DialogCreateAssetWindow` | PUBLIC-MODAL/NESTED | Four create menus, `DialogCreateAssetWindow.cs:52,69,86,100` | **New — `dgs-dialogs/create-asset` (4 modes)** |
| 5 | `DialogGraphValidationPanelWindow` | PUBLIC-MODAL/NESTED | AI sidebar `DialogGraphAiSidebarContent.cs:2142`; AI bridge `DialogAIBridge.cs:1627,1895` | **New — `dgs-dialogs/validation-panel`** |
| 6 | `DialogRewritePreviewWindow` | PUBLIC-MODAL/NESTED | `DialogAIBridge.cs:1383` | **New — `dgs-dialogs/rewrite-preview`** |
| 7 | `DialogLocalizationIOWindow` | PUBLIC-WINDOW | Import / Export menu, `DialogLocalizationIOWindow.cs:49`; More > Import/Export, `LocalizationManagerEmbedded.cs:429-437` | **New — `dgs-dialogs/localization-io`** |
| 8 | `AddLanguageDialog` | PUBLIC-MODAL/NESTED | `Add Language`, `LocalizationManagerEmbedded.cs:497` | **New — `dgs-dialogs/add-language`** |
| 9 | `AiTranslationChoiceDialog` | PUBLIC-MODAL/NESTED | `AI Translate`, `LocalizationManagerEmbedded.cs:532` | **New — `dgs-dialogs/translation-choice`** |
| 10 | `SaveGraphPromptWindow` | PUBLIC-MODAL/NESTED | Save As/current Save, `GraphTabController.cs:624,629` | **New — `dgs-dialogs/save-graph`** |
| 11 | `ImportPreviewWindow` | PUBLIC-MODAL/NESTED | CSV import, `DialogImportExportTabController.cs:93` | **New — `dgs-dialogs/import-preview`** |
| 12 | `AiProfileCreateWindow` | PUBLIC-MODAL/NESTED | AI Providers toolbar, `AiProvidersSettingsWindow.cs:772` | Covered — `ai-providers/profile-duplicate`; create surfaces are inline |
| 13 | `AiModelPickerPopup` | PUBLIC-MODAL/NESTED | `UnityEditor.PopupWindow.Show`, `AiModelPickerField.cs:89` | **New — `dgs-dialogs/ai-model-picker`** |
| 14 | `AiProvidersSettingsWindow` | PUBLIC-WINDOW | `MenuItem` + DGS Tools menu, `AiProvidersSettingsWindow.cs:40-55`; `DialogSystemMainWindow.cs:166-174` | Covered — `ai-providers` |
| 15 | `CharacterBanterReviewWindow` | PUBLIC-MODAL/NESTED | `DialogAIBridge.cs:2589,2642` | Covered — `dgs-ai/character-banter-review` |
| 16 | `CharacterFillReviewWindow` | PUBLIC-MODAL/NESTED | `DialogAIBridge.cs:2773,2950` | Covered — `dgs-ai/character-fill-review` |
| 17 | `GraphOperationPlanPreviewWindow` | PUBLIC-MODAL/NESTED | `DialogAIBridge.cs:671,1256` | Covered — `dgs-ai/plan-preview` |
| 18 | `AiDraftPreviewWindow` | PUBLIC-MODAL/NESTED | `DialogAIBridge.cs:1028` | Covered — `dgs-ai/draft-preview` |
| 19 | `AiLocalizationPreviewWindow` | PUBLIC-MODAL/NESTED | `DialogAIBridge.cs:2091` | Covered — `dgs-ai/localization-preview` |
| 20 | `BatchRewritePreviewWindow` | PUBLIC-MODAL/NESTED | `DialogAIBridge.cs:1843,1887` | Covered — `dgs-ai/batch-rewrite-preview` |
| 21 | `DialogFlowDraftPreviewWindow` | PUBLIC-MODAL/NESTED | `DialogAIBridge.cs:1082` | Covered — `dgs-ai/flow-draft-preview` |
| 22 | `BanterCatalogValidationWindow` | PUBLIC-MODAL/NESTED | Opening Banter window, `CharacterBanterReviewWindow.cs:609` | Covered — `banter` |
| 23 | `BanterGettingStartedWindow` | PUBLIC-WINDOW | Banter window getting-started action | Covered — `banter` |
| 24 | `SoundSequenceWindow` | PUBLIC-WINDOW | Sound workflow entry point | Covered — `sound` |
| 25 | `GraphSoundSequenceWindow` | PUBLIC-MODAL/NESTED | Attached to graph editor; detach state switches to `SoundSequenceWindow` | Covered — `sound/graph-attached`, `sound/graph-detached` |
| 26 | `DgsThemeWorkbenchWindow` | PUBLIC-WINDOW | Theme workflow entry point | Covered — `themes` |
| 27 | `DialogSettingsEditorWindow` | LEGACY-COMPATIBILITY | `[Obsolete]`; routes to `DialogSystemMainWindow`, `DialogSettingsEditorWindow.cs:12-23` | Covered by current settings surfaces |
| 28 | `DialogGraphLauncherWindow` | LEGACY-COMPATIBILITY | Retired launcher; superseded by Home | Shown only by overcoverage; current route mapped |
| 29 | `DialogJsonIOWindow` | LEGACY-COMPATIBILITY | `[Obsolete]`; disabled legacy menu, `DialogJsonIOWindow.cs:12` | Covered by Production import/export |
| 30 | `DialogGraphEditorWindow` | LEGACY-COMPATIBILITY | Legacy standalone editor; current shell is `DialogSystemMainWindow` | Covered by `dgs` |
| 31 | `LocalizationManagerWindow` | LEGACY-COMPATIBILITY | Standalone route retired; `LocalizationTabController.cs:29-45` embeds manager | Covered by Production > Localization |
| 32 | `NewGraphPromptWindow` | LEGACY-COMPATIBILITY | Menu-invoked prompt superseded by Show Save Prompt | Covered by `save-graph` |
| 33 | `DialogGraphTransferReportWindow` | DEVELOPER-ONLY | Developer menu only, `DialogGraphTransferReportWindow.cs:29,47` | Excluded |
| 34 | `BatchTestRunnerWindow` | DEVELOPER-ONLY | `#if BEKA_FORGE_DEVELOPMENT`; headless `-executeMethod` | Excluded |
| 35 | `BanterDecisionDebuggerWindow` | DEVELOPER-ONLY | Developer-only debugging menu | Intentionally previewed for documentation |
| 36 | `ValidateGraphResultWindow` | UNUSED/UNREACHABLE | No public openers; replaced by `DialogGraphValidationPanelWindow` | Excluded |

## Coverage status

H1 closes every public and developer-documented declaration above. Current-surface fidelity notes:

1. **Home create row** — covered: inline Name field (default `DialogGraph`) with `Create & Open`
   and the `Invalid Name` / `Please enter a valid graph name.` validation dialog.
2. **Graphs toolbar** — covered: `Save` (routes to the Save Dialogue Graph prompt), `Format
   Layout`, `Validate` (routes to the validation panel), and `Hide Sidebar` / `Show Sidebar`.

## Legacy route reconciliation

| Legacy surface | Current preview route |
|---|---|
| `DialogJsonIOWindow` | Production > Import / Export |
| `DialogSettingsEditorWindow` | Settings tab / AI Providers settings |
| `DialogGraphLauncherWindow` | Home |
| `DialogGraphEditorWindow` | Graphs |
| `LocalizationManagerWindow` | Production > Localization |
| `NewGraphPromptWindow` | Save Dialogue Graph prompt |
| Localization `Add Language` / `Add Languages` / `Add Popular` | `dgs-dialogs/add-language` |
| Localization `AI Translate` | `dgs-dialogs/translation-choice` |
| Localization `More` (Import / Export) | `dgs-dialogs/localization-io` |

## Notes and corrections

- `DialogSystemMainWindow` is the current unified shell; `DialogGraphEditorWindow` is legacy.
- `DialogGraphValidationPanelWindow` is current despite its commented menu item: the AI sidebar
  and AI bridge open it with validation results.
- `AiProfileCreateWindow` is not duplicate-only: `Open()` covers create, and `OpenDuplicate`
  covers clone. Create remains inline in `ai-providers/profiles`; the duplicate utility is
  `ai-providers/profile-duplicate`.
- `GraphSoundSequenceWindow` is graph-attached; `SoundSequenceWindow` is the detached copy.
  The preview shows both: `sound/graph-attached` renders the folded graph strip with
  "Open in separate window", and `sound/graph-detached` renders the detached window with
  "Return to graph" and the "Detached from <graph>." context line.
- Overcoverage (`BanterDecisionDebuggerWindow`, legacy hosts) is documented as intentional
  documentation coverage, not evidence of public exposure.
