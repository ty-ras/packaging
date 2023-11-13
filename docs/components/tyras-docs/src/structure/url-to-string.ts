import { Throw } from "throw-expression";
import type * as types from "./params.types";
import type * as version from "./tyras-versions.types";
import * as consts from "./consts";

export const ROUTE_PATH =
  "/:dataValidation?/:server?/:serverVersion?/:client?/:clientVersion?";

export const buildDataURL = (
  params: types.DocumentationParams,
  versionKind: version.VersionKind | undefined,
): string => {
  let urlSuffix: string | undefined;
  switch (params.kind) {
    case consts.NAVIGATION_PARAM_KIND_SERVER_AND_CLIENT:
      urlSuffix =
        versionKind === consts.VERSION_KIND_SERVER
          ? getServerDataURLSuffix(params)
          : versionKind === consts.VERSION_KIND_CLIENT
          ? getClientDataURLSuffix(params)
          : undefined;
      break;
    case consts.NAVIGATION_PARAM_KIND_PROTOCOL:
      urlSuffix =
        versionKind === undefined
          ? `protocol/${params.protocolVersion}`
          : undefined;
      break;
    case consts.NAVIGATION_PARAM_KIND_SERVER:
      urlSuffix =
        versionKind === consts.VERSION_KIND_SERVER
          ? getServerDataURLSuffix(params)
          : undefined;
      break;
    case consts.NAVIGATION_PARAM_KIND_CLIENT:
      urlSuffix =
        versionKind === consts.VERSION_KIND_CLIENT
          ? getClientDataURLSuffix(params)
          : undefined;
      break;
  }
  return `docs/${params.dataValidation}/${
    urlSuffix ??
    Throw(
      `Could not resolve data URL for parameters and version kind ${JSON.stringify(
        params,
      )} ${versionKind}`,
    )
  }.json`;
};

export const buildNavigationURL = ({
  selectedReflection,
  ...params
}: types.DocumentationParams) => {
  let urlSuffix: string;
  switch (params.kind) {
    case consts.NAVIGATION_PARAM_KIND_SERVER_AND_CLIENT:
      urlSuffix = `${getURLSuffix(params.server)}/${getURLSuffix(
        params.client,
      )}`;
      break;
    case consts.NAVIGATION_PARAM_KIND_PROTOCOL:
      urlSuffix = params.protocolVersion;
      break;
    case consts.NAVIGATION_PARAM_KIND_SERVER:
      urlSuffix = getURLSuffix(params.server);
      break;
    case consts.NAVIGATION_PARAM_KIND_CLIENT:
      urlSuffix = `${getURLSuffix({
        name: consts.ASPECT_NONE,
        version: consts.ASPECT_NONE,
      })}/${getURLSuffix(params.client)}`;
      break;
    default:
      throw new Error("New params kind not supported");
  }

  return `/${params.dataValidation}/${urlSuffix}${
    selectedReflection
      ? `/${
          typeof selectedReflection === "string"
            ? selectedReflection
            : `${selectedReflection.docKind}-${selectedReflection.name}`
        }`
      : ""
  }`;
};

const getURLSuffix = ({ name, version }: types.ComponentAndVersion) =>
  `${name}/${version}`;

const getServerDataURLSuffix = ({
  server: { name, version },
}: types.DocumentationParamsServerBase) => `server-${name}/${version}`;

const getClientDataURLSuffix = ({
  client: { name, version },
}: types.DocumentationParamsClientBase) => `client-${name}/${version}`;
