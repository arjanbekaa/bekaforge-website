/* Graph editor canvas and node gallery.
   Node types follow Runtime/Models/NodeKind.cs; accents follow USS/NodeTypes.uss.
   The same component renderer powers the gallery, graph canvas, and standalone previews. */

import { h, card, helper, badge, sectionTitle } from "../controls.js";
import { renderNodeVisual, nodeWidth, graphKind, nodePreviewRows } from "../components/node.js";

export { renderNodeVisual, nodeWidth, graphKind, nodePreviewRows };

const familyLabels = {
  core: "Core",
  camera: "Camera",
  feature: "Flow"
};
export function renderNodeGallery(ctx) {
  const { state, rerender } = ctx;
  const gallery = h(
    "div",
    { class: "dgs-gallery" },
    ...state.nodes.map((node) =>
      h(
        "div",
        {
          class: `dgs-gallery-card${state.dgs.selectedNodeId === node.id ? " dgs-gallery-card--selected" : ""}`,
          role: "button",
          tabindex: "0",
          onclick: () => {
            state.dgs.selectedNodeId = node.id;
            rerender();
          },
          onkeydown: (event) => { if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); state.dgs.selectedNodeId = node.id; rerender(); } }
        },
        renderNodeVisual(node, "dgs-gallery-card__node", { width: `${nodeWidth(node.kind)}px` }, {}, rerender),
        h("div", { class: "dgs-gallery-card__meta" }, h("span", { class: "dgs-gallery-card__name", text: node.kind }), h("span", { class: "dgs-gallery-card__family", text: familyLabels[node.family] || node.family }))
      )
    )
  );

  const selected = state.nodes.find((node) => node.id === state.dgs.selectedNodeId) || state.nodes[0];
  const detail = card(
    `${selected.kind} node`,
    h("div", { class: "dgs-gallery-preview" },
      renderNodeVisual(selected, "dgs-node--preview", { width: `${nodeWidth(selected.kind)}px` }, {}, rerender)
    ),
    h("div", { class: "bf-divider" }),
    sectionTitle("Ports"),
    h(
      "div",
      { class: "bf-row", style: { flexWrap: "wrap" } },
      ...selected.portsIn.map((port) => badge(`In · ${port}`)),
      ...selected.portsOut.map((port) => badge(`Out · ${port}`))
    ),
    h("div", { class: "bf-helper", style: { marginTop: "8px" }, text: "Node fields are local to this preview. Port connections are read-only." })
  );

  return h(
    "div",
    { class: "dgs-graph-layout" },
    h("div", { class: "dgs-graph-main" }, h("div", { class: "dgs-panel" }, h("div", { class: "dgs-page-header" }, h("div", { class: "dgs-page-header__title", text: "Node gallery" }), h("div", { class: "dgs-page-header__subtitle", text: "Every node type available in the DGS 4.0 graph editor, with its type accent." })), gallery)),
    h("div", { class: "dgs-inspector" }, detail)
  );
}

function drawGraphEdges(canvas, svg, edges) {
  if (!canvas.isConnected) return;
  svg.replaceChildren();
  const nodes = new Map([...canvas.querySelectorAll("[data-node-id]")].map((node) => [node.dataset.nodeId, node]));
  const anchor = (node, id) => [...node.querySelectorAll("[data-port-id]")].find((port) => port.dataset.portId === id);
  const rootRect = canvas.getBoundingClientRect();
  for (const edge of edges) {
    const from = nodes.get(edge.from), to = nodes.get(edge.to);
    const source = from && anchor(from, edge.sourcePort), target = to && anchor(to, edge.targetPort);
    if (!source || !target || !canvas.isConnected) continue;
    const a = source.getBoundingClientRect(), b = target.getBoundingClientRect();
    const x1 = a.left + a.width / 2 - rootRect.left, y1 = a.top + a.height / 2 - rootRect.top;
    const x2 = b.left + b.width / 2 - rootRect.left, y2 = b.top + b.height / 2 - rootRect.top;
    const bend = Math.max(32, Math.abs(x2 - x1) * 0.45);
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", `M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`);
    path.setAttribute("class", "dgs-edge");
    svg.append(path);
    if (edge.label) {
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", String((x1 + x2) / 2)); label.setAttribute("y", String((y1 + y2) / 2 - 6)); label.setAttribute("class", "dgs-edge__label"); label.textContent = edge.label; svg.append(label);
    }
  }
}

