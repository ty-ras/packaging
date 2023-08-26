/**
 * @file This file contains TyRAS protocol type definitions for endpoint doing a greeting.
 */

import type * as data from "./data";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type * as protocol from "@ty-ras/protocol"; // Imported only for JSDoc.

/**
 * This is TyRAS protocol type definition for endpoint which performs a greeting.
 */
export interface GetGreeting {
  /**
   * The HTTP method for this endpoint: `GET`.
   * @see protocol.ProtocolSpecCore.method
   */
  method: "GET";

  /**
   * The URL parameters for this endpoint.
   * Only one:
   * - `target`: The target of the greeting.
   * @see protocol.ProtocolSpecURL.url
   * @see data.GreetingTarget
   */
  url: {
    target: data.GreetingTarget;
  };
  /**
   * The response body for this endpoint.
   * @see protocol.ProtocolSpecCore.responseBody
   */
  responseBody: data.GreetingResult;
}
