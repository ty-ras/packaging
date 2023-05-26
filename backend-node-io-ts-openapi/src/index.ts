/**
 * @file This file exports all of the types, functions, and constants of the TyRAS libraries aimed for:
 * - backend support
 * - with bare Node HTTP server
 * - using `io-ts` as data validation framework
 * - using OpenAPI as supported metadata format
 */

export type * from "@ty-ras/protocol";
export * from "@ty-ras/endpoint";
export * from "@ty-ras/endpoint-prefix";
export * from "@ty-ras/endpoint-spec";
export * from "@ty-ras/server";
export * from "@ty-ras/server-node";
export * from "@ty-ras/data";
export * from "@ty-ras/data-io-ts";
export * from "@ty-ras/data-backend";
export * from "@ty-ras/data-backend-io-ts";
export type * from "@ty-ras/metadata";
export * from "@ty-ras/metadata-openapi";
export * from "@ty-ras/metadata-jsonschema";
export * from "@ty-ras/metadata-jsonschema-io-ts";

// Export "glue" code, needed because e.g. OpenAPI MD library is not aware of IO-TS data validation library, and IO-TS data validation library is not aware of OpenAPI MD library.
export * from "./md";
