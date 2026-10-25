import { h } from "../controls.js";
import { nodeKinds } from "./registry.js";

export { nodeKinds };
/* Family class added by each node view (AddToClassList in the *NodeView classes).
   NodeTypes.uss owns the accent: 2px top edge + ~12% tint on the header. */
const nodeFamilyClass = {
  Start: "type-start",
  End: "type-end",
  Dialog: "type-dialogue",
  Choice: "type-choice",
  Action: "type-action",
  Condition: "type-condition",
  VariableMutation: "type-variable",
  GraphJump: "type-graph-jump",
  Outcome: "type-outcome",
  CameraSwitch: "type-camera",
  CameraMove: "type-camera",
  CameraLookAt: "type-camera",
  CameraFollowPoint: "type-camera",
  CameraFollowTarget: "type-camera",
  CameraShake: "type-camera",
  CameraRestore: "type-camera",
  RandomBranch: "type-random",
  Switch: "type-switch",
  Wait: "type-wait",
  WaitFor: "type-wait"
};

const nodeLayoutClass = {
  WaitFor: "dgs-wait-for-node",
  Wait: "dgs-wait-node",
  Switch: "dgs-switch-node",
  RandomBranch: "dgs-random-node",
  CameraSwitch: "dgs-camera-node",
  CameraMove: "dgs-camera-node",
  CameraLookAt: "dgs-camera-node",
  CameraFollowPoint: "dgs-camera-node",
  CameraFollowTarget: "dgs-camera-node",
  CameraShake: "dgs-camera-node",
  CameraRestore: "dgs-camera-node"
};

function nodeAccentClass(kind) {
  return nodeFamilyClass[kind] || "";
}

export function nodeClasses(base, kind) {
  return [base, nodeAccentClass(kind), nodeLayoutClass[kind]].filter(Boolean).join(" ");
}

function row(label, value) {
  return { label, value };
}

function rowValue(node, label, fallback) {
  const value = node.fields?.[label];
  return value === undefined ? fallback : value;
}

export function nodePreviewRows(node) {
  const kind = node.kind;
  switch (kind) {
    case "Dialog":
      return [
        row("Speaker", rowValue(node, "Speaker", "Gate Warden")),
        row("Character", rowValue(node, "Character", "Gate Warden")),
        row("Dialog", rowValue(node, "Dialog", "The key turns. The gate swings open."))
      ];
    case "Choice":
      return [
        row("Option 1", rowValue(node, "Option 1", "Ask about the lever")),
        row("Option 2", rowValue(node, "Option 2", "Leave"))
      ];
    case "Action":
      return [
        row("Action ID", rowValue(node, "Action ID", "OpenGate")),
        row("Registered Action", rowValue(node, "Registered Action", "Open Gate")),
        row("Wait For Completion", rowValue(node, "Wait For Completion", true)),
        row("Before Action (sec)", rowValue(node, "Before Action (sec)", 0)),
        row("After Action (sec)", rowValue(node, "After Action (sec)", 0.5))
      ];
    case "Condition":
      return [
        row("Variable", rowValue(node, "Variable", "hasKey")),
        row("Type", rowValue(node, "Type", "Boolean")),
        row("Operator", rowValue(node, "Operator", "IsTrue")),
        row("Value", rowValue(node, "Value", "true")),
        row("Missing Variable = True", rowValue(node, "Missing Variable = True", true))
      ];
    case "VariableMutation":
      return [
        row("Variable", rowValue(node, "Variable", "gold")),
        row("Type", rowValue(node, "Type", "Integer")),
        row("Operation", rowValue(node, "Operation", "Add")),
        row("Value", rowValue(node, "Value", "5"))
      ];
    case "GraphJump":
      return [
        row("Target Graph", rowValue(node, "Target Graph", "MarketReward")),
        row("Runtime Dialog ID", rowValue(node, "Runtime Dialog ID", "market_reward"))
      ];
    case "Outcome":
      return [
        row("Outcome ID", rowValue(node, "Outcome ID", "market_lever_resolved")),
        row("Display Name", rowValue(node, "Display Name", "Lever resolved")),
        row("Description", rowValue(node, "Description", "The player completed the lever interaction."))
      ];
    case "CameraSwitch":
      return [
        row("Rig ID", rowValue(node, "Rig ID", "SanctumRig")),
        row("Blend Duration", rowValue(node, "Blend Duration", 1.2)),
        row("Ease", rowValue(node, "Ease", "SmoothStep")),
        row("Wait for completion", rowValue(node, "Wait for completion", true))
      ];
    case "CameraMove":
      return [
        row("Target ID", rowValue(node, "Target ID", "MarketCenter")),
        row("Look-at Target ID", rowValue(node, "Look-at Target ID", "GateFocus")),
        row("Duration", rowValue(node, "Duration", 1.4)),
        row("Ease", rowValue(node, "Ease", "SmoothStep")),
        row("Wait for completion", rowValue(node, "Wait for completion", true))
      ];
    case "CameraLookAt":
      return [
        row("Target ID", rowValue(node, "Target ID", "GateFocus")),
        row("Duration", rowValue(node, "Duration", 0.8)),
        row("Ease", rowValue(node, "Ease", "SmoothStep")),
        row("Wait for completion", rowValue(node, "Wait for completion", true))
      ];
    case "CameraFollowPoint":
      return [row("Target ID", rowValue(node, "Target ID", "MarketCenter"))];
    case "CameraFollowTarget":
      return [
        row("Target ID", rowValue(node, "Target ID", "Player")),
        row("Smoothing", rowValue(node, "Smoothing", 6)),
        row("Local Offset", rowValue(node, "Local Offset", "0, 1.6, -3")),
        row("Also Look At", rowValue(node, "Also Look At", true))
      ];
    case "CameraShake":
      return [
        row("Strength", rowValue(node, "Strength", 0.35)),
        row("Frequency", rowValue(node, "Frequency", 18)),
        row("Duration", rowValue(node, "Duration", 0.45)),
        row("Wait for completion", rowValue(node, "Wait for completion", true))
      ];
    case "CameraRestore":
      return [];
    case "RandomBranch":
      return [
        row("Mode", rowValue(node, "Mode", "Percent")),
        row("Branch 1", rowValue(node, "Branch 1", "Weight 1")),
        row("Branch 2", rowValue(node, "Branch 2", "Weight 1")),
        row("Total", rowValue(node, "Total", "100%"))
      ];
    case "Switch":
      return [
        row("Variable", rowValue(node, "Variable", "hasKey")),
        row("Type", rowValue(node, "Type", "Boolean")),
        row("Case · Is false", rowValue(node, "Case · Is false", "false")),
        row("Case · Is true", rowValue(node, "Case · Is true", "true")),
        row("Default", rowValue(node, "Default", "present"))
      ];
    case "Wait":
      return [
        row("Seconds", rowValue(node, "Seconds", 1)),
        row("After the wait", "Out")
      ];
    case "WaitFor":
      return [
        row("Wait for", rowValue(node, "Wait for", "Variable Condition")),
        row("Event ID", rowValue(node, "Event ID", "gate_opened")),
        row("Variable", rowValue(node, "Variable", "hasKey")),
        row("Type", rowValue(node, "Type", "Boolean")),
        row("Operator", rowValue(node, "Operator", "IsTrue")),
        row("Missing Variable = True", rowValue(node, "Missing Variable = True", true))
      ];
    default:
      return [];
  }
}

