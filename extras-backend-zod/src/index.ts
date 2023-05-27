/**
 * @file This file exports all of the types, functions, and constants of the TyRAS extras -libraries aimed for:
 * - backend support
 * - using `zod` as data validation framework
 */

import * as configString from "@ty-ras-extras/config-zod/string";
import * as configMaybeFile from "@ty-ras-extras/config-zod/maybe-file";
export const configuration = { ...configString, ...configMaybeFile };

export * as cache from "@ty-ras-extras/cache";
export * as resources from "@ty-ras-extras/resource-pool";
export * as sql from "@ty-ras-extras/typed-sql-zod";
export * as main from "@ty-ras-extras/main";
export * as state from "@ty-ras-extras/state-zod";
