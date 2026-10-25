import {
  h,
  card,
  field,
  helper,
  badge,
  textRow,
  multilineRow,
  textInput,
  numberRow,
  enumRow,
  toggleRow,
  sliderRow,
  sectionTitle,
  foldout,
  toastOn
} from "./controls.js";

const activities = ["Idle", "Working", "Exploring", "Combat", "Cinematic", "Disabled", "Custom"];
const cadences = ["Even", "Measured", "Conversational", "Energetic", "Hesitant", "Custom"];
const pauseKinds = [
  { key: "comma", label: "Comma", seconds: "commaPauseSeconds", multiplier: "commaPauseMultiplier" },
  { key: "sentence", label: "Sentence", seconds: "sentencePauseSeconds", multiplier: "sentencePauseMultiplier" },
  { key: "ellipsis", label: "Ellipsis", seconds: "ellipsisPauseSeconds", multiplier: "ellipsisPauseMultiplier" },
  { key: "question", label: "Question", seconds: "questionPauseSeconds", multiplier: "questionPauseMultiplier" },
  { key: "emphasis", label: "Emphasis", seconds: "emphasisPauseSeconds", multiplier: "emphasisPauseMultiplier" }
];
const responseStates = [
  { key: "exertion", label: "Exertion" },
  { key: "injury", label: "Injury" },
  { key: "illness", label: "Illness" },
  { key: "urgency", label: "Urgency" }
];

function slug(value) {
  return String(value || "character")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "character";
}

