import {
  createSignal,
  createResource,
  createEffect,
  createMemo,
} from "solid-js";
import { createStore } from "solid-js/store";
import { AppBar, Divider, Grid } from "@suid/material";
import * as structure from "../structure";
import TyRASDocumentationToolbar from "./TyRASDocumentationToolbar";
import * as documentation from "./documentation/functionality";
import TopLevelElementsToolbar from "./documentation/views/TopLevelElementsToolbar";
import TopLevelElementsList from "./documentation/views/TopLevelElementsList";
import SingleElementContents from "./documentation/views/SingleElementContents";

export default function TyRASDocumentation() {
  const [params, setParams] = createSignal(
    parseParamsAndMaybeNewURL(window.location.hash).params,
  );

  createEffect(() => {
    const paramsValue = params();
    const fromParams = structure.buildNavigationURL(paramsValue);
    if (window.location.hash !== fromParams) {
      window.location.hash = fromParams;
    }
  });

  const createDocumentationResource = (
    versionKind: structure.VersionKind | undefined,
  ) => {
    const [resource] = createResource<
      structure.Documentation | undefined,
      structure.DocumentationParams
    >(params, async (paramsValue) => {
      // TODO maybe cache value here? key: data URL, value: promise
      // Not sure how much that really helps, as server probably can optimize that already with etags and such
      const dataURL = structure.buildDataURL(paramsValue, versionKind);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return dataURL === undefined
        ? undefined
        : await (await fetch(dataURL)).json();
    });
    return resource;
  };

  const docs = createMemo(() => {
    const paramsValue = params();
    const retVal: Record<
      string,
      ReturnType<typeof createDocumentationResource>
    > = {};
    if (paramsValue.kind === "protocol") {
      retVal.protocol = createDocumentationResource(undefined);
    } else {
      if (paramsValue.kind !== "client") {
        retVal.server = createDocumentationResource("server");
      }
      if (paramsValue.kind !== "server") {
        retVal.client = createDocumentationResource("client");
      }
    }
    return retVal;
  });

  const actualDocs = createMemo(() => {
    return Object.fromEntries(
      Object.entries(docs()).map(([id, doc]) => [id, doc()?.project] as const),
    );
  });

  const groupNames = createMemo(() => {
    const arr = Array.from(
      new Set(
        Object.values(actualDocs()).flatMap((doc) =>
          documentation.getGroupNames(doc),
        ),
      ).values(),
    );
    arr.sort();
    return arr;
  });

  const [groupStates, setGroupStates] = createStore<documentation.GroupStates>(
    {},
  );

  const topLevelElements = createMemo(() => {
    return documentation.getTopLevelElementsFromMultipleDocumentations(
      groupNames(),
      groupStates,
      actualDocs(),
    );
  });

  createEffect(() => {
    setGroupStates(
      Object.fromEntries(
        groupNames().map((key) => [key, groupStates[key] ?? true] as const),
      ),
    );
  });

  const [lastSelectedGroup, setLastSelectedGroup] = createSignal<
    string | undefined
  >();
  const [currentElement, setCurrentContent] = createSignal<
    documentation.TopLevelElement | undefined
  >();

  return (
    <>
      <AppBar position="sticky">
        <TyRASDocumentationToolbar params={params()} setParams={setParams} />
        <TopLevelElementsToolbar
          groupStates={groupStates}
          setGroupStates={setGroupStates}
          groupNames={groupNames()}
          setLastSelectedGroup={setLastSelectedGroup}
        />
      </AppBar>
      <main>
        <Grid container>
          <Grid item sx={{ maxHeight: "100vh", overflow: "auto" }}>
            <TopLevelElementsList
              elements={topLevelElements()}
              lastSelectedGroup={lastSelectedGroup()}
              setCurrentElement={setCurrentContent}
            />
          </Grid>
          <Divider orientation="vertical" flexItem />
          <Grid item xs>
            <SingleElementContents currentElement={currentElement()} />
          </Grid>
        </Grid>
      </main>
    </>
  );
}

export const parseParamsAndMaybeNewURL = (pathname: string) => {
  let paramsOrFullURL = parseParamsFromPathname(pathname);
  let maybeURL: string | undefined;
  if (isNavigate(paramsOrFullURL)) {
    maybeURL = paramsOrFullURL;
    // The given URL was really partial
    paramsOrFullURL = parseParamsFromPathname(paramsOrFullURL);
    if (isNavigate(paramsOrFullURL)) {
      // If we get partial URL again even after rsult of parseParamsFromPathname, we have encountered internal error
      throw new Error(
        `The given partial navigation URL "${pathname}" was resolved to be partial even on 2nd attempt, this signals error in URL parsing logic.`,
      );
    }
  }

  return { params: paramsOrFullURL, maybeURL };
};

const parseParamsFromPathname = (
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
    structure.tyrasStructure.dataValidation,
  );
  let urlValid = dataValidation === dataValidationFragment;
  const dvValid = urlValid;
  const protocolVersion = inArrayOrFirst(
    serverFragment,
    structure.tyrasVersions.protocol[dataValidation],
  );
  let params: structure.DocumentationParams;
  if (urlValid && protocolVersion === serverFragment) {
    params = { kind: "protocol", dataValidation, protocolVersion };
  } else {
    const versions = structure.tyrasVersions.specific[dataValidation];
    const server = inArrayOrFirst(
      serverFragment,
      structure.tyrasStructure.server,
    );
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
      const client = inArrayOrFirst(
        clientFragment,
        structure.tyrasStructure.client,
      );
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
        server === structure.ASPECT_NONE &&
        serverVersion === structure.ASPECT_NONE
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

  return urlValid ? params : structure.buildNavigationURL(params);
};

type DocumentationParamsOrNavigate = structure.DocumentationParams | string;

const isNavigate = (
  paramsOrNavigate: DocumentationParamsOrNavigate,
): paramsOrNavigate is string => typeof paramsOrNavigate === "string";

const inArrayOrFirst = (
  item: string | undefined,
  array: ReadonlyArray<string>,
): string => (!!item && array.indexOf(item) >= 0 ? item : array[0]);
