import type * as versions from "./tyras-versions.types";

export type DocumentationParams =
  | DocumentationParamsServer
  | DocumentationParamsClient
  | DocumentationParamsServerAndClient
  | DocumentationParamsProtocol;

export interface DocumentationParamsBaseNoSelected {
  dataValidation: string;
}
export interface DocumentationParamsBase
  extends DocumentationParamsBaseNoSelected {
  selectedReflection?: string;
}

export interface DocumentationParamsServerBase {
  server: ComponentAndVersion;
}

export interface DocumentationParamsServer
  extends DocumentationParamsBase,
    DocumentationParamsServerBase {
  kind: versions.VersionKindServer;
}

export interface DocumentationParamsClientBase {
  client: ComponentAndVersion;
}

export interface DocumentationParamsClient
  extends DocumentationParamsBase,
    DocumentationParamsClientBase {
  kind: versions.VersionKindClient;
}

export interface DocumentationParamsServerAndClient
  extends DocumentationParamsBaseNoSelected,
    DocumentationParamsClientBase,
    DocumentationParamsServerBase {
  kind: `${versions.VersionKindServer}-and-${versions.VersionKindClient}`;
  selectedReflection?: {
    name: string;
    docKind: versions.VersionKind;
  };
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
