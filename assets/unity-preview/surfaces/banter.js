/* Banter editor windows: Getting Started, Catalog Validation, Decision Debugger.
   Strings are copied from:
   - BanterGettingStartedWindow.cs
   - BanterCatalogValidationWindow.cs / BanterCatalogValidationReport.cs
   - BanterDecisionDebuggerWindow.cs / BanterDecisionTraceExporter.cs
   Example data only; no assets are created, validated, or written. */

import {
  h, card, field, helper, badge, textRow, textInput, toggleRow, windowFrame, sectionTitle,
  foldout, toastOn
} from "../controls.js";

export const entries = [
  { id: "getting-started", label: "Banter · Getting Started" },
  { id: "catalog-validation", label: "Banter · Catalog Validation" },
  { id: "decisions", label: "Banter · Decision Debugger" }
];

export const note =
  "Recreated from the Banter editor windows (Tools > Beka Forge > Dialogue Graph System > Banter). " +
  "Validation results and decision traces are fabricated examples; this page never scans the project, reads assets, or records runtime state.";

function toastAfterRender(title, message) {
  setTimeout(() => {
    const windowEl = document.querySelector(".up-window");
    if (windowEl) toastOn(windowEl, title, message);
  }, 0);
}

function gettingStarted(ctx) {
  const s = ctx.state.banter;
  const statuses = [
    "The sample uses a contextual, text-only presentation adapter. A Banter HUD is a separate optional presentation.",
    "Stop Play Mode before opening the sample scene.",
    "The sample scene is missing. Check the sample README and expected scene path below."
  ];

  return windowFrame({
    title: "Banter Getting Started",
    className: "pf-window up-window--compact",
    body: h(
      "div",
      { class: "up-scroll", style: { padding: "14px", maxHeight: "640px" } },
      h("div", { class: "bf-muted", text: "Beka Forge · Dialogue Graph System" }),
      h("div", { class: "dgs-page-header__title", text: "Banter Getting Started" }),
      helper("Explore a working sample, create validated authoring assets, or validate the collections you choose. Creating the kit only creates assets; it does not wire a scene or start playback."),
      h(
        "div",
        { class: "bf-row", style: { margin: "10px 0" } },
        h("button", { class: "bf-button", type: "button", text: "Open Banter Quickstart", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Banter Getting Started", "Open Banter Quickstart opens QUICKSTART.md in Unity. Demo only.") }),
        h("button", { class: "bf-button", type: "button", text: "Open Banter Authoring Guide", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Banter Getting Started", "Open Banter Authoring Guide opens AUTHORING.md in Unity. Demo only.") })
      ),
      h("div", { class: "bf-divider" }),
      stepRow("1", "Open the sample", "See Banter working in the 2D Market Demo.", [
        h("button", { class: "bf-button bf-button--primary", type: "button", text: "Open 2D Market Demo", onclick: () => { s.sampleStatus = (s.sampleStatus + 1) % statuses.length; ctx.rerender(); toastAfterRender("Banter Getting Started", "Demo only: this preview does not open Unity scenes. In Unity this opens the 2D Market Demo scene."); } }),
        h("button", { class: "bf-button", type: "button", text: "Open the 2D Market Demo README", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Banter Getting Started", "The README opens as a text asset in Unity. Demo only.") }),
        h("div", { class: "bf-helper", text: `Expected scene: Assets/Beka Forge/Dialogue Graph System/Samples/2DMarketDemo/Scenes/MarketDemo.unity` }),
        h("div", { class: "bf-helper", text: statuses[s.sampleStatus] }),
        h("div", { class: "bf-muted", text: "Select this step's status repeatedly to preview each sample state." })
      ]),
      stepRow("2", "Create a validated authoring kit", "Name the new kit folder, then choose its existing parent inside Assets.", [
        textRow("New kit folder name", s.kitFolderName, (value) => { s.kitFolderName = value; }),
        h("button", {
          class: "bf-button bf-button--primary",
          type: "button",
          text: "Choose parent and create kit",
          onclick: (event) => {
            s.kitCreated = true;
            ctx.rerender();
            toastAfterRender("Banter Getting Started", "Demo only: this preview did not create assets. In Unity this opens a folder picker, then creates and validates the kit.");
          }
        }),
        helper("The kit contains an Exchange, Collection, and Director Profile that pass authoring validation. The asset Inspector does not play Banter; runtime playback needs a wired scene and host."),
        s.kitCreated
          ? h("div", null,
              h("div", { class: "bf-success-text", text: `Created and validated in Assets/${s.kitFolderName} (example result)` }),
              h("div", { class: "bf-row", style: { marginTop: "6px" } },
                h("button", { class: "bf-button", type: "button", text: "Ping Exchange", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Banter Getting Started", "Ping highlights the created Exchange asset in the Project window in Unity. Demo only.") }),
                h("button", { class: "bf-button", type: "button", text: "Ping Collection", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Banter Getting Started", "Ping highlights the created Collection asset in the Project window in Unity. Demo only.") }),
                h("button", { class: "bf-button", type: "button", text: "Ping Director Profile", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Banter Getting Started", "Ping highlights the created Director Profile asset in the Project window in Unity. Demo only.") })
              )
            )
          : null
      ]),
      stepRow("3", "Validate chosen collections", "Validation uses only Banter Collection assets in the current Unity selection. It never scans the project.", [
        h("button", {
          class: "bf-button bf-button--primary",
          type: "button",
          text: "Validate selected collections",
          onclick: () => { s.pendingValidate = true; ctx.navigateSurface("catalog-validation", { replace: false }); toastAfterRender("Banter Getting Started", "Demo only: no collections were validated. The Catalog Validation surface shows fabricated example results."); }
        }),
        h("div", { class: "bf-helper", text: s.selectionCount === 1 ? `${s.selectionCount} Banter Collection selected.` : `${s.selectionCount} Banter Collections selected.` }),
        h("div", { class: "bf-muted", text: "Select one or more Banter Collection assets in the Project window to enable this check." })
      ])
    ),
    footer: h("div", { class: "bf-status-bar" }, h("span", { text: "Min size 320 × 360" }))
  });
}

function stepRow(number, title, summary, children) {
  return h(
    "div",
    { class: "pf-step" },
    h("div", { class: "pf-step__head" },
      h("span", { class: "pf-step__number", text: number }),
      h("span", { class: "pf-step__title", text: title })
    ),
    h("div", { class: "bf-helper", text: summary }),
    h("div", { class: "pf-step__body" }, ...children)
  );
}

const statusTexts = {
  failed: "FAILED — catalog compilation returned fatal diagnostics.",
  empty: "SUCCEEDED WITH EXCLUSIONS — all supplied content excluded; retained catalog is empty.",
  partial: "SUCCEEDED WITH EXCLUSIONS — retained content is available with excluded content removed.",
  clean: "SUCCEEDED — clean catalog compilation."
};

function catalogValidation(ctx) {
  const s = ctx.state.banter;

  if (s.pendingValidate && !s.report) {
    s.report = exampleReport();
    s.pendingValidate = false;
  }

  const listEditor = (items, renderItem, emptyText, onMove, onRemove, onAdd, addLabel) =>
    h(
      "div",
      { class: "pf-list-editor" },
      ...items.map((item, index) => h("div", { class: "pf-list-row" }, renderItem(item, index),
        h("button", { class: "bf-button", type: "button", disabled: index === 0, text: "Up", style: { width: "42px" }, onclick: () => onMove(index, -1) }),
        h("button", { class: "bf-button", type: "button", disabled: index === items.length - 1, text: "Down", style: { width: "48px" }, onclick: () => onMove(index, 1) }),
        h("button", { class: "bf-button bf-button--danger", type: "button", text: "Remove", style: { width: "62px" }, onclick: () => onRemove(index) })
      )),
      items.length === 0 ? h("div", { class: "bf-muted", text: emptyText }) : null,
      h("button", { class: "bf-button", type: "button", text: addLabel, onclick: onAdd })
    );

  const report = s.report;
  const reportView = !report
    ? h("div", { class: "pf-helpbox pf-helpbox--info", text: "No validation result. Configure the explicit input and click Validate." })
    : h(
        "div",
        null,
        sectionTitle("Last Validation Run"),
        h("div", { class: `pf-helpbox pf-helpbox--${report.tone}`, text: report.statusText }),
        field("Captured UTC", helper(report.capturedUtc)),
        field("Retained Exchanges", helper(report.retained === null ? "Unavailable (fatal result)" : String(report.retained))),
        field("Exclusions", helper(String(report.exclusions.length))),
        field("Diagnostics", helper(String(report.diagnostics.length))),
        h("div", { class: "pf-helpbox pf-helpbox--info", text: "This is a captured result from the last Validate click. External asset edits are not detected automatically; validate again before relying on it." }),
        sectionTitle(`Diagnostics (${report.diagnostics.length})`),
        ...report.diagnostics.map((diagnostic, index) =>
          h("div", { class: "pf-diagnostic" },
            h("div", { class: "bf-section-title", text: `Diagnostic ${index + 1}` }),
            h("pre", { class: "pf-pre", text: diagnostic })
          )
        ),
        sectionTitle(`Exclusions (${report.exclusions.length})`),
        report.exclusions.length === 0
          ? h("div", { class: "bf-muted", text: "No content was excluded." })
          : report.exclusions.map((exclusion, index) =>
              h("div", { class: "pf-diagnostic" }, h("div", { class: "bf-section-title", text: `Exclusion ${index + 1}` }), h("pre", { class: "pf-pre", text: exclusion }))
            )
      );

  return windowFrame({
    title: "Banter Catalog Validation",
    hint: "Tools/Beka Forge/Developer/DGS/Banter/Catalog Validation",
    className: "pf-window up-window--compact",
    body: h(
      "div",
      { class: "up-scroll", style: { padding: "14px", maxHeight: "680px" } },
      sectionTitle("Explicit Catalog Input"),
      h("div", { class: "pf-helpbox pf-helpbox--info", text: "Enter the complete ordered collection list and optional declared external ExchangeIds. Nulls, duplicates, disabled content, and invalid authored values are passed to the catalog compiler unchanged." }),
      h("div", { class: "bf-section-title", text: "Banter Collections" }),
      listEditor(
        s.collections,
        (item) => h("div", { class: "bf-object-preview" }, h("span", { class: "bf-object-preview__icon" }), h("span", { class: "bf-object-preview__name", text: item.label })),
        "No collections are listed.",
        (index, delta) => move(s.collections, index, delta, ctx),
        (index) => { s.collections.splice(index, 1); s.report = null; ctx.rerender(); },
        () => { s.collections.push({ id: `collection-${s.collections.length + 1}`, label: `Banter Collection ${s.collections.length + 1} (example)` }); s.report = null; ctx.rerender(); },
        "Add Collection"
      ),
      h("div", { class: "bf-section-title", text: "Declared External ExchangeIds" }),
      listEditor(
        s.externalIds,
        (item, index) => textInput(item, (value) => { s.externalIds[index] = value; s.report = null; }, { placeholder: "external.exchange.id" }),
        "No external ExchangeIds are declared.",
        (index, delta) => move(s.externalIds, index, delta, ctx),
        (index) => { s.externalIds.splice(index, 1); s.report = null; ctx.rerender(); },
        () => { s.externalIds.push(""); s.report = null; ctx.rerender(); },
        "Add External ExchangeId"
      ),
      h("button", {
        class: "bf-button bf-button--primary",
        type: "button",
        text: "Validate",
        style: { height: "30px", marginTop: "10px" },
        onclick: () => { s.report = exampleReport(); ctx.rerender(); }
      }),
      h("div", { class: "bf-divider" }),
      reportView
    ),
    footer: h("div", { class: "bf-status-bar" }, h("span", { text: "Min size 640 × 480 · Captured results only" }))
  });
}

function move(list, index, delta, ctx) {
  const target = index + delta;
  if (target < 0 || target >= list.length) return;
  const [item] = list.splice(index, 1);
  list.splice(target, 0, item);
  ctx.state.banter.report = null;
  ctx.rerender();
}

function exampleReport() {
  return {
    tone: "warning",
    statusText: statusTexts.partial,
    capturedUtc: "2026-10-19 06:14:22Z",
    retained: 7,
    exclusions: [
      "Collection[0] / Exchange[3]\nCollection ID: MarketBanterCollection\nExchange ID: Market_Repeat\nReasons: Authoring validation"
    ],
    diagnostics: [
      "Code: MissingSpeakerRole\nPath: exchanges[1].lines[0].speakerRoleId\nMessage: Line speaker role 'speaker_2' does not match any role in this exchange.\nCollection ID: MarketBanterCollection\nExchange ID: Market_GateGreeting\nLine ID: line_market_gate_01\nValidation Code: BanterExchange.UnknownSpeakerRole\nValidation Path: lines[0].speakerRoleId"
    ]
  };
}

function decisionDebugger(ctx) {
  const s = ctx.state.banter;
  const d = s.debugger;

  if (s.pendingValidate) s.pendingValidate = false;

  const summary = d.recording
    ? "request=req_312 started=true eligible=6 shortlist=3 selected=Market_GateGreeting"
    : "no selection pass has been observed";

  return windowFrame({
    title: "Banter Decisions",
    hint: "Tools/Beka Forge/Developer/DGS/Banter/Decision Debugger",
    className: "pf-window up-window--compact",
    body: h(
      "div",
      { class: "up-scroll", style: { padding: "14px", maxHeight: "680px" } },
      textRow("Root", d.root, (value) => { d.root = value; }, { tooltip: "Name of the live BanterCompositionRoot whose decisions to observe." }),
      field("Profile", h("div", { class: "bf-object-preview" }, h("span", { class: "bf-object-preview__icon" }), h("span", { class: "bf-object-preview__name", text: "MarketBanterDirectorProfile (example)" }))),
      h("div", { class: "bf-muted", text: "Recording and export" }),
      toggleRow("Record decisions", d.recording, (value) => { d.recording = value; ctx.rerender(); }, {
        tooltip: "Records the cohort's own published pass, terminal and save facts into this window's bounded ring. It reads production state and writes nothing back, so turning it on and off cannot change a choice, a score or a random draw."
      }),
      h(
        "div",
        { class: "bf-row", style: { margin: "8px 0" } },
        h("button", { class: "bf-button", type: "button", text: "Refresh", onclick: () => ctx.rerender() }),
        h("button", { class: "bf-button", type: "button", text: "Export", onclick: () => { d.output = exampleTrace(); ctx.rerender(); toastAfterRender("Banter Decisions", "Demo only: this preview did not write to the clipboard. The example trace is shown below."); } }),
        h("button", { class: "bf-button", type: "button", text: "Clear", onclick: () => { d.output = null; ctx.rerender(); } })
      ),
      h("div", { class: d.recording ? "bf-success-text" : "bf-muted", text: d.recording ? `Observing ${d.root}. ready=true suspended=false paused=false.` : "Recording off. Nothing is captured and nothing is changed." }),
      h("div", { class: "bf-helper", text: summary }),
      h("pre", { class: "pf-pre pf-pre--trace", text: d.output || "banter-decision-trace v1\ncapacity=48 stored=0 recorded=0 discarded=0 diagnosticsEnabled=-\n\n[trace-newest-first]\nno decision recorded" })
    ),
    footer: h("div", { class: "bf-status-bar" }, h("span", { text: "Min size 220 × 240 · Bounded ring" }))
  });
}

function exampleTrace() {
  return [
    "banter-decision-trace v1",
    "capacity=48 stored=3 recorded=3 discarded=0 diagnosticsEnabled=false",
    "",
    "[score-components]",
    "perCandidateTermsPublished=true",
    "eligibleExchanges=6 shortlistSize=3",
    "traceCapacity(authored)=48",
    "coeff.priority=1.000 coeff.specificity=0.850 coeff.freshness=0.400",
    "coeff.fairness=0.300 coeff.urgency=0.250 coeff.topicCost=0.120",
    "shortlistThreshold=0.200 maxCandidatesPerPass=3 maxRequestsPerPass=1",
    "",
    "[last-pass] request=req_312 started=true eligible=6 shortlist=3 selected=Market_GateGreeting",
    "observationEpoch=12 estimatedNextLineSeconds=4.200 observedSpeechIntervals=18",
    "outcome.accepted=true hostFailure=- startFailure=- pendingStatus=- ownershipReleased=true",
    "",
    "[save-restore]",
    "capture ok=true failure=- hasCheckpoint=true checkpoint=chk_02",
    "restore ok=true failure=- randomOutcome=accepted randomRestored=true releasedBlock=true migrated=0/1/0 installed=2",
    "",
    "[live-state] observed=true ready=true suspendedHost=false paused=false locale=en",
    "hasActiveSession=true activeSessionId=session_04 activeExchangeId=Market_GateGreeting",
    "activeCategory=Greeting activeInterruptibility=AtLineBoundary pauseDisposition=Held",
    "pauseOwners=0 suspended=none",
    "",
    "[queue] count=1 now=0",
    "rank=1 #7 Greeting trigger=Proximity origin=Actor target=Mara pinned=false dedupe=true priorityAdj=0.10 age=1.250 expiresIn=8.500 expired=false",
    "",
    "[blockers]",
    "hardBlocker=false userMute=false gamePause=false pendingSoftInterruption=false",
    "activeBlockers=0 activeLease=none",
    "",
    "[selected-binding]",
    "exchange=Market_GateGreeting revision=3 locale=en showSubtitles=true preferSubtitleOnly=false roles=2",
    "role=speaker -> actor=GateWarden voice=GateWarden_Voice",
    "role=speaker_2 -> actor=Mara voice=Mara_Voice",
    "",
    "[memory]",
    "starts=14 completions=13",
    "quietGapRemaining=3.100 nextAmbientRemaining=6.400",
    "cooldowns=1",
    "kind=exchange key=Market_GateGreeting readyAt=120.000 duration=30.000 elapsed=4.200",
    "",
    "[trace-newest-first]",
    "#req_312 rank=1 Submission ok=true detail=selected Market_GateGreeting",
    "#req_311 rank=1 NoMatch block=- refusal=- pacing=quietGap exhaustive=false",
    "#req_310 rank=1 Preemption arbitration=lost block=none"
  ].join("\n");
}

const views = {
  "getting-started": gettingStarted,
  "catalog-validation": catalogValidation,
  decisions: decisionDebugger
};

export async function render(host, ctx) {
  if (ctx.surface && views[ctx.surface]) ctx.state.banter.view = ctx.surface;
  if (ctx.state.banter.pendingValidate) ctx.state.banter.view = "catalog-validation";
  const active = views[ctx.state.banter.view] ? ctx.state.banter.view : "getting-started";
  host.append(views[active](ctx));
}
