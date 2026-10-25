/* Current DGS dialogs and secondary windows.
   Reproduces DialogWelcomeWindow, DialogPublicInformationWindow, DialogCreateAssetWindow,
   DialogGraphValidationPanelWindow, DialogRewritePreviewWindow, SaveGraphPromptWindow,
   the production CSV ImportPreviewWindow, AddLanguageDialog, AiTranslationChoiceDialog,
   DialogLocalizationIOWindow, and AiModelPickerPopup.
   Example data only; nothing is written, imported, exported, translated, or created. */

import {
  h,
  windowFrame,
  card,
  field,
  textInput,
  textArea,
  enumRow,
  toggleRow,
  checkbox,
  badge,
  sectionTitle,
  helper,
  toastOn,
  bindOverlay
} from "../controls.js";

const languageChoices = [
  { label: "French", code: "fr" },
  { label: "German", code: "de" },
  { label: "Japanese", code: "ja" },
  { label: "Spanish", code: "es" },
  { label: "Italian", code: "it" },
  { label: "Portuguese (Brazil)", code: "pt-BR" },
  { label: "Korean", code: "ko" },
  { label: "Chinese (Simplified)", code: "zh-Hans" },
  { label: "Polish", code: "pl" },
  { label: "Ukrainian", code: "uk" },
  { label: "Turkish", code: "tr" },
  { label: "Arabic", code: "ar" }
];

const modelChoices = [
  "claude-opus-4-6",
  "claude-sonnet-4-6",
  "deepseek-v4",
  "gemini-3-pro",
  "gpt-5.1",
  "gpt-5.1-codex",
  "ollama/qwen3:32b"
];

export const entries = [
  { id: "welcome", label: "Dialog · Welcome" },
  { id: "public-information", label: "Dialog · Public information" },
  { id: "create-asset", label: "Dialog · Create asset" },
  { id: "validation-panel", label: "Window · Graph validation" },
  { id: "rewrite-preview", label: "Dialog · Rewrite preview" },
  { id: "save-graph", label: "Dialog · Save graph" },
  { id: "import-preview", label: "Dialog · CSV import preview" },
  { id: "add-language", label: "Dialog · Add languages" },
  { id: "translation-choice", label: "Dialog · AI translation" },
  { id: "localization-io", label: "Window · Localization export / import" },
  { id: "ai-model-picker", label: "Popup · AI model picker" }
];

export const note =
  "Recreated from the current DGS editor dialogs: Welcome, Public Information, Create Asset, " +
  "Graph Validation, Rewrite Preview, Save Graph, production CSV Import Preview, Add Languages, " +
  "AI Translation Choice, Localization Export / Import, and the AI model picker. Example data only.";

export const notes = {
  welcome:
    "Hero, links, What's New, and the dismiss toggle follow DialogWelcomeWindow.cs and the default welcome branding. The banner asset is not reproduced.",
  "public-information":
    "Topic titles and the online/bundled resolution states follow DialogPublicInformationCatalog.cs. Body text is an example stand-in for fetched documentation.",
  "create-asset":
    "All four openers are represented: Character, Action, Environment, and Scene Context. Fields and required-name errors follow DialogCreateAssetWindow.cs.",
  "validation-panel":
    "Header, summary, severity filters, issue rows, Focus action, and empty states follow DialogGraphValidationPanelWindow.cs. Issue data is fictitious.",
  "rewrite-preview":
    "Two-column original/editable rewrite layout and footer actions follow DialogRewritePreviewWindow.cs.",
  "save-graph":
    "Mode descriptions, loaded-target row, overwrite selector, Save As field, target preview, and disabled Save state follow SaveGraphPromptWindow.cs.",
  "import-preview":
    "Schema counts, accepted/conflict/rejected rows, legacy warning, and apply labels follow the ImportPreviewWindow nested in DialogProductionTabController.cs.",
  "add-language":
    "Search, Popular/All/None actions, selection summary, custom locale validation, and the 520px modal follow AddLanguageDialog.cs.",
  "translation-choice":
    "Three choice cards and the missing-extension banner follow AiTranslationChoiceDialog.cs. AI availability is fictional.",
  "localization-io":
    "Export and Import tabs, configuration fields, override toggles, reviewed-plan states, and action labels follow DialogLocalizationIOWindow.cs.",
  "ai-model-picker":
    "Search, counts, check-marked current model, empty state, and Select model footer follow AiModelPickerPopup in AiModelPickerField.cs."
};

function button(label, options = {}) {
  return h("button", {
    class: `bf-button${options.primary ? " bf-button--primary" : ""}${options.small ? " bf-button--small" : ""}`,
    type: "button",
    text: label,
    disabled: !!options.disabled,
    title: options.title || "",
    onclick: options.onClick
  });
}

function dialogBar(label, choices, active, onPick) {
  return h(
    "div",
    { class: "dgs-dialog-previewbar" },
    h("span", { class: "dgs-dialog-previewbar__label", text: label }),
    ...choices.map((choice) =>
      h("button", {
        class: `dgs-dialog-previewbar__choice${choice.id === active ? " is-active" : ""}`,
        type: "button",
        text: choice.label,
        onclick: () => onPick(choice.id)
      })
    )
  );
}

function stage(content, bar) {
  return h("div", { class: "dgs-dialog-stage" }, bar || null, content);
}

function frame(title, body, options = {}) {
  return windowFrame({
    title,
    hint: options.hint || "",
    className: `dgs-dialog${options.className ? ` ${options.className}` : ""}`,
    body,
    footer: options.footer
  });
}

function dialogBody(...children) {
  return h("div", { class: "dgs-dialog-body" }, ...children);
}

function dialogFooter(...children) {
  return h("div", { class: "dgs-dialog-footer" }, ...children);
}

