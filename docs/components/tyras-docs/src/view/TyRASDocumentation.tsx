import { Throw } from "throw-expression";
import {
  createSignal,
  createResource,
  createEffect,
  createMemo,
  batch,
  onMount,
} from "solid-js";
import { createStore } from "solid-js/store";
import { AppBar } from "@suid/material";
import equals from "fast-deep-equal";
import * as structure from "../structure";
import type * as types from "./tyras-view.types";
import TyRASDocumentationToolbar from "./TyRASDocumentationToolbar";
import * as documentation from "@typedoc-2-ts/browser";
import { TopLevelElementsToolbar } from "@typedoc-2-ts/solidjs";
import TyRASDocumentationContents from "./TyRASDocumentationContents";
import * as routing from "./routing";

export default function TyRASDocumentation() {
  const fullParams =
    structure.parseParamsAndMaybeNewURL(routing.getCurrentRoutingURL())
      ?.params ??
    Throw(
      // If we get partial URL again even after result of parseParamsFromPathname, we have encountered internal error
      `The given partial navigation URL "${routing.getCurrentRoutingURL()}" was resolved to be partial even on 2nd attempt, this signals error in URL parsing logic.`,
    );
  // We don't want to create signal from full navigation params object, as then both toolbar and contents would update whenever just contents would change.
  // We could use createStore... But with the discrminating type unions, I am not sure if that is the best approach either.
  // Let's try with 2 signals for now.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { selectedReflection: _, ...toolbarParamsObj } = fullParams;
  const [toolbarParams, setToolbarParams] =
    createSignal<types.ToolbarNavigationParams>(toolbarParamsObj, {
      equals,
    });
  const [contentParams, setContentParams] =
    createSignal<types.ContentNavigationParams>(
      // eslint-disable-next-line sonarjs/no-all-duplicated-branches
      fullParams.kind === structure.NAVIGATION_PARAM_KIND_SERVER_AND_CLIENT
        ? {
            selectedReflection: fullParams.selectedReflection,
          }
        : {
            selectedReflection: fullParams.selectedReflection,
          },
      { equals },
    );

  createEffect(() => {
    const paramsValue = mergeParams(toolbarParams(), contentParams());
    const fromParams = structure.buildNavigationURL(paramsValue);

    routing.afterNavigatingToURL(fromParams);
  });

  const [docs] = createResource<
    Record<string, structure.Documentation>,
    structure.DocumentationParams
  >(toolbarParams, async (paramsValue) => {
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
  let appBarElement: HTMLDivElement | undefined;
  const [appBarHeigth, setAppBarHeight] = createSignal(0);
  onMount(() => setAppBarHeight(appBarElement?.clientHeight ?? 0));

  return (
    <>
      <AppBar ref={appBarElement} position="sticky">
        <TyRASDocumentationToolbar
          params={toolbarParams()}
          setParams={(params) =>
            batch(() => {
              setToolbarParams(params);
              setContentParams({ selectedReflection: undefined });
            })
          }
        />
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
        appBarElementHeigth={appBarHeigth()}
        groupNames={groupNames()}
        groupStates={groupStates}
        toolbarNavigationParams={toolbarParams()}
        setFullNavigationParams={({ selectedReflection, ...params }) =>
          batch(() => {
            setToolbarParams(params);
            setContentParams(
              // eslint-disable-next-line sonarjs/no-all-duplicated-branches
              typeof selectedReflection === "string"
                ? { selectedReflection }
                : { selectedReflection },
            );
          })
        }
        contentNavigationParams={contentParams()}
        setContentNavigationParams={setContentParams}
      />
    </>
  );
}

const mergeParams = (
  toolbarParams: types.ToolbarNavigationParams,
  contentParams: types.ContentNavigationParams,
): types.FullNavigationParams =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  ({
    ...toolbarParams,
    ...contentParams,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;
