export const MAX_BODY_BYTES = 128 * 1024;

export interface DgsFeedbackPayload {
  schemaVersion: 2;
  source: "dgs-unity-editor";
  receivedAtUtc: string;
  packageName: string;
  packageVersion: string;
  unityVersion: string;
  os: string;
  editorPlatform: string;
  featureName: string;
  failureStage: string;
  providerName: string;
  providerType: string;
  activeGraphName: string;
  activeGraphPath: string;
  sanitizedErrorMessage: string;
  sanitizedStackTrace: string;
  sanitizedReportBody: string;
  diagnostic: Record<string, unknown> | null;
  truncated: boolean;
  truncationReason: string;
  omittedSections: string[];
  configVersion: string;
  feedbackEndpointVersion: string;
  timestampUtc: string;
  anonymousInstallId: string;
  anonymousSessionId: string;
}

export interface StoredReportEnvelope {
  storageSchemaVersion: 1;
  reportId: string;
  receivedAtUtc: string;
  client: DgsFeedbackPayload;
}

export class PublicError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string) {
    super(code);
    this.name = "PublicError";
    this.status = status;
    this.code = code;
  }
}

