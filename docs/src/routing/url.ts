import type * as types from "./routing.types";
import type * as version from "./tyras-versions";
import * as defaults from "./defaults";
import * as structure from "./tyras-structure";

export const ROUTE_PATH =
  "/:dataValidation?/:server?/:serverVersion?/:client?/:clientVersion?";

export const buildDataURL = (
  params: types.DocumentationParams,
  versionKind: version.VersionKind | undefined,
): string | undefined =>
  (versionKind === "server" && params.server === structure.ASPECT_NONE) ||
  (versionKind === "client" && params.client === structure.ASPECT_NONE)
    ? undefined
    : `/docs/${params.dataValidation}/${
        versionKind === undefined
          ? "protocol"
          : versionKind === "server"
          ? `server-${params.server}/${params.serverVersion}`
          : `client-${params.client}/${params.clientVersion}`
      }.json`;

export const buildNavigationURL = (params: types.DocumentationParams) =>
  `/${params.dataValidation}/${params.server}/${params.serverVersion}/${params.client}/${params.clientVersion}`;

export const buildFromURL = (url: string): types.DocumentationParams => {
  const fragments = url.split("/");
  if (fragments[0]?.length < 1) {
    fragments.splice(0, 1);
  }
  const [dataValidation, server, serverVersion, client, clientVersion] =
    fragments;
  return defaults.withDefaultParams({
    ...(dataValidation && { dataValidation }),
    ...(server && { server }),
    ...(serverVersion && { serverVersion }),
    ...(client && { client }),
    ...(clientVersion ? { clientVersion } : {}),
  });
};
