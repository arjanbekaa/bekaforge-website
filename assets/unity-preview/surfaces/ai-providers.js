/* AI Providers settings window.
   Sections, labels, and helper text follow Editor/AiProvidersSettingsPanel.cs,
   AiProfilePicker.cs, and AiLocalConnectionPanel.cs. No network calls, no
   credentials, no model listing; every action shows an example result only. */

import {
  h, card, field, helper, badge, textRow, textInput, textArea, toggleRow, enumRow, sliderRow,
  numberRow, objectRow, sectionTitle, foldout, windowFrame, statusBar, toastOn, messageBox, bindOverlay
} from "../controls.js";

export const entries = [
  { id: "setup", label: "Setup" },
  { id: "profiles", label: "Profiles" },
  { id: "prompt-defaults", label: "Prompt defaults" },
  { id: "about", label: "About" },
  { id: "profile-duplicate", label: "Profiles · Duplicate AI profile" }
];

export const note =
  "Recreated from the AI Providers editor panel and the 4.0 screenshots. Provider profiles, model lists, and connection results are fictitious examples. " +
  "This page never stores credentials, never contacts a provider or local tool, and never runs CLI commands.";

const templates = [
  { group: "Subscription connections · Editor only", items: [
    { id: "Codex", label: "Codex", description: "ChatGPT subscription through the installed Codex CLI." },
    { id: "ClaudeCode", label: "Claude Code", description: "Claude subscription through the installed Claude Code tool." }
  ] },
  { group: "API and local providers", items: [
    { id: "OpenAI", label: "OpenAI", description: "OpenAI API with standard chat-completions defaults." },
    { id: "OpenAICompatible", label: "OpenAI Compatible", description: "Any service that implements an OpenAI-compatible endpoint." },
    { id: "DeepSeek", label: "DeepSeek", description: "DeepSeek API with its recommended endpoint defaults." },
    { id: "Gemini", label: "Gemini", description: "Google Gemini API using native structured-output support." },
    { id: "Ollama", label: "Ollama", description: "Locally hosted Ollama models over HTTP." },
    { id: "Custom", label: "Custom JSON", description: "Custom URL, request body, and response text path." }
  ] }
];

function bindDialog(overlay, initialFocus) {
  queueMicrotask(() => {
    if (typeof document.addEventListener !== "function") return;
    bindOverlay(overlay, initialFocus);
  });
}

function commitTextRow(label, value, onChange, options = {}) {
  let last = value;
  const commit = (raw) => {
    const next = options.number ? Number(raw) : raw;
    if (options.number && !Number.isFinite(next)) return;
    if (next === last) return;
    last = next;
    onChange?.(next);
  };
  const input = h("input", {
    class: `bf-input${options.number ? " bf-input--number" : ""}`,
    type: options.password ? "password" : options.number ? "number" : "text",
    value: value ?? "",
    placeholder: options.placeholder || "",
    min: options.min,
    max: options.max,
    step: options.step,
    onchange: (event) => commit(event.target.value),
    onblur: (event) => commit(event.target.value)
  });
  return field(label, input, { tooltip: options.tooltip });
}

