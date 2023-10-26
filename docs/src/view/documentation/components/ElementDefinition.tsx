import { Box } from "@suid/material";
import type * as types from "./types";
import { createResource } from "solid-js";

/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */

export default function ElementDefinition(props: ElementDefinitionProps) {
  const [formattedCode] = createResource(
    async () =>
      await props.codeGenerator.formatCode(
        props.codeGenerator.getDeclarationText(props.element),
      ),
  );
  return (
    <Box>
      <pre>{formattedCode() ?? "Loading..."}</pre>
    </Box>
  );
}

export interface ElementDefinitionProps
  extends types.ReflectionElementProps,
    types.CodeGenerationProps {
  // No custom properties
}