export function renderGraphEditor(ctx) {
  const { state, rerender } = ctx;
  const graph = state.exampleGraph;
  const canvas = h("div", { class: "dgs-canvas bf-theme--graph", style: { width: "2000px", height: "1800px" } });
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "dgs-canvas__edges");
  canvas.append(svg);
  svg.setAttribute("width", "2000");
  svg.setAttribute("height", "1800");
  for (const node of graph.nodes) {
    const kind = graphKind(node.type);
    const isSelected = state.dgs.selectedNodeId === node.id;
    const selectNode = () => { state.dgs.selectedNodeId = node.id; rerender(); };
    const element = renderNodeVisual(node, `dgs-node--canvas${isSelected ? " dgs-node--selected" : ""}`, {
        left: `${node.x}px`, top: `${node.y}px`, position: "absolute"
      }, {
        role: "button",
        tabindex: "0",
        "aria-label": `${node.title} node`,
        onclick: selectNode,
        onkeydown: (event) => {
          if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
            event.preventDefault();
            selectNode();
          }
        }
      }, rerender);
    canvas.append(element);
  }

  const selectedCanvasNode = graph.nodes.find((n) => n.id === state.dgs.selectedNodeId);
  const selectedKind = selectedCanvasNode ? graphKind(selectedCanvasNode.type) : "Dialog";
  const sidebarVisible = state.dgs.graphSidebarVisible !== false;
  const graphToolbar = h(
    "div",
    { class: "dgs-toolbar" },
    h("span", { class: "dgs-toolbar__graph-name", text: `${graph.title} · fixed sample` }),
    h("button", { class: "bf-button bf-button--primary", type: "button", text: "Save", disabled: true, title: "This fixed example cannot be saved" }),
    h("button", { class: "bf-button", type: "button", text: "Format Layout", disabled: true, title: "Layout is fixed in this preview" }),
    h("button", {
      class: "bf-button",
      type: "button",
      text: sidebarVisible ? "Hide Sidebar" : "Show Sidebar",
      title: "Show or hide the graph sidebar",
      onclick: () => {
        state.dgs.graphSidebarVisible = !sidebarVisible;
        rerender();
      }
    })
  );

  const layout = h(
    "div",
    { class: "bf-col", style: { flex: "1 1 auto", minHeight: "0" } },
    h("div", { class: "dgs-graph-tabs" }, h("div", { class: "dgs-graph-tab dgs-graph-tab--active", text: `${graph.title} · Preview` })),
    graphToolbar,
    h(
      "div",
      { class: `dgs-graph-layout dgs-graph-layout--canvas${sidebarVisible ? "" : " dgs-graph-layout--sidebar-hidden"}` },
      h("div", { class: "dgs-graph-canvas-wrap up-scroll" }, canvas),
      h(
        "div",
        { class: "dgs-inspector" },
        card(
          selectedCanvasNode ? `${selectedCanvasNode.title} · ${selectedKind}` : "Node inspector",
          selectedCanvasNode ? helper("Selected canvas instance. Field edits stay with this node in memory.") : helper("Select a node to inspect it."),
          selectedCanvasNode ? renderNodeVisual(selectedCanvasNode, "dgs-node--preview", { width: `${nodeWidth(selectedKind)}px` }, {}, rerender) : null
        )
      )
    )
  );
  const updateGeometry = () => {
    if (!canvas.isConnected) return;
    const nodes = [...canvas.querySelectorAll(".dgs-node--canvas")];
    const width = Math.max(2000, ...nodes.map((node) => node.offsetLeft + node.offsetWidth + 60));
    const height = Math.max(1800, ...nodes.map((node) => node.offsetTop + node.offsetHeight + 60));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    svg.setAttribute("width", String(width));
    svg.setAttribute("height", String(height));
    drawGraphEdges(canvas, svg, graph.edges);
  };
  const scheduleGeometry = () => { if (typeof requestAnimationFrame === "function") requestAnimationFrame(updateGeometry); };
  canvas.addEventListener("toggle", scheduleGeometry, true);
  canvas.addEventListener("change", scheduleGeometry);
  scheduleGeometry();
  return layout;
}