function addProfile(ctx, templateId, name) {
  const s = ctx.state.aiProviders;
  const template = templates.flatMap((group) => group.items).find((item) => item.id === templateId) || templates[1].items[0];
  const subscription = template.id === "Codex" || template.id === "ClaudeCode";
  s.nextProfileSeq = (s.nextProfileSeq || 0) + 1;
  const profile = {
    id: `${template.id.toLowerCase()}-new-${s.nextProfileSeq}`,
    template: template.id,
    name: (name || "").trim() || template.label,
    transport: subscription ? "Subscription" : "API",
    description: template.description,
    path: subscription ? "" : `Assets/Beka Forge/AI Providers/ProviderAssets/${({ OpenAICompatible: "OpenAICompatible", Custom: "CustomJson" }[template.id] || template.id)}Provider.asset`,
    status: "NeedsTest",
    tags: subscription ? ["Subscription", "Editor only"] : ["API", "NeedsTest"],
    apiKey: "",
    supported: []
  };
  if (!subscription) {
    const defaults = {
      OpenAI: { baseUrl: "https://api.openai.com", endpoint: "/v1/chat/completions", model: "gpt-4.1-mini" },
      OpenAICompatible: { baseUrl: "", endpoint: "/v1/chat/completions", model: "" },
      DeepSeek: { baseUrl: "https://api.deepseek.com", endpoint: "/chat/completions", model: "deepseek-chat" },
      Gemini: { baseUrl: "https://generativelanguage.googleapis.com", endpoint: "", model: "gemini-2.5-flash" },
      Ollama: { baseUrl: "http://localhost:11434", endpoint: "/api/chat", model: "gpt-oss:20b" },
      Custom: { baseUrl: "", endpoint: "/v1/chat", model: "" }
    }[template.id];
    profile.baseUrl = defaults.baseUrl;
    if (defaults.endpoint) profile.endpoint = defaults.endpoint;
    profile.model = defaults.model;
    if (template.id === "Custom") {
      profile.customFields = {
        httpMethod: "POST",
        bodyTemplate: "{ \"model\": \"{MODEL}\", \"messages\": {MESSAGES_JSON}, \"temperature\": {TEMPERATURE}, \"max_tokens\": {MAX_TOKENS} }",
        responseTextPath: "",
        openAiCompatibleResponse: false
      };
    }
  }
  s.profiles.push(profile);
  s.selectedProfile = profile.id;
  ctx.rerender();
  return profile;
}

function profileSection(ctx, anchor) {
  const s = ctx.state.aiProviders;
  const refresh = () => ctx.rerender();

  const picker = card(
    null,
    sectionTitle("Profiles"),
    h(
      "div",
      { class: "bf-row", style: { marginBottom: "10px" } },
      h("button", { class: "bf-button", type: "button", text: "+  Add profile…", title: "Create a named API or subscription profile.", onclick: (event) => openAddProfile(event.currentTarget, ctx) }),
      h("button", {
        class: "bf-button",
        type: "button",
        text: "⧉  Duplicate…",
        title: "Copy this profile's configuration without credentials or test history.",
        disabled: s.profiles.find((profile) => profile.id === s.selectedProfile)?.template === "Codex",
        onclick: (event) => {
          const windowEl = event.currentTarget.closest(".up-window") || document.body;
          windowEl.append(duplicateProfileWindow(ctx, windowEl, false));
        }
      }),
      h("button", {
        class: "bf-button bf-button--danger",
        type: "button",
        text: "−  Remove profile",
        title: "Remove only the selected profile asset and its local profile data.",
        onclick: () => {
          if (s.profiles.length <= 1) {
            toastOn(document.body, "Profiles", "A project needs at least one profile. Demo only.");
            return;
          }
          const index = Math.max(0, s.profiles.findIndex((profile) => profile.id === s.selectedProfile));
          s.profiles.splice(index, 1);
          s.selectedProfile = s.profiles[Math.min(index, s.profiles.length - 1)].id;
          ctx.rerender();
          toastOn(document.body, "Profiles", "Removed the selected profile from this demo. No asset was deleted.");
        }
      })
    ),
    h(
      "div",
      { class: "ai-profile-list" },
      ...s.profiles.map((profile) =>
        h(
          "button",
          {
            class: `ai-profile-card${s.selectedProfile === profile.id ? " ai-profile-card--selected" : ""}`,
            type: "button",
            title: `Select ${profile.name}`,
            onclick: () => {
              s.selectedProfile = profile.id;
              refresh();
            }
          },
          h("div", { class: "ai-profile-card__name", text: profile.name }),
          h("div", { class: "ai-profile-card__path", text: profile.path || "Local subscription connection · no asset" }),
          h(
            "div",
            { class: "ai-profile-card__chips" },
            h("span", { class: "bf-chip ai-provider-chip--subscription", text: profile.transport }),
            h("span", { class: `bf-chip${profile.status.startsWith("Ready") ? " ai-provider-chip--success" : " ai-provider-chip--warning"}`, text: profile.status })
          ),
          profile.transport === "Subscription"
            ? h("div", { class: "ai-profile-card__action", text: profile.status.startsWith("Ready") ? `Login / manage ${profile.template === "Codex" ? "Codex" : "Claude"}` : `Connect ${profile.template === "Codex" ? "Codex" : "Claude Code"}` })
            : null
        )
      )
    )
  );

  const selected = s.profiles.find((profile) => profile.id === s.selectedProfile) || s.profiles[0];
  const detail = selected.transport === "Subscription" ? subscriptionCard(ctx, selected) : httpProviderCard(ctx, selected);

  return h("div", { id: anchor }, picker, detail);
}

