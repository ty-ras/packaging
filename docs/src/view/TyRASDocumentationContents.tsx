import { createSignal, Show, onMount, onCleanup, batch, lazy } from "solid-js";
import { Box, Typography } from "@suid/material";
import * as documentation from "./documentation/functionality";
import type * as codeGen from "./documentation/code-generation";
import type * as navigation from "./documentation/navigation";
import TopLevelElementsList from "./documentation/views/TopLevelElementsList";
import SingleElementContents from "./documentation/views/SingleElementContents";
import * as structure from "../structure";
import type * as types from "./tyras-view.types";

// Put the context provider behind `lazy` as it loads Prettier libs, which are pretty  big
const SingleElementContentsContextProvider = lazy(
  async () =>
    await import(
      "./documentation/components/SingleElementContentsContextProvider"
    ),
);

export default function TyRASDocumentationContents(
  props: TyRASDocumentationContentsProps,
) {
  const [currentElement, setCurrentElement] = createSignal(
    getCurrentElementFromNavigationParams(
      props.navigationParams.selectedReflection,
      props.docs,
    ),
  );

  const observedAppBarHeight = () => props.appBarElement?.clientHeight ?? 0;

  const { width, enableResize } = useResize(50, 250);

  const [prettierOptions] = createSignal<codeGen.PrettierOptions>({
    printWidth: 80,
    trailingComma: "all",
    tabWidth: 2,
    useTabs: false,
    endOfLine: "lf",
  });

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
                  elements={documentation.getGroupedTopLevelElements(
                    props.groupNames,
                    props.groupStates,
                    props.docs,
                  )}
                  lastSelectedGroup={props.lastSelectedGroup}
                  setCurrentElement={(topLevel) =>
                    setCurrentElement(
                      topLevelElementToSelectedElement(topLevel),
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
              height: `calc(100vh - ${observedAppBarHeight()}px)`,
              maxHeight: `calc(100vh - ${observedAppBarHeight()}px) !important`,
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
                  <Typography>Please select element from the list</Typography>
                }
              >
                {(elem) => (
                  <SingleElementContentsContextProvider
                    index={elem().index}
                    prettierOptions={prettierOptions()}
                    linkFunctionality={createLinkHrefFunctionality(
                      props.navigationParams,
                      elem().index,
                      "server",
                      setCurrentElement,
                      props.setNavigationParams,
                    )}
                  >
                    <SingleElementContents
                      currentElement={elem().element}
                      docKinds={
                        Object.keys(props.docs).length > 1
                          ? elem().allDocKinds
                          : undefined
                      }
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
  appBarElement: HTMLDivElement | undefined;
  groupNames: Array<string>;
  groupStates: Record<string, boolean>;
  navigationParams: types.ContentNavigationParams;
  setNavigationParams: types.SimpleSetter<types.ContentNavigationParams>;
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
      .getTopLevelElements(docs)
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
  params: types.ContentNavigationParams,
  index: documentation.ModelIndex,
  docKind: structure.VersionKind,
  setCurrentElement: types.SimpleSetter<types.SelectedElement>,
  setNavigationParams: types.SimpleSetter<types.ContentNavigationParams>,
): navigation.LinkHrefFunctionality => ({
  fromReflection: (id) => {
    const reflection = index[id];
    return reflection === undefined
      ? undefined
      : structure.buildNavigationURL(
          params.kind === structure.NAVIGATION_PARAM_KIND_SERVER_AND_CLIENT
            ? {
                ...params,
                selectedReflection: { name: reflection.name, docKind },
              }
            : { ...params, selectedReflection: reflection.name },
        );
  },
  fromExternalSymbol: () => `/external-todo`,
  onClick: ({ target, href }) => {
    const pathname = href;
    let navigate = true;
    let reflection: documentation.IndexableModel | undefined;
    if (target === undefined) {
      // Some link to something on this same site
      const maybeParams = structure.parseParamsAndMaybeNewURL(href)?.params;
      if (maybeParams) {
        setNavigationParams(maybeParams);
      } else {
        // There was some internal error related to parsing params from string
        navigate = false;
      }
    } else {
      // Link to reflection
      reflection = index[target];

      if (reflection) {
        setCurrentElement({
          element: reflection,
          index,
          // TODO
          allDocKinds: [],
        });
      } else {
        // Link to non-existing reflection?
        navigate = false;
      }
    }
    if (navigate) {
      window.location.hash = pathname;
    } else {
      // eslint-disable-next-line no-console
      console.error(`Could not navigate to ${target} via link "${href}"`);
    }
  },
});
