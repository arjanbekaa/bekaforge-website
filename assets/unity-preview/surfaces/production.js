/* Production tab: Localization, Import / Export, Tracker.
   Toolbar labels follow Tabs/DialogProductionTabController.cs. Example rows only. */

import { h, card, field, helper, badge, tabs, textRow, multilineRow, textArea, toggleRow, enumRow, objectRow, sectionTitle, toastOn } from "../controls.js";

const productionTabs = [
  { id: "localization", label: "Localization" },
  { id: "import-export", label: "Import / Export" },
  { id: "tracker", label: "Tracker" }
];

const trackerColumns = [
  ["writing", "Writing"],
  ["vo", "VO"],
  ["localization", "Localization"],
  ["lipSync", "Lip Sync"],
  ["facial", "Facial"],
  ["body", "Body"],
  ["integration", "Integration"],
  ["qa", "QA"]
];

function statusTone(value) {
  if (value === "Complete") return "bf-status--complete";
  if (value === "InProgress" || value === "Review") return "bf-status--progress";
  if (value === "Blocked") return "bf-status--blocked";
  if (value === "NotRequired") return "bf-status--muted";
  return "";
}

function toolbar(ctx) {
  const message = (text) => (event) => toastOn(event.currentTarget.closest(".up-window"), "Production", text);
  return h(
    "div",
    { class: "dgs-toolbar" },
    h("button", { class: "bf-button", type: "button", text: "Production", onclick: message("Production toolbar actions are demo only in this preview.") }),
    h("button", { class: "bf-button", type: "button", text: "Sync from Graphs", onclick: message("Sync from Graphs would rebuild the tracker lines from graph dialogue nodes. Demo only.") }),
    h("button", { class: "bf-button", type: "button", text: "Sync Sources", onclick: message("Sync Sources would refresh localization sources from registered graphs. Demo only.") }),
    h("button", { class: "bf-button", type: "button", text: "Export CSV", onclick: message("Export CSV would write a CSV next to the selected location. Demo only.") }),
    h("button", { class: "bf-button", type: "button", text: "Import CSV", onclick: message("Import CSV would merge an existing CSV into the tracker. Demo only.") }),
    h("button", { class: "bf-button", type: "button", text: "Details", onclick: message("Details shows the last sync summary in Unity. Demo only.") })
  );
}

function localizationView(ctx) {
  const { state } = ctx;
  const openDialog = (surface) => () => {
    const url = new URL(window.location.href);
    url.searchParams.set("window", "dgs-dialogs");
    url.searchParams.set("surface", surface);
    window.location.assign(url);
  };

  const languageRow = h(
    "div",
    { class: "dgs-lang-row" },
    ...state.localization.languages.map((language) =>
      h("div", { class: "dgs-lang-chip" }, h("strong", { text: language.name }), h("span", { class: "bf-muted", text: language.status }))
    ),
    h("button", { class: "bf-button", type: "button", text: "Add Language", title: "Open Add Target Languages.", onclick: openDialog("add-language") }),
    h("button", { class: "bf-button", type: "button", text: "Add Languages", title: "Open Add Target Languages.", onclick: openDialog("add-language") }),
    h("button", { class: "bf-button", type: "button", text: "Add Popular", title: "Open Add Target Languages with popular picks.", onclick: openDialog("add-language") }),
    h("button", { class: "bf-button bf-button--primary", type: "button", text: "Setup Localization", onclick: () => toastOn(document.querySelector(".up-window") || document.body, "Localization", "Setup Localization would run the first-time setup in Unity. Demo only.") }),
    h("div", { class: "bf-row", style: { marginLeft: "auto" } },
      h("span", { class: "bf-muted", text: "Editing: English (en)" }),
      h("button", { class: "bf-button", type: "button", text: "AI Translate", title: "Open the AI translation choice.", onclick: openDialog("translation-choice") }),
      h("button", { class: "bf-button", type: "button", text: "More", title: "Open the localization import/export window.", onclick: openDialog("localization-io") })
    )
  );

  const table = h(
    "table",
    { class: "dgs-table" },
    h("thead", null, h("tr", null, h("th", { text: "Key" }), h("th", { text: "Speaker" }), h("th", { text: "English" }), h("th", { text: "German" }), h("th", { text: "Japanese" }), h("th", { text: "Portuguese (Brazil)" }))),
    h("tbody", null, ...state.localization.rows.map((row) =>
      h("tr", null,
        h("td", { class: "dgs-table__key", text: row.key }),
        h("td", { text: row.speaker }),
        h("td", { text: row.text }),
        h("td", { class: row.de ? "" : "dgs-table__missing", text: row.de || "Missing" }),
        h("td", { class: row.ja ? "" : "dgs-table__missing", text: row.ja || "Missing" }),
        h("td", { class: row.pt ? "" : "dgs-table__missing", text: row.pt || "Missing" })
      )
    ))
  );

  return h(
    "div",
    { class: "dgs-panel" },
    h("div", { class: "dgs-page-header" }, h("div", { class: "dgs-page-header__title", text: "Localization" }), h("div", { class: "dgs-page-header__subtitle", text: "Manage languages and audio localization for graph dialogue." })),
    languageRow,
    helper("Missing translations are shown in warning color. This preview does not read or write localization tables."),
    table
  );
}

