import type * as types from "./routing.types";
import * as tyrasStructure from "./tyras-structure";
import * as versions from "./tyras-versions";

export const withDefaultParams = (
  params: types.DocumentationParamsFromRouter,
): types.DocumentationParams => {
  const withoutVersions = Object.assign({}, DEFAULTS, params);
  return {
    ...withoutVersions,
    serverVersion:
      versions.getLatestVersion(
        withoutVersions.dataValidation,
        "server",
        withoutVersions.server,
      ) ?? tyrasStructure.ASPECT_NONE,
    clientVersion:
      versions.getLatestVersion(
        withoutVersions.dataValidation,
        "client",
        withoutVersions.client,
      ) ?? tyrasStructure.ASPECT_NONE,
  };
};

const DEFAULTS: Readonly<
  Omit<types.DocumentationParams, "serverVersion" | "clientVersion">
> = Object.freeze({
  dataValidation: tyrasStructure.tyrasStructure.dataValidation[0],
  server: tyrasStructure.tyrasStructure.server[0],
  client: tyrasStructure.tyrasStructure.client[0],
});