function explain(host, title, message) {
  const windowHost = host && typeof host.querySelector === "function" ? host.querySelector(".up-window") : null;
  if (typeof document !== "undefined" && typeof document.addEventListener === "function") {
    toastOn(windowHost || host, title, message);
    return;
  }
  const overlay = h(
    "div",
    { class: "up-overlay" },
    h(
      "div",
      { class: "up-window up-window--popup up-message", role: "dialog", "aria-modal": "true", "aria-label": title },
      h("div", { class: "up-window__titlebar" }, h("span", { text: title })),
      h("div", { class: "up-message__body", text: message }),
      h(
        "div",
        { class: "up-message__footer" },
        h("button", {
          class: "bf-button bf-button--primary",
          type: "button",
          text: "OK",
          onclick: () => {
            if (typeof overlay.remove === "function") overlay.remove();
          }
        })
      )
    )
  );
  host.append(overlay);
  queueMicrotask(() => {
    if (typeof document !== "undefined" && typeof document.addEventListener === "function") bindOverlay(overlay);
  });
}

function welcome(ctx, host) {
  const s = ctx.state.dgsDialogs;
  const hero = h(
    "div",
    { class: "dgs-dialog-hero" },
    h("div", { class: "dgs-dialog-hero__mark", text: "BF" }),
    h(
      "div",
      { class: "dgs-dialog-hero__copy" },
      h("div", { class: "dgs-dialog-eyebrow", text: "WELCOME" }),
      h("div", { class: "dgs-dialog-hero__title", text: "Dialogue Graph System" }),
      h("div", { class: "dgs-dialog-hero__meta", text: "v4.0.0  -  Beka Forge" }),
      h("div", {
        class: "dgs-dialog-hero__description",
        text: "Build branching dialogue visually with a polished editor, runtime UI, validation, variables, themes, actions, localization, and cross-graph traversal."
      })
    )
  );

  const links = h(
    "div",
    { class: "dgs-dialog-links" },
    button("Documentation", {
      primary: true,
      onClick: () => explain(host, "Documentation", "Would open https://bekaforge.com/dgs-docs/ in a browser. Demo only.")
    }),
    button("Changelog", {
      onClick: () => explain(host, "Changelog", "Would open https://bekaforge.com/dgs-docs/changelog.html in a browser. Demo only.")
    }),
    button("License", {
      onClick: () => explain(host, "License", "Would open https://bekaforge.com/dgs-docs/license.html in a browser. Demo only.")
    }),
    button("Support", {
      onClick: () => explain(host, "Support", "Would open https://bekaforge.com/dgs-docs/support.html in a browser. Demo only.")
    }),
    button("Discord", {
      onClick: () => explain(host, "Discord", "Would open https://discord.gg/hD8e6WFFWT in a browser. Demo only.")
    }),
    button("View Bundled Copy", {
      title: "Documentation: bundled offline copy",
      onClick: () => explain(host, "View Bundled Copy", "Would open the bundled copy of https://bekaforge.com/dgs-docs/ in a browser. Demo only.")
    })
  );

  const release = card(
    "What's New",
    h(
      "ul",
      { class: "dgs-dialog-release-list" },
      h("li", { text: "Edit variable, condition, and schema-backed action values with typed controls." }),
      h("li", { text: "Apply exact variable definitions explicitly; runtime keys remain case-sensitive." }),
      h("li", { text: "Audit definitions, graph usage, and selected scene wiring in the read-only Project health tab." }),
      h("li", { text: "Current graph schema is 4; healthy schema-2/3 graphs are not silently promoted." })
    )
  );

  const dismiss = checkbox("Don't show again", s.welcomeDontShow, (checked) => {
    s.welcomeDontShow = checked;
  });

  return stage(
    frame(
      "Dialogue Graph System",
      dialogBody(hero, links, release, h("div", { class: "dgs-dialog-dismiss" }, dismiss)),
      { className: "dgs-dialog--welcome" }
    )
  );
}

const publicTopics = {
  documentation: {
    title: "Dialogue Graph System Documentation",
    url: "https://bekaforge.com/dgs-docs/",
    body:
      "Dialogue Graph System\n\n" +
      "Build and ship branching dialogue with a visual graph editor, typed definitions, localization tables, " +
      "runtime UI, and a production tracker.\n\n" +
      "Getting started\n" +
      "1. Open Tools > Beka Forge > Dialogue Graph System > Open Editor.\n" +
      "2. Create or open a graph from the Home tab.\n" +
      "3. Add nodes from the graph canvas context menu.\n" +
      "4. Validate the graph, then run it from a scene.\n\n" +
      "This preview shows example documentation text. The editor loads the online copy and falls back " +
      "to a bundled offline copy when the request fails."
  },
  changelog: {
    title: "Dialogue Graph System Changelog",
    url: "https://bekaforge.com/dgs-docs/changelog.html",
    body:
      "Version 4.0.0\n" +
      "- Unified editor shell with Home, Graphs, Definitions, Production, Project health, and Settings.\n" +
      "- Read-only Project health audit for definitions, graph usage, and scene wiring.\n" +
      "- Explicit graph schema upgrade flow.\n\n" +
      "Version 3.9.0\n" +
      "- Production tracker import and export.\n" +
      "- Localization reviewed-plan import."
  },
  license: {
    title: "Dialogue Graph System License",
    url: "https://bekaforge.com/dgs-docs/license.html",
    body:
      "Dialogue Graph System is distributed under the terms included with your purchase.\n\n" +
      "This documentation preview is not a license grant. Refer to the license bundled with the package."
  },
  support: {
    title: "Dialogue Graph System Support",
    url: "https://bekaforge.com/dgs-docs/support.html",
    body:
      "Support\n\n" +
      "Include your Unity version, Dialogue Graph System version, and the exact steps that reproduce the issue.\n" +
      "Do not include credentials or provider API keys in support messages."
  }
};

