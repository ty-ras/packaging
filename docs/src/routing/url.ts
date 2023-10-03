import type * as types from "./routing.types";
import type * as version from "./tyras-versions.types";

export const ROUTE_PATH =
  "/:dataValidation?/:server?/:serverVersion?/:client?/:clientVersion?";

export const buildDataURL = (
  params: types.DocumentationParams,
  versionKind: version.VersionKind | undefined,
): string | undefined =>
  (versionKind === "server" && params.server === ASPECT_NONE) ||
  (versionKind === "client" && params.client === ASPECT_NONE)
    ? undefined
    : `${DOCS_ROOT_URL}${params.dataValidation}/${
        versionKind === undefined
          ? `protocol/TODO.json`
          : versionKind === "server"
          ? `server-${params.server}/${params.serverVersion}`
          : `client-${params.client}/${params.clientVersion}`
      }.json`;

export const buildNavigationURL = (params: types.DocumentationParams) =>
  `/${params.dataValidation}/${params.server}/${params.serverVersion}/${params.client}/${params.clientVersion}`;

export const buildFromURL = (
  url: string,
): types.DocumentationParamsFromRouter => {
  const fragments = url.split("/");
  if (fragments[0]?.length < 1) {
    fragments.splice(0, 1);
  }
  const [dataValidation, server, serverVersion, client, clientVersion] =
    fragments;
  return {
    ...(dataValidation && { dataValidation }),
    ...(server && { server }),
    ...(serverVersion && { serverVersion }),
    ...(client && { client }),
    ...(clientVersion && { clientVersion }),
  };
};

/**
 * Only applicable for server or client, not data validation
 */
export const ASPECT_NONE = "none";

export const DOCS_ROOT_URL = "/docs/";
