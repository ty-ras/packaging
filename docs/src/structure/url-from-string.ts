import type * as types from "./params.types";
import * as consts from "./consts";
import { tyrasStructure } from "./tyras-structure";
import { tyrasVersions } from "./tyras-versions";
import * as url2string from "./url-to-string";

export const parseParamsAndMaybeNewURL = (pathname: string) => {
  let paramsOrFullURL = parseParamsFromURL(pathname);
  let maybeURL: string | undefined;
  if (isNavigate(paramsOrFullURL)) {
    maybeURL = paramsOrFullURL;
    // The given URL was really partial
    paramsOrFullURL = parseParamsFromURL(paramsOrFullURL);
    if (isNavigate(paramsOrFullURL)) {
      // If we get partial URL again even after result of parseParamsFromPathname, we have encountered internal error
      throw new Error(
        `The given partial navigation URL "${pathname}" was resolved to be partial even on 2nd attempt, this signals error in URL parsing logic.`,
      );
    }
  }

  return { params: paramsOrFullURL, maybeURL };
};

export const getURLSuffixForSelectedReflection = (
  selectedReflection: types.SelectedReflection,
): string =>
  selectedReflection
    ? `/${
        typeof selectedReflection === "string"
          ? selectedReflection
          : `${selectedReflection.docKind}${consts.SELECTED_REFLECTION_SEPARATOR}${selectedReflection.name}`
      }`
    : "";

export const parseParamsFromURL = (
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
    selectedReflectionFragment,
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
        server === consts.ASPECT_NONE &&
        serverVersion === consts.ASPECT_NONE
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

  handleSelectedPortionOfParams(selectedReflectionFragment, params);

  return urlValid ? params : url2string.buildNavigationURL(params);
};

const handleSelectedPortionOfParams = (
  selectedReflectionFragment: string | undefined,
  params: types.DocumentationParams,
) => {
  const selectedReflection = getSelectedReflectionFromURLSuffix(
    selectedReflectionFragment,
    params.kind,
  );
  if (selectedReflection) {
    params.selectedReflection = selectedReflection;
  }
  return !!selectedReflection;
};

export type DocumentationParamsOrNavigate = types.DocumentationParams | string;

const inArrayOrFirst = (
  item: string | undefined,
  array: ReadonlyArray<string>,
): string => (!!item && array.indexOf(item) >= 0 ? item : array[0]);

export const getSelectedReflectionFromURLSuffix = (
  urlSuffix: string | undefined,
  paramsKind: types.DocumentationParams["kind"],
): types.SelectedReflection => {
  let retVal: types.SelectedReflection;
  if (urlSuffix) {
    if (paramsKind === consts.NAVIGATION_PARAM_KIND_SERVER_AND_CLIENT) {
      const separatorIdx = urlSuffix.indexOf(
        consts.SELECTED_REFLECTION_SEPARATOR,
      );
      if (separatorIdx >= 0 && separatorIdx < urlSuffix.length - 1) {
        const selectedKind = urlSuffix.substring(0, separatorIdx);
        if (
          selectedKind === consts.VERSION_KIND_SERVER ||
          selectedKind === consts.VERSION_KIND_CLIENT
        ) {
          retVal = {
            docKind: selectedKind,
            name: urlSuffix.substring(separatorIdx + 1),
          };
        }
      }
    } else {
      retVal = urlSuffix;
    }
  }
  return retVal;
};

const isNavigate = (
  paramsOrNavigate: DocumentationParamsOrNavigate,
): paramsOrNavigate is string => typeof paramsOrNavigate === "string";
