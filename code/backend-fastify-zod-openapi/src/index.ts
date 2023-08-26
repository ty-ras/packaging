/**
 * @file This file exports all of the types, functions, and constants of the TyRAS libraries aimed for:
 * - backend support
 * - with Fastify HTTP server
 * - using `zod` as data validation framework
 * - using OpenAPI as supported metadata format
 */

export * from "@ty-ras/protocol";
export * from "@ty-ras/endpoint";
export * from "@ty-ras/endpoint-spec";
export * from "@ty-ras/state";
export * from "@ty-ras/state-zod";
export * from "@ty-ras/server";
export * from "@ty-ras/server-fastify";
export * from "@ty-ras/data";
export * from "@ty-ras/data-zod";
export * from "@ty-ras/data-backend";
export * from "@ty-ras/data-backend-zod";
export type * from "@ty-ras/metadata";
export * from "@ty-ras/metadata-openapi";
export * from "@ty-ras/metadata-jsonschema";
export * from "@ty-ras/metadata-jsonschema-zod";

// Export "glue" metadata code, needed because e.g. OpenAPI MD library is not aware of Zod data validation library, and Zod data validation library is not aware of OpenAPI MD library.
export * from "./md-provider";
// Export "glue" endpoint-spec code, needed because generic `endpoint-spec` library is not aware of Zod data validation libarry, nor `server-node` server library.
export * from "./endpoint-spec";
// Export helper function to create OpenAPI endpoint
export * from "./md-endpoint";
