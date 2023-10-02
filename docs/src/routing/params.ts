import { useLocation } from "@solidjs/router";
import * as url from "./url";
import * as defaults from "./defaults";
import type * as types from "./routing.types";

/**
 * Because routes are used like this (one route which always matches), the navigations between/within routes will be special: [see GH issue on this](https://github.com/solidjs/solid-router/issues/264).
 * This means that `useParams` from Solid.JS Router library **CAN NOT BE USED**, as it will **NOT** be updated by router between re-renders (even with RematchDynamic trick).
 * Instead, we need to build own `useParams`, which will parse them from the result of `useLocation`, which, thankfully, **WILL** be updated when navigating within same route.
 */
export const useParams = () => {
  const paramsOrNavigate = useParamsOrNavigate();
  if (paramsOrNavigate.kind === "navigate") {
    throw new Error(
      "At least some ancestor component should call useParamsOrNavigate and handle result",
    );
  }
  return paramsOrNavigate.params;
};

export const useParamsOrNavigate = (): DocumentationParamsOrNavigate => {
  const location = useLocation();
  const parsed = url.buildFromURL(location.pathname);
  const actual = defaults.withDefaultParams(parsed);
  return Object.keys(actual).some(
    (propName) =>
      actual[propName as keyof typeof actual] !==
      parsed[propName as keyof typeof parsed],
  )
    ? {
        kind: "navigate",
        url: url.buildNavigationURL(actual),
      }
    : {
        kind: "params",
        params: actual,
      };
};

export type DocumentationParamsOrNavigate =
  | {
      kind: "params";
      params: types.DocumentationParams;
    }
  | { kind: "navigate"; url: string };
