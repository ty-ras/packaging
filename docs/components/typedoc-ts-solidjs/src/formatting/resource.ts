import type * as transform from "@typedoc-2-ts/transform";
import type * as formatter from "@typedoc-2-ts/format";
import type * as context from "../context-def/code-functionality";

export const formatCodeAsync = async <
  TKind extends keyof transform.CodeGeneratorGenerationFunctionMap,
>(
  codeContext: context.CodeFunctionalityContext,
  kind: TKind,
  reflection: transform.CodeGeneratorGenerationFunctionMap[TKind],
  tokenInfoProcessor:
    | ((tokens: ReadonlyArray<formatter.TokenInfo>) => formatter.TokenInfos)
    | undefined,
): Promise<formatter.CodeFormattingResult> => {
  const rawCode = codeContext.codeGenerator()[kind](reflection);
  const formatterResult = await codeContext.codeFormatter()(
    "processTokenInfos" in rawCode ? rawCode.code : rawCode,
  );
  let tokenInfos = formatterResult.tokens;
  if ("processTokenInfos" in rawCode) {
    tokenInfos = rawCode.processTokenInfos(tokenInfos, (info) =>
      "text" in info ? undefined : info.token,
    );
  }

  return {
    tokens: tokenInfoProcessor?.(tokenInfos) ?? tokenInfos,
    declarationRanges: formatterResult.declarationRanges,
  };
};
