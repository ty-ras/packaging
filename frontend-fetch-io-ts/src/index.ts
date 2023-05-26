/**
 * @file This file exports all of the types, functions, and constants of the TyRAS libraries aimed for:
 * - frontend support
 * - with `fetch` as HTTP client
 * - using `io-ts` as data validation framework
 */

export type * from "@ty-ras/protocol";
export * from "@ty-ras/client-fetch";
export * from "@ty-ras/data";
export * from "@ty-ras/data-io-ts";
export * from "@ty-ras/data-frontend";
export * from "@ty-ras/data-frontend-io-ts";

// Export "glue" code, needed because e.g. IO-TS FE library is not aware of the client being used.
export * from "./api-call";
