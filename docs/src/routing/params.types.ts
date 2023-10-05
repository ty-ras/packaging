export type DocumentationParams =
  | DocumentationParamsServer
  | DocumentationParamsClient
  | DocumentationParamsServerAndClient
  | DocumentationParamsProtocol;

export interface DocumentationParamsBase {
  dataValidation: string;
}

export interface DocumentationParamsServerBase {
  server: ComponentAndVersion;
}

export interface DocumentationParamsServer
  extends DocumentationParamsBase,
    DocumentationParamsServerBase {
  kind: "server";
}

export interface DocumentationParamsClientBase {
  client: ComponentAndVersion;
}

export interface DocumentationParamsClient
  extends DocumentationParamsBase,
    DocumentationParamsClientBase {
  kind: "client";
}

export interface DocumentationParamsServerAndClient
  extends DocumentationParamsBase,
    DocumentationParamsClientBase,
    DocumentationParamsServerBase {
  kind: "server-and-client";
}

export interface DocumentationParamsProtocolBase {
  protocolVersion: ComponentAndVersion["version"];
}

export interface DocumentationParamsProtocol
  extends DocumentationParamsBase,
    DocumentationParamsProtocolBase {
  kind: "protocol";
}

export interface ComponentAndVersion {
  name: string;
  version: string;
}
