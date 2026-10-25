/* UI Themes workbench.
   Strings are copied from UI Themes/Editor sources:
   UIThemeWorkbenchElement.cs, DgsThemeWorkbenchWindow.cs, DgsThemeWorkbenchView.cs,
   UILayoutPresetSO.cs (family descriptions), UILayoutPresetSOEditor.cs,
   OpenAdventureUIIntegration.cs, DgsThemeCatalogElement.cs, UIThemeScenePreviewSession.cs.
   Example theme only; nothing is written to disk and no scene preview is created. */

import {
  h, card, field, helper, badge, textRow, textInput, textArea, toggleRow, enumRow,
  windowFrame, sectionTitle, tabs, toastOn
} from "../controls.js";

export const entries = [
  { id: "workbench", label: "UI Themes · Workbench" },
  { id: "layout", label: "UI Themes · Layout families" },
  { id: "catalog", label: "UI Themes · Catalog" }
];

export const note =
  "Recreated from the DGS UI Themes workbench. The preview uses example content and does not render a real theme, copy any prefab, or write assets.";

const families = [
  { id: "IntegratedCard", label: "Integrated Card", description: "One bottom card holding speaker, text and choices together.", horizontal: true },
  { id: "SplitChoices", label: "Split Choices", description: "Dialogue on the left, its answers in their own panel on the right.", horizontal: false },
  { id: "Cinematic", label: "Cinematic", description: "Compact subtitles near the bottom; the world stays visible.", horizontal: true },
  { id: "SidePanel", label: "Side Panel", description: "A reading column on the right side of the screen.", horizontal: false },
  { id: "Tutorial", label: "Tutorial", description: "A compact upper-side card for instructions and a clear Continue action.", horizontal: false },
  { id: "ClassicBottom", label: "Classic Bottom", description: "A wide dialogue box at the bottom with choices above it.", horizontal: true }
];

const targets = [
  "Dialogue panel",
  "Nameplate and portrait",
  "Choices",
  "Controls",
  "History",
  "Theme details",
  "Settings",
  "Banter"
];

const targetFields = {
  "Dialogue panel": ["Dialogue background", "Dialogue text color", "Dialogue font", "Dialogue size"],
  "Nameplate and portrait": ["Nameplate", "Portrait frame", "Speaker name color", "Speaker name font", "Speaker name size"],
  Choices: ["Choice normal", "Choice highlighted", "Choice pressed", "Choice disabled", "Choice selected", "Choice icon", "Hotkey background", "Choice text color", "Active choice text color", "Choice text font", "Choice hotkey font", "Choice text size"],
  Controls: ["History button background", "History button icon", "Settings button background", "Settings button icon", "Autoplay button background", "Autoplay icon", "Skip background", "Skip icon", "Skip label color", "Skip line background", "Skip line icon"],
  History: ["History panel", "History title", "History character row", "History choice row", "History choice icon", "History close", "History title color", "History speaker color", "History line color", "History choice color", "History line font", "History line size"],
  "Theme details": ["Display name", "Description"],
  Settings: ["Settings panel background", "Settings title", "Settings row", "Settings slider", "Settings dropdown"],
  Banter: ["Banter card background", "Banter speaker color", "Banter line color", "Banter card size"]
};

