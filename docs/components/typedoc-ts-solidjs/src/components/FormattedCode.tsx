import { Box, Typography } from "@suid/material";
import { ErrorBoundary, For, createResource, useContext } from "solid-js";
import singleElementContext from "../context/single-element-contents";
import MultiLineCode from "./MultiLineCode";
import type * as codeGen from "@typedoc-2-ts/transform";
import type * as formatter from "@typedoc-2-ts/format";
import Link from "./Link";

export default function FormattedCode<
  TKind extends keyof codeGen.CodeGenerator,
>(props: FormattedCodeProps<TKind>) {
  const context = useContext(singleElementContext);
  const [formattedCode] = createResource(
    () => props.reflection,
    async (reflection) => {
      const rawCode = context.codeGenerator()[props.kind](reflection);
      let tokenInfos = await context.codeFormatter()(
        "processTokenInfos" in rawCode ? rawCode.code : rawCode,
      );
      if ("processTokenInfos" in rawCode) {
        tokenInfos = rawCode.processTokenInfos(tokenInfos, (info) =>
          typeof info === "string"
            ? undefined
            : "typeRef" in info
            ? info.token
            : info,
        );
      }

      return props.tokenInfoProcessor?.(tokenInfos) ?? tokenInfos;
    },
  );
  return (
    <ErrorBoundary
      fallback={<Typography>Error while rendering TS code.</Typography>}
    >
      <Box>
        <MultiLineCode>
          <For each={formattedCode()}>
            {(token) =>
              typeof token === "string" ? (
                token
              ) : "token" in token ? (
                <Link
                  target={{ text: token.token.value, target: token.typeRef }}
                />
              ) : token.type !== "Keyword" ? (
                token.value
              ) : (
                <b>{token.value}</b>
              )
            }
          </For>
        </MultiLineCode>
      </Box>
    </ErrorBoundary>
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
