import {
  createSignal,
  createResource,
  createEffect,
  createMemo,
  Show,
  onMount,
  onCleanup,
  batch,
  lazy,
} from "solid-js";
import { createStore } from "solid-js/store";
import { AppBar, Box, Typography } from "@suid/material";
import * as structure from "../structure";
import TyRASDocumentationToolbar from "./TyRASDocumentationToolbar";
import * as documentation from "./documentation/functionality";
import TopLevelElementsToolbar from "./documentation/views/TopLevelElementsToolbar";
import TopLevelElementsList from "./documentation/views/TopLevelElementsList";
const SingleElementContents = lazy(
  async () => await import("./documentation/views/SingleElementContents"),
);

export default function TyRASDocumentation() {
  const [params, setParams] = createSignal(
    parseParamsAndMaybeNewURL(window.location.hash).params,
  );

  createEffect(() => {
    const paramsValue = params();
    const fromParams = structure.buildNavigationURL(paramsValue);
    // TODO use history API here.
    if (window.location.hash !== fromParams) {
      window.location.hash = fromParams;
    }
  });

  const [docs] = createResource<
    Record<string, structure.Documentation>,
    structure.DocumentationParams
  >(params, async (paramsValue) => {
    const docsInfo: Array<[string, structure.VersionKind | undefined]> = [];
    if (paramsValue.kind === "protocol") {
      docsInfo.push(["protocol", undefined]);
    } else {
      if (paramsValue.kind !== "client") {
        docsInfo.push(["server", "server"]);
      }
      if (paramsValue.kind !== "server") {
        docsInfo.push(["client", "client"]);
      }
    }
    return Object.fromEntries(
      await Promise.all(
        docsInfo.map(
          async ([key, versionKind]) =>
            [
              key,
              (await // TODO maybe cache value here? key: data URL, value: promise
              // Not sure how much that really helps, as server probably can optimize that already with etags and such
              (
                await fetch(structure.buildDataURL(paramsValue, versionKind))
              ).json()) as structure.Documentation,
            ] as const,
        ),
      ),
    );
  });

  const groupNames = createMemo(() => {
    const arr = Array.from(
      new Set(
        Object.values(docs() ?? {}).flatMap((doc) =>
          documentation.getGroupNames(doc.project),
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
      docs() ?? {},
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
  const [currentElement, setCurrentElement] = createSignal<
    documentation.TopLevelElement | undefined
  >();
  const [observedAppBarHeight, setObservedAppBarHeight] =
    createSignal<number>(0);
  let appBarElement: HTMLDivElement | undefined;
  createEffect(() => {
    if (appBarElement) {
      setObservedAppBarHeight(appBarElement.clientHeight);
    }
  });

  const { width, enableResize } = useResize(50, 250);

  return (
    <>
      <AppBar ref={appBarElement} position="sticky">
        <TyRASDocumentationToolbar params={params()} setParams={setParams} />
        <TopLevelElementsToolbar
          groupStates={groupStates}
          setGroupStates={setGroupStates}
          groupNames={groupNames()}
          setLastSelectedGroup={setLastSelectedGroup}
        />
      </AppBar>
      <Show when={docs()}>
        {(docs) => (
          <Box>
            <Box
              sx={{
                maxWidth: "100%",
                marginLeft: "auto",
                marginRight: "auto",
                display: "flex",
                flexWrap: "wrap",
              }}
            >
              <Box
                sx={{
                  maxWidth: "100%",
                  display: "flex",
                  flexGrow: 1,
                  flexShrink: 1,
                  flexBasis: "100%",
                  flexWrap: "wrap",
                }}
              >
                <Box sx={{ width: "auto" }}>
                  <Box
                    sx={{
                      display: "flex",
                      width: "auto",
                      height: `calc(100vh - ${observedAppBarHeight()}px)`,
                      maxHeight: `calc(100vh - ${observedAppBarHeight()}px) !important`,
                      position: "sticky",
                      top: "0px",
                      flexDirection: "row-reverse",
                      minWidth: "0px",
                    }}
                  >
                    <Box
                      sx={{
                        height: "100%",
                        position: "relative",
                        width: "1px",
                        backgroundColor: "black",
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          inset: "0px -2px",
                          cursor: "col-resize",
                          backgroundColor: "transparent",
                          transitionDelay: "0.1s",
                        }}
                        onMouseDown={enableResize}
                      />
                    </Box>
                    <Box
                      sx={{
                        overflow: "auto",
                        width: width(),
                      }}
                    >
                      <TopLevelElementsList
                        elements={topLevelElements()}
                        lastSelectedGroup={lastSelectedGroup()}
                        setCurrentElement={setCurrentElement}
                      />
                    </Box>
                  </Box>
                </Box>
                <Box
                  component="main"
                  sx={{
                    display: "flex",
                    flexGrow: 1,
                    flexShrink: 1,
                    flexBasis: "0px",
                    minWidth: "1px",
                    height: `calc(100vh - ${observedAppBarHeight()}px)`,
                    maxHeight: `calc(100vh - ${observedAppBarHeight()}px) !important`,
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      maxWidth: "100%",
                      flexGrow: 1,
                      overflow: "auto",
                    }}
                  >
                    <Show
                      when={currentElement()}
                      fallback={
                        <Typography>
                          Please select element from the list
                        </Typography>
                      }
                    >
                      {(elem) => (
                        <SingleElementContents
                          currentElement={elem()}
                          headerLevel={3}
                          prettierOptions={{
                            printWidth: 80,
                            trailingComma: "all",
                            tabWidth: 2,
                            useTabs: false,
                            endOfLine: "lf",
                          }}
                          showDocKinds={Object.keys(docs()).length > 1}
                        />
                      )}
                    </Show>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Show>
    </>
  );
}

const parseParamsAndMaybeNewURL = (pathname: string) => {
  let paramsOrFullURL = parseParamsFromPathname(pathname);
  let maybeURL: string | undefined;
  if (isNavigate(paramsOrFullURL)) {
    maybeURL = paramsOrFullURL;
    // The given URL was really partial
    paramsOrFullURL = parseParamsFromPathname(paramsOrFullURL);
    if (isNavigate(paramsOrFullURL)) {
      // If we get partial URL again even after result of parseParamsFromPathname, we have encountered internal error
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

const useResize = (minWidth: number, initialWidth?: number) => {
  const [width, setWidth] = createSignal(initialWidth ?? minWidth);
  const [isResizing, setIsResizing] = createSignal(false);
  const [initialX, setInitialX] = createSignal<number | undefined>();

  const onMouseMove = (e: MouseEvent) => {
    if (isResizing()) {
      const widthChange = e.clientX - (initialX() ?? 0);
      const newWidth = width() + widthChange;
      if (newWidth >= minWidth) {
        setInitialX(e.clientX);
        setWidth(width() + widthChange);
      }
    }
  };
  const onMouseUp = () => {
    if (isResizing()) {
      setIsResizing(false);
    }
  };

  onMount(() => {
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });
  onCleanup(() => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  });

  const enableResize = (e: MouseEvent) => {
    e.preventDefault();
    if (!isResizing()) {
      const initialX = e.clientX;
      batch(() => {
        setIsResizing(true);
        setInitialX(initialX);
      });
    }
  };

  return { width, enableResize };
};