function previewCanvas(ctx) {
  const t = ctx.state.themes;
  return h(
    "div",
    { class: "theme-preview" },
    h("div", { class: "theme-preview__frame" },
      h("div", { class: `theme-preview__scene theme-preview__scene--${t.layout.toLowerCase()}` },
        t.showSafeAreaGuide ? h("div", { class: "theme-preview__safe-area", text: "Safe area guide" }) : null,
        h("div", { class: "theme-preview__card" },
          t.showPortrait ? h("div", { class: "theme-preview__portrait", text: "portrait" }) : null,
          h("div", { class: "theme-preview__body" },
            h("div", { class: "theme-preview__name", text: "Gate Warden" }),
            h("div", { class: "theme-preview__line", text: t.sampleLine }),
            t.panels.choices
              ? h("div", { class: "theme-preview__choices" },
                  h("div", { class: "theme-preview__choice theme-preview__choice--selected", text: "Ask about the lever" }),
                  h("div", { class: "theme-preview__choice", text: "Leave" }),
                  t.sampleChoices === "3 choices" || t.sampleChoices === "4 choices" || t.sampleChoices === "5 choices" ? h("div", { class: "theme-preview__choice", text: "Ask about the gate" }) : null
                )
              : null,
            t.panels.history ? h("div", { class: "theme-preview__side", text: "History panel (preview only)" }) : null,
            t.panels.settings ? h("div", { class: "theme-preview__side", text: "Settings panel (preview only)" }) : null,
            t.panels.banter ? h("div", { class: "theme-preview__side", text: "Banter cards (preview only)" }) : null
          )
        )
      ),
      h("div", { class: "bf-helper", style: { marginTop: "6px" }, text: "Settings uses the appearance pack's Settings Theme. Choose Settings in Editing to change its artwork and text." })
    )
  );
}

function previewPanels(ctx) {
  const t = ctx.state.themes;
  const chip = (id, label, tooltip) =>
    h("button", {
      class: `bf-chip${t.panels[id] ? " theme-chip--on" : ""}`,
      type: "button",
      title: tooltip,
      text: label,
      onclick: () => { t.panels[id] = !t.panels[id]; ctx.rerender(); }
    });
  return h(
    "div",
    { class: "theme-panelbar" },
    h("span", { class: "bf-muted", text: "Preview panels" }),
    chip("choices", "Choices", "Shows the choice-answer panel in this preview. Editing Choices also reveals it. This does not change the game theme."),
    chip("history", "History", "Shows the dialogue-history panel in this preview. Editing History also reveals it. This does not enable history in the game."),
    chip("settings", "Settings", "Shows the selected appearance's runtime settings panel. Choose Settings in Editing to change it."),
    chip("banter", "Banter", "Show or hide the selected appearance's Banter cards in this preview."),
    h("label", { class: "bf-check-row", style: { marginLeft: "auto" }, title: "Zooms the preview to the part you are editing. Turn it off to see the whole UI." },
      h("input", { class: "bf-check", type: "checkbox", checked: t.zoomToEdited, onchange: (event) => { t.zoomToEdited = event.target.checked; ctx.rerender(); } }),
      h("span", { text: "Zoom to edited part" })
    ),
    h("button", { class: "bf-button", type: "button", text: "Show full UI", title: "Resets the preview camera to show the full UI instead of focusing on the edited part.", onclick: () => { t.zoomToEdited = false; ctx.rerender(); } }),
    enumRow("Aspect ratio", t.aspect, ["16:9", "21:9", "9:16"].map((value) => ({ value, label: value })), (value) => { t.aspect = value; ctx.rerender(); }, { tooltip: "Preview aspect ratio. This does not change the authored layout." })
  );
}

function stateChips(t) {
  const active = t.choiceState ?? "Normal";
  const chips = [];
  for (const [label, tooltip] of [
    ["Normal", "Edit the normal fields."],
    ["Highlighted", "Edit the highlighted fields."],
    ["Pressed", "Edit the pressed fields."],
    ["Disabled", "Edit the disabled fields."],
    ["Selected", "Edit the selected fields."]
  ]) {
    const chip = h("button", {
      class: `bf-chip${label === active ? " theme-chip--on" : ""}`,
      type: "button",
      title: tooltip,
      text: label,
      "aria-pressed": label === active ? "true" : "false",
      onclick: () => {
        t.choiceState = label;
        for (const other of chips) {
          const on = other === chip;
          other.className = `bf-chip${on ? " theme-chip--on" : ""}`;
          other.setAttribute("aria-pressed", on ? "true" : "false");
        }
      }
    });
    chips.push(chip);
  }
  return chips;
}