function number(value, fallback) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function ensureCharacterBible(character) {
  if (!character) return null;
  if (!character.bible) {
    const id = character.id || slug(character.name);
    const traits = Array.isArray(character.traits) && character.traits.length ? character.traits : ["Watchful", "Patient"];
    character.bible = {
      characterID: id,
      displayName: character.name || "Character",
      portrait: character.portrait || `${slug(id)}_portrait`,
      shortDescription: character.description || "",
      personalityTraits: [...traits],
      speechStyle: character.speechStyle || character.voice || "Measured, deliberate.",
      exampleLines: Array.isArray(character.exampleLines) && character.exampleLines.length
        ? [...character.exampleLines]
        : ["The north gate stays shut until the captain gives the order."],
      role: character.role && character.role !== "Cast" ? character.role : "Supporting cast",
      defaultLocale: character.defaultLocale || "en",
      voiceSummary: character.voiceSummary || character.voice || "Rugged, patient, low in the chest.",
      vocalTexture: character.vocalTexture || "Sandpaper-warm",
      vocalAgeImpression: character.vocalAgeImpression || "Late forties",
      accentDirection: character.accentDirection || "Neutral northern market accent",
      formalityRegister: number(character.formalityRegister, 0.65),
      humor: number(character.humor, 0.2),
      directness: number(character.directness, 0.8),
      emotionalOpenness: number(character.emotionalOpenness, 0.25),
      vocabularyGuidance: character.vocabularyGuidance || "Gatekeeping, trade, weather, old roads.",
      sentenceStructureGuidance: character.sentenceStructureGuidance || "Short declaratives. Avoids stacked clauses.",
      commonExpressions: character.commonExpressions || "\"State your business.\" / \"That is the rule.\"",
      avoidedExpressions: character.avoidedExpressions || "No courtly flattery or modern slang.",
      profanityPolicy: character.profanityPolicy || "Mild only, and rarely.",
      performanceNotes: character.performanceNotes || "Keep the voice grounded; let pauses carry the authority.",
      pronunciationEntries: Array.isArray(character.pronunciationEntries) && character.pronunciationEntries.length
        ? character.pronunciationEntries.map((entry) => ({ ...entry }))
        : [
            { term: "Sanctum", pronunciation: "SANK-tum", note: "No soft c." },
            { term: "Beka Forge", pronunciation: "BEH-kah FORJ", note: "Even stress." }
          ],
      ageAndPhysicality: character.ageAndPhysicality || "Heavy build, stiff left shoulder, deliberate gait.",
      fitnessNotes: character.fitnessNotes || "Strong but not quick; avoids climbing.",
      chronicConditionNotes: character.chronicConditionNotes || "Old shoulder injury aches in cold weather.",
      breathingDirection: character.breathingDirection || "Audible exhale before a refusal; steady otherwise.",
      baselineExertion: number(character.baselineExertion, 0.12),
      baselineInjury: number(character.baselineInjury, 0.08),
      baselineIllness: number(character.baselineIllness, 0),
      baselineUrgency: number(character.baselineUrgency, 0.22),
      defaultActivity: character.defaultActivity || "Idle",
      customActivityKey: character.customActivityKey || "",
      deliveryPreset: character.deliveryPreset || "Warden Natural",
      overridePresetDelivery: !!character.overridePresetDelivery,
      delivery: {
        enabled: character.delivery?.enabled !== false,
        naturalCharactersPerSecond: number(character.delivery?.naturalCharactersPerSecond, 35),
        cadence: character.delivery?.cadence || "Conversational",
        cadenceVariation: number(character.delivery?.cadenceVariation, 0.16),
        commaPauseSeconds: number(character.delivery?.commaPauseSeconds, 0.2),
        commaPauseMultiplier: number(character.delivery?.commaPauseMultiplier, 1),
        sentencePauseSeconds: number(character.delivery?.sentencePauseSeconds, 0.35),
        sentencePauseMultiplier: number(character.delivery?.sentencePauseMultiplier, 1),
        ellipsisPauseSeconds: number(character.delivery?.ellipsisPauseSeconds, 0.5),
        ellipsisPauseMultiplier: number(character.delivery?.ellipsisPauseMultiplier, 1),
        questionPauseSeconds: number(character.delivery?.questionPauseSeconds, 0.35),
        questionPauseMultiplier: number(character.delivery?.questionPauseMultiplier, 1),
        emphasisPauseSeconds: number(character.delivery?.emphasisPauseSeconds, 0.35),
        emphasisPauseMultiplier: number(character.delivery?.emphasisPauseMultiplier, 1),
        minimumPauseSeconds: number(character.delivery?.minimumPauseSeconds, 0.04),
        maximumPauseSeconds: number(character.delivery?.maximumPauseSeconds, 1.5)
      },
      stateResponses: character.stateResponses || {
        exertion: { speechRate: 0.92, punctuation: 1.08, breathFrequency: 0.3, breathIntensity: 0.35 },
        injury: { speechRate: 0.9, punctuation: 1.12, breathFrequency: 0.2, breathIntensity: 0.25 },
        illness: { speechRate: 0.88, punctuation: 1.15, breathFrequency: 0.25, breathIntensity: 0.2 },
        urgency: { speechRate: 1.12, punctuation: 0.9, breathFrequency: 0.4, breathIntensity: 0.3 }
      },
      banterAssets: Array.isArray(character.banterAssets) && character.banterAssets.length
        ? [...character.banterAssets]
        : ["Market Gate Banter"]
    };
  }
  return character.bible;
}

function sourceTextRow(label, object, key, ctx, options = {}) {
  const bible = ensureCharacterBible(object);
  return textRow(label, bible[key], (value) => { bible[key] = value; }, options);
}

function sourceMultilineRow(label, object, key, ctx, options = {}) {
  const bible = ensureCharacterBible(object);
  return multilineRow(label, bible[key], (value) => { bible[key] = value; }, options);
}

function feedbackRow(message, tone = "info") {
  return h("div", { class: `pf-helpbox pf-helpbox--${tone}`, text: message });
}

