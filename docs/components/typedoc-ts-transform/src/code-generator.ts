import type * as typedoc from "typedoc";
import { type TSESTree } from "@typescript-eslint/types";
import type * as common from "@typedoc-2-ts/types";

import type * as types from "./types";
import * as declaration from "./declaration";
import * as someType from "./some-type";
import * as sig from "./signature";
import * as imports from "./imports";
import * as text from "./text";

export const createCodeGenerator = (
  index: types.ModelIndex,
  importContext: imports.ImportContext = imports.createDefaultImportContext(),
): CodeGenerator => {
  const getDeclarationTextImpl = (
    reflection: types.CodeGeneratorGenerationFunctionMap["getDeclarationText"],
  ): common.Code => {
    const { textGenerator, importState, declarationToText } = createCallbacks(
      index,
      importContext,
    );
    return textWithImports(
      textGenerator,
      importState,
      declarationToText(reflection, false),
    );
  };

  const getDeclarationText: CodeGenerator["getDeclarationText"] = (
    reflection,
  ) => {
    return isReference(reflection)
      ? getDeclarationText(index(reflection.target))
      : getDeclarationTextImpl(reflection);
  };

  return {
    getTypeText: (type) => {
      const { textGenerator, importState, typeToText } = createCallbacks(
        index,
        importContext,
      );
      return {
        code: textWithImports(
          textGenerator,
          importState,
          // We must prefix with `type ___X___ = <actual type> in order to make it valid TypeScript program
          textGenerator.code`${text.text(FULL_PREFIX)}${typeToText(type)}`,
        ),
        processTokenInfos: processTokenInfosForType,
      };
    },
    getSignatureText: (sig) => {
      const { textGenerator, importState, sigToText } = createCallbacks(
        index,
        importContext,
      );
      const sigText = sigToText(sig, ":");
      return textWithImports(
        textGenerator,
        importState,
        textGenerator.code`export declare function ${text.text(
          sig.name,
        )}${sigText}`,
      );
    },
    getDeclarationText,
  };
};

export type CodeGenerator = {
  [P in keyof types.CodeGeneratorGenerationFunctionMap]: (
    this: void,
    reflection: types.CodeGeneratorGenerationFunctionMap[P],
  ) => CodeGenerationResult;
};

export type CodeGenerationResult =
  | common.Code
  | {
      code: common.Code;
      processTokenInfos: TokenInfoProcessor;
    };

export type TokenInfoProcessor = <TItem>(
  result: ReadonlyArray<TItem>,
  tryGetToken: TryGetSpecificToken<TItem>,
) => Array<TItem>;

export type TryGetToken = <TItem>(item: TItem) => TSESTree.Token | undefined;

export type MaybeToken = TSESTree.Token | undefined;

export type TryGetSpecificToken<TTokenInfo> = (item: TTokenInfo) => MaybeToken;

const isReference = (
  reflection: types.CodeGeneratorGenerationFunctionMap["getDeclarationText"],
): reflection is types.WithoutChildren<typedoc.JSONOutput.ReferenceReflection> =>
  reflection.variant === "reference";

const createCallbacks = (
  index: types.ModelIndex,
  importContextArg: imports.ImportContext,
) => {
  const textGenerator = text.createCodeGenerationContext();
  const importState: imports.ImportState = {};
  const importContext =
    importContextArg ?? imports.createDefaultImportContext();
  const registerImport = imports.createRegisterImport(
    textGenerator,
    importContext,
    importState,
    true,
  );
  const typeToText = someType.createGetSomeTypeText(
    textGenerator,
    registerImport,
    (sig) => sigToText(sig, "=>"),
    (dec) => declarationToText(dec, true),
  );
  const sigToText = sig.createGetSignatureText(textGenerator, (type) =>
    typeToText(type),
  );
  const declarationToText = declaration.createGetDeclarationText(
    text.createCodeGenerationContext,
    index,
    typeToText,
    sigToText,
  );
  return {
    textGenerator,
    importState,
    typeToText,
    sigToText,
    declarationToText,
  };
};

const textWithImports = (
  { code }: text.CodeGenerationContext,
  importState: imports.ImportState,
  intermediate: text.IntermediateCode,
): common.Code => {
  const fullCode = code`${text.join(
    Object.entries(importState).map(
      ([, importInfo]) =>
        code`import type ${
          importInfo.import === "named"
            ? text.text(`* as ${importInfo.alias}`)
            : code`{ ${text.join(
                importInfo.importedElements.map(
                  (importedType) =>
                    code`${text.ref(importedType.name, importedType.ref)}`,
                ),
                ", ",
              )} }`
        } from "${text.text(importInfo.packageName)}";`,
    ),
    "\n",
  )}

${intermediate}`;

  return text.intermediateToComplete(fullCode);
};

const TYPE = "type";
const TYPE_NAME = "___X___";
const EQUALS = "=";
const FULL_PREFIX = `${TYPE} ${TYPE_NAME} ${EQUALS} `;

const processTokenInfosForType: TokenInfoProcessor = (
  tokenInfos,
  tryGetToken,
) =>
  remainingTokensAfter(
    tokenInfos,
    tryGetToken,
    TYPE_STRING_TOKEN_PROCESSOR_MATCHERS,
  );

const remainingTokensAfter = <TItem>(
  tokenInfos: ReadonlyArray<TItem>,
  tryGetToken: (item: TItem) => TSESTree.Token | undefined,
  matchers: TokenProcessorMatchers,
) => {
  let tokenIndex = 0;
  let matcherIndex = 0;

  for (
    ;
    tokenIndex < tokenInfos.length && matcherIndex < matchers.length;
    ++tokenIndex
  ) {
    const token = tryGetToken(tokenInfos[tokenIndex]);
    if (token) {
      if (matchers[matcherIndex](token)) {
        ++matcherIndex;
      } else {
        matcherIndex = 0;
      }
    }
  }
  while (
    tokenIndex < tokenInfos.length &&
    tryGetToken(tokenInfos[tokenIndex]) === undefined
  ) {
    ++tokenIndex;
  }
  return tokenInfos.slice(tokenIndex);
};

type TokenProcessorMatchers = ReadonlyArray<(token: TSESTree.Token) => boolean>;

const TYPE_STRING_TOKEN_PROCESSOR_MATCHERS: TokenProcessorMatchers = [
  (token1) => token1.type === "Identifier" && token1.value === TYPE,
  (token2) => token2.type === "Identifier" && token2.value === TYPE_NAME,
  (token3) => token3.type === "Punctuator" && token3.value === EQUALS,
];
