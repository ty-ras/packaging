/**
 * @file This file contains code exposing the TyRAS application builder.
 */

import * as tyras from "../..";

const app = tyras.newBuilder({
  // Max limit for request bodies is 10MB by default.
  limit: "10mb",
});

/**
 * This is the application builder to use to define OpenAPI-enabled endpoints.
 */
export default app;

/**
 * This type is the base type for all state specifications used by endpoints.
 */
export type StateSpecBase = tyras.StateSpecBaseOfAppBuilder<typeof app>;