function publicInformation(ctx, host) {
  const s = ctx.state.dgsDialogs;
  const entry = publicTopics[s.publicTopic] || publicTopics.documentation;
  const bundled = s.publicBundled;
  const status = bundled
    ? "Bundled copy — Online request unavailable"
    : "Online copy";
  const body = dialogBody(
    h("div", { class: "dgs-dialog-page-title", text: entry.title }),
    h("div", { class: `dgs-dialog-status${bundled ? " is-warning" : ""}`, text: status }),
    h(
      "div",
      { class: "dgs-dialog-actions" },
      button("Reload Online", { onClick: () => { s.publicBundled = false; ctx.rerender(); } }),
      button("Open in Browser", {
        onClick: () => explain(host, "Open in Browser", `Would open ${entry.url} in a browser. Demo only.`)
      }),
      button("View Bundled Copy", { onClick: () => { s.publicBundled = true; ctx.rerender(); } })
    ),
    h("div", { class: "dgs-dialog-doc", text: entry.body })
  );

  return stage(
    frame("Dialogue Graph System Documentation", body, { className: "dgs-dialog--documentation" }),
    dialogBar(
      "Topic",
      [
        { id: "documentation", label: "Documentation" },
        { id: "changelog", label: "Changelog" },
        { id: "license", label: "License" },
        { id: "support", label: "Support" }
      ],
      s.publicTopic,
      (id) => {
        s.publicTopic = id;
        ctx.rerender();
      }
    )
  );
}

const createHeader = {
  character: ["Create Character", "Fill in the fields below and click Create.", "CHARACTER"],
  action: ["Create Action", "Define an action asset for this project.", "ACTION"],
  environment: ["Create Environment", "Define a reusable environment asset.", "ENVIRONMENT"],
  context: ["Create Scene Context", "Bundle environment, characters and intent.", "CONTEXT SO"]
};

function createAsset(ctx, host) {
  const s = ctx.state.dgsDialogs;
  if (s.actionDescription === undefined) s.actionDescription = "";
  if (s.createResult === undefined) s.createResult = null;
  const kind = s.createKind;
  const [title, subtitle, badgeText] = createHeader[kind] || createHeader.character;
  const fields = [];

  if (kind === "character") {
    fields.push(
      sectionTitle("Identity"),
      field("Display Name *", textInput(s.createName, (value) => { s.createName = value; }), { tooltip: "Required" }),
      field("Character ID", textInput(s.createId, (value) => { s.createId = value; })),
      field("Portrait (Sprite)", h("div", { class: "dgs-dialog-object", text: "None (Sprite)" })),
      sectionTitle("Writing Context"),
      field("Short Description", textArea(s.createDescription, (value) => { s.createDescription = value; }, { rows: 3 })),
      field("Speech Style", textInput(s.createSpeechStyle, (value) => { s.createSpeechStyle = value; }))
    );
  } else if (kind === "action") {
    fields.push(
      sectionTitle("Identity"),
      field("Action ID *", textInput(s.actionId, (value) => { s.actionId = value; }), { tooltip: "Required" }),
      field("Display Name", textInput(s.actionDisplayName, (value) => { s.actionDisplayName = value; })),
      field("Description", textArea(s.actionDescription, (value) => { s.actionDescription = value; }, { rows: 3 })),
      sectionTitle("Defaults"),
      field("Default Payload JSON", textArea(s.actionPayload, (value) => { s.actionPayload = value; }, { rows: 4 })),
      toggleRow("Wait for Completion", s.actionWait, (checked) => { s.actionWait = checked; }),
      field("Default Delay (s)", textInput(s.actionDelay, (value) => { s.actionDelay = Number(value); }, { number: true, step: 0.05 }))
    );
  } else if (kind === "environment") {
    fields.push(
      sectionTitle("Identity"),
      field("Display Name *", textInput(s.envName, (value) => { s.envName = value; }), { tooltip: "Required" }),
      field("Environment ID", textInput(s.envId, (value) => { s.envId = value; })),
      sectionTitle("Description"),
      field("Description", textArea(s.envDescription, (value) => { s.envDescription = value; }, { rows: 3 })),
      field("Atmosphere", textInput(s.envAtmosphere, (value) => { s.envAtmosphere = value; })),
      field("Default Tone", textInput(s.envTone, (value) => { s.envTone = value; }))
    );
  } else {
    fields.push(
      sectionTitle("Asset Identity"),
      field("Asset Name *", textInput(s.contextName, (value) => { s.contextName = value; }), { tooltip: "Required" }),
      sectionTitle("References"),
      field("Environment", h("div", { class: "dgs-dialog-object", text: "Market Courtyard (DialogEnvironmentSO)" })),
      sectionTitle("Scene Intent"),
      field("Scene Goal", textArea(s.contextGoal, (value) => { s.contextGoal = value; }, { rows: 3 })),
      field("Tone", textInput(s.contextTone, (value) => { s.contextTone = value; })),
      field("Extra Rules", textArea(s.contextRules, (value) => { s.contextRules = value; }, { rows: 3 }))
    );
  }

  const error = h("div", { class: "dgs-dialog-error", text: s.createError || "" });
  fields.push(error);

  const header = h(
    "div",
    { class: "dgs-dialog-header" },
    h(
      "div",
      null,
      h(
        "div",
        { class: "dgs-dialog-header__title-row" },
        h("span", { class: "dgs-dialog-header__title", text: title }),
        h("span", { class: "dgs-dialog-header__badge", text: badgeText })
      ),
      h("div", { class: "dgs-dialog-header__subtitle", text: subtitle })
    )
  );

  const create = () => {
    const name = kind === "character" ? s.createName : kind === "environment" ? s.envName : kind === "context" ? s.contextName : s.actionId;
    if (!name || !name.trim()) {
      s.createError = kind === "context" ? "Asset Name is required." : kind === "action" ? "Action ID is required." : "Display Name is required.";
      error.textContent = s.createError;
      return;
    }
    s.createError = "";
    s.createResult = name.trim();
    error.textContent = "";
    const noun = title.replace("Create ", "").toLowerCase();
    explain(host, "Create", `Create would add the ${noun} asset "${name.trim()}". Demo only.`);
  };

  return stage(
    frame(
      title,
      dialogBody(header, ...fields),
      {
        className: "dgs-dialog--create",
        footer: dialogFooter(
          button("Cancel", { onClick: () => explain(host, "Cancel", "Cancel would close this dialog without creating an asset. Demo only.") }),
          button("Create", { primary: true, onClick: create })
        )
      }
    ),
    dialogBar(
      "Create variant",
      [
        { id: "character", label: "Character" },
        { id: "action", label: "Action" },
        { id: "environment", label: "Environment" },
        { id: "context", label: "Scene Context" }
      ],
      kind,
      (id) => {
        s.createKind = id;
        s.createError = "";
        ctx.rerender();
      }
    )
  );
}

