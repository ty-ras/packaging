import type * as types from "./params.types";
import type * as version from "./tyras-versions.types";

export const ROUTE_PATH =
  "/:dataValidation?/:server?/:serverVersion?/:client?/:clientVersion?";

export const buildDataURL = (
  params: types.DocumentationParams,
  versionKind: version.VersionKind | undefined,
): string | undefined => {
  let urlSuffix: string | undefined;
  switch (params.kind) {
    case "server-and-client":
      urlSuffix =
        versionKind === "server"
          ? getServerDataURLSuffix(params)
          : versionKind === "client"
          ? getClientDataURLSuffix(params)
          : undefined;
      break;
    case "protocol":
      urlSuffix =
        versionKind === undefined
          ? `protocol/${params.protocolVersion}`
          : undefined;
      break;
    case "server":
      urlSuffix =
        versionKind === "server" ? getServerDataURLSuffix(params) : undefined;
      break;
    case "client":
      urlSuffix =
        versionKind === "client" ? getClientDataURLSuffix(params) : undefined;
      break;
  }
  return urlSuffix === undefined
    ? undefined
    : `docs/${params.dataValidation}/${urlSuffix}.json`;
};

export const buildNavigationURL = (params: types.DocumentationParams) => {
  let urlSuffix: string;
  switch (params.kind) {
    case "server-and-client":
      urlSuffix = `${getURLSuffix(params.server)}/${getURLSuffix(
        params.client,
      )}`;
      break;
    case "protocol":
      urlSuffix = params.protocolVersion;
      break;
    case "server":
      urlSuffix = getURLSuffix(params.server);
      break;
    case "client":
      urlSuffix = `${getURLSuffix({
        name: ASPECT_NONE,
        version: ASPECT_NONE,
      })}/${getURLSuffix(params.client)}`;
      break;

    default:
      throw new Error("New params kind not supported");
  }
  return `/${params.dataValidation}/${urlSuffix}`;
};

/**
 * Only applicable for server or client, not data validation
 */
export const ASPECT_NONE = "none";

const getURLSuffix = ({ name, version }: types.ComponentAndVersion) =>
  `${name}/${version}`;

const getServerDataURLSuffix = ({
  server: { name, version },
}: types.DocumentationParamsServerBase) => `server-${name}/${version}`;

const getClientDataURLSuffix = ({
  client: { name, version },
}: types.DocumentationParamsClientBase) => `client-${name}/${version}`;
