import { useLocation } from "@solidjs/router";
import * as url from "./url";
import type * as types from "./params.types";
import { tyrasStructure } from "./tyras-structure";
import { tyrasVersions } from "./tyras-versions";
/**
 * Because routes are used like this (one route which always matches), the navigations between/within routes will be special: [see GH issue on this](https://github.com/solidjs/solid-router/issues/264).
 * This means that `useParams` from Solid.JS Router library **CAN NOT BE USED**, as it will **NOT** be updated by router between re-renders (even with RematchDynamic trick).
 * Instead, we need to build own `useParams`, which will parse them from the result of `useLocation`, which, thankfully, **WILL** be updated when navigating within same route.
 */
export const useParams = (): types.DocumentationParams => {
  const paramsOrNavigate = useParamsOrNavigate();
  if (isNavigate(paramsOrNavigate)) {
    throw new Error(
      "At least some ancestor component must call useParamsOrNavigate and handle result",
    );
  }
  return paramsOrNavigate;
};

export const useParamsOrNavigate = (): DocumentationParamsOrNavigate =>
  parseParamsFromPathname(useLocation().pathname);

export const parseParamsFromPathname = (
  pathname: string,
): DocumentationParamsOrNavigate => {
  const fragments = pathname
    .split("/")
    .filter((fragment) => fragment.length > 0);

  const [
    dataValidationFragment,
    serverFragment,
    serverVersionFragment,
    clientFragment,
    clientVersionFragment,
  ] = fragments;
  const dataValidation = inArrayOrFirst(
    dataValidationFragment,
    tyrasStructure.dataValidation,
  );
  let urlValid = dataValidation === dataValidationFragment;
  const dvValid = urlValid;
  const protocolVersion = inArrayOrFirst(
    serverFragment,
    tyrasVersions.protocol[dataValidation],
  );
  let params: types.DocumentationParams;
  if (urlValid && protocolVersion === serverFragment) {
    params = { kind: "protocol", dataValidation, protocolVersion };
  } else {
    const versions = tyrasVersions.specific[dataValidation];
    const server = inArrayOrFirst(serverFragment, tyrasStructure.server);
    const serverVersion = inArrayOrFirst(
      serverVersionFragment,
      versions.server[server],
    );
    urlValid =
      urlValid &&
      server === serverFragment &&
      serverVersion === serverVersionFragment;
    if (urlValid && clientFragment === undefined) {
      params = {
        kind: "server",
        dataValidation,
        server: { name: server, version: serverVersion },
      };
    } else {
      const client = inArrayOrFirst(clientFragment, tyrasStructure.client);
      const clientVersion = inArrayOrFirst(
        clientVersionFragment,
        versions.client[client],
      );
      urlValid =
        urlValid &&
        client === clientFragment &&
        clientVersion === clientVersionFragment;
      params =
        dvValid &&
        server === url.ASPECT_NONE &&
        serverVersion === url.ASPECT_NONE
          ? {
              kind: "client",
              dataValidation,
              client: {
                name: client,
                version: clientVersion,
              },
            }
          : {
              kind: "server-and-client",
              dataValidation,
              server: {
                name: server,
                version: serverVersion,
              },
              client: {
                name: client,
                version: clientVersion,
              },
            };
    }
  }

  return urlValid ? params : url.buildNavigationURL(params);
};

export type DocumentationParamsOrNavigate = types.DocumentationParams | string;

export const isNavigate = (
  paramsOrNavigate: DocumentationParamsOrNavigate,
): paramsOrNavigate is string => typeof paramsOrNavigate === "string";

const inArrayOrFirst = (
  item: string | undefined,
  array: ReadonlyArray<string>,
): string => (!!item && array.indexOf(item) >= 0 ? item : array[0]);