export function nodeWidth(kind) {
  switch (kind) {
    case "Start": return 150;
    case "End": return 150;
    case "CameraSwitch":
    case "CameraMove":
    case "CameraLookAt":
    case "CameraFollowPoint":
    case "CameraFollowTarget":
    case "CameraShake":
    case "CameraRestore": return 320;
    case "Outcome": return 320;
    case "Dialog":
    case "Choice": return 400;
    case "Action": return 300;
    case "Condition":
    case "VariableMutation":
    case "GraphJump": return 340;
    case "Wait":
    case "WaitFor":
    case "Switch":
    case "RandomBranch": return 340;
    default: return 280;
  }
}

function nodeHeader(node) {
  const compact = node.kind === "Start" || node.kind === "End";
  return h(
    "div",
    { class: `dgs-node__title${compact ? " dgs-node__title--compact" : ""}` },
    node.kind === "End" ? h("span", { class: "dgs-node__port-label", text: "In" }, portAnchor("in", "In", "In")) : null,
    h("span", { class: "dgs-node__icon", text: node.icon || "" }),
    h("span", { class: "dgs-node__title-text", text: node.title }),
    node.kind === "Start" ? h("span", { class: "dgs-node__port-label", text: "Out" }, portAnchor("out", "Out", "Out")) : null
  );
}