const validationIssues = [
  {
    severity: "Error",
    code: "DGS-104",
    message: "Choice target references a node that is not part of this graph.",
    guid: "0f8c2a1e-4b19-4e0a-9bd4-2f1d9c7a5e11"
  },
  {
    severity: "Error",
    code: "DGS-118",
    message: "Action node 'open_gate' has no registered action definition.",
    guid: "8a2d4c6e-1f30-4b7a-8e5c-9d0b3a2f6c44"
  },
  {
    severity: "Warning",
    code: "DGS-206",
    message: "Speaker character 'gate_warden' has no portrait assigned.",
    guid: "2b7e9d10-6c48-4f5b-a1d2-7e8c0f3b4a55"
  },
  {
    severity: "Warning",
    code: "DGS-212",
    message: "Variable 'reputation' is read but never assigned in this graph.",
    guid: "5c1f8a2b-9d64-4e02-b7a3-6f4e1d8c9b66"
  },
  {
    severity: "Info",
    code: "DGS-301",
    message: "Graph contains 14 nodes across 3 dialogue flows.",
    guid: ""
  }
];

function validationPanel(ctx, host) {
  const s = ctx.state.dgsDialogs;
  const visible = validationIssues.filter(
    (issue) =>
      (issue.severity === "Error" && s.validationErrors) ||
      (issue.severity === "Warning" && s.validationWarnings) ||
      (issue.severity === "Info" && s.validationInfo)
  );
  const errorCount = validationIssues.filter((issue) => issue.severity === "Error").length;
  const warningCount = validationIssues.filter((issue) => issue.severity === "Warning").length;
  const infoCount = validationIssues.filter((issue) => issue.severity === "Info").length;

  const issueRows = visible.length
    ? visible.map((issue) =>
        h(
          "div",
          { class: `dgs-issue dgs-issue--${issue.severity.toLowerCase()}` },
          h(
            "div",
            { class: "dgs-issue__text" },
            h("div", { class: "dgs-issue__code", text: `${issue.severity} - ${issue.code}` }),
            h("div", { class: "dgs-issue__message", text: issue.message }),
            issue.guid ? h("div", { class: "dgs-issue__guid", text: issue.guid }) : null
          ),
          issue.guid
            ? button("Focus", {
                small: true,
                onClick: () => explain(host, "Focus", `Focus would select ${issue.code} in the graph. Demo only.`)
              })
            : null
        )
      )
    : [
        h(
          "div",
          { class: "dgs-issue-empty" },
          h("div", { text: "No visible issues" }),
          h("div", { class: "dgs-issue-empty__copy", text: "Change the severity filters to show hidden results." })
        )
      ];

  const body = h(
    "div",
    { class: "dgs-validation" },
    h(
      "div",
      { class: "dgs-validation__header" },
      h(
        "div",
        { class: "dgs-validation__title-row" },
        h("span", { class: "dgs-validation__title", text: "Graph Validation" }),
        button("Refresh", {
          small: true,
          onClick: () => explain(host, "Refresh", "Refresh would re-run graph validation. Demo only.")
        })
      ),
      h("div", { class: "dgs-validation__graph", text: "MarketLever" }),
      h("div", { class: "dgs-validation__summary", text: `${errorCount} error(s), ${warningCount} warning(s), ${infoCount} info.` })
    ),
    h(
      "div",
      { class: "dgs-validation__filters" },
      checkbox("Errors", s.validationErrors, (checked) => { s.validationErrors = checked; ctx.rerender(); }),
      checkbox("Warnings", s.validationWarnings, (checked) => { s.validationWarnings = checked; ctx.rerender(); }),
      checkbox("Info", s.validationInfo, (checked) => { s.validationInfo = checked; ctx.rerender(); })
    ),
    h("div", { class: "dgs-validation__issues" }, ...issueRows)
  );

  return stage(frame("Graph Validation", body, { className: "dgs-dialog--validation" }));
}

function rewritePreview(ctx, host) {
  const s = ctx.state.dgsDialogs;
  if (s.rewriteApplied === undefined) s.rewriteApplied = null;
  const columns = h(
    "div",
    { class: "dgs-rewrite" },
    h(
      "div",
      { class: "dgs-rewrite__column" },
      h("div", { class: "dgs-rewrite__badge", text: "Original" }),
      h("div", { class: "dgs-rewrite__original", text: s.rewriteOriginal })
    ),
    h(
      "div",
      { class: "dgs-rewrite__column" },
      h("div", { class: "dgs-rewrite__badge is-rewrite", text: "Rewritten (editable)" }),
      textArea(s.rewriteText, (value) => { s.rewriteText = value; }, { height: 160 })
    )
  );

  const header = h(
    "div",
    { class: "dgs-dialog-header" },
    h("div", { class: "dgs-dialog-header__title", text: "Review Rewrite" }),
    h("div", {
      class: "dgs-dialog-header__subtitle",
      text: "Compare the original and rewritten line. Edit the rewrite if needed, then Apply or Cancel."
    })
  );

  const apply = () => {
    const next = (s.rewriteText || "").trim();
    if (!next) {
      explain(host, "Apply", "Enter a rewritten line before applying. Demo only.");
      return;
    }
    s.rewriteApplied = next;
    explain(host, "Apply", "Apply would replace the selected line in the graph. Demo only.");
  };

  return stage(
    frame("AI Rewrite Preview", dialogBody(header, columns), {
      className: "dgs-dialog--rewrite",
      footer: dialogFooter(
        button("Cancel", { onClick: () => explain(host, "Cancel", "Cancel would close this dialog without applying the rewrite. Demo only.") }),
        button("Apply", { primary: true, onClick: apply })
      )
    })
  );
}

