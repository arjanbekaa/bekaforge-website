import { h } from "../controls.js";
import { inspectorViews, renderInspectorSurface } from "../surfaces/inspectors.js";
import { inspectorSurfaceIds } from "./registry.js";

export { inspectorViews };
export { inspectorSurfaceIds };

export function render(host, surface, ctx) {
  if (!inspectorViews[surface]) return false;
  renderInspectorSurface(host, ctx, surface);
  return true;
}

export function unavailable(surface) {
  return h("p", { class: "up-component__unavailable", role: "status", text: `Inspector preview unavailable: “${surface}” is not a supported inspector surface.` });
}