const nodeDefaults = {
  Dialog: { "Line ID": "line_gate_warden_01", Speaker: "Gate Warden", Character: "Gate Warden", Dialog: "The key turns. The gate swings open. The sanctum passage is clear.", "Display Time": 0, "Audio Clip": "warden_gate_open", "Wait for Audio": true, "Sync Text with Audio": false },
  Choice: { Choices: [{ id: "ask_lever", text: "Ask about the lever", requirements: [] }, { id: "leave", text: "Leave", requirements: [] }] },
  Action: { "Action ID": "OpenGate", "Registered Action": "Open Gate", "Payload Request": "{\n  \"gate\": \"north\"\n}", "Wait For Completion": true, "Before Action (sec)": 0, "After Action (sec)": 0.5 },
  Condition: { Variable: "hasKey", Type: "Boolean", Operator: "IsTrue", Value: "true", "Missing Variable = True": true },
  VariableMutation: { Variable: "gold", Type: "Integer", Operation: "Add", Value: "5" },
  GraphJump: { "Target Graph": "MarketReward", "Runtime Dialog ID": "market_reward", "Graph GUID": "a7c91e5d0b8f4a62", "Graph Name": "MarketReward", "Asset Path": "Assets/Beka Forge/Dialogue Graph System/Samples/2DMarketDemo/Graphs/MarketReward.asset", "Entry GUID": "4d2f8a1c6e9b0f73" },
  Outcome: { "Outcome ID": "market_lever_resolved", "Display Name": "Lever resolved", Description: "The player completed the lever interaction." },
  CameraSwitch: { "Rig ID": "SanctumRig", "Blend Duration": 1.2, Ease: "SmoothStep", "Wait for completion": true },
  CameraMove: { "Target ID": "MarketCenter", "Look-at Target ID": "GateFocus", Duration: 1.4, Ease: "SmoothStep", "Wait for completion": true },
  CameraLookAt: { "Target ID": "GateFocus", Duration: 0.8, Ease: "SmoothStep", "Wait for completion": true },
  CameraFollowPoint: { "Target ID": "MarketCenter" },
  CameraFollowTarget: { "Target ID": "Player", Smoothing: 6, "Local Offset": "0, 1.6, -3", "Also Look At": true },
  CameraShake: { Strength: 0.35, Frequency: 18, Duration: 0.45, "Wait for completion": true },
  RandomBranch: { Mode: "Weight", Branches: [{ id: "branch1", label: "Market hint", weight: 1 }, { id: "branch2", label: "Sanctum hint", weight: 1 }] },
  Switch: { Variable: "hasKey", Type: "Boolean", Cases: [{ id: "case1", label: "Is false", value: "false" }, { id: "case2", label: "Is true", value: "true" }], Default: true },
  Wait: { Seconds: 1 },
  WaitFor: { "Wait for": "GameplayEvent", "Event ID": "gate_opened", Variable: "hasKey", Type: "Boolean", Operator: "IsTrue", Value: "true", "Missing Variable = True": true }
};

function fieldValue(node, label, fallback) {
  const model = node.sourceNode || node;
  const value = model.fields?.[label] ?? nodeDefaults[node.kind]?.[label] ?? fallback ?? "";
  if (label === "Operator") {
    const options = operatorOptions(node);
    return options.includes(value) ? value : options[0];
  }
  if (node.kind === "WaitFor" && label === "Wait for") return value === "Gameplay Event" ? "GameplayEvent" : value === "Variable Condition" ? "VariableCondition" : value;
  return value;
}

function setNodeField(node, label, value) {
  const model = node.sourceNode || node;
  model.fields = model.fields || {};
  model.fields[label] = value;
}

function mutableItems(node, key, defaults) {
  const model = node.sourceNode || node;
  model.fields = model.fields || {};
  if (!Array.isArray(model.fields[key])) model.fields[key] = structuredClone(defaults);
  return model.fields[key];
}

function objectWell(node, label, fallback) {
  return h("div", { class: "dgs-node-form-row" },
    h("label", { text: label }),
    h("div", { class: "dgs-node-object-well" },
      h("input", { class: "dgs-node-form-control", type: "text", value: fieldValue(node, label, fallback), readonly: true, "aria-label": label }),
      h("button", { class: "dgs-node__mini", type: "button", text: "◉", title: "Unity asset picker is unavailable in the browser preview", disabled: true })));
}

function vector3Row(node, label, fallback) {
  const parts = String(fieldValue(node, label, fallback.join(", "))).split(",");
  const value = fallback.map((component, index) => parts[index] !== undefined && Number.isFinite(Number(parts[index])) ? Number(parts[index]) : component);
  return h("div", { class: "dgs-node-form-row dgs-node-form-row--vector3" }, h("label", { text: label }),
    h("div", { class: "dgs-node-vector3" }, ...["X", "Y", "Z"].map((axis, index) => h("label", { class: "dgs-node-vector3-axis" }, h("span", { text: axis }), h("input", { class: "dgs-node-form-control", type: "number", step: "0.1", value: value[index], "aria-label": `${label} ${axis}`, onclick: (event) => event.stopPropagation(), oninput: (event) => { value[index] = Number(event.target.value); setNodeField(node, label, value.join(", ")); } })))));
}

function updateRandomMode(node, button, mode) {
  const root = button.closest(".dgs-node");
  for (const panel of root?.querySelectorAll("[data-random-mode]") || []) panel.hidden = panel.dataset.randomMode !== mode;
  for (const toggle of root?.querySelectorAll(".dgs-node__mini") || []) toggle.classList.toggle("is-active", toggle.textContent === (mode === "Weight" ? "Weights" : "Percentages"));
  updateRandomProbabilities(node, button);
}

function updateRandomProbabilities(node, control) {
  const root = control.closest(".dgs-node");
  if (!root) return;
  const mode = fieldValue(node, "Mode", "Weight");
  const branches = fieldValue(node, "Branches", nodeDefaults.RandomBranch.Branches);
  [...root.querySelectorAll(".dgs-node__probability")].forEach((label, index) => {
    label.textContent = `Probability: ${branchProbability(branches, index, mode)}%`;
  });
}

function branchProbability(branches, index, mode) {
  const weights = branches.map((branch) => Math.max(0, Number(branch.weight) || 0));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  return (mode === "Percent" ? Math.max(0, Number(branches[index].probability ?? 50) || 0) : total ? weights[index] / total * 100 : 0).toFixed(1);
}