function identityCard(character, ctx) {
  const bible = ensureCharacterBible(character);
  let content;

  if (character._idEditing) {
    const commit = () => {
      const candidate = (bible.characterID || "").trim();
      const characters = ctx?.state?.characters || [];
      if (!candidate) {
        character._idError = "Character ID cannot be blank.";
        ctx?.rerender?.();
        return;
      }
      if (characters.some((entry) => entry !== character && String(entry.id || entry.bible?.characterID || "").toLowerCase() === candidate.toLowerCase())) {
        character._idError = "Character ID collides with another character. IDs are case-sensitive for references but must be unique when ignoring case.";
        ctx?.rerender?.();
        return;
      }
      character.id = candidate;
      character.bible.characterID = candidate;
      character._idEditing = false;
      character._idError = "";
      ctx?.rerender?.();
    };

    content = h(
      "div",
      null,
      feedbackRow("Changing an ID can break exact references. IDs are opaque and are never normalized.", "warning"),
      field("Character ID", textInput(bible.characterID, (value) => { bible.characterID = value; }, { placeholder: "character_id" })),
      character._idError ? feedbackRow(character._idError, "error") : null,
      h(
        "div",
        { class: "bf-row", style: { marginTop: "8px" } },
        h("button", { class: "bf-button bf-button--primary", type: "button", text: "Apply ID", onclick: commit }),
        h("button", {
          class: "bf-button",
          type: "button",
          text: "Cancel",
          onclick: () => {
            character._idEditing = false;
            character._idError = "";
            ctx?.rerender?.();
          }
        })
      )
    );
  } else {
    content = h(
      "div",
      null,
      field(
        "Character ID",
        h(
          "div",
          { class: "bf-row", style: { flexWrap: "wrap" } },
          h("code", { class: "insp-guid", text: bible.characterID }),
          h("button", {
            class: "bf-button",
            type: "button",
            text: character._idCopied ? "Copied" : "⧉ Copy",
            title: "Copy the exact ID to the clipboard.",
            onclick: () => {
              character._idCopied = true;
              ctx?.rerender?.();
            }
          }),
          h("button", {
            class: "bf-button",
            type: "button",
            text: "✎ Edit",
            title: "Open an explicit ID edit draft. Validation rejects blank, duplicate, and case-colliding candidates.",
            onclick: () => {
              character._idEditing = true;
              character._idError = "";
              ctx?.rerender?.();
            }
          })
        )
      ),
      textRow("Display Name", bible.displayName, (value) => {
        bible.displayName = value;
        character.name = value;
      }),
      helper("Exact stable ID. Editing opens a validated draft; IDs are never normalized.")
    );
  }

  return card("Identity", content);
}

function listCard(title, items, options, ctx) {
  const rows = items.length
    ? items.map((item, index) =>
        h(
          "div",
          { class: "bf-row", style: { marginBottom: "6px", alignItems: "center" } },
          options.renderItem(item, index),
          h("button", {
            class: "bf-button",
            type: "button",
            text: "×",
            title: `Remove ${options.itemNoun}`,
            onclick: () => {
              items.splice(index, 1);
              ctx?.rerender?.();
            }
          })
        )
      )
    : [h("div", { class: "dgs-list-card__empty", text: `No ${options.itemNoun.toLowerCase()}s yet.` })];
  return h(
    "div",
    { class: "dgs-cast-list-card" },
    h(
      "div",
      { class: "bf-row", style: { justifyContent: "space-between", alignItems: "center" } },
      sectionTitle(title),
      h("span", { class: "bf-chip", text: `${items.length} ${items.length === 1 ? options.itemNoun.toLowerCase() : `${options.itemNoun.toLowerCase()}s`}` })
    ),
    helper(options.help),
    ...rows,
    h("button", {
      class: "bf-button",
      type: "button",
      text: `+ Add ${options.itemNoun}`,
      onclick: () => {
        items.push(options.newItem());
        ctx?.rerender?.();
      }
    })
  );
}

