/* Dialogue Graph System main window shell.
   Reproduces DialogSystemMainWindow.cs and Tabs/GraphTabController.cs.
   Example data only; the graph canvas is visual, with no execution or persistence. */

import { h, card, field, foldout, tabs, badge, windowFrame, statusBar, helper, sectionTitle, objectRow, enumRow, toggleRow, checkbox, textInput, textArea, messageBox, toastOn } from "../controls.js";
import { renderSettings, settingsCategories } from "./dgs-settings.js";
import { renderGraphEditor, renderNodeGallery } from "./nodes.js";
import { renderDefinitions } from "./definitions.js";
import { renderProduction } from "./production.js";
import { renderHealth } from "./health.js";
import { surfaceForMainTab } from "../surface-route.js";

const mainTabs = [
  { id: "home", label: "Home" },
  { id: "graphs", label: "Graphs" },
  { id: "definitions", label: "Definitions" },
  { id: "production", label: "Production" },
  { id: "health", label: "Project health" },
  { id: "settings", label: "Settings" }
];

export const entries = [
  { id: "home", label: "Home" },
  { id: "graph-editor", label: "Graphs · Graph editor" },
  { id: "node-gallery", label: "Graphs · Node gallery" },
  { id: "definitions", label: "Definitions" },
  { id: "production", label: "Production" },
  { id: "project-health", label: "Project health" },
  ...settingsCategories.map((category) => ({ id: `settings-${category.id}`, label: `Settings · ${category.label}` }))
];

export const note =
  "Recreated from DialogSystemMainWindow.cs, Tabs/*.cs, SettingsWindow/*, and the 4.0 screenshots in Dialogue Graph System/4.0/screenshots. " +
  "The graph canvas is a fixed example; nodes cannot be wired, executed, saved, imported, or exported. Values are fictitious.";

export const notes = {
  "node-gallery":
    "Every node type in Runtime/Models/NodeKind.cs appears in the gallery with its type accent from USS/NodeTypes.uss. Selecting a node shows its example inspector fields; nothing is authored or saved.",
  "settings-text":
    "Text settings fields and defaults follow Tabs/SettingsTabController.cs and the Text settings asset. Example values are fictitious."
};

const tabAlias = {
  home: "home",
  graphs: "graphs",
  "graph-editor": "graphs",
  "node-gallery": "graphs",
  definitions: "definitions",
  production: "production",
  "project-health": "health",
  health: "health"
};

function navigateMainTab(ctx, id) {
  ctx.state.dgs.mainTab = id;
  const surface = surfaceForMainTab(id, ctx.state.dgs.settingsCategory);
  if (ctx.navigateSurface) ctx.navigateSurface(surface, { replace: false });
  else ctx.rerender();
}