const saveModes = [
  { value: "UseLoaded", label: "Use Loaded" },
  { value: "OverwriteExisting", label: "Overwrite Existing" },
  { value: "SaveAsNew", label: "Save As New" }
];

const saveDescriptions = {
  UseLoaded: "Save directly into the currently loaded graph.",
  OverwriteExisting: "Overwrite another existing dialogue graph with the current content.",
  SaveAsNew: "Create a new dialogue graph asset with the specified name."
};

function saveGraph(ctx, host) {
  const s = ctx.state.dgsDialogs;
  if (s.saveResult === undefined) s.saveResult = null;
  const mode = s.saveMode;
  const target = mode === "UseLoaded" ? "MarketLever" : mode === "OverwriteExisting" ? s.saveOverwrite : s.saveName;
  const canSave = mode === "UseLoaded" || Boolean(target && target.trim());

  const body = dialogBody(
    h("div", { class: "dgs-dialog-header" },
      h("div", { class: "dgs-dialog-header__title", text: "Save Dialogue Graph" }),
      h("div", { class: "dgs-dialog-header__subtitle", text: "Choose how to save the current graph." })
    ),
    enumRow("Mode", mode, saveModes, (value) => { s.saveMode = value; ctx.rerender(); }),
    h("div", { class: "dgs-dialog-italic", text: saveDescriptions[mode] }),
    h("div", { class: "dgs-dialog-loaded" }, h("span", { text: "Loaded:" }), h("strong", { text: "MarketLever" })),
    field("Overwrite", enumRow("", s.saveOverwrite, ["MarketLever", "MarketLever_Backup", "GateConfrontation"], (value) => { s.saveOverwrite = value; }, { disabled: mode !== "OverwriteExisting" })),
    field("Save As", textInput(s.saveName, (value) => { s.saveName = value; }, { disabled: mode !== "SaveAsNew" })),
    h("div", { class: "dgs-dialog-target", text: `→ ${target || "(no target)"}.asset` })
  );

  const save = () => {
    if (!canSave) {
      explain(host, "Save", "Choose a target before saving. Demo only.");
      return;
    }
    s.saveResult = target;
    explain(host, "Save", `Save would write ${target}.asset in the desktop app. Demo only.`);
  };

  return stage(
    frame("Save Dialogue Graph", body, {
      className: "dgs-dialog--save",
      footer: dialogFooter(
        button("Cancel", { onClick: () => explain(host, "Cancel", "Cancel would close this dialog without saving. Demo only.") }),
        button("Save", { primary: true, disabled: !canSave, onClick: save })
      )
    })
  );
}

function importPreview(ctx, host) {
  const s = ctx.state.dgsDialogs;
  if (s.importApplied === undefined) s.importApplied = null;
  const versioned = s.importVersioned;
  const counts = versioned
    ? "Schema: 4 · 12 rows read · 8 accepted · 2 conflicts · 2 rejected"
    : "Legacy CSV · 9 matched lines · 3 unknown/malformed rows";
  const rows = versioned
    ? [
        "Accepted row 2 · gate_north_01 · fr · Dialogue → Complete\nSource revision: 18\nCompleted revision: 18 · 2026-10-18T09:42:00Z\nOwner: arjan · Due: 2026-10-24 · Reference: LOC-218\nIntent: Warn the player\nEmotion: Wary\nScene: Market gate\nRecording: Reviewed\nLocalization: Final\nCinematic: None",
        "Accepted row 3 · gate_north_02 · fr · Dialogue → InProgress\nSource revision: 18\nCompleted revision: 17 · 2026-10-17T16:10:00Z\nOwner: arjan · Due: 2026-10-25 · Reference: LOC-219\nIntent: Refuse entry\nEmotion: Firm\nScene: Market gate\nRecording: Pending\nLocalization: Draft\nCinematic: None",
        "Accepted row 5 · gate_north_04 · fr · Voice → Complete\nSource revision: 18\nCompleted revision: 18 · 2026-10-18T10:05:00Z\nOwner: sam · Due: 2026-10-26 · Reference: LOC-221\nIntent: Offer a bargain\nEmotion: Guarded\nScene: Market gate\nRecording: Final\nLocalization: Final\nCinematic: None",
        "Conflict · Row 8 locale 'de' does not match the target table 'fr'.",
        "Conflict · Row 9 source revision is newer than the reviewed source revision.",
        "Rejected · Row 11 has an unknown status 'Doneish'.",
        "Rejected · Row 12 is missing its line identifier."
      ]
    : [
        "Matched line 2 · gate_north_01 · Completed",
        "Matched line 3 · gate_north_02 · In Progress",
        "Matched line 4 · gate_north_03 · Blocked",
        "Matched line 5 · gate_north_04 · Completed",
        "Unknown/malformed row 7 · gate_north_06 · ???",
        "Unknown/malformed row 9 · too few columns",
        "V1 import will apply status columns to 9 matched lines."
      ];

  const body = h(
    "div",
    { class: "dgs-import-preview" },
    h(
      "div",
      { class: "dgs-import-preview__header" },
      h("div", { class: "dgs-import-preview__title", text: "Review production CSV" }),
      h("div", { class: "dgs-import-preview__counts", text: counts }),
      versioned
        ? null
        : h("div", {
            class: "dgs-import-preview__warning",
            text: "Legacy CSV carries no completion evidence. Complete/Review statuses remain unverified until re-confirmed."
          })
    ),
    h("div", { class: "dgs-import-preview__list" }, ...rows.map((row) => h("div", { class: "dgs-import-preview__row", text: row })))
  );

  const apply = () => {
    s.importApplied = versioned ? "Schema 4 accepted rows" : "Legacy matched lines";
    explain(
      host,
      "Apply",
      versioned
        ? "Apply would import 8 accepted rows into the production tracker. Demo only."
        : "Apply would update 9 matched lines in the production tracker. Demo only."
    );
  };

  return stage(
    frame("Production CSV Preview", body, {
      className: "dgs-dialog--import",
      footer: dialogFooter(
        button("Cancel", { onClick: () => explain(host, "Cancel", "Cancel would close this preview without importing. Demo only.") }),
        button(versioned ? "Apply accepted" : "Apply matched lines", { primary: true, onClick: apply })
      )
    }),
    dialogBar(
      "CSV format",
      [
        { id: "versioned", label: "Schema 4" },
        { id: "legacy", label: "Legacy CSV" }
      ],
      versioned ? "versioned" : "legacy",
      (id) => {
        s.importVersioned = id === "versioned";
        ctx.rerender();
      }
    )
  );
}