function subscriptionCard(ctx, profile) {
  const s = ctx.state.aiProviders;
  const tool = s.localTool;
  s.requestTimeout ??= 30;

  return card(
    profile.name,
    textRow("Display Name", profile.name, (value) => { profile.name = value; }),
    field("Local connection", helper("Requests are editor-only and API-key fallback is disabled. Connecting or disconnecting changes the shared tool account for every profile and other apps.")),
    h("div", { class: `bf-helper ${tool.status.startsWith("Status not checked") ? "" : "bf-success-text"}`.trim(), text: tool.status }),
    field("Detected executable", helper(tool.installation)),
    field("Authentication", helper(tool.authentication)),
    field("Subscription", helper(tool.subscription)),
    field("Billing mode", helper(tool.billingMode)),
    foldout("Advanced executable override", textInput(tool.executable, (value) => { tool.executable = value; }, { placeholder: "Optional absolute path to the local tool executable" })),
    h(
      "div",
      { class: "bf-row" },
      h("button", { class: "bf-button", type: "button", text: "↻ Refresh status", title: "Check the installed tool, sign-in state, billing mode, and available models.", onclick: () => fakeToolStatus(ctx) }),
      h("button", { class: "bf-button", type: "button", text: "↗ Connect subscription", title: "Start the official sign-in flow for the local tool.", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "AI Providers", "Connect subscription would start the official sign-in flow for the local tool. Nothing is launched in this preview.") })
    ),
    commitTextRow("Request timeout (seconds)", s.requestTimeout ?? 30, (value) => {
      s.requestTimeout = Math.max(1, value);
    }, { number: true, min: 1 }),
    helper(profile.template === "Codex" ? "Refresh status to load the models available to the connected Codex account. You can also enter a model explicitly." : "Refresh status after connecting to load available models."),
    textRow("Model", profile.model || "", (value) => { profile.model = value; }),
    h(
      "div",
      { class: "bf-row" },
      h("button", { class: "bf-button", type: "button", text: "✓  Test connection", onclick: () => fakeTest(ctx, profile) }),
      h("button", { class: "bf-button bf-button--primary", type: "button", text: "Save profile", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "AI Providers", "Save profile would write the shared provider asset. Demo only.") })
    ),
    helper("Model listing and connection tests are not performed in this preview.")
  );
}

