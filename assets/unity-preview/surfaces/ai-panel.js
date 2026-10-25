/* Floating AI Assistant panel, authoring activity overlay, and the AI draft preview windows.
   Strings are copied verbatim from:
   - Assets/DialogGraphSystem/Scripts/Editor/Windows/DialogGraphAiFloatingPanel.cs
   - Assets/Beka Forge/Dialogue AI Extension/Editor/Windows/DialogGraphAiSidebarContent.cs
   - Assets/Beka Forge/Dialogue AI Extension/Editor/Windows/AiDraftPreviewWindow.cs
   - Assets/Beka Forge/Dialogue AI Extension/Editor/Windows/AiAuthoringProgressPopupWindow.cs
   - Assets/Beka Forge/Dialogue AI Extension/Editor/Windows/AiAuthoringActivitySessionView.cs
   - Assets/Beka Forge/Dialogue AI Extension/Editor/Windows/AiAuthoringActivity.uss
   - Assets/DialogGraphSystem/Scripts/Editor/PublicInformation/DialogPublicInformationCatalog.cs
   Example values only; no provider request, graph operation, or file access. */

import {
  h, field, helper, badge, textRow, textArea, enumRow, toggleRow,
  windowFrame, sectionTitle, foldout, toastOn
} from "../controls.js";

export const entries = [
  { id: "floating-panel", label: "AI Assistant · Floating panel" },
  { id: "draft-preview", label: "AI Assistant · Draft preview window" },
  { id: "localization-preview", label: "AI Assistant · Translation preview" },
  { id: "batch-rewrite-preview", label: "AI Assistant · Batch rewrite preview" },
  { id: "flow-draft-preview", label: "AI Assistant · Dialog flow draft preview" },
  { id: "character-banter-review", label: "AI Assistant · Character banter review" },
  { id: "character-fill-review", label: "AI Assistant · Character fill review" },
  { id: "plan-preview", label: "AI Assistant · Graph plan preview" },
  { id: "authoring-progress", label: "AI Assistant · Authoring activity overlay" }
];

export const note =
  "Recreated from the Dialogue AI Extension editor sources. The assistant chrome, command form, status texts, and draft preview labels are copied from source. " +
  "Prompts, provider names, drafts, and results are fabricated examples; no provider is contacted and no graph, asset, or file is read or written.";

const connectionStates = ["Disconnected", "Running", "Ready — test passed", "Needs test", "Testing", "Test failed", "Unavailable", "AI disabled"];

function badgeTone(state) {
  if (state === "Ready — test passed") return "connected";
  if (state === "Running" || state === "Testing") return "running";
  if (state === "Test failed" || state === "Unavailable") return "error";
  if (state === "Needs test" || state === "AI disabled") return "warning";
  return "disconnected";
}

function missingExtensionAd() {
  return h(
    "div",
    { class: "dlg-ai-extension-ad" },
    h("div", { class: "dlg-ai-extension-ad-icon" }, h("span", { class: "dlg-ai-extension-ad-icon-placeholder", text: "AI" })),
    h("div", { class: "dlg-ai-extension-ad-title", text: "AI Extension 2.1 - Included Module" }),
    h("div", { class: "dlg-ai-extension-ad-copy", text: "AI Extension 2.1 is included with DGS 4.0. AI authoring requires AI Providers 2.2, supplied separately." }),
    h(
      "div",
      { class: "dlg-ai-extension-ad-actions" },
      h("button", {
        class: "bf-button bf-button--primary dlg-ai-extension-ad-primary",
        type: "button",
        text: "Learn More",
        title: "https://bekaforge.com/dgs-docs/ai-extension.html",
        onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Learn More", "OpenURL: https://bekaforge.com/dgs-docs/ai-extension.html (demo only).")
      }),
      h("button", {
        class: "bf-button dlg-ai-extension-ad-secondary",
        type: "button",
        text: "View Bundled Copy",
        onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "View Bundled Copy", "Opens the bundled AI_EXTENSION.txt from the DGS package. Demo only.")
      })
    )
  );
}

