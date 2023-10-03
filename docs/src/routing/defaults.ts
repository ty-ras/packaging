import type * as types from "./routing.types";
import * as tyrasStructure from "./tyras-structure";
import * as versions from "./tyras-versions";
import * as url from "./url";

export const withDefaultParams = (
  params: types.DocumentationParamsFromRouter,
): types.DocumentationParams => {
  const withoutVersions = Object.assign({}, DEFAULTS, params);
  // TODO check for scenario when both server and client are "none" and change accordingly
  // It should never happen when redirecting within app, but if e.g. user inputs such url manually, we still need to handle it
  return {
    ...withoutVersions,
    serverVersion:
      versions.getLatestVersion(
        withoutVersions.dataValidation,
        "server",
        withoutVersions.server,
      ) ?? url.ASPECT_NONE,
    clientVersion:
      versions.getLatestVersion(
        withoutVersions.dataValidation,
        "client",
        withoutVersions.client,
      ) ?? url.ASPECT_NONE,
  };
};

const DEFAULTS: Readonly<
  Omit<types.DocumentationParams, "serverVersion" | "clientVersion">
> = Object.freeze({
  dataValidation: tyrasStructure.tyrasStructure.dataValidation[0],
  server: tyrasStructure.tyrasStructure.server[0],
  client: tyrasStructure.tyrasStructure.client[0],
});
