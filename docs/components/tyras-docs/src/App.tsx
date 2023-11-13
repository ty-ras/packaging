import { CssBaseline, Typography } from "@suid/material";
import Documentation from "./view/TyRASDocumentation";
import { ErrorBoundary } from "solid-js";

export default function App() {
  return (
    <>
      <CssBaseline />
      <ErrorBoundary
        fallback={
          <Typography>
            There was an internal error while processing your request. Try{" "}
            <a href="/">navigating to main site</a> to see if that fixes the
            problem.
          </Typography>
        }
      >
        <Documentation />
      </ErrorBoundary>
    </>
  );
}