function addLanguage(ctx, host) {
  const s = ctx.state.dgsDialogs;
  if (s.addLanguageResult === undefined) s.addLanguageResult = null;
  const selected = s.addLanguageSelected.filter((label) => languageChoices.some((language) => language.label === label));
  const hasCustom = Boolean((s.addLanguageCustom || "").trim());
  const valid = selected.length > 0 || hasCustom;

  const languageRows = languageChoices.map((language) => ({
    label: language.label.toLowerCase(),
    node: h(
      "div",
      { class: "dgs-language-row" },
      checkbox(
        language.label,
        s.addLanguageSelected.includes(language.label),
        (checked) => {
          s.addLanguageSelected = checked
            ? [...new Set([...s.addLanguageSelected, language.label])]
            : s.addLanguageSelected.filter((label) => label !== language.label);
          ctx.rerender();
        }
      ),
      h("span", { class: "dgs-language-row__code", text: language.code })
    )
  }));
  const empty = h("div", { class: "dgs-dialog-empty", text: "No matching languages." });
  const list = h("div", { class: "dgs-language-list" }, ...languageRows.map((row) => row.node), empty);

  const applyFilter = () => {
    const query = (s.addLanguageSearch || "").trim().toLowerCase();
    let shown = 0;
    for (const row of languageRows) {
      const match = row.label.includes(query);
      row.node.style.display = match ? "flex" : "none";
      if (match) shown++;
    }
    empty.style.display = shown ? "none" : "block";
  };

  const body = h(
    "div",
    { class: "dgs-language" },
    h("div", { class: "dgs-dialog-header__title", text: "Add Target Languages" }),
    h("div", {
      class: "dgs-dialog-header__subtitle",
      text: "Select one or more languages to add as translation columns. Source language remains the master."
    }),
    field("Search", textInput(s.addLanguageSearch, (value) => {
      s.addLanguageSearch = value;
      applyFilter();
    })),
    h(
      "div",
      { class: "dgs-dialog-actions" },
      button("Popular", {
        onClick: () => {
          s.addLanguageSelected = [...new Set([...s.addLanguageSelected, "French", "German", "Japanese", "Spanish"])];
          ctx.rerender();
        }
      }),
      button("All", { onClick: () => { s.addLanguageSelected = languageChoices.map((language) => language.label); ctx.rerender(); } }),
      button("None", { onClick: () => { s.addLanguageSelected = []; ctx.rerender(); } })
    ),
    h("div", {
      class: "dgs-language__summary",
      text: selected.length === 0 ? "No built-in languages selected." : `${selected.length} language${selected.length === 1 ? "" : "s"} selected.`
    }),
    list,
    field("Custom Locale Code", h("input", {
      class: "bf-input",
      type: "text",
      value: s.addLanguageCustom,
      oninput: (event) => {
        s.addLanguageCustom = event.target.value;
        const container = typeof event.target.closest === "function" ? event.target.closest(".dgs-language") : null;
        if (!container || typeof container.querySelector !== "function") return;
        const ok = selected.length > 0 || event.target.value.trim() !== "";
        const error = container.querySelector(".dgs-dialog-error");
        if (error) error.textContent = ok ? "" : "Select at least one language or enter a custom locale code.";
        const addButton = Array.from(container.querySelectorAll("button")).find((node) => node.textContent.trim() === "Add Selected Languages");
        if (addButton) addButton.disabled = !ok;
      }
    }), {
      tooltip: "Optional BCP 47 locale code, e.g. sr-RS or fil-PH"
    }),
    h("div", {
      class: "dgs-dialog-error",
      text: valid ? "" : "Select at least one language or enter a custom locale code."
    }),
    h(
      "div",
      { class: "dgs-dialog-inline-footer" },
      button("Cancel", { onClick: () => explain(host, "Cancel", "Cancel would close this dialog without adding languages. Demo only.") }),
      button("Add Selected Languages", {
        primary: true,
        disabled: !valid,
        onClick: () => {
          if (!valid) {
            explain(host, "Add Selected Languages", "Select at least one language or enter a custom locale code. Demo only.");
            return;
          }
          const custom = (s.addLanguageCustom || "").trim();
          const labels = [...selected, ...(custom ? [custom] : [])];
          s.addLanguageResult = labels;
          explain(
            host,
            "Add Selected Languages",
            `Add would create ${labels.length} translation column${labels.length === 1 ? "" : "s"}: ${labels.join(", ")}. Demo only.`
          );
        }
      })
    )
  );

  applyFilter();
  return stage(frame("Add Languages", body, { className: "dgs-dialog--languages" }));
}

