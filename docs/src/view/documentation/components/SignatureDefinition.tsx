import { Box } from "@suid/material";
import { For, createResource } from "solid-js";
import type * as typedoc from "typedoc/dist/lib/serialization/schema";
import MultiLineCode from "./MultiLineCode";
import type * as types from "./types";

/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */

export default function SignatureDefinition(props: SignatureDefinitionProps) {
  const [formattedCode] = createResource(async () => {
    const code = await props.codeGenerator.formatCode(
      props.codeGenerator.getSignatureText(props.signature),
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

export interface SignatureDefinitionProps extends types.CodeGenerationProps {
  signature: typedoc.SignatureReflection;
}