function sampleBar(ctx) {
  const t = ctx.state.themes;
  const open = !!t.sampleOpen;
  let sampleLineInput;
  if (open) {
    sampleLineInput = textInput(t.sampleLine, (value) => {
      t.sampleLine = value;
      const windowEl = sampleLineInput.closest(".up-window");
      const line = windowEl?.querySelector(".theme-preview__line");
      if (line) line.textContent = value;
    });
  }
  return h(
    "div",
    { class: "theme-samplebar" },
    h("button", {
      class: "bf-button",
      type: "button",
      text: open ? "Sample content ▾" : "Sample content ▸",
      title: "Shows transient preview text, portrait and safe-area guide. Nothing here is saved to the theme.",
      onclick: () => { t.sampleOpen = !open; ctx.rerender(); }
    }),
    open
      ? h(
          "div",
          { class: "theme-samplebar__body" },
          field("Sample line", sampleLineInput, { tooltip: "Transient preview text. It is never written to the theme asset." }),
          toggleRow("Show portrait", t.showPortrait, (value) => { t.showPortrait = value; ctx.rerender(); }, { tooltip: "Shows or hides the portrait in the preview only." }),
          toggleRow("Show safe-area guide", t.showSafeAreaGuide, (value) => { t.showSafeAreaGuide = value; ctx.rerender(); }, { tooltip: "Draws a labelled safe-area guide. It does not simulate runtime safe area." }),
          h("div", { class: "bf-row" },
            h("button", { class: "bf-button", type: "button", text: "Long text", title: "Replaces the sample line with long-form text.", onclick: () => { t.sampleLine = "The key turns. The gate swings open. The sanctum passage is clear, and the north road beyond it is quiet. Take your time; the market will still be here when you return."; ctx.rerender(); } }),
            h("button", { class: "bf-button", type: "button", text: "Reset sample", title: "Restores the default sample line and portrait.", onclick: () => { t.sampleLine = "The sanctum passage is clear. Take the north gate."; t.showPortrait = true; ctx.rerender(); } }),
            enumRow("Choice rows", t.sampleChoices, ["No choices", "2 choices", "3 choices", "4 choices", "5 choices"].map((value) => ({ value, label: value })), (value) => { t.sampleChoices = value; t.panels.choices = value !== "No choices"; ctx.rerender(); }, { tooltip: "How many sample choice rows the preview shows. Choices are only preview content." })
          )
        )
      : null
  );
}

function editingPane(ctx) {
  const t = ctx.state.themes;
  const fields = targetFields[t.target] || [];
  return h(
    "div",
    { class: "theme-editing" },
    h("div", { class: "bf-section-title", text: "Editing" }),
    enumRow("Target", t.target, targets.map((value) => ({ value, label: value })), (value) => { t.target = value; ctx.rerender(); }, { tooltip: "Choose the UI part to edit. Its panel is revealed in the preview; use Preview panels to adjust visibility." }),
    h("div", { class: "bf-helper", text: "Editing reveals this part in the preview. Preview panels controls what is visible." }),
    tabs(["Style", "Layout", "Text"].map((label) => ({ id: label, label })), t.tab, (id) => { t.tab = id; ctx.rerender(); }),
    h("div", { class: "bf-helper", text: t.target === "Theme details"
      ? "Theme details fields: Display name, Description, stable ID."
      : `You are editing the ${t.tab.toLowerCase()} fields of this part.` }),
    t.target === "Theme details"
      ? h(
          "div",
          null,
          textRow("Display name", t.appearance, (value) => { t.appearance = value; }),
          field("Description", h("textarea", {
            class: "bf-textarea",
            rows: 4,
            style: { height: "64px" },
            onchange: (event) => { t.description = event.target.value; }
          }, t.description ?? "Example appearance pack for the market demo.")),

          field("Stable ID", h("div", { class: "bf-row" }, h("code", { class: "bf-chip", text: "8ed1c9b7-4b02-4c22-a3d1-2f9c75d8a410" }), h("button", { class: "bf-button", type: "button", text: "Assign stable ID", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "UI Themes", "Assign stable ID would generate and store a stable identity. Demo only.") }))),
          helper("Stable identity. Copy it from here when a binding refers to this theme."),
          helper("Layout preset is authored in the Layout section of any visual target.")
        )
      : h(
          "div",
          { class: "theme-field-grid" },
          ...fields.map((label, index) =>
            h("div", { class: "theme-swatch-field" },
              h("span", { class: "bf-swatch", style: { background: ["#1a1d28", "#f2ede4", "#5865f2", "#fb923c", "#34d399", "#f87171"][index % 6] } }),
              h("span", { text: label }),
              h("span", { class: "bf-muted", text: index % 3 === 0 ? "asset reference" : index % 3 === 1 ? "color" : "size" })
            )
          )
        ),
    t.target === "Choices"
      ? h("div", null,
          h("div", { class: "theme-statechips" }, ...stateChips(t)),
          helper("This target edits one state at a time. Switch state above to restyle the others.")
        )
      : null
  );
}

