export interface DocumentationParams {
  dataValidation: string;
  server: string;
  serverVersion: string;
  client: string;
  clientVersion: string;
}

export type DocumentationParamsFromRouter = Partial<DocumentationParams>;
