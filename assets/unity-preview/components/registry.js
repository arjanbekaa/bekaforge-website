export const nodeKinds = [
  "Start", "End", "Dialog", "Choice", "Action", "Condition", "VariableMutation", "GraphJump", "Outcome",
  "CameraSwitch", "CameraMove", "CameraLookAt", "CameraFollowPoint", "CameraFollowTarget", "CameraShake",
  "CameraRestore", "RandomBranch", "Switch", "Wait", "WaitFor"
];

export const inspectorSurfaceLabels = {
  "dialogue-node": "Inspectors · Dialogue Node",
  "variable-definition": "Inspectors · Variable Definition",
  "variable-store": "Inspectors · Dialogue Variable Store",
  "asset-dialog-graph": "Inspectors · Dialog Graph",
  "asset-character": "Inspectors · Dialog Character",
  "asset-text-settings": "Inspectors · Dialog Text Settings",
  "asset-choice-settings": "Inspectors · Dialog Choice Settings",
  "asset-audio-settings": "Inspectors · Dialog Audio Settings",
  "asset-input-settings": "Inspectors · Dialog Input Settings",
  "asset-voice-table": "Inspectors · Dialog Voice Table",
  "asset-delivery-preset": "Inspectors · Dialog Delivery Preset",
  "asset-environment": "Inspectors · Dialog Environment",
  "asset-scene-context": "Inspectors · Dialog Scene Context",
  "asset-localization-table": "Inspectors · Dialog Localization Table",
  "asset-localization-runtime-settings": "Inspectors · Localization Runtime Settings",
  "asset-welcome-branding": "Inspectors · Dialog Welcome Branding",
  "asset-runtime-ui-settings": "Inspectors · Dialogue Runtime UI Settings",
  "asset-category-catalog": "Inspectors · Dialog Graph Category Catalog",
  "camera-manager": "Inspectors · Camera Controller Manager",
  "camera-components": "Inspectors · Camera Rig & Target",
  interactable: "Inspectors · Interactable",
  interactor: "Inspectors · Interactor",
  "dialog-manager": "Inspectors · Dialog Manager"
};

export const inspectorSurfaceIds = Object.keys(inspectorSurfaceLabels);
export const componentCatalog = Object.freeze([
  ...nodeKinds.map((id) => `node:${id}`),
  ...inspectorSurfaceIds.map((id) => `inspector:${id}`)
]);

export function resolveComponent(value) {
  const request = String(value || "");
  const [kind, id] = request.split(":", 2);
  const recognized = kind === "node" ? nodeKinds.includes(id) : kind === "inspector" && inspectorSurfaceIds.includes(id);
  const available = componentCatalog.includes(request);
  return { kind, id, recognized, available };
}
