import { useLocation } from "@solidjs/router";
import * as url from "./url";

/**
 * Because routes are used like this (one route which always matches), the navigations between/within routes will be special: [see GH issue on this](https://github.com/solidjs/solid-router/issues/264).
 * This means that `useParams` from Solid.JS Router library **CAN NOT BE USED**, as it will **NOT** be updated by router between re-renders (even with RematchDynamic trick).
 * Instead, we need to build own `useParams`, which will parse them from the result of `useLocation`, which, thankfully, **WILL** be updated when navigating within same route.
 */
export const useParams = () => {
  const { pathname } = useLocation();
  return url.buildFromURL(pathname);
};
