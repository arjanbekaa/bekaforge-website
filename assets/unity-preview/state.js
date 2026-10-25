/* In-memory example state. No project assets, credentials, provider calls, or
   graph serialization. Reset demo restores this snapshot. */

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const initialState = {
  dgs: {
    window: "dgs",
    mainTab: "home",
    createName: "DialogGraph",
    graphSidebarVisible: true,
    definitionTab: "characters",
    productionTab: "localization",
    settingsCategory: "text",
    homeFilter: "All",
    selectedGraph: "MarketLever",
    selectedNodeId: "dialog-1",
    favoriteGraphs: [],
    homeFilter: "All",
    homeDetailsOpen: false,
    selectedCharacter: "GateWarden",
    selectedAction: "OpenGate",
    selectedVariable: "gold",
    selectedContext: "MarketCourtyard",
    selectedIssue: "action-missing",
    trackerOpen: false,
    sandbox: false
  },
  dgsDialogs: {
    welcomeDontShow: false,
    publicTopic: "documentation",
    publicBundled: false,
    createKind: "character",
    createError: "",
    createName: "Gate Warden",
    createId: "gate_warden",
    createDescription: "The old warden of the market gate. Speaks in short, wary sentences.",
    createSpeechStyle: "Clipped, formal, watchful.",
    actionId: "open_gate",
    actionDisplayName: "Open Gate",
    actionPayload: "{\n  \"gate\": \"north\"\n}",
    actionWait: true,
    actionDelay: 0.35,
    envName: "Market Courtyard",
    envId: "env_market_courtyard",
    envDescription: "A crowded stone courtyard at the edge of the night market.",
    envAtmosphere: "Warm lanterns, restless crowd, distant rain.",
    envTone: "Wary but alive.",
    contextName: "Market Gate Confrontation",
    contextEnvironment: "Market Courtyard",
    contextGoal: "The player must convince the warden to open the north gate.",
    contextTone: "Tense, grounded.",
    contextRules: "The warden never leaves the gate. Crowd noise continues underneath.",
    validationErrors: true,
    validationWarnings: true,
    validationInfo: true,
    rewriteOriginal: "The north gate stays shut until the captain says otherwise.",
    rewriteText: "The north gate stays shut until the captain gives the order.",
    saveMode: "UseLoaded",
    saveName: "MarketLever_New",
    saveOverwrite: "MarketLever",
    importVersioned: true,
    addLanguageSearch: "",
    addLanguageSelected: ["French", "German", "Japanese"],
    addLanguageCustom: "",
    translationAvailable: true,
    ioExportTab: "export",
    ioExportTemplate: false,
    ioImportAnalyzed: true,
    modelSearch: "",
    selectedModel: "gpt-5.1-codex"
  },
  settings: {
    text: {
      typewriterEffect: "Typing",
      charsPerSecond: 28,
      allowSkipCurrentLine: true,
      allowSkipAll: false,
      allowFastForwardHold: false,
      fastForwardMultiplier: 2.05,
      autoAdvance: true,
      autoAdvanceDelay: 1.303,
      commaPause: 0.1086,
      periodPause: 0.196,
      questionPause: 0.22,
      exclamationPause: 0.22
    },
    choices: {
      wrapNavigation: true,
      holdRepeatDelay: 0.15,
      selectFirstOnEnable: true,
      mouseHoverMovesSelection: true,
      selectedOutlineColor: "#FFFFFF",
      outlineThickness: 1,
      animateSelected: true,
      animatePulseScale: 1.02,
      animatePulseSpeed: 0.35,
      showKeyHints: true,
      enableKeyboardConfirmKey: true,
      choiceConfirmKey: "F",
      alsoAcceptSubmit: true,
      acceptGamepadConfirm: true,
      acceptXRSelect: true,
      lineAdvanceKey: "Space",
      allowMouseOrTouchContinue: true
    },
    audio: {
      voiceVolume: 0.85,
      sfxVolume: 0.9,
      enableUiSfx: true,
      sfxNavigate: null,
      sfxConfirm: null,
      sfxSkip: null,
      enableTypewriterAudio: false,
      typewriterClip: null,
      typewriterVolume: 0.5,
      typewriterPitchVariance: 0.05,
      typewriterPlayEveryNChars: 1,
      typewriterMinInterval: 0.02,
      typewriterIgnoreWhitespace: true,
      typewriterIgnoreRichTextTags: true
    },
    runtimeUI: {
      showBackgroundPanel: true,
      showSpeakerName: true,
      showPortrait: true,
      showContinueIndicator: true,
      showAutoSkipIcon: true,
      showChoicePanel: true,
      showHistoryPanel: true,
      showSkipButton: true,
      showAutoButton: true,
      showHistoryButton: true,
      showLanguageButton: true,
      showSettingsButton: true,
      showSettingsPanel: true,
      showSettingsLanguageDropdown: true,
      showSettingsThemeDropdown: true,
      showSettingsTextSpeed: true,
      showSettingsAutoAdvance: true,
      showSettingsVoiceVolume: true,
      showSettingsSfxVolume: true,
      settingsTheme: "SettingsTheme_MinimalClean",
      runtimeLogMode: "WarningsOnly",
      enableDebugLogs: false
    },
    graphAI: {
      maxOperationsPerBatch: 64,
      maxNewGraphNodesPerBatch: 32,
      maxDependencyDepthPerBatch: 32,
      maxDialogueNodes: 32,
      maxChoiceConstructs: 8,
      maxChoices: 16,
      maxActionNodes: 16,
      maxConditionNodes: 16,
      maxOutcomeNodes: 4,
      maxVariableCreateUpdate: 24,
      enableDivideAndConquerAuthoring: true,
      plannerTimeoutSeconds: 60,
      maxBatchCount: 12,
      maxProviderRetriesPerBatch: 2,
      maxStructuralRepairAttempts: 3,
      maxBranchAnchorRequeues: 2,
      enableAutoFailureFeedbackReports: false,
      feedbackDetailLevel: "Compact diagnostic",
      includeOriginalUserPromptInFailureFeedback: true,
      includeGraphContextSnapshotInFailureFeedback: true,
      includeProviderRawResponseInFailureFeedback: false,
      includeDebugTraceInFailureFeedback: false,
      includeCreatedAssetPathsInFailureFeedback: true,
      maxFailureDiagnosticPayloadKilobytes: 64,
      storeLocalFailureDiagnosticReport: true,
      logPromptsInEditor: true
    },
    graphEditor: {
      colorTheme: "Warm Graphite",
      showMinimap: true,
      minZoom: 0.25,
      maxZoom: 1,
      searchShortcut: "F",
      replaceShortcut: "H"
    },
    recoveryMode: false,
    simulateMissingTextSettings: false
  },
  graphs: [
    { name: "MarketLever", title: "Market Lever", path: "Assets/Beka Forge/Dialogue Graph System/Samples/2DMarketDemo/Graphs/MarketLever.asset", modified: "2026-10-11 14:19", categories: ["Market", "Sample"], localization: "3 of 3 target languages ready", recent: true },
    { name: "MarketReward", title: "Market Reward Cache", path: "Assets/Beka Forge/Dialogue Graph System/Samples/2DMarketDemo/Graphs/MarketReward.asset", modified: "2026-10-11 14:19", categories: ["Market", "Sample"], localization: "no localization keys found.", recent: true },
    { name: "MarketExit", title: "Market Sanctum Exit", path: "Assets/Beka Forge/Dialogue Graph System/Samples/2DMarketDemo/Graphs/MarketExit.asset", modified: "2026-10-11 14:19", categories: ["Market", "Sample"], localization: "missing translations", recent: false },
    { name: "MarketTutorial", title: "Market Tutorial", path: "Assets/Beka Forge/Dialogue Graph System/Samples/2DMarketDemo/Graphs/MarketTutorial.asset", modified: "2026-10-11 14:19", categories: ["Market", "Sample"], localization: "no localization keys found.", recent: false },
    { name: "MarketWarden", title: "Market Warden", path: "Assets/Beka Forge/Dialogue Graph System/Samples/2DMarketDemo/Graphs/MarketWarden.asset", modified: "2026-10-11 14:19", categories: ["Market", "Sample"], localization: "missing translations", recent: false },
    { name: "MarketGate", title: "Market Gate", path: "Assets/Beka Forge/Dialogue Graph System/Samples/2DMarketDemo/Graphs/MarketGate.asset", modified: "2026-10-06 01:17", categories: ["Market", "Sample"], localization: "no localization keys found.", recent: false },
    { name: "MarketMerchant", title: "Market Merchant", path: "Assets/Beka Forge/Dialogue Graph System/Samples/2DMarketDemo/Graphs/MarketMerchant.asset", modified: "2026-10-06 01:17", categories: ["Market", "Sample"], localization: "no localization keys found.", recent: false }
  ],
  nodes: [
    { id: "start", kind: "Start", title: "Start", accent: "#34D399", tint: "rgba(52,211,153,0.12)", family: "core", icon: "▶", portsIn: [], portsOut: ["Out"] },
    { id: "end", kind: "End", title: "End", accent: "#F87171", tint: "rgba(248,113,113,0.12)", family: "core", icon: "■", portsIn: ["In"], portsOut: [] },
    { id: "dialog", kind: "Dialog", title: "New Node", accent: "#FB923C", tint: "rgba(251,146,60,0.12)", family: "core", icon: "💬", portsIn: ["In"], portsOut: ["Out"] },
    { id: "choice", kind: "Choice", title: "Choice Node", accent: "#60A5FA", tint: "rgba(96,165,250,0.12)", family: "core", icon: "❔", portsIn: ["In"], portsOut: ["Option 1", "Option 2"] },
    { id: "action", kind: "Action", title: "Action", accent: "#C084FC", tint: "rgba(192,132,252,0.12)", family: "core", icon: "⚡", portsIn: ["In"], portsOut: ["Out"] },
    { id: "variable", kind: "VariableMutation", title: "Set Variable", accent: "#C084FC", tint: "rgba(192,132,252,0.12)", family: "core", icon: "", portsIn: ["In"], portsOut: ["Out"] },
    { id: "condition", kind: "Condition", title: "Condition", accent: "#2DD4BF", tint: "rgba(45,212,191,0.12)", family: "core", icon: "◆", portsIn: ["In"], portsOut: ["True", "False"] },
    { id: "graphjump", kind: "GraphJump", title: "Graph Jump", accent: "#C084FC", tint: "rgba(192,132,252,0.12)", family: "core", icon: "", portsIn: ["In"], portsOut: ["Out"] },
    { id: "outcome", kind: "Outcome", title: "Outcome", accent: "#22D3EE", tint: "rgba(34,211,238,0.12)", family: "core", icon: "★", portsIn: ["In"], portsOut: ["Out"] },
    { id: "camera-switch", kind: "CameraSwitch", title: "Camera Switch", accent: "#F59E0B", tint: "rgba(245,158,11,0.12)", family: "camera", icon: "🎥", portsIn: ["In"], portsOut: ["Success"] },
    { id: "camera-move", kind: "CameraMove", title: "Camera Move", accent: "#F59E0B", tint: "rgba(245,158,11,0.12)", family: "camera", icon: "🎥", portsIn: ["In"], portsOut: ["Success"] },
    { id: "camera-lookat", kind: "CameraLookAt", title: "Camera Look At", accent: "#F59E0B", tint: "rgba(245,158,11,0.12)", family: "camera", icon: "🎥", portsIn: ["In"], portsOut: ["Success"] },
    { id: "camera-followpoint", kind: "CameraFollowPoint", title: "Camera Follow Point", accent: "#F59E0B", tint: "rgba(245,158,11,0.12)", family: "camera", icon: "🎥", portsIn: ["In"], portsOut: ["Success"] },
    { id: "camera-followtarget", kind: "CameraFollowTarget", title: "Camera Follow Target", accent: "#F59E0B", tint: "rgba(245,158,11,0.12)", family: "camera", icon: "🎥", portsIn: ["In"], portsOut: ["Success"] },
    { id: "camera-shake", kind: "CameraShake", title: "Camera Shake", accent: "#F59E0B", tint: "rgba(245,158,11,0.12)", family: "camera", icon: "🎥", portsIn: ["In"], portsOut: ["Success"] },
    { id: "camera-restore", kind: "CameraRestore", title: "Camera Restore", accent: "#F59E0B", tint: "rgba(245,158,11,0.12)", family: "camera", icon: "🎥", portsIn: ["In"], portsOut: ["Success"] },
    { id: "random", kind: "RandomBranch", title: "Random Branch", accent: "#E879F9", tint: "rgba(232,121,249,0.12)", family: "feature", icon: "🎲", portsIn: ["In"], portsOut: ["Out", "Out"] },
    { id: "switch", kind: "Switch", title: "Switch", accent: "#A3E635", tint: "rgba(163,230,53,0.12)", family: "feature", icon: "⇄", portsIn: ["In"], portsOut: ["Is false", "Is true", "Default"] },
    { id: "wait", kind: "Wait", title: "Wait", accent: "#8FA3C8", tint: "rgba(143,163,200,0.12)", family: "feature", icon: "⏱", portsIn: ["In"], portsOut: ["Out"] },
    { id: "waitfor", kind: "WaitFor", title: "Wait For", accent: "#8FA3C8", tint: "rgba(143,163,200,0.12)", family: "feature", icon: "⏳", portsIn: ["In"], portsOut: ["Out"] }
  ],
  exampleGraph: {
    name: "MarketLever",
    title: "Market Lever",
    nodes: [
      { id: "start-1", type: "start", x: 50, y: 120, title: "Start" },
      { id: "condition-1", type: "condition", x: 260, y: 70, title: "Condition", fields: { Variable: "hasKey", Type: "Boolean", Operator: "IsTrue", Value: "true", "Missing Variable = True": true } },
      { id: "action-1", type: "action", x: 690, y: 45, title: "Action", fields: { "Action ID": "OpenGate", "Registered Action": "Open Gate", "Payload Request": "{\n  \"gate\": \"north\"\n}", "Wait For Completion": true, "Before Action (sec)": 0, "After Action (sec)": 0.5 } },
      { id: "dialog-1", type: "dialog", x: 1110, y: 25, title: "Gate Warden", fields: { "Line ID": "line_gate_warden_01", Speaker: "Gate Warden", Character: "Gate Warden", Dialog: "The key turns. The gate swings open. The sanctum passage is clear.", "Display Time": 0, "Audio Clip": "warden_gate_open", "Wait for Audio": true, "Sync Text with Audio": false } },
      { id: "end-1", type: "end", x: 1660, y: 120, title: "End" },
      { id: "choice-1", type: "choice", x: 260, y: 440, title: "Choice Node", fields: { Choices: [{ id: "ask_lever", text: "Ask about the lever", requirements: [] }, { id: "leave", text: "Leave", requirements: [] }] } },
      { id: "action-2", type: "action", x: 690, y: 500, title: "Action", fields: { "Action ID": "MarketReward", "Registered Action": "Market Reward", "Payload Request": "{\n  \"amount\": 5\n}", "Wait For Completion": true, "Before Action (sec)": 0, "After Action (sec)": 0 } },
      { id: "dialog-2", type: "dialog", x: 1110, y: 480, title: "Mara", fields: { "Line ID": "line_market_mara_02", Speaker: "Mara", Character: "Mara", Dialog: "You have enough gold for Mara's key. Before you head north, how about a quick game?", "Display Time": 0, "Audio Clip": "mara_market_02", "Wait for Audio": false, "Sync Text with Audio": false } },
      { id: "outcome-1", type: "outcome", x: 50, y: 850, title: "Outcome", fields: { "Outcome ID": "market_lever_resolved", "Display Name": "Lever resolved", Description: "The player completed the lever interaction." } },
      { id: "camera-switch-1", type: "camera-switch", x: 690, y: 850, title: "Camera Switch", fields: { "Rig ID": "SanctumRig", "Blend Duration": 1.2, Ease: "SmoothStep", "Wait for completion": true } },
      { id: "wait-1", type: "wait", x: 1110, y: 920, title: "Wait", fields: { Seconds: 1 } },
      { id: "random-1", type: "random-branch", x: 1560, y: 1050, title: "Random Branch", fields: { Mode: "Weight", Branches: [{ id: "market_hint", label: "Market hint", weight: 1 }, { id: "sanctum_hint", label: "Sanctum hint", weight: 1 }] } }
    ],
    edges: [
      { from: "start-1", sourcePort: "Out", to: "condition-1", targetPort: "In" },
      { from: "condition-1", sourcePort: "True", to: "action-1", targetPort: "In", label: "True" },
      { from: "condition-1", sourcePort: "False", to: "choice-1", targetPort: "In", label: "False" },
      { from: "action-1", sourcePort: "Out", to: "dialog-1", targetPort: "In" },
      { from: "dialog-1", sourcePort: "Out", to: "end-1", targetPort: "In" },
      { from: "choice-1", sourcePort: "choice:ask_lever", to: "action-2", targetPort: "In" },
      { from: "action-2", sourcePort: "Out", to: "dialog-2", targetPort: "In" },
      { from: "dialog-2", sourcePort: "Out", to: "end-1", targetPort: "In" }
    ]
  },
  characters: [
    { id: "GateWarden", name: "Gate Warden", role: "Cast", description: "Guardian of the north gate and the market lever.", voice: "Rugged, patient", tags: ["guard", "market"], usedInGraph: true },
    { id: "Mara", name: "Mara", role: "Cast", description: "Market trader with a fondness for games.", voice: "Warm, playful", tags: ["trader"], usedInGraph: true },
    { id: "DungeonGuide", name: "Dungeon Guide", role: "Cast", description: "Unregistered speaker found in graph content.", voice: "Unknown", tags: ["unknown"], usedInGraph: false }
  ],
  actions: [
    { id: "OpenGate", name: "Open Gate", description: "Plays the gate opening sequence and unlocks the sanctum passage.", wait: true, delay: 0.5, fields: [{ key: "gateId", type: "String", required: true, tooltip: "Exact gate identifier." }] },
    { id: "MarketReward", name: "Market Reward", description: "Grants the reward cache experience.", wait: true, delay: 0, fields: [{ key: "amount", type: "Integer", required: true, tooltip: "Experience amount." }] },
    { id: "PlaySound", name: "Play Sound", description: "Plays a one-shot audio clip.", wait: false, delay: 0, fields: [{ key: "clip", type: "String", required: false, tooltip: "Audio clip key." }] }
  ],
  variables: [
    { id: "gold", name: "Gold", key: "gold", type: "Integer", value: "10", description: "Player currency.", scope: "Runtime", usedInGraph: true },
    { id: "hasKey", name: "Has Key", key: "hasKey", type: "Boolean", value: "true", description: "Whether the player owns the brass key.", scope: "Runtime", usedInGraph: true },
    { id: "marketMood", name: "Market Mood", key: "marketMood", type: "String", value: "calm", description: "Authored market tone.", scope: "Context", usedInGraph: false }
  ],
  contexts: [
    { id: "MarketCourtyard", name: "Market Courtyard", description: "Open-air market with the lever and north gate.", scene: "MarketDemo", tags: ["market", "day"] }
  ],
  localization: {
    languages: [
      { code: "en", name: "English", status: "Source" },
      { code: "de", name: "German", status: "Translated" },
      { code: "ja", name: "Japanese", status: "Missing" },
      { code: "pt-BR", name: "Portuguese (Brazil)", status: "Reviewed" }
    ],
    rows: [
      { key: "MarketLever.entry.01", speaker: "Gate Warden", text: "The key turns. The gate swings open. The sanctum passage is clear.", de: "Der Schlüssel dreht sich. Das Tor schwingt auf.", ja: "", pt: "A chave gira. O portão se abre." },
      { key: "MarketLever.entry.02", speaker: "Mara", text: "You have enough gold for Mara's key. Before you head north, how about a quick game?", de: "", ja: "", pt: "Você tem ouro suficiente..." },
      { key: "MarketLever.entry.03", speaker: "Gate Warden", text: "You already have the brass key. What else can I help with?", de: "Du hast den Messingschlüssel bereits.", ja: "真鍮の鍵はもう持っている。", pt: "Você já tem a chave de latão." }
    ]
  },
  tracker: [
    { id: "MarketLever.entry.01", speaker: "Gate Warden", text: "The key turns. The gate swings open. The sanctum passage is clear.", writing: "Complete", vo: "InProgress", localization: "Review", lipSync: "NotStarted", facial: "NotStarted", body: "NotRequired", integration: "Complete", qa: "NotStarted" },
    { id: "MarketLever.entry.02", speaker: "Mara", text: "You have enough gold for Mara's key. Before you head north, how about a quick game?", writing: "Review", vo: "Blocked", localization: "NotStarted", lipSync: "NotStarted", facial: "NotStarted", body: "NotRequired", integration: "InProgress", qa: "NotStarted" },
    { id: "MarketLever.entry.03", speaker: "Gate Warden", text: "You already have the brass key. What else can I help with?", writing: "Complete", vo: "Complete", localization: "Complete", lipSync: "Complete", facial: "Complete", body: "NotRequired", integration: "Complete", qa: "Complete" }
  ],
  health: [
    { id: "action-missing", severity: "Error", category: "Graph Usage", title: "Action ID 'MarketReward' has no exact definition", detail: "Unique exact definition resolves for OpenGate. MarketReward resolves by case only and is reported as unresolved.", graph: "MarketLever" },
    { id: "action-duplicate", severity: "Warning", category: "Action Definitions", title: "Duplicate exact action definitions", detail: "Two definitions share the exact action ID 'PlaySound'. Keep one definition per exact ID.", graph: "" },
    { id: "cast-unknown", severity: "Warning", category: "Graph Usage", title: "Speaker 'Dungeon Guide' is not registered", detail: "Case-colliding definitions or unknown speakers are shown here. Create a character asset or correct the speaker.", graph: "MarketWarden" },
    { id: "runtime-clean", severity: "Healthy", category: "Runtime Coverage", title: "Selected DialogManager wiring is complete", detail: "Local: OpenGate  •  Global: MarketReward  •  Dynamic: none", graph: "" }
  ],
  aiProviders: {
    section: "setup",
    enabled: true,
    forceStructuredJson: true,
    checklistDismissed: false,
    selectedProfile: "openai-profile",
    duplicateName: "",
    profiles: [
      { id: "codex", template: "Codex", name: "Codex", transport: "Subscription", description: "Use your ChatGPT subscription through the installed Codex CLI. Unity never stores the account token.", status: "NeedsTest", tags: ["Subscription", "Editor only"] },
      { id: "claude", template: "ClaudeCode", name: "Claude Code", transport: "Subscription", description: "Use your Claude subscription through the installed Claude Code tool. Unity never stores the account token.", status: "NeedsTest", tags: ["Subscription", "Editor only"] },
        { id: "openai-profile", template: "OpenAI", name: "My AI profile", transport: "API", description: "Provider asset for AI features. API keys stay in local editor settings and are not stored here.", path: "Assets/Beka Forge/AI Providers/ProviderAssets/OpenAIProvider.asset", status: "NeedsTest", tags: ["API", "NeedsTest"], baseUrl: "https://api.openai.com", endpoint: "/v1/chat/completions", model: "gpt-4.1-mini", apiKey: "", supported: ["JSON mode", "Streaming", "Model listing"] },
      { id: "gemini-profile", template: "Gemini", name: "Gemini Flash", transport: "API", description: "Provider asset for AI features.", path: "Assets/Beka Forge/AI Providers/ProviderAssets/GeminiProvider.asset", status: "NeedsTest", tags: ["API", "NeedsTest"], baseUrl: "https://generativelanguage.googleapis.com", model: "gemini-2.5-flash" },
      { id: "ollama-profile", template: "Ollama", name: "Local Ollama", transport: "API", description: "Provider asset for AI features.", path: "Assets/Beka Forge/AI Providers/ProviderAssets/OllamaProvider.asset", status: "Unavailable", tags: ["API", "Unavailable"], baseUrl: "http://localhost:11434", endpoint: "/api/chat", model: "gpt-oss:20b" }
    ],
    generation: { temperature: 0.2, maxTokens: 8192, sections: { Context: "", Persona: "", Goals: "", Constraints: "", "Strict Constraints": "", Response: "" }, fullPrompt: "" },
    localTool: {
      status: "Status not checked. Select Refresh status to inspect installation and authentication.",
      installation: "Not detected yet. Connect searches PATH and standard install locations again.",
      authentication: "sign-in required",
      subscription: "not available",
      billingMode: "unknown",
      executable: "",
      model: ""
    },
    modelPickerOpen: false
  },
  banter: {
    view: "getting-started",
    kitFolderName: "BanterAuthoringKit",
    kitCreated: false,
    selectionCount: 2,
    sampleStatus: 0,
    collections: [{ id: "MarketBanterCollection", label: "Market Banter Collection" }],
    externalIds: [],
    report: null,
    debugger: {
      root: "BanterHost",
      recording: false,
      output: null
    }
  },
  sound: {
    view: "sequencer",
    sequenceName: "MarketAmbience",
    graphName: "MarketLever",
    graphSoundState: "attached",
    graphRetired: false,
    frameRate: 30,
    durationFrames: 442,
    loop: true,
    playhead: 53,
    playing: false,
    status: "Ready to audition from the playhead.",
    sequenceOpen: true,
    sceneOpen: true,
    tracks: [{ name: "Track 1", clip: "dragon-studio-single-key-press-393908", startFrame: 0, muted: false, solo: false }],
    selectedTrack: 0,
    bindingKey: "MarketEmitter",
    bindingResolved: true
  },
  inspectors: {
    view: "dialogue-node",
    assetTarget: "DialogGraph",
    dialogManager: {
      doDebug: true,
      dialogGraphs: [
        { dialogID: "market_gate", dialogGraph: "MarketGate (Dialog Graph)" },
        { dialogID: "market_friend", dialogGraph: "MarketFriend (Dialog Graph)" },
        { dialogID: "market_lever", dialogGraph: "MarketLever (Dialog Graph)" }
      ],
      dialogUiManagerPrefab: "DialogueUIManager (Dialog UI Manager)",
      dialogUiManager: "DialogueUIManager (Dialog UI Manager)",
      audioSource: "None (Audio Source)",
      localTextSettings: "MarketForegroundTextSettings (Dialog Text Settings)",
      localAudioSettings: "None (Dialog Audio Settings)",
      localUiSettings: "None (Dialogue Runtime UI Settings)",
      localChoiceSettings: "MarketTutorialChoiceSettings (Dialog Choice Settings)",
      actionRunner: "DGS Dialogue Manager (Dialog Action Runner)",
      variableStore: "Market Demo Runtime (Dialogue Variable Store)",
      bootstrapMissing: false,
      validationIssues: [],
      showGraphs: true, showGraphList: true, showUi: true, showAudio: true, showOverrides: true, showActions: true, showVariables: true
    },
    node: {
      name: "Market_GateGreeting",
      guid: "9f2c41d8b3e746a1a5c02f7e8d3b1c64",
      speakerName: "Gate Warden",
      lineText: "Hold there, traveller. The sanctum keys were spoken with, not spoken for.",
      waitForAudio: true,
      syncTextWithAudio: false,
      displayTime: 0,
      audioClip: "gate-warden-greeting-01",
      playing: false
    },
    variable: {
      key: "market_gate_access",
      displayName: "Market Gate Access",
      type: "Integer",
      description: "Tracks how often the player secured access to the market gate.",
      category: "Progression",
      tags: ["economy", "quest"],
      definitionId: "d9b8f0e2-3c47-4d9a-8f21-5a6d3b7c9e01",
      rulesEnabled: true,
      min: 0,
      max: 99,
      duplicatePreview: false,
      deleteAttempt: false,
      renameDraft: "market_gate_access"
    },
    store: {
      playing: true,
      runtimeEdit: false,
      targetStore: "DialogueVariableStore (example)",
      search: "",
      changedOnly: false,
      status: "6 variable(s) · 6 shown · 0 change(s) observed"
    },
    camera: {
      rigTarget: "BekaCameraRig",
      managerExpanded: false,
      outputCamera: "Main Camera (example)",
      rigStableId: "market-main",
      fieldOfView: 60,
      targetStableId: "gate-focus"
    },
    interactable: {
      actionLabel: "Open",
      objectLabel: "Front Door",
      interactionMode: "Press",
      actionSource: "Automatic",
      customAction: "SampleDoorAction (example)",
      holdDuration: 1.5,
      isAvailable: true,
      disabledReason: "",
      pickerOpen: false,
      exampleIssue: false,
      runtimeExpanded: false,
      helpExpanded: false
    },
    interactor: {
      reachOrigin: "Camera (example)",
      viewTransform: "Camera (example)",
      targetingMode: "LookAt",
      reach: 3,
      viewHalfAngle: 60,
      checkObstruction: true,
      targetMask: "Interactable (8)",
      obstructionMask: "Default (0)",
      angleHysteresis: 5,
      distanceHysteresis: 0.2,
      reevaluationInterval: 0.1,
      queryCeiling: 512,
      advancedOpen: false,
      exampleIssue: false,
      runtimeExpanded: false,
      helpExpanded: false
    }
  },
  themes: {
    view: "workbench",
    catalogExists: true,
    layout: "IntegratedCard",
    choiceOrientation: "Horizontal",
    appearance: "Minimal Clean",
    aspect: "16:9",
    zoomToEdited: true,
    target: "Dialogue panel",
    tab: "Style",
    panels: { choices: true, history: false, settings: false, banter: false },
    sampleLine: "The sanctum passage is clear. Take the north gate.",
    sampleChoices: "2 choices",
    showPortrait: true,
    showSafeAreaGuide: false,
    previewStatus: "Preview up to date",
    unsaved: false,
    issues: 0,
    dragNewOrder: ""
  },
  aiPanel: {
    view: "floating-panel",
    adVisible: false,
    connection: "Ready — test passed",
    prompt: "Add a tense confrontation between the warden and the player at the market gate.",
    scope: "Auto",
    context: "No Environment",
    optionsOpen: false,
    diagnosticsOpen: false,
    debugOpen: false,
    draftMode: "dialog-nodes",
    recoveryBanner: false,
    validationResult: false,
    locRecovery: false,
    flowRecovery: false,
    banterDirty: true,
    fillSection: "Overview",
    planStatus: "Ready",
    planPartial: false,
    planRecovery: false,
    progressExpanded: true,
    progressSessions: { running: true, plan: true, decision: true },
    progressDecision: false,
    progressBlocker: false
  }
};

export const demoInitialState = clone(initialState);
export const demo = clone(initialState);

export function resetDemo() {
  deepAssign(demo, clone(initialState));
}

function deepAssign(target, source) {
  for (const key of Object.keys(target)) delete target[key];
  Object.assign(target, source);
}

resetDemo();

export default demo;
