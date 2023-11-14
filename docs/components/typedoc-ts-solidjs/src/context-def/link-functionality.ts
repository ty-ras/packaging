import { createContext } from "solid-js";
import type * as navigation from "@typedoc-2-ts/browser";
import * as ctx from "./common";

export interface LinkFunctionalityContext {
  linkFunctionality: () => navigation.LinkHrefFunctionality;
}

const requiresContext = ctx.requiresContext("LinkFunctionality");

const ERRORING_CONTEXT: LinkFunctionalityContext = {
  linkFunctionality: requiresContext,
};

export default createContext<LinkFunctionalityContext>(ERRORING_CONTEXT);