function writingCard(character, ctx) {
  const bible = ensureCharacterBible(character);
  return card(
    "Writing Context",
    sourceMultilineRow("Description", character, "shortDescription", ctx, { rows: 4, stacked: true }),
    listCard("Personality Traits", bible.personalityTraits, {
      itemNoun: "Trait",
      help: "Free-form labels used by AI-assisted drafting and search.",
      renderItem: (item, index) => textInput(item, (value) => { bible.personalityTraits[index] = value; }, { placeholder: "single words like watchful or sardonic" }),
      newItem: () => "New trait"
    }, ctx)
  );
}

function voiceCards(character, ctx) {
  const bible = ensureCharacterBible(character);
  const register = (key) => sliderRow(
    key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase()),
    bible[key],
    0,
    1,
    0.01,
    (value) => { bible[key] = value; },
    { format: (value) => value.toFixed(2) }
  );

  return [
    card(
      "Voice & Texture",
      sourceTextRow("Role", character, "role", ctx),
      sourceTextRow("Default Locale", character, "defaultLocale", ctx),
      sourceMultilineRow("Voice Summary", character, "voiceSummary", ctx, { rows: 2 }),
      sourceTextRow("Vocal Texture", character, "vocalTexture", ctx),
      sourceTextRow("Vocal Age Impression", character, "vocalAgeImpression", ctx),
      sourceTextRow("Accent Direction", character, "accentDirection", ctx)
    ),
    card(
      "Register & Personality",
      register("formalityRegister"),
      register("humor"),
      register("directness"),
      register("emotionalOpenness")
    ),
    card(
      "Speech Style & Guidance",
      sourceMultilineRow("Speech Style", character, "speechStyle", ctx, { rows: 2 }),
      sourceMultilineRow("Vocabulary Guidance", character, "vocabularyGuidance", ctx, { rows: 2 }),
      sourceMultilineRow("Sentence Structure Guidance", character, "sentenceStructureGuidance", ctx, { rows: 2 }),
      sourceMultilineRow("Common Expressions", character, "commonExpressions", ctx, { rows: 2 }),
      sourceMultilineRow("Avoided Expressions", character, "avoidedExpressions", ctx, { rows: 2 }),
      sourceTextRow("Profanity Policy", character, "profanityPolicy", ctx)
    ),
    listCard("Example Lines", bible.exampleLines, {
      itemNoun: "Line",
      help: "Reference lines for VO sessions and AI drafting. Stored exactly as authored.",
      renderItem: (item, index) => textInput(item, (value) => { bible.exampleLines[index] = value; }, { placeholder: "a short spoken line" }),
      newItem: () => "New reference line"
    }, ctx),
    card(
      "Examples & Performance",
      sourceMultilineRow("Performance Notes", character, "performanceNotes", ctx, { rows: 3, stacked: true })
    ),
    card(
      "Pronunciation",
      helper("Hints for VO sessions and previews — stored exactly as authored."),
      ...(bible.pronunciationEntries.length
        ? bible.pronunciationEntries.map((entry, index) =>
            h(
              "div",
              { class: "dgs-pronunciation-row", style: { marginBottom: "10px" } },
              h("div", { class: "bf-row", style: { justifyContent: "space-between" } },
                h("span", { class: "bf-field__label", text: `Entry ${index + 1}` }),
                h("button", {
                  class: "bf-button",
                  type: "button",
                  text: "×",
                  title: "Remove entry",
                  onclick: () => {
                    bible.pronunciationEntries.splice(index, 1);
                    ctx?.rerender?.();
                  }
                })
              ),
              textRow("Term", entry.term, (value) => { entry.term = value; }),
              textRow("Pronunciation", entry.pronunciation, (value) => { entry.pronunciation = value; }),
              multilineRow("Note", entry.note, (value) => { entry.note = value; }, { rows: 2 })
            )
          )
        : [helper("No entries yet. Add a term with a phonetic hint so VO and previews say it the same way every time.")]),
      h("button", {
        class: "bf-button",
        type: "button",
        text: "+ Add Entry",
        onclick: () => {
          bible.pronunciationEntries.push({ term: "New term", pronunciation: "", note: "" });
          ctx?.rerender?.();
        }
      })
    )
  ];
}

