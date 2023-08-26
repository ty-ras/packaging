/**
 * @file This file contains tests to start TyRAS-powered HTTP server, and validate that endpoints work as expected.
 */

import test from "ava";
import getPort from "@ava/get-port";
import * as tyras from "..";
import endpoints from "./api";
import { request } from "undici";

test("Verify that using server works", async (c) => {
  c.plan(3);
  // Start the server
  const host = "localhost";
  const port = await getPort();
  await tyras.listenAsync(
    tyras.createServer({
      endpoints,
      createState: async ({ stateInfo: statePropertyNames }) => {
        const state: Partial<
          Record<(typeof statePropertyNames)[number], unknown>
        > = {};
        for (const propertyName of statePropertyNames) {
          if (propertyName in tyras.DEFAULT_AUTHENTICATED_STATE) {
            state[propertyName] = await tryGetUserId();
          }
        }

        return state;
      },
      // To make debugging a bit easier in case of tests failing
      events: (eventName, eventArg) => {
        if (eventName === "onException") {
          // eslint-disable-next-line no-console
          console.error("Error:", eventArg);
        }
      },
    }),
    host,
    port,
  );

  const urlBase = `http://${host}:${port}`;

  // Verify that greeting endpoint works
  c.deepEqual(
    await (await request(`${urlBase}/api/greet/world`)).body.json(),
    "Hello, world!",
  );

  // Verify that OpenAPI endpoint works
  c.deepEqual(await (await request(`${urlBase}/openapi`)).body.json(), {
    openapi: "3.0.3",
    info: {
      title: "The example API",
      version: "1.0.0",
    },
    servers: [
      {
        url: urlBase,
      },
    ],
    paths: {
      "/api/greet/{target}": {
        description: "Endpoint(s) related to greeting.",
        parameters: [
          {
            description: "The target to greet.",
            in: "path",
            name: "target",
            required: true,
            schema: {
              $schema: "http://json-schema.org/draft-07/schema#",
              pattern: "[^/]+",
              type: "string",
            },
          },
        ],
        get: {
          description: "Get the greeting for given target.",
          responses: {
            200: {
              content: {
                "application/json": {
                  example: "Hello, world!",
                  schema: {
                    $schema: "http://json-schema.org/draft-07/schema#",
                    type: "string",
                  },
                },
              },
              description: "The returned greeting.",
            },
            400: {
              description: "If URL path parameters fail validation.",
            },
          },
        },
      },
    },
  });

  // Verify that server gives 404 for URL which is not recognized
  c.deepEqual((await request(`${urlBase}/non-existing`)).statusCode, 404);
});

const tryGetUserId = (): Promise<string | undefined> => {
  // Don't throw an error, as it will be propagated directly server events as 'onException' event.
  // We don't use authentication in tests anyway, so instead simply return undefined always.
  // In real life, there would be attempt made to e.g. check if there is `Authorization` header, verify it is in correct format, and try extract user ID from there.
  return Promise.resolve(undefined);
};
