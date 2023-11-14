import type * as versions from "./tyras-versions.types";
import type * as consts from "./consts";

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
  // Notice that this is name, not ID
  // We want to have human-readable, stable URLs, so we use name instead of ID as selected reflection reference.
  // This is not generally robust way, as there might be types and consts exported with same name in the packages.
  // For TyRAS, however, this is not true, and thus we can use the name instead of numeric ID here.
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
  kind: typeof consts.NAVIGATION_PARAM_KIND_SERVER_AND_CLIENT;
  selectedReflection?: {
    // Notice that this is name, not ID
    // We want to have human-readable, stable URLs, so we use name instead of ID as selected reflection reference.
    // This is not generally robust way, as there might be types and consts exported with same name in the packages.
    // For TyRAS, however, this is not true, and thus we can use the name instead of numeric ID here.
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
  kind: typeof consts.NAVIGATION_PARAM_KIND_PROTOCOL;
}

export interface ComponentAndVersion {
  name: string;
  version: string;
}

export type SelectedReflection = DocumentationParams["selectedReflection"];