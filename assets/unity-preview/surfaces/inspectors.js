/* Native Unity inspectors for DGS assets and components.
   Strings are copied verbatim from:
   - Assets/DialogGraphSystem/Scripts/Editor/Util/BekaForgeInspectorHeader.cs
   - Assets/DialogGraphSystem/Scripts/Editor/Inspectors/DgsAssetSOEditors.cs
   - Assets/DialogGraphSystem/Scripts/Editor/Inspectors/DialogNodeEditor.cs
   - Assets/DialogGraphSystem/Scripts/Editor/Inspectors/DialogVariableSOEditor.cs
   - Assets/DialogGraphSystem/Scripts/Editor/Inspectors/DialogueVariableStoreEditor.cs
   - Assets/DialogGraphSystem/Scripts/Editor/Inspectors/DialogCharacterSOEditor.cs
   - Assets/DialogGraphSystem/Scripts/Editor/View/Elements/DialogCharacterCastElement.cs
   - Assets/DialogGraphSystem/Scripts/Editor/View/Elements/DialogCharacterIdentityElement.cs
   - Assets/Beka Forge/Camera Controller/Editor/BekaForgeCameraControllerManagerEditor.cs
   - Assets/Beka Forge/Camera Controller/Editor/NativeCameraComponentEditors.cs
   - Assets/Beka Forge/Camera Controller/Editor/BekaForgeInspectorHeader.cs
   - Assets/Beka Forge/Interaction System/Editor/InteractableEditor.cs
   - Assets/Beka Forge/Interaction System/Editor/InteractorEditor.cs
   - Assets/Beka Forge/Interaction System/Editor/InteractionPromptEditors.cs
   - Assets/Beka Forge/Interaction System/Editor/InteractionValidation.cs
   Example asset values only; nothing is loaded, renamed, duplicated, or deleted. */

import {
  h, field, helper, badge, textRow, multilineRow, textInput, numberRow, enumRow, toggleRow, sliderRow,
  colorRow, windowFrame, sectionTitle, foldout, toastOn
} from "../controls.js";
import { renderCharacterWorkbench } from "../character-workbench.js";
import { inspectorSurfaceIds, inspectorSurfaceLabels } from "../components/registry.js";

export const entries = inspectorSurfaceIds.map((id) => ({ id, label: inspectorSurfaceLabels[id] }));

export const note =
  "Recreated from the DGS, Camera Controller, and Interaction System inspector sources. The Beka Forge headers (publisher, Documentation and Website buttons), field labels, help texts, and diagnostics strings are copied from source. " +
  "The 15 DGS ScriptableObject routes reproduce the normally-visible inspector fields in serialized declaration order, including base fields, [Header] sections, [Tooltip] text, [Range]/[Min] limits, [TextArea] rows, enums, object references, lists, and nested [Serializable] fields. " +
  "Dialog Character follows its custom editor and the shared Character Bible workbench; the other asset routes have no custom property drawers or ShowIf/HideIf attributes, and DialogChoiceSettings only normalises keyboardConfirmLetter in OnValidate. " +
  "KeyCode dropdowns use a representative subset of Unity's KeyCode values, list contents are sampled examples, and object fields are read-only previews because this is a static site. " +
  "Asset values, GUIDs, dependency counts, and runtime rows are fabricated examples; nothing is loaded, renamed, duplicated, or deleted.";

