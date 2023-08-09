/**
 * @file This file exports all of the types, functions, and constants of the TyRAS extras -libraries aimed for:
 * - backend support
 * - using `io-ts` as data validation framework
 */

import * as configString from "@ty-ras-extras/config-io-ts/string";
import * as configMaybeFile from "@ty-ras-extras/config-io-ts/maybe-file";
export const configuration = { ...configString, ...configMaybeFile };

export * as cache from "@ty-ras-extras/cache";
export * as resources from "@ty-ras-extras/resource-pool-fp-ts";
export * as sql from "@ty-ras-extras/typed-sql-io-ts";
export * as main from "@ty-ras-extras/main-io-ts";
