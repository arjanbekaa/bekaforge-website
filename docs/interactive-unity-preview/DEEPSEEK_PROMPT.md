# Copy-ready DeepSeek implementation prompt

Copy the text below into DeepSeek with filesystem/code access to the two local checkouts. A chat-only model without those files needs the plan and relevant source files attached; it must not invent source details it cannot read.

---

Implement an interactive browser preview of my real Dialogue Graph System and AI Providers Unity interfaces. This is an implementation request. Read the supplied plan and current source, then build and verify the preview. Continue through fixes; do not stop after proposing a plan or creating a small showcase.

## Read these first

Website to change:

`C:\Users\arjan\Desktop\BekaForge\bekaforge-website-dgs4-release`

Unity project to inspect as read-only reference:

`C:\Users\arjan\Desktop\BekaForge\DialogueGraphSystem`

Implementation plan:

`C:\Users\arjan\Desktop\BekaForge\bekaforge-website-dgs4-release\docs\interactive-unity-preview\IMPLEMENTATION_PLAN.md`

Seed source inventory:

`C:\Users\arjan\Desktop\BekaForge\bekaforge-website-dgs4-release\docs\interactive-unity-preview\2026-10-19-source-inventory.json`

Read applicable AGENTS.md files and the website README. Inspect the current Git status before editing. Both checkouts already contain other work. At planning time the Unity source was on `codex/dgs-4.0-final` at `5fb59bc4`, Unity `6000.3.6f1`; the selected website was detached at `9395452`. These are provenance notes, not instructions to reset or switch to those states. Current files on disk are the reference, including existing changes.

## What I want

Take the existing USS and port it into browser CSS. Read the matching C#/UXML UI-building code and rebuild its real structure as HTML, with the JavaScript needed for tabs, selections, foldouts, sample fields, pickers, tooltips and conditional visibility.

Make the full preview page first: it should look and feel like exploring the real Unity product. Cover the full DGS workspace and settings, all active component and ScriptableObject inspector views, the node appearances, relevant additional windows, and the full AI Providers window. Do not redesign it as a generic website or replace rich custom panels with identical generic forms.

After the full preview is covered, expose each existing component in focused/embed mode and load those same components into the existing tutorials. Readers should be able to touch the actual-looking control and read its explanation beside it. Do not copy and maintain a second version for tutorials.

This is a visual and selection preview. It is not a runtime clone. Keep the implementation direct and small; I do not want a universal USS/C# transpiler, schema framework, backend, or desktop window manager.

## Graph scope — follow this exactly

I do NOT want a real graph builder or graph export/import.

Required:

- Every currently supported node is shown individually with its real USS-based appearance, fields, ports, icons, family color and selection state.
- Visitors can select a node and see the relevant details.
- All nodes remain discoverable, either in the Graph tab's gallery or a complete node gallery reachable from it.

Optional only if straightforward:

- A fixed example graph with selectable/movable visual node cards.
- Adding another example card, if trivial with the existing gallery.

Do not implement graph serialization, downloadable graphs, graph persistence, connection creation, graph execution, graph import/export, or a Unity-compatible graph data model. If a canvas is too much work, finish the complete node-by-node gallery. That fallback is fully acceptable and must not block the rest of the preview.

The Import / Export window still needs its visual layout, selected options and example report/text views. Its Unity-only actions can explain their real purpose; no functioning graph importer/exporter or upload/download workflow is required.

## Stay inside these boundaries

- Change the selected website only. The Unity project is read-only reference.
- Preserve other work. No reset, clean, stash, broad restore, unrelated cleanup/staging, branch switching, commit, push, or publishing.
- Keep the existing static HTML/CSS/JavaScript architecture. Do not install React/Vite/Astro or another build system for this.
- Reuse existing site assets and documentation navigation where applicable; keep preview styling isolated from normal docs styling.
- Do not include private BekaForge-Coop content or arbitrary real project/user data.
- Do not read credential stores, collect real keys, contact providers or localhost/Ollama, launch subscription/CLI tools, or implement real authentication. AI-related controls use clearly fictitious example values and visibly identified example results.
- Keep current DGS/AI Providers product boundaries, release-status wording, and `/dgs-docs/` routes intact.
- The canonical `E:\Beka Forge\Brand_Book.md` was unavailable during planning. Use the current actual UI source and available Unity references; do not silently use retired Lore branding or invent a new theme.

