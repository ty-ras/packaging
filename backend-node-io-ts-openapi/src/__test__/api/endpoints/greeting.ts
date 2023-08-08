/**
 * @file This file contains the implementation for greeting endpoint.
 */

import * as tyras from "../../..";
import { greeting } from "../protocol";
import app, { type StateSpecBase } from "../app";

const urlPath = app.url`${tyras.urlParameter(
  "target",
  greeting.data.greetingTarget,
)}`({
  openapi: {
    pathItem: {
      description: "Endpoint(s) related to greeting.",
    },
    url: {
      target: {
        description: "The target to greet.",
      },
    },
  },
});

const stateSpec = {
  // We don't really use authentication-related properties in the endpoint.
  // This is just to demonstrate how to specify that "this endpoint works for both authenticated and unauthenticated requests".
  userId: false,
} as const satisfies StateSpecBase;

/**
 * This class implements the greeting endpoint(s).
 */
export default class GreetingEndpoint {
  /**
   * Implementation for {@link greeting.GetGreeting} endpoint.
   * @param param0 The endpoint input.
   * @param param0.url Privately deconstructed variable.
   * @param param0.url.target Privately deconstructed variable.
   * @returns The greeting.
   * @see greeting.GetGreeting
   */
  @urlPath<greeting.GetGreeting>({
    openapi: {
      operation: { description: "Get the greeting for given target." },
      responseBody: {
        description: "The returned greeting.",
        mediaTypes: { "application/json": { example: "Hello, world!" } },
      },
    },
  })({
    method: "GET",
    responseBody: tyras.responseBody(greeting.data.greeting),
    state: stateSpec,
  })
  getGreeting({
    url: { target },
  }: tyras.GetMethodArgs<
    greeting.GetGreeting,
    typeof urlPath,
    typeof stateSpec
  >) {
    return `Hello, ${target}!`;
  }
}