function workbench(ctx) {
  const t = ctx.state.themes;
  const surfaceLabel = {
    "getting-started": "",
  }[ctx.surface] || ctx.surface;

  return windowFrame({
    title: "UI Theme Workbench",
    hint: "Tools/Beka Forge/Dialogue Graph System/Settings",
    className: "pf-window",
    body: h(
      "div",
      { class: "up-scroll", style: { padding: "14px", maxHeight: "760px" } },
      h(
        "div",
        { class: "bf-row", style: { marginBottom: "8px", flexWrap: "wrap" } },
        h("span", { class: "bf-field__label", text: `${t.appearance} (example)` }),
        h("button", { class: "bf-button bf-button--primary", type: "button", text: "Save", title: "Writes this theme and its layout preset to disk. The preview never needs this.", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "UI Themes", "Demo only: no theme was saved. In Unity this writes the theme and its layout preset to disk.") }),
        h("button", { class: "bf-button", type: "button", text: t.scenePreview ? "Stop scene preview" : "Preview in scene", title: "Shows a temporary copy of the same layout prefab in the open scene. Nothing is saved.", onclick: () => { t.scenePreview = !t.scenePreview; ctx.rerender(); } }),
        h("span", { class: "bf-muted", text: t.scenePreview ? "The scene preview is on (example)." : "The scene preview is off." })
      ),
      h("div", { class: "theme-workbench" },
        h("div", { class: "theme-workbench__preview" },
          sectionTitle("Live preview"),
          previewPanels(ctx),
          previewCanvas(ctx),
          sampleBar(ctx)
        ),
        editingPane(ctx)
      ),
      h(
        "div",
        { class: "bf-status-bar", style: { marginTop: "10px", borderRadius: "4px", border: "1px solid var(--bf-divider)" } },
        h("span", { text: t.previewStatus }),
        h("span", { class: "bf-status-bar__spacer" }),
        h("span", { text: t.unsaved ? "Unsaved theme edits" : "No unsaved edits" }),
        h("span", { text: `Issues: ${t.issues}` }),
        h("span", { text: `${t.layout} · ${t.choiceOrientation.toLowerCase()} choices · ${t.aspect}` })
      ),
      surfaceLabel ? h("div", { class: "bf-muted", text: surfaceLabel }) : null
    ),
    footer: h("div", { class: "bf-status-bar" }, h("span", { text: "Example appearance pack · no assets read or written" }))
  });
}