## Sources and coverage

The seed scan found 35 direct window declarations, 64 custom-editor registrations, 5 custom-property-drawer registrations, 140 direct MonoBehaviour/ScriptableObject type candidates, 34 USS files and 1 UXML file. These are incomplete discovery categories, not implemented coverage or an exact public-screen count.

Reconcile entry points, embedded panels, indirect inheritance, default inspectors, child custom editors, drawers, conditional compilation and legacy/developer windows. Record each customer surface in a small coverage list with its stable ID, source paths, styles, renderer and verification state. Classify unused, developer-only and compatibility declarations explicitly rather than fabricating new product tabs.

Read these areas:

1. `Assets/DialogGraphSystem/Scripts/Editor/Windows/DialogSystemMainWindow.cs`, its tab controllers and shared elements.
2. `Assets/DialogGraphSystem/Scripts/Editor/USS/`, including BekaForgePalette, BekaForgeControls, main/settings/character/production/graph/node styles; also inspect C# inline styles and palette application in `View/BekaForgePalette.cs`.
3. `Assets/DialogGraphSystem/Scripts/Editor/Inspectors/`, UI/addon inspectors, their runtime types, attributes and custom drawers.
4. Settings panels under `Editor/SettingsWindow/Panels/` and actual types under `Runtime/Settings/SettingsPanels/`.
5. Core node views under `Editor/View/Elements/Nodes/`, actual factory/load paths in `DialogGraphView.cs`, and feature nodes under `Assets/Beka Forge/Dialogue Graph System/Nodes/`.
6. Banter, Sound Sequencer/Walla, and UI Themes under `Assets/Beka Forge/Dialogue Graph System/`.
7. Camera Controller, Interaction System, relevant optional integrations and their native component inspectors.
8. `Assets/Beka Forge/AI Providers/Editor/`: settings window/panel, local connection panel, profile picker, model picker, template catalog, UI theme and generated palette USS; plus provider definition types/inspectors.
9. Reachable Dialogue AI Extension floating panels, activity UI, previews, review windows, settings and their USS/UXML.

Actual DGS main tabs: Home, Graphs, Definitions, Production, Project health, Settings.

Definitions: Characters, Actions, Variables, Context.

Production currently builds: Localization, Import / Export, Tracker. An Excel enum exists but was not added by the inspected builder; do not invent an active Excel tab.

Actual settings categories: Text, Choices, Audio, Runtime UI, Graph AI, Graph editor, UI themes, About. InputPanel exists in source but was not a separate active category; trace the actual UI before deciding its preview route.

Actual AI Providers section links: Setup, Profiles, Prompt defaults, About. Include the current OpenAI, OpenAI-compatible, DeepSeek, Gemini, Ollama, Custom, Codex and Claude Code template appearances, including conditional fields, pickers, prompt builder and local connection states. These are fixture examples, not claims about current model access or account connections.

Cover Start, Dialogue, Choice, Action, Condition, Variable Mutation, Graph Jump, Outcome, End, Random Branch, Switch, Wait, Wait For, and every current Camera node family. Verify the actual node factory so new/current supported types are not missed.

Native component inspectors must look native. SO inspectors must use their actual theme/custom layout. Preserve Banter/Walla themes and AI Providers' warm palette. Keep runtime Minimal Clean/Open Adventure appearances separate from layout and editor themes.

## How to implement

