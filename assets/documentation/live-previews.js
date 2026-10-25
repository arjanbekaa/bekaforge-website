const stylesheet = new URL("live-docs.css", import.meta.url).href;

export function enhanceLivePreviews(root = document) {
  if (!document.querySelector('link[data-live-docs-style]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = stylesheet;
    link.dataset.liveDocsStyle = "";
    document.head.append(link);
  }
  root.querySelectorAll(".preview-embed").forEach((figure, index) => {
    if (figure.dataset.livePreviewReady) return;
    const frame = figure.querySelector("iframe");
    const source = frame?.dataset.previewSrc || frame?.getAttribute("src");
    if (!frame || !source) return;
    figure.dataset.livePreviewReady = "true";
    frame.dataset.previewSrc = source;
    frame.removeAttribute("src");
    frame.hidden = true;
    frame.id ||= `live-example-${index + 1}`;

    const toolbar = document.createElement("div");
    toolbar.className = "live-preview-toolbar";
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.textContent = "Try live example";
    toggle.setAttribute("aria-controls", frame.id);
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", `Try live example: ${frame.title}`);
    const reset = document.createElement("button");
    reset.type = "button";
    reset.textContent = "Reset example";
    reset.hidden = true;
    const status = document.createElement("span");
    status.className = "live-preview-status";
    status.setAttribute("role", "status");
    status.textContent = "Edit sample values. Nothing is saved.";
    toolbar.append(toggle, reset, status);
    figure.prepend(toolbar);

    let observer;
    let mutations;
    let loadingTimer;
    const load = () => {
      observer?.disconnect();
      mutations?.disconnect();
      clearTimeout(loadingTimer);
      reset.disabled = true;
      status.textContent = "Loading example…";
      frame.src = source;
      loadingTimer = setTimeout(() => {
        status.textContent = "Taking longer than expected. Use the preview link below to open it separately.";
      }, 12000);
    };
    toggle.addEventListener("click", () => {
      const open = frame.hidden;
      frame.hidden = !open;
      reset.hidden = !open;
      toggle.textContent = open ? "Close example" : "Try live example";
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", `${open ? "Close" : "Try live"} example: ${frame.title}`);
      if (open) load();
      else {
        observer?.disconnect();
        mutations?.disconnect();
        clearTimeout(loadingTimer);
        frame.removeAttribute("src");
        status.textContent = "Example closed. Reopen to start fresh.";
      }
    });
    reset.addEventListener("click", load);
    frame.addEventListener("load", () => {
      if (frame.hidden || !frame.getAttribute("src")) return;
      clearTimeout(loadingTimer);
      reset.disabled = false;
      status.textContent = "Live example · changes stay in this example.";
      try {
        const content = frame.contentDocument;
        let component;
        const fit = () => {
          const current = content?.querySelector(".up-component");
          if (!current) return;
          if (current !== component) {
            observer?.disconnect();
            component = current;
            if (typeof ResizeObserver === "function") {
              observer = new ResizeObserver(fit);
              observer.observe(component);
            }
          }
          frame.style.height = `${Math.min(1000, Math.max(180, Math.ceil(component.scrollHeight) + 8))}px`;
        };
        fit();
        // Focused modules finish rendering after the iframe load event and replace their root on edits.
        if (content?.body && typeof MutationObserver === "function") {
          mutations = new MutationObserver(fit);
          mutations.observe(content.body, { childList: true, subtree: true });
        }
      } catch {
        status.textContent = "Open the preview separately if your browser blocks this embedded example.";
      }
    });
    frame.addEventListener("error", () => {
      clearTimeout(loadingTimer);
      status.textContent = "The example could not load. Use the preview link below.";
    });
  });
}
