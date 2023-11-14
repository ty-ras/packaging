import { createContext } from "solid-js";
import type * as navigation from "@typedoc-2-ts/browser";
import * as ctx from "./common";

export interface LinkContextContext {
  linkContext: () => navigation.LinkContext;
}

const requiresContext = ctx.requiresContext("LinkContext");

const ERRORING_CONTEXT: LinkContextContext = {
  linkContext: requiresContext,
};

export default createContext<LinkContextContext>(ERRORING_CONTEXT);
