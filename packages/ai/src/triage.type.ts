export type TriageConfig = {
  apiKey: string;
  model: string;
};

export type TriageErrorCode =
  | "REQUEST_FAILED"
  | "EMPTY_RESPONSE"
  | "INVALID_JSON"
  | "INVALID_RESPONSE";
