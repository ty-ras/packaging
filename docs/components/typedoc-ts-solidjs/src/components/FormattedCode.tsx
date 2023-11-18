import { Box } from "@suid/material";
import { Show, createResource, useContext } from "solid-js";
import codeContextDef from "../context-def/code-functionality";
import type * as codeGen from "@typedoc-2-ts/transform";
import type * as formatter from "@typedoc-2-ts/format";
import TokenizedCode from "./TokenizedCode";
import * as formatting from "../formatting";

export default function FormattedCode<
  TKind extends keyof codeGen.CodeGenerator,
>(props: FormattedCodeProps<TKind>) {
  const codeContext = useContext(codeContextDef);
  const [formattedCode] = createResource(
    () => props.reflection,
    async (reflection) =>
      await formatting.formatCodeAsync(
        codeContext,
        props.kind,
        reflection,
        props.tokenInfoProcessor,
      ),
  );
  return (
    <Box>
      <Show when={formattedCode()}>
        {(tokens) => <TokenizedCode tokens={tokens().tokens} />}
      </Show>
    </Box>
  );
}

export interface FormattedCodeProps<
  TKind extends keyof codeGen.CodeGeneratorGenerationFunctionMap,
> {
  kind: TKind;
  reflection: codeGen.CodeGeneratorGenerationFunctionMap[TKind];
  tokenInfoProcessor?: (
    tokens: ReadonlyArray<formatter.TokenInfo>,
  ) => formatter.TokenInfos;
}
