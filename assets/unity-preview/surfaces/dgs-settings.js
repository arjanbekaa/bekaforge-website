/* Dialogue Graph System Settings tab.
   Field labels, helper text, ranges, and units are copied from
   SettingsWindow/Panels/*.cs (Text, Choice, Audio, RuntimeUI, AI, GraphView, About)
   and Tabs/SettingsTabController.cs. Example values only. */

import {
  h, card, field, foldout, helper, sectionTitle, sliderRow, numberRow, toggleRow, checkbox,
  enumRow, textInput, objectRow, colorRow, badge, toastOn, keyCaptureRow
} from "../controls.js";
import { surfaceForMainTab } from "../surface-route.js";

export const settingsCategories = [
  { id: "text", label: "Text" },
  { id: "choices", label: "Choices" },
  { id: "audio", label: "Audio" },
  { id: "runtime-ui", label: "Runtime UI" },
  { id: "graph-ai", label: "Graph AI" },
  { id: "graph-editor", label: "Graph editor" },
  { id: "themes", label: "UI themes" },
  { id: "about", label: "About" }
];

const revealEffects = ["None", "Typing", "WordByWord", "FadeIn", "FadeTyping"];
const revealEffectLabels = {
  None: "None",
  Typing: "Typing",
  WordByWord: "Word by word",
  FadeIn: "Fade in",
  FadeTyping: "Fade typing"
};

function pageHeader(title, subtitle, footnote) {
  return h(
    "div",
    { class: "dgs-page-header" },
    h("div", { class: "dgs-page-header__title", text: title }),
    h("div", { class: "dgs-page-header__subtitle", text: subtitle }),
    footnote ? h("div", { class: "dgs-page-header__footnote", text: footnote }) : null
  );
}

