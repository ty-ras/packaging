/**
 * @file This file contains tests to use TyRAS-powered HTTP endpoint callbacks, and validate that the callbacks work as expected.
 */

import test from "ava";
import * as http from "node:http";
import type * as net from "node:net";
import config from "./config";
import backend from "./backend";

test("Verify that using client works", async (c) => {
  c.plan(4);
  const capturedInfo = await createTrackingServerAndListen(
    "localhost",
    parseInt(config.backend.substring(config.backend.lastIndexOf(":") + 1)),
    [JSON.stringify("Hello, world!")],
  );

  c.deepEqual(
    await backend.greeting.getGreeting({ url: { target: "world" } }),
    {
      error: "none",
      data: "Hello, world!",
    },
  );
  c.deepEqual(capturedInfo, [
    {
      method: "GET",
      url: "/api/greet/world",
      body: undefined,
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
    c.deepEqual(capturedInfo.length, 1);
  }
});

const listenAsync = (server: net.Server, host: string, port: number) =>
  new Promise<void>((resolve, reject) => {
    try {
      server.addListener("error", reject);
      server.listen({ host, port }, () => {
        server.removeListener("error", reject);
        resolve();
      });
    } catch (e) {
      reject(e);
    }
  });

const createTrackingServerAndListen = async (
  host: string,
  port: number,
  responses: PreparedServerRespones,
  // eslint-disable-next-line sonarjs/cognitive-complexity
) => {
  const capturedInfo: Array<{
    method: string | undefined;
    url: string | undefined;
    // headers: Record<string, unknown>;
    body: string | undefined;
  }> = [];
  let idx = 0;
  const handleResponse = (
    req: http.IncomingMessage,
    res: http.ServerResponse,
  ) => {
    let body: string | undefined;
    req.on("data", (chunk: string | Uint8Array) => {
      if (chunk instanceof Uint8Array) {
        chunk = Buffer.from(chunk).toString("utf8");
      }
      if (body === undefined) {
        body = chunk;
      } else {
        body += chunk;
      }
    });
    req.on("end", () => {
      capturedInfo.push({
        method: req.method,
        url: req.url,
        // headers: req.headers,
        body,
      });
      const responseInfo = responses[idx++];
      res.sendDate = false; // Makes life easier
      let callEnd = true;
      if (responseInfo === undefined) {
        res.statusCode = 204;
      } else if (typeof responseInfo === "string") {
        res.statusCode = 200;
        res.write(responseInfo);
      } else if (typeof responseInfo === "number") {
        res.statusCode = responseInfo;
      } else {
        responseInfo(req, res);
        callEnd = false;
      }

      if (callEnd) {
        res.end();
      }
    });
  };
  const server = http.createServer(handleResponse);
  await listenAsync(server, host, port);
  return capturedInfo;
};

type PreparedServerRespones = ReadonlyArray<
  | string
  | undefined
  | number
  | ((req: http.IncomingMessage, res: http.ServerResponse) => void)
>;
