/**
 * @file This file contains the validators which will be used to validate the HTTP-protocol related inputs and outputs when calling the endpoints.
 */

import * as data from "@ty-ras/data-zod"; // We don't import from main package in order for this code to be copypasteable into project shared by both BE and FE.
import * as t from "zod";

export const greetingTarget = t.string();
export const greeting = t.string();

/**
 * The target of the protocol which does the greeting.
 */
export type GreetingTarget = data.ProtocolTypeOf<typeof greetingTarget>;

/**
 * The greeting text.
 */
export type GreetingResult = data.ProtocolTypeOf<typeof greeting>;