function renderHome(ctx) {
  const { state, rerender } = ctx;
  const dgs = state.dgs;
  const graphs = state.graphs;

  const uncategorizedOnly = dgs.homeFilter === "Uncategorized";
  const isFolderScope = dgs.homeFilter.startsWith("folder:");
  const isCategoryScope = dgs.homeFilter.startsWith("category:");

  const inScope = (graph) => {
    if (isFolderScope) {
      const folder = dgs.homeFilter.slice("folder:".length);
      return graph.path.startsWith(folder + "/") || graph.path === folder;
    }
    if (isCategoryScope) {
      const category = dgs.homeFilter.slice("category:".length);
      return graph.categories.includes(category);
    }
    return true;
  };

  const isFavorite = (name) => (dgs.favoriteGraphs || []).includes(name);
  const visibleGraphs = () => graphs
    .filter((graph) => inScope(graph))
    .filter((graph) => {
      const text = `${graph.title} ${graph.name} ${graph.path} ${graph.categories.join(" ")}`.toLowerCase();
      const query = (dgs.homeSearchQuery || "").toLowerCase();
      return !query || text.includes(query);
    })
    .filter((graph) => !uncategorizedOnly || graph.categories.length === 0)
    .filter((graph) => !dgs.favoritesOnly || isFavorite(graph.name))
    .filter((graph) => !dgs.recentOnly || graph.recent)
    .sort((a, b) => {
      if ((b.recent || false) !== (a.recent || false)) return (b.recent ? 1 : 0) - (a.recent ? 1 : 0);
      return (a.title || a.name).localeCompare(b.title || b.name);
    });

  const uncategorizedCount = graphs.filter((g) => g.categories.length === 0).length;
  const toggleFavorite = (name) => {
    const favs = dgs.favoriteGraphs || [];
    dgs.favoriteGraphs = favs.includes(name) ? favs.filter((n) => n !== name) : [...favs, name];
    rerender();
  };
  const warningCount = graphs.filter((g) => /missing|incomplete/i.test(g.localization || "")).length;

  const categoryCounts = {};
  const folderCounts = {};
  for (const graph of graphs) {
    for (const category of graph.categories) categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    const slash = graph.path.lastIndexOf("/");
    const folder = slash >= 0 ? graph.path.slice(0, slash) : "Assets";
    folderCounts[folder] = (folderCounts[folder] || 0) + 1;
  }

  const selectGraph = (name) => {
    dgs.selectedGraph = name;
    rerender();
  };

  const scopePill = (label, active, count, onClick) =>
    h("button", {
      class: `bf-button${active ? " bf-button--primary" : ""}`,
      type: "button",
      text: `${label} (${count})`,
      onclick: onClick
    });

  const scopeButton = (label, value, count, onClick, active, accent) =>
    h("button", {
      class: "dgs-graph-browser-scope-button" + (active ? " active" : ""),
      type: "button",
      text: `${label} (${count})`,
      style: { paddingLeft: "14px", borderLeftWidth: "4px", borderLeftColor: accent || "transparent", marginTop: "2px", marginBottom: "2px", height: "24px", fontSize: "11px", width: "100%", textAlign: "left", background: active ? "var(--bf-selection, rgba(88, 101, 242, 0.12))" : "var(--bf-elevated, #1a1d28)" },
      onclick: onClick
    });

  const warningBanner = warningCount > 0
    ? h("div", { class: "dgs-graph-browser-warning-banner", style: { marginBottom: "8px" } },
        h("span", { class: "dgs-graph-browser-warning-icon", text: "⚠" }),
        h("span", { class: "dgs-graph-browser-warning-label", text: `${warningCount} graph${warningCount === 1 ? "" : "s"} have incomplete localization translations.` })
      )
    : null;

  const header = h("div", { class: "dgs-graph-browser-header" },
    h("div", { class: "dgs-graph-browser-title-block" },
      h("div", { style: { display: "flex", alignItems: "center", gap: "8px" } },
        h("span", { class: "dgs-nav-icon", text: "🗂" }),
        h("span", { class: "dgs-graph-browser-title", text: "Dialogue Graph Browser" })
      ),
      h("span", { class: "dgs-graph-browser-subtitle", text: "Organize your conversations with categories and folders. Categories are metadata labels; Folders are physical asset locations." }),
      warningBanner
    ),
    h("div", { class: "dgs-graph-browser-create-row" },
      textInput(dgs.createName, (value) => { dgs.createName = value; }, { placeholder: "Graph name" }),
      h("button", {
        class: "bf-button bf-button--primary",
        type: "button",
        text: "Create & Open",
        onclick: (event) => {
          const name = (dgs.createName || "").trim();
          if (!name) {
            const windowEl = event.currentTarget.closest(".up-window") || document.body;
            const overlay = messageBox("Invalid Name", "Please enter a valid graph name.", [
              h("button", { class: "bf-button", type: "button", text: "OK", onclick: () => overlay.remove() })
            ]);
            windowEl.append(overlay);
            return;
          }
          openCreateDialog(event.currentTarget, ctx, name);
        }
      })
    )
  );

  const catalog = h("div", { class: "dgs-graph-browser-column dgs-graph-browser-column--catalog" },
    h("div", { class: "dgs-graph-browser-scroll" },
      h("div", { class: "dgs-graph-browser-section-header" }, h("span", { class: "dgs-graph-browser-section-title", text: "Quick Filters" })),
      h("div", { class: "dgs-graph-browser-filter-row" },
        scopePill("All", dgs.homeFilter === "All", graphs.length, () => { dgs.homeFilter = "All"; dgs.homeDetailsOpen = false; rerender(); }),
        scopePill("Uncategorized", uncategorizedOnly, uncategorizedCount, () => { dgs.homeFilter = "Uncategorized"; dgs.homeDetailsOpen = false; rerender(); })
      ),
      h("div", { class: "dgs-graph-browser-section-header", style: { marginTop: "12px" } }, h("span", { class: "dgs-graph-browser-section-title", text: "Categories" })),
      h("div", { class: "dgs-graph-browser-composer" },
        h("div", null, h("span", { class: "bf-field__label", text: "Name" }), textInput("", (value) => { /* category name composer (demo) */ }, { placeholder: "Category name" })),
        h("div", { class: "dgs-graph-browser-inline-row", style: { marginTop: "6px", gap: "8px" } },
          h("select", { class: "bf-select", style: { minWidth: "110px" } },
            h("option", { value: "Root", text: "Root" }),
            ...Object.keys(categoryCounts).map((category) => h("option", { value: category, text: category }))
          ),
          textInput("", () => { /* color */ }, { placeholder: "Color" }),
          h("button", { class: "bf-button", type: "button", text: "Create Category", onclick: () => toastOn(document.body, "Create Category", "Demo only: categories are not persisted in this preview.") })
        )
      ),
      ...Object.entries(categoryCounts).map(([category, count]) =>
        scopeButton(category, category, count, () => { dgs.homeFilter = `category:${category}`; dgs.homeDetailsOpen = false; rerender(); }, dgs.homeFilter === `category:${category}`)
      ),
      h("div", { class: "dgs-graph-browser-section-header", style: { marginTop: "12px" } },
        h("span", { class: "dgs-graph-browser-section-title", text: "Folders" }),
        h("button", { type: "button", text: "+", title: "Add Existing Folder to Browser", style: { width: "24px", height: "20px", fontSize: "14px", padding: 0, marginLeft: "6px", border: "1px solid var(--bf-border, #2a2f45)", background: "var(--bf-elevated, #1a1d28)" }, onclick: () => toastOn(document.body, "Add Folder", "Demo only: folders are not added in this preview.") })
      ),
      ...Object.entries(folderCounts).map(([folder, count]) =>
        scopeButton(folder.split("/").pop() || folder, folder, count, () => { dgs.homeFilter = `folder:${folder}`; dgs.homeDetailsOpen = false; rerender(); }, dgs.homeFilter === `folder:${folder}`, "#647088")
      )
    )
  );

  const resultRows = (graphs) => graphs.length
    ? graphs.map((graph) => buildGraphRow(ctx, graph, selectGraph, toggleFavorite, isFavorite))
    : [h("div", { class: "dgs-graph-browser-hint", style: { marginTop: "20px", textAlign: "center", opacity: 0.7 } }, "No graphs match the current filters. Clear search or use Reset.")];
  const summaryText = (graphs) => `${graphs.length} graph(s) visible  |  ${graphs.filter((graph) => isFavorite(graph.name)).length} favorite(s)  |  ${graphs.filter((graph) => graph.recent).length} recent`;
  const visible = visibleGraphs();
  const summary = h("span", { class: "dgs-graph-browser-summary", text: summaryText(visible) });
  const results = h("div", { class: "dgs-graph-browser-scroll dgs-graph-browser-results" }, ...resultRows(visible));
  const list = h("div", { class: "dgs-graph-browser-column dgs-graph-browser-column--list" },
    h("div", { class: "dgs-graph-browser-toolbar" },
      h("input", {
        class: "bf-input",
        type: "text",
        placeholder: "Search graphs",
        value: dgs.homeSearchQuery || "",
        style: { flexGrow: "1", marginRight: "8px" },
        oninput: (event) => {
          dgs.homeSearchQuery = event.target.value;
          const visible = visibleGraphs();
          results.replaceChildren(...resultRows(visible));
          summary.textContent = summaryText(visible);
        }
      }),
      h("div", { class: "dgs-graph-browser-filter-group" },
        h("button", { class: "dgs-graph-browser-toggle-button" + (dgs.favoritesOnly ? " active" : ""), type: "button", text: "Favorites", onclick: () => { dgs.favoritesOnly = !dgs.favoritesOnly; rerender(); } }),
        h("button", { class: "dgs-graph-browser-toggle-button" + (dgs.recentOnly ? " active" : ""), type: "button", text: "Recent", onclick: () => { dgs.recentOnly = !dgs.recentOnly; rerender(); } })
      ),
      h("button", { class: "dgs-graph-browser-toggle-button", type: "button", text: "Reset", onclick: () => { dgs.homeSearchQuery = ""; dgs.favoritesOnly = false; dgs.recentOnly = false; dgs.homeFilter = "All"; dgs.homeDetailsOpen = false; rerender(); } }),
      h("button", { class: "dgs-graph-browser-toggle-button", type: "button", text: "Delete Selected", disabled: true }),
      h("label", { class: "dgs-graph-browser-details-toggle" },
        h("input", { type: "checkbox", checked: dgs.homeDetailsOpen, onchange: (event) => { dgs.homeDetailsOpen = event.target.checked; rerender(); } }),
        h("span", { text: "Details" })
      )
    ),
    summary,
    results
  );

  const inspector = h("div", { class: `dgs-graph-browser-column dgs-graph-browser-column--inspector${dgs.homeDetailsOpen ? " dgs-graph-browser--details-open" : ""}` },
    h("div", { class: "dgs-graph-browser-inspector-header" },
      h("span", { class: "dgs-graph-browser-inspector-title", text: "Details" }),
      h("button", { class: "dgs-graph-browser-close-details", type: "button", text: "Close Details", onclick: () => { dgs.homeDetailsOpen = false; rerender(); } })
    ),
    h("div", { class: "dgs-graph-browser-scroll" },
      buildGraphInspector(ctx, graphs.find((g) => g.name === dgs.selectedGraph) || graphs[0], selectGraph, toggleFavorite, isFavorite)
    )
  );

  const body = h("div", { class: "dgs-graph-browser-body" }, catalog, list, inspector);
  const hostClass = `dgs-graph-browser${dgs.homeDetailsOpen ? " dgs-graph-browser--details-open" : ""}`;

  return h("div", { class: hostClass }, header, body);
}

