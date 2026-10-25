# Missing clean screenshots

Save additions in `C:\Users\arjan\Desktop\DGS-Screenshots`. Filenames below are suggestions. Use the actual Unity UI, keep the whole relevant window/Inspector and readable labels, and expand the sections needed to show the fields. Tall Inspectors can use Part 1 / Part 2 captures with a little overlap. Keep credentials blank or masked. No image cropping or painting is needed.

Inventory reviewed: 53 supplied PNGs. The website now uses 51 unmodified originals in its existing gallery. The explicitly Clean shortcut image supersedes its alternate. `UI-Theme-Settings.png` is reference-only because a visible `InvalidCastException` makes it unsuitable as the general workbench illustration.

## First batch: replace the remaining old images and complete the nodes

| Done | Suggested filename | What to show |
|---|---|---|
| [ ] | AI-Providers-Setup.png | AI Providers window, Setup checklist and available profile types. This is the separate Providers window, not DGS Graph AI settings. |
| [ ] | AI-Provider-API-Profile.png | API profile selected, Base URL, endpoint if applicable, Model, Test connection and default-profile controls. Keep the key blank/masked. |
| [ ] | Dialogue-Runtime-GameHUD.png | Sample running in Game view, with a readable dialogue line, speaker and its actual HUD. |
| [ ] | Banter-Runtime-Subtitle.png | Contextual Banter subtitle in the running sample, distinguishable from foreground dialogue. A screenshot does not establish audio playback. |
| [ ] | Banter-Getting-Started.png | Banter Getting Started window with sample, authoring-kit and validation actions. Character Banter asset captures do not show this window. |
| [ ] | Banter-Catalog-Validation.png | Selected collection and its validation results, with enough context to identify the collection. Do not claim success if diagnostics remain. |
| [ ] | Walla-SoundSequencer-Standalone.png | Standalone Sound Sequencer editing a SoundSequenceAsset, with sequence settings, tracks, clips and cues. The supplied detached MarketMerchant graph Sound window is a different view. |
| [ ] | UI-Theme-Workbench-Clean.png | Settings > UI themes workbench with theme/layout choice, editing controls and live preview. Retake after resolving the visible InvalidCastException; do not just crop or hide its status strip. |
| [ ] | Node-Outcome.png | Outcome node with Outcome ID, Display Name, Description and In/Out ports. |
| [ ] | Node-Camera-Follow-Point.png | Camera Follow Point node with Target ID and In/Success ports. |

The first seven correspond to older screenshots still used where the supplied set has no matching replacement. Existing website JPEGs are not substitutes for a new cursor-free capture.

## Second batch: complete native Inspector references

Already supplied: **Dialog Manager**, **Dialogue Variable Store**, **Dialog Action Runner**, **History**, **History View**, and **UI Manager** component captures. `Dialogue-Variable-Inspector.png` shows Variable Store, not Variable Definition.

Definitions, DGS Settings and Production localization windows are useful workbench captures, but do not replace the Project asset's own Inspector. For these, select the asset in Project or its owning GameObject in Hierarchy and capture the Inspector:

| Done | Suggested filename | Select |
|---|---|---|
| [ ] | Inspector-Dialog-Graph.png | A Dialog Graph asset. |
| [ ] | Inspector-Dialog-Character.png | A Dialog Character asset. |
| [ ] | Inspector-Variable-Definition.png | A Dialog Variable definition asset, including type/default controls. |
| [ ] | Inspector-Dialog-Node-Subasset.png | A DialogNode sub-asset, showing Node Name, Identity, Speaker, Content and Timing. This is different from the graph card. |
| [ ] | Inspector-Camera-Manager.png | Camera Controller Manager component, including Output Camera and diagnostic section. |
| [ ] | Inspector-Camera-Rig.png | Camera Rig component on its scene object. |
| [ ] | Inspector-Camera-Target.png | Camera Target component on its scene object. |
| [ ] | Inspector-Interactable.png | Interactable component and its interaction settings. |
| [ ] | Inspector-Interactor.png | Interactor component and its targeting/input diagnostics. |
| [ ] | Inspector-Text-Settings.png | Dialog Text Settings asset. |
| [ ] | Inspector-Choice-Settings.png | Dialog Choice Settings asset. |
| [ ] | Inspector-Audio-Settings.png | Dialog Audio Settings asset. |
| [ ] | Inspector-Input-Settings.png | Dialog Input Settings asset. |
| [ ] | Inspector-Voice-Table.png | Dialog Voice Table asset. |
| [ ] | Inspector-Delivery-Preset.png | Dialog Delivery Preset asset. |
| [ ] | Inspector-Category-Catalog.png | Dialog Graph Category Catalog asset. |
| [ ] | Inspector-Localization-Table.png | Dialog Localization Table asset Inspector. |
| [ ] | Inspector-Localization-Runtime-Settings.png | Localization Runtime Settings asset. |
| [ ] | Inspector-Welcome-Branding.png | Dialog Welcome Branding asset. |
| [ ] | Inspector-Runtime-UI-Settings.png | Dialogue Runtime UI Settings asset. |
| [ ] | Inspector-Environment.png | Dialog Environment asset. |
| [ ] | Inspector-Scene-Context.png | Dialog Scene Context asset. |

These cover the 21 unmatched Inspector preview routes; Camera Rig and Target use two screenshots for the combined route.

## Useful follow-ups, after the first two batches

- Runtime choices with every answer visible and readable.
- Runtime history panel and runtime settings panel, preferably one capture each.
- Full DGS UI Theme Runtime Controller Inspector: the supplied `UI-Theme-Settings-p2.png` shows it together with the clipped tail of another component.
- SoundSequenceAsset Inspector with its Open Walla Sound Sequencer action.
- Optional provider variants: Custom JSON fields, Gemini profile, and editor-only subscription setup. These are useful examples, not required replacements for the current setup/API-profile pictures.

## Opening the specialist windows

- Banter Getting Started: **Tools > Beka Forge > Dialogue Graph System > Banter**.
- UI themes: **DGS editor > Settings > UI themes**, or the theme catalog/manager Inspector's editor action.
- Standalone Sound Sequence editor: select the SoundSequenceAsset in Project and use its **Open Walla Sound Sequencer** action.
- Banter Catalog Validation and the alternate standalone Sound Sequencer menu are developer-only where guarded by `BEKA_FORGE_DEVELOPMENT`; their absence from a normal installation does not mean your capture setup is broken.
