/**
 * @file This file contains the validators which will be used to validate the HTTP-protocol related inputs and outputs when calling the endpoints.
 */

import * as data from "@ty-ras/data-runtypes"; // We don't import from main package in order for this code to be copypasteable into project shared by both BE and FE.
import * as t from "runtypes";

export const greetingTarget = t.String;
export const greeting = t.String;

/**
 * The target of the protocol which does the greeting.
 */
export type GreetingTarget = data.ProtocolTypeOf<typeof greetingTarget>;

/**
 * The greeting text.
 */
export type GreetingResult = data.ProtocolTypeOf<typeof greeting>;