function deliveryCards(character, ctx) {
  const bible = ensureCharacterBible(character);
  const delivery = bible.delivery;
  const stateCard = card(
    "State Responses",
    helper("Curves map each 0–1 state to rate, pause and breath multipliers. Starting assumptions — never live game state."),
    ...responseStates.map((state) =>
      foldout(
        state.label,
        h(
          "div",
          null,
          ...[
            ["Speech Rate Multiplier", "speechRate", 0.25, 2],
            ["Punctuation Pause Multiplier", "punctuation", 0.25, 2],
            ["Breath Frequency Response", "breathFrequency", 0, 1],
            ["Breath Intensity Response", "breathIntensity", 0, 1]
          ].map(([label, key, min, max]) =>
            numberRow(label, bible.stateResponses[state.key][key], min, null, (value) => { bible.stateResponses[state.key][key] = value; })
          )
        ),
        true
      )
    ),
    h("button", {
      class: "bf-button",
      type: "button",
      text: "Apply Tired Speech Starter",
      title: "Applies a conservative tired-speech curve set to the Exertion response (Undo-backed). Overwrites the current Exertion curves.",
      onclick: () => {
        bible.stateResponses.exertion = { speechRate: 0.82, punctuation: 1.18, breathFrequency: 0.55, breathIntensity: 0.5 };
        ctx?.rerender?.();
      }
    })
  );

  return [
    card(
      "Preset & Inline Delivery",
      helper("The preset is read without copying; inline values shadow it while the override is on."),
      field("Delivery Preset", h("div", { class: "bf-object-preview" }, h("span", { class: "bf-object-preview__name", text: bible.deliveryPreset || "None (Inline)" }))),
      toggleRow("Override Preset Delivery", bible.overridePresetDelivery, (value) => { bible.overridePresetDelivery = value; }),
      h(
        "div",
        { class: "bf-row", style: { flexWrap: "wrap" } },
        h("button", { class: "bf-button", type: "button", text: "Copy Preset Inline", onclick: () => { bible.overridePresetDelivery = true; ctx?.rerender?.(); } }),
        h("button", { class: "bf-button", type: "button", text: "Detach Preset", onclick: () => { bible.deliveryPreset = ""; bible.overridePresetDelivery = false; ctx?.rerender?.(); } }),
        h("button", { class: "bf-button", type: "button", text: "Create Preset", onclick: () => { bible.deliveryPreset = `${bible.displayName} Delivery`; ctx?.rerender?.(); } }),
        h("button", { class: "bf-button", type: "button", text: "Edit Preset", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Delivery Preset", "Demo only: this preview does not open the preset editor.") }),
        h("button", { class: "bf-button", type: "button", text: "Open", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Delivery Preset", "Demo only: this preview does not open an asset.") }),
        h("button", { class: "bf-button", type: "button", text: "Ping", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Delivery Preset", "Demo only: this preview does not select assets in Unity's Project window.") })
      )
    ),
    card(
      "Text Reveal",
      helper("Opt-in text pacing for preview and runtime. Live state belongs to each manager/session."),
      toggleRow("Enabled", delivery.enabled, (value) => { delivery.enabled = value; ctx?.rerender?.(); }),
      enumRow("Cadence", delivery.cadence, cadences.map((value) => ({ value, label: value })), (value) => { delivery.cadence = value; ctx?.rerender?.(); }),
      sliderRow("Cadence Variation", delivery.cadenceVariation, 0, 1, 0.01, (value) => { delivery.cadenceVariation = value; }, { format: (value) => value.toFixed(2) }),
      numberRow("Natural Characters Per Second", delivery.naturalCharactersPerSecond, 1, 35, (value) => { delivery.naturalCharactersPerSecond = value; }, { unit: "cps" })
    ),
    card(
      "Punctuation Pauses",
      helper("Durations are base waits; multipliers scale them while speaking."),
      ...pauseKinds.flatMap((pause) => [
        numberRow(`${pause.label} Pause`, delivery[pause.seconds], 0, null, (value) => { delivery[pause.seconds] = value; }, { unit: "s" }),
        numberRow(`${pause.label} Multiplier`, delivery[pause.multiplier], 0, null, (value) => { delivery[pause.multiplier] = value; })
      ]),
      numberRow("Minimum Pause", delivery.minimumPauseSeconds, 0, null, (value) => { delivery.minimumPauseSeconds = value; }, { unit: "s" }),
      numberRow("Maximum Pause", delivery.maximumPauseSeconds, 0, null, (value) => { delivery.maximumPauseSeconds = value; }, { unit: "s" })
    ),
    card(
      "Breathing",
      sourceMultilineRow("Breathing Direction", character, "breathingDirection", ctx, { rows: 2 })
    ),
    stateCard
  ];
}

function physicalCards(character, ctx) {
  const bible = ensureCharacterBible(character);
  return [
    card(
      "Body & Condition",
      sourceMultilineRow("Age and Physicality", character, "ageAndPhysicality", ctx, { rows: 2 }),
      sourceMultilineRow("Fitness Notes", character, "fitnessNotes", ctx, { rows: 2 }),
      sourceMultilineRow("Chronic Condition Notes", character, "chronicConditionNotes", ctx, { rows: 2 })
    ),
    card(
      "Authored Baselines",
      helper("Starting assumptions for previews — never live game state."),
      sliderRow("Baseline Exertion", bible.baselineExertion, 0, 1, 0.01, (value) => { bible.baselineExertion = value; }, { format: (value) => value.toFixed(2) }),
      sliderRow("Baseline Injury", bible.baselineInjury, 0, 1, 0.01, (value) => { bible.baselineInjury = value; }, { format: (value) => value.toFixed(2) }),
      sliderRow("Baseline Illness", bible.baselineIllness, 0, 1, 0.01, (value) => { bible.baselineIllness = value; }, { format: (value) => value.toFixed(2) }),
      sliderRow("Baseline Urgency", bible.baselineUrgency, 0, 1, 0.01, (value) => { bible.baselineUrgency = value; }, { format: (value) => value.toFixed(2) })
    ),
    card(
      "Activity",
      enumRow("Default Activity", bible.defaultActivity, activities.map((value) => ({ value, label: value })), (value) => { bible.defaultActivity = value; ctx?.rerender?.(); }),
      bible.defaultActivity === "Custom" ? textRow("Custom Activity Key", bible.customActivityKey, (value) => { bible.customActivityKey = value; }) : null,
      helper("Default activity used by previews when no state overrides apply. Custom uses the key below.")
    ),
    card(
      "Banter Library",
      helper("Authoritative banter membership. Assets own their IDs and content and may be shared by characters."),
      ...(bible.banterAssets.length
        ? bible.banterAssets.map((entry) => h("div", { class: "bf-row" }, badge(entry)))
        : [helper("No banter assets are assigned to this character.")])
    ),
    card(
      "Diagnostics",
      helper("Character/cast validation runs against the registered definitions."),
      feedbackRow("No blocking character diagnostics. Example asset only.", "info")
    )
  ];
}

export function renderCharacterWorkbench(character, ctx = {}) {
  ensureCharacterBible(character);
  return h(
    "div",
    { class: "dgs-character-workbench" },
    identityCard(character, ctx),
    card(
      "Visuals",
      field("Portrait", h("div", { class: "bf-object-preview" }, h("span", { class: "bf-object-preview__icon" }), h("span", { class: "bf-object-preview__name", text: `${character.bible.portrait} (example sprite)` }))),
      helper("Optional portrait sprite for runtime or editor previews.")
    ),
    writingCard(character, ctx),
    ...voiceCards(character, ctx),
    ...deliveryCards(character, ctx),
    ...physicalCards(character, ctx)
  );
}