function sidebarContent(ctx) {
  const s = ctx.state.aiPanel;
  const settingsAction = (event) => toastOn(event.currentTarget.closest(".up-window"), "AI settings", "Opens the Graph AI settings category. Demo only.");
  const providerAction = (event) => toastOn(event.currentTarget.closest(".up-window"), "Provider", "Provider selection opens the provider picker in the desktop app. Demo only.");

  return h(
    "div",
    { class: "dlg-ai-content" },
    h(
      "div",
      { class: "dlg-ai-header-v2" },
      h(
        "div",
        { class: "dlg-ai-header-v2__title-row" },
        h("span", { class: "dlg-ai-header-v2__title", text: "AI Assistant" }),
        h("span", {
          class: "dlg-ai-header-v2__settings-btn",
          role: "button",
          tabindex: "0",
          "aria-label": "AI settings",
          title: "AI settings",
          text: "⚙",
          onclick: settingsAction,
          onkeydown: (event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            settingsAction(event);
          }
        })
      ),
      h(
        "div",
        { class: "dlg-ai-header-v2__status-row" },
        h("span", { class: `dlg-ai-badge dlg-ai-badge--${badgeTone(s.connection)}`, text: s.connection }),
        h("span", {
          class: "dlg-ai-header-v2__provider-dropdown",
          role: "button",
          tabindex: "0",
          title: "Provider selection is fixed in this preview.",
          text: "Sample Provider — sample-model (example)",
          onclick: providerAction,
          onkeydown: (event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            providerAction(event);
          }
        })
      )
    ),
    h(
      "div",
      { class: "dlg-ai-command-input" },
      h("div", { class: "dlg-ai-section-title", text: "What would you like to create?" }),
      textArea(s.prompt, (value) => { s.prompt = value; }, { rows: 4, height: 96 }),
      h("div", { class: "dgs-ai-composer-hint", text: "Enter for a new line  ·  Ctrl/Cmd+Enter to run" }),
      helper("Describe your dialogue or requested changes. Enter for a new line; Ctrl/Cmd+Enter to run.")
    ),
    foldout("Options", h(
      "div",
      { class: "dgs-ai-composer-options" },
      field("Scope", h("select", { class: "bf-select dlg-ai-scope-dropdown", onchange: (event) => { s.scope = event.target.value; } },
        ...["Auto", "Minimal (selected only)", "Local (nearby nodes)", "Path (branch)", "Full graph"].map((option) => h("option", { value: option, selected: option === s.scope }, option))
      )),
      helper("Scope determines how much graph context is sent to the AI."),
      field("Context", h("input", { class: "bf-input", type: "text", value: s.context, disabled: true })),
      helper("Choose scene context or read current environment binding."),
      h("div", { class: "bf-row" },
        h("button", {
          class: "bf-button",
          type: "button",
          text: "Rewrite prompt",
          title: "Rewrite the current prompt into a clearer AI-ready graph authoring request.",
          onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Rewrite prompt", "Prompt rewritten locally. (example result; no provider request)")
        })
      )
    ), s.optionsOpen, { onToggle: (open) => { s.optionsOpen = open; } }),
    h(
      "div",
      { class: "dlg-ai-action-row" },
      h("button", { class: "bf-button bf-button--primary dlg-ai-run-btn dlg-ai-run-btn--primary", type: "button", text: "Run", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Run", "AI command would start for the configured provider. Demo only; nothing is sent.") }),
      h("button", { class: "bf-button dlg-ai-run-btn dlg-ai-run-btn--secondary", type: "button", text: "Stop", title: "Cancel the active AI command before it applies any changes.", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Stop", "No AI command is running in this example.") })
    ),
    h("div", { class: "dlg-ai-status-row" }, h("span", { class: "dlg-ai-status-label", text: "No runs yet." })),
    foldout("Diagnostics", h(
      "div",
      null,
      h("div", { class: "dlg-ai-run-details-status", text: "No runs yet." }),
      h("div", { class: "dlg-ai-action-row dlg-ai-action-row--wrap" },
        h("button", { class: "bf-button", type: "button", text: "Focus target", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Focus target", "No AI authoring target is available yet.") }),
        h("button", { class: "bf-button", type: "button", text: "Clean up assets", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Clean up assets", "No tracked AI authoring assets are available for cleanup.") })
      ),
      foldout("Advanced Debug", h(
        "div",
        null,
        toggleRow("Debug AI Commands", false, (value) => { s.debugOpen = value; }),
        h("div", { class: "bf-row" },
          h("button", { class: "bf-button", type: "button", text: "Copy Last Debug Report", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Copy Last Debug Report", "No debug report is available yet.") }),
          h("button", { class: "bf-button", type: "button", text: "Clear Debug Report", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Clear Debug Report", "Debug report cleared.") })
        )
      ), s.debugOpen, { onToggle: (open) => { s.debugOpen = open; } })
    ), s.diagnosticsOpen, { onToggle: (open) => { s.diagnosticsOpen = open; } })
  );
}

function floatingPanel(ctx) {
  const s = ctx.state.aiPanel;

  return windowFrame({
    title: "Graph canvas · AI Assistant overlay",
    className: "pf-window up-window--compact",
    body: h(
      "div",
      { class: "ai-float-stage" },
      h("div", { class: "ai-float-stage__canvas" },
        h("span", { class: "ai-float-stage__hint", text: "Fixed example canvas. In Unity this panel floats, drags, and docks over the live graph view." })
      ),
      h(
        "div",
        { class: "dlg-ai-float-panel", style: { width: "400px" } },
        h(
          "div",
          { class: "dlg-ai-float-header" },
          h("span", { class: "dlg-ai-float-drag", title: "Panel position is fixed in this preview." }),
          h("span", { class: "dlg-ai-float-spark", text: "✦" }),
          h("span", { class: "dlg-ai-float-title", text: "AI Assistant" }),
          h("span", { class: "dlg-ai-float-spacer" }),
          h("button", { class: "dlg-ai-float-ctrl-btn", type: "button", title: "AI settings", text: "⚙", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "AI settings", "Opens the Graph AI settings category. Demo only.") }),
          h("button", { class: "dlg-ai-float-ctrl-btn", type: "button", title: "Hide AI Assistant", text: "✕", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Hide AI Assistant", "Hides the panel and remembers the closed state in EditorPrefs. Demo only.") })
        ),
        h("div", { class: "dlg-ai-float-sep" }),
        h("div", { class: "dlg-ai-float-body" }, s.adVisible ? missingExtensionAd() : sidebarContent(ctx))
      )
    ),
    footer: h("div", { class: "bf-status-bar" },
      h("span", { text: "Width 400 px · class dlg-ai-float-panel · launch state stored in EditorPrefs (example)" }),
      toggleRow("Show missing-extension ad (example)", s.adVisible, (value) => { s.adVisible = value; ctx.rerender(); })
    )
  });
}

function draftFlowChain(nodes) {
  return h(
    "div",
    { class: "ai-draft-flow" },
    h("span", { class: "ai-draft-chip ai-draft-chip--end", text: "Start" }),
    ...nodes.flatMap((node, index) => [
      h("span", { class: "ai-draft-arrow", text: "→" }),
      h("span", { class: "ai-draft-chip", text: `Node ${index + 1}` })
    ]),
    h("span", { class: "ai-draft-arrow", text: "→" }),
    h("span", { class: "ai-draft-chip ai-draft-chip--end", text: "End" })
  );
}

function recoveryBanner() {
  return h("div", { class: "pf-helpbox pf-helpbox--warning", text: "JSON Recovery - The AI response contained markdown fences or surrounding prose. The JSON was extracted automatically. Please review this draft carefully." });
}

function draftCard(index, node, options = {}) {
  return h(
    "div",
    { class: "ai-draft-card" },
    h("div", { class: "ai-draft-card__header" },
      h("span", { class: "ai-draft-card__badge", text: `NODE  ${index}` }),
      options.onRemove ? h("button", { class: "bf-button", type: "button", text: "→ Remove", onclick: options.onRemove }) : null
    ),
    textRow("Title", node.title, (value) => { node.title = value; }),
    textRow("Speaker", node.speaker, (value) => { node.speaker = value; }),
    textAreaRow("Dialog Text", node.text, (value) => { node.text = value; })
  );
}

function textAreaRow(label, value, onChange) {
  return field(label, textArea(value, onChange || (() => {}), { rows: 3 }));
}

function validationPanel(ctx) {
  const s = ctx.state.aiPanel;
  return h(
    "div",
    { class: "ai-draft-validation" },
    h("div", { class: "ai-draft-card__header" },
      h("span", { class: "ai-draft-card__badge", text: "Applied - Validation Warnings" }),
      badge("example result")
    ),
    h("div", { class: "bf-helper", text: "Nodes were added but the graph has issues. Review below." }),
    h("div", { class: "pf-helpbox pf-helpbox--warning", text: "Warning:   [ChoiceTargetMissing]  Choice 'Take the north gate' has no outgoing target." }),
    h("div", { class: "bf-row" },
      h("button", { class: "bf-button", type: "button", text: "Dismiss", onclick: () => { s.validationResult = false; ctx.rerender(); } }),
      helper("Nothing to Apply: All draft nodes have been removed. Add at least one node or press Cancel.")
    )
  );
}

function draftPreview(ctx) {
  const s = ctx.state.aiPanel;
  const draftNodes = (s.draftNodes ??= [
    { title: "Gate Check", speaker: "Warden", text: "The sanctum passage is clear tonight. Take the north gate." },
    { title: "Crossing", speaker: "Player", text: "And if the gate watch stops me?" }
  ]);
  const draftChoice = (s.draftChoice ??= {
    prompt: "The warden waits at the gate. What do you say?"
  });
  const draftOptions = (s.draftOptions ??= [
    { answer: "I'm expected. Let me pass.", speaker: "Warden", text: "Expected by whom? Give me a name." }
  ]);
  const draftAction = (s.draftAction ??= {
    actionId: "open_door",
    payload: "{ \"doorId\": \"north-gate\" }",
    wait: true,
    waitSeconds: "1.5"
  });

  const dialogNodesMode = h("div", null,
    h("div", { class: "ai-draft-titlebar" },
      h("span", { class: "ai-draft-title", text: "AI Draft - Dialog Nodes" }),
      badge("Dialog nodes")
    ),
    h("div", { class: "bf-helper", text: `${draftNodes.length} dialog node${draftNodes.length === 1 ? "" : "s"} ready to insert.  Edit any field before applying.` }),
    s.recoveryBanner ? recoveryBanner() : null,
    draftFlowChain(draftNodes),
    ...draftNodes.map((node, index) => draftCard(index + 1, node, {
      onRemove: () => {
        draftNodes.splice(index, 1);
        ctx.rerender();
      }
    }))
  );

  const choiceMode = h("div", null,
    h("div", { class: "ai-draft-titlebar" },
      h("span", { class: "ai-draft-title", text: "AI Draft - Choice Node" }),
      badge("Choice node")
    ),
    h("div", { class: "bf-helper", text: "Review and edit the generated choice node before applying.  Ports and links will be created by the editor." }),
    s.recoveryBanner ? recoveryBanner() : null,
    h("div", { class: "ai-draft-card" },
      h("div", { class: "ai-draft-card__header" }, h("span", { class: "ai-draft-card__badge", text: "CHOICE" })),
      textAreaRow("Choice Prompt", draftChoice.prompt, (value) => { draftChoice.prompt = value; }),
      h("div", { class: "ai-draft-card__header" },
        h("span", { class: "ai-draft-card__badge", text: "OPTIONS" }),
        h("button", {
          class: "bf-button",
          type: "button",
          text: "+ Add Option",
          onclick: () => {
            draftOptions.push({ answer: "New answer", speaker: "Warden", text: "" });
            ctx.rerender();
          }
        })
      ),
      ...draftOptions.map((option, index) =>
        h("div", { class: "ai-draft-card ai-draft-card--nested" },
          h("div", { class: "ai-draft-card__header" },
            h("span", { class: "ai-draft-card__badge", text: `OPTION  ${index + 1}` }),
            h("button", {
              class: "bf-button",
              type: "button",
              text: "→ Remove",
              onclick: () => {
                draftOptions.splice(index, 1);
                ctx.rerender();
              }
            })
          ),
          textRow("Answer Text", option.answer, (value) => { option.answer = value; }),
          textRow("Follow-Up Speaker", option.speaker, (value) => { option.speaker = value; }),
          textAreaRow("Follow-Up Text", option.text, (value) => { option.text = value; })
        )
      )
    )
  );

  const actionMode = h("div", null,
    h("div", { class: "ai-draft-titlebar" },
      h("span", { class: "ai-draft-title", text: "AI Draft - Action Node" }),
      badge("Action node")
    ),
    h("div", { class: "bf-helper", text: "This action node will be inserted after the selected node.  Review and edit before applying." }),
    s.recoveryBanner ? recoveryBanner() : null,
    h("div", { class: "ai-draft-card" },
      h("div", { class: "ai-draft-card__header" }, h("span", { class: "ai-draft-card__badge", text: "ACTION" })),
      textRow("Action ID", draftAction.actionId, (value) => { draftAction.actionId = value; }),
      helper("Registered action: Open Door (open_door)"),
      helper("Enter an action ID. New IDs will be inserted as unregistered actions."),
      field("Payload JSON", textArea(draftAction.payload, (value) => { draftAction.payload = value; }, { rows: 3 })),
      h("div", { class: "bf-row" },
        h("button", { class: "bf-button", type: "button", text: "Write Payload", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Write Payload", "Formats the current payload or writes the registered action template in the desktop app. Demo only.") }),
        helper("Formats the current payload or writes the registered action template for this action ID.")
      ),
      toggleRow("Wait for Completion", draftAction.wait, (value) => { draftAction.wait = value; }),
      textRow("Wait Seconds", draftAction.waitSeconds, (value) => { draftAction.waitSeconds = value; })
    )
  );

  const modes = {
    "dialog-nodes": dialogNodesMode,
    "choice-node": choiceMode,
    "action-node": actionMode
  };

  return windowFrame({
    title: "Editor window · AI draft preview",
    className: "pf-window up-window--compact",
    body: h(
      "div",
      { class: "up-scroll", style: { padding: "14px", maxHeight: "760px" } },
      enumRow("Example mode", s.draftMode, [
        { value: "dialog-nodes", label: "Dialog Nodes" },
        { value: "choice-node", label: "Choice Node" },
        { value: "action-node", label: "Action Node" }
      ], (value) => { s.draftMode = value; ctx.rerender(); }),
      s.validationResult ? validationPanel(ctx) : modes[s.draftMode],
      h("div", { class: "bf-row", style: { marginTop: "10px" } },
        h("button", { class: "bf-button", type: "button", text: "Cancel", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Cancel", "Draft discarded. Demo only.") }),
        h("button", { class: "bf-button bf-button--primary", type: "button", text: "Apply", onclick: (event) => { s.validationResult = true; ctx.rerender(); } }),
        toggleRow("Show JSON recovery banner (example)", s.recoveryBanner, (value) => { s.recoveryBanner = value; ctx.rerender(); })
      )
    ),
    footer: h("div", { class: "bf-status-bar" }, h("span", { text: "Title: AI Draft - Dialog Nodes / AI Draft - Choice Node / AI Draft - Action Node · example drafts only" }))
  });
}

function localizationPreview(ctx) {
  const s = ctx.state.aiPanel;
  const rows = (s.locRows ??= [
    { key: "market_gate.access_denied", source: "The gate watch turns you away.", target: "La garde du portail vous repousse.", selected: true },
    { key: "market_gate.password", source: "Speak the word and pass.", target: "Dites le mot et passez.", selected: true },
    { key: "market_gate.warden_warning", source: "The warden eyes you carefully.", target: "Le gardien vous observe attentivement.", selected: false }
  ]);
  const selectedCount = rows.filter((row) => row.selected).length;

  return windowFrame({
    title: "Editor window · AI translation preview",
    className: "pf-window up-window--compact",
    body: h(
      "div",
      { class: "up-scroll ai-loc-preview", style: { padding: "14px", maxHeight: "720px" } },
      h("div", { class: "ai-draft-titlebar" },
        h("span", { class: "ai-draft-title", text: "AI Translation Preview - French (example)" }),
        badge("AI Translation Preview")
      ),
      h("div", { class: "bf-helper", text: "3 string(s) proposed. Review and edit before applying." }),
      s.locRecovery ? h("div", { class: "pf-helpbox pf-helpbox--warning", text: "Warning:  The AI response required JSON recovery - review all entries carefully." }) : null,
      h("div", { class: "bf-row", style: { alignItems: "center", margin: "8px 0" } },
        h("label", { class: "bf-check-row" }, h("input", { class: "bf-check", type: "checkbox", checked: selectedCount === rows.length, onchange: (event) => { for (const row of rows) row.selected = event.target.checked; ctx.rerender(); } }), h("span", { text: "Select all" })),
        helper("Selected rows will be committed together from the footer.")
      ),
      ...rows.map((row, index) =>
        h("div", { class: "ai-loc-row" },
          h("label", { class: "bf-check-row" }, h("input", { class: "bf-check", type: "checkbox", checked: row.selected, onchange: (event) => { row.selected = event.target.checked; ctx.rerender(); } })),
          h("div", { class: "ai-loc-row__fields" },
            h("span", { class: "bf-helper", text: row.key }),
            h("input", { class: "bf-input", type: "text", value: row.source, disabled: true }),
            textArea(row.target, (value) => { row.target = value; }, { rows: 2 })
          )
        )
      ),
      h("div", { class: "bf-row", style: { marginTop: "10px" } },
        h("span", { class: "bf-helper", text: `${selectedCount} / ${rows.length} remaining selected` }),
        h("button", { class: "bf-button", type: "button", text: "Cancel", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Cancel", "All pending translation entries would be discarded. Demo only.") }),
        h("button", { class: "bf-button bf-button--primary", type: "button", text: "Apply Selected", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Apply Selected", "Applies the selected rows through the editor's translation bridge. Demo only.") }),
        toggleRow("Show JSON recovery warning (example)", s.locRecovery, (value) => { s.locRecovery = value; ctx.rerender(); })
      )
    ),
    footer: h("div", { class: "bf-status-bar" }, h("span", { text: "Empty selection shows \"No new entries selected.\" · applied state shows \"All entries applied.\"" }))
  });
}

function batchRewritePreview(ctx) {
  const s = ctx.state.aiPanel;
  const rows = (s.batchRows ??= [
    { original: "The sanctum passage is clear. Take the north gate.", rewritten: "The sanctum passage lies open tonight. Take the north gate.", selected: true },
    { original: "And if the gate watch stops me?", rewritten: "And should the gate watch halt me, what then?", selected: false }
  ]);
  const selectedCount = rows.filter((row) => row.selected).length;

  return windowFrame({
    title: "Editor window · AI batch rewrite preview",
    className: "pf-window up-window--compact",
    body: h(
      "div",
      { class: "up-scroll", style: { padding: "14px", maxHeight: "720px" } },
      h("div", { class: "ai-draft-titlebar" },
        h("span", { class: "ai-draft-title", text: "AI Batch Rewrite Preview" }),
        badge("Batch Rewrite - warden (example)")
      ),
      h("div", { class: "bf-helper", text: "Review 2 proposed rewrite(s). Toggle rows on/off, edit text inline, then press Apply Selected." }),
      h("div", { class: "bf-row", style: { alignItems: "center", margin: "8px 0" } },
        h("label", { class: "bf-check-row" }, h("input", { class: "bf-check", type: "checkbox", checked: selectedCount === rows.length, onchange: (event) => { for (const row of rows) row.selected = event.target.checked; ctx.rerender(); } }), h("span", { text: "Select all" })),
        helper("2 entries")
      ),
      ...rows.map((row, index) =>
        h("div", { class: "ai-loc-row" },
          h("label", { class: "bf-check-row" }, h("input", { class: "bf-check", type: "checkbox", checked: row.selected, onchange: (event) => { row.selected = event.target.checked; ctx.rerender(); } })),
          h("div", { class: "ai-loc-row__fields" },
            field("Original", textArea(row.original, () => {}, { rows: 2, disabled: true })),
            h("div", { class: "ai-loc-row__arrow", text: "->" }),
            field("Rewritten (editable)", textArea(row.rewritten, (value) => { row.rewritten = value; }, { rows: 2 }))
          )
        )
      ),
      h("div", { class: "bf-row", style: { marginTop: "10px" } },
        h("span", { class: "bf-helper", text: `${selectedCount} of ${rows.length} selected` }),
        h("button", { class: "bf-button", type: "button", text: "Cancel", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Cancel", "Batch rewrite cancelled.") }),
        h("button", { class: "bf-button bf-button--primary", type: "button", text: "Apply Selected", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Apply Selected", "Applies the selected rewrites through the graph bridge. Demo only.") })
      ),
      helper("Footer count uses the \"{selected} of {total} selected\" pattern. Cancel reports \"Batch rewrite cancelled.\"")
    ),
    footer: h("div", { class: "bf-status-bar" }, h("span", { text: "Window title: AI Batch Rewrite Preview · rows are toggled on/off before apply" }))
  });
}

function flowDraftPreview(ctx) {
  const s = ctx.state.aiPanel;
  const fd = (s.flowDraft ??= {
    linearTitle: "Gate Check",
    linearSpeaker: "Warden",
    linearText: "The sanctum passage is clear tonight. Take the north gate.",
    prompt: "The warden waits at the gate. What do you say?",
    answer: "I'm expected. Let me pass.",
    branchTitle: "Expected",
    branchSpeaker: "Warden",
    branchText: "Expected by whom? Give me a name."
  });

  return windowFrame({
    title: "Editor window · AI dialog flow draft",
    className: "pf-window up-window--compact",
    body: h(
      "div",
      { class: "up-scroll", style: { padding: "14px", maxHeight: "760px" } },
      h("div", { class: "ai-draft-titlebar" },
        h("span", { class: "ai-draft-title", text: "Review Generated Dialog Flow" }),
        badge("Generate Dialog Flow")
      ),
      h("div", { class: "bf-helper", text: "Anchor: Selected" }),
      h("div", { class: "bf-helper", text: "Branches will connect to End after their final node." }),
      s.flowRecovery ? h("div", { class: "pf-helpbox pf-helpbox--warning", text: "Warning: AI response was recovered from malformed output. Review carefully before applying." }) : null,
      sectionTitle("Flow Preview"),
      h("div", { class: "pf-helpbox pf-helpbox--info", text: "Selected -> Gate Check -> Choice (The warden waits at the gate.)" }),
      helper("Branch summary lines read \"{answer} -> {node labels}\" and connect to End."),
      sectionTitle("Linear Nodes Before Choice"),
      h("div", { class: "ai-draft-card" },
        h("div", { class: "ai-draft-card__header" }, h("span", { class: "ai-draft-card__badge", text: "Linear Node 1" })),
        textRow("Title", fd.linearTitle, (value) => { fd.linearTitle = value; }),
        textRow("Speaker", fd.linearSpeaker, (value) => { fd.linearSpeaker = value; }),
        textAreaRow("Text", fd.linearText, (value) => { fd.linearText = value; })
      ),
      helper("Empty state: \"No linear nodes. The choice will attach directly to the anchor.\""),
      sectionTitle("Choice Node"),
      textAreaRow("Prompt", fd.prompt, (value) => { fd.prompt = value; }),
      h("div", { class: "ai-draft-card" },
        h("div", { class: "ai-draft-card__header" }, h("span", { class: "ai-draft-card__badge", text: "Choice 1" })),
        textRow("Answer", fd.answer, (value) => { fd.answer = value; }),
        h("div", { class: "ai-draft-card__header" }, h("span", { class: "ai-draft-card__badge", text: "Branch Node 1" })),
        textRow("Title", fd.branchTitle, (value) => { fd.branchTitle = value; }),
        textRow("Speaker", fd.branchSpeaker, (value) => { fd.branchSpeaker = value; }),
        textAreaRow("Text", fd.branchText, (value) => { fd.branchText = value; })
      ),
      helper("Empty branch state: \"No branch nodes.\""),
      h("div", { class: "bf-row", style: { marginTop: "10px" } },
        h("button", { class: "bf-button", type: "button", text: "Cancel", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Cancel", "Dialog flow draft cancelled.") }),
        h("button", { class: "bf-button bf-button--primary", type: "button", text: "Apply", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Apply", "Applies the generated flow through the graph bridge. Demo only.") }),
        toggleRow("Show recovery warning (example)", s.flowRecovery, (value) => { s.flowRecovery = value; ctx.rerender(); })
      )
    ),
    footer: h("div", { class: "bf-status-bar" }, h("span", { text: "Window title: AI Draft - Dialog Flow · no draft shows \"No dialog flow draft to preview.\"" }))
  });
}

function characterBanterReview(ctx) {
  const s = ctx.state.aiPanel;
  const dirty = s.banterDirty;
  const lines = (s.banterLines ??= [
    "The north gate stays shut after moonrise. Find another way.",
    "Moonrise, then? The sanctum can wait until dawn."
  ]);
  s.banterInclude ??= true;

  return windowFrame({
    title: "Editor window · Character banter review",
    className: "pf-window up-window--compact",
    body: h(
      "div",
      { class: "up-scroll", style: { padding: "14px", maxHeight: "680px" } },
      h("div", { class: "ai-draft-titlebar" },
        h("span", { class: "ai-draft-title", text: "Review Banter · Warden" }),
        h("span", { class: "dlg-ai-badge dlg-ai-badge--warning", text: "AI" })
      ),
      h("div", { class: "bf-helper", text: dirty ? "Review the suggestions below. Save the Character before adding." : "Review the suggestions below." }),
      h("div", { class: "ai-draft-card" },
        h("div", { class: "ai-draft-card__header" },
          h("span", { class: "ai-draft-card__badge", text: "Banter suggestion (example)" }),
          h("label", { class: "bf-check-row" }, h("input", { class: "bf-check", type: "checkbox", checked: s.banterInclude, onchange: (event) => { s.banterInclude = event.target.checked; } }), h("span", { text: "Include" }))
        ),
        textArea(lines[0], (value) => { lines[0] = value; }, { rows: 2 }),
        textArea(lines[1], (value) => { lines[1] = value; }, { rows: 2 })
      ),
      helper("Body content is provided by CharacterBanterCardElement.BuildReviewContent() and is represented here as an example."),
      h("div", { class: "bf-row", style: { marginTop: "10px" } },
        h("button", { class: "bf-button", type: "button", text: "Generate Banter", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Generate Banter", "A new banter proposal would be requested from the configured provider. Demo only.") }),
        h("button", { class: "bf-button bf-button--primary", type: "button", text: dirty ? "Save character and add 2" : "Add 2 selected", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), dirty ? "Save character and add 2" : "Add 2 selected", "Adds the selected banter lines to the character asset. Demo only.") }),
        h("button", { class: "bf-button", type: "button", text: "Discard", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Discard", "Discards the pending banter suggestions. Demo only.") }),
        h("button", { class: "bf-button", type: "button", text: "Cancel", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Cancel", "Closes the review without changes. Demo only.") })
      ),
      toggleRow("Character has unsaved changes (example)", s.banterDirty, (value) => { s.banterDirty = value; ctx.rerender(); })
    ),
    footer: h("div", { class: "bf-status-bar" }, h("span", { text: "Detached review shows \"This review is no longer attached to a Character. Close it and reopen Banter review.\"" }))
  });
}

function characterFillReview(ctx) {
  const s = ctx.state.aiPanel;
  s.fillDisplayName ??= "Warden";
  s.fillDescription ??= "Gate warden of the night market. Terse, watchful, exact about rules.";

  return windowFrame({
    title: "Editor window · Character fill review",
    className: "pf-window up-window--compact",
    body: h(
      "div",
      { class: "up-scroll", style: { padding: "14px", maxHeight: "680px" } },
      h("div", { class: "ai-draft-titlebar" },
        h("span", { class: "ai-draft-title", text: `Review Warden · ${s.fillSection}` }),
        h("span", { class: "dlg-ai-badge dlg-ai-badge--warning", text: "AI" })
      ),
      h("div", { class: "bf-helper", text: "Ready for review." }),
      enumRow("Example section", s.fillSection, ["Overview", "Voice & Language", "Physical", "Delivery"], (value) => { s.fillSection = value; ctx.rerender(); }),
      h("div", { class: "ai-draft-card" },
        h("div", { class: "ai-draft-card__header" }, h("span", { class: "ai-draft-card__badge", text: s.fillSection })),
        helper("Hosted surface: CharacterFillSectionSurfaceElement (section toggle, advanced field selection, and its own action buttons are hidden in this window)."),
        textRow("Display Name", s.fillDisplayName, (value) => { s.fillDisplayName = value; }),
        textAreaRow("Short Description", s.fillDescription, (value) => { s.fillDescription = value; })
      ),
      helper("Status fallbacks: \"Ready for review.\" and \"No current proposal.\"."),
      h("div", { class: "bf-row", style: { marginTop: "10px" } },
        h("button", { class: "bf-button bf-button--primary", type: "button", text: "Apply", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Apply", "Applies the reviewed fields to the character asset. Demo only.") }),
        h("button", { class: "bf-button", type: "button", text: "Cancel", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Cancel", "Closes the review without changes. Demo only.") })
      )
    ),
    footer: h("div", { class: "bf-status-bar" }, h("span", { text: "Title pattern: Review {characterName} · {sectionName} · fallback \"Review Character · {sectionName}\"" }))
  });
}

function planPreview(ctx) {
  const s = ctx.state.aiPanel;
  const statusMessages = {
    Ready: "3 operation(s) prepared and ready for review.",
    NeedsClarification: "More information is required before the plan can be applied.",
    TooLarge: "The request is too large to apply safely in one pass.",
    Invalid: "The plan is invalid and cannot be applied."
  };
  const statusTone = s.planStatus === "Ready" ? "info" : s.planStatus === "NeedsClarification" ? "warning" : "error";
  const blockedCount = 1;
  const applyBlockedWithoutPartial = blockedCount > 0 && !s.planPartial;

  const tile = (label, value) =>
    h("div", { class: "ai-plan-tile" }, h("span", { class: "ai-plan-tile__label", text: label }), h("span", { class: "ai-plan-tile__value", text: value }));
  const opRow = (label, value) =>
    h("div", { class: "ai-plan-detail" }, h("span", { class: "ai-plan-detail__label", text: label }), h("span", { class: "ai-plan-detail__value", text: value }));

  return windowFrame({
    title: "Utility window · AI plan preview",
    className: "pf-window up-window--compact",
    body: h(
      "div",
      { class: "up-scroll", style: { padding: "14px", maxHeight: "780px" } },
      h("div", { class: "ai-draft-titlebar" },
        h("span", { class: "ai-draft-title", text: "Review AI Graph Plan" }),
        h("span", { class: "bf-chip", text: "PLAN  PG-2481 (example)" })
      ),
      h("div", { class: "bf-helper", text: "Review operations, blocked items, and warnings before mutating the graph." }),
      h("div", { class: "bf-row", style: { margin: "6px 0" } },
        enumRow("Example status", s.planStatus, ["Ready", "NeedsClarification", "TooLarge", "Invalid"], (value) => { s.planStatus = value; ctx.rerender(); }),
        toggleRow("Show JSON recovery banner (example)", s.planRecovery, (value) => { s.planRecovery = value; ctx.rerender(); })
      ),
      s.planRecovery ? h("div", { class: "pf-helpbox pf-helpbox--warning", text: "JSON Recovery: The AI response required JSON recovery. Review the plan carefully before applying." }) : null,
      h("div", { class: `pf-helpbox pf-helpbox--${statusTone}`, text: `${s.planStatus.toUpperCase()}: ${statusMessages[s.planStatus]}` }),
      sectionTitle("Plan Overview"),
      h("div", { class: "ai-plan-grid" },
        tile("Operations", "3"),
        tile("Warnings", "1"),
        tile("Blocked", String(blockedCount)),
        tile("Mode", s.planPartial ? "Partial" : "Strict")
      ),
      sectionTitle("Summary"),
      h("div", { class: "bf-helper", text: "Adds a gate confrontation with one choice and wires the branch back to the market hub. (example plan summary)" }),
      sectionTitle("Operations  (3)"),
      h("div", { class: "ai-plan-op", style: { borderLeftColor: "#7aa7e0" } },
        h("div", { class: "ai-draft-card__header" },
          h("span", { class: "bf-chip", text: "OP 1" }),
          h("span", { class: "ai-draft-card__badge", text: "CreateDialogueNode" }),
          h("span", { class: "bf-chip", text: "op-gate-check" })
        ),
        opRow("Title", "Gate Check"),
        opRow("Speaker", "Warden"),
        opRow("Text", "The sanctum passage is clear tonight. Take the north gate.")
      ),
      h("div", { class: "ai-plan-op", style: { borderLeftColor: "#c9a45f" } },
        h("div", { class: "ai-draft-card__header" },
          h("span", { class: "bf-chip", text: "OP 2" }),
          h("span", { class: "ai-draft-card__badge", text: "CreateChoiceNode" }),
          h("span", { class: "bf-chip", text: "op-gate-choice" })
        ),
        opRow("Prompt", "The warden waits at the gate. What do you say?"),
        h("div", { class: "ai-plan-detail" }, h("span", { class: "ai-plan-detail__label", text: "Choices" })),
        h("div", { class: "bf-helper", text: "- I'm expected. Let me pass." }),
        h("div", { class: "bf-helper", text: "- The gate watch will vouch for me." }),
        h("div", { class: "bf-helper", text: "Depends On" }),
        h("div", { class: "bf-row" }, h("span", { class: "bf-chip", text: "op-gate-check" }))
      ),
      h("div", { class: "ai-plan-op", style: { borderLeftColor: "#7ecb82" } },
        h("div", { class: "ai-draft-card__header" },
          h("span", { class: "bf-chip", text: "OP 3" }),
          h("span", { class: "ai-draft-card__badge", text: "ConnectNodes" }),
          h("span", { class: "bf-chip", text: "op-connect" })
        ),
        opRow("Connections", ""),
        h("div", { class: "bf-helper", text: "- op-gate-check -> op-gate-choice" }),
        h("div", { class: "bf-helper", text: "- op-gate-choice -> End" })
      ),
      helper("Operation cards show the enum name verbatim (e.g. CreateOutcomeNode falls through to \"No preview renderer is defined for this operation type yet.\")."),
      helper("Null-plan state: \"No Plan\" — \"There is no AI plan to preview.\""),
      sectionTitle("Warnings  (1)"),
      h("div", { class: "pf-helpbox pf-helpbox--warning", text: "The anchor node was resolved by selection; verify the insertion point." }),
      sectionTitle("Blocked Operations  (1)"),
      h("div", { class: "pf-helpbox pf-helpbox--error", text: "op-insert-action: Target connection is busy in the current graph state." })
    ),
    footer: h("div", { class: "bf-status-bar", style: { gap: "8px", flexWrap: "wrap" } },
      toggleRow("Apply valid operations only", s.planPartial, (value) => { s.planPartial = value; ctx.rerender(); }),
      h("span", { class: "bf-helper", text: s.planPartial ? "Valid operations will apply. Blocked operations will be skipped and reported." : "Strict mode. Any blocked operations prevent all mutation." }),
      h("button", { class: "bf-button", type: "button", text: "Cancel", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Cancel", "Plan preview cancelled.") }),
      h("button", {
        class: "bf-button bf-button--primary",
        type: "button",
        text: "Apply",
        disabled: applyBlockedWithoutPartial,
        title: applyBlockedWithoutPartial ? "This plan contains blocked operations. Enable 'Apply valid operations only' to perform a partial apply." : "Apply the plan.",
        onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Apply Completed", "Applied: op-gate-check, op-gate-choice, op-connect. (example result; nothing was applied)")
      })
    )
  });
}

function activityIndicator(status) {
  if (status === "completed") return "OK";
  if (status === "running") return ">";
  if (status === "skipped") return "-";
  if (status === "attention" || status === "failed") return "!";
  return ".";
}

function activityStageRow(status, title, detail) {
  return h(
    "div",
    { class: `dlg-ai-activity-stage is-${status}` },
    h("span", { class: "dlg-ai-activity-stage-indicator", text: activityIndicator(status) }),
    h("span", { class: "dlg-ai-activity-stage-title", text: title }),
    h("span", { class: "dlg-ai-activity-stage-detail", text: detail })
  );
}

function activityButton(ctx, action) {
  const tone = action.primary
    ? "dlg-ai-activity-action--primary"
    : action.destructive
      ? "dlg-ai-activity-action--destructive"
      : "dlg-ai-activity-action--secondary";
  return h("button", {
    class: `dlg-ai-activity-action ${tone}`,
    type: "button",
    text: action.label,
    disabled: action.disabled,
    title: action.title,
    onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), action.label, action.message)
  });
}

function activitySession(ctx, options) {
  const s = ctx.state.aiPanel;
  const expanded = s.progressSessions[options.key] !== false;
  const classes = ["dlg-ai-activity-item", `is-${options.tone}`];
  if (expanded) classes.push("is-expanded");
  if (options.decision) classes.push("is-decision");
  if (options.stale) classes.push("is-stale");
  if (options.terminal) classes.push("is-terminal");

  return h(
    "div",
    { class: classes.join(" ") },
    h(
      "div",
      { class: "dlg-ai-activity-item-summary" },
      h(
        "div",
        { class: "dlg-ai-activity-item-summary-text" },
        h("span", { class: "dlg-ai-activity-item-title", text: options.title }),
        h("span", { class: "dlg-ai-activity-summary-target", title: options.target, text: options.target }),
        h("span", { class: "dlg-ai-activity-item-status", text: options.status })
      ),
      h("button", {
        class: "dlg-ai-activity-item-toggle",
        type: "button",
        text: expanded ? ">" : "<",
        title: expanded ? "Collapse activity details" : "Expand activity details",
        onclick: () => {
          s.progressSessions[options.key] = !expanded;
          ctx.rerender();
        }
      })
    ),
    options.decision
      ? h(
          "div",
          { class: "dlg-ai-activity-decision" },
          h("span", { class: "dlg-ai-activity-decision-badge", text: "Decision required" }),
          h("div", { class: "dlg-ai-activity-decision-prompt", text: options.decision.prompt }),
          h(
            "div",
            { class: "dlg-ai-activity-decision-options" },
            ...options.decision.options.map((action) => activityButton(ctx, action))
          )
        )
      : null,
    expanded
      ? h(
          "div",
          { class: "dlg-ai-activity-item-detail" },
          h(
            "div",
            { class: "dlg-ai-activity-item-metadata" },
            h("span", { class: "dlg-ai-activity-target", text: options.target }),
            options.elapsed ? h("span", { class: "dlg-ai-activity-elapsed", text: `Elapsed ${options.elapsed}` }) : null,
            options.progress ? h("span", { class: "dlg-ai-activity-progress", text: options.progress }) : null
          ),
          options.headline ? h("div", { class: "dlg-ai-activity-headline", text: options.headline }) : null,
          options.detail ? h("div", { class: "dlg-ai-activity-detail-copy", text: options.detail }) : null,
          options.attention ? h("div", { class: "dlg-ai-activity-attention", text: options.attention }) : null,
          options.stages && options.stages.length
            ? h("div", { class: "dlg-ai-activity-stages" }, ...options.stages)
            : null,
          options.actions && options.actions.length
            ? h(
                "div",
                { class: "dlg-ai-activity-actions" },
                ...options.actions.map((action) => activityButton(ctx, action))
              )
            : null
        )
      : null
  );
}

function activityEdge(ctx, status, expanded) {
  return h(
    "div",
    { class: `dlg-ai-activity-edge is-attention${expanded ? " is-expanded" : ""}` },
    h(
      "button",
      {
        class: "dlg-ai-activity-edge-toggle",
        type: "button",
        title: `${status}. ${expanded ? "Collapse AI activity" : "Expand AI activity"}`,
        onclick: () => {
          ctx.state.aiPanel.progressExpanded = !expanded;
          ctx.rerender();
        }
      },
      h("span", { class: "dlg-ai-activity-ai-cue", text: "✦" }),
      h("span", { class: "dlg-ai-activity-edge-status", text: status })
    )
  );
}

function activityPanel(ctx, target, count, sessions) {
  return h(
    "div",
    { class: "dlg-ai-activity-panel is-expanded" },
    h(
      "div",
      { class: "dlg-ai-activity-panel-header" },
      h(
        "div",
        { class: "dlg-ai-activity-panel-header-text" },
        h("span", { class: "dlg-ai-activity-title", text: "AI activity" }),
        h("span", { class: "dlg-ai-activity-target", text: target }),
        h("span", { class: "dlg-ai-activity-panel-count", text: count })
      ),
      h("button", {
        class: "dlg-ai-activity-panel-toggle",
        type: "button",
        text: ">",
        title: "Collapse AI activity",
        onclick: () => {
          ctx.state.aiPanel.progressExpanded = false;
          ctx.rerender();
        }
      })
    ),
    h("div", { class: "dlg-ai-activity-list" }, ...sessions)
  );
}

function activityApplyBlocker(ctx) {
  return h(
    "div",
    { class: "dlg-ai-activity-apply-blocker" },
    h("div", { class: "dlg-ai-activity-apply-blocker-scrim" }),
    h(
      "div",
      { class: "dlg-ai-activity-apply-blocker-panel" },
      h("div", { class: "dlg-ai-activity-apply-blocker-title", text: "Beka Forge AI" }),
      h("div", { class: "dlg-ai-activity-apply-blocker-headline", text: "Restoring graph interaction" }),
      h("div", { class: "dlg-ai-activity-apply-blocker-detail", text: "The operation finished, but graph interaction could not be restored. Retry restoration before continuing." }),
      h(
        "div",
        { class: "dlg-ai-activity-apply-blocker-actions" },
        h("button", {
          class: "dlg-ai-activity-action dlg-ai-activity-action--secondary",
          type: "button",
          text: "Close",
          onclick: () => {
            ctx.state.aiPanel.progressBlocker = false;
            ctx.rerender();
          }
        }),
        activityButton(ctx, {
          label: "Retry restoration",
          message: "Retries restoring graph interaction. Demo only; the editor lock is not real."
        })
      )
    )
  );
}

function authoringProgress(ctx) {
  const s = ctx.state.aiPanel;
  if (!s.progressSessions) s.progressSessions = { running: true, plan: true, decision: true };

  const sessions = [];

  sessions.push(
    activitySession(ctx, {
      key: "running",
      tone: "running",
      title: "AI Activity",
      target: "Gate Confrontation",
      status: "AI - Validating...",
      elapsed: "1m 12s",
      progress: "2 of 4 steps",
      headline: "Validating result",
      detail: "Checking the generated result before any graph mutation.",
      stages: [
        activityStageRow("completed", "Preparing context", "Request context prepared."),
        activityStageRow("completed", "Generate node draft", "Draft created for 3 dialogue nodes."),
        activityStageRow("running", "Validate generated content", "Checking the generated result before any graph mutation."),
        activityStageRow("pending", "Apply changes", "")
      ],
      actions: [
        {
          label: "Cancel",
          message: "Cancels the authoring run and records a cancellation report. Demo only; no run exists."
        }
      ]
    })
  );

  sessions.push(
    activitySession(ctx, {
      key: "plan",
      tone: "attention",
      title: "AI Activity",
      target: "Market Hub",
      status: "AI - Preview ready",
      elapsed: "2m 04s",
      progress: "3 of 4 steps",
      headline: "Review generated graph preview",
      detail: "The generated plan adds 3 operations and updates 1 existing node. (example)",
      attention: "Review the generated preview before applying.",
      stages: [
        activityStageRow("completed", "Preparing context", "Request context prepared."),
        activityStageRow("attention", "Generate graph operations", "A generated preview is ready for review."),
        activityStageRow("pending", "Apply graph operations", ""),
        activityStageRow("pending", "Validate graph", "")
      ],
      actions: [
        { label: "Preview", primary: true, message: "Opens the graph operation plan preview window. Demo only." },
        { label: "Apply", primary: true, message: "Applies the generated graph operations. Demo only; nothing is applied." },
        { label: "Discard", message: "Discards the generated plan. Demo only." }
      ]
    })
  );

  if (s.progressDecision) {
    sessions.push(
      activitySession(ctx, {
        key: "decision",
        tone: "attention",
        title: "Asset creation required",
        target: "Gate Confrontation",
        status: "AI - Awaiting decision",
        elapsed: "2m 19s",
        progress: "3 of 4 steps",
        headline: "Awaiting user decision",
        attention: "Decision required",
        decision: {
          prompt: "This graph references 2 missing character assets. Create them now? (example decision)",
          options: [
            { label: "Create missing assets", primary: true, message: "Creates the missing assets, then continues the run. Demo only." },
            { label: "Skip assets", message: "Skips asset creation and continues with unresolved references. Demo only." }
          ]
        }
      })
    );
  }

  const attentionCount = s.progressDecision ? 2 : 1;
  const countText = attentionCount === 1 ? "1 running · 1 needs attention" : "1 running · 2 need attention";
  const headerTarget = sessions.length === 2 ? "2 represented activities" : `${sessions.length} represented activities`;
  const edgeStatus = s.progressDecision
    ? `AI · ${sessions.length} activities · 1 Decision required`
    : `AI · ${sessions.length} activities · Preview ready`;

  return windowFrame({
    title: "Graph canvas · AI activity overlay",
    className: "pf-window up-window--compact",
    body: h(
      "div",
      { class: "ai-act-stage" },
      h("div", { class: "ai-float-stage__canvas" }),
      h("span", {
        class: "ai-float-stage__hint",
        text: "Fixed example graph canvas. In Unity the activity host overlays the graph editor: edge notification always visible, panel 420 px at a 58 px top inset."
      }),
      activityEdge(ctx, edgeStatus, s.progressExpanded),
      s.progressExpanded ? activityPanel(ctx, headerTarget, countText, sessions) : null,
      s.progressBlocker ? activityApplyBlocker(ctx) : null
    ),
    footer: h(
      "div",
      { class: "bf-status-bar", style: { gap: "8px", flexWrap: "wrap" } },
      toggleRow("Show expanded activity panel", s.progressExpanded, (value) => { s.progressExpanded = value; ctx.rerender(); }),
      toggleRow("Show decision example", s.progressDecision, (value) => { s.progressDecision = value; ctx.rerender(); }),
      toggleRow("Show apply blocker overlay", s.progressBlocker, (value) => { s.progressBlocker = value; ctx.rerender(); }),
      h("span", {
        class: "bf-helper",
        text: "Source layout: 420 px panel, 58 px top inset, edge notification top-right. Session titles, graph names, step details, and decision prompts are examples."
      })
    )
  });
}

const views = {
  "floating-panel": floatingPanel,
  "draft-preview": draftPreview,
  "localization-preview": localizationPreview,
  "batch-rewrite-preview": batchRewritePreview,
  "flow-draft-preview": flowDraftPreview,
  "character-banter-review": characterBanterReview,
  "character-fill-review": characterFillReview,
  "plan-preview": planPreview,
  "authoring-progress": authoringProgress
};

export const notes = {
  "floating-panel": "Floating panel chrome, sidebar command form, status texts, and the missing-extension ad are recreated from DialogGraphAiFloatingPanel.cs and DialogGraphAiSidebarContent.cs. Provider names and prompts are fictitious examples; the panel is shown over a fixed example canvas.",
  "draft-preview": "Draft preview layouts follow AiDraftPreviewWindow.cs for the dialog nodes, choice node, and action node modes. Draft content and validation issues are fabricated examples; Apply and Cancel change example state only.",
  "localization-preview": "Layout and labels follow AiLocalizationPreviewWindow.cs. Source keys and translations are fabricated French examples; Apply Selected changes example state only.",
  "batch-rewrite-preview": "Layout and labels follow BatchRewritePreviewWindow.cs. Original and rewritten lines are fabricated examples; no graph text is read or written.",
  "flow-draft-preview": "Layout and section headings follow DialogFlowDraftPreviewWindow.cs. Flow content is a fabricated example; no graph structure is inspected or modified.",
  "character-banter-review": "Window chrome and footer actions follow CharacterBanterReviewWindow.cs. The hosted banter cards come from CharacterBanterCardElement and are represented as a static example; no character asset is read or written.",
  "character-fill-review": "Window chrome and footer actions follow CharacterFillReviewWindow.cs. Sections and fields are fabricated examples of CharacterFillSectionSurfaceElement content; no character asset is read or written.",
  "plan-preview": "Layout, banners, overview strip, operation cards, and the partial-apply gate follow GraphOperationPlanPreviewWindow.cs. The example plan, warnings, and blocked entry are fabricated; Apply changes example state only and shows the example result dialog.",
  "authoring-progress": "Edge notification, activity panel, session cards, stage timeline, decision block, and apply blocker follow AiAuthoringProgressPopupWindow.cs, AiAuthoringActivitySessionView.cs, and AiAuthoringActivity.uss. Activity titles, graph names, elapsed values, step details, and the decision prompt are fabricated examples; Cancel, Preview, Apply, Discard, and Retry restoration only show demo dialogs."
};

export async function render(host, ctx) {
  if (ctx.surface && views[ctx.surface]) ctx.state.aiPanel.view = ctx.surface;
  const active = views[ctx.state.aiPanel.view] ? ctx.state.aiPanel.view : "floating-panel";
  host.append(views[active](ctx));
}
