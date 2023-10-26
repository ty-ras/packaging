import { Box } from "@suid/material";
import { For, createResource } from "solid-js";
import MultiLineCode from "./MultiLineCode";
import type * as types from "./types";

/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */

export default function ElementDefinition(props: ElementDefinitionProps) {
  const [formattedCode] = createResource(async () => {
    const code = await props.codeGenerator.formatCode(
      props.codeGenerator.getDeclarationText(props.element),
    );
    return props.codeGenerator.getTokenInfos(code);
  });
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

export interface ElementDefinitionProps
  extends types.ReflectionElementProps,
    types.CodeGenerationProps {
  // No custom properties
}