1. Reconcile the inventory and source hashes without changing Unity. Select safe public example data and record missing reference screenshots honestly.
2. Create the standalone full preview shell and directly translated CSS. A suggested route is `Dialogue Graph System/preview/index.html`, with a matching `AI Providers/preview/index.html` opening the provider window and shared assets in `assets/unity-preview/`.
3. Build only genuinely shared controls needed by the source. Read C# hierarchy/inline overrides; USS alone is insufficient. Translate Unity-only styles explicitly and record meaningful unsupported differences.
4. Finish one complete source-matched slice: DGS main shell, Text settings, and that settings asset's inspector. Verify labels, ranges, enum options, order, spacing, selection, multiline containment and slider geometry before expanding the pattern.
5. Complete the main DGS workspace, all settings and inspectors, and the full node gallery. Port each concrete surface in a small coherent slice.
6. Complete Banter, Sound/Walla, theme workbenches, native component inspectors, secondary windows and dialogs. Source-only developer utilities need classification, not promotion into public product features.
7. Complete AI Providers, its profile/template inspectors, and reachable DGS AI floating/review/preview surfaces using sample-only states.
8. Reconcile coverage, test the rendered full preview, and fix missing or inaccurate surfaces. A good-looking pilot is not the full milestone.
9. Then expose the same modules through a focused/embed entry, with stable surface/field IDs. Invalid IDs must fail safely with a useful message, never resolve arbitrary scripts or inject markup.
10. Embed Text settings into its tutorial as the pilot, then integrate component by component across the existing documentation. Reuse the same renderer/CSS and add field-focused explanations, not copied screenshots or duplicate forms.

Use straightforward modules/functions and ordinary browser state. Keep the preview's field edits and selections in memory with Reset demo. Object pickers select from a small fictitious sample list. Port source conditional visibility where it changes the visible UI. Preserve a control's original label inside the replica, with one concise demo-context note outside it.

When a source action has an excluded Unity-only effect, show the corresponding example dialog/state or explain what the real action does. Do not leave silent dead controls, and do not implement a real asset pipeline or graph engine to make them work.

Match the reference content region at agreed desktop dimensions and 100% zoom. Preserve readable typography, control states, scroll ownership, split panes, selected-row details, and anchored footers. Do not waste effort recreating OS window borders or Unity-wide docking. The documentation wrapper may adapt to narrow screens, but the native-size reference layout must remain reachable and legible.

Start inspector sections according to current source behavior, preserve opened sections during navigation within the sample session, and keep field selection/help accessible with a keyboard. Ensure source-matched tooltip and disabled/conditional states are represented without hiding essential explanations from keyboard users.

## Verification and completion

From the website root, run the existing checks:

```powershell
node --test tests/site-launch.test.mjs
node scripts/validate-site.mjs
```

Add small meaningful checks for preview navigation/selection, conditional fields, reset, all node/surface coverage, source drift, invalid surface IDs, and no live provider or graph-export behavior. Use installed browser tools for actual rendered behavior. Do not install a large test stack just to check static copy.

Compare current Unity reference captures and browser captures at matching theme, fixture, viewport dimensions and display scale. Check full windows, representative SO/native inspectors, every distinct node family, long text, empty/selected states, slider alignment and narrow layouts. Existing screenshots can help, but do not claim fresh visual parity from old screenshots or source inspection alone.

If native Unity capture is unavailable, continue the source-based port and browser checks; document exactly which visual comparisons remain NOT OBSERVED. Do not fabricate Unity screenshots, claim pixel-perfect parity, or change the source project to produce evidence.

Do not stop at the first failed check. Diagnose and fix issues caused by your changes. Preserve unrelated failing work and report its provenance separately. Keep a concise progress/remaining-surface record so work can continue across context limits.

Final handoff must include:

- Working local preview URL and changed file paths.
- What is covered in the full DGS/AI Providers preview and the node gallery.
- Which same components are embedded in which tutorial pages.
- Coverage, browser interaction, visual matching, tutorial integration and existing-site test results reported separately as PASS / PARTIAL / FAIL / NOT OBSERVED.
- Source drift or concrete remaining mismatches, with the exact affected surfaces.
- Confirmation that graph execution/authoring/export and real provider connections were not added.

Do not publish or push. Finish the local implementation, verify it, and leave it ready to review.

---

End of prompt.