function httpProviderCard(ctx, profile) {
  const s = ctx.state.aiProviders;
  const isCustom = profile.template === "Custom";
  const hasModels = profile.id === "openai-profile" && !profile.manualModelEntry;
  const supportsCapabilities = profile.supported || [];
  profile.manualModelEntry ??= false;
  const custom = (profile.customFields ??= {
    httpMethod: "POST",
    bodyTemplate: "{ \"model\": \"{MODEL}\", \"messages\": {MESSAGES_JSON}, \"temperature\": {TEMPERATURE}, \"max_tokens\": {MAX_TOKENS} }",
    responseTextPath: "",
    openAiCompatibleResponse: false
  });

  const modelField = hasModels
    ? h(
        "div",
        null,
        enumRow("Model", profile.model, [
          { value: "gpt-4.1-mini", label: "gpt-4.1-mini" },
          { value: "gpt-4.1", label: "gpt-4.1" },
          { value: "gpt-4o-mini", label: "gpt-4o-mini" }
        ].map((option) => ({ value: option.value, label: option.label })), (value) => { profile.model = value; }),
        h("div", { class: "bf-row", style: { justifyContent: "flex-end" } },
          h("button", {
            class: "bf-button",
            type: "button",
            text: "Edit Manually",
            onclick: () => {
              profile.manualModelEntry = true;
              ctx.rerender();
              toastOn(document.body, "AI Providers", "Manual editing opens the provider editor in the desktop app. Demo only.");
            }
          })
        )
      )
    : h(
        "div",
        { class: "bf-row" },
        textInput(profile.model, (value) => { profile.model = value; }),
        h("button", { class: "bf-button", type: "button", text: "Fetch Models", title: "Load available model ids directly from the provider.", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "AI Providers", "Fetch Models would ask the provider for its model list. No request is sent from this preview.") })
      );

  return card(
    profile.name,
    textRow("Display Name", profile.name, (value) => { profile.name = value; }),
    textRow("Base URL", profile.baseUrl || "", (value) => { profile.baseUrl = value; }),
    profile.endpoint !== undefined ? textRow("Endpoint", profile.endpoint, (value) => { profile.endpoint = value; }) : null,
    modelField,
    isCustom
      ? h(
          "div",
          null,
          commitTextRow("HTTP Method", custom.httpMethod, (value) => { custom.httpMethod = value; }),
          field("Body Template", textArea(custom.bodyTemplate, (value) => { custom.bodyTemplate = value; }, { rows: 5, placeholder: "JSON body template" }), { tooltip: "Template placeholders: {PROMPT}, {MODEL}, {TEMPERATURE}, {MAX_TOKENS}, {STREAM}, {SYSTEM}, {USER}, {MESSAGES_JSON}." }),
          commitTextRow("Response Text Path", custom.responseTextPath, (value) => { custom.responseTextPath = value; }),
          toggleRow("OpenAI Compatible Response", custom.openAiCompatibleResponse, (value) => { custom.openAiCompatibleResponse = value; })
        )
      : null,
    helper("Shared configuration is stored in the provider asset. API keys are stored locally in protected OS-backed credential storage (available on this platform) and never written to the provider asset."),
    textRow("API Key", profile.apiKey || "", (value) => { profile.apiKey = value; }, { password: true, placeholder: "sk-example" }),
    supportsCapabilities.length ? helper(`Supported: ${supportsCapabilities.join(", ")}`) : null,
    h(
      "div",
      { class: "bf-row" },
      h("button", { class: "bf-button", type: "button", text: "✓  Test connection", onclick: () => fakeTest(ctx, profile) }),
      h("button", { class: "bf-button", type: "button", text: "⌁  Check network", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "AI Providers", "Check network would run a local reachability check. No request is sent from this preview.") }),
      h("button", { class: "bf-button", type: "button", text: "★  Use as default", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "AI Providers", "Use as default would assign this profile as the extension default provider. Demo only.") }),
      h("button", { class: "bf-button bf-button--primary", type: "button", text: "Save profile", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "AI Providers", "Save profile would write the shared provider asset. Demo only.") })
    ),
    profile.lastResult
      ? h("div", { class: profile.lastResult.ok ? "bf-success-text" : "bf-error-text", text: profile.lastResult.message })
      : null
  );
}

function fakeToolStatus(ctx) {
  const tool = ctx.state.aiProviders.localTool;
  tool.status = "Installed · signed in\nAuthentication: signed in\nSubscription: available\nBilling mode: subscription";
  tool.installation = "✓ Detected automatically: /usr/local/bin/local-tool (example path)";
  tool.authentication = "signed in";
  tool.subscription = "available";
  tool.billingMode = "subscription";
  ctx.rerender();
  toastOn(document.body, "AI Providers", "Example result shown. No local tool was executed.");
}

function fakeTest(ctx, profile) {
  profile.lastResult = {
    ok: true,
    message: "Connection test passed (example result). Provider replies are not requested in this preview."
  };
  ctx.rerender();
}