function panelText(ctx) {
  const s = ctx.state.settings.text;
  const effect = s.typewriterEffect;
  const speedEnabled = effect === "Typing" || effect === "WordByWord" || effect === "FadeTyping";
  const punctuationEnabled = effect === "Typing" || effect === "FadeTyping";
  const fastForwardEnabled = punctuationEnabled && s.allowFastForwardHold;
  const refresh = () => ctx.rerender();

  if (ctx.state.dgs.simulateMissingTextSettings) {
    return h(
      "div",
      { class: "dgs-panel" },
      pageHeader(
        "Text",
        "Control dialogue reveal speed, skipping, auto-advance timing, and punctuation pacing.",
        "Changes are stored in the Text settings asset."
      ),
      card(
        "Text settings asset missing",
        helper("The master settings asset does not reference a DialogTextSettings sub-asset. DGS offers explicit recovery instead of creating or moving assets silently."),
        h("button", { class: "bf-button bf-button--primary", type: "button", text: "Create Text Settings", onclick: () => {
          ctx.state.dgs.simulateMissingTextSettings = false;
          ctx.rerender();
        } }),
        h("div", { class: "bf-divider" }),
        helper("In Unity this card also offers Assign Existing with the same explicit-confirmation behavior. This preview only demonstrates the missing-asset state.")
      )
    );
  }

  return h(
    "div",
    { class: "dgs-panel" },
    pageHeader(
      "Text",
      "Control dialogue reveal speed, skipping, auto-advance timing, and punctuation pacing.",
      "Changes are stored in the Text settings asset."
    ),
    card(
      "Text reveal",
      enumRow(
        "Reveal effect",
        effect,
        revealEffects.map((value) => ({ value, label: revealEffectLabels[value] })),
        (value) => {
          s.typewriterEffect = value;
          refresh();
        }
      ),
      sliderRow(
        "Characters per second",
        s.charsPerSecond,
        1,
        120,
        1,
        (value) => { s.charsPerSecond = value; },
        { unit: "cps", rangeText: "Recommended: 20–80 cps", disabled: !speedEnabled }
      ),
      helper("Reveal speed applies to Typing, Word By Word, and Fade Typing.")
    ),
    card(
      "Skip and fast-forward",
      toggleRow("Allow skipping the current line", s.allowSkipCurrentLine, (value) => { s.allowSkipCurrentLine = value; }),
      toggleRow("Allow skipping the entire conversation", s.allowSkipAll, (value) => { s.allowSkipAll = value; }),
      toggleRow("Allow hold to fast-forward", s.allowFastForwardHold, (value) => {
        s.allowFastForwardHold = value;
        refresh();
      }),
      sliderRow(
        "Fast-forward multiplier",
        s.fastForwardMultiplier,
        1,
        8,
        0.05,
        (value) => { s.fastForwardMultiplier = value; },
        {
          unit: "×",
          rangeText: "Recommended: 2–5 ×",
          disabled: !fastForwardEnabled,
          format: (value) => `${value.toFixed(2)}×`
        }
      ),
      helper("Fast-forward multiplier applies to Typing and Fade Typing while Allow hold to fast-forward is on.")
    ),
    card(
      "Auto-advance",
      toggleRow("Auto-advance", s.autoAdvance, (value) => {
        s.autoAdvance = value;
        refresh();
      }),
      sliderRow(
        "Auto-advance delay",
        s.autoAdvanceDelay,
        0,
        3,
        0.001,
        (value) => { s.autoAdvanceDelay = value; },
        {
          unit: "s",
          rangeText: "Recommended: 0.3–1.5 s",
          disabled: !s.autoAdvance,
          format: (value) => `${value.toFixed(3)} s`
        }
      ),
      helper("Auto-advance delay applies while Auto-advance is on.")
    ),
    card(
      "Punctuation pauses",
      sliderRow(
        "Comma pause",
        s.commaPause,
        0,
        0.5,
        0.0001,
        (value) => { s.commaPause = value; },
        { unit: "s", rangeText: "Recommended: 0.05–0.15 s", disabled: !punctuationEnabled, format: (value) => `${value.toFixed(4)} s` }
      ),
      helper("Punctuation pauses apply to Typing and Fade Typing."),
      sliderRow(
        "Period pause",
        s.periodPause,
        0,
        0.5,
        0.0001,
        (value) => { s.periodPause = value; },
        { unit: "s", rangeText: "Recommended: 0.1–0.25 s", disabled: !punctuationEnabled, format: (value) => `${value.toFixed(4)} s` }
      ),
      sliderRow(
        "Question pause",
        s.questionPause ?? 0.22,
        0,
        0.5,
        0.0001,
        (value) => { s.questionPause = value; },
        { unit: "s", rangeText: "Recommended: 0.15–0.3 s", disabled: !punctuationEnabled, format: (value) => `${value.toFixed(4)} s` }
      ),
      sliderRow(
        "Exclamation pause",
        s.exclamationPause ?? 0.22,
        0,
        0.5,
        0.0001,
        (value) => { s.exclamationPause = value; },
        { unit: "s", rangeText: "Recommended: 0.15–0.3 s", disabled: !punctuationEnabled, format: (value) => `${value.toFixed(4)} s` }
      )
    )
  );
}

