import { createMemo, type JSX } from "solid-js";
import * as contextDef from "../context-def/link-functionality";
import type * as navigation from "@typedoc-2-ts/browser";

export default function LinkFunctionalityContextProvider(
  props: LinkFunctionalityContextProviderProps,
) {
  const context = createMemo<contextDef.LinkFunctionalityContext>(() => ({
    linkFunctionality: () => props.linkFunctionality,
  }));
  return (
    <contextDef.default.Provider value={context()}>
      {props.children}
    </contextDef.default.Provider>
  );
}

export interface LinkFunctionalityContextProviderProps {
  children: JSX.Element;
  linkFunctionality: navigation.LinkHrefFunctionality;
}