function buildGraphRow(ctx, graph, selectGraph, toggleFavorite, isFavorite) {
  const localizationWarning = /missing|incomplete/i.test(graph.localization || "");
  const titleDiffers = graph.title !== graph.name;
  const slash = graph.path.lastIndexOf("/");
  const shortPath = slash >= 0 ? graph.path.slice(slash + 1) : graph.path;

  const active = ctx.state.dgs.selectedGraph === graph.name;
  const accent = graph.categories[0] === "Market" ? "#7c8bd8" : graph.categories[0] === "Sample" ? "#b388ff" : "#647088";

  const content = h("div", { class: "dgs-graph-row-content" },
    h("div", { class: "dgs-graph-row-title-row" },
      h("span", { class: "dgs-graph-row-title", text: graph.title }),
      localizationWarning && h("span", { class: "dgs-graph-row-warning-icon", text: "⚠", title: "Incomplete localization translations." }),
      titleDiffers && h("span", { class: "dgs-graph-row-file-name", text: `(${graph.name})` })
    ),
    h("div", { class: "dgs-graph-row-path-row", style: { marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" } },
      h("span", { class: "dgs-graph-row-graph-icon", text: "💬", style: { fontSize: "11px", opacity: 0.65 } }),
      h("span", { class: "dgs-graph-row-path", text: shortPath, title: graph.path })
    ),
    h("div", { class: "dgs-graph-row-metadata", text: `Modified: ${graph.modified}` }),
    h("div", { class: "dgs-graph-row-metadata dgs-graph-row-localization", style: { marginTop: "2px", color: localizationWarning ? "var(--bf-warning, #f2c05c)" : undefined }, text: graph.localization }),
    h("div", { class: "dgs-graph-row-categories", style: { marginTop: "4px" } },
      ...(graph.categories.length > 0 ? graph.categories.slice(0, 4).map((category) => categoryChip(category)) : [categoryChip("Uncategorized", "#647088")])
    )
  );

  const actions = h("div", { class: "dgs-graph-row-actions", style: { paddingLeft: "4px", paddingRight: "8px", display: "flex", flexDirection: "column", gap: "4px" } },
    h("button", {
      class: "dgs-favorite-button" + (isFavorite(graph.name) ? " dgs-favorite-button--active" : ""),
      type: "button",
      title: isFavorite(graph.name) ? "Remove from favorites" : "Add to favorites",
      onclick: (event) => { event.stopPropagation(); toggleFavorite(graph.name); }
    }, isFavorite(graph.name) ? "★" : "☆"),
    h("button", { class: "bf-button bf-button--primary", type: "button", text: "Open", style: { marginTop: "4px", width: "100%" }, onclick: (event) => { event.stopPropagation(); navigateMainTab(ctx, "graphs"); } })
  );

  return h("div", {
    class: `dgs-graph-row${active ? " active" : ""}`,
    type: "button",
    onclick: () => selectGraph(graph.name)
  },
    h("span", { class: "dgs-graph-row-accent", style: { backgroundColor: accent } }),
    h("input", { type: "checkbox", class: "dgs-graph-row-toggle", style: { alignSelf: "center", marginLeft: "6px" } }),
    content,
    actions
  );
}

function categoryChip(category, color) {
  return h("div", { class: "dgs-graph-browser-chip", style: displayChip(category, color) },
    h("span", { class: "dgs-graph-browser-chip-swatch", style: { backgroundColor: color || "#647088" } }),
    h("span", { class: "dgs-graph-browser-chip-label", text: category })
  );
}

function displayChip(category, color) {
  return { display: "inline-flex", alignItems: "center", gap: "5px", padding: "2px 7px", borderRadius: "3px", fontSize: "10px", marginRight: "6px", marginBottom: "4px", background: "rgba(88,101,242,0.08)", border: "1px solid var(--bf-border, #2a2f45)", color: "var(--bf-text-secondary, #c8d0e0)" };
}

function buildGraphInspector(ctx, graph, selectGraph, toggleFavorite, isFavorite) {
  const localizationWarning = /missing|incomplete/i.test(graph.localization || "");
  const card = h("div", { class: "dgs-graph-browser-card", style: { paddingLeft: "14px", paddingRight: "14px" } },
    h("span", { class: "dgs-graph-browser-card-title", style: { fontSize: "15px" }, text: graph.title }),
    h("span", { class: "dgs-graph-browser-card-subtitle", style: { marginBottom: "12px", display: "block" }, text: graph.path }),
    h("button", { class: "dgs-favorite-button" + (isFavorite(graph.name) ? " dgs-favorite-button--active" : ""), type: "button", title: isFavorite(graph.name) ? "Remove from favorites" : "Add to favorites", onclick: (event) => { event.stopPropagation(); toggleFavorite(graph.name); } }, isFavorite(graph.name) ? "★" : "☆"),
    h("div", { class: "dgs-graph-browser-card-actions", style: { marginBottom: "16px", display: "flex", gap: "6px", marginTop: "8px" } },
      h("button", { class: "bf-button bf-button--primary", type: "button", text: "Open Graph", style: { height: "28px", flexGrow: "1" }, onclick: () => {} }),
      h("button", { class: "bf-button", type: "button", text: "Ping", style: { height: "28px" }, onclick: () => toastOn(document.body, "Ping", "Demo only: nothing is highlighted in the Unity project.") }),
      h("button", { class: "bf-button bf-button--danger", type: "button", text: "Delete", style: { height: "28px" }, onclick: () => {} })
    ),
    h("div", { class: "dgs-graph-browser-section" },
      h("span", { class: "dgs-graph-browser-section-title", text: "Metadata" }),
      h("div", { class: "dgs-graph-browser-form-row" },
        h("span", { class: "dgs-graph-browser-form-label", text: "Title" }),
        h("div", { class: "dgs-graph-browser-form-control" }, h("input", { class: "bf-input", type: "text", value: graph.title, disabled: true }))
      ),
      h("div", { class: "dgs-graph-browser-form-row" },
        h("span", { class: "dgs-graph-browser-form-label", text: "Author" }),
        h("div", { class: "dgs-graph-browser-form-control" }, h("input", { class: "bf-input", type: "text", value: "Beka Forge", disabled: true }))
      ),
      h("div", { class: "dgs-graph-browser-form-row dgs-graph-browser-form-row--prose" },
        h("span", { class: "dgs-graph-browser-form-label", text: "Description" }),
        h("div", { class: "dgs-graph-browser-form-control" }, h("textarea", { class: "bf-textarea", rows: 3, disabled: true }, "A market gate conversation sample."))
      )
    ),
    h("div", { class: "dgs-graph-browser-section" },
      h("span", { class: "dgs-graph-browser-section-title", text: "Localization" }),
      h("span", { class: "dgs-graph-browser-card-subtitle", style: { marginBottom: "6px", display: "block", color: localizationWarning ? "var(--bf-warning, #f2c05c)" : undefined }, text: graph.localization }),
      localizationWarning && h("div", { class: "dgs-graph-browser-warning-banner", style: { marginTop: "6px" } }, h("span", { class: "dgs-graph-browser-warning-icon", text: "⚠" }), h("span", { class: "dgs-graph-browser-warning-label", text: "Some target languages still need translations for this graph." })),
      h("button", { class: "bf-button", type: "button", text: "Open Localization", style: { marginTop: "6px" }, onclick: () => {} })
    ),
    h("div", { class: "dgs-graph-browser-section", style: { name: "launcher-category-assignment" } },
      h("span", { class: "dgs-graph-browser-section-title", text: "Category Assignment" }),
      h("div", { class: "dgs-graph-browser-form-row" },
        h("span", { class: "dgs-graph-browser-form-label", text: "Primary" }),
        h("div", { class: "dgs-graph-browser-form-control" }, h("select", { class: "bf-select", style: { minWidth: "0", flexGrow: "1" } },
          h("option", { value: "", text: "None" }),
          ...graph.categories.map((category) => h("option", { value: category, text: category }))
        ))
      ),
      h("div", { class: "dgs-graph-browser-section-title", style: { marginTop: "8px" } }, "Assigned categories"),
      ...graph.categories.map((category) =>
        h("div", { class: "dgs-graph-browser-inline-row", style: { marginTop: "4px", display: "flex", gap: "8px", alignItems: "center" } },
          categoryChip(category),
          h("button", { class: "bf-button bf-button--danger", type: "button", text: "Remove", onclick: () => {} })
        )
      ),
      graph.categories.length === 0 && h("span", { class: "dgs-graph-browser-card-subtitle", text: "No categories assigned." }),
      h("div", { class: "dgs-graph-browser-inline-row", style: { marginTop: "8px", display: "flex", gap: "8px" } },
        h("select", { class: "bf-select", style: { flexGrow: "1" } },
          h("option", { value: "Market", text: "Market" }),
          h("option", { value: "Sample", text: "Sample" })
        ),
        h("button", { class: "bf-button", type: "button", text: "Add", onclick: () => {} })
      )
    ),
    h("span", { class: "dgs-graph-browser-card-subtitle", style: { marginTop: "12px", opacity: 0.6, display: "block" }, text: "Categories are browser-only metadata and do not affect physical file organization." })
  );
  return card;
}

function openCreateDialog(host, ctx, name = "") {
  const windowEl = host.closest(".up-window") || document.body;
  const overlay = messageBox(
    "Create & Open",
    `This preview does not create assets.\n\nIn Unity, Create & Open adds '${name || "DialogGraph"}' as a new graph asset and opens it in the graph editor.`,
    [
      h("button", { class: "bf-button", type: "button", text: "Cancel", onclick: () => overlay.remove() }),
      h("button", {
        class: "bf-button bf-button--primary",
        type: "button",
        text: "OK",
        onclick: () => {
          overlay.remove();
          toastOn(windowEl, "Create & Open", "Demo only: no graph asset was created.");
        }
      })
    ]
  );
  windowEl.append(overlay);
}

function renderShell(ctx) {
  const { state } = ctx;
  const tabBar = tabs(mainTabs, state.dgs.mainTab, (id) => {
    navigateMainTab(ctx, id);
  });

  let content;
  switch (state.dgs.mainTab) {
    case "graphs":
      content = renderGraphEditor;
      break;
    case "definitions":
      content = renderDefinitions;
      break;
    case "production":
      content = renderProduction;
      break;
    case "health":
      content = renderHealth;
      break;
    case "settings":
      content = renderSettings;
      break;
    default:
      content = renderHome;
  }

  const body = h("div", { class: "up-scroll", style: { flex: "1 1 auto", minHeight: 0 } }, content(ctx));

  return windowFrame({
    title: "Dialogue Graph System",
    hint: "Example project · demo data",
    className: "dgs-window",
    tabsBar: tabBar,
    body,
    footer: statusBar(
      state.dgs.recoveryMode ? "Recovery mode is enabled. Opening graphs is limited." : "Ready",
      []
    )
  });
}

export async function render(host, ctx) {
  const surface = ctx.surface || "";
  const dgs = ctx.state.dgs;
  const routeChanged = !dgs.routeApplied || dgs.appliedSurface !== surface;
  let focused = null;

  if (surface.startsWith("settings-")) {
    const category = surface.slice("settings-".length);
    if (settingsCategories.some((entry) => entry.id === category)) {
      if (routeChanged) dgs.settingsCategory = category;
      focused = "settings";
    }
  } else if (surface === "node-gallery") {
    focused = "gallery";
  } else if (surface in tabAlias) {
    focused = tabAlias[surface];
  }

  if (routeChanged) {
    if (focused) dgs.mainTab = focused === "gallery" ? "graphs" : focused;
    if (focused === "gallery") dgs.galleryDismissed = false;
    dgs.routeApplied = true;
    dgs.appliedSurface = surface;
  }

  if (focused === "gallery" && !dgs.galleryDismissed && (dgs.mainTab ?? "graphs") === "graphs") {
    host.append(
      windowFrame({
        title: "Dialogue Graph System",
        hint: "Node gallery · every NodeKind",
        className: "dgs-window",
        tabsBar: tabs(mainTabs, "graphs", (id) => {
          dgs.galleryDismissed = true;
          navigateMainTab(ctx, id);
        }, { className: "bf-tabs" }),
        body: h("div", { class: "up-scroll" }, renderNodeGallery(ctx))
      })
    );
    return;
  }

  host.append(renderShell(ctx));
}