function panelChoices(ctx) {
  const s = ctx.state.settings.choices;
  const refresh = () => ctx.rerender();

  return h(
    "div",
    { class: "dgs-panel" },
    pageHeader(
      "Choices",
      "Control choice navigation, visual feedback, and confirm input.",
      "Changes are stored in the Choice and Input settings assets."
    ),
    card(
      "Navigation",
      toggleRow("Wrap navigation", s.wrapNavigation, (value) => { s.wrapNavigation = value; }),
      sliderRow("Hold repeat delay", s.holdRepeatDelay, 0.05, 0.5, 0.01, (value) => { s.holdRepeatDelay = value; }, {
        unit: "s", rangeText: "Recommended: 0.10–0.25 s", format: (value) => `${value.toFixed(2)} s`
      }),
      toggleRow("Select the first choice when enabled", s.selectFirstOnEnable, (value) => { s.selectFirstOnEnable = value; }),
      toggleRow("Move selection with mouse hover", s.mouseHoverMovesSelection, (value) => { s.mouseHoverMovesSelection = value; })
    ),
    card(
      "Visual feedback",
      colorRow("Selected outline color", s.selectedOutlineColor, (value) => { s.selectedOutlineColor = value; }),
      sliderRow("Outline thickness", s.outlineThickness, 0.5, 10, 0.5, (value) => { s.outlineThickness = value; }, {
        unit: "px", rangeText: "Recommended: 1–3 px", format: (value) => `${value.toFixed(1)} px`
      }),
      toggleRow("Animate selection", s.animateSelected, (value) => { s.animateSelected = value; }),
      sliderRow("Pulse scale", s.animatePulseScale, 1, 1.2, 0.01, (value) => { s.animatePulseScale = value; }, {
        unit: "×", rangeText: "Recommended: 1.03–1.10 ×", format: (value) => `${value.toFixed(2)}×`
      }),
      sliderRow("Pulse speed", s.animatePulseSpeed, 0.25, 3, 0.05, (value) => { s.animatePulseSpeed = value; }, {
        unit: "Hz", rangeText: "Recommended: 0.75–1.50 Hz", format: (value) => `${value.toFixed(2)} Hz`
      })
    ),
    card(
      "Input",
      toggleRow("Show key hints", s.showKeyHints, (value) => { s.showKeyHints = value; }, { disabled: !s.enableKeyboardConfirmKey }),
      toggleRow("Enable keyboard confirm key", s.enableKeyboardConfirmKey, (value) => {
        s.enableKeyboardConfirmKey = value;
        refresh();
      }),
      keyCaptureRow("Choice confirm key", s.choiceConfirmKey, (value) => { s.choiceConfirmKey = value; }, {
        note: "Default: F"
      }),
      helper("Show key hints and Choice confirm key apply only when Enable keyboard confirm key is on."),
      toggleRow("Also accept Enter or Space", s.alsoAcceptSubmit, (value) => { s.alsoAcceptSubmit = value; }),
      toggleRow("Accept gamepad confirm", s.acceptGamepadConfirm, (value) => { s.acceptGamepadConfirm = value; }),
      toggleRow("Accept XR select", s.acceptXRSelect, (value) => { s.acceptXRSelect = value; }),
      keyCaptureRow("Line advance key", s.lineAdvanceKey, (value) => { s.lineAdvanceKey = value; }, {
        note: "Default: Space"
      }),
      helper("Line advance also accepts submit, gamepad, and XR confirm input."),
      toggleRow("Allow mouse or touch continue", s.allowMouseOrTouchContinue, (value) => { s.allowMouseOrTouchContinue = value; })
    )
  );
}

function panelAudio(ctx) {
  const s = ctx.state.settings.audio;
  const effect = ctx.state.settings.text.typewriterEffect;
  const revealEffect = effect === "Typing" || effect === "FadeTyping";
  const dependentEnabled = s.enableTypewriterAudio && revealEffect;
  const refresh = () => ctx.rerender();

  return h(
    "div",
    { class: "dgs-panel" },
    pageHeader(
      "Audio",
      "Control dialogue volume, interface sound effects, and text reveal audio.",
      "Changes are stored in the Audio settings asset."
    ),
    card(
      "Volumes",
      sliderRow("Voice volume", Math.round(s.voiceVolume * 100), 0, 100, 1, (value) => { s.voiceVolume = value / 100; }, {
        unit: "%", rangeText: "Recommended: 50–80 %", format: (value) => `${Math.round(value)} %`
      }),
      sliderRow("SFX volume", Math.round(s.sfxVolume * 100), 0, 100, 1, (value) => { s.sfxVolume = value / 100; }, {
        unit: "%", rangeText: "Recommended: 50–80 %", format: (value) => `${Math.round(value)} %`
      })
    ),
    card(
      "UI sound effects",
      toggleRow("Enable UI sound effects", s.enableUiSfx, (value) => { s.enableUiSfx = value; }),
      objectRow("Navigate sound", s.sfxNavigate, [{ value: "", label: "None (AudioClip)" }, { value: "ui-nav-soft", label: "ui-nav-soft (example)" }], (value) => { s.sfxNavigate = value; }, { disabled: !s.enableUiSfx }),
      objectRow("Confirm sound", s.sfxConfirm, [{ value: "", label: "None (AudioClip)" }, { value: "ui-confirm-soft", label: "ui-confirm-soft (example)" }], (value) => { s.sfxConfirm = value; }, { disabled: !s.enableUiSfx }),
      objectRow("Skip sound", s.sfxSkip, [{ value: "", label: "None (AudioClip)" }, { value: "ui-skip-click", label: "ui-skip-click (example)" }], (value) => { s.sfxSkip = value; }, { disabled: !s.enableUiSfx })
    ),
    card(
      "Text reveal audio",
      toggleRow("Enable text reveal audio", s.enableTypewriterAudio, (value) => {
        s.enableTypewriterAudio = value;
        refresh();
      }),
      helper("Text reveal audio requires Typing or Fade Typing."),
      objectRow("Reveal clip", s.typewriterClip, [{ value: "", label: "None (AudioClip)" }, { value: "type-loop-soft", label: "type-loop-soft (example)" }], (value) => { s.typewriterClip = value; }, { disabled: !dependentEnabled }),
      sliderRow("Reveal volume", Math.round(s.typewriterVolume * 100), 0, 100, 1, (value) => { s.typewriterVolume = value / 100; }, {
        unit: "%", rangeText: "Recommended: 30–60 %", disabled: !dependentEnabled, format: (value) => `${Math.round(value)} %`
      }),
      sliderRow("Pitch variance", s.typewriterPitchVariance, 0, 0.5, 0.01, (value) => { s.typewriterPitchVariance = value; }, {
        rangeText: "Recommended: 0.02–0.1", disabled: !dependentEnabled, format: (value) => value.toFixed(2)
      }),
      numberRow("Play every N characters", s.typewriterPlayEveryNChars, 1, null, (value) => { s.typewriterPlayEveryNChars = value; }, { disabled: !dependentEnabled }),
      sliderRow("Minimum interval", s.typewriterMinInterval, 0, 1, 0.01, (value) => { s.typewriterMinInterval = value; }, {
        unit: "s", rangeText: "Recommended: 0.01–0.08 s", disabled: !dependentEnabled, format: (value) => `${value.toFixed(2)} s`
      }),
      toggleRow("Ignore whitespace", s.typewriterIgnoreWhitespace, (value) => { s.typewriterIgnoreWhitespace = value; }, { disabled: !dependentEnabled }),
      toggleRow("Ignore rich-text tags", s.typewriterIgnoreRichTextTags, (value) => { s.typewriterIgnoreRichTextTags = value; }, { disabled: !dependentEnabled })
    )
  );
}

