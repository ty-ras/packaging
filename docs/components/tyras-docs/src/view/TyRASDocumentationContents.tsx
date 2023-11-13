import { Throw } from "throw-expression";
import {
  createSignal,
  Show,
  onMount,
  onCleanup,
  batch,
  lazy,
  createMemo,
} from "solid-js";
import { Box, Typography } from "@suid/material";
import equals from "fast-deep-equal";
import * as documentation from "@typedoc-2-ts/browser";
import type * as codeGen from "@typedoc-2-ts/transform";
import {
  TopLevelElementsList,
  SingleElementContents,
} from "@typedoc-2-ts/solidjs";
import * as structure from "../structure";
import type * as types from "./tyras-view.types";
import * as routing from "./routing";

// Put the context provider behind `lazy` as it imports Prettier libs, which are pretty  big
const SingleElementContentsContextProvider = lazy(async () => ({
  default: (await import("@typedoc-2-ts/solidjs")).SingleElementContentsContext,
}));

export default function TyRASDocumentationContents(
  props: TyRASDocumentationContentsProps,
) {
  const currentElement = createMemo(() =>
    getCurrentElementFromNavigationParams(
      props.contentNavigationParams.selectedReflection,
      props.docs,
    ),
  );

  const { width, enableResize } = useResize(50, 250);

  const [prettierOptions] = createSignal<codeGen.PrettierOptions>(
    {
      printWidth: 80,
      trailingComma: "all",
      tabWidth: 2,
      useTabs: false,
      endOfLine: "lf",
    },
    { equals },
  );

  // TODO Not sure if all of these Boxes are strictly necessary.
  // I used the same structure as GitHub webpage, but I'm sure it could be done with lesser amount of Boxes.
  return (
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
                height: `calc(100vh - ${props.appBarElementHeigth}px)`,
                maxHeight: `calc(100vh - ${props.appBarElementHeigth}px) !important`,
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
                  elements={documentation.getGroupedTopLevelElements(
                    props.groupNames,
                    props.groupStates,
                    props.docs,
                  )}
                  lastSelectedGroup={props.lastSelectedGroup}
                  setCurrentElement={(topLevel) =>
                    props.setContentNavigationParams(
                      props.toolbarNavigationParams.kind ===
                        structure.NAVIGATION_PARAM_KIND_SERVER_AND_CLIENT
                        ? {
                            selectedReflection: {
                              docKind: topLevel
                                .allDocKinds[0] as structure.VersionKind,
                              name: topLevel.element.name,
                            },
                          }
                        : { selectedReflection: topLevel.element.name },
                    )
                  }
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
              height: `calc(100vh - ${props.appBarElementHeigth}px)`,
              maxHeight: `calc(100vh - ${props.appBarElementHeigth}px) !important`,
            }}
          >
            <Box
              sx={{
                width: "100%",
                flexGrow: 1,
                overflow: "auto",
              }}
            >
              <Show
                when={currentElement()}
                fallback={
                  <Typography>
                    {props.contentNavigationParams.selectedReflection
                      ? "Loading..."
                      : "Please select element from the list"}
                  </Typography>
                }
              >
                {(elem) => (
                  <SingleElementContentsContextProvider
                    index={elem().index}
                    prettierOptions={prettierOptions()}
                    linkFunctionality={createLinkHrefFunctionality(
                      props.toolbarNavigationParams,
                      props.setContentNavigationParams,
                      props.setFullNavigationParams,
                      elem().index,
                      // If we have more than one version kind, for now - just pick first one.
                      getAllDocKinds(props.docs, elem())?.[0] as
                        | structure.VersionKind
                        | undefined,
                    )}
                  >
                    <SingleElementContents
                      currentElement={elem().element}
                      docKinds={getAllDocKinds(props.docs, elem())}
                      headerLevel={3}
                    />
                  </SingleElementContentsContextProvider>
                )}
              </Show>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export interface TyRASDocumentationContentsProps {
  docs: Record<string, structure.Documentation>;
  lastSelectedGroup: string | undefined;
  appBarElementHeigth: number;
  groupNames: Array<string>;
  groupStates: Record<string, boolean>;
  contentNavigationParams: types.ContentNavigationParams;
  setContentNavigationParams: types.SimpleSetter<types.ContentNavigationParams>;
  toolbarNavigationParams: types.ToolbarNavigationParams;
  setFullNavigationParams: types.SimpleSetter<types.FullNavigationParams>;
}