function portAnchor(direction, label, id = label) {
  return h("span", { class: `dgs-port dgs-port--${direction}`, "data-port-id": id, "data-port-name": label, title: `${direction === "in" ? "In" : "Out"} · ${label}` });
}

function inputPortRow(node) {
  if (node.kind === "Start" || node.kind === "End") return null;
  const outputs = node.kind === "Condition" ? ["True", "False"]
    : ["Dialog", "Action", "VariableMutation", "GraphJump", "Outcome", "CameraSwitch", "CameraMove", "CameraLookAt", "CameraFollowPoint", "CameraFollowTarget", "CameraShake", "CameraRestore", "WaitFor"].includes(node.kind) ? [node.kind.startsWith("Camera") ? "Success" : "Out"] : [];
  return h("div", { class: "dgs-node__port-row dgs-node__port-row--in" },
    h("span", { class: "dgs-node__port-label" }, portAnchor("in", "In"), h("span", { text: "In" })),
    ...outputs.map((name) => h("span", { class: "dgs-node__port-label" }, h("span", { text: name }), portAnchor("out", name))));
}

const comparisonOperators = {
  Boolean: ["IsTrue", "IsFalse", "Equals", "NotEquals"],
  Integer: ["Equals", "NotEquals", "Greater", "Less", "GreaterOrEqual", "LessOrEqual"],
  Float: ["Equals", "NotEquals", "Greater", "Less", "GreaterOrEqual", "LessOrEqual"],
  String: ["Equals", "NotEquals", "Contains"]
};

const mutationOperations = { Boolean: ["Set", "Toggle"], Integer: ["Set", "Add", "Subtract"], Float: ["Set", "Add", "Subtract"], String: ["Set", "ClearString"] };

function operatorOptions(node) {
  return comparisonOperators[fieldValue(node, "Type", "Boolean")] || comparisonOperators.Boolean;
}

function fieldControl(node, label, fallback, type = "text", options = []) {
  const value = fieldValue(node, label, fallback);
  const model = node.sourceNode || node;
  const common = {
    class: "dgs-node-form-control",
    "aria-label": label,
    onclick: (event) => event.stopPropagation(),
    oninput: (event) => { model.fields = model.fields || {}; model.fields[label] = event.target.type === "checkbox" ? event.target.checked : event.target.value; if (node.kind === "RandomBranch") updateRandomProbabilities(node, event.currentTarget); },
    onchange: (event) => {
      model.fields = model.fields || {}; model.fields[label] = event.target.type === "checkbox" ? event.target.checked : event.target.value;
      if (label === "Type") {
        const root = event.currentTarget.closest(".dgs-node");
        const operator = root?.querySelector('select[aria-label="Operator"]');
        if (operator) {
          const options = operatorOptions(node);
          const selected = options.includes(model.fields.Operator) ? model.fields.Operator : options[0];
          model.fields.Operator = selected;
          operator.replaceChildren(...options.map((value) => h("option", { value, text: value, selected: value === selected })));
          for (const panel of root.querySelectorAll("[data-value-mode]")) panel.hidden = ["IsTrue", "IsFalse"].includes(selected);
        }
        const operation = root?.querySelector('select[aria-label="Operation"]');
        if (operation) {
          const options = mutationOperations[event.target.value];
          const selected = options.includes(model.fields.Operation) ? model.fields.Operation : options[0];
          model.fields.Operation = selected;
          operation.replaceChildren(...options.map((value) => h("option", { value, text: value, selected: value === selected })));
          for (const panel of root.querySelectorAll("[data-mutation-value]")) panel.hidden = ["Toggle", "ClearString"].includes(selected);
          const value = root.querySelector('input[aria-label="Value"]');
          if (value) value.type = event.target.value === "Boolean" ? "checkbox" : event.target.value === "String" ? "text" : "number";
        }
      }
      if (label === "Wait for") {
        const mode = event.target.value === "Gameplay Event" ? "GameplayEvent" : event.target.value === "Variable Condition" ? "VariableCondition" : event.target.value;
        model.fields[label] = mode;
        for (const panel of event.currentTarget.closest(".dgs-node")?.querySelectorAll("[data-wait-mode]") || []) panel.hidden = panel.dataset.waitMode !== mode;
      }
      if (label === "Operator") for (const panel of event.currentTarget.closest(".dgs-node")?.querySelectorAll("[data-value-mode]") || []) panel.hidden = ["IsTrue", "IsFalse"].includes(event.target.value);
      if (label === "Operation") for (const panel of event.currentTarget.closest(".dgs-node")?.querySelectorAll("[data-mutation-value]") || []) panel.hidden = ["Toggle", "ClearString"].includes(event.target.value);
    }
  };
  if (options.length) return h("select", common, ...options.map((option) => {
    const optionValue = typeof option === "string" ? option : option.value;
    const optionLabel = typeof option === "string" ? option : option.label;
    return h("option", { value: optionValue, selected: optionValue === String(value), text: optionLabel });
  }));
  if (type === "checkbox") return h("input", { ...common, type: "checkbox", checked: !!value });
  if (type === "textarea") return h("textarea", { ...common, rows: "2" }, String(value));
  return h("input", { ...common, type, value: String(value) });
}