function panelRuntimeUI(ctx) {
  const s = ctx.state.settings.runtimeUI;
  const bind = (key) => (value) => { s[key] = value; };

  return h(
    "div",
    { class: "dgs-panel" },
    pageHeader(
      "Runtime UI",
      "Control player-facing dialogue visibility, controls, settings options, theme, and diagnostics.",
      "Changes are stored in the Runtime UI and main settings assets."
    ),
    card(
      "Dialogue visibility",
      toggleRow("Show background panel", s.showBackgroundPanel, bind("showBackgroundPanel")),
      toggleRow("Show speaker name", s.showSpeakerName, bind("showSpeakerName")),
      toggleRow("Show portrait", s.showPortrait, bind("showPortrait")),
      toggleRow("Show continue indicator", s.showContinueIndicator, bind("showContinueIndicator")),
      toggleRow("Show auto or skip state", s.showAutoSkipIcon, bind("showAutoSkipIcon")),
      toggleRow("Show choice panel", s.showChoicePanel, bind("showChoicePanel")),
      toggleRow("Show history panel", s.showHistoryPanel, bind("showHistoryPanel"))
    ),
    card(
      "Player controls",
      toggleRow("Show skip button", s.showSkipButton, bind("showSkipButton")),
      toggleRow("Show auto button", s.showAutoButton, bind("showAutoButton")),
      toggleRow("Show history button", s.showHistoryButton, bind("showHistoryButton")),
      toggleRow("Show language button", s.showLanguageButton, bind("showLanguageButton")),
      toggleRow("Show settings button", s.showSettingsButton, bind("showSettingsButton"))
    ),
    card(
      "Runtime settings panel",
      toggleRow("Show runtime settings panel", s.showSettingsPanel, bind("showSettingsPanel")),
      toggleRow("Show language selector", s.showSettingsLanguageDropdown, bind("showSettingsLanguageDropdown")),
      toggleRow("Show theme selector", s.showSettingsThemeDropdown, bind("showSettingsThemeDropdown")),
      toggleRow("Show text speed", s.showSettingsTextSpeed, bind("showSettingsTextSpeed")),
      toggleRow("Show auto-advance", s.showSettingsAutoAdvance, bind("showSettingsAutoAdvance")),
      toggleRow("Show voice volume", s.showSettingsVoiceVolume, bind("showSettingsVoiceVolume")),
      toggleRow("Show SFX volume", s.showSettingsSfxVolume, bind("showSettingsSfxVolume"))
    ),
    card(
      "Runtime theme",
      objectRow(
        "Player-facing runtime theme",
        s.settingsTheme,
        [
          { value: "", label: "None (DialogSettingsThemeSO)" },
          { value: "SettingsTheme_MinimalClean", label: "SettingsTheme_MinimalClean (example)" }
        ],
        bind("settingsTheme")
      ),
      helper(
        "Fallback for the player-facing settings panel. An appearance pack's Settings Theme takes precedence; edit it in Themes > Editing > Settings. This does not restyle the Editor."
      )
    ),
    card(
      "Diagnostics",
      enumRow(
        "Runtime log mode",
        s.runtimeLogMode,
        ["Silent", "WarningsAndErrors", "WarningsOnly", "Verbose"].map((value) => ({ value, label: value })),
        bind("runtimeLogMode")
      ),
      toggleRow("Enable debug logs", s.enableDebugLogs, bind("enableDebugLogs"))
    )
  );
}

