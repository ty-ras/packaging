import type * as typedoc from "typedoc/dist/lib/serialization/schema";
import prettier from "prettier/standalone";
import estree from "prettier/plugins/estree";
import typescript from "prettier/plugins/typescript";
import { type TSESTree } from "@typescript-eslint/types/dist/index";

import * as functionality from "../functionality";
import type * as types from "./types";
import * as declaration from "./declaration";
import * as someType from "./some-type";
import * as sig from "./signature";
import * as imports from "./imports";
import * as get from "./get-with-check";

export const createCodeGenerator = (
  index: functionality.ModelIndex,
  prettierOptions: types.PrettierOptions,
): CodeGenerator => {
  const getDeclarationTextImpl = (
    reflection: types.CodeGeneratorGenerationFunctionMap["getDeclarationText"],
  ): string => {
    const { importContext, declarationToText } = createCallbacks(index);
    return textWithImports(importContext, declarationToText(reflection));
  };

  const getDeclarationText: CodeGeneratorGeneration["getDeclarationText"] = (
    reflection,
  ) => {
    return isReference(reflection)
      ? getDeclarationText(
          get.getIndexedModel(reflection.target, reflection, index),
        )
      : getDeclarationTextImpl(reflection);
  };

  return {
    generation: {
      getTypeText: (type) => {
        const { importContext, typeToText } = createCallbacks(index);
        return {
          code: textWithImports(
            importContext,
            // We must prefix with `type ___X___ = <actual type> in order to make it valid TypeScript program
            `${TYPE} ${TYPE_NAME} ${EQUALS} ${typeToText(type)}`,
          ),
          processTokenInfos: (tokenInfos) =>
            remainingTokensAfter(
              tokenInfos,
              TYPE_STRING_TOKEN_PROCESSOR_MATCHERS,
            ),
        };
      },
      getSignatureText: (sig) => {
        const { importContext, sigToText } = createCallbacks(index);
        const sigText = sigToText(sig, ":");
        return textWithImports(
          importContext,
          `export declare function ${sig.name}${sigText}`,
        );
      },
      getDeclarationText,
    },
    formatting: {
      formatCode: async (code) =>
        await prettier.format(code, {
          ...prettierOptions,
          parser: "typescript",
          plugins: [estree, typescript],
        }),
      getTokenInfos: (code) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const { tokens }: TSESTree.Program =
          typescript.parsers.typescript.parse(
            code,
            // Options are not used for anything useful for us
            // See https://github.com/prettier/prettier/blob/main/src/language-js/parse/typescript.js
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
            undefined as any,
          );
        return Array.from(
          constructTokenInfoArray(
            code,
            tokens ??
              functionality.doThrow("Parsed TS program without tokens?"),
          ),
        );
      },
    },
  };
};

export interface CodeGenerator {
  generation: CodeGeneratorGeneration;
  formatting: CodeGeneratorFormatting;
}

export type CodeGeneratorGeneration = {
  [P in keyof types.CodeGeneratorGenerationFunctionMap]: (
    reflection: types.CodeGeneratorGenerationFunctionMap[P],
  ) => CodeGenerationResult;
};

export type CodeGenerationResult =
  | Code
  | {
      code: Code;
      processTokenInfos: TokenInfoProcessor;
    };

export type Code = string;

export type TokenInfoProcessor = (result: TokenInfos) => TokenInfos;

export type TokenInfos = Array<TokenInfo>;
export type TokenInfo = TSESTree.Token | Code;

export interface CodeGeneratorFormatting {
  formatCode: (code: Code) => Promise<Code>;
  getTokenInfos: (code: Code) => TokenInfos;
}

const isReference = (
  reflection: types.CodeGeneratorGenerationFunctionMap["getDeclarationText"],
): reflection is functionality.MakeChildrenIntegers<typedoc.ReferenceReflection> =>
  reflection.variant === "reference";

const createCallbacks = (index: functionality.ModelIndex) => {
  const importContext: imports.ImportContext = {
    imports: {},
    globals: new Set(["typescript"]),
  };
  const registerImport = imports.createRegisterImport(importContext);
  const typeToText = someType.createGetSomeTypeText(
    ({ target, ...type }) =>
      typeof target === "number"
        ? `${
            type.qualifiedName ??
            type.name ??
            functionality.doThrow(
              `Internal reference ${target} had no qualified name`,
            )
          }`
        : registerImport(type, target),
    (sig) => sigToText(sig, "=>"),
    (dec) => declarationToText(dec),
  );
  const sigToText = sig.createGetSignatureText((type) => typeToText(type));
  const declarationToText = declaration.createGetDeclarationText(
    index,
    typeToText,
    sigToText,
  );
  return { importContext, typeToText, sigToText, declarationToText };
};

const textWithImports = (
  importContext: imports.ImportContext,
  text: string,
) => {
  return `${Object.entries(importContext.imports)
    .map(
      ([, importInfo]) =>
        `import ${
          importInfo.import === "named"
            ? `* as ${importInfo.alias}`
            : `{ ${importInfo.importedElements.join(", ")} }`
        } from "${importInfo.packageName}";`,
    )
    .join("\n")}

${text}`;
};

function* constructTokenInfoArray(
  source: string,
  tokens: ReadonlyArray<TSESTree.Token>,
) {
  let prevIndex = 0;
  for (const token of tokens) {
    const {
      range: [start, end],
    } = token;
    if (start > prevIndex) {
      yield source.substring(prevIndex, start);
    }
    yield token;
    prevIndex = end; // The end of the token range is exclusive
  }
  if (prevIndex < source.length) {
    yield source.substring(prevIndex);
  }
}

const TYPE = "type";
const TYPE_NAME = "___X___";
const EQUALS = "=";

const remainingTokensAfter = (
  tokenInfos: TokenInfos,
  matchers: TokenProcessorMatchers,
) => {
  let tokenIndex = 0;
  let matcherIndex = 0;

  for (
    ;
    tokenIndex < tokenInfos.length && matcherIndex < matchers.length;
    ++tokenIndex
  ) {
    const tokenInfo = tokenInfos[tokenIndex];
    if (typeof tokenInfo !== "string") {
      if (matchers[matcherIndex](tokenInfo)) {
        ++matcherIndex;
      } else {
        matcherIndex = 0;
      }
    }
  }
  while (tokenIndex < tokenInfos.length && typeof tokenInfos === "string") {
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
