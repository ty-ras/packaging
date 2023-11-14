import { type JSX } from "solid-js";
import * as contextDef from "../context-def/link-context";
import type * as navigation from "@typedoc-2-ts/browser";

export default function LinkFunctionalityContextProvider(
  props: LinkContextContextProviderProps,
) {
  const context: contextDef.LinkContextContext = {
    linkContext: () => props.linkContext,
  };
  return (
    <contextDef.default.Provider value={context}>
      {props.children}
    </contextDef.default.Provider>
  );
}

export interface LinkContextContextProviderProps {
  children: JSX.Element;
  linkContext: navigation.LinkContext;
}
