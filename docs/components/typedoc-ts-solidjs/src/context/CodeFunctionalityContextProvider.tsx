import { Throw } from "throw-expression";
import { createMemo, type JSX } from "solid-js";
import * as codeGen from "@typedoc-2-ts/transform";
import * as formatter from "@typedoc-2-ts/format";
import * as contextDef from "../context-def/code-functionality";
import type * as navigation from "@typedoc-2-ts/browser";

export default function CodeFunctionalityContextProvider(
  props: CodeFunctionalityContextProviderProps,
) {
  const context = createMemo<contextDef.CodeFunctionalityContext>(() => ({
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
    <contextDef.default.Provider value={context()}>
      {props.children}
    </contextDef.default.Provider>
  );
}

export interface CodeFunctionalityContextProviderProps {
  index: navigation.ModelIndex;
  prettierOptions: codeGen.PrettierOptions;
  children: JSX.Element;
}
