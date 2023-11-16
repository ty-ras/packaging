import type * as types from "./params.types";
import * as consts from "./consts";
import { tyrasStructure } from "./tyras-structure";
import { tyrasVersions } from "./tyras-versions";
import type * as versions from "./tyras-versions.types";
import * as url2string from "./url-to-string";

export const parseParamsAndMaybeNewURL = (pathname: string) => {
  let paramsOrFullURL = parseParamsFromURL(pathname);
  let maybeURL: string | undefined;
  let params: types.DocumentationParams | undefined;
  if (isNavigate(paramsOrFullURL)) {
    maybeURL = paramsOrFullURL;
    // The given URL was really partial, or targeting something else
    paramsOrFullURL = parseParamsFromURL(paramsOrFullURL);
    if (!isNavigate(paramsOrFullURL)) {
      params = paramsOrFullURL;
    }
  } else {
    params = paramsOrFullURL;
  }

  return params ? { params, maybeURL } : undefined;
};

const parseParamsFromURL = (
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
  // eslint-disable-next-line sonarjs/cognitive-complexity
): types.SelectedReflection => {
  let retVal: types.SelectedReflection;
  if (urlSuffix) {
    let docKind: versions.VersionKind | undefined;
    if (paramsKind === consts.NAVIGATION_PARAM_KIND_SERVER_AND_CLIENT) {
      const separatorIdx = urlSuffix.indexOf(
        consts.SELECTED_REFLECTION_SEPARATOR,
      );
      if (separatorIdx > 0 && separatorIdx < urlSuffix.length - 1) {
        const selectedKind = urlSuffix.substring(0, separatorIdx);
        if (
          selectedKind === consts.VERSION_KIND_SERVER ||
          selectedKind === consts.VERSION_KIND_CLIENT
        ) {
          docKind = selectedKind;
          urlSuffix = urlSuffix.substring(separatorIdx + 1);
        }
      }
    }
    const separatorIdx = urlSuffix.indexOf(
      consts.SELECTED_REFLECTION_PATH_ITEM_SEPARATOR,
    );
    const pathToElement: types.SelectedReflectionPathArray = [];
    let topLevelName: string;
    if (separatorIdx > 0) {
      topLevelName = urlSuffix.substring(0, separatorIdx);
      urlSuffix
        .substring(separatorIdx + 1)
        .split(consts.SELECTED_REFLECTION_PATH_ITEM_SEPARATOR)
        .forEach((childEntry) => {
          const [groupName, elementName] = childEntry.split(
            consts.SELECTED_REFLECTION_GROUP_CHILD_SEPARATOR,
          );
          pathToElement.push({ groupName, elementName });
        });
    } else {
      topLevelName = urlSuffix;
    }
    const path: types.SelectedReflectionPath = {
      topLevelName,
      pathToElement,
    };
    retVal = docKind
      ? {
          docKind,
          path,
        }
      : path;
  }
  return retVal;
};

const isNavigate = (
  paramsOrNavigate: DocumentationParamsOrNavigate,
): paramsOrNavigate is string => typeof paramsOrNavigate === "string";