function graphAiIntRow(ctx, label, value, key, min, recommended, unit) {
  return numberRow(label, value, min, recommended, (next) => {
    ctx.state.settings.graphAI[key] = next;
  }, { unit });
}

function panelGraphAI(ctx) {
  const s = ctx.state.settings.graphAI;
  const refresh = () => ctx.rerender();

  return h(
    "div",
    { class: "dgs-panel dgs-ai-scope" },
    pageHeader(
      "Graph AI",
      "Configure graph authoring limits, batching, timeouts, and automatic failure reporting. Provider setup and local API keys stay in the AI Providers workspace.",
      "Changes are stored in the AI settings asset."
    ),
    card(
      "Provider setup",
      helper("Manage provider profiles, shared generation defaults, and local API keys in AI Providers settings."),
      h(
        "div",
        { class: "bf-row" },
        h("button", {
          class: "bf-button bf-button--primary",
          type: "button",
          text: "Open AI Providers",
          onclick: (event) => {
            const url = new URL(window.location.href);
            url.pathname = url.pathname.replace(/[^/]*$/, "").replace(/preview\/?$/, "preview/") + "";
            window.location.href = "../../AI Providers/preview/index.html";
          }
        })
      )
    ),
    card(
      "Per-batch safety limits",
      helper(
        "DGS uses these values per generated batch. Large authoring requests can be split into multiple validated batches, so these values do not represent the total graph size DGS can create."
      ),
      helper(
        "Hard limits protect editor responsiveness and safe apply behavior. Preferred typed counts below guide planning and batching, but should not block structurally required operations on their own."
      ),
      graphAiIntRow(ctx, "Max operations per batch", s.maxOperationsPerBatch, "maxOperationsPerBatch", 1, 64),
      graphAiIntRow(ctx, "Max new graph nodes per batch", s.maxNewGraphNodesPerBatch, "maxNewGraphNodesPerBatch", 1, 32),
      graphAiIntRow(ctx, "Max dependency depth per batch", s.maxDependencyDepthPerBatch, "maxDependencyDepthPerBatch", 1, 32),
      foldout(
        "Planner guidance",
        h(
          "div",
          null,
          graphAiIntRow(ctx, "Preferred dialogue nodes per batch", s.maxDialogueNodes, "maxDialogueNodes", 0, 32),
          graphAiIntRow(ctx, "Preferred choice constructs per batch", s.maxChoiceConstructs, "maxChoiceConstructs", 0, 8),
          graphAiIntRow(ctx, "Preferred choices per batch", s.maxChoices, "maxChoices", 0, 16),
          graphAiIntRow(ctx, "Preferred action nodes per batch", s.maxActionNodes, "maxActionNodes", 0, 16),
          graphAiIntRow(ctx, "Preferred condition nodes per batch", s.maxConditionNodes, "maxConditionNodes", 0, 16),
          graphAiIntRow(ctx, "Preferred outcome nodes per batch", s.maxOutcomeNodes, "maxOutcomeNodes", 0, 4),
          graphAiIntRow(ctx, "Preferred variable create or update operations per batch", s.maxVariableCreateUpdate, "maxVariableCreateUpdate", 0, 24)
        ),
        false
      ),
      h("button", {
        class: "bf-button",
        type: "button",
        text: "Apply recommended base limits",
        onclick: () => {
          Object.assign(s, {
            maxOperationsPerBatch: 64,
            maxNewGraphNodesPerBatch: 32,
            maxDependencyDepthPerBatch: 32,
            maxDialogueNodes: 32,
            maxChoiceConstructs: 8,
            maxChoices: 16,
            maxActionNodes: 16,
            maxConditionNodes: 16,
            maxOutcomeNodes: 4,
            maxVariableCreateUpdate: 24
          });
          refresh();
        }
      })
    ),
    card(
      "Batch authoring",
      helper(
        "Large AI authoring requests can be recovered by planning and applying smaller graph batches instead of failing the whole run immediately."
      ),
      toggleRow("Enable divide-and-conquer authoring", s.enableDivideAndConquerAuthoring, (value) => { s.enableDivideAndConquerAuthoring = value; }),
      numberRow("Planner timeout", s.plannerTimeoutSeconds, 1, 60, (value) => { s.plannerTimeoutSeconds = value; }, { unit: "seconds" }),
      graphAiIntRow(ctx, "Max batch count", s.maxBatchCount, "maxBatchCount", 1, 12),
      graphAiIntRow(ctx, "Max provider retries per batch", s.maxProviderRetriesPerBatch, "maxProviderRetriesPerBatch", 0, 2),
      graphAiIntRow(ctx, "Max structural repair attempts", s.maxStructuralRepairAttempts, "maxStructuralRepairAttempts", 1, 3),
      graphAiIntRow(ctx, "Max branch anchor requeues", s.maxBranchAnchorRequeues, "maxBranchAnchorRequeues", 0, 2)
    ),
    card(
      "Failure reporting",
      helper(
        "When enabled, DGS automatically sends a sanitized failure report to Beka Forge when an AI authoring run fails. The same diagnostic source feeds the popup, clipboard report, local JSON, and backend payload."
      ),
      toggleRow("Auto-send failure feedback reports", s.enableAutoFailureFeedbackReports, (value) => { s.enableAutoFailureFeedbackReports = value; }),
      enumRow(
        "Feedback detail level",
        s.feedbackDetailLevel,
        ["Minimal telemetry", "Compact diagnostic", "Full diagnostic"].map((value) => ({ value, label: value })),
        (value) => { s.feedbackDetailLevel = value; }
      ),
      toggleRow("Include original user prompt", s.includeOriginalUserPromptInFailureFeedback, (value) => { s.includeOriginalUserPromptInFailureFeedback = value; }),
      toggleRow("Include graph context snapshot", s.includeGraphContextSnapshotInFailureFeedback, (value) => { s.includeGraphContextSnapshotInFailureFeedback = value; }),
      toggleRow("Include provider raw response", s.includeProviderRawResponseInFailureFeedback, (value) => { s.includeProviderRawResponseInFailureFeedback = value; }),
      toggleRow("Include debug trace", s.includeDebugTraceInFailureFeedback, (value) => { s.includeDebugTraceInFailureFeedback = value; }),
      toggleRow("Include created asset paths", s.includeCreatedAssetPathsInFailureFeedback, (value) => { s.includeCreatedAssetPathsInFailureFeedback = value; }),
      numberRow("Max diagnostic payload (KB)", s.maxFailureDiagnosticPayloadKilobytes, 8, 64, (value) => { s.maxFailureDiagnosticPayloadKilobytes = value; }),
      toggleRow("Store local diagnostic JSON report", s.storeLocalFailureDiagnosticReport, (value) => { s.storeLocalFailureDiagnosticReport = value; })
    ),
    card(
      "Debug",
      toggleRow("Log prompts in Editor", s.logPromptsInEditor, (value) => { s.logPromptsInEditor = value; })
    )
  );
}