function importExportView(ctx) {
  const state = ctx.state;
  const sample = JSON.stringify(
    {
      graph: "MarketLever",
      version: "4.0.0",
      nodes: [
        { id: "dialog-1", kind: "Dialog", speaker: "Gate Warden", text: "The key turns. The gate swings open." },
        { id: "outcome-1", kind: "Outcome", outcomeId: "market_lever_resolved" }
      ]
    },
    null,
    2
  );
  if (state.dgs.exportText === undefined) state.dgs.exportText = sample;
  if (state.dgs.importText === undefined) state.dgs.importText = "";

  return h(
    "div",
    { class: "dgs-panel" },
    h("div", { class: "dgs-page-header" }, h("div", { class: "dgs-page-header__title", text: "Import / Export" }), h("div", { class: "dgs-page-header__subtitle", text: "Round-trip graph content as JSON for review, backup, or merging." })),
    card("Export", helper("Exports the selected graph to JSON text. Copying the text is safe; writing files is not part of this preview."), textArea(state.dgs.exportText, (value) => { state.dgs.exportText = value; }, { height: 160 })),
    card(
      "Import",
      helper("Paste a JSON payload to validate it against the graph schema."),
      textArea(state.dgs.importText, (value) => { state.dgs.importText = value; }, { placeholder: "Paste graph JSON here", height: 120 }),
      h("button", {
        class: "bf-button",
        type: "button",
        text: "Validate",
        onclick: (event) => {
          const host = event.currentTarget.closest(".up-window");
          const raw = state.dgs.importText ?? "";
          if (!raw.trim()) {
            toastOn(host, "Import", "Paste a graph JSON payload before validating.");
            return;
          }
          try {
            JSON.parse(raw);
            toastOn(host, "Import", "JSON is valid. Import would merge the payload into the selected graph in Unity. Demo only.");
          } catch (error) {
            toastOn(host, "Import", `Invalid JSON: ${error.message}`);
          }
        }
      })
    )
  );
}

function trackerView(ctx) {
  const { state } = ctx;
  return h(
    "div",
    { class: "dgs-panel" },
    h("div", { class: "dgs-page-header" }, h("div", { class: "dgs-page-header__title", text: "Tracker" }), h("div", { class: "dgs-page-header__subtitle", text: "Track writing, VO, localization, and integration progress for every dialogue line." })),
    h(
      "table",
      { class: "dgs-table dgs-table--tracker" },
      h("thead", null, h("tr", null, h("th", { text: "Line" }), h("th", { text: "Speaker" }), ...trackerColumns.map(([, label]) => h("th", { text: label })))),
      h("tbody", null, ...state.tracker.map((row) =>
        h("tr", null,
          h("td", { class: "dgs-table__key", text: row.id }),
          h("td", { text: row.speaker }),
          ...trackerColumns.map(([key]) => h("td", null, h("span", { class: `bf-chip ${statusTone(row[key])}`, text: row[key] })))
        )
      ))
    )
  );
}

export function renderProduction(ctx) {
  const { state, rerender } = ctx;
  const active = state.dgs.productionTab;
  const view = active === "import-export" ? importExportView(ctx) : active === "tracker" ? trackerView(ctx) : localizationView(ctx);
  return h(
    "div",
    { class: "dgs-tab-page" },
    tabs(productionTabs.map((entry) => ({ id: entry.id, label: entry.label })), active, (id) => {
      state.dgs.productionTab = id;
      rerender();
    }, { className: "dgs-subtabs" }),
    toolbar(ctx),
    view
  );
}