function openAddProfile(host, ctx) {
  const windowEl = host.closest(".up-window") || document.body;
  const name = { value: "My AI profile" };
  const nameInput = textInput(name.value, (value) => { name.value = value; });
  const create = (templateId) => {
    const profile = addProfile(ctx, templateId, name.value);
    overlay.remove();
    toastOn(document.body, "AI Providers", `Created profile "${profile.name}". Demo only; no asset was written.`);
  };
  const overlay = h(
    "div",
    { class: "up-overlay" },
    h(
      "div",
      { class: "up-window up-window--popup", role: "dialog", "aria-modal": "true", "aria-label": "Add AI profile", style: { width: "min(620px, 100%)" } },
      h("div", { class: "up-window__titlebar" }, h("span", { text: "Add AI profile" })),
      h(
        "div",
        { class: "up-message__body" },
        h("div", { class: "dgs-page-header__subtitle", text: "Create an AI profile" }),
        field("Profile name", nameInput),
        ...templates.map((group) =>
          h(
            "div",
            { class: "ai-template-group" },
            h("div", { class: "bf-muted", text: group.group }),
            h(
              "div",
              { class: "ai-template-list" },
              ...group.items.map((item) =>
                h(
                  "button",
                  {
                    class: "ai-template-card",
                    type: "button",
                    onclick: () => create(item.id)
                  },
                  h("strong", { text: item.label }),
                  h("span", { class: "bf-muted", text: item.description })
                )
              )
            )
          )
        )
      ),
      h(
        "div",
        { class: "up-message__footer" },
        h("button", { class: "bf-button", type: "button", text: "Cancel", onclick: () => { overlay.remove(); toastOn(windowEl, "Profiles", "Closed without creating a profile. Demo only."); } }),
        h("button", { class: "bf-button bf-button--primary", type: "button", text: "Create profile", onclick: () => create("OpenAICompatible") })
      )
    )
  );
  windowEl.append(overlay);
  bindDialog(overlay, nameInput);
}

function promptSections(ctx) {
  const s = ctx.state.aiProviders;
  const defs = [
    ["Context", "Describe the environment, domain, source-of-truth data, and important background.", "systemPromptContext"],
    ["Persona", "Define the assistant's role, expertise, tone, and decision-making stance.", "systemPromptPersona"],
    ["Goals", "State the primary outcomes the assistant should optimize for.", "systemPromptGoals"],
    ["Constraints", "Describe normal operating boundaries, preferred limits, and things to avoid when possible.", "systemPromptRules"],
    ["Strict Constraints", "List hard requirements, prohibited behavior, and non-negotiable guardrails.", "systemPromptStrictConstraints"],
    ["Response", "Specify formatting, structure, and response-shape expectations.", "systemPromptOutput"]
  ];

  return defs.map(([title, description, key]) =>
    h(
      "div",
      { class: "ai-prompt-section" },
      sectionTitle(title),
      helper(description),
      textArea(s[key] || "", (value) => { s[key] = value; }, { height: 96 }),
      h(
        "div",
        { class: "bf-row", style: { justifyContent: "flex-end" } },
        h("button", {
          class: "bf-button",
          type: "button",
          text: `Rewrite ${title}`,
          title: `Generate a stronger ${title.toLowerCase()} section from the current text.`,
          onclick: () => {
            s[key] = `[Example rewrite] ${description}`;
            ctx.rerender();
            toastOn(document.body, "Prompt defaults", `Rewrite ${title} proposes new text. No provider is contacted in this preview.`);
          }
        })
      )
    )
  );
}

function panelSetup(ctx) {
  const s = ctx.state.aiProviders;
  return h(
    "div",
    { class: "ai-providers-settings-section", id: "ai-section-setup" },
    h("div", { class: "ai-providers-section-heading", text: "Setup" }),
    s.checklistDismissed
      ? null
      : card(
          "Getting Started",
          helper("Three quick steps to enable AI features. This checklist disappears once complete."),
          h("div", { class: "bf-helper", text: `${s.profiles.length ? "[done]" : "[ ]"} 1. Select or add a profile` }),
          h("div", { class: "bf-helper", text: `[done] 2. Connect the account or enter the required API key` }),
          h("div", { class: "bf-helper", text: `[ ] 3. Run a successful connection test` }),
          h("div", { class: "bf-row", style: { justifyContent: "flex-end" } },
            h("button", { class: "bf-button", type: "button", text: "Dismiss", onclick: () => { s.checklistDismissed = true; ctx.rerender(); } })
          )
        ),
    card(
      "Local preferences",
      toggleRow("Enable AI Features", s.enabled, (value) => { s.enabled = value; }),
      toggleRow("Force Structured JSON", s.forceStructuredJson, (value) => { s.forceStructuredJson = value; }),
      helper(
        "When enabled, requests from this panel ask the provider for machine-readable output (OpenAI response_format, Gemini responseMimeType, Ollama format). Only applies to providers that support JSON mode."
      )
    )
  );
}