function panelGraphEditor(ctx) {
  const s = ctx.state.settings.graphEditor;
  const refresh = () => ctx.rerender();

  return h(
    "div",
    { class: "dgs-panel" },
    pageHeader(
      "Graph editor",
      "Control the graph editor canvas, minimap, zoom limits, and search shortcuts. Changes take effect immediately.",
      "Changes are stored in per-user editor preferences."
    ),
    card(
      "DGS editor appearance",
      enumRow("Color theme", s.colorTheme, ["Warm Graphite", "Classic"].map((value) => ({ value, label: value })), (value) => {
        s.colorTheme = value;
        refresh();
      }),
      helper("Applies immediately to DGS windows and asset inspectors. Saved for this user on this computer.")
    ),
    card("Minimap", toggleRow("Show minimap", s.showMinimap, (value) => { s.showMinimap = value; })),
    card(
      "Zoom limits",
      sliderRow("Min zoom", s.minZoom, 0.1, 1, 0.05, (value) => {
        s.minZoom = Math.min(value, s.maxZoom);
        refresh();
      }, { unit: "×", format: (value) => `${value.toFixed(2)}×` }),
      sliderRow("Max zoom", s.maxZoom, 1, 3, 0.05, (value) => {
        s.maxZoom = Math.max(value, s.minZoom);
        refresh();
      }, { unit: "×", format: (value) => `${value.toFixed(2)}×` }),
      helper("Min: 0.1–1.0  ·  Max: 1.0–3.0  ·  Defaults: 0.25 / 1")
    ),
    card(
      "Search and replace",
      keyCaptureRow("Graph search shortcut", s.searchShortcut, (value) => { s.searchShortcut = value; }, {
        note: "Default: F",
        help: "Used as Ctrl/Cmd + key inside the graph editor. Default is Ctrl/Cmd + F."
      }),
      keyCaptureRow("Graph replace shortcut", s.replaceShortcut, (value) => { s.replaceShortcut = value; }, {
        note: "Default: H",
        help: "Used as Ctrl/Cmd + key to open replace mode. Default is Ctrl/Cmd + H."
      }),
      h("div", { class: "bf-helper", text: "Applied immediately to this machine" })
    )
  );
}

