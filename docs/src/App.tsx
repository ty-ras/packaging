import { lazy } from "solid-js";
import { Routes, Route } from "@solidjs/router";
import type { MatchFilters, MatchFilter } from "@solidjs/router/dist/types";
import * as routing from "./routing";
import { RematchDynamic } from "./components/RematchDynamic";

const Documentation = lazy(() => import("./view/TyRASDocumentation"));

export default function App() {
  return (
    <Routes>
      {
        // IMPORTANT!
        // Because routes are used like this (one route which always matches), the navigations between routes will be special:
        // https://github.com/solidjs/solid-router/issues/264
        // This means that useParams CAN NOT BE USED, as it will NOT be updated by router between re-renders (even with RematchDynamic trick).
        // Furthermore, this ALSO means that route data will NOT be re-called by router either!
        // Therefore, we simply can not use built-in useParams and useRouteData -functions.
        // Instead, in order to get parameters, we must parse them always via useLocation.
        // And to get data, we must use basic createResource.
        // These custom functions are exposed in ../routing folder.
        // With route params and route data fixed, as a final step, we must wrap our actual component into RematchDynamic in order to make re-render happen on sibling route navigation.
      }
      <Route
        path={routing.ROUTE_PATH}
        matchFilters={MATCH_FILTERS}
        element={<RematchDynamic component={Documentation} />}
      />
    </Routes>
  );
}

const MATCH_FILTERS = {
  // We can't do spread of just routing.tyrasStructure, because MatchFilter can only be mutable array, not ReadonlyArray
  dataValidation: [...routing.tyrasStructure.dataValidation],
  server: [...routing.tyrasStructure.server, routing.ASPECT_NONE],
  serverVersion: /[^/]+/,
  client: [...routing.tyrasStructure.client, routing.ASPECT_NONE],
  clientVersion: /[^/]+/,
} satisfies {
  [P in keyof MatchFilters<typeof routing.ROUTE_PATH>]-?: MatchFilter;
};