function formRow(node, label, fallback, type = "text", options = []) {
  return h("div", { class: "dgs-node-form-row" }, h("label", { text: label }), fieldControl(node, label, fallback, type, options));
}

function outputRow(label, id = label, content = null) {
  return h("div", { class: "dgs-node__port-row dgs-node__port-row--out", "data-port-row": id }, content, h("span", { class: "dgs-node__port-label", text: label }), portAnchor("out", label, id));
}

function nodeBody(node) {
  const rows = [];
  const add = (...items) => rows.push(...items);
  const out = (label = "Out", id = label) => rows.push(outputRow(label, id));
  switch (node.kind) {
    case "Start": case "End": return h("div", { class: "dgs-node__body dgs-node__body--empty" });
    case "Dialog":
      add(h("div", { class: "dgs-node__line-id" }, h("span", { text: "Line ID" }), fieldControl(node, "Line ID", "line_gate_warden_01")),
        !fieldValue(node, "Line ID", "") ? h("div", { class: "dgs-node__line", text: "Legacy line (no ID yet); assigned at first edit or by the schema-4 upgrade." }) : null,
        formRow(node, "Speaker", "Gate Warden"), objectWell(node, "Character", "Gate Warden"),
        h("div", { class: "dgs-node__helper", text: "Manual speaker entry." }),
        h("div", { class: "dgs-node__portrait-row" }, h("div", { class: "dgs-node__portrait" }), h("span", { class: "dgs-node__key", text: "Dialog" }), fieldControl(node, "Dialog", "The key turns. The gate swings open.", "textarea")),
        h("button", { class: "dgs-node__mini dgs-node__rewrite", type: "button", text: "AI Rewrite", disabled: true, title: "AI authoring is unavailable in this preview" }),
        h("details", { class: "dgs-node-foldout" }, h("summary", { text: "Details" }), formRow(node, "Node Title", node.title), objectWell(node, "Portrait", "None (Sprite)"), formRow(node, "Display Time", 0, "number"), objectWell(node, "Audio Clip", "warden_gate_open"), formRow(node, "Wait for Audio", true, "checkbox"), formRow(node, "Sync Text with Audio", false, "checkbox")));
      break;
    case "Choice": {
      const defaults = nodeDefaults.Choice.Choices;
      const choices = fieldValue(node, "Choices", defaults);
      choices.forEach((choice, index) => {
        const option = h("textarea", { class: "dgs-node-form-control", rows: "2", "aria-label": `Option ${index + 1}`, onclick: (event) => event.stopPropagation(), oninput: (event) => { mutableItems(node, "Choices", defaults)[index].text = event.target.value; } }, choice.text);
        const actions = h("span", { class: "dgs-node__choice-actions" },
          h("button", { class: "dgs-node__mini", type: "button", text: "✎", "aria-label": "Rewrite option", title: "AI Rewrite is unavailable in this preview", disabled: true }),
          h("button", { class: "dgs-node__mini", type: "button", text: "⧉", "aria-label": "Duplicate option", title: "Duplicate option", disabled: node.allowStructureEdits === false, onclick: (event) => { event.stopPropagation(); const items = mutableItems(node, "Choices", defaults); items.splice(index + 1, 0, { ...items[index], id: `choice${Date.now()}`, requirements: [...(items[index].requirements || [])] }); node.onRender?.(); } }),
          h("button", { class: "dgs-node__mini", type: "button", text: "×", "aria-label": "Delete option", title: "Delete option", disabled: choices.length < 2 || node.allowStructureEdits === false, onclick: (event) => { event.stopPropagation(); mutableItems(node, "Choices", defaults).splice(index, 1); node.onRender?.(); } }));
        add(h("div", { class: "dgs-node__choice-row" }, option, actions, portAnchor("out", "", `choice:${choice.id}`)),
          h("details", { class: "dgs-node-foldout dgs-node-foldout--nested" }, h("summary", { text: `Requirements (${choice.requirements?.length || 0})` }),
            h("div", { class: "dgs-node__requirement-copy", text: choice.requirements?.length ? "All requirements must pass." : "Unrestricted: always selectable. This answer is always selectable." }),
            ...((choice.requirements || []).map((requirement, reqIndex) => h("div", { class: "dgs-node-form-row" }, h("label", { text: `Requirement ${reqIndex + 1}` }), h("input", { class: "dgs-node-form-control", "aria-label": `Option ${index + 1} requirement ${reqIndex + 1}`, value: requirement, oninput: (event) => { mutableItems(node, "Choices", defaults)[index].requirements[reqIndex] = event.target.value; } })))),
            h("button", { class: "dgs-node__mini", type: "button", text: "Add Requirement", onclick: (event) => { event.stopPropagation(); (mutableItems(node, "Choices", defaults)[index].requirements ||= []).push("Variable Condition"); node.onRender?.(); } }),
            h("div", { class: "dgs-node-form-row" }, h("label", { text: "Unavailable message" }), h("input", { class: "dgs-node-form-control", "aria-label": `Option ${index + 1} unavailable message`, value: choice.unavailableMessage || "", oninput: (event) => { mutableItems(node, "Choices", defaults)[index].unavailableMessage = event.target.value; } }))));
      });
      add(h("button", { class: "dgs-node__add-option", type: "button", text: "+ Add Option", disabled: node.allowStructureEdits === false, onclick: (event) => { event.stopPropagation(); const items = mutableItems(node, "Choices", defaults); items.push({ id: `choice${Date.now()}`, text: "New Choice", requirements: [] }); node.onRender?.(); } })); break;
    }
    case "Action":
      add(formRow(node, "Action ID", "OpenGate"), objectWell(node, "Registered Action", "Open Gate"),
        h("div", { class: "dgs-node__helper", text: "Manual entry." }),
        h("button", { class: "dgs-node__mini", type: "button", text: "Create Action", disabled: true }),
        h("details", { class: "dgs-node-foldout" }, h("summary", { text: "Payload & Timing" }),
          h("details", { class: "dgs-node-foldout dgs-node-foldout--nested" }, h("summary", { text: "Raw JSON" }), formRow(node, "Payload", '{\n  "gate": "north"\n}', "textarea")),
          formRow(node, "Payload Request", "Open the gate", "textarea"), h("button", { class: "dgs-node__mini", type: "button", text: "Write Payload", disabled: true }),
          h("div", { class: "dgs-node__helper", text: "Payload ready for preview." }), formRow(node, "Wait For Completion", true, "checkbox"), formRow(node, "Before Action (sec)", 0, "number"), formRow(node, "After Action (sec)", 0.5, "number")));
      break;
    case "Condition":
      add(formRow(node, "Variable", "hasKey"), objectWell(node, "Registered Variable", "None (Dialog Variable SO)"), formRow(node, "Type", "Boolean", "select", ["Boolean", "Integer", "Float", "String"]), formRow(node, "Operator", "IsTrue", "select", operatorOptions(node)), h("div", { "data-value-mode": "comparison", hidden: ["IsTrue", "IsFalse"].includes(fieldValue(node, "Operator", "IsTrue")) }, formRow(node, "Value", "true")), formRow(node, "Missing Variable = True", true, "checkbox")); break;
    case "VariableMutation":
      add(formRow(node, "Variable", "gold"), objectWell(node, "Registered Variable", "None (Dialog Variable SO)"), formRow(node, "Type", "Integer", "select", ["Boolean", "Integer", "Float", "String"]), formRow(node, "Operation", "Set", "select", mutationOperations[fieldValue(node, "Type", "Integer")]), h("div", { "data-mutation-value": "", hidden: ["Toggle", "ClearString"].includes(fieldValue(node, "Operation", "Set")) }, formRow(node, "Value", "5", fieldValue(node, "Type", "Integer") === "Boolean" ? "checkbox" : fieldValue(node, "Type", "Integer") === "String" ? "text" : "number"))); break;
    case "GraphJump":
      add(objectWell(node, "Target Graph", "MarketReward"), h("details", { class: "dgs-node-foldout" }, h("summary", { text: "Optional Reference Data" }), formRow(node, "Runtime Dialog ID", "market_reward"), formRow(node, "Graph GUID", "a7c91e5d0b8f4a62"), formRow(node, "Graph Name", "MarketReward"), formRow(node, "Asset Path", "Assets/Beka Forge/Dialogue Graph System/Samples/2DMarketDemo/Graphs/MarketReward.asset"), formRow(node, "Entry GUID", "4d2f8a1c6e9b0f73"))); break;
    case "Outcome":
      add(formRow(node, "Outcome ID", "market_lever_resolved"), formRow(node, "Display Name", "Lever resolved"), formRow(node, "Description", "The player completed the lever interaction.", "textarea")); break;
    case "CameraSwitch":
      add(formRow(node, "Rig ID", "SanctumRig"), formRow(node, "Blend Duration", 1.2, "number"), formRow(node, "Ease", "Linear", "select", ["Linear", "SmoothStep", "EaseInOut"]), formRow(node, "Wait for completion", true, "checkbox")); break;
    case "CameraMove":
      add(formRow(node, "Target ID", "MarketCenter"), formRow(node, "Look-at Target ID", "GateFocus"), formRow(node, "Duration", 1.4, "number"), formRow(node, "Ease", "Linear", "select", ["Linear", "SmoothStep", "EaseInOut"]), formRow(node, "Wait for completion", true, "checkbox")); break;
    case "CameraLookAt":
      add(formRow(node, "Target ID", "GateFocus"), formRow(node, "Duration", 0.8, "number"), formRow(node, "Ease", "Linear", "select", ["Linear", "SmoothStep", "EaseInOut"]), formRow(node, "Wait for completion", true, "checkbox")); break;
    case "CameraFollowPoint": add(formRow(node, "Target ID", "MarketCenter")); break;
    case "CameraFollowTarget":
      add(formRow(node, "Target ID", "Player"), formRow(node, "Smoothing", 6, "number"), vector3Row(node, "Local Offset", [0, 1.6, -3]), formRow(node, "Also Look At", true, "checkbox")); break;
    case "CameraShake":
      add(formRow(node, "Strength", 0.35, "number"), formRow(node, "Frequency", 18, "number"), formRow(node, "Duration", 0.45, "number"), formRow(node, "Wait for completion", true, "checkbox")); break;
    case "CameraRestore": break;
    case "Switch":
      add(formRow(node, "Variable", "hasKey"), formRow(node, "Type", "Boolean", "select", ["Boolean", "Integer", "Float", "String"]));
      {
        const defaults = nodeDefaults.Switch.Cases, cases = fieldValue(node, "Cases", defaults);
        cases.forEach((item, index) => add(h("div", { class: "dgs-node__case" },
          h("div", { class: "dgs-node__case-row" },
            h("input", { class: "dgs-node-form-control", value: item.label, "aria-label": `Case ${index + 1} label`, oninput: (event) => { mutableItems(node, "Cases", defaults)[index].label = event.target.value; } }),
            h("span", { class: "dgs-node__port-label" }, "Out", portAnchor("out", "Out", `switch:${item.id}`))),
          h("div", { class: "dgs-node__case-row" }, h("input", { class: "dgs-node-form-control", value: item.value, "aria-label": `Case ${index + 1} value`, oninput: (event) => { mutableItems(node, "Cases", defaults)[index].value = event.target.value; } }),
            h("span", { class: "dgs-node__mini-row" },
              h("button", { class: "dgs-node__mini", text: "Up", disabled: index === 0 || node.allowStructureEdits === false, onclick: (event) => { event.stopPropagation(); const items = mutableItems(node, "Cases", defaults); [items[index - 1], items[index]] = [items[index], items[index - 1]]; node.onRender?.(); } }),
              h("button", { class: "dgs-node__mini", text: "Down", disabled: index === cases.length - 1 || node.allowStructureEdits === false, onclick: (event) => { event.stopPropagation(); const items = mutableItems(node, "Cases", defaults); [items[index + 1], items[index]] = [items[index], items[index + 1]]; node.onRender?.(); } }),
              h("button", { class: "dgs-node__mini", text: "Remove", disabled: cases.length < 2 || node.allowStructureEdits === false, onclick: (event) => { event.stopPropagation(); mutableItems(node, "Cases", defaults).splice(index, 1); node.onRender?.(); } }))))));
        add(outputRow("Default", "switch:default"), h("button", { class: "dgs-node__add-option", type: "button", text: "Add case", disabled: node.allowStructureEdits === false, onclick: (event) => { event.stopPropagation(); const items = mutableItems(node, "Cases", defaults); items.push({ id: `case${Date.now()}`, label: "New case", value: "" }); node.onRender?.(); } }));
      }
      break;
    case "RandomBranch":
      add(h("div", { class: "dgs-node__mini-row" },
        h("button", { class: `dgs-node__mini${fieldValue(node, "Mode", "Weight") === "Weight" ? " is-active" : ""}`, type: "button", text: "Weights", onclick: (event) => { event.stopPropagation(); setNodeField(node, "Mode", "Weight"); updateRandomMode(node, event.currentTarget, "Weight"); } }),
        h("button", { class: `dgs-node__mini${fieldValue(node, "Mode", "Weight") === "Percent" ? " is-active" : ""}`, type: "button", text: "Percentages", onclick: (event) => { event.stopPropagation(); setNodeField(node, "Mode", "Percent"); updateRandomMode(node, event.currentTarget, "Percent"); } })),
        h("div", { class: "dgs-node__line", text: "One weighted route per execution. Weight 0 excludes a branch." }));
      {
        const defaults = nodeDefaults.RandomBranch.Branches, branches = fieldValue(node, "Branches", defaults), mode = fieldValue(node, "Mode", "Weight");
        branches.forEach((branch, index) => {
          const items = () => mutableItems(node, "Branches", defaults);
          const edit = (key) => (event) => { items()[index][key] = event.target.value; updateRandomProbabilities(node, event.currentTarget); };
          const branchRow = h("div", { class: "dgs-node__branch" },
            h("div", { class: "dgs-node__case-row" }, h("input", { class: "dgs-node-form-control", value: branch.label, "aria-label": `Branch ${index + 1}`, oninput: edit("label") }), outputRow("Out", `random:${branch.id}`)),
            h("div", { "data-random-mode": "Weight", hidden: mode !== "Weight" }, h("label", { text: "Weight" }), h("input", { class: "dgs-node-form-control", type: "number", value: branch.weight, "aria-label": `Weight ${index + 1}`, oninput: edit("weight") })),
            h("div", { "data-random-mode": "Percent", hidden: mode !== "Percent" }, h("label", { text: "Probability" }), h("input", { class: "dgs-node-form-control", type: "number", value: branch.probability ?? 50, "aria-label": `Probability ${index + 1}`, oninput: edit("probability") })),
            h("span", { class: "dgs-node__probability", text: `Probability: ${branchProbability(branches, index, mode)}%` }),
            h("div", { class: "dgs-node__mini-row" },
              h("button", { class: "dgs-node__mini", type: "button", text: "Up", disabled: index === 0 || node.allowStructureEdits === false, onclick: (event) => { event.stopPropagation(); [items()[index - 1], items()[index]] = [items()[index], items()[index - 1]]; node.onRender?.(); } }),
              h("button", { class: "dgs-node__mini", type: "button", text: "Down", disabled: index === branches.length - 1 || node.allowStructureEdits === false, onclick: (event) => { event.stopPropagation(); [items()[index + 1], items()[index]] = [items()[index], items()[index + 1]]; node.onRender?.(); } }),
              h("button", { class: "dgs-node__mini", type: "button", text: "Remove", disabled: branches.length < 2 || node.allowStructureEdits === false, onclick: (event) => { event.stopPropagation(); items().splice(index, 1); node.onRender?.(); } })));
          add(branchRow);
        });
        add(h("button", { class: "dgs-node__add-option", type: "button", text: "Add branch", disabled: node.allowStructureEdits === false, onclick: (event) => { event.stopPropagation(); const items = mutableItems(node, "Branches", defaults); items.push({ id: `branch${Date.now()}`, label: "New branch", weight: 1, probability: 0 }); node.onRender?.(); } }));
      }
      break;
    case "Wait":
      add(outputRow("Out", "Out", h("span", { text: "After the wait" })), formRow(node, "Seconds", 1, "number")); break;
    case "WaitFor": {
      const mode = fieldValue(node, "Wait for", "GameplayEvent");
      add(formRow(node, "Wait for", "GameplayEvent", "select", [{ value: "GameplayEvent", label: "Gameplay Event" }, { value: "VariableCondition", label: "Variable Condition" }]),
        h("div", { "data-wait-mode": "GameplayEvent", hidden: mode !== "GameplayEvent" }, formRow(node, "Event ID", "gate_opened")),
        h("div", { "data-wait-mode": "VariableCondition", hidden: mode !== "VariableCondition" }, formRow(node, "Variable", "hasKey"), formRow(node, "Type", "Boolean", "select", ["Boolean", "Integer", "Float", "String"]), formRow(node, "Operator", "IsTrue", "select", operatorOptions(node)), h("div", { "data-value-mode": "comparison", hidden: ["IsTrue", "IsFalse"].includes(fieldValue(node, "Operator", "IsTrue")) }, formRow(node, "Value", "true")), formRow(node, "Missing Variable = True", true, "checkbox")));
      break;
    }
    default: add(h("div", { class: "dgs-node__line", text: "No authored fields." }));
  }
  return h("div", { class: "dgs-node__body" }, ...rows);
}