function panelProfiles(ctx) {
  return h("div", { class: "ai-providers-settings-section", id: "ai-section-profiles" }, h("div", { class: "ai-providers-section-heading", text: "Profiles" }), profileSection(ctx, "ai-profile-picker"));
}

function panelPromptDefaults(ctx) {
  const s = ctx.state.aiProviders;
  const subscription = s.profiles.find((profile) => profile.id === s.selectedProfile)?.transport === "Subscription";

  return h(
    "div",
    { class: "ai-providers-settings-section", id: "ai-section-prompt-defaults" },
    h("div", { class: "ai-providers-section-heading", text: "Prompt defaults" }),
    card(
      null,
      foldout(
        "Advanced Settings",
        h(
          "div",
          null,
          subscription
            ? helper("Generation limits and sampling are managed by the connected local tool.")
            : h(
                "div",
                null,
                sliderRow("Temperature", s.generation.temperature, 0, 2, 0.05, (value) => { s.generation.temperature = value; }, { format: (value) => value.toFixed(2) }),
                sliderRow("Max Tokens", s.generation.maxTokens, 256, 32768, 256, (value) => { s.generation.maxTokens = value; }, { format: (value) => String(value) })
              ),
          helper("Build an optional system prompt from focused sections. Empty sections stay empty and are omitted from the final system message."),
          ...promptSections(ctx),
          foldout(
            "Full Prompt Fallback",
            h(
              "div",
              null,
              sectionTitle("Full Prompt"),
              helper("Used only when you want to bypass the section builder and write one complete system prompt manually."),
              textArea(s.generation.fullPrompt || "", (value) => { s.generation.fullPrompt = value; }, { height: 120, placeholder: "Example: You are a senior support agent. Use concise answers, cite product policy, and end with clear next steps." })
            ),
            false
          )
        ),
        true
      )
    )
  );
}

function panelAbout(ctx) {
  return h(
    "div",
    { class: "ai-providers-settings-section", id: "ai-section-about" },
    h("div", { class: "ai-providers-section-heading", text: "About" }),
    card(
      "AI Providers",
      helper("Standalone provider setup for Beka Forge tools."),
      helper("Version 2.2.0"),
      h(
        "div",
        { class: "bf-row" },
        h("button", { class: "bf-button", type: "button", text: "Documentation", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "AI Providers", "Documentation opens bekaforge.com in Unity. Links are inert in this preview.") }),
        h("button", { class: "bf-button", type: "button", text: "Beka Forge website", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "AI Providers", "Beka Forge website opens bekaforge.com in Unity. Links are inert in this preview.") })
      )
    )
  );
}

const sections = {
  setup: panelSetup,
  profiles: panelProfiles,
  "prompt-defaults": panelPromptDefaults,
  about: panelAbout
};

function duplicateProfileWindow(ctx, host, wrap = true) {
  const s = ctx.state.aiProviders;
  const source = s.profiles.find((profile) => profile.id === s.selectedProfile) || s.profiles[0];
  if (!(s.duplicateName || "").trim()) s.duplicateName = `${source.name} copy`;
  const toastHost = host || document.body;
  const nameInput = textInput(s.duplicateName, (value) => { s.duplicateName = value; });
  const close = () => dialog.remove();

  const dialog = h(
    "div",
    { class: "up-overlay" },
    h(
      "div",
      { class: "up-window up-window--popup", role: "dialog", "aria-modal": "true", "aria-label": "Duplicate AI profile", style: { width: "min(560px, 100%)" } },
      h("div", { class: "up-window__titlebar" }, h("span", { text: "Duplicate AI profile" })),
      h(
        "div",
        { class: "up-message__body" },
        h("div", { class: "ai-provider-create-title", text: "Duplicate profile" }),
        h("div", {
          class: "ai-provider-helper",
          text: "Configuration is copied into a new asset. Credentials, account state, and connection-test history are not copied."
        }),
        field("Profile name", nameInput),
        h(
          "div",
          { class: "ai-template-card", style: { marginTop: "10px" } },
          h("span", { class: "bf-chip", text: source.template }),
          h("strong", { text: source.name }),
          h("span", { class: "bf-muted", text: source.path || "Local subscription connection · no asset" })
        )
      ),
      h(
        "div",
        { class: "up-message__footer" },
        h("button", {
          class: "bf-button",
          type: "button",
          text: "Cancel",
          onclick: () => {
            close();
            toastOn(toastHost, "Profiles", "Closed without duplicating. Demo only.");
          }
        }),
        h("button", {
          class: "bf-button bf-button--primary",
          type: "button",
          text: "Duplicate profile",
          disabled: !(s.duplicateName || "").trim(),
          onclick: () => {
            close();
            toastOn(toastHost, "Profiles", "Duplicate copies configuration into a new asset in the desktop app. Demo only.");
          }
        })
      )
    )
  );
  bindDialog(dialog, nameInput);
  return wrap ? h("div", { class: "dgs-dialog-stage" }, dialog) : dialog;
}

