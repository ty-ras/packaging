import { createResource } from "solid-js";
import type * as types from "./data.types";
import * as url from "./url";

/**
 * Because routes are used like this (one route which always matches), the navigations between routes will be special: [see GH issue on this](https://github.com/solidjs/solid-router/issues/264).
 * This means that `useRouteData` from Solid.JS Router library **CAN NOT BE USED**, as it will **NOT** be updated by router between re-renders (even with RematchDynamic trick).
 * Instead, we need to build own `useRouteData`, losing the benefit of side-by-side dynamic loading + data fetching, but at least making this app to work.
 * @returns The result of {@link createResource} with correct URL.
 */
export const useRouteData = (...args: Parameters<typeof url.buildDataURL>) => {
  const dataURL = url.buildDataURL(...args);
  const [resource] = createResource<types.RouteData | undefined, string>(
    dataURL,
    async () =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      dataURL === undefined ? undefined : await (await fetch(dataURL)).json(),
  );
  return resource;
};