function renderPorts(node) {
  return node.kind === "Start" || node.kind === "End" ? [] : [inputPortRow(node)];
}

export function renderNodeVisual(node, extraClass = "", style = {}, extraProps = {}, rerender = () => {}) {
  const kind = node.kind || graphKind(node.type);
  const view = { ...node, kind, sourceNode: node, onRender: rerender, allowStructureEdits: !node.type };
  const { onclick, onkeydown, ...props } = extraProps;
  return h("div", {
    class: nodeClasses(`dgs-node ${extraClass}`.trim(), kind),
    style: { width: `${nodeWidth(kind)}px`, ...(kind === "Start" || kind === "End" ? { height: "50px" } : {}), ...style },
    dataset: { nodeId: node.id, nodeKind: kind },
    ...props,
    onclick: (event) => {
      if (event.target.closest?.("button,input,select,textarea,summary,label")) { event.stopPropagation(); return; }
      onclick?.(event);
    },
    onkeydown: (event) => { if (event.target === event.currentTarget) onkeydown?.(event); }
  }, nodeHeader({ ...view, icon: "" }), ...renderPorts(view), nodeBody(view));
}

export function graphKind(type = "") {
  const aliases = { start: "Start", end: "End", dialog: "Dialog", choice: "Choice", action: "Action", condition: "Condition", variable: "VariableMutation", "variable-mutation": "VariableMutation", graphjump: "GraphJump", "graph-jump": "GraphJump", outcome: "Outcome", "camera-switch": "CameraSwitch", "camera-move": "CameraMove", "camera-lookat": "CameraLookAt", "camera-followpoint": "CameraFollowPoint", "camera-followtarget": "CameraFollowTarget", "camera-shake": "CameraShake", "camera-restore": "CameraRestore", random: "RandomBranch", "random-branch": "RandomBranch", switch: "Switch", wait: "Wait", waitfor: "WaitFor", "wait-for": "WaitFor" };
  return aliases[String(type).toLowerCase()] || String(type);
}

export function render(host, kind, ctx) {
  const node = ctx.state.nodes.find((candidate) => candidate.kind === kind);
  if (!node) return false;
  host.append(renderNodeVisual(node, "dgs-node--preview", {}, {}, ctx.rerender));
  return true;
}

export function unavailable(kind) {
  return h("p", { class: "up-component__unavailable", role: "status", text: `Node preview unavailable: “${kind}” is not a supported DGS node kind.` });
}