function bekaForgeHeader(title, topic, publisher = "Beka Forge · Dialogue Graph System", rootUrl = "https://bekaforge.com/dgs-docs") {
  return h(
    "div",
    { class: "insp-header" },
    h(
      "div",
      { class: "insp-header__row" },
      h("span", { class: "insp-header__logo", title: "Beka Forge logo (GUID 38b087de138a1ad46b635c389d58f4d2)" }),
      h(
        "div",
        { class: "insp-header__labels" },
        h("span", { class: "insp-header__publisher", text: publisher }),
        h("span", { class: "insp-header__title", text: title })
      )
    ),
    h(
      "div",
      { class: "insp-header__links" },
      h("button", { class: "bf-button bf-button--quiet", type: "button", text: "Documentation", title: `${rootUrl}/${topic}`, onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Documentation", `OpenURL: ${rootUrl}/${topic} (demo only).`) }),
      h("button", { class: "bf-button bf-button--quiet", type: "button", text: "Website", title: "https://bekaforge.com", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Website", "OpenURL: https://bekaforge.com (demo only).") })
    )
  );
}

function infoBox(text) {
  return h("div", { class: "pf-helpbox pf-helpbox--info", text });
}

function readOnlyRow(label, value) {
  return field(label, h("input", { class: "bf-input", type: "text", value, disabled: true }));
}

function dialogueNode(ctx) {
  const n = ctx.state.inspectors.node;
  const guid = n.guid || "(no GUID)";

  return windowFrame({
    title: "Inspector · Dialogue Node",
    className: "pf-window up-window--compact",
    body: h(
      "div",
      { class: "up-scroll", style: { padding: "14px", maxHeight: "720px" } },
      bekaForgeHeader("Dialogue Node", "dialogue-graphs"),
      textRow("Node Name", n.name, (value) => { if (value.trim()) n.name = value.trim(); }, { tooltip: "Rename Dialog Node (Undo)" }),
      foldout("Identity", h(
        "div",
        null,
        readOnlyRow("GUID", guid),
        h("div", { class: "bf-row", style: { justifyContent: "flex-end", gap: "6px" } },
          h("button", { class: "bf-button", type: "button", text: "Copy", disabled: !n.guid, onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Identity", `Example GUID: ${n.guid}. This demo does not write the system clipboard.`) }),
          h("button", { class: "bf-button", type: "button", text: "Regenerate", disabled: !n.guid, onclick: () => { n.guid = globalThis.crypto?.randomUUID?.().replaceAll("-", "") || `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`; ctx.rerender(); } })
        )
      ), true),
      foldout("Speaker", h(
        "div",
        null,
        textRow("Name", n.speakerName, (value) => { n.speakerName = value; }),
        field("Portrait", h("div", { class: "bf-object-preview", title: "Sprite reference · example only" }, h("span", { class: "bf-object-preview__icon" }), h("span", { class: "bf-object-preview__name", text: n.speakerPortrait || "warden_portrait (example texture)" })))
      ), true),
      foldout("Content", h(
        "div",
        null,
        multilineRow("Line Text", n.lineText, (value) => { n.lineText = value; }),
        h("div", { class: "pf-helpbox pf-helpbox--info", text: "Runtime variables can be injected with {variableKey}, for example {playerName}. Missing variables keep the token visible." }),
        field("Dialog Audio", h(
          "div",
          { class: "bf-field__control" },
          h("div", { class: "bf-object-preview" }, h("span", { class: "bf-object-preview__icon" }), h("span", { class: "bf-object-preview__name", text: n.audioClip })),
          h("button", {
            class: "bf-button",
            type: "button",
            text: n.playing ? "Stop" : "Play",
            title: n.playing ? "Stop this audio preview." : "Preview gate-warden-greeting-01 (1.8s).",
            onclick: () => { n.playing = !n.playing; ctx.rerender(); }
          })
        )),
        helper("Audio controls demonstrate preview states; no audio plays in this browser example.")
      ), true),
      foldout("Timing", h(
        "div",
        null,
        toggleRow("Wait for Audio", n.waitForAudio, (value) => { n.waitForAudio = value; }),
        toggleRow("Sync Text with Audio", n.syncTextWithAudio, (value) => { n.syncTextWithAudio = value; }),
        numberRow("Display Time (s)", n.displayTime, 0, null, (value) => { n.displayTime = Number.isFinite(value) ? Math.max(0, value) : 0; }),
        h("div", { class: "pf-helpbox pf-helpbox--info", text: "Use > 0 for timed auto-advance (if your runtime supports it). Use 0 to wait for player input." })
      ), true)
    ),
    footer: h("div", { class: "bf-status-bar" }, h("span", { text: "CustomEditor(typeof(DialogNode)) · CanEditMultipleObjects" }))
  });
}

function variableDefinition(ctx) {
  const v = ctx.state.inspectors.variable;
  const toast = (event, title, message) => toastOn(event.currentTarget.closest(".up-window"), title, message);
  const toastNow = (title, message) => setTimeout(() => {
    const host = (document.querySelector && document.querySelector(".up-window")) || (document.body || null);
    if (host) toastOn(host, title, message);
  }, 0);
  const typeDraft = v.typeDraft ?? v.type;

  const headerActions = [
    ["Ping", "Pings the asset in the Project window."],
    ["Open", "Opens the asset in its editor."],
    ["Copy ID", "Copy the exact stable Definition ID."],
    ["Copy Key", "Copy the exact runtime key."],
    ["Copy Token", "Copy a supported variable token."],
    ["Preview Duplicate", ""],
    ["Duplicate as New", ""],
    ["Safe Delete", ""]
  ];

  return windowFrame({
    title: "Inspector · Variable Definition",
    className: "pf-window up-window--compact",
    body: h(
      "div",
      { class: "up-scroll", style: { padding: "14px", maxHeight: "760px" } },
      bekaForgeHeader("Variable Definitions", "variables"),
      h(
        "div",
        { class: "insp-card" },
        h(
          "div",
          { class: "insp-card__header" },
          h("span", { class: "insp-card__title", text: "Variable Definition" }),
          badge(`${v.key} · ${v.type}`)
        ),
        h(
          "div",
          { class: "insp-card__actions" },
          ...headerActions.map(([label, tooltip]) =>
            h("button", {
              class: `bf-button${label === "Safe Delete" ? " bf-button--danger" : ""}`,
              type: "button",
              text: label,
              title: tooltip,
              onclick: (event) => {
                if (label === "Preview Duplicate") { v.duplicatePreview = true; ctx.rerender(); return; }
                if (label === "Safe Delete") { v.deleteAttempt = true; ctx.rerender(); return; }
                toast(event, label.replace(" ", ""), `${label} would run in Unity. Demo only.`);
              }
            })
          )
        ),
        v.duplicatePreview
          ? h("div", { class: "pf-helpbox pf-helpbox--info", text: `Duplicate preview: a new asset with a fresh Definition ID will be created at Assets/Beka Forge/Dialogue Graph System/Variables/${v.key}_Copy.asset.` })
          : null,
        v.deleteAttempt
          ? h("div", { class: "pf-helpbox pf-helpbox--warning", text: "Safe Delete blocked: 2 known reference(s). Indeterminate external usage is not proof of safety.\nExternal/dynamic usage remains indeterminate." })
          : null,
        helper(`Stored key: ${v.key}`),
        helper(`Stable Definition ID: ${v.definitionId}`)
      ),
      h(
        "div",
        { class: "insp-card" },
        h("div", { class: "insp-card__title", text: "Identity & Metadata" }),
        textRow("Display Name", v.displayName, (value) => { v.displayName = value; }),
        textRow("Runtime Key Draft", v.renameDraft, (value) => { v.renameDraft = value; }),
        h("div", { class: "bf-row" },
          h("button", { class: "bf-button", type: "button", text: "Preview Rename", onclick: (event) => toast(event, "Rename", "Rename preview: 3 exact DGS location(s) will change. (example result)") }),
          h("button", { class: "bf-button", type: "button", text: "Apply Rename", onclick: (event) => { v.key = v.renameDraft; ctx.rerender(); toast(event, "Rename", "Rename applied to 3 change(s). (example result)"); } }),
          h("button", { class: "bf-button", type: "button", text: "Cancel Draft", onclick: () => { v.renameDraft = v.key; ctx.rerender(); } })
        ),
        helper("Runtime key draft is not saved. Preview then apply, or cancel."),
        multilineRow("Description", v.description, (value) => { v.description = value; }),
        textRow("Category", v.category, (value) => { v.category = value; }),
        field("Tags", h("div", { class: "bf-field__control" }, ...v.tags.map((tag) => h("span", { class: "bf-chip", text: tag })))),
        helper("Short labels used for organisation. Empty tags remain visible so they can be corrected.")
      ),
      h(
        "div",
        { class: "insp-card" },
        h("div", { class: "insp-card__title", text: "Defaults & Validation Rules" }),
        helper("Changing type is staged until Preview Type and Apply Type."),
        h("div", { class: "bf-row" },
          h("button", { class: "bf-button", type: "button", text: "Preview Type", onclick: (event) => toast(event, "Type", `Type preview: ${v.typeDraft ?? v.type}. Rules: valid. (example result)`) }),
          h("button", {
            class: "bf-button",
            type: "button",
            text: "Apply Type",
            onclick: () => {
              const next = v.typeDraft ?? v.type;
              v.type = next;
              v.typeDraft = next;
              ctx.rerender();
              toastNow("Type", `Type applied to ${next}. Inactive typed defaults were preserved. (example result)`);
            }
          }),
          h("button", {
            class: "bf-button",
            type: "button",
            text: "Cancel Type",
            onclick: () => {
              v.typeDraft = v.type;
              ctx.rerender();
              toastNow("Type", `Type selection reverted to ${v.type}. No type change was applied.`);
            }
          })
        ),
        enumRow("Type", typeDraft, ["Boolean", "Integer", "Float", "String"], (value) => { v.typeDraft = value; }),
        v.type === "Boolean"
          ? toggleRow("Default Boolean", v.defaultBoolean ?? false, (value) => { v.defaultBoolean = value; ctx.rerender(); })
          : v.type === "Integer" || v.type === "Float"
            ? numberRow(
                v.type === "Integer" ? "Default Integer" : "Default Float",
                v.type === "Integer" ? v.defaultInteger ?? 0 : v.defaultFloat ?? 0.5,
                null,
                null,
                (value) => { if (v.type === "Integer") v.defaultInteger = value; else v.defaultFloat = value; }
              )
            : textRow("Default String", v.defaultString ?? "", (value) => { v.defaultString = value; }),
        toggleRow("Enable Validation Rules", v.rulesEnabled, (value) => { v.rulesEnabled = value; ctx.rerender(); }),
        v.rulesEnabled
          ? h(
              "div",
              null,
              toggleRow("Use Minimum", v.useMinimum ?? true, (value) => { v.useMinimum = value; ctx.rerender(); }),
              numberRow("Minimum", v.min, null, null, (value) => { v.min = value; }),
              toggleRow("Use Maximum", v.useMaximum ?? true, (value) => { v.useMaximum = value; ctx.rerender(); }),
              numberRow("Maximum", v.max, null, null, (value) => { v.max = value; }),
              toggleRow("Use Maximum Length", v.useMaximumLength ?? false, (value) => { v.useMaximumLength = value; ctx.rerender(); }),
              helper("Optional exact values. Empty or duplicate values are shown as local validation errors.")
            )
          : helper("Enable validation rules to author this collection.")
      ),
      h(
        "div",
        { class: "insp-card" },
        h("div", { class: "insp-card__title", text: "Dependencies & Store Scope" }),
        h("button", { class: "bf-button", type: "button", text: "Refresh Dependencies", onclick: (event) => toast(event, "Dependencies", "Dependency scan refreshed from the current project snapshot. (example result)") }),
        helper("Known references: 2 · Indeterminate external usage: 1"),
        h("div", { class: "bf-helper", text: "Condition: Assets/Beka Forge/Dialogue Graph System/Graphs/MarketGate.asset · node 9f2c41d8" }),
        h("div", { class: "bf-helper", text: "Store inline: Assets/Beka Forge/Dialogue Graph System/Scenes/MarketDemo.unity" }),
        h("div", { class: "pf-helpbox pf-helpbox--warning", text: "External/dynamic usage remains indeterminate." }),
        helper("No known DGS references in the current dependency context. (shown when the scan finds none)")
      )
    ),
    footer: h("div", { class: "bf-status-bar" }, h("span", { text: "Status: Validation: valid" }))
  });
}

function variableStore(ctx) {
  const s = ctx.state.inspectors.store;
  const toast = (event, title, message) => toastOn(event.currentTarget.closest(".up-window"), title, message);

  if (!s.drafts) s.drafts = {};
  const drafts = s.drafts;
  const rows = [
    { key: "market_gate_access", type: "Integer", current: "2", startup: "0", state: "changed", draft: "3" },
    { key: "quest_progress_ratio", type: "Float", current: "0.4", startup: "0.0", state: "default", draft: "" },
    { key: "player_name", type: "String", current: "Mara", startup: "Mara", state: "default", draft: "" },
    { key: "has_sanctum_key", type: "Boolean", current: "true", startup: "false", state: "changed", draft: "true" },
    { key: "market_visits", type: "Integer", current: "7", startup: "0", state: "default", draft: "" },
    { key: "banter_cooldown_remaining", type: "Float", current: "3.1", startup: "0.0", state: "default", draft: "" }
  ];

  return windowFrame({
    title: "Inspector · Dialogue Variable Store",
    className: "pf-window up-window--compact",
    body: h(
      "div",
      { class: "up-scroll", style: { padding: "14px", maxHeight: "760px" } },
      bekaForgeHeader("Dialogue Variable Store", "variables"),
      foldout("About this store", h(
        "div",
        null,
        h("div", { class: "bf-helper", text: "The lists below are optional startup defaults. They are applied on Awake and when ResetToInitialVariables is called." }),
        h("div", { class: "bf-helper", text: "Defaults do not trigger gameplay behavior by themselves. Read the store, subscribe to VariableChanged, or use dialogue actions for side effects." }),
        h("div", { class: "bf-helper", text: "Example: store.SetInt(\"gold\", 10) updates dialogue state for later reads or VariableChanged listeners." })
      ), false),
      field("Definition Assets (Optional)", h("div", { class: "bf-field__control" },
        h("div", { class: "bf-object-preview" }, h("span", { class: "bf-object-preview__icon" }), h("span", { class: "bf-object-preview__name", text: "market_gate_access (example)" })),
        h("div", { class: "bf-object-preview" }, h("span", { class: "bf-object-preview__icon" }), h("span", { class: "bf-object-preview__name", text: "quest_progress_ratio (example)" }))
      ), { tooltip: "Reusable variable assets used to seed runtime defaults." }),
      field("Inline Default Values (Optional)", h("div", { class: "bf-field__control" },
        h("div", { class: "bf-object-preview" }, h("span", { class: "bf-object-preview__icon" }), h("span", { class: "bf-object-preview__name", text: "player_name = \"Mara\" (example)" }))
      ), { tooltip: "Scene-local startup defaults applied after definition assets." }),
      h("div", { class: "insp-card" },
        h("div", { class: "insp-card__header" },
          h("span", { class: "insp-card__title", text: "Runtime Values (Play Mode)" }),
          badge(s.playing ? "Play Mode (example)" : "Edit Mode")
        ),
        field("Target Store", h("div", { class: "bf-field__control" }, h("div", { class: "bf-object-preview" }, h("span", { class: "bf-object-preview__icon" }), h("span", { class: "bf-object-preview__name", text: s.targetStore })))),
        h("div", { class: "insp-rtv__editbar" },
          toggleRow("Edit Runtime Values", s.runtimeEdit, (value) => { s.runtimeEdit = value; ctx.rerender(); }),
          h("button", { class: "bf-button", type: "button", text: "Reset All", onclick: (event) => toast(event, "Runtime Values", "Reset All would restore every configured startup value. Demo only.") })
        ),
        s.runtimeEdit ? h("div", { class: "pf-helpbox pf-helpbox--warning", text: "Temporary Play Mode values. Not saved to assets, scene defaults, or prefabs. Unity Undo is not supported." }) : null,
        h("div", { class: "bf-row", style: { flexWrap: "wrap", margin: "6px 0" } },
          h("span", { class: "insp-rtv__search" }, "Search", h("input", {
            class: "bf-input",
            type: "text",
            value: s.search,
            placeholder: "Filter variables",
            onchange: (event) => { s.search = event.target.value; ctx.rerender(); }
          })),
          h("label", { class: "bf-check-row" }, h("input", { class: "bf-check", type: "checkbox", checked: s.changedOnly, onchange: (event) => { s.changedOnly = event.target.checked; ctx.rerender(); } }), h("span", { text: "Changed Only" })),
          h("button", { class: "bf-button", type: "button", text: "Refresh Defaults", onclick: (event) => toast(event, "Runtime Values", "Refresh Defaults reloads the configured startup values. Demo only.") })
        ),
        h("div", { class: "bf-helper", text: s.status }),
        h("div", { class: "insp-rtv" },
          ...rows
            .filter((row) => !s.changedOnly || row.state === "changed")
            .filter((row) => !s.search || row.key.toLowerCase().includes(s.search.toLowerCase()))
            .map((row) =>
              h("div", { class: "insp-rtv__row" },
                h("span", { class: "insp-rtv__key", text: row.key }),
                h("span", { class: "insp-rtv__type", text: row.type }),
                h("span", { class: "insp-rtv__val", text: row.current }),
                h("span", { class: "insp-rtv__startup", text: `startup ${row.startup}` }),
                h("span", { class: `insp-rtv__state insp-rtv__state--${row.state}`, text: row.state }),
                s.runtimeEdit
                  ? h("span", { class: "insp-rtv__actions" },
                      textInput(drafts[row.key] ?? row.draft, (value) => { drafts[row.key] = value; }, { placeholder: "draft" }),
                      h("button", { class: "bf-button", type: "button", text: "Apply", onclick: (event) => toast(event, "Runtime Values", `Apply would write the draft for '${row.key}' to the live store. Demo only.`) }),
                      h("button", { class: "bf-button", type: "button", text: "Reset", onclick: (event) => toast(event, "Runtime Values", `Reset would restore the configured value for '${row.key}'. Demo only.`) }),
                      h("button", { class: "bf-button bf-button--danger", type: "button", text: "Remove", onclick: (event) => toast(event, "Runtime Values", `Remove would delete '${row.key}' from the live store. Demo only.`) })
                    )
                  : null
              )
            )
        ),
        h("div", { class: "bf-helper", text: "Row state changes to 'conflict' while a draft is pending and the runtime value moves. Refresh discards the draft; Reapply writes the preserved draft." }),
        h("div", { class: "bf-helper", text: "If the runtime type changed, Reset Value is unavailable and Reset All restores the configured value instead." })
      )
    ),
    footer: h("div", { class: "bf-status-bar" }, h("span", { text: "No store selected: \"No store selected. Choose a Dialogue Variable Store above to observe its live Play Mode values.\"" }))
  });
}

function nicify(name) {
  return name
    .replace(/^m_/, "")
    .replace(/^_+/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (character) => character.toUpperCase());
}

function soState(ctx, key, defaults) {
  const all = ctx.state.inspectors.assets || (ctx.state.inspectors.assets = {});
  const state = all[key] || (all[key] = {});
  for (const [name, value] of Object.entries(defaults)) {
    if (state[name] === undefined) state[name] = Array.isArray(value) ? value.slice() : value;
  }
  return state;
}

function soCard(title, ...children) {
  return h(
    "div",
    { class: "insp-card" },
    title ? h("div", { class: "insp-card__header" }, h("span", { class: "insp-card__title", text: title })) : null,
    ...children
  );
}

function soWindow(title, topic, editor, sections) {
  return windowFrame({
    title: `Inspector · ${title}`,
    className: "pf-window up-window--compact",
    body: h(
      "div",
      { class: "up-scroll", style: { padding: "14px", maxHeight: "820px" } },
      bekaForgeHeader(title, topic),
      ...sections,
      helper(`[CustomEditor(typeof(${editor}))] public sealed class ${editor} : DgsAssetSOEditor · DocumentationTopic \"${topic}\" · InspectorElement.FillDefaultInspector`)
    ),
    footer: h("div", { class: "bf-status-bar" }, h("span", { text: `BekaForgeInspectorHeader.Create(\"${title}\", \"${topic}\") · default serialized-field inspector` }))
  });
}

function objectField(label, typeName, value, tooltip) {
  return field(
    label,
    h(
      "div",
      { class: "up-insp-object" },
      h(
        "div",
        { class: "bf-object-preview" },
        h("span", { class: "bf-object-preview__icon" }),
        h("span", { class: "bf-object-preview__name", text: value || `None (${typeName})` })
      ),
      h("span", { class: "up-insp-object__type", text: typeName })
    ),
    { tooltip }
  );
}

function listField(label, items, renderElement, tooltip, options = {}) {
  return h(
    "div",
    { class: "bf-field bf-field--stacked up-insp-list" },
    h("label", { class: "bf-field__label", title: tooltip || "", text: label }),
    h(
      "div",
      { class: "bf-field__control up-insp-list__body" },
      h(
        "div",
        { class: "up-insp-list__meta" },
        h("span", { class: "up-insp-list__size-label", text: "Size" }),
        h("span", { class: "up-insp-list__size", text: String(items.length) }),
        options.itemType ? h("span", { class: "up-insp-object__type", text: options.itemType }) : null
      ),
      ...items.map((item, index) => renderElement(item, index))
    )
  );
}

function stringListField(label, items, tooltip) {
  return listField(
    label,
    items,
    (item, index) => textRow(`Element ${index}`, item, (value) => { items[index] = value; }, { tooltip }),
    tooltip,
    { itemType: "string" }
  );
}

function refListField(label, typeName, items, tooltip) {
  return listField(
    label,
    items,
    (item, index) => objectField(`Element ${index}`, typeName, item, tooltip),
    tooltip,
    { itemType: typeName }
  );
}

const KEY_CODE_OPTIONS = [
  "None", "Backspace", "Tab", "Return", "Escape", "Space",
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
  "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
  "Alpha0", "Alpha1", "Alpha2", "Alpha3", "Alpha4", "Alpha5", "Alpha6", "Alpha7", "Alpha8", "Alpha9",
  "Keypad0", "Keypad1", "Keypad2", "Keypad3", "Keypad4", "Keypad5", "Keypad6", "Keypad7", "Keypad8", "Keypad9",
  "KeypadEnter", "UpArrow", "DownArrow", "LeftArrow", "RightArrow",
  "LeftShift", "RightShift", "LeftControl", "RightControl", "LeftAlt", "RightAlt",
  "Mouse0", "Mouse1", "Mouse2", "Mouse3", "Mouse4", "Mouse5", "Mouse6",
  "Insert", "Delete", "Home", "End", "PageUp", "PageDown",
  "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"
];

function keyCodeOptions(value) {
  return KEY_CODE_OPTIONS.includes(value) ? KEY_CODE_OPTIONS : [value, ...KEY_CODE_OPTIONS];
}

function keyCodeField(label, value, onChange, tooltip) {
  return enumRow(label, value, keyCodeOptions(value), onChange, { tooltip });
}

function keyCodeListField(label, items, tooltip) {
  return listField(
    label,
    items,
    (item, index) => keyCodeField(`Element ${index}`, item, (value) => { items[index] = value; }, tooltip),
    tooltip,
    { itemType: "KeyCode" }
  );
}

function vector2Field(label, value, tooltip) {
  return field(
    label,
    h(
      "div",
      { class: "up-insp-vector" },
      h("span", { class: "up-insp-vector__axis", text: "X" }),
      textInput(value.x, (next) => { value.x = Number(next); }, { number: true }),
      h("span", { class: "up-insp-vector__axis", text: "Y" }),
      textInput(value.y, (next) => { value.y = Number(next); }, { number: true })
    ),
    { tooltip }
  );
}

function nestedFields(...children) {
  return h("div", { class: "up-insp-nested" }, ...children);
}

function dialogGraphAsset(ctx) {
  const s = soState(ctx, "dialog-graph", {
    graphTitle: "Market Gate",
    description: "The player reaches the market gate before dawn and must talk their way past the warden.",
    author: "Beka Forge Writing",
    tags: ["market", "act-1"],
    primaryCategory: "Story",
    categories: ["Story", "Market"],
    lastModifiedUtc: "2026-10-18T09:12:00Z",
    editorVersion: "6000.0.23f1",
    sceneGoal: "Establish the market gate as a guarded threshold.",
    tone: "Guarded, dry humour",
    extraRules: "The warden never steps outside the gatehouse.",
    startGuid: "93a1c70f58d84d1a9f7e2b6c4d8a0e35",
    startPosition: { x: -640, y: 120 },
    startInitialized: true,
    endGuid: "1b7e45d2c9a04f63b8e1d7a5c2f90b64",
    endPosition: { x: 840, y: 120 },
    endInitialized: true
  });
  const links = [
    { fromGuid: "93a1c70f58d84d1a9f7e2b6c4d8a0e35", toGuid: "9f2c41d8b3e746a1a5c02f7e8d3b1c64", fromPortKey: "default", toPortKey: "default", fromPortIndex: 0 }
  ];
  const nodeLists = [
    ["Nodes", "DialogNode", ["Gate Warden Greeting (example)"]],
    ["Choice Nodes", "ChoiceNode", ["Sanctum Key Choice (example)"]],
    ["Action Nodes", "ActionNode", ["Unlock Gate (example)"]],
    ["Condition Nodes", "ConditionNode", ["Has Sanctum Key (example)"]],
    ["Variable Mutation Nodes", "VariableMutationNode", ["Set Market Visits (example)"]],
    ["Graph Jump Nodes", "GraphJumpNode", ["Return To Market (example)"]],
    ["Outcome Nodes", "OutcomeNode", ["Gate Opened (example)"]],
    ["Camera Switch Nodes", "CameraSwitchNode", ["Switch To Gate Rig (example)"]],
    ["Camera Move Nodes", "CameraMoveNode", ["Dolly To Gate (example)"]],
    ["Camera Look At Nodes", "CameraLookAtNode", ["Look At Warden (example)"]],
    ["Camera Follow Point Nodes", "CameraFollowPointNode", ["Follow Gate Marker (example)"]],
    ["Camera Follow Target Nodes", "CameraFollowTargetNode", ["Follow Warden (example)"]],
    ["Camera Shake Nodes", "CameraShakeNode", ["Gate Rumble (example)"]],
    ["Camera Restore Nodes", "CameraRestoreNode", ["Restore Market Camera (example)"]],
    ["Random Branch Nodes", "RandomBranchNode", ["Warden Mood (example)"]],
    ["Switch Nodes", "SwitchNode", ["Reputation Switch (example)"]],
    ["Wait Nodes", "WaitNode", ["Beat (example)"]],
    ["Wait For Nodes", "WaitForNode", ["Signal Ready (example)"]]
  ];

  return soWindow("Dialog Graph", "dialogue-graphs", "DialogGraphSOEditor", [
    soCard(
      "Graph Metadata",
      textRow("Graph Title", s.graphTitle, (value) => { s.graphTitle = value; }, { tooltip: "Optional human-readable graph title." }),
      multilineRow("Description", s.description, (value) => { s.description = value; }, { tooltip: "Optional graph description for authoring and documentation.", rows: 5 }),
      textRow("Author", s.author, (value) => { s.author = value; }, { tooltip: "Optional author name for this graph." }),
      stringListField("Tags", s.tags, "Optional tags used by editor tooling."),
      textRow("Primary Category", s.primaryCategory, (value) => { s.primaryCategory = value; }, { tooltip: "Optional primary category used by editor tooling." }),
      stringListField("Categories", s.categories, "Optional category labels used by editor tooling."),
      textRow("Last Modified Utc", s.lastModifiedUtc, (value) => { s.lastModifiedUtc = value; }, { tooltip: "Optional ISO-8601 UTC timestamp for the last editor-side metadata update." }),
      textRow("Editor Version", s.editorVersion, (value) => { s.editorVersion = value; }, { tooltip: "Optional Unity editor version that last updated graph metadata." })
    ),
    soCard(
      null,
      listField("Links", links, (link, index) => foldout(
        `Element ${index}`,
        nestedFields(
          textRow("From Guid", link.fromGuid, (value) => { link.fromGuid = value; }, { tooltip: "Source node GUID." }),
          textRow("To Guid", link.toGuid, (value) => { link.toGuid = value; }, { tooltip: "Destination node GUID." }),
          textRow("From Port Key", link.fromPortKey, (value) => { link.fromPortKey = value; }, { tooltip: "Stable output port key on the source node. Legacy links may leave this blank and use fromPortIndex." }),
          textRow("To Port Key", link.toPortKey, (value) => { link.toPortKey = value; }, { tooltip: "Stable input port key on the destination node. Usually \"default\" for current node types." }),
          numberRow("From Port Index", link.fromPortIndex, 0, null, (value) => { link.fromPortIndex = value; }, { tooltip: "Output port index on the source node (0 for dialog/auto, choice index for choices)." })
        ),
        index === 0
      ), "Directed links connecting nodes by GUID.", { itemType: "GraphLink" })
    ),
    soCard(
      "Nodes",
      ...nodeLists.map(([label, typeName, items], index) => refListField(label, typeName, items, [
        "All Dialog nodes in this graph.",
        "All Choice nodes in this graph.",
        "All Action nodes in this graph.",
        "All Condition nodes in this graph.",
        "All Variable Mutation nodes in this graph.",
        "All Graph Jump nodes in this graph.",
        "All Outcome nodes in this graph. Hidden runtime flow nodes that record a named ending result.",
        "All Camera Switch nodes in this graph.",
        "All Camera Move nodes in this graph.",
        "All Camera Look At nodes in this graph.",
        "All Camera Follow Point nodes in this graph.",
        "All Camera Follow Target nodes in this graph.",
        "All Camera Shake nodes in this graph.",
        "All Camera Restore nodes in this graph.",
        "All Random Branch nodes in this graph.",
        "All Switch nodes in this graph.",
        "All Wait nodes in this graph.",
        "All Wait For nodes in this graph."
      ][index]))
    ),
    soCard(
      "Scene Context",
      objectField("Scene Context", "DialogSceneContextSO", "Market Gate Context (example)", "Optional reusable scene context asset assigned to this graph."),
      objectField("Environment", "DialogEnvironmentSO", "Market Gate (example)", "Environment used by this graph."),
      refListField("Participating Characters", "DialogCharacterSO", ["Gate Warden (example)", "Market Vendor (example)"], "Characters participating in this graph."),
      refListField("Available Actions", "DialogActionSO", ["Unlock Gate (example)"], "Actions available to this graph."),
      refListField("Available Variables", "DialogVariableSO", ["market_gate_access (example)"], "Variables available to this graph."),
      multilineRow("Scene Goal", s.sceneGoal, (value) => { s.sceneGoal = value; }, { tooltip: "Narrative goal for this scene.", rows: 5 }),
      textRow("Tone", s.tone, (value) => { s.tone = value; }, { tooltip: "Tone guidance for this scene." }),
      multilineRow("Extra Rules", s.extraRules, (value) => { s.extraRules = value; }, { tooltip: "Extra authoring rules for this scene.", rows: 5 })
    ),
    soCard(
      "Start (Editor)",
      textRow("Start Guid", s.startGuid, (value) => { s.startGuid = value; }, { tooltip: "GUID of the Start marker; runtime follows its outgoing link to the first playable node." }),
      vector2Field("Start Position", s.startPosition, "Editor layout position of the Start marker."),
      toggleRow("Start Initialized", s.startInitialized, (value) => { s.startInitialized = value; }, { tooltip: "Editor bookkeeping flag for Start placement." })
    ),
    soCard(
      "End (Editor)",
      textRow("End Guid", s.endGuid, (value) => { s.endGuid = value; }, { tooltip: "GUID of the End marker." }),
      vector2Field("End Position", s.endPosition, "Editor layout position of the End marker."),
      toggleRow("End Initialized", s.endInitialized, (value) => { s.endInitialized = value; }, { tooltip: "Editor bookkeeping flag for End placement." })
    )
  ]);
}

function dialogTextSettingsAsset(ctx) {
  const s = soState(ctx, "text-settings", {
    typewriterEffect: "Typing",
    charsPerSecond: 35,
    allowSkipAll: true,
    allowSkipCurrentLine: true,
    allowFastForwardHold: true,
    fastForwardMultiplier: 3,
    autoAdvance: false,
    autoAdvanceDelay: 0.75,
    commaPause: 0.08,
    periodPause: 0.16,
    questionPause: 0.18,
    exclamationPause: 0.18
  });

  return soWindow("Dialog Text Settings", "settings", "DialogTextSettingsEditor", [
    soCard(
      "Typewriter",
      enumRow("Typewriter Effect", s.typewriterEffect, ["None", "Typing", "WordByWord", "FadeIn", "FadeTyping"], (value) => { s.typewriterEffect = value; }, { tooltip: "Visual effect used to reveal dialog text." }),
      sliderRow("Chars Per Second", s.charsPerSecond, 1, 120, 1, (value) => { s.charsPerSecond = value; }, { tooltip: "Characters per second when using a progressive effect (e.g. Typing).", rangeText: "Range 1–120" })
    ),
    soCard(
      "Skip",
      toggleRow("Allow Skip All", s.allowSkipAll, (value) => { s.allowSkipAll = value; }, { tooltip: "Allow skipping and ending the entire conversation." }),
      toggleRow("Allow Skip Current Line", s.allowSkipCurrentLine, (value) => { s.allowSkipCurrentLine = value; }, { tooltip: "Allow user input to reveal the current line instantly." })
    ),
    soCard(
      "Fast-Forward",
      toggleRow("Allow Fast-Forward Hold", s.allowFastForwardHold, (value) => { s.allowFastForwardHold = value; }, { tooltip: "Holding the fast-forward key increases the typewriter speed." }),
      sliderRow("Fast Forward Multiplier", s.fastForwardMultiplier, 1, 8, 0.1, (value) => { s.fastForwardMultiplier = value; }, { tooltip: "Multiplier applied to chars-per-second while fast-forward is held.", rangeText: "Range 1–8" })
    ),
    soCard(
      "Auto Advance",
      toggleRow("Auto Advance", s.autoAdvance, (value) => { s.autoAdvance = value; }, { tooltip: "If enabled, nodes advance automatically after display time." }),
      numberRow("Auto Advance Delay", s.autoAdvanceDelay, 0, null, (value) => { s.autoAdvanceDelay = value; }, { tooltip: "Delay after a line finishes before auto-advancing when node has no displayTime." })
    ),
    soCard(
      "Punctuation Pauses (seconds)",
      numberRow("Comma Pause", s.commaPause, 0, null, (value) => { s.commaPause = value; }),
      numberRow("Period Pause", s.periodPause, 0, null, (value) => { s.periodPause = value; }),
      numberRow("Question Pause", s.questionPause, 0, null, (value) => { s.questionPause = value; }),
      numberRow("Exclamation Pause", s.exclamationPause, 0, null, (value) => { s.exclamationPause = value; })
    )
  ]);
}

function dialogChoiceSettingsAsset(ctx) {
  const s = soState(ctx, "choice-settings", {
    doDebug: false,
    wrapNavigation: true,
    holdRepeatDelay: 0.15,
    selectFirstOnEnable: true,
    mouseHoverMovesSelection: true,
    selectedOutlineColor: "#FFFFFF",
    outlineThickness: 1,
    animateSelected: true,
    animatePulseScale: 1.02,
    animatePulseSpeed: 0.35,
    showKeyHints: true,
    enableKeyboardConfirmKey: true,
    keyboardConfirmLetter: "F",
    alsoAcceptSubmit: true,
    acceptGamepadConfirm: true,
    acceptXRSelect: true
  });

  return soWindow("Dialog Choice Settings", "settings", "DialogChoiceSettingsEditor", [
    soCard(
      null,
      toggleRow("Do Debug", s.doDebug, (value) => { s.doDebug = value; })
    ),
    soCard(
      "Navigation",
      toggleRow("Wrap Navigation", s.wrapNavigation, (value) => { s.wrapNavigation = value; }),
      numberRow("Hold Repeat Delay", s.holdRepeatDelay, 0.01, null, (value) => { s.holdRepeatDelay = value; }),
      toggleRow("Select First On Enable", s.selectFirstOnEnable, (value) => { s.selectFirstOnEnable = value; }),
      toggleRow("Mouse Hover Moves Selection", s.mouseHoverMovesSelection, (value) => { s.mouseHoverMovesSelection = value; })
    ),
    soCard(
      "Visuals",
      colorRow("Selected Outline Color", s.selectedOutlineColor, (value) => { s.selectedOutlineColor = value; }),
      sliderRow("Outline Thickness", s.outlineThickness, 0.5, 10, 0.1, (value) => { s.outlineThickness = value; }, { rangeText: "Range 0.5–10" }),
      toggleRow("Animate Selected", s.animateSelected, (value) => { s.animateSelected = value; }),
      sliderRow("Animate Pulse Scale", s.animatePulseScale, 1, 1.2, 0.01, (value) => { s.animatePulseScale = value; }, { rangeText: "Range 1.0–1.2" }),
      sliderRow("Animate Pulse Speed", s.animatePulseSpeed, 0.25, 3, 0.01, (value) => { s.animatePulseSpeed = value; }, { rangeText: "Range 0.25–3" })
    ),
    soCard(
      "Hints & Confirm",
      toggleRow("Show Key Hints", s.showKeyHints, (value) => { s.showKeyHints = value; }),
      toggleRow("Enable Keyboard Confirm Key", s.enableKeyboardConfirmKey, (value) => { s.enableKeyboardConfirmKey = value; }, { tooltip: "Allow confirming with a specific keyboard or mouse key." }),
      textRow("Keyboard Confirm Letter", s.keyboardConfirmLetter, (value) => { s.keyboardConfirmLetter = value; }, { tooltip: "KeyCode name used to confirm the highlighted choice. Legacy single-letter values are still supported." }),
      toggleRow("Also Accept Submit", s.alsoAcceptSubmit, (value) => { s.alsoAcceptSubmit = value; }),
      toggleRow("Accept Gamepad Confirm", s.acceptGamepadConfirm, (value) => { s.acceptGamepadConfirm = value; }),
      toggleRow("Accept XR Select", s.acceptXRSelect, (value) => { s.acceptXRSelect = value; })
    )
  ]);
}

function dialogAudioSettingsAsset(ctx) {
  const s = soState(ctx, "audio-settings", {
    voiceVolume: 0.85,
    sfxVolume: 0.9,
    masterVolume: 1,
    banterVolume: 1,
    backgroundVolume: 1,
    wallaVolume: 1,
    enableUiSfx: true,
    sfxNavigate: "ui-navigate-01 (example)",
    sfxConfirm: "ui-confirm-01 (example)",
    sfxSkip: "ui-skip-01 (example)",
    stopOnSkipAll: true,
    fadeOutOnStop: true,
    fadeOutTime: 0.08,
    enableTypewriterAudio: false,
    typewriterClip: "typewriter-tick-soft (example)",
    typewriterPlayEveryNChars: 1,
    typewriterVolume: 0.5,
    typewriterPitchVariance: 0.05,
    typewriterMinInterval: 0.02,
    typewriterIgnoreWhitespace: true,
    typewriterIgnoreRichTextTags: true
  });

  return soWindow("Dialog Audio Settings", "settings", "DialogAudioSettingsEditor", [
    soCard(
      "Volumes",
      sliderRow("Voice Volume", s.voiceVolume, 0, 1, 0.01, (value) => { s.voiceVolume = value; }, { rangeText: "Range 0–1" }),
      sliderRow("Sfx Volume", s.sfxVolume, 0, 1, 0.01, (value) => { s.sfxVolume = value; }, { rangeText: "Range 0–1" }),
      sliderRow("Master Volume", s.masterVolume, 0, 1, 0.01, (value) => { s.masterVolume = value; }, { rangeText: "Range 0–1" }),
      sliderRow("Banter Volume", s.banterVolume, 0, 1, 0.01, (value) => { s.banterVolume = value; }, { rangeText: "Range 0–1" }),
      sliderRow("Background Volume", s.backgroundVolume, 0, 1, 0.01, (value) => { s.backgroundVolume = value; }, { rangeText: "Range 0–1" }),
      sliderRow("Walla Volume", s.wallaVolume, 0, 1, 0.01, (value) => { s.wallaVolume = value; }, { rangeText: "Range 0–1" })
    ),
    soCard(
      "UI SFX",
      toggleRow("Enable Ui Sfx", s.enableUiSfx, (value) => { s.enableUiSfx = value; }),
      objectField("Sfx Navigate", "AudioClip", s.sfxNavigate),
      objectField("Sfx Confirm", "AudioClip", s.sfxConfirm),
      objectField("Sfx Skip", "AudioClip", s.sfxSkip)
    ),
    soCard(
      "Stop & Fade Behaviour",
      toggleRow("Stop On Skip All", s.stopOnSkipAll, (value) => { s.stopOnSkipAll = value; }, { tooltip: "If the player skips the entire conversation, stop audio immediately." }),
      toggleRow("Fade Out On Stop", s.fadeOutOnStop, (value) => { s.fadeOutOnStop = value; }, { tooltip: "Fade out audio when stopping instead of cutting instantly." }),
      sliderRow("Fade Out Time", s.fadeOutTime, 0, 1, 0.01, (value) => { s.fadeOutTime = value; }, { tooltip: "Fade-out time in seconds when stopping audio with fade.", rangeText: "Range 0–1" })
    ),
    soCard(
      "Typewriter Audio",
      toggleRow("Enable Typewriter Audio", s.enableTypewriterAudio, (value) => { s.enableTypewriterAudio = value; }, { tooltip: "Play a sound for each revealed character during typewriter effect." }),
      objectField("Typewriter Clip", "AudioClip", s.typewriterClip, "Clip played for each revealed character."),
      numberRow("Typewriter Play Every N Chars", s.typewriterPlayEveryNChars, 1, null, (value) => { s.typewriterPlayEveryNChars = value; }, { tooltip: "Play a sound every N visible characters. 1 = every character." }),
      sliderRow("Typewriter Volume", s.typewriterVolume, 0, 1, 0.01, (value) => { s.typewriterVolume = value; }, { tooltip: "Volume of the per-character typewriter sound.", rangeText: "Range 0–1" }),
      sliderRow("Typewriter Pitch Variance", s.typewriterPitchVariance, 0, 0.5, 0.01, (value) => { s.typewriterPitchVariance = value; }, { tooltip: "Randomly shift pitch by ±this amount each sound. 0 = no randomization.", rangeText: "Range 0–0.5" }),
      numberRow("Typewriter Min Interval", s.typewriterMinInterval, 0, null, (value) => { s.typewriterMinInterval = value; }, { tooltip: "Minimum seconds that must pass between two typewriter sounds, regardless of speed. Prevents audio spam when CPS is very high." }),
      toggleRow("Typewriter Ignore Whitespace", s.typewriterIgnoreWhitespace, (value) => { s.typewriterIgnoreWhitespace = value; }, { tooltip: "Skip typewriter sound when the revealed character is whitespace (space, tab, newline)." }),
      toggleRow("Typewriter Ignore Rich Text Tags", s.typewriterIgnoreRichTextTags, (value) => { s.typewriterIgnoreRichTextTags = value; }, { tooltip: "Skip typewriter sound when the revealed character is inside a rich-text tag (e.g. <b>, <color=…>)." })
    )
  ]);
}

function dialogInputSettingsAsset(ctx) {
  const s = soState(ctx, "input-settings", {
    lineAdvanceKey: "Space",
    confirmKeys: ["Return", "Space", "E", "F"],
    skipKeys: ["LeftControl", "RightControl"],
    fastForwardKeys: ["LeftShift", "RightShift"],
    cancelKeys: ["Escape"],
    navUpKeys: ["W", "UpArrow"],
    navDownKeys: ["S", "DownArrow"],
    verticalAxis: "Vertical",
    joystickConfirmButton: 0,
    allowMouseClickConfirm: true
  });

  return soWindow("Dialog Input Settings", "settings", "DialogInputSettingsEditor", [
    soCard(
      "Line Advance",
      keyCodeField("Line Advance Key", s.lineAdvanceKey, (value) => { s.lineAdvanceKey = value; }, "Keyboard key used to skip the current line or advance to the next line. Mouse/touch continue remains controlled separately.")
    ),
    soCard(
      "Keys (Keyboard)",
      keyCodeListField("Confirm Keys", s.confirmKeys),
      keyCodeListField("Skip Keys", s.skipKeys),
      keyCodeListField("Fast Forward Keys", s.fastForwardKeys),
      keyCodeListField("Cancel Keys", s.cancelKeys)
    ),
    soCard(
      "Navigation (Keyboard)",
      keyCodeListField("Nav Up Keys", s.navUpKeys),
      keyCodeListField("Nav Down Keys", s.navDownKeys)
    ),
    soCard(
      "Axes / Gamepad",
      textRow("Vertical Axis", s.verticalAxis, (value) => { s.verticalAxis = value; }),
      numberRow("Joystick Confirm Button", s.joystickConfirmButton, 0, null, (value) => { s.joystickConfirmButton = value; }, { tooltip: "JoystickButton index for confirm (0 = A on many pads)." })
    ),
    soCard(
      "Mouse",
      toggleRow("Allow Mouse Click Confirm", s.allowMouseClickConfirm, (value) => { s.allowMouseClickConfirm = value; })
    )
  ]);
}

function dialogVoiceTableAsset(ctx) {
  const s = soState(ctx, "voice-table", { locale: "en" });
  const entries = [
    {
      lineId: "MARKET-GATE-WARDEN-0001",
      variants: [
        { state: "Rested", clip: "gate-warden-greeting-01 (example)", takeNumber: 1, performer: "Nadia Vale", recordingNotes: "Warm, guarded.", sourceFile: "VO/gate_warden/greeting_01.wav" },
        { state: "Tired", clip: "gate-warden-greeting-01-tired (example)", takeNumber: 2, performer: "Nadia Vale", recordingNotes: "Slower, lower energy.", sourceFile: "VO/gate_warden/greeting_01_tired.wav" }
      ]
    }
  ];

  return soWindow("Dialog Voice Table SO", "audio", "DialogVoiceTableSOEditor", [
    soCard(
      null,
      textRow("Locale", s.locale, (value) => { s.locale = value; }),
      listField("Entries", entries, (entry, index) => foldout(
        `Element ${index}`,
        nestedFields(
          textRow("Line Id", entry.lineId, (value) => { entry.lineId = value; }),
          listField("Variants", entry.variants, (variant, variantIndex) => foldout(
            `Element ${variantIndex}`,
            nestedFields(
              enumRow("State", variant.state, ["Rested", "Tired", "Exhausted", "Injured"], (value) => { variant.state = value; }),
              objectField("Clip", "AudioClip", variant.clip),
              numberRow("Take Number", variant.takeNumber, 1, null, (value) => { variant.takeNumber = value; }),
              textRow("Performer", variant.performer, (value) => { variant.performer = value; }),
              textRow("Recording Notes", variant.recordingNotes, (value) => { variant.recordingNotes = value; }),
              textRow("Source File", variant.sourceFile, (value) => { variant.sourceFile = value; })
            ),
            variantIndex === 0
          ), undefined, { itemType: "DialogVoiceVariant" })
        ),
        index === 0
      ), undefined, { itemType: "DialogVoiceEntry" })
    )
  ]);
}

function dialogDeliveryPresetAsset(ctx) {
  const s = soState(ctx, "delivery-preset", {
    delivery: {
      enabled: true,
      naturalCharactersPerSecond: 35,
      cadence: "Conversational",
      commaPauseMultiplier: 1,
      sentencePauseMultiplier: 1,
      ellipsisPauseMultiplier: 1,
      questionPauseMultiplier: 1,
      emphasisPauseMultiplier: 1,
      commaPauseSeconds: 0.2,
      sentencePauseSeconds: 0.35,
      ellipsisPauseSeconds: 0.5,
      questionPauseSeconds: 0.35,
      emphasisPauseSeconds: 0.35,
      minimumPauseSeconds: 0.04,
      maximumPauseSeconds: 1.5,
      cadenceVariation: 0.15
    }
  });
  const d = s.delivery;

  return soWindow("Dialog Delivery Preset SO", "delivery", "DialogDeliveryPresetSOEditor", [
    soCard(
      null,
      foldout("Delivery", nestedFields(
        toggleRow("Enabled", d.enabled, (value) => { d.enabled = value; }),
        numberRow("Natural Characters Per Second", d.naturalCharactersPerSecond, 0, null, (value) => { d.naturalCharactersPerSecond = value; }),
        enumRow("Cadence", d.cadence, ["Even", "Measured", "Conversational", "Energetic", "Hesitant", "Custom"], (value) => { d.cadence = value; }),
        numberRow("Comma Pause Multiplier", d.commaPauseMultiplier, 0, null, (value) => { d.commaPauseMultiplier = value; }),
        numberRow("Sentence Pause Multiplier", d.sentencePauseMultiplier, 0, null, (value) => { d.sentencePauseMultiplier = value; }),
        numberRow("Ellipsis Pause Multiplier", d.ellipsisPauseMultiplier, 0, null, (value) => { d.ellipsisPauseMultiplier = value; }),
        numberRow("Question Pause Multiplier", d.questionPauseMultiplier, 0, null, (value) => { d.questionPauseMultiplier = value; }),
        numberRow("Emphasis Pause Multiplier", d.emphasisPauseMultiplier, 0, null, (value) => { d.emphasisPauseMultiplier = value; }),
        numberRow("Comma Pause Seconds", d.commaPauseSeconds, 0, null, (value) => { d.commaPauseSeconds = value; }),
        numberRow("Sentence Pause Seconds", d.sentencePauseSeconds, 0, null, (value) => { d.sentencePauseSeconds = value; }),
        numberRow("Ellipsis Pause Seconds", d.ellipsisPauseSeconds, 0, null, (value) => { d.ellipsisPauseSeconds = value; }),
        numberRow("Question Pause Seconds", d.questionPauseSeconds, 0, null, (value) => { d.questionPauseSeconds = value; }),
        numberRow("Emphasis Pause Seconds", d.emphasisPauseSeconds, 0, null, (value) => { d.emphasisPauseSeconds = value; }),
        numberRow("Minimum Pause Seconds", d.minimumPauseSeconds, 0, null, (value) => { d.minimumPauseSeconds = value; }),
        numberRow("Maximum Pause Seconds", d.maximumPauseSeconds, 0, null, (value) => { d.maximumPauseSeconds = value; }),
        sliderRow("Cadence Variation", d.cadenceVariation, 0, 1, 0.01, (value) => { d.cadenceVariation = value; }, { rangeText: "Range 0–1" })
      ), true)
    )
  ]);
}

function dialogEnvironmentAsset(ctx) {
  const s = soState(ctx, "environment", {
    environmentID: "market_gate",
    displayName: "Market Gate",
    description: "A timber gatehouse at the edge of the dawn market.",
    atmosphere: "Tense",
    canonRules: "The gate closes at noon and reopens after the evening bell.",
    defaultTone: "Neutral",
    timeOfDay: "Dusk",
    tags: ["exterior", "market"]
  });

  return soWindow("Dialog Environment SO", "scene-context", "DialogEnvironmentSOEditor", [
    soCard(
      "Identity",
      textRow("Environment ID", s.environmentID, (value) => { s.environmentID = value; }, { tooltip: "Stable identifier used to reference this environment." }),
      textRow("Display Name", s.displayName, (value) => { s.displayName = value; }, { tooltip: "Human-readable environment name." })
    ),
    soCard(
      "Description",
      multilineRow("Description", s.description, (value) => { s.description = value; }, { tooltip: "Short description of the location or setup.", rows: 5 }),
      textRow("Atmosphere", s.atmosphere, (value) => { s.atmosphere = value; }, { tooltip: "Atmosphere of the scene such as tense, warm, or eerie." }),
      multilineRow("Canon Rules", s.canonRules, (value) => { s.canonRules = value; }, { tooltip: "World or canon rules that apply in this environment.", rows: 5 }),
      textRow("Default Tone", s.defaultTone, (value) => { s.defaultTone = value; }, { tooltip: "Default tone to use when no scene-specific tone overrides it." })
    ),
    soCard(
      "Legacy Context",
      textRow("Time Of Day", s.timeOfDay, (value) => { s.timeOfDay = value; }, { tooltip: "Optional time-of-day detail preserved for existing assets." }),
      stringListField("Tags", s.tags, "Optional environment tags preserved for existing assets.")
    )
  ]);
}

function dialogSceneContextAsset(ctx) {
  const s = soState(ctx, "scene-context", {
    sceneGoal: "Get the player through the gate without raising the alarm.",
    tone: "Tense",
    extraRules: "The warden stays inside the gatehouse."
  });

  return soWindow("Dialog Scene Context SO", "scene-context", "DialogSceneContextSOEditor", [
    soCard(
      "References",
      objectField("Environment", "DialogEnvironmentSO", "Market Gate (example)", "Environment definition for this scene."),
      refListField("Participating Characters", "DialogCharacterSO", ["Gate Warden (example)", "Market Vendor (example)"], "Characters that can participate in this scene."),
      refListField("Available Actions", "DialogActionSO", ["Unlock Gate (example)"], "Actions that are available in this scene.")
    ),
    soCard(
      "Scene Intent",
      multilineRow("Scene Goal", s.sceneGoal, (value) => { s.sceneGoal = value; }, { tooltip: "What the scene should accomplish narratively.", rows: 5 }),
      textRow("Tone", s.tone, (value) => { s.tone = value; }, { tooltip: "Scene-level tone override." }),
      multilineRow("Extra Rules", s.extraRules, (value) => { s.extraRules = value; }, { tooltip: "Additional authoring rules or constraints for this scene.", rows: 5 })
    )
  ]);
}

function dialogLocalizationTableAsset(ctx) {
  const s = soState(ctx, "localization-table", {
    localeCode: "en-US",
    isSourceLanguage: true,
    sourceRevisionVersion: "dgs-text-hash-1"
  });
  const entries = [
    {
      key: "npc_001.line_003.text",
      value: "Hold there, traveller. The sanctum keys were spoken with, not spoken for.",
      sourceRevision: "f3c2a7d8e91b4c6a0d5e8f7a1b2c3d4e5f60718293a4b5c6d7e8f9012345abcd",
      reviewedAtUtc: "2026-10-17T14:05:00Z",
      reviewedBy: "manual-edit"
    },
    {
      key: "npc_001.choice_001.text",
      value: "Show the sanctum key.",
      sourceRevision: "9b8a7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b",
      reviewedAtUtc: "",
      reviewedBy: ""
    }
  ];

  return soWindow("Dialog Localization Table", "localization", "DialogLocalizationTableEditor", [
    soCard(
      "Locale",
      textRow("Locale Code", s.localeCode, (value) => { s.localeCode = value; }, { tooltip: "BCP 47 locale code, e.g. 'en-US', 'fr-FR', 'ja-JP'." }),
      toggleRow("Is Source Language", s.isSourceLanguage, (value) => { s.isSourceLanguage = value; }, { tooltip: "Mark this table as the source / default language. Only one table should be the source." })
    ),
    soCard(
      "Entries",
      listField("Entries", entries, (entry, index) => foldout(
        `Element ${index}`,
        nestedFields(
          textRow("Key", entry.key, (value) => { entry.key = value; }),
          textRow("Value", entry.value, (value) => { entry.value = value; }),
          textRow("Source Revision", entry.sourceRevision, (value) => { entry.sourceRevision = value; }),
          textRow("Reviewed At Utc", entry.reviewedAtUtc, (value) => { entry.reviewedAtUtc = value; }),
          textRow("Reviewed By", entry.reviewedBy, (value) => { entry.reviewedBy = value; })
        ),
        index === 0
      ), undefined, { itemType: "LocalizationEntry" }),
      textRow("Source Revision Version", s.sourceRevisionVersion, (value) => { s.sourceRevisionVersion = value; }, { tooltip: "Fingerprint definition the stored source revisions were produced under, e.g. 'dgs-text-hash-1'. Empty means unattributable: the table predates versioned revisions, or nothing has stamped it yet." })
    )
  ]);
}

function dialogLocalizationRuntimeSettingsAsset(ctx) {
  const s = soState(ctx, "localization-runtime-settings", {
    defaultLocaleCode: "en-US",
    rememberPlayerChoice: true,
    playerPrefsKey: "DialogSystem.Locale"
  });
  const localeDisplayNames = [
    { localeCode: "fr-FR", displayName: "Français" }
  ];

  return soWindow("Dialog Localization Runtime Settings", "localization", "DialogLocalizationRuntimeSettingsEditor", [
    soCard(
      null,
      textRow("Default Locale Code", s.defaultLocaleCode, (value) => { s.defaultLocaleCode = value; }, { tooltip: "Default/source locale used when there is no saved player choice." }),
      toggleRow("Remember Player Choice", s.rememberPlayerChoice, (value) => { s.rememberPlayerChoice = value; }, { tooltip: "Remember the selected language in PlayerPrefs." }),
      textRow("Player Prefs Key", s.playerPrefsKey, (value) => { s.playerPrefsKey = value; }, { tooltip: "PlayerPrefs key used for the selected locale code." }),
      refListField("Localization Tables", "DialogLocalizationTable", ["en-US (example)", "fr-FR (example)"], "Localization tables available to runtime language selectors."),
      listField("Locale Display Names", localeDisplayNames, (entry, index) => foldout(
        `Element ${index}`,
        nestedFields(
          textRow("Locale Code", entry.localeCode, (value) => { entry.localeCode = value; }),
          textRow("Display Name", entry.displayName, (value) => { entry.displayName = value; })
        ),
        index === 0
      ), "Optional display names that override CultureInfo names in runtime dropdowns.", { itemType: "LocaleDisplayName" })
    )
  ]);
}

function dialogWelcomeBrandingAsset(ctx) {
  const s = soState(ctx, "welcome-branding", {
    productName: "Dialogue Graph System",
    shortDescription: "Visual dialogue graphs for Unity with a production-ready runtime and editor workflow.",
    versionOverride: "",
    developerName: "Beka Forge",
    brandIcon: "brand-mark (example sprite)",
    bannerImage: "welcome-banner (example sprite)",
    documentationUrl: "https://bekaforge.com/dgs-docs/",
    discordUrl: "https://discord.gg/bekaforge",
    websiteUrl: "https://bekaforge.com",
    supportContact: "support@bekaforge.com",
    changelogUrl: "https://bekaforge.com/dgs-changelog",
    reviewUrl: "https://bekaforge.com/dgs-review",
    primaryButtonLabel: "Open Documentation",
    secondaryButtonLabel: "Close",
    dontShowAgainLabel: "Don't show again",
    footerText: "Dialogue Graph System · Beka Forge",
    releaseNotes: "- Open the graph editor from the Tools menu.\n- Review the sample graph assets.\n- Configure settings before shipping.",
    showOnEditorStartup: true,
    repeatMode: "PerMajorMinorVersion"
  });

  return soWindow("Dialog Welcome Branding SO", "branding", "DialogWelcomeBrandingSOEditor", [
    soCard(
      "Identity",
      textRow("Product Name", s.productName, (value) => { s.productName = value; }, { tooltip: "Main product name shown in the welcome window." }),
      multilineRow("Short Description", s.shortDescription, (value) => { s.shortDescription = value; }, { tooltip: "Short summary shown under the product name.", rows: 4 }),
      textRow("Version Override", s.versionOverride, (value) => { s.versionOverride = value; }, { tooltip: "Optional version label override. Leave empty to use the main Dialogue Graph System settings version when available." }),
      textRow("Developer Name", s.developerName, (value) => { s.developerName = value; }, { tooltip: "Optional developer or studio name shown in the welcome header." })
    ),
    soCard(
      "Visuals",
      objectField("Brand Icon", "Sprite", s.brandIcon, "Optional square logo or brand mark."),
      objectField("Banner Image", "Sprite", s.bannerImage, "Optional wide banner image displayed at the top of the window.")
    ),
    soCard(
      "Links",
      textRow("Documentation Url", s.documentationUrl, (value) => { s.documentationUrl = value; }, { tooltip: "Documentation or quick-start URL." }),
      textRow("Discord Url", s.discordUrl, (value) => { s.discordUrl = value; }, { tooltip: "Discord invite URL." }),
      textRow("Website Url", s.websiteUrl, (value) => { s.websiteUrl = value; }, { tooltip: "Primary website or landing page URL." }),
      textRow("Support Contact", s.supportContact, (value) => { s.supportContact = value; }, { tooltip: "Support email address, mailto link, or support page URL." }),
      textRow("Changelog Url", s.changelogUrl, (value) => { s.changelogUrl = value; }, { tooltip: "Changelog URL." }),
      textRow("Review Url", s.reviewUrl, (value) => { s.reviewUrl = value; }, { tooltip: "Asset Store page or review URL." })
    ),
    soCard(
      "Window Copy",
      textRow("Primary Button Label", s.primaryButtonLabel, (value) => { s.primaryButtonLabel = value; }, { tooltip: "Label used for the primary call-to-action button. Usually documentation." }),
      textRow("Secondary Button Label", s.secondaryButtonLabel, (value) => { s.secondaryButtonLabel = value; }, { tooltip: "Label used for the close button." }),
      textRow("Dont Show Again Label", s.dontShowAgainLabel, (value) => { s.dontShowAgainLabel = value; }, { tooltip: "Label shown beside the persistent dismiss toggle." }),
      multilineRow("Footer Text", s.footerText, (value) => { s.footerText = value; }, { tooltip: "Optional footer text shown at the bottom of the window.", rows: 3 }),
      multilineRow("Release Notes", s.releaseNotes, (value) => { s.releaseNotes = value; }, { tooltip: "Optional short release notes or bullet list text.", rows: 8 })
    ),
    soCard(
      "First Import Behavior",
      toggleRow("Show On Editor Startup", s.showOnEditorStartup, (value) => { s.showOnEditorStartup = value; }, { tooltip: "If disabled, the welcome window will never auto-open on editor startup." }),
      enumRow("Repeat Mode", s.repeatMode, ["OnceEver", "PerVersion", "PerMajorMinorVersion"], (value) => { s.repeatMode = value; }, { tooltip: "Controls when the welcome window may appear again after it has already been dismissed." })
    )
  ]);
}

function dialogueRuntimeUISettingsAsset(ctx) {
  const s = soState(ctx, "runtime-ui-settings", {
    showBackgroundPanel: true,
    showSpeakerName: true,
    showPortrait: true,
    showSkipButton: true,
    showAutoButton: true,
    showHistoryButton: true,
    showLanguageButton: true,
    showSettingsButton: true,
    showContinueIndicator: true,
    showAutoSkipIcon: true,
    showChoicePanel: true,
    showHistoryPanel: true,
    settingsTheme: "Runtime Settings · Night (example)",
    showSettingsPanel: true,
    showSettingsLanguageDropdown: true,
    showSettingsThemeDropdown: true,
    showSettingsTextSpeed: true,
    showSettingsAutoAdvance: true,
    showSettingsVoiceVolume: true,
    showSettingsSfxVolume: true
  });

  return soWindow("Dialogue Runtime UI Settings", "runtime-ui", "DialogueRuntimeUISettingsEditor", [
    soCard(
      "Global Visibility",
      toggleRow("Show Background Panel", s.showBackgroundPanel, (value) => { s.showBackgroundPanel = value; }, { tooltip: "Overall visibility of the dialogue background panel." })
    ),
    soCard(
      "Header / Meta",
      toggleRow("Show Speaker Name", s.showSpeakerName, (value) => { s.showSpeakerName = value; }, { tooltip: "Visibility of the speaker name text." }),
      toggleRow("Show Portrait", s.showPortrait, (value) => { s.showPortrait = value; }, { tooltip: "Visibility of the speaker portrait image." })
    ),
    soCard(
      "Controls",
      toggleRow("Show Skip Button", s.showSkipButton, (value) => { s.showSkipButton = value; }, { tooltip: "Visibility of the skip conversation button." }),
      toggleRow("Show Auto Button", s.showAutoButton, (value) => { s.showAutoButton = value; }, { tooltip: "Visibility of the autoplay toggle button." }),
      toggleRow("Show History Button", s.showHistoryButton, (value) => { s.showHistoryButton = value; }, { tooltip: "Visibility of the history / transcript button." }),
      toggleRow("Show Language Button", s.showLanguageButton, (value) => { s.showLanguageButton = value; }, { tooltip: "Visibility of the optional language/settings button." }),
      toggleRow("Show Settings Button", s.showSettingsButton, (value) => { s.showSettingsButton = value; }, { tooltip: "Visibility of the optional settings button." })
    ),
    soCard(
      "Indicators",
      toggleRow("Show Continue Indicator", s.showContinueIndicator, (value) => { s.showContinueIndicator = value; }, { tooltip: "Visibility of the continue / skip icon (the chevron/arrow)." }),
      toggleRow("Show Auto Skip Icon", s.showAutoSkipIcon, (value) => { s.showAutoSkipIcon = value; }, { tooltip: "Visibility of the small icon that indicates auto/skip state." })
    ),
    soCard(
      "Panels",
      toggleRow("Show Choice Panel", s.showChoicePanel, (value) => { s.showChoicePanel = value; }, { tooltip: "Overall visibility of the branching choice panel." }),
      toggleRow("Show History Panel", s.showHistoryPanel, (value) => { s.showHistoryPanel = value; }, { tooltip: "Overall visibility of the history / log panel." })
    ),
    soCard(
      "Runtime Settings Panel",
      objectField("Settings Theme", "DialogSettingsThemeSO", s.settingsTheme, "Game-wide visual theme for the runtime settings panel. This is separate from dialogue themes."),
      toggleRow("Show Settings Panel", s.showSettingsPanel, (value) => { s.showSettingsPanel = value; }, { tooltip: "Overall availability of the in-game settings panel opened from the dialogue UI." }),
      toggleRow("Show Settings Language Dropdown", s.showSettingsLanguageDropdown, (value) => { s.showSettingsLanguageDropdown = value; }, { tooltip: "Visibility of the language selector inside the runtime settings panel." }),
      toggleRow("Show Settings Theme Dropdown", s.showSettingsThemeDropdown, (value) => { s.showSettingsThemeDropdown = value; }, { tooltip: "Visibility of the theme selector inside the runtime settings panel." }),
      toggleRow("Show Settings Text Speed", s.showSettingsTextSpeed, (value) => { s.showSettingsTextSpeed = value; }, { tooltip: "Visibility of the text speed slider inside the runtime settings panel." }),
      toggleRow("Show Settings Auto Advance", s.showSettingsAutoAdvance, (value) => { s.showSettingsAutoAdvance = value; }, { tooltip: "Visibility of the auto-advance toggle inside the runtime settings panel." }),
      toggleRow("Show Settings Voice Volume", s.showSettingsVoiceVolume, (value) => { s.showSettingsVoiceVolume = value; }, { tooltip: "Visibility of the voice volume slider inside the runtime settings panel." }),
      toggleRow("Show Settings Sfx Volume", s.showSettingsSfxVolume, (value) => { s.showSettingsSfxVolume = value; }, { tooltip: "Visibility of the SFX volume slider inside the runtime settings panel." })
    )
  ]);
}

function dialogGraphCategoryCatalogAsset(ctx) {
  soState(ctx, "category-catalog", {});
  const categories = [
    { path: "Story/MainQuest", color: "#3D82EB" },
    { path: "Vendors/Blacksmith", color: "#C58A3C" }
  ];

  return soWindow("Dialog Graph Category Catalog", "dialogue-graphs", "DialogGraphCategoryCatalogEditor", [
    soCard(
      null,
      listField("Categories", categories, (category, index) => foldout(
        `Element ${index}`,
        nestedFields(
          textRow("Path", category.path, (value) => { category.path = value; }, { tooltip: "Slash-delimited category path, for example Story/MainQuest or Vendors/Blacksmith." }),
          colorRow("Color", category.color, (value) => { category.color = value; }, { tooltip: "Color accent shown in the graph browser." })
        ),
        index === 0
      ), "Ordered category definitions used by the graph browser.", { itemType: "DialogGraphCategoryDefinition" })
    )
  ]);
}

function cameraManager(ctx) {
  const c = ctx.state.inspectors.camera;
  const toast = (event, title, message) => toastOn(event.currentTarget.closest(".up-window"), title, message);
  const channel = (label, handle, status) =>
    h("div", null,
      readOnlyRow(`${label} Handle`, handle),
      readOnlyRow(`${label} Status`, status)
    );

  return windowFrame({
    title: "Inspector · Camera Controller Manager",
    className: "pf-window up-window--compact",
    body: h(
      "div",
      { class: "up-scroll", style: { padding: "14px", maxHeight: "640px" } },
      bekaForgeHeader("Manager", "camera-controller", "Beka Forge · Camera Controller"),
      field("Output Camera", h("div", { class: "bf-field__control" }, h("div", { class: "bf-object-preview" }, h("span", { class: "bf-object-preview__icon" }), h("span", { class: "bf-object-preview__name", text: c.outputCamera }))), { tooltip: "The one camera driven by this manager. Falls back to Camera.main when blank." }),
      helper("DrawDefaultInspector() renders the remaining serialized fields of BekaForgeCameraControllerManager below the header."),
      foldout("Live Operation State", h(
        "div",
        null,
        channel("Pose", "0:1", "Playing"),
        channel("Effect", "1:2", "Playing"),
        infoBox("Channel rows are drawn inside a disabled scope, so the captured handles and statuses stay read-only.")
      ), c.managerExpanded, { onToggle: () => { c.managerExpanded = !c.managerExpanded; ctx.rerender(); } }),
      helper("The editor repaints every frame while Application.isPlaying so the live handles stay current. Outside Play Mode the foldout shows example values only.")
    ),
    footer: h("div", { class: "bf-status-bar" }, h("span", { text: "CustomEditor(typeof(BekaForgeCameraControllerManager)) · Repaint() while Application.isPlaying" }))
  });
}

function cameraComponents(ctx) {
  const c = ctx.state.inspectors.camera;
  const isRig = c.rigTarget === "BekaCameraRig";

  return windowFrame({
    title: "Inspector · Camera Rig & Target",
    className: "pf-window up-window--compact",
    body: h(
      "div",
      { class: "up-scroll", style: { padding: "14px", maxHeight: "560px" } },
      enumRow("Example component", c.rigTarget, [{ value: "BekaCameraRig", label: "BekaCameraRig" }, { value: "BekaCameraTarget", label: "BekaCameraTarget" }], (value) => { c.rigTarget = value; ctx.rerender(); }),
      bekaForgeHeader(isRig ? "Beka Camera Rig" : "Beka Camera Target", "camera-controller", "Beka Forge · Camera Controller"),
      helper("NativeCameraComponentEditor.CreateInspectorGUI adds the header, then InspectorElement.FillDefaultInspector renders the serialized fields."),
      isRig
        ? h("div", null,
            textRow("Stable Id", c.rigStableId, (value) => { c.rigStableId = value; }, { tooltip: "Stable identifier used by camera operations." }),
            sliderRow("Field Of View", c.fieldOfView, 1, 179, 1, (value) => { c.fieldOfView = value; }, { unit: "°", rangeText: "Range 1–179" }),
            helper("Header title comes from ObjectNames.NicifyVariableName(target.GetType().Name): \"BekaCameraRig\" → \"Beka Camera Rig\".")
          )
        : h("div", null,
            textRow("Stable Id", c.targetStableId, (value) => { c.targetStableId = value; }, { tooltip: "Stable identifier used by camera operations." }),
            helper("Header title comes from ObjectNames.NicifyVariableName(target.GetType().Name): \"BekaCameraTarget\" → \"Beka Camera Target\".")
          )
    ),
    footer: h("div", { class: "bf-status-bar" }, h("span", { text: "CustomEditor(typeof(BekaCameraRig)) · CustomEditor(typeof(BekaCameraTarget)) · CanEditMultipleObjects" }))
  });
}

function interactionDiagnostics(ctx, ownerName, sectionName, issues) {
  const showIssue = ownerName === "interactable" ? ctx.state.inspectors.interactable.exampleIssue : ctx.state.inspectors.interactor.exampleIssue;
  const toggle = () => {
    if (ownerName === "interactable") ctx.state.inspectors.interactable.exampleIssue = !ctx.state.inspectors.interactable.exampleIssue;
    else ctx.state.inspectors.interactor.exampleIssue = !ctx.state.inspectors.interactor.exampleIssue;
    ctx.rerender();
  };
  const summary = showIssue
    ? `${issues.length} validation issue${issues.length === 1 ? "" : "s"}`
    : "No validation issues detected";

  return h("div", { class: "insp-card" },
    h("div", { class: "insp-card__header" },
      h("span", { class: "insp-card__title", text: "Diagnostics" }),
      badge(sectionName)
    ),
    h("div", { class: "bf-helper", text: summary }),
    !showIssue
      ? h("div", { class: "bf-row" }, h("button", { class: "bf-button", type: "button", text: "Show example issue", onclick: toggle }))
      : h("div", null,
          ...issues.map((issue) => h("div", { class: "bf-row", style: { alignItems: "center" } },
            h("div", { class: `pf-helpbox ${issue.severity === "Error" ? "pf-helpbox--error" : "pf-helpbox--warning"}`, text: `${issue.severity}: ${issue.message} (Field: ${issue.field})` }),
            h("button", { class: "bf-button", type: "button", text: "Go to field", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Diagnostics", `Selects the '${issue.field}' property in this inspector. Demo only.`) })
          )),
          h("div", { class: "bf-row" }, h("button", { class: "bf-button", type: "button", text: "Hide example issue", onclick: toggle }))
        ),
    helper("Diagnostic rows use bf-diagnostic--error / bf-diagnostic--warning / bf-diagnostic--info and a \"Go to field\" button per issue.")
  );
}

function interactableInspector(ctx) {
  const i = ctx.state.inspectors.interactable;
  const toast = (event, title, message) => toastOn(event.currentTarget.closest(".up-window"), title, message);

  return windowFrame({
    title: "Inspector · Interactable",
    className: "pf-window up-window--compact",
    body: h(
      "div",
      { class: "up-scroll", style: { padding: "14px", maxHeight: "720px" } },
      bekaForgeHeader("Interaction System · Interactable", "interaction", "Beka Forge"),
      foldout("Action", h(
        "div",
        null,
        textRow("Action Label", i.actionLabel, (value) => { i.actionLabel = value; }, { tooltip: "Verb shown in the prompt, for example Open." }),
        textRow("Object Label", i.objectLabel, (value) => { i.objectLabel = value; }, { tooltip: "Object name shown in the prompt, for example Front Door." }),
        enumRow("Interaction Mode", i.interactionMode, ["Press", "Hold"], (value) => { i.interactionMode = value; ctx.rerender(); }, { tooltip: "Press activates at once; Hold requires holding for Hold Duration in seconds." }),
        enumRow("Action Source", i.actionSource, ["Automatic", "Unity Event", "Component"], (value) => { i.actionSource = value; ctx.rerender(); }, { tooltip: "Automatic infers from the action slot; Unity Event forces fallback; Component requires an action component." }),
        field("Action Component", h("div", { class: "bf-field__control" }, h("div", { class: "bf-object-preview" }, h("span", { class: "bf-object-preview__icon" }), h("span", { class: "bf-object-preview__name", text: i.customAction }))), { tooltip: "Component implementing IInteractionAction. Leave empty for UnityEvent fallback." }),
        numberRow("Hold Duration", i.holdDuration, 0, null, (value) => { i.holdDuration = value; }, { tooltip: "Seconds the press must be held for Hold interactions." }),
        h("div", { class: "bf-row", style: { alignItems: "center", flexWrap: "wrap", marginTop: "4px" } },
          h("div", { class: "bf-object-preview" }, h("span", { class: "bf-object-preview__icon" }), h("span", { class: "bf-object-preview__name", text: i.customAction })),
          h("button", { class: "bf-button", type: "button", text: "Assign action…", title: "Choose a compatible action component on this GameObject.", onclick: () => { i.pickerOpen = !i.pickerOpen; ctx.rerender(); } })
        ),
        i.pickerOpen
          ? h("div", { class: "insp-card", style: { margin: "6px 0" } },
              helper("GenericMenu candidates on this GameObject. Undo name: \"Assign interaction action\"."),
              helper("SampleDoorAction (example)"),
              helper("SampleLeverAction (example)")
            )
          : helper("If this GameObject has no compatible action component, the menu shows \"No compatible action components\"; with multiple targets selected it shows \"Select a single target\".")
      ), true),
      foldout("Availability", h(
        "div",
        null,
        toggleRow("Is Available", i.isAvailable, (value) => { i.isAvailable = value; ctx.rerender(); }, { tooltip: "Uncheck to block the target and show Disabled Reason instead." }),
        textRow("Disabled Reason", i.disabledReason, (value) => { i.disabledReason = value; }, { tooltip: "Reason shown in the prompt when the target is unavailable." })
      ), true),
      foldout("Prompt", h(
        "div",
        null,
        field("Anchor", h("div", { class: "bf-field__control" }, h("div", { class: "bf-object-preview" }, h("span", { class: "bf-object-preview__icon" }), h("span", { class: "bf-object-preview__name", text: "Prompt Anchor (example)" }))), { tooltip: "Prompt position. Uses this transform position when unset." })
      ), true),
      foldout("Unity Events", h(
        "div",
        null,
        field("On Interact ()", h("div", { class: "bf-field__control" }, h("input", { class: "bf-input", type: "text", value: "SampleDoorAction.OnInteract (example listener)", disabled: true })), { tooltip: "Invoked after the session completes when no component action runs." })
      ), true),
      foldout("Validation", h(
        "div",
        null,
        interactionDiagnostics(ctx, "interactable", "bf-interactable-validation", [
          { severity: "Error", message: "Hold duration must be a finite positive value for Hold interactions. Enter a duration greater than zero.", field: "holdDuration" }
        ])
      ), true),
      foldout("Runtime diagnostics", h(
        "div",
        null,
        readOnlyRow("Prompt anchor", "Uses transform position"),
        readOnlyRow("Runtime availability", i.isAvailable ? "Available" : "Unavailable - Disabled Reason shown in the prompt.")
      ), i.runtimeExpanded, { onToggle: () => { i.runtimeExpanded = !i.runtimeExpanded; ctx.rerender(); } }),
      foldout("Help", h(
        "div",
        null,
        infoBox("Where the interaction action comes from. Automatic infers it from the Action Component slot, Unity Event always runs the Unity Event below, and Component requires a working action component."),
        infoBox("Component that runs the interaction. It must implement IInteractionAction. An incompatible component is an error once Action Source requires a component."),
        infoBox("Action components on this GameObject: No component on this GameObject implements IInteractionAction. Add one, or set Action Source to Unity Event to run the Unity Event instead."),
        infoBox("Seconds the interaction input must stay held before the interaction completes. It is only used when Interaction Mode is Hold."),
        infoBox("Transform used as the prompt position. Leave it empty to use this GameObject's own transform position.")
      ), i.helpExpanded, { onToggle: () => { i.helpExpanded = !i.helpExpanded; ctx.rerender(); } })
    ),
    footer: h("div", { class: "bf-status-bar" }, h("span", { text: "CustomEditor(typeof(Interactable)) · CanEditMultipleObjects · root bf-interactable-inspector" }))
  });
}

function interactorInspector(ctx) {
  const i = ctx.state.inspectors.interactor;

  return windowFrame({
    title: "Inspector · Interactor",
    className: "pf-window up-window--compact",
    body: h(
      "div",
      { class: "up-scroll", style: { padding: "14px", maxHeight: "760px" } },
      bekaForgeHeader("Interaction System · Interactor", "interaction", "Beka Forge"),
      foldout("References", h(
        "div",
        null,
        field("Reach Origin", h("div", { class: "bf-field__control" }, h("div", { class: "bf-object-preview" }, h("span", { class: "bf-object-preview__icon" }), h("span", { class: "bf-object-preview__name", text: i.reachOrigin }))), { tooltip: "Transform distance is measured from. Typically the camera or head, not the character root." }),
        field("View Transform", h("div", { class: "bf-field__control" }, h("div", { class: "bf-object-preview" }, h("span", { class: "bf-object-preview__icon" }), h("span", { class: "bf-object-preview__name", text: i.viewTransform }))), { tooltip: "Transform whose forward direction defines the view cone." })
      ), true),
      foldout("Targeting", h(
        "div",
        null,
        enumRow("Targeting Mode", i.targetingMode, ["LookAt", "Nearest"], (value) => { i.targetingMode = value; ctx.rerender(); }, { tooltip: "LookAt ranks candidates by view angle; Nearest ranks by distance." }),
        numberRow("Reach", i.reach, 0, null, (value) => { i.reach = value; }, { tooltip: "Maximum interaction distance in metres." }),
        numberRow("View Half Angle", i.viewHalfAngle, 0, null, (value) => { i.viewHalfAngle = value; }, { tooltip: "Half-angle of the view cone in degrees, measured around the view forward axis." }),
        toggleRow("Check Obstruction", i.checkObstruction, (value) => { i.checkObstruction = value; }, { tooltip: "Ignore targets blocked by an obstruction hit between reach origin and target." }),
        readOnlyRow("Target Mask", i.targetMask),
        readOnlyRow("Obstruction Mask", i.obstructionMask)
      ), true),
      h("div", { class: "bf-section bf-section--advanced" },
        foldout("Advanced", h(
          "div",
          null,
          numberRow("Angle Hysteresis", i.angleHysteresis, 0, null, (value) => { i.angleHysteresis = value; }, { tooltip: "Extra degrees of view-angle stickiness keeping the current focus." }),
          numberRow("Distance Hysteresis", i.distanceHysteresis, 0, null, (value) => { i.distanceHysteresis = value; }, { tooltip: "Extra metres of distance stickiness keeping the current focus." }),
          numberRow("Reevaluation Interval", i.reevaluationInterval, 0, null, (value) => { i.reevaluationInterval = value; }, { tooltip: "Seconds between focus reevaluations. 0 reevaluates every frame." }),
          numberRow("Query Ceiling", i.queryCeiling, 1, null, (value) => { i.queryCeiling = value; }, { tooltip: "Maximum colliders ranked per targeting query. The supported maximum is 4096." })
        ), i.advancedOpen, { onToggle: () => { i.advancedOpen = !i.advancedOpen; ctx.rerender(); } })
      ),
      foldout("Validation", h(
        "div",
        null,
        interactionDiagnostics(ctx, "interactor", "bf-interactor-validation", [
          { severity: "Error", message: "Reach origin is missing. Assign the Transform used to measure interaction distance.", field: "reachOrigin" }
        ])
      ), true),
      foldout("Runtime diagnostics", h(
        "div",
        null,
        foldout("Input ownership", h(
          "div",
          null,
          readOnlyRow("State source", "No active input adapter"),
          readOnlyRow("Input Adapter", "No active input adapter"),
          readOnlyRow("Active Binding", "No binding label")
        ), true),
        readOnlyRow("Current focus", "No focused interaction"),
        readOnlyRow("Runtime state", "Live runtime state"),
        readOnlyRow("Hold progress", "No active hold")
      ), i.runtimeExpanded, { onToggle: () => { i.runtimeExpanded = !i.runtimeExpanded; ctx.rerender(); } }),
      foldout("Help", h(
        "div",
        null,
        infoBox("Reach origin in world space. Interaction targeting measures distance from this transform, so it belongs on the moving part of the player."),
        infoBox("Transform the view direction is taken from. Targets outside its cone are never focused."),
        infoBox("Reach in metres. A target further than this distance from the reach origin is never focused."),
        infoBox("View half-angle in degrees around the view axis. 180 degrees accepts every direction in front of the view transform; smaller values narrow the cone."),
        infoBox("Line of sight check between the interactor and a candidate target. Turn it off when a collider sits between the camera and the target on purpose."),
        infoBox("Layer mask of interactable layers. Only colliders on these layers are considered as interaction targets."),
        infoBox("Layer mask of layers that can block the line of sight to a target. It is ignored while Line of Sight is off."),
        infoBox("Degrees of extra view cone kept on the current focus, so a target at the cone edge does not flicker out of focus. 0 disables angular stickiness."),
        infoBox("Metres of extra distance kept on the current focus, so a target at the reach limit does not flicker. 0 disables distance stickiness."),
        infoBox("Seconds between focus reevaluations. 0 reevaluates every frame; higher values reduce physics queries at the cost of slower focus changes."),
        infoBox("Maximum colliders ranked per query. Higher values find more targets in a dense scene at the cost of more physics work. The supported maximum is 4096.")
      ), i.helpExpanded, { onToggle: () => { i.helpExpanded = !i.helpExpanded; ctx.rerender(); } }),
      helper("Runtime fallbacks are copied from InteractionInspectorText: \"No active input adapter\", \"No binding label\", \"No focused interaction\", \"No active hold\", \"Live runtime state\".")
    ),
    footer: h("div", { class: "bf-status-bar" }, h("span", { text: "CustomEditor(typeof(Interactor)) · CanEditMultipleObjects · root bf-interactor-inspector" }))
  });
}

function characterAsset(ctx) {
  const characters = ctx.state.characters || [];
  const character = characters.find((entry) => entry.id === ctx.state.dgs.selectedCharacter) || characters[0];
  return windowFrame({
    title: "Inspector · Character",
    className: "pf-window up-window--compact",
    body: h(
      "div",
      { class: "up-scroll", style: { padding: "14px", maxHeight: "760px" } },
      bekaForgeHeader("Character", "characters"),
      renderCharacterWorkbench(character, ctx)
    ),
    footer: h("div", { class: "bf-status-bar" }, h("span", { text: "CustomEditor(typeof(DialogCharacterSO)) · DialogCharacterCastSection.Full · example asset only" }))
  });
}

function dialogManagerInspector(ctx) {
  const manager = ctx.state.inspectors.dialogManager;
  const section = (key, title, ...children) => foldout(title, h("div", {}, ...children), manager[key], { onToggle: (open) => { manager[key] = open; } });
  const reference = (label, value) => readOnlyRow(label, value);
  return windowFrame({
    title: "Inspector · Dialog Manager",
    className: "pf-window up-window--compact",
    body: h("div", { class: "up-scroll", style: { padding: "14px", maxHeight: "720px" } },
      bekaForgeHeader("Dialog Manager", "dialog-manager"),
      reference("Script", "DialogManager (MonoScript)"),
      manager.bootstrapMissing ? h("div", { class: "pf-helpbox pf-helpbox--warning", role: "status", text: "Assign a Dialogue UI Manager prefab for zero-setup runtime bootstrap, or reference an existing DialogUIManager in the scene." }) : null,
      ...manager.validationIssues.map((message) => h("div", { class: "pf-helpbox pf-helpbox--warning", role: "status", text: message })),
      toggleRow("Do Debug", manager.doDebug, (value) => { manager.doDebug = value; }),
      section("showGraphs", "Dialogue Graphs",
        foldout("Dialog Graphs", h("div", {}, ...manager.dialogGraphs.map((graph, index) => foldout(`Element ${index}`, h("div", {},
          textRow("Dialog ID", graph.dialogID, (value) => { graph.dialogID = value; }),
          reference("Dialog Graph", graph.dialogGraph)), true))), manager.showGraphList,
          { onToggle: (open) => { manager.showGraphList = open; } })),
      section("showUi", "Runtime UI Bootstrap",
        reference("Dialogue UI Manager Prefab", manager.dialogUiManagerPrefab), reference("Existing UI Manager", manager.dialogUiManager)),
      section("showAudio", "Audio", reference("Audio Source", manager.audioSource)),
      section("showOverrides", "Overrides",
        reference("Local Text Settings", manager.localTextSettings), reference("Local Audio Settings", manager.localAudioSettings),
        reference("Local UI Settings", manager.localUiSettings), reference("Local Choice Settings", manager.localChoiceSettings)),
      section("showActions", "Actions", reference("Action Runner", manager.actionRunner),
        helper("Optional. If left empty, DialogManager first checks this GameObject for a DialogActionRunner, then searches the scene.")),
      section("showVariables", "Variables", reference("Variable Store", manager.variableStore),
        helper("Optional. If left empty, DialogManager first checks this GameObject for a DialogueVariableStore, then searches the scene.")),
      h("div", { style: { display: "flex", justifyContent: "flex-end", marginTop: "8px" } },
        h("button", { class: "bf-button", type: "button", text: "Open Settings", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Open Settings", "Dialog Settings window (demo only).") }))
    ),
    footer: h("div", { class: "bf-status-bar" }, h("span", { text: "CustomEditor(typeof(DialogManager)) · local example only" }))
  });
}

export const inspectorViews = {
  "dialogue-node": dialogueNode,
  "variable-definition": variableDefinition,
  "variable-store": variableStore,
  "asset-dialog-graph": dialogGraphAsset,
  "asset-character": characterAsset,
  "asset-text-settings": dialogTextSettingsAsset,
  "asset-choice-settings": dialogChoiceSettingsAsset,
  "asset-audio-settings": dialogAudioSettingsAsset,
  "asset-input-settings": dialogInputSettingsAsset,
  "asset-voice-table": dialogVoiceTableAsset,
  "asset-delivery-preset": dialogDeliveryPresetAsset,
  "asset-environment": dialogEnvironmentAsset,
  "asset-scene-context": dialogSceneContextAsset,
  "asset-localization-table": dialogLocalizationTableAsset,
  "asset-localization-runtime-settings": dialogLocalizationRuntimeSettingsAsset,
  "asset-welcome-branding": dialogWelcomeBrandingAsset,
  "asset-runtime-ui-settings": dialogueRuntimeUISettingsAsset,
  "asset-category-catalog": dialogGraphCategoryCatalogAsset,
  "camera-manager": cameraManager,
  "camera-components": cameraComponents,
  "interactable": interactableInspector,
  "interactor": interactorInspector,
  "dialog-manager": dialogManagerInspector
};

export function renderInspectorSurface(host, ctx, surface) {
  const view = inspectorViews[surface];
  if (view) host.append(view(ctx));
  return !!view;
}

export async function render(host, ctx) {
  if (ctx.surface && inspectorViews[ctx.surface]) ctx.state.inspectors.view = ctx.surface;
  const active = inspectorViews[ctx.state.inspectors.view] ? ctx.state.inspectors.view : "dialogue-node";
  renderInspectorSurface(host, ctx, active);
}
