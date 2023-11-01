import { Box } from "@suid/material";
import { For, createResource } from "solid-js";
import MultiLineCode from "./MultiLineCode";
import type * as types from "./types";
import type * as codeGen from "../code-generation";

/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */

export default function FormattedCode<
  TKind extends keyof codeGen.CodeGeneratorGeneration,
>(props: ElementDefinitionProps<TKind>) {
  const [formattedCode] = createResource(
    () => props.reflection,
    async (reflection) => {
      const code = await props.codeGenerator.formatting.formatCode(
        props.codeGenerator.generation[props.kind](reflection),
      );
      return props.codeGenerator.formatting.getTokenInfos(code);
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
}
