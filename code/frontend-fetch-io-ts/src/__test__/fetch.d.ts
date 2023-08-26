/**
 * @file This file contains module augmentation in order to use global 'fetch' variable.
 * This is temporary until it is added to Node types: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/60924 .
 */

import type * as undici from "undici";

declare global {
  const fetch: typeof undici.fetch;
  const Request: typeof undici.Request;
  const Response: typeof undici.Response;
  const Headers: typeof undici.Headers;
  type Request = undici.Request;
  type Response = undici.Response;
  type RequestInit = undici.RequestInit;
  type Headers = undici.Headers;
}

// Otherwise we will get error: Augmentations for the global scope can only be directly nested in external modules or ambient module declarations.ts(2669)
export {};
