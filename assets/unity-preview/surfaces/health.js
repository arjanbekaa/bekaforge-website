/* Project health tab.
   Severity rows follow Tabs/ProjectHealthTabController.cs. Example findings only. */

import { h, card, helper, badge, sectionTitle } from "../controls.js";

const severityTone = {
  Error: "bf-status--blocked",
  Warning: "bf-status--warning",
  Healthy: "bf-status--complete"
};

export function renderHealth(ctx) {
  const { state, rerender } = ctx;
  const issues = state.health;
  const selected = issues.find((entry) => entry.id === state.dgs.selectedIssue) || issues[0];

  const counts = {
    Error: issues.filter((entry) => entry.severity === "Error").length,
    Warning: issues.filter((entry) => entry.severity === "Warning").length,
    Healthy: issues.filter((entry) => entry.severity === "Healthy").length
  };

  const summary = h(
    "div",
    { class: "dgs-health-summary" },
    h("div", { class: "dgs-health-stat" }, h("span", { class: "dgs-health-stat__value dgs-health-stat__value--error", text: String(counts.Error) }), h("span", { text: "Errors" })),
    h("div", { class: "dgs-health-stat" }, h("span", { class: "dgs-health-stat__value dgs-health-stat__value--warning", text: String(counts.Warning) }), h("span", { text: "Warnings" })),
    h("div", { class: "dgs-health-stat" }, h("span", { class: "dgs-health-stat__value dgs-health-stat__value--ok", text: String(counts.Healthy) }), h("span", { text: "Healthy checks" }))
  );

  const list = h(
    "div",
    { class: "dgs-list" },
    ...issues.map((entry) =>
      h("button", {
        class: `dgs-list__item dgs-health-item${entry.id === state.dgs.selectedIssue ? " dgs-list__item--selected" : ""}`,
        type: "button",
        onclick: () => {
          state.dgs.selectedIssue = entry.id;
          rerender();
        }
      },
        h("span", { class: `bf-chip ${severityTone[entry.severity] || ""}`, text: entry.severity }),
        h("span", { class: "dgs-health-item__title", text: entry.title }),
        h("span", { class: "bf-muted", text: entry.category })
      )
    )
  );

  return h(
    "div",
    { class: "dgs-tab-page" },
    h("div", { class: "dgs-panel" },
      h("div", { class: "dgs-page-header" }, h("div", { class: "dgs-page-header__title", text: "Project health" }), h("div", { class: "dgs-page-header__subtitle", text: "Resolve graph usage, definition, and runtime coverage findings before release." })),
      summary,
      h("div", { class: "dgs-definitions" }, list, h("div", { class: "dgs-definitions__stage" },
        card(selected.title,
          h("div", { class: "bf-row" }, badge(selected.severity), badge(selected.category), selected.graph ? badge(selected.graph) : null),
          h("div", { class: "bf-helper", style: { marginTop: "8px" }, text: selected.detail }),
          h("div", { class: "bf-divider" }),
          sectionTitle("Next step"),
          helper("Fix the finding in the graph editor or definitions workbench, then run Project health again. This preview only shows example findings.")
        )
      ))
    )
  );
}