export async function render(host, ctx) {
  const s = ctx.state.aiProviders;
  if (ctx.surface === "profile-duplicate") {
    host.append(duplicateProfileWindow(ctx, host));
    return;
  }

  const surface = ctx.surface && sections[ctx.surface] ? ctx.surface : "";
  if (surface) s.section = surface;

  const header = h(
    "div",
    { class: "ai-provider-header" },
    h(
      "div",
      { class: "ai-provider-header-main" },
      h("img", { class: "ai-provider-brand-logo", src: "../../Dialogue%20Graph%20System/brand/logo-primary-transparent-dark@1x.png", alt: "" }),
      h(
        "div",
        { class: "ai-provider-header-copy" },
        h("div", { class: "ai-provider-header-title", text: "AI Providers" }),
        h("div", { class: "bf-muted", text: "Provider setup, local secrets, and reusable prompt defaults for Beka Forge tools." }),
        h("div", { class: "bf-muted", text: "Local preferences and prompt defaults save automatically for this project on this computer. API keys use protected OS storage for this user where supported. Provider profiles are project assets and can be shared through the project; API keys are never stored in those assets." })
      )
    ),
    h("span", { class: `ai-provider-enabled-badge${s.enabled ? "" : " ai-provider-enabled-badge--off"}`, text: s.enabled ? "Enabled" : "Disabled" })
  );

  const nav = h(
    "div",
    { class: "ai-providers-section-navigation" },
    ...entries.filter((entry) => sections[entry.id]).map((entry) =>
      h("button", {
        class: "bf-button",
        type: "button",
        text: entry.label,
        title: `Jump to ${entry.label.toLowerCase()} settings.`,
        onclick: () => {
          if (surface && ctx.navigateSurface) {
            ctx.navigateSurface(entry.id, { replace: false });
            return;
          }
          const target = document.getElementById(`ai-section-${entry.id}`);
          if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      })
    )
  );

  const ordered = surface ? [surface] : ["setup", "profiles", "prompt-defaults", "about"];
  const content = h(
    "div",
    { class: "ai-providers-form-content up-scroll" },
    header,
    nav,
    ...ordered.map((id) => sections[id](ctx)),
    h(
      "div",
      { class: "bf-row", style: { justifyContent: "space-between", margin: "8px 0" } },
      h("span", { class: "bf-muted", text: s.lifetimeTokens ? `Session lifetime usage: ${s.lifetimeTokens.toLocaleString()} tokens` : "" }),
      h("button", {
        class: "bf-button bf-button--primary",
        type: "button",
        text: "Save local settings",
        title: "Local settings also save as you edit.",
        onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "AI Providers", "Save local settings writes only to local editor preferences. Demo only.")
      })
    )
  );

  host.append(
    windowFrame({
      title: "AI Providers Settings",
      hint: "Example project · demo data",
      className: "ai-providers--warm up-window--compact ai-providers-window",
      body: content,
      footer: statusBar(s.enabled ? "AI features enabled" : "AI features disabled", [], { right: h("span", { text: "Min size 520×520" }) })
    })
  );
}
