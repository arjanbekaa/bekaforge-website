/* Definitions tab: Characters, Actions, Variables, Context.
   Master-detail workbenches built from the DGS definitions workflow. Example assets only. */

import { h, card, field, helper, badge, tabs, enumRow, toggleRow, numberRow, sectionTitle } from "../controls.js";
import { renderCharacterWorkbench } from "../character-workbench.js";

const definitionTabs = [
  { id: "characters", label: "Characters" },
  { id: "actions", label: "Actions" },
  { id: "variables", label: "Variables" },
  { id: "context", label: "Context" }
];

function commitTextRow(label, value, onCommit, options = {}) {
  return field(
    label,
    h("input", {
      class: "bf-input",
      type: "text",
      value: value ?? "",
      placeholder: options.placeholder || "",
      onchange: (event) => onCommit(event.target.value)
    }),
    { tooltip: options.tooltip }
  );
}

function commitMultilineRow(label, value, onCommit, options = {}) {
  return field(
    label,
    h(
      "textarea",
      {
        class: "bf-textarea",
        rows: options.rows || 4,
        style: options.height ? { height: `${options.height}px` } : undefined,
        onchange: (event) => onCommit(event.target.value)
      },
      value ?? ""
    ),
    { tooltip: options.tooltip, stacked: options.stacked }
  );
}

function definitionsRuntime(ctx) {
  if (!ctx.state.definitions) ctx.state.definitions = {};
  if (!ctx.state.definitions.actionIds) ctx.state.definitions.actionIds = {};
  return ctx.state.definitions;
}

function list(items, selectedId, onSelect, render) {
  return h(
    "div",
    { class: "dgs-list" },
    ...items.map((item) =>
      h("button", {
        class: `dgs-list__item${item.id === selectedId ? " dgs-list__item--selected" : ""}`,
        type: "button",
        onclick: () => onSelect(item.id),
        text: item.name
      })
    )
  );
}

function characterDetail(character, ctx) {
  return renderCharacterWorkbench(character, ctx);
}

function actionDetail(action, ctx) {
  const runtime = definitionsRuntime(ctx);
  const actionId = runtime.actionIds[action.id] ?? action.id;
  return card(
    "Action",
    commitTextRow("Name", action.name, (value) => { action.name = value; }),
    commitTextRow("Action ID", actionId, (value) => { runtime.actionIds[action.id] = value; }),
    commitMultilineRow("Description", action.description, (value) => { action.description = value; }, { stacked: true }),
    toggleRow("Wait for completion", action.wait, (value) => { action.wait = value; ctx.rerender(); }),
    numberRow("After action delay", action.delay, 0, null, (value) => { action.delay = value; }, { unit: "s" }),
    sectionTitle("Typed parameters"),
    ...action.fields.map((entry) =>
      h("div", { class: "dgs-param" },
        h("div", { class: "bf-row" }, h("span", { class: "bf-field__label", text: entry.key }), badge(entry.type), entry.required ? badge("Required") : null),
        h("div", { class: "bf-helper", text: entry.tooltip })
      )
    ),
    helper("Graph action nodes resolve exactly one registered definition by exact action ID.")
  );
}

function variableDetail(variable, ctx) {
  return card(
    "Variable",
    commitTextRow("Name", variable.name, (value) => { variable.name = value; }),
    commitTextRow("Key", variable.key, (value) => { variable.key = value; }),
    enumRow("Type", variable.type, ["Boolean", "Integer", "Float", "String"].map((value) => ({ value, label: value })), (value) => { variable.type = value; ctx.rerender(); }),
    commitTextRow("Default value", variable.value, (value) => { variable.value = value; }),
    commitMultilineRow("Description", variable.description, (value) => { variable.description = value; }, { stacked: true }),
    enumRow("Scope", variable.scope, ["Runtime", "Context"].map((value) => ({ value, label: value })), (value) => { variable.scope = value; ctx.rerender(); }),
    field("Usage", variable.usedInGraph ? badge("Read or written by graph content") : badge("Not referenced by any graph"))
  );
}

function contextDetail(context) {
  return card(
    "Context",
    commitTextRow("Name", context.name, (value) => { context.name = value; }),
    commitTextRow("Scene", context.scene, (value) => { context.scene = value; }),
    commitMultilineRow("Description", context.description, (value) => { context.description = value; }, { stacked: true }),
    field("Tags", h("div", null, ...context.tags.map((tag) => badge(tag)))),
    helper("Context assets describe the runtime situation for branching content (for example the market courtyard at day).")
  );
}

export function renderDefinitions(ctx) {
  const { state, rerender } = ctx;
  const active = state.dgs.definitionTab;

  const body = h("div", { class: "dgs-definitions" });
  const stage = h("div", { class: "dgs-definitions__stage" });

  if (active === "characters") {
    const selected = state.characters.find((entry) => entry.id === state.dgs.selectedCharacter) || state.characters[0];
    stage.append(characterDetail(selected, ctx));
    body.append(list(state.characters, state.dgs.selectedCharacter, (id) => { state.dgs.selectedCharacter = id; rerender(); }), stage);
  } else if (active === "actions") {
    const selected = state.actions.find((entry) => entry.id === state.dgs.selectedAction) || state.actions[0];
    stage.append(actionDetail(selected, ctx));
    body.append(list(state.actions, state.dgs.selectedAction, (id) => { state.dgs.selectedAction = id; rerender(); }), stage);
  } else if (active === "variables") {
    const selected = state.variables.find((entry) => entry.id === state.dgs.selectedVariable) || state.variables[0];
    stage.append(variableDetail(selected, ctx));
    body.append(list(state.variables, state.dgs.selectedVariable, (id) => { state.dgs.selectedVariable = id; rerender(); }), stage);
  } else {
    const selected = state.contexts.find((entry) => entry.id === state.dgs.selectedContext) || state.contexts[0];
    stage.append(contextDetail(selected, ctx));
    body.append(list(state.contexts, state.dgs.selectedContext, (id) => { state.dgs.selectedContext = id; rerender(); }), stage);
  }

  return h(
    "div",
    { class: "dgs-tab-page" },
    tabs(definitionTabs.map((entry) => ({ id: entry.id, label: entry.label })), active, (id) => {
      state.dgs.definitionTab = id;
      rerender();
    }, { className: "dgs-subtabs" }),
    body
  );
}
