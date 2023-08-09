/**
 * @file This file contains the code to call the greeting endpoint.
 */

import * as tyras from "../../../";
import { greeting } from "../protocol";
import factory from "../app";

export default {
  getGreeting: factory.makeAPICall<greeting.GetGreeting>({
    method: tyras.METHOD_GET,
    url: tyras.url`/api/greet/${tyras.urlParam(
      "target",
      greeting.data.greetingTarget,
    )}`,
    response: tyras.fromDecoder(greeting.data.greeting),
  }),
};
