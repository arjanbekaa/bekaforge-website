/* Interactive preview entry point.
   Usage:
     preview/index.html?window=dgs
     preview/index.html?window=dgs&surface=node-gallery
     assets/unity-preview/embed.html?window=ai-providers&surface=setup
   Query keys: window, surface, embed. Unknown values fall back safely. */

import { demo, resetDemo } from "./state.js";
import { h, el } from "./controls.js";
import { withSurface } from "./surface-route.js";
import { componentCatalog, resolveComponent, inspectorSurfaceLabels } from "./components/registry.js";

export { componentCatalog, resolveComponent };

const windows = {
  dgs: {
    label: "Dialogue Graph System",
    load: () => import("./surfaces/dgs.js")
  },
  "ai-providers": {
    label: "AI Providers",
    load: () => import("./surfaces/ai-providers.js")
  },
  banter: {
    label: "Banter (DGS)",
    load: () => import("./surfaces/banter.js")
  },
  sound: {
    label: "Sound Sequencer (DGS)",
    load: () => import("./surfaces/sound.js")
  },
  themes: {
    label: "UI Themes (DGS)",
    load: () => import("./surfaces/themes.js")
  },
  inspectors: {
    label: "DGS inspectors",
    load: () => import("./surfaces/inspectors.js")
  },
  "dgs-ai": {
    label: "DGS AI Assistant",
    load: () => import("./surfaces/ai-panel.js")
  },
  "dgs-dialogs": {
    label: "DGS dialogs",
    load: () => import("./surfaces/dgs-dialogs.js")
  }
};

const params = new URLSearchParams(window.location.search);
const componentRequest = params.get("component") || "";
const bodyWindow = document.body.dataset.window;
const defaultWindow = windows[bodyWindow] ? bodyWindow : "dgs";
const requestedWindow = windows[params.get("window")] ? params.get("window") : defaultWindow;
let activeSurface = params.get("surface") || "";
const embed = params.get("embed") === "1" || document.body.dataset.embed === "1";

function navigateSurface(surface, options = {}) {
  activeSurface = surface || "";
  const url = withSurface(window.location.href, activeSurface);
  const method = options.replace === false ? "pushState" : "replaceState";
  window.history[method]({ surface: activeSurface }, "", url);
  render().catch(showRenderError);
}

function showRenderError(error) {
  const root = document.getElementById("up-root") || document.body;
  root.append(
    el("pre", "up-evidence", `The preview could not be rendered safely.\n${error && error.message ? error.message : error}`)
  );
}

function renderToolbar(host, manifest, activeSurface) {
  const select = h(
    "select",
    {
      class: "up-select",
      onchange: (event) => {
        const url = new URL(window.location.href);
        url.searchParams.set("window", event.target.value);
        url.searchParams.delete("surface");
        window.location.href = url.toString();
      }
    },
    ...Object.entries(windows).map(([id, info]) =>
      h("option", { value: id, selected: id === manifest.id }, info.label)
    )
  );

  const surfaceSelect = h(
    "select",
    {
      class: "up-select",
      onchange: (event) => {
        navigateSurface(event.target.value, { replace: false });
      }
    },
    h("option", { value: "", selected: activeSurface === "" }, "Full window"),
    ...manifest.entries.map((entry) => h("option", { value: entry.id, selected: entry.id === activeSurface }, entry.label))
  );

  const reset = h("button", {
    class: "up-button",
    type: "button",
    text: "Reset demo",
    onclick: () => {
      resetDemo();
      render();
    }
  });

  return h(
    "div",
    { class: "up-toolbar" },
    h(
      "div",
      { class: "up-toolbar__brand" },
      "Interactive preview ",
      h("span", { text: `· ${manifest.label}` })
    ),
    h("div", { class: "up-toolbar__group" }, h("label", { text: "Window" }), select),
    h("div", { class: "up-toolbar__group" }, h("label", { text: "Surface" }), surfaceSelect),
    h("div", { class: "up-toolbar__spacer" }),
    h("div", { class: "up-toolbar__group" },
      h("a", { class: "up-button", href: "../index.html", text: "← Docs" }),
      reset
    )
  );
}

function evidenceNote(manifest, activeSurface) {
  const note = activeSurface ? manifest.notes?.[activeSurface] : manifest.note;
  return h(
    "div",
    { class: "up-evidence" },
    h("strong", { text: "Documentation preview. " }),
    note ||
      "Layout, labels, and control values are recreated from the Unity editor source pinned in docs/interactive-unity-preview/2026-10-19-source-inventory.json. " +
        "All names, values, and results are fictitious examples. Nothing here connects to a provider, project, or file on disk."
  );
}

async function render() {
  const root = document.getElementById("up-root") || document.body;
  root.innerHTML = "";
  root.classList.add("bf-theme");

  if (componentRequest) {
    const route = resolveComponent(componentRequest);
    const { kind, id } = route;
    const module = kind === "node" ? await import("./components/node.js") : kind === "inspector" ? await import("./components/inspector.js") : null;
    const label = kind === "node" ? `Node · ${id || ""}` : kind === "inspector" ? inspectorSurfaceLabels[id] || `Inspector · ${id || ""}` : `Component · ${componentRequest}`;
    const content = h("div", { class: "up-component" },
      h("header", { class: "up-component__header" },
        h("div", {}, h("h1", { class: "up-component__title", text: label }), h("p", { class: "up-component__note", text: "Example only; nothing saved." })),
        h("button", { class: "up-button", type: "button", text: "Reset example", onclick: () => { resetDemo(); render(); } })
      ),
      h("div", { class: "up-component__body" })
    );
    const body = content.querySelector(".up-component__body");
    root.append(content);
    const ctx = { state: demo, rerender: render, surface: "" };
    const rendered = route.available && module ? await module.render(body, id, ctx) : false;
    if (!rendered) body.append(route.recognized
      ? h("p", { class: "up-component__unavailable", role: "status", text: `Preview unavailable: “${componentRequest}” is not an exact component route.` })
      : module?.unavailable(id || componentRequest) || h("p", { class: "up-component__unavailable", role: "status", text: `Preview unavailable: “${componentRequest}” is not a supported component.` }));
    return;
  }

  const module = await windows[requestedWindow].load();
  const manifest = {
    id: requestedWindow,
    label: windows[requestedWindow].label,
    entries: module.entries,
    notes: module.notes,
    note: module.note
  };

  const stage = h("div", { class: `up-stage${embed ? " up-stage--embed" : ""}` });
  const shell = embed ? h("div", { class: "up-embed-shell" }, stage) : stage;

  root.append(...(embed ? [] : [renderToolbar(root, manifest, activeSurface)]), shell);
  if (!embed) {
    root.append(evidenceNote(manifest, activeSurface));
  }

  stage.append(document.createTextNode(""));
  const host = h("div", { style: { width: "100%", display: "flex", justifyContent: "center" } });
  stage.append(host);
  await module.render(host, { surface: activeSurface, embed, state: demo, rerender: render, navigateSurface });
}

window.addEventListener("popstate", () => {
  activeSurface = new URL(window.location.href).searchParams.get("surface") || "";
  render().catch(showRenderError);
});

render().catch(showRenderError);