function layoutFamilies(ctx) {
  const t = ctx.state.themes;
  return windowFrame({
    title: "UI Themes · Layout families",
    className: "pf-window up-window--compact",
    body: h(
      "div",
      { class: "up-scroll", style: { padding: "14px", maxHeight: "680px" } },
      sectionTitle("Layout preset"),
      helper("A layout preset chooses the runtime arrangement family. Horizontal stacking is only supported by some families."),
      ...families.map((family) =>
        h(
          "button",
          {
            class: `theme-family${t.layout === family.id ? " theme-family--selected" : ""}`,
            type: "button",
            onclick: () => { t.layout = family.id; if (!family.horizontal) t.choiceOrientation = "Vertical"; ctx.rerender(); }
          },
          h("strong", { text: family.label }),
          h("span", { class: "bf-muted", text: family.description }),
          h("span", { class: "bf-helper", text: family.horizontal ? "This family supports vertical and horizontally stacked choices." : "This family only supports vertically stacked choices." })
        )
      ),
      h("div", { class: "bf-divider" }),
      enumRow("Choice orientation", t.choiceOrientation, ["Vertical", "Horizontal"].map((value) => ({ value, label: value })), (value) => { t.choiceOrientation = value; ctx.rerender(); }),
      h("div", { class: "bf-warning", text: t.choiceOrientation === "Horizontal" && !families.find((family) => family.id === t.layout)?.horizontal
        ? "The selected family only supports vertically stacked choices. Choose a supporting family or switch back to Vertical."
        : "Orientation choice is valid for the selected family." })
    ),
    footer: h("div", { class: "bf-status-bar" }, h("span", { text: "Descriptions copied verbatim from UILayoutPresetSO.cs" }))
  });
}

function catalog(ctx) {
  const t = ctx.state.themes;
  if (!t.catalogExists) {
    return windowFrame({
      title: "UI Themes · Catalog",
      className: "pf-window up-window--compact",
      body: h(
        "div",
        { style: { padding: "18px" } },
        h("div", { class: "bf-section-title", text: "No DGS UI theme catalog exists yet." }),
        helper("Create the catalog before authoring appearance packs and theme assets."),
        h("button", { class: "bf-button bf-button--primary", type: "button", text: "Create theme catalog", onclick: () => { t.catalogExists = true; ctx.rerender(); } })
      ),
      footer: h("div", { class: "bf-status-bar" }, h("span", { text: "Catalog missing state" }))
    });
  }

  return windowFrame({
    title: "UI Themes · Catalog",
    className: "pf-window up-window--compact",
    body: h(
      "div",
      { class: "up-scroll", style: { padding: "14px", maxHeight: "680px" } },
      h("div", { class: "pf-helpbox pf-helpbox--info", text: "Each appearance pack must define the 108 unique runtime logical IDs." }),
      h("div", { class: "pf-helpbox pf-helpbox--info", text: "Appearance pack sprite maps do not cover the same logical IDs." }),
      card("Appearance packs",
        h("div", { class: "bf-row", style: { flexWrap: "wrap" } }, badge("Minimal Clean"), badge("Open Adventure"), badge("High Contrast")),
        helper("The catalog lists every appearance pack once per logical ID set. Missing or duplicate IDs are reported before export.")
      ),
      card("Theme assets",
        field("Theme produced a definition", badge("yes")),
        helper("If a theme produced no definition to preview, the workbench shows \"The theme produced no definition to preview.\" instead of an empty preview.")
      ),
      h("button", { class: "bf-button", type: "button", text: "Remove catalog (demo)", onclick: () => { t.catalogExists = false; ctx.rerender(); } })
    ),
    footer: h("div", { class: "bf-status-bar" }, h("span", { text: "Catalog present · example entries" }))
  });
}

const views = {
  workbench,
  layout: layoutFamilies,
  catalog
};

export async function render(host, ctx) {
  if (ctx.surface && views[ctx.surface]) ctx.state.themes.view = ctx.surface;
  const active = views[ctx.state.themes.view] ? ctx.state.themes.view : "workbench";
  host.append(views[active](ctx));
}
