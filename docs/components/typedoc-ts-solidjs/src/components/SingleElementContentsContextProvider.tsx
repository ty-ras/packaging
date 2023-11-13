import { createMemo, type JSX } from "solid-js";
import * as codeGen from "@typedoc-2-ts/transform";
import * as formatter from "@typedoc-2-ts/format";
import SingleElementContentsContext, {
  type SingleElementContext,
} from "../context/single-element-contents";
import type * as navigation from "@typedoc-2-ts/browser";
import { Throw } from "throw-expression";

export default function SingleElementContentsContextProvider(
  props: SingleElementContentsContextProviderProps,
) {
  const context = createMemo<SingleElementContext>(() => ({
    linkFunctionality: () => props.linkFunctionality,
    codeGenerator: () =>
      codeGen.createCodeGenerator(
        (id) =>
          props.index[id] ?? Throw(`Failed to find model with index ${id}`),
      ),
    codeFormatter: () => (code) =>
      formatter.formatCode({
        code,
        prettierOptions: props.prettierOptions,
        onTokenInconsistency: ({
          token: { start: tokenStart, length: tokenLength },
          typeReference: { length: refLength },
        }) =>
          // eslint-disable-next-line no-console
          console.error(
            `Token started at ${tokenStart} and ended at ${
              tokenStart + tokenLength
            }, but type ref length was ${refLength}.`,
          ),
      }),
  }));
  return (
    <SingleElementContentsContext.Provider value={context()}>
      {props.children}
    </SingleElementContentsContext.Provider>
  );
}

export interface SingleElementContentsContextProviderProps {
  index: navigation.ModelIndex;
  prettierOptions: codeGen.PrettierOptions;
  children: JSX.Element;
  linkFunctionality: navigation.LinkHrefFunctionality;
}
