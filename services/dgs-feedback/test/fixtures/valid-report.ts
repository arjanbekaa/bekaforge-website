import type { DgsFeedbackPayload } from "../../src/types.ts";

export const validReport: DgsFeedbackPayload = {
  schemaVersion: 2,
  source: "dgs-unity-editor",
  receivedAtUtc: "2026-08-12T14:29:00.000Z",
  packageName: "Dialogue Graph System",
  packageVersion: "3.0.0",
  unityVersion: "2022.3.62f3",
  os: "Windows 11",
  editorPlatform: "WindowsEditor",
  featureName: "Graph Authoring",
  failureStage: "request",
  providerName: "Synthetic Provider",
  providerType: "test",
  activeGraphName: "Synthetic Graph",
  activeGraphPath: "Assets/[REDACTED_PATH]",
  sanitizedErrorMessage: "Synthetic provider request failed.",
  sanitizedStackTrace: "at Synthetic.Provider.Request()",
  sanitizedReportBody: "Synthetic diagnostic report.",
  diagnostic: {
    run: {
      status: "failed",
      originalUserPrompt: ""
    },
    planner: {
      history: []
    }
  },
  truncated: false,
  truncationReason: "",
  omittedSections: [],
  configVersion: "2026-08-12.2",
  feedbackEndpointVersion: "v1",
  timestampUtc: "2026-08-12T14:29:00.000Z",
  anonymousInstallId: "synthetic-install-0001",
  anonymousSessionId: "synthetic-session-0001"
};
