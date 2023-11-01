import { Box } from "@suid/material";
import { For, createResource } from "solid-js";
import MultiLineCode from "./MultiLineCode";
import type * as types from "./types";
import type * as codeGen from "../code-generation";

export default function FormattedCode<
  TKind extends keyof codeGen.CodeGeneratorGeneration,
>(props: ElementDefinitionProps<TKind>) {
  const [formattedCode] = createResource(
    () => props.reflection,
    async (reflection) => {
      const rawCode = props.codeGenerator.generation[props.kind](reflection);
      const formattedCode = await props.codeGenerator.formatting.formatCode(
        typeof rawCode === "string" ? rawCode : rawCode.code,
      );
      let tokenInfos =
        props.codeGenerator.formatting.getTokenInfos(formattedCode);
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
> extends types.CodeGenerationProps {
  kind: TKind;
  reflection: codeGen.CodeGeneratorGenerationFunctionMap[TKind];
  tokenInfoProcessor?: codeGen.TokenInfoProcessor;
}
