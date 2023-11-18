import type * as transform from "@typedoc-2-ts/transform";
import type * as formatter from "@typedoc-2-ts/format";
import type * as context from "../context-def/code-functionality";

export const formatCodeWithRanges = async <
  TKind extends keyof transform.CodeGeneratorGenerationFunctionMap,
>(
  codeContext: context.CodeFunctionalityContext,
  kind: TKind,
  reflection: transform.CodeGeneratorGenerationFunctionMap[TKind],
) => await formatCodeImpl(codeContext, kind, reflection, undefined, true);

export const formatCode = async <
  TKind extends keyof transform.CodeGeneratorGenerationFunctionMap,
>(
  codeContext: context.CodeFunctionalityContext,
  kind: TKind,
  reflection: transform.CodeGeneratorGenerationFunctionMap[TKind],
  tokenInfoProcessor:
    | ((tokens: ReadonlyArray<formatter.TokenInfo>) => formatter.TokenInfos)
    | undefined,
) =>
  (
    await formatCodeImpl(
      codeContext,
      kind,
      reflection,
      tokenInfoProcessor,
      false,
    )
  ).tokens;

const formatCodeImpl = async <
  TKind extends keyof transform.CodeGeneratorGenerationFunctionMap,
>(
  codeContext: context.CodeFunctionalityContext,
  kind: TKind,
  reflection: transform.CodeGeneratorGenerationFunctionMap[TKind],
  tokenInfoProcessor:
    | ((tokens: ReadonlyArray<formatter.TokenInfo>) => formatter.TokenInfos)
    | undefined,
  throwIfNeedsPostProcessing: boolean,
): Promise<formatter.CodeFormattingResult> => {
  const { generator, typeRefShouldBeIncluded } = codeContext.codeGenerator();
  const rawCode = generator[kind](reflection);
  const needPostProcessing = "processTokenInfos" in rawCode;
  if (
    throwIfNeedsPostProcessing &&
    (needPostProcessing || !!tokenInfoProcessor)
  ) {
    throw new Error(
      `The functionality "${kind}" needs postprocessing, and that will mess up with ranges. Please use "formatCode" function instead.`,
    );
  }
  const actualCode = needPostProcessing ? rawCode.code : rawCode;
  actualCode.typeReferences = actualCode.typeReferences.filter(
    typeRefShouldBeIncluded,
  );

  const formatterResult = await codeContext.codeFormatter()(actualCode);
  let tokenInfos = formatterResult.tokens;
  if (needPostProcessing) {
    tokenInfos = rawCode.processTokenInfos(tokenInfos, (info) =>
      "text" in info ? undefined : info.token,
    );
  }

  return {
    tokens: tokenInfoProcessor?.(tokenInfos) ?? tokenInfos,
    declarationRanges: formatterResult.declarationRanges,
  };
};
