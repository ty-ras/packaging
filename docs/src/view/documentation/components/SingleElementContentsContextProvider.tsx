import { createMemo, type JSX } from "solid-js";
import type * as functionality from "../functionality";
import * as codeGen from "../code-generation";
import SingleElementContentsContext, {
  type SingleElementContext,
} from "../context/single-element-contents";
import type * as navigation from "../navigation";

export default function SingleElementContentsContextProvider(
  props: SingleElementContentsContextProviderProps,
) {
  const context = createMemo<SingleElementContext>(() => ({
    linkFunctionality: props.linkFunctionality,
    codeGenerator: codeGen.createCodeGenerator(
      props.index,
      props.prettierOptions,
    ),
  }));
  return (
    <SingleElementContentsContext.Provider value={context()}>
      {props.children}
    </SingleElementContentsContext.Provider>
  );
}

export interface SingleElementContentsContextProviderProps {
  index: functionality.ModelIndex;
  prettierOptions: codeGen.PrettierOptions;
  children: JSX.Element;
  linkFunctionality: navigation.LinkHrefFunctionality;
}