function panelThemes(ctx) {
  return h(
    "div",
    { class: "dgs-panel" },
    pageHeader(
      "UI themes",
      "Runtime appearance packs and the player-facing settings theme live in the UI Themes workbench.",
      "This preview links to the UI Themes surface instead of editing theme assets."
    ),
    card(
      "UI Themes workbench",
      helper("The full workbench (layout, choice orientation, appearance pack, preview surface) is reproduced in this preview under the UI Themes surface."),
      h(
        "div",
        { class: "bf-row" },
        h("img", { alt: "", style: { width: "40px", height: "40px", borderRadius: "6px", background: "#222636" } }),
        h("div", { class: "bf-col" }, badge("Example appearance pack"), h("span", { class: "bf-muted", text: "No theme assets are read or written." }))
      )
    )
  );
}

function panelAbout(ctx) {
  return h(
    "div",
    { class: "dgs-panel" },
    pageHeader("About", "Product and version information.", "This page does not edit project settings."),
    h(
      "div",
      { class: "dgs-about-card" },
      h("div", { class: "dgs-about-product", text: "Dialogue Graph System" }),
      h("div", { class: "dgs-about-version", text: "Version 4.0.0" }),
      h("div", { class: "bf-helper", text: "Example project · interactive documentation preview" })
    ),
    card(
      "Recovery demonstration (docs only)",
      toggleRow("Simulate a missing Text settings sub-asset", ctx.state.dgs.simulateMissingTextSettings, (value) => {
        ctx.state.dgs.simulateMissingTextSettings = value;
        ctx.rerender();
      }),
      helper("Shows the explicit recovery card DGS renders when a settings sub-asset is missing. Real recovery flows never create, move, or rewrite assets without confirmation.")
    )
  );
}

const panels = {
  text: panelText,
  choices: panelChoices,
  audio: panelAudio,
  "runtime-ui": panelRuntimeUI,
  "graph-ai": panelGraphAI,
  "graph-editor": panelGraphEditor,
  themes: panelThemes,
  about: panelAbout
};

export function renderSettings(ctx) {
  const active = ctx.state.dgs.settingsCategory in panels ? ctx.state.dgs.settingsCategory : "text";
  const nav = h(
    "div",
    { class: "dgs-settings-nav" },
    ...settingsCategories.map((category) =>
      h("button", {
        class: `dgs-settings-nav__item${category.id === active ? " dgs-settings-nav__item--active" : ""}`,
        type: "button",
        text: category.label,
        onclick: () => {
          ctx.state.dgs.settingsCategory = category.id;
          const surface = surfaceForMainTab("settings", category.id);
          if (ctx.navigateSurface) ctx.navigateSurface(surface, { replace: false });
          else ctx.rerender();
        }
      })
    )
  );

  const content = h("div", { class: "dgs-settings-content up-scroll" }, panels[active](ctx));
  return h("div", { class: "dgs-settings" }, nav, content);
}