function translationChoice(ctx, host) {
  const s = ctx.state.dgsDialogs;
  if (s.translationChoice === undefined) s.translationChoice = null;
  const available = s.translationAvailable;
  const choices = [
    {
      id: "SelectedLanguageMissing",
      title: "Translate Selected Language",
      description: "Generate only the currently missing entries for the selected target language."
    },
    {
      id: "AllLanguagesMissingSequential",
      title: "Translate All Missing",
      description: "Processes each target language in order. You review and apply one language before generation continues to the next."
    },
    {
      id: "SelectedLanguageRetranslateAll",
      title: "Retranslate Selected Language",
      description: "Regenerate every row for the selected target language."
    }
  ];
  const cards = [];
  const paintChoices = () => {
    for (const card of cards) {
      const selected = s.translationChoice === card.id;
      card.node.setAttribute("aria-pressed", selected ? "true" : "false");
      card.node.style.borderColor = selected ? "var(--bf-primary, #5865f2)" : "";
      card.node.style.boxShadow = selected ? "0 0 0 2px var(--bf-primary, #5865f2)" : "";
      card.node.style.background = selected ? "rgba(88, 101, 242, 0.16)" : "";
    }
  };

  const body = h(
    "div",
    { class: "dgs-translation" },
    h("div", { class: "dgs-dialog-header__title", text: "AI Localization" }),
    h("div", {
      class: "dgs-dialog-header__subtitle",
      text: "Generate high-quality translations for your dialogue graph using AI."
    }),
    available
      ? null
      : h(
          "div",
          { class: "dgs-translation__banner" },
          h("div", {
            class: "dgs-translation__banner-copy",
            text: "AI Extension 2.1 — Included Module. Core manual localization remains fully available."
          }),
          h(
            "div",
            { class: "dgs-dialog-actions" },
            button("Learn More", {
              primary: true,
              onClick: () => explain(host, "Learn More", "Would open https://bekaforge.com/dgs-docs/ai-extension.html in a browser. Demo only.")
            }),
            button("View Bundled Copy", {
              onClick: () => explain(host, "View Bundled Copy", "Would open the bundled copy of https://bekaforge.com/dgs-docs/ai-extension.html in a browser. Demo only.")
            })
          )
        ),
    h(
      "div",
      { class: `dgs-translation__choices${available ? "" : " is-locked"}` },
      ...choices.map((choice) => {
        const card = h(
          "button",
          {
            class: "dgs-translation__card",
            type: "button",
            disabled: !available,
            "aria-pressed": s.translationChoice === choice.id ? "true" : "false",
            onclick: () => {
              s.translationChoice = choice.id;
              paintChoices();
            }
          },
          h("span", { class: "dgs-translation__card-title", text: choice.title }),
          h("span", { class: "dgs-translation__card-copy", text: choice.description })
        );
        cards.push({ id: choice.id, node: card });
        return card;
      })
    ),
    h(
      "div",
      { class: "dgs-dialog-inline-footer" },
      button("Cancel", { onClick: () => explain(host, "Cancel", "Cancel would close this dialog without starting translation. Demo only.") })
    )
  );

  paintChoices();

  return stage(
    frame("AI Translation", body, { className: "dgs-dialog--translation" }),
    dialogBar(
      "AI extension",
      [
        { id: "available", label: "Available" },
        { id: "missing", label: "Missing" }
      ],
      available ? "available" : "missing",
      (id) => {
        s.translationAvailable = id === "available";
        ctx.rerender();
      }
    )
  );
}

function localizationIO(ctx, host) {
  const s = ctx.state.dgsDialogs;
  if (s.ioSourceGraph === undefined) s.ioSourceGraph = "MarketLever";
  if (s.ioExportFolder === undefined) s.ioExportFolder = "Assets/DialogGraphSystem/Localization/Exports";
  if (s.ioImportFile === undefined) s.ioImportFile = "Assets/DialogGraphSystem/Localization/Imports/MarketLever_fr_loc.json";
  if (s.ioLocaleOverride === undefined) s.ioLocaleOverride = false;
  if (s.ioSourceOverride === undefined) s.ioSourceOverride = false;
  if (s.ioExportResult === undefined) s.ioExportResult = null;
  if (s.ioImportResult === undefined) s.ioImportResult = null;
  const exportTab = s.ioExportTab === "export";
  const exportStatus = h("div", { class: "dgs-dialog-status", text: s.ioExportResult || "" });
  const importStatus = h("div", {
    class: "dgs-dialog-status",
    text: s.ioImportResult || (s.ioImportAnalyzed ? "Analyzed: 12 rows · 9 accepted · 3 refused" : "")
  });
  const exportJson = () => {
    const folder = (s.ioExportFolder || "").trim();
    s.ioExportResult = folder
      ? `Would write ${s.ioSourceGraph}_fr.json to ${folder}. Demo only.`
      : "Choose an output folder before exporting. Demo only.";
    exportStatus.textContent = s.ioExportResult;
    explain(host, "Export to JSON", "Export writes a JSON file in the desktop app. Demo only.");
  };
  const importReviewed = () => {
    if (!s.ioImportAnalyzed) {
      explain(host, "Import Reviewed Rows", "Analyze the file before importing. Demo only.");
      return;
    }
    s.ioImportResult = "Would write 9 reviewed rows into French (fr). Demo only.";
    importStatus.textContent = s.ioImportResult;
    explain(host, "Import Reviewed Rows", "Import writes reviewed rows into the localization table in the desktop app. Demo only.");
  };
  const panel = exportTab
    ? card(
        "Configuration",
        field("Source Graph", enumRow("", s.ioSourceGraph, ["MarketLever", "GateConfrontation", "MarketAmbient"], (value) => { s.ioSourceGraph = value; })),
        field("Target Locale Table", h("div", { class: "dgs-dialog-object", text: "French (DialogLocalizationTable)" })),
        h("div", { class: "dgs-dialog-check-row" }, checkbox("Export as Empty Template (source strings only)", s.ioExportTemplate, (checked) => { s.ioExportTemplate = checked; })),
        field("Output Folder", h("div", { class: "dgs-dialog-path" }, textInput(s.ioExportFolder, (value) => { s.ioExportFolder = value; }), button("Browse", { small: true, onClick: () => explain(host, "Browse", "Browse would open a folder picker in the desktop app. Demo only.") }))),
        h("div", { class: "dgs-dialog-buttons-end" }, button("Export to JSON", { primary: true, onClick: exportJson })),
        exportStatus
      )
    : card(
        "Configuration",
        field("JSON File", h("div", { class: "dgs-dialog-path" }, textInput(s.ioImportFile, (value) => { s.ioImportFile = value; }), button("Browse", { small: true, onClick: () => explain(host, "Browse", "Browse would open a file picker in the desktop app. Demo only.") }))),
        field("Target Locale Table", h("div", { class: "dgs-dialog-object", text: "French (DialogLocalizationTable)" })),
        h("div", { class: "dgs-dialog-italic", text: "Target locale: fr. Rows from any other locale in this file are refused." }),
        h("div", { class: "dgs-dialog-check-row" }, checkbox("Explicit conversion: accept a different locale (reviewed override)", s.ioLocaleOverride, (checked) => { s.ioLocaleOverride = checked; })),
        h("div", { class: "dgs-dialog-check-row" }, checkbox("Explicit approval: apply rows whose source text has changed (reviewed override)", s.ioSourceOverride, (checked) => { s.ioSourceOverride = checked; })),
        h(
          "div",
          { class: "dgs-dialog-actions" },
          button("Analyze File", {
            onClick: () => {
              s.ioImportAnalyzed = true;
              s.ioImportResult = null;
              ctx.rerender();
            }
          })
        ),
        h("div", { class: "dgs-dialog-buttons-end" }, button("Import Reviewed Rows", { primary: true, disabled: !s.ioImportAnalyzed, onClick: importReviewed })),
        importStatus,
        s.ioImportAnalyzed
          ? card(
              "Reviewed Plan",
              h("div", { class: "dgs-dialog-plan-copy", text: "12 row(s) checked; 9 will be written; 2 already match; 1 skipped; 3 conflicts." }),
              h("div", { class: "dgs-dialog-plan-copy", text: "Target locale table: fr (file declares 'fr')." }),
              h("div", {
                class: "dgs-dialog-plan-copy",
                text: "Graph scope verified: every row resolves to an authored key in the project source table."
              }),
              h("div", { class: "dgs-dialog-plan-heading", text: "Rows to write" }),
              h("div", { class: "dgs-dialog-plan-row", text: "[Update] gate_north_01 - source current" }),
              h("div", { class: "dgs-dialog-plan-row", text: "[Update] gate_north_02 - source current" }),
              h("div", { class: "dgs-dialog-plan-row", text: "[Add] gate_north_07 - source current" }),
              h("div", { class: "dgs-dialog-plan-heading", text: "Refused or skipped rows" }),
              h("div", { class: "dgs-dialog-plan-row is-error", text: "[withheld] Row 8 locale 'de' does not match target 'fr'." }),
              h("div", { class: "dgs-dialog-plan-row is-error", text: "[reported] Row 11 already matches the target table." })
            )
          : null
      );

  const body = h(
    "div",
    { class: "dgs-io" },
    h("div", { class: "dgs-dialog-page-title", text: "Localization Export / Import" }),
    h("div", {
      class: "dgs-dialog-page-subtitle",
      text: "Export dialogue strings to JSON for translation, or import translated JSON files back into localization tables."
    }),
    h(
      "div",
      { class: "dgs-io__tabs" },
      h("button", {
        class: `dgs-io__tab${exportTab ? " is-active" : ""}`,
        type: "button",
        text: "Export Strings",
        onclick: () => { s.ioExportTab = "export"; ctx.rerender(); }
      }),
      h("button", {
        class: `dgs-io__tab${exportTab ? "" : " is-active"}`,
        type: "button",
        text: "Import Translations",
        onclick: () => { s.ioExportTab = "import"; ctx.rerender(); }
      })
    ),
    panel
  );

  return stage(frame("Localization Export / Import", body, { className: "dgs-dialog--io" }));
}

