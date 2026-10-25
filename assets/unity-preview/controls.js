/* Shared browser controls used by every reproduced Unity surface.
   These are plain DOM builders; no framework and no build step. */

let controlSeq = 0;

function bindOverlay(overlay, initialFocus) {
  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      overlay.remove();
      document.removeEventListener("keydown", onKeyDown, true);
    }
  };
  document.addEventListener("keydown", onKeyDown, true);
  const target = initialFocus || overlay.querySelector("button, input, select, textarea, a[href]");
  if (target && typeof target.focus === "function") target.focus();
  return overlay;
}

export { bindOverlay };

export function h(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props || {})) {
    if (value === undefined || value === null || value === false) continue;
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key === "html") node.innerHTML = value;
    else if (key === "style" && typeof value === "object") Object.assign(node.style, value);
    else if (key === "dataset" && typeof value === "object") Object.assign(node.dataset, value);
    else if (key.startsWith("on") && typeof value === "function") {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (value === true) node.setAttribute(key, "");
    else node.setAttribute(key, String(value));
  }
  append(node, children);
  return node;
}

export function append(parent, children) {
  for (const child of children.flat(Infinity)) {
    if (child === undefined || child === null || child === false) continue;
    parent.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return parent;
}

export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function card(title, ...children) {
  return h("div", { class: "bf-card" }, title ? h("div", { class: "bf-card__title", text: title }) : null, ...children);
}

export function field(label, control, options = {}) {
  const controlWrap = h("div", { class: "bf-field__control" }, control);
  const labelled = control && typeof control.tagName === "string" && /^(INPUT|SELECT|TEXTAREA)$/.test(control.tagName);
  const id = labelled ? control.id || `bf-field-${++controlSeq}` : null;
  if (id) control.id = id;
  return h(
    "div",
    { class: `bf-field${options.stacked ? " bf-field--stacked" : ""}` },
    label ? h("label", { class: "bf-field__label", for: id || undefined, title: options.tooltip || "" }, label) : null,
    controlWrap,
    options.after || null
  );
}

export function helper(text) {
  return h("div", { class: "bf-helper", text });
}

export function checkbox(label, checked, onChange, options = {}) {
  const input = h("input", {
    class: "bf-check",
    type: "checkbox",
    checked: !!checked,
    disabled: !!options.disabled,
    "aria-label": options.ariaLabel || undefined,
    onchange: (event) => onChange?.(event.target.checked)
  });
  return h(
    "label",
    { class: "bf-check-row", title: options.tooltip || "" },
    input,
    h("span", { text: label })
  );
}

export function toggleRow(label, checked, onChange, options = {}) {
  return field(label, checkbox("", checked, onChange, { ...options, ariaLabel: options.ariaLabel || label }), { tooltip: options.tooltip });
}

export function textInput(value, onChange, options = {}) {
  return h("input", {
    class: `bf-input${options.number ? " bf-input--number" : ""}`,
    type: options.password ? "password" : options.number ? "number" : "text",
    value: value ?? "",
    placeholder: options.placeholder || "",
    min: options.min,
    max: options.max,
    step: options.step,
    disabled: !!options.disabled,
    oninput: (event) => onChange?.(options.number ? Number(event.target.value) : event.target.value)
  });
}

export function textArea(value, onChange, options = {}) {
  return h("textarea", {
    class: "bf-textarea",
    placeholder: options.placeholder || "",
    rows: options.rows || 4,
    disabled: !!options.disabled,
    style: options.height ? { height: `${options.height}px` } : undefined,
    oninput: (event) => onChange?.(event.target.value)
  }, value ?? "");
}

export function textRow(label, value, onChange, options = {}) {
  return field(label, textInput(value, onChange, options), { tooltip: options.tooltip });
}

export function multilineRow(label, value, onChange, options = {}) {
  return field(label, textArea(value, onChange, options), { tooltip: options.tooltip, stacked: options.stacked });
}

export function enumRow(label, value, options, onChange, settings = {}) {
  const select = h(
    "select",
    {
      class: "bf-select",
      disabled: !!settings.disabled,
      onchange: (event) => onChange?.(event.target.value)
    },
    ...options.map((option) =>
      h("option", { value: option.value ?? option, selected: (option.value ?? option) === value }, option.label ?? option)
    )
  );
  return field(label, select, { tooltip: settings.tooltip });
}

export function sliderRow(label, value, min, max, step, onChange, settings = {}) {
  const readout = h("span", { class: "bf-pill", text: settings.format ? settings.format(value) : String(value) });
  const id = `bf-slider-${++controlSeq}`;
  const input = h("input", {
    class: "bf-slider",
    id,
    type: "range",
    min,
    max,
    step,
    value,
    disabled: !!settings.disabled,
    oninput: (event) => {
      const next = Number(event.target.value);
      readout.textContent = settings.format ? settings.format(next) : String(next);
      onChange?.(next);
    }
  });
  const body = h(
    "div",
    { class: "bf-slider-field" },
    h(
      "div",
      { class: "bf-slider-field__header" },
      h("label", { class: "bf-slider-field__label", for: id, text: label }),
      settings.unit ? h("span", { class: "bf-slider-field__unit", text: settings.unit }) : null
    ),
    h("div", { class: "bf-slider-field__row" }, input, readout),
    settings.rangeText ? h("div", { class: "bf-range-helper", text: settings.rangeText }) : null,
    settings.recommended ? h("div", { class: "bf-recommendation", text: settings.recommended }) : null,
    settings.help ? h("div", { class: "bf-helper", text: settings.help }) : null
  );
  return body;
}

export function numberRow(label, value, min, recommended, onChange, settings = {}) {
  const input = textInput(value, onChange, { number: true, min });
  input.setAttribute("aria-label", label);
  return h(
    "div",
    { class: "bf-field" },
    h("label", { class: "bf-field__label", text: label, title: settings.tooltip || "" }),
    h(
      "div",
      { class: "bf-field__control" },
      input,
      settings.unit ? h("span", { class: "bf-range-helper", text: settings.unit }) : null,
      recommended !== undefined && recommended !== null
        ? h("span", { class: "bf-range-helper", text: `Recommended: ${recommended}${settings.unit ? ` ${settings.unit}` : ""}` })
        : null
    )
  );
}

export function objectRow(label, value, options, onChange, settings = {}) {
  const select = h(
    "select",
    {
      class: "bf-select",
      disabled: !!settings.disabled,
      onchange: (event) => onChange?.(event.target.value === "" ? null : event.target.value)
    },
    ...options.map((option) =>
      h("option", { value: option.value ?? "", selected: (option.value ?? "") === (value ?? "") }, option.label ?? option)
    )
  );
  return field(label, select, { tooltip: settings.tooltip });
}

export function colorRow(label, value, onChange, settings = {}) {
  return field(
    label,
    h(
      "div",
      { class: "bf-field__control" },
      h("span", { class: "bf-swatch", style: { background: value } }),
      textInput(value, onChange, { placeholder: "#RRGGBB" })
    ),
    { tooltip: settings.tooltip }
  );
}

export function keyCaptureRow(label, value, onChange, settings = {}) {
  let capturing = false;
  const button = h("button", { class: "bf-button", type: "button", text: value || "Unbound" });
  const finish = (next) => {
    capturing = false;
    button.textContent = next || "Unbound";
    onChange?.(next);
    document.removeEventListener("keydown", onKeyDown, true);
  };
  const onKeyDown = (event) => {
    if (!capturing) return;
    event.preventDefault();
    event.stopPropagation();
    finish(event.key === "Escape" ? value : event.key === " " ? "Space" : event.key);
  };
  button.addEventListener("click", () => {
    capturing = true;
    button.textContent = "Press a key...";
    document.addEventListener("keydown", onKeyDown, true);
  });
  return h(
    "div",
    null,
    h(
      "div",
      { class: "bf-field" },
      h("label", { class: "bf-field__label", text: label, title: settings.tooltip || "" }),
      h(
        "div",
        { class: "bf-field__control" },
        button,
        settings.note ? h("span", { class: "bf-range-helper", text: settings.note }) : null
      )
    ),
    settings.help ? h("div", { class: "bf-helper", text: settings.help }) : null
  );
}

export function foldout(title, content, open = false, options = {}) {
  const body = h("div", { class: "bf-foldout__body", style: open ? undefined : { display: "none" } }, content);
  const arrow = h("span", { class: "bf-foldout__arrow", text: open ? "▾" : "▸" });
  const header = h(
    "button",
    {
      class: "bf-foldout__header",
      type: "button",
      onclick: () => {
        const next = body.style.display === "none";
        body.style.display = next ? "" : "none";
        arrow.textContent = next ? "▾" : "▸";
        options.onToggle?.(next);
      }
    },
    arrow,
    title,
    options.note ? h("span", { class: "bf-range-helper", style: { marginLeft: "auto" }, text: options.note }) : null
  );
  return h("div", { class: "bf-foldout" }, header, body);
}

export function tabs(labels, active, onSelect, options = {}) {
  const bar = h("div", { class: `bf-tabs${options.className ? ` ${options.className}` : ""}`, role: "tablist" });
  for (const item of labels) {
    const id = typeof item === "string" ? item : item.id;
    const label = typeof item === "string" ? item : item.label;
    bar.append(
      h("button", {
        class: "bf-tab",
        type: "button",
        role: "tab",
        "aria-selected": id === active ? "true" : "false",
        onclick: () => onSelect?.(id),
        text: label
      })
    );
  }
  return bar;
}

export function sectionTitle(text) {
  return h("div", { class: "bf-section-title", text });
}

export function badge(text, tone = "") {
  return h("span", { class: `bf-badge${tone ? ` bf-badge--${tone}` : ""}`, text });
}

export function windowFrame(options) {
  const { title, hint, body, footer, className = "", tabsBar, toolbar } = options;
  return h(
    "div",
    { class: `up-window ${className}`.trim() },
    title ? h("div", { class: "up-window__titlebar" }, h("span", { text: title }), hint ? h("span", { class: "up-window__titlebar-hint", text: hint }) : null) : null,
    tabsBar || null,
    toolbar || null,
    h("div", { class: "up-window__body" }, body),
    footer || null
  );
}

export function statusBar(message, actions, options = {}) {
  return h(
    "div",
    { class: "bf-status-bar" },
    h("span", { text: message }),
    h("span", { class: "bf-status-bar__spacer" }),
    ...(actions || []),
    options.right || null
  );
}

export function messageBox(title, message, buttons) {
  const fallback = h("button", {
    class: "bf-button",
    type: "button",
    text: "OK",
    onclick: () => overlay.remove()
  });
  const overlay = h(
    "div",
    { class: "up-overlay" },
    h(
      "div",
      { class: "up-window up-window--popup up-message", role: "dialog", "aria-modal": "true", "aria-label": title },
      h("div", { class: "up-window__titlebar" }, h("span", { text: title })),
      h("div", { class: "up-message__body", text: message }),
      h("div", { class: "up-message__footer" }, ...(buttons || [fallback]))
    )
  );
  queueMicrotask(() => bindOverlay(overlay));
  return overlay;
}

export function toastOn(host, title, message) {
  const toast = h(
    "div",
    { class: "up-overlay" },
    h(
      "div",
      { class: "up-window up-window--popup up-message", role: "dialog", "aria-modal": "true", "aria-label": title },
      h("div", { class: "up-window__titlebar" }, h("span", { text: title })),
      h("div", { class: "up-message__body", text: message }),
      h(
        "div",
        { class: "up-message__footer" },
        h("button", {
          class: "bf-button bf-button--primary",
          type: "button",
          text: "OK",
          onclick: () => toast.remove()
        })
      )
    )
  );
  host.append(toast);
  queueMicrotask(() => bindOverlay(toast));
  return toast;
}
