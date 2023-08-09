/**
 * @file This file contains tests to use TyRAS-powered HTTP endpoint callbacks, and validate that the callbacks work as expected.
 */

import test from "ava";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type * as _ from "../fetch"; // Otherwise TS-Node will not work
import backend from "./backend";
// Notice that using fetch-mock forces downgrade of node-fetch to 2.x series.
// This is because fetch-mock uses 'require' to load node-fetch, and versions 3.x of node-fetch do not support that.
import fetchMock, { type MockRequest } from "fetch-mock";

// If we don't do this, fetch-mock will attempt to perform some of its own things onto returned response.
fetchMock.config.Response = Response;

// We have to do this horrible solution because fetch-mock has some internal state, and after adding enough tests, even with test.serial, the library spastically starts to fail.
const recordedCalls: ExpectedFetchInputs = [];
const returnedResponses: MockedFetchResponses = [];
let idx = 0;
fetchMock.mock({
  matcher: () => true,
  response: (url: string, opts: Request) => {
    const response = returnedResponses[idx++];
    recordedCalls.push({ url, opts });
    return typeof response === "string"
      ? new Response(Buffer.from(response))
      : response;
  },
});

test("Verify that using client works", async (c) => {
  c.plan(4);
  returnedResponses.push(JSON.stringify("Hello, world!"));

  c.deepEqual(
    await backend.greeting.getGreeting({ url: { target: "world" } }),
    {
      error: "none",
      data: "Hello, world!",
    },
  );
  c.deepEqual(recordedCalls, [
    {
      opts: {
        headers: {},
        method: "GET",
      },
      url: "http://localhost:123/api/greet/world",
    },
  ]);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
  const errorResult = await backend.greeting.getGreeting({ url: {} as any });
  if (errorResult.error === "error-input") {
    delete errorResult.errorInfo.url?.["errorInfo"];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    delete (errorResult.errorInfo.url as any)["getHumanReadableMessage"];
    c.deepEqual(errorResult.errorInfo, {
      url: {
        error: "error",
      },
    });
    // Make sure no actual HTTP calls has been made since the error was in the input.
    c.deepEqual(recordedCalls.length, 1);
  }
});

type MockedFetchResponses = Array<string | Response>;
type ExpectedFetchInputs = Array<{ url: string; opts: MockRequest }>;
