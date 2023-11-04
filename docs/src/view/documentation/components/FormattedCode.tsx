import { Box } from "@suid/material";
import { For, createResource, useContext } from "solid-js";
import singleElementContext from "../context/single-element-contents";
import MultiLineCode from "./MultiLineCode";
import type * as codeGen from "../code-generation";

export default function FormattedCode<
  TKind extends keyof codeGen.CodeGeneratorGeneration,
>(props: ElementDefinitionProps<TKind>) {
  const context = useContext(singleElementContext);
  const [formattedCode] = createResource(
    () => props.reflection,
    async (reflection) => {
      const rawCode = context.codeGenerator.generation[props.kind](reflection);
      const formattedCode = await context.codeGenerator.formatting.formatCode(
        typeof rawCode === "string" ? rawCode : rawCode.code,
      );
      let tokenInfos =
        context.codeGenerator.formatting.getTokenInfos(formattedCode);
      if (typeof rawCode !== "string") {
        tokenInfos = rawCode.processTokenInfos(tokenInfos);
      }

      return props.tokenInfoProcessor?.(tokenInfos) ?? tokenInfos;
    },
  );
  return (
    <Box>
      <MultiLineCode>
        <For each={formattedCode()}>
          {(token) =>
            typeof token === "string" ? (
              token
            ) : token.type !== "Keyword" ? (
              token.value
            ) : (
              <b>{token.value}</b>
            )
          }
        </For>
      </MultiLineCode>
    </Box>
  );
}

export interface ElementDefinitionProps<
  TKind extends keyof codeGen.CodeGeneratorGenerationFunctionMap,
> {
  kind: TKind;
  reflection: codeGen.CodeGeneratorGenerationFunctionMap[TKind];
  tokenInfoProcessor?: codeGen.TokenInfoProcessor;
}