const useResize = (minWidth: number, initialWidth?: number) => {
  const [width, setWidth] = createSignal(initialWidth ?? minWidth);
  const [isResizing, setIsResizing] = createSignal(false);
  const [initialX, setInitialX] = createSignal<number | undefined>();

  const onMouseMove = (e: MouseEvent) => {
    if (isResizing()) {
      const widthChange = e.clientX - (initialX() ?? 0);
      const curWidth = width();
      const newWidth = curWidth + widthChange;
      if (newWidth >= minWidth) {
        setInitialX(e.clientX);
        setWidth(curWidth + widthChange);
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

const getCurrentElementFromNavigationParams = (
  selectedReflection: structure.SelectedReflection,
  docs: Record<string, structure.Documentation>,
): types.SelectedElement | undefined => {
  if (selectedReflection) {
    const name =
      typeof selectedReflection === "string"
        ? selectedReflection
        : selectedReflection.name;
    const topLevel = documentation
      .getTopLevelElements(
        typeof selectedReflection === "string" ||
          !(selectedReflection.docKind in docs)
          ? docs
          : { [selectedReflection.docKind]: docs[selectedReflection.docKind] },
      )
      .find(({ element: { name: topLevelName } }) => topLevelName === name);
    return topLevel ? topLevelElementToSelectedElement(topLevel) : undefined;
  }
};

const topLevelElementToSelectedElement = (
  topLevel: documentation.TopLevelElement,
): types.SelectedElement => ({
  element: topLevel.element,
  index: topLevel.globalContext.index,
  allDocKinds: topLevel.allDocKinds,
});

const createLinkHrefFunctionality = (
  toolbarNavigationParams: types.ToolbarNavigationParams,
  setContentNavigationParams: types.SimpleSetter<types.ContentNavigationParams>,
  setFullNavigationParams: types.SimpleSetter<types.FullNavigationParams>,
  index: documentation.ModelIndex,
  docKind: structure.VersionKind | undefined,
): documentation.LinkHrefFunctionality => ({
  fromReflection: (id) => {
    const reflection = index[id];
    return reflection === undefined
      ? undefined
      : routing.logicalURL2ActualURL(
          structure.buildNavigationURL(
            toolbarNavigationParams.kind ===
              structure.NAVIGATION_PARAM_KIND_SERVER_AND_CLIENT
              ? {
                  ...toolbarNavigationParams,
                  selectedReflection: {
                    name: reflection.name,
                    docKind: ensureDocKind(docKind),
                  },
                }
              : {
                  ...toolbarNavigationParams,
                  selectedReflection: reflection.name,
                },
          ),
        );
  },
  fromExternalSymbol: () => `/external-todo`,
  onClick: ({ target, href }) => {
    href = routing.actualURL2LogicalURL(href);
    let navigate = true;
    let reflection: documentation.IndexableModel | undefined;
    if (target === undefined) {
      // Some link to something on this same site
      const maybeParams = structure.parseParamsAndMaybeNewURL(href)?.params;
      if (maybeParams) {
        setFullNavigationParams(maybeParams);
      } else {
        // There was some internal error related to parsing params from string
        navigate = false;
      }
    } else {
      // Link to reflection
      reflection = index[target];

      if (reflection) {
        setContentNavigationParams(
          toolbarNavigationParams.kind ===
            structure.NAVIGATION_PARAM_KIND_SERVER_AND_CLIENT
            ? {
                selectedReflection: {
                  docKind: ensureDocKind(docKind),
                  name: reflection.name,
                },
              }
            : {
                selectedReflection: reflection.name,
              },
        );
      } else {
        // Link to non-existing reflection?
        navigate = false;
      }
    }
    if (navigate) {
      routing.afterNavigatingToURL(href);
    } else {
      // eslint-disable-next-line no-console
      console.error(`Could not navigate to ${target} via link "${href}"`);
    }
  },
});

const getAllDocKinds = (
  docs: Record<string, structure.Documentation>,
  selectedElement: types.SelectedElement,
) => (Object.keys(docs).length > 1 ? selectedElement.allDocKinds : undefined);

const ensureDocKind = (docKind: string | undefined) =>
  (docKind as structure.VersionKind) ??
  Throw(
    `Doc kind must be defined when toolbar navigation kind is "${structure.NAVIGATION_PARAM_KIND_SERVER_AND_CLIENT}".`,
  );
