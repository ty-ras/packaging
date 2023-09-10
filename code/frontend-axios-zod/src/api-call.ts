/**
 * @file This file provides QoL function to create API call factory.
 */

import * as client from "@ty-ras/client-axios";
import * as data from "@ty-ras/data-frontend-zod";

/**
 * Creates {@link data.APICallFactory} that can be used to create callbacks which will call specific HTTP endpoint.
 * @param args The {@link client.HTTPEndpointCallerArgs} to use.
 * @returns A {@link data.APICallFactory} that can be used to create callbacks which will call specific HTTP endpoint.
 */
export const createAPICallFactory = (args: client.HTTPEndpointCallerArgs) =>
  data.createAPICallFactoryWithCallback(client.createCallHTTPEndpoint(args));
