/* @refresh reload */
import { render } from "solid-js/web";
import { Router, hashIntegration } from "@solidjs/router";
import App from "./App";

render(
  () => (
    // We must use hash for routing, because GitHub pages does not support path-based routing out of the box very well
    // There are few 'solutions' which rely on custom 404 page which then performs the render, but it is not very stable, as some browsers still give 404 errors to user in that case.
    <Router source={hashIntegration()}>
      <App />
    </Router>
  ),
  document.getElementById("root")!,
);
