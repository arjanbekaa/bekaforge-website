/* Walla Sound Sequencer windows.
   Strings are copied from Sound Sequencer editor sources:
   SoundSequenceWindow.cs, SoundSequenceEditorView.cs, SoundTimelineCanvas.cs,
   SoundSequenceEditorController.cs, SoundRetimePlanner.cs, SoundSpatialPreview.cs,
   SoundPreviewSession.cs, SoundSequenceInspectors.cs.
   Example sequence only; nothing is saved or played. */

import {
  h, card, field, helper, badge, textRow, textInput, toggleRow, enumRow, numberRow,
  windowFrame, sectionTitle, foldout, toastOn
} from "../controls.js";

export const entries = [
  { id: "sequencer", label: "Sound Sequencer" },
  { id: "binding", label: "Sound Sequencer · Spatial binding" },
  { id: "inspector", label: "Inspectors · Sound Sequence" },
  { id: "graph-attached", label: "Graph · Sound attached" },
  { id: "graph-detached", label: "Graph · Sound detached" }
];

export const note =
  "Recreated from the Walla Sound Sequencer editor windows and inspectors. The timeline, clips, and spatial binding results are fabricated examples. " +
  "No audio is played, no scene is queried, and no sequence asset is written.";

function timeLabel(frames, frameRate) {
  const totalSeconds = frames / Math.max(1, frameRate);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds - minutes * 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds.toFixed(2)}`;
}

function toastAfterRender(title, message) {
  setTimeout(() => {
    const windowEl = (document.querySelector && document.querySelector(".up-window")) || (document.body || null);
    if (windowEl) toastOn(windowEl, title, message);
  }, 0);
}

function commitTextRow(label, value, onCommit, options = {}) {
  return field(
    label,
    h("input", {
      class: "bf-input",
      type: "text",
      value: value ?? "",
      placeholder: options.placeholder || "",
      onchange: (event) => onCommit(event.target.value)
    }),
    { tooltip: options.tooltip }
  );
}

function frameCount(value, min = 0) {
  return Math.max(min, Math.min(2147483647, Math.round(value)));
}

function commitNumberRow(label, value, min, onCommit, options = {}) {
  return h(
    "div",
    { class: "bf-field" },
    h("label", { class: "bf-field__label", text: label }),
    h(
      "div",
      { class: "bf-field__control" },
      h("input", {
        class: "bf-input bf-input--number",
        type: "number",
        "aria-label": label,
        min,
        max: options.max ?? 2147483647,
        step: options.step ?? 1,
        value,
        onchange: (event) => {
          const next = Number(event.target.value);
          if (Number.isFinite(next)) onCommit(Math.min(options.max ?? 2147483647, frameCount(next, min)));
          else event.target.value = value;
        }
      }),
      options.unit ? h("span", { class: "bf-range-helper", text: options.unit }) : null
    )
  );
}

function transport(ctx) {
  const s = ctx.state.sound;
  if (s.seekFrame === undefined) s.seekFrame = Math.min(60, s.durationFrames);
  const guard = (event) => {
    if (s.sequenceOpen) return false;
    toastOn(event.currentTarget.closest(".up-window"), "Sound Sequencer", "Open a sequence first.");
    return true;
  };
  const playButton = s.playing
    ? h("button", { class: "bf-button", type: "button", text: "❚❚  Pause", title: "Pause the example audition state.", onclick: () => { s.playing = false; s.status = `Demo audition paused at ${(s.playhead / s.frameRate).toFixed(2)}s; no audio is played here.`; ctx.rerender(); } })
    : h("button", { class: "bf-button bf-button--primary", type: "button", text: s.playhead > 0 ? "▶  Resume" : "▶  Play", title: "Show the example audition state. This browser preview does not play audio.", onclick: (event) => { if (guard(event)) return; s.playing = true; s.status = "Demo only: audition state shown; no audio is played in this browser preview."; ctx.rerender(); } });

  return h(
    "div",
    { class: "walla-transport" },
    playButton,
    h("button", { class: "bf-button", type: "button", text: "■  Stop", onclick: () => { s.playing = false; s.playhead = 0; s.seekFrame = 0; s.status = "Demo only: playhead reset; no audio is played here."; ctx.rerender(); } }),
    h("button", { class: "bf-button", type: "button", text: "◀ frame", onclick: () => { s.playhead = Math.max(0, s.playhead - 1); s.seekFrame = s.playhead; ctx.rerender(); } }),
    h("button", { class: "bf-button", type: "button", text: "frame ▶", onclick: () => { s.playhead = Math.min(s.durationFrames, s.playhead + 1); s.seekFrame = s.playhead; ctx.rerender(); } }),
    h("span", { class: "walla-transport__time", text: timeLabel(s.playhead, s.frameRate) }),
      h("span", { class: "bf-muted", text: `frame ${s.playhead} / ${s.durationFrames}` }),
      commitNumberRow("Seek to frame", s.seekFrame, 0, (value) => {
        s.seekFrame = Math.max(0, Math.min(s.durationFrames, Math.round(value)));
        ctx.rerender();
      }, { max: s.durationFrames, step: 1, unit: "frames" }),
    h("button", {
      class: "bf-button bf-button--quiet",
      type: "button",
      text: "Seek",
      onclick: (event) => {
        s.seekFrame = Math.max(0, Math.min(s.durationFrames, Math.round(s.seekFrame)));
        s.playhead = s.seekFrame;
        s.status = `Demo only: playhead moved to frame ${s.seekFrame} (${timeLabel(s.seekFrame, s.frameRate)}). No audio is played here.`;
        const label = `Seeked to frame ${s.seekFrame} at ${timeLabel(s.seekFrame, s.frameRate)}.`;
        ctx.rerender();
        toastAfterRender("Sound Sequencer", `${label} Demo only.`);
      }
    }),
    h("label", { class: "bf-check-row", style: { marginLeft: "auto" } },
      h("input", { class: "bf-check", type: "checkbox", checked: s.loop, onchange: (event) => { s.loop = event.target.checked; } }),
      h("span", { text: "Loop" })
    )
  );
}

function timeline(ctx) {
  const s = ctx.state.sound;
  if (s.showAutomation === undefined) s.showAutomation = false;
  if (s.selectMode === undefined) s.selectMode = false;
  const pixelsPerFrame = Math.min(3.2, 1520 / Math.max(1, s.durationFrames));
  const ruler = h(
    "div",
    { class: "walla-ruler", title: "Click the ruler to seek to a frame.", onclick: (event) => {
      const bounds = event.currentTarget.getBoundingClientRect();
      s.seekFrame = Math.max(0, Math.min(s.durationFrames, Math.round((event.clientX - bounds.left) / pixelsPerFrame)));
      s.playhead = s.seekFrame;
      s.status = `Demo only: playhead moved to frame ${s.playhead}. No audio is played here.`;
      ctx.rerender();
    } },
    ...Array.from({ length: 9 }, (_, index) => {
      const frame = Math.round(index * s.durationFrames / 8);
      return h("span", { class: "walla-ruler__tick", style: { left: `${frame * pixelsPerFrame}px` }, text: `${frame}f` });
    })
  );

  const lanes = s.tracks.map((track, index) =>
    h(
      "div",
      { class: `walla-lane${s.selectedTrack === index ? " walla-lane--selected" : ""}` },
      h(
        "div",
        { class: "walla-gutter", onclick: () => { s.selectedTrack = index; ctx.rerender(); } },
        h("span", { class: "walla-gutter__name", text: track.name }),
        h("span", { class: "walla-gutter__id", text: `id:${track.name.toLowerCase().replace(/\s+/g, "-")}` }),
        h("button", {
          class: "bf-button bf-button--quiet",
          type: "button",
          text: "M",
          "aria-pressed": track.muted ? "true" : "false",
          "aria-label": `Mute ${track.name}`,
          style: { opacity: track.muted ? "1" : "0.5" },
          onclick: (event) => { track.muted = !track.muted; event.stopPropagation(); ctx.rerender(); }
        }),
        h("button", {
          class: "bf-button bf-button--quiet",
          type: "button",
          text: "S",
          "aria-pressed": track.solo ? "true" : "false",
          "aria-label": `Solo ${track.name}`,
          style: { opacity: track.solo ? "1" : "0.5" },
          onclick: (event) => { track.solo = !track.solo; event.stopPropagation(); ctx.rerender(); }
        })
      ),
      h(
        "div",
        { class: "walla-lane__canvas", onclick: () => { s.selectedTrack = index; ctx.rerender(); } },
        h("div", {
          class: "walla-clip",
          style: { left: `${track.startFrame * pixelsPerFrame}px`, width: `${(track.durationFrames ?? 96) * pixelsPerFrame}px` },
          title: "Clip volume and fades. Track volume and automation are separate."
        },
          h("span", { class: "walla-clip__name", text: track.clip }),
          h("span", { class: "walla-clip__fades", text: "fade in 0f · fade out 0f" })
        )
      )
    )
  );

  return h(
    "div",
    { class: "walla-timeline" },
    h(
      "div",
      { class: "walla-timeline__toolbar" },
      h("span", { class: "bf-chip", text: `Tracks ${s.tracks.length}` }),
      h("button", { class: "bf-button", type: "button", text: "Add Track", title: "Adds one empty audio track to this sequence, selects it, and opens its name for editing.", onclick: () => {
        s.tracks.push({ name: `Track ${s.tracks.length + 1}`, clip: "— no clip assigned —", startFrame: 0, muted: false, solo: false });
        s.selectedTrack = s.tracks.length - 1;
        s.status = "Added a track. Name it, then put sounds on it.";
        ctx.rerender();
      } }),
      h("button", { class: "bf-button", type: "button", text: "Add Cue", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Sound Sequencer", "Add Cue would append a cue at the playhead. Demo only.") }),
      h("button", {
        class: "bf-button",
        type: "button",
        text: s.showAutomation ? "Hide automation" : "Show automation",
        title: "Reveal the automation lanes for the selected track.",
        "aria-pressed": s.showAutomation ? "true" : "false",
        onclick: () => {
          s.showAutomation = !s.showAutomation;
          s.status = s.showAutomation ? "Automation lanes shown for the selected track." : "Automation lanes hidden.";
          ctx.rerender();
        }
      }),
      h("button", { class: "bf-button", type: "button", text: "Add binding", onclick: () => ctx.navigateSurface("binding", { replace: false }) }),
      h("button", {
        class: "bf-button",
        type: "button",
        text: "Select",
        "aria-pressed": s.selectMode ? "true" : "false",
        onclick: () => {
          s.selectMode = !s.selectMode;
          s.status = s.selectMode ? "Selection mode enabled. Click a track to select it." : "Selection mode disabled.";
          ctx.rerender();
        }
      }),
      h("button", { class: "bf-button bf-button--danger", type: "button", text: "Remove", onclick: (event) => {
        if (s.tracks.length <= 1) {
          toastOn(event.currentTarget.closest(".up-window"), "Sound Sequencer", "A sequence needs at least one track. Add another track first.");
          return;
        }
        s.tracks.splice(s.selectedTrack, 1);
        s.selectedTrack = 0;
        s.status = "Removed track.";
        ctx.rerender();
      } })
    ),
    ruler,
    ...lanes,
    h("div", { class: "walla-playhead", style: { left: `${s.playhead * pixelsPerFrame}px` } }),
    h("div", { class: "bf-helper", style: { marginTop: "8px" }, text: s.status }),
    h(
      "div",
      { class: "walla-retime" },
      h("span", { class: "bf-section-title", text: "Retime frames to another frame rate" }),
      commitNumberRow("Retime to (fps)", s.retimeTargetFrameRate ?? s.frameRate, 1, (value) => {
        s.retimeTargetFrameRate = Math.max(1, Math.round(value));
        ctx.rerender();
      }, { step: 1, unit: "fps" }),
      h("button", { class: "bf-button", type: "button", text: "Preview retime", onclick: (event) => {
        const targetRate = Math.max(1, Math.round(Number(s.retimeTargetFrameRate) || s.frameRate));
        const ratio = targetRate / Math.max(1, s.frameRate);
        toastOn(event.currentTarget.closest(".up-window"), "Sound Sequencer", `Demo only: no retime proposal was generated. In Unity, preview the frame changes from ${s.frameRate} fps to ${targetRate} fps (${ratio.toFixed(3)}×) before applying.`);
      } }),
      h("button", {
        class: "bf-button",
        type: "button",
        text: "Apply retime",
        onclick: () => {
          const targetRate = Math.max(1, Math.round(Number(s.retimeTargetFrameRate) || s.frameRate));
          const ratio = targetRate / Math.max(1, s.frameRate);
          for (const track of s.tracks) {
            track.durationFrames = frameCount((track.durationFrames ?? 96) * ratio, 1);
            track.startFrame = frameCount(track.startFrame * ratio);
          }
          s.durationFrames = frameCount(s.durationFrames * ratio, 1);
          s.frameRate = targetRate;
          s.playhead = Math.min(s.playhead, s.durationFrames);
          s.seekFrame = Math.min(s.seekFrame ?? s.playhead, s.durationFrames);
          s.retimeTargetFrameRate = targetRate;
          s.status = `Demo only: example retimed ${s.tracks.length} track(s) to ${targetRate} fps.`;
          ctx.rerender();
          toastAfterRender("Sound Sequencer", `Demo only: example values changed to ${targetRate} fps (${ratio.toFixed(3)}×); no asset was written.`);
        }
      }),
      h("button", {
        class: "bf-button",
        type: "button",
        text: "Cancel",
        onclick: () => {
          s.retimeTargetFrameRate = s.frameRate;
          s.status = "Retime cancelled. Target frame rate reset to the current sequence rate.";
          ctx.rerender();
          toastAfterRender("Sound Sequencer", "Retime cancelled. The target frame rate was reset to the current sequence rate.");
        }
      })
    )
  );
}

function sequencer(ctx) {
  const s = ctx.state.sound;
  return windowFrame({
    title: "Sound Sequencer",
    hint: "Tools/Beka Forge/Developer/DGS/Sound Sequencer",
    className: "pf-window",
    body: h(
      "div",
      { class: "walla-sound-theme sound-sequence-window up-scroll", style: { padding: "14px", maxHeight: "700px" } },
      h(
        "div",
        { class: "bf-row", style: { marginBottom: "8px" } },
        h("span", { class: "bf-field__label", text: s.sequenceName }),
        h("button", { class: "bf-button", type: "button", text: "New sequence", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Sound Sequencer", "New sequence would create an asset under the default sequences folder. Demo only.") }),
        h("button", { class: "bf-button bf-button--primary", type: "button", text: "Save", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Sound Sequencer", "Save would write the sequence asset. Demo only.") }),
        h("button", { class: "bf-button", type: "button", text: "Create Play Mode rig", title: "In Unity, create a player in the open scene for this sequence. The scene needs an AudioListener.", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Sound Sequencer", s.sceneOpen ? `Demo only: this preview did not add a SoundSequencePlayer. In Unity, create one for '${s.sequenceName}' and enter Play Mode to hear it.` : "Demo only: this preview does not inspect open scenes. In Unity, open a scene first.") })
      ),
      transport(ctx),
      foldout("Sequence and preview settings", h(
        "div",
        null,
        commitNumberRow("Frame rate", s.frameRate, 1, (value) => { s.frameRate = frameCount(value, 1); ctx.rerender(); }, { unit: "fps" }),
        commitNumberRow("Duration", s.durationFrames, 1, (value) => {
          s.durationFrames = frameCount(value, 1);
          s.playhead = Math.min(s.playhead, s.durationFrames);
          s.seekFrame = Math.min(s.seekFrame, s.durationFrames);
          ctx.rerender();
        }, { unit: "frames" }),
        toggleRow("Loop", s.loop, (value) => { s.loop = value; }),
        toggleRow("Sequence is open (example state)", s.sequenceOpen, (value) => { s.sequenceOpen = value; }),
        toggleRow("Untitled scene is open (example state)", s.sceneOpen, (value) => { s.sceneOpen = value; })
      )),
      h("div", { class: "bf-divider" }),
      timeline(ctx),
      h("div", { class: "bf-divider" }),
      sectionTitle("Spatial status"),
      h("div", { class: "bf-helper", text: s.bindingResolved
        ? `Key '${s.bindingKey}' resolves. Track '${s.tracks[s.selectedTrack].name}' at frame ${s.playhead.toFixed(2)} sits at (4.20, 1.00, -2.35) via '${s.bindingKey}'.`
        : `Track '${s.tracks[s.selectedTrack].name}' is 3D but has no binding key, so it will play muted.` })
    ),
    footer: h("div", { class: "bf-status-bar" }, h("span", { text: "Min size 760 × 420 · Walla sound theme" }))
  });
}

function binding(ctx) {
  const s = ctx.state.sound;
  return windowFrame({
    title: "Sound Sequencer · Spatial binding",
    className: "pf-window up-window--compact",
    body: h(
      "div",
      { class: "walla-sound-theme up-scroll", style: { padding: "14px", maxHeight: "620px" } },
      sectionTitle("Emitter bindings"),
      helper("3D tracks resolve a scene object through a binding key. A key that does not resolve makes its track play muted; nothing is repaired automatically."),
      field("Binding key", textInput(s.bindingKey, (value) => { s.bindingKey = value; }, { placeholder: "Emitter key" })),
      toggleRow("Resolves in the open scene", s.bindingResolved, (value) => { s.bindingResolved = value; ctx.rerender(); }),
      h("div", { class: "bf-helper", text: s.bindingResolved ? `Key '${s.bindingKey}' resolves.` : `Key '${s.bindingKey}' has no scene object, so its track plays muted.` }),
      h("div", { class: "bf-divider" }),
      sectionTitle("Preview marker"),
      helper("Spatial preview uses the SoundSpatialPreviewMarker object while dragging the playhead. The marker is temporary and is not saved."),
      h("div", { class: "bf-helper", text: `Track '${s.tracks[s.selectedTrack].name}' at frame ${s.playhead.toFixed(2)} sits at (4.20, 1.00, -2.35) via '${s.bindingKey}'.` }),
      helper("2D tracks use stereo pan and have no world position."),
      h("button", { class: "bf-button", type: "button", text: "Back to sequencer", onclick: () => ctx.navigateSurface("sequencer", { replace: false }) })
    ),
    footer: h("div", { class: "bf-status-bar" }, h("span", { text: "Example binding only" }))
  });
}

function inspector(ctx) {
  const s = ctx.state.sound;
  return windowFrame({
    title: "Inspector · Sound Sequence",
    className: "pf-window up-window--compact",
    body: h(
      "div",
      { class: "up-scroll", style: { padding: "14px", maxHeight: "620px" } },
      h("div", { class: "bf-muted", text: "Beka Forge · Dialogue Graph System / Walla" }),
      h("div", { class: "bf-section-title", text: "Sound Sequence" }),
      h("div", { class: "pf-helpbox pf-helpbox--info", text: "Edit tracks, cues, and curves in the Walla Sound Sequencer." }),
      h("button", { class: "bf-button bf-button--primary", type: "button", text: "Open Walla Sound Sequencer", onclick: () => ctx.navigateSurface("sequencer", { replace: false }) }),
      h("div", { class: "bf-divider" }),
      commitTextRow("Sequence Name", s.sequenceName, (value) => { s.sequenceName = value; ctx.rerender(); }),
      commitNumberRow("Frame Rate", s.frameRate, 1, (value) => { s.frameRate = frameCount(value, 1); ctx.rerender(); }, { unit: "fps" }),
      commitNumberRow("Duration Frames", s.durationFrames, 1, (value) => {
        s.durationFrames = frameCount(value, 1);
        s.playhead = Math.min(s.playhead, s.durationFrames);
        s.seekFrame = Math.min(s.seekFrame ?? s.playhead, s.durationFrames);
        ctx.rerender();
      }),
      toggleRow("Loop", s.loop, (value) => { s.loop = value; }),
      h("div", { class: "bf-divider" }),
      h("div", { class: "bf-section-title", text: "Sound Sequence Player" }),
      helper("Create the play-mode rig from the sequencer window. The scene needs an AudioListener."),
      field("Sequence", h("div", { class: "bf-object-preview" }, h("span", { class: "bf-object-preview__icon" }), h("span", { class: "bf-object-preview__name", text: s.sequenceName }))),
      field("Documentation", h("div", { class: "bf-row" },
        h("button", { class: "bf-button", type: "button", text: "Documentation", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Documentation", "OpenURL: https://bekaforge.com/dgs-docs/sound-sequencer (demo only). The guide documents sequence setup, retiming, and spatial bindings.") }),
        h("button", { class: "bf-button", type: "button", text: "Website", onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Website", "OpenURL: https://bekaforge.com (demo only).") })
      ))
    ),
    footer: h("div", { class: "bf-status-bar" }, h("span", { text: "Native inspector · example values" }))
  });
}

function graphAttached(ctx) {
  const s = ctx.state.sound;
  const graphName = s.graphName || "MarketLever";
  const forceDetached = ctx.surface === "graph-detached";

  if (forceDetached || s.graphSoundState === "detached") {
    const retired = s.graphRetired;
    const contextLine = retired
      ? `Detached from ${graphName} (its graph was closed) - nothing to return to.`
      : `Detached from ${graphName}.`;
    return windowFrame({
      title: `Sound - ${graphName}`,
      hint: "Detached editor window",
      className: "pf-window",
      body: h(
        "div",
        { class: "walla-sound-theme up-scroll", style: { padding: "14px", maxHeight: "700px" } },
        h(
          "div",
          { class: "bf-row", style: { marginBottom: "8px" } },
          h("span", { class: "bf-muted", text: contextLine }),
          h("button", {
            class: "bf-button",
            type: "button",
            text: "Return to graph",
            title: "Return this editor to the graph panel. The graph panel unfolds.",
            onclick: (event) => {
              if (forceDetached) {
                ctx.state.sound.graphSoundState = "attached";
                ctx.navigateSurface("graph-attached", { replace: false });
                return;
              }
              s.graphSoundState = "attached";
              ctx.rerender();
            }
          }),
          h("button", {
            class: "bf-button",
            type: "button",
            text: "Close returns to graph",
            title: "Closing this window returns the graph panel folded.",
            onclick: (event) => toastOn(event.currentTarget.closest(".up-window"), "Sound Sequencer", "Closing the detached window would hand the sound editor back to the graph panel. Demo only.")
          })
        ),
        transport(ctx),
        h("div", { class: "bf-divider" }),
        timeline(ctx),
        h("div", { class: "bf-divider" }),
        toggleRow("Origin graph was closed (example state)", retired, (value) => { s.graphRetired = value; ctx.rerender(); })
      ),
      footer: h("div", { class: "bf-status-bar" }, h("span", { text: "Detached · closing returns the graph panel folded" }))
    });
  }

  return windowFrame({
    title: "Dialogue Graph System",
    hint: `Graph: ${graphName}`,
    className: "pf-window",
    body: h(
      "div",
      { class: "walla-sound-theme", style: { padding: "14px" } },
      h(
        "div",
        { class: "walla-graph-stage" },
        h("span", { class: "bf-muted", text: "Example graph canvas. The sound editor docks under this graph." })
      ),
      h(
        "div",
        { class: "walla-graph-strip" },
        h("span", { class: "walla-graph-strip__title", text: "Sound" }),
        h("span", { class: "walla-graph-strip__status", text: "Click to expand" }),
        h("span", { class: "bf-muted", text: `Attached to ${graphName} · the editor docks under the graph` }),
        h("button", {
          class: "bf-button",
          type: "button",
          text: "Open in separate window",
          title: "Detach this graph's sound editor into its own window. The graph panel folds.",
          onclick: () => { s.graphSoundState = "detached"; ctx.rerender(); }
        })
      ),
      h("div", { class: "bf-helper", text: "Detaching moves the sound editor into its own editor window. The graph panel folds to this strip until the editor returns." })
    ),
    footer: h("div", { class: "bf-status-bar" }, h("span", { text: "Attached · sound strip folded under the graph" }))
  });
}

const views = {
  sequencer,
  binding,
  inspector,
  "graph-attached": graphAttached,
  "graph-detached": graphAttached
};

export async function render(host, ctx) {
  if (ctx.surface && views[ctx.surface]) ctx.state.sound.view = ctx.surface;
  const active = views[ctx.state.sound.view] ? ctx.state.sound.view : "sequencer";
  host.append(views[active](ctx));
}
