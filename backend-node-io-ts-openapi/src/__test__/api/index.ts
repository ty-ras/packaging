/**
 * @file This file exposes the built TyRAS AppEndpoints, including OpenAPI endpoint, to be served via HTTP server.
 */

import * as tyras from "../../";
import app from "./app";
import Greeting from "./endpoints/greeting";

export default tyras.endpointsWithOpenAPI(
  app,
  app.createEndpoints(
    {
      openapi: {
        title: "The example API",
        version: "1.0.0",
      },
    },
    {
      "/api/": {
        "greet/": new Greeting(),
      },
    },
  ),
);