function modelPicker(ctx, host) {
  const s = ctx.state.dgsDialogs;
  if (s.modelApplied === undefined) s.modelApplied = null;
  const current = s.selectedModel || "gpt-5.1-codex";
  const count = h("div", { class: "dgs-model-picker__count" });
  const apply = button("Select model", {
    primary: true,
    onClick: () => {
      if (apply.disabled) {
        explain(host, "Select model", "No model matches the current search. Demo only.");
        return;
      }
      const model = s.selectedModel || "gpt-5.1-codex";
      s.modelApplied = model;
      explain(host, "Select model", `Select model would use ${model} for AI generation. Demo only.`);
    }
  });
  const empty = h("div", { class: "dgs-model-picker__empty", text: "No matching models. Try another search." });
  const items = modelChoices.map((model) => ({
    model,
    node: h(
      "button",
      {
        class: `dgs-model-picker__item${model === current ? " is-current" : ""}`,
        type: "button",
        title: model,
        onclick: () => {
          s.selectedModel = model;
          ctx.rerender();
        }
      },
      h("span", { class: "dgs-model-picker__check", text: model === current ? "✓" : "" }),
      h("span", { text: model })
    )
  }));

  const applyFilter = () => {
    const query = (s.modelSearch || "").trim().toLowerCase();
    let shown = 0;
    for (const item of items) {
      const match = item.model.toLowerCase().includes(query);
      item.node.style.display = match ? "flex" : "none";
      if (match) shown++;
    }
    count.textContent = `${shown} of ${modelChoices.length} models`;
    empty.style.display = shown ? "none" : "block";
    apply.disabled = shown === 0;
  };

  const body = h(
    "div",
    { class: "dgs-model-picker" },
    h("div", { class: "dgs-model-picker__title", text: "Choose model" }),
    textInput(s.modelSearch || "", (value) => {
      s.modelSearch = value;
      applyFilter();
    }, { placeholder: "Search models" }),
    count,
    h("div", { class: "dgs-model-picker__list" }, ...items.map((item) => item.node)),
    empty
  );

  applyFilter();
  return stage(
    frame("Choose model", body, {
      className: "dgs-dialog--model",
      footer: dialogFooter(
        button("Cancel", { onClick: () => explain(host, "Cancel", "Cancel would close this dialog without changing the model. Demo only.") }),
        apply
      )
    })
  );
}

const renderers = {
  welcome,
  "public-information": publicInformation,
  "create-asset": createAsset,
  "validation-panel": validationPanel,
  "rewrite-preview": rewritePreview,
  "save-graph": saveGraph,
  "import-preview": importPreview,
  "add-language": addLanguage,
  "translation-choice": translationChoice,
  "localization-io": localizationIO,
  "ai-model-picker": modelPicker
};

export async function render(host, ctx) {
  const surface = renderers[ctx.surface] ? ctx.surface : "welcome";
  host.append(renderers[surface](ctx, host));
}
