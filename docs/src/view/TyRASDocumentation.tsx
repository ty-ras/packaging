import {
  createSignal,
  createResource,
  createEffect,
  createMemo,
} from "solid-js";
import { createStore } from "solid-js/store";
import { AppBar } from "@suid/material";
import * as structure from "../structure";
import TyRASDocumentationToolbar from "./TyRASDocumentationToolbar";
import * as documentation from "./documentation/functionality";
import TopLevelElementsToolbar from "./documentation/views/TopLevelElementsToolbar";
import TyRASDocumentationContents from "./TyRASDocumentationContents";
import equals from "fast-deep-equal";

export default function TyRASDocumentation() {
  // TODO we probably want _two_ params:
  // One for toolbar, which does NOT have selectedReflection
  // selectedReflection for contents
  // This way, we avoid re-updating anything related to toolbar, when we select something/click link to reflection.
  // The "setParams" passed to contents needs then to set non-selectedReflection params only when it changes
  const initialParams =
    structure.parseParamsAndMaybeNewURL(window.location.hash)?.params ??
    documentation.doThrow(
      // If we get partial URL again even after result of parseParamsFromPathname, we have encountered internal error
      `The given partial navigation URL "${window.location.hash}" was resolved to be partial even on 2nd attempt, this signals error in URL parsing logic.`,
    );
  const [params, setParams] = createSignal(initialParams, {
    equals,
  });

  createEffect(() => {
    const paramsValue = params();
    const fromParams = structure.buildNavigationURL(paramsValue);
    // TODO use history API here.
    if (window.location.pathname !== "/") {
      window.location.pathname = "/";
    }
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
  const [appBarElement, setAppBarElement] = createSignal<
    HTMLDivElement | undefined
  >();

  return (
    <>
      <AppBar ref={setAppBarElement} position="sticky">
        <TyRASDocumentationToolbar params={params()} setParams={setParams} />
        <TopLevelElementsToolbar
          groupStates={groupStates}
          setGroupStates={setGroupStates}
          groupNames={groupNames()}
          setLastSelectedGroup={setLastSelectedGroup}
        />
      </AppBar>
      <TyRASDocumentationContents
        lastSelectedGroup={lastSelectedGroup()}
        docs={docs() ?? {}}
        appBarElement={appBarElement()}
        groupNames={groupNames()}
        groupStates={groupStates}
        navigationParams={params()}
        setNavigationParams={setParams}
      />
    </>
  );
}
