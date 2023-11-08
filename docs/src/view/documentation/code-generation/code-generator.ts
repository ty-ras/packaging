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
import * as text from "./text";

export const createCodeGenerator = (
  index: functionality.ModelIndex,
  prettierOptions: types.PrettierOptions,
): CodeGenerator => {
  const getDeclarationTextImpl = (
    reflection: types.CodeGeneratorGenerationFunctionMap["getDeclarationText"],
  ): types.Code => {
    const { textGenerator, importContext, declarationToText } =
      createCallbacks(index);
    return textWithImports(
      textGenerator,
      importContext,
      declarationToText(reflection),
    );
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
        const { textGenerator, importContext, typeToText } =
          createCallbacks(index);
        return {
          code: textWithImports(
            textGenerator,
            importContext,
            // We must prefix with `type ___X___ = <actual type> in order to make it valid TypeScript program
            textGenerator.code`${text.text(TYPE)} ${text.text(
              TYPE_NAME,
            )} ${text.text(EQUALS)} ${typeToText(type)}`,
          ),
          processTokenInfos: (tokenInfos) =>
            remainingTokensAfter(
              tokenInfos,
              TYPE_STRING_TOKEN_PROCESSOR_MATCHERS,
            ),
        };
      },
      getSignatureText: (sig) => {
        const { textGenerator, importContext, sigToText } =
          createCallbacks(index);
        const sigText = sigToText(sig, ":");
        return textWithImports(
          textGenerator,
          importContext,
          textGenerator.code`export declare function ${text.text(
            sig.name,
          )}${sigText}`,
        );
      },
      getDeclarationText,
    },
    formatting: {
      formatCode: async (code) => {
        const formattedCode = await prettier.format(code.code, {
          ...prettierOptions,
          parser: "typescript",
          plugins: [estree, typescript],
        });
        return fixTypeReferences(code, formattedCode);
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
    this: void,
    reflection: types.CodeGeneratorGenerationFunctionMap[P],
  ) => CodeGenerationResult;
};

export type CodeGenerationResult =
  | types.Code
  | {
      code: types.Code;
      processTokenInfos: TokenInfoProcessor;
    };

export type TokenInfoProcessor = (result: TokenInfos) => TokenInfos;

export type TokenInfos = Array<TokenInfo>;
export type TokenInfo =
  | TSESTree.Token
  | string
  | { token: TSESTree.IdentifierToken; typeRef: text.CodeGenerationTypeRef };

export interface CodeGeneratorFormatting {
  formatCode: (this: void, code: types.Code) => Promise<TokenInfos>;
  // getTokenInfos: (this: void, code: types.Code) => TokenInfos;
}

const isReference = (
  reflection: types.CodeGeneratorGenerationFunctionMap["getDeclarationText"],
): reflection is functionality.MakeChildrenIntegers<typedoc.ReferenceReflection> =>
  reflection.variant === "reference";

const createCallbacks = (index: functionality.ModelIndex) => {
  const textGenerator = createCodeGenerationContext();
  const importContext: imports.ImportContext = {
    imports: {},
    globals: new Set(["typescript"]),
    getPackageNameFromPathName: (pathName) =>
      pathName.startsWith(TYPES_PACKAGE_PREFIX)
        ? pathName.substring(TYPES_PACKAGE_PREFIX.length)
        : pathName,
  };
  const registerImport = imports.createRegisterImport(
    textGenerator,
    importContext,
  );
  const typeToText = someType.createGetSomeTypeText(
    textGenerator,
    ({ target, ...type }) =>
      textGenerator.code`${
        typeof target === "number"
          ? text.ref(
              `${
                type.qualifiedName ??
                type.name ??
                functionality.doThrow(
                  `Internal reference ${target} had no qualified name`,
                )
              }`,
              target,
            )
          : registerImport(type, target)
      }`,
    (sig) => sigToText(sig, "=>"),
    (dec) => declarationToText(dec),
  );
  const sigToText = sig.createGetSignatureText(textGenerator, (type) =>
    typeToText(type),
  );
  const declarationToText = declaration.createGetDeclarationText(
    textGenerator,
    index,
    typeToText,
    sigToText,
  );
  return {
    textGenerator,
    importContext,
    typeToText,
    sigToText,
    declarationToText,
  };
};

const textWithImports = (
  { code }: text.CodeGenerationContext,
  importContext: imports.ImportContext,
  intermediate: text.IntermediateCode,
): types.Code => {
  const fullCode = code`${text.join(
    Object.entries(importContext.imports).map(
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

  return intermediateToComplete(fullCode);
};

// eslint-disable-next-line sonarjs/cognitive-complexity
function* constructTokenInfoArray(
  originalCodeTokens: ReadonlyArray<TSESTree.Token>,
  typeRefTokenInfos: ReadonlyArray<TokenIndexAndTypeRef>,
  formattedCode: string,
  formattedCodeTokens: ReadonlyArray<TSESTree.Token>,
): Generator<TokenInfo, void, unknown> {
  let prevIndex = 0;
  let originalCodeTokenIndex = 0; // Index to originalCodeTokens
  let typeRefTokenInfoIndex = 0; // Index to typeRefTokenInfos
  for (const token of formattedCodeTokens) {
    const {
      range: [start, end],
    } = token;
    if (start > prevIndex) {
      yield formattedCode.substring(prevIndex, start);
    }

    // We exploit the two facts:
    // - formatting the code never breaks the identifier tokens which are type references, and
    // - the type reference tokens always will come in same order
    const startingTypeRefTokenInfoIndex = typeRefTokenInfoIndex;
    if (typeRefTokenInfoIndex < typeRefTokenInfos.length) {
      const originalToken = originalCodeTokens[originalCodeTokenIndex];
      if (
        originalToken.type === token.type &&
        originalToken.value === token.value
      ) {
        // We found the matching token, now check if it is type reference
        const { tokenIndex: typeRefTokenIndex, typeRef } =
          typeRefTokenInfos[typeRefTokenInfoIndex];
        if (originalCodeTokenIndex === typeRefTokenIndex) {
          yield {
            token: ensureIdentifierToken(token),
            typeRef,
          };
          ++typeRefTokenInfoIndex;
        }
        // Advance original token index
        ++originalCodeTokenIndex;
      }
    }

    if (startingTypeRefTokenInfoIndex === typeRefTokenInfoIndex) {
      yield token;
    }
    prevIndex = end; // The end of the token range is exclusive
  }
  if (prevIndex < formattedCode.length) {
    yield formattedCode.substring(prevIndex);
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
      if (
        matchers[matcherIndex](
          "token" in tokenInfo ? tokenInfo.token : tokenInfo,
        )
      ) {
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

const createCodeGenerationContext = (): text.CodeGenerationContext => ({
  code: (fragments, ...args) =>
    Array.from(saveCodeTemplateArgs(fragments, args)),
});

// eslint-disable-next-line sonarjs/cognitive-complexity
function* saveCodeTemplateArgs(
  fragments: ReadonlyArray<string>,
  args: Readonly<text.TemplateStringArgs>,
): Generator<text.CodeGenerationFragment, void, unknown> {
  for (const [idx, fragment] of fragments.entries()) {
    if (fragment.length > 0) {
      yield fragment;
    }
    if (idx < args.length) {
      const arg = args[idx];
      if (Array.isArray(arg)) {
        for (const frag of arg) {
          if (typeof frag !== "string" || frag.length > 0) {
            yield frag;
          }
        }
      } else if (typeof arg === "object") {
        if (arg === null) {
          // Literal 'null'
          yield "null";
        } else {
          if ("text" in arg) {
            // Plain text
            if (arg.text.length > 0) {
              yield arg.text;
            }
          } else if ("value" in arg && "negative" in arg) {
            // Big int literal
            yield `${arg.negative ? "-" : ""}${arg.value}n`;
          } else {
            // Type reference
            yield arg;
          }
        }
      } else {
        // Number or boolean literal
        yield `${arg}`;
      }
    }
  }
}

const intermediateToComplete = (
  intermediate: text.IntermediateCode,
): types.Code => {
  let code = "";
  const typeReferences: types.TypeReferencesInCode = [];
  for (const fragment of intermediate) {
    if (typeof fragment === "string") {
      code += fragment;
    } else {
      const textual = fragment.name;
      typeReferences.push({
        range: { start: code.length, length: textual.length },
        ref: fragment.ref,
      });
      code += textual;
    }
  }

  return {
    code,
    typeReferences,
  };
};

const fixTypeReferences = (
  { code: originalCode, typeReferences }: types.Code,
  formattedCode: string,
): TokenInfos => {
  // Find out which tokens are the ones which are type refs
  const originalTokens = getTSTokens(originalCode);
  const typeRefTokenInfos: Array<TokenIndexAndTypeRef> = [];
  let curTypeRefIdx = 0;
  for (const [tokenIdx, token] of originalTokens.entries()) {
    if (token.type === "Identifier" && curTypeRefIdx < typeReferences.length) {
      const {
        range: { start: refStart, length: refLength },
        ref,
      } = typeReferences[curTypeRefIdx];
      const [tokenStart, tokenEnd] = token.range;
      if (refStart === tokenStart) {
        if (refStart + refLength !== tokenEnd) {
          // eslint-disable-next-line no-console
          console.error(
            `Token started at ${tokenStart} and ended at ${tokenEnd}, but type ref length was ${refLength}.`,
          );
        }
        typeRefTokenInfos.push({ tokenIndex: tokenIdx, typeRef: ref });
        ++curTypeRefIdx;
      }
    }
  }

  return Array.from(
    constructTokenInfoArray(
      originalTokens,
      typeRefTokenInfos,
      formattedCode,
      getTSTokens(formattedCode),
    ),
  );
};

const getTSTokens = (code: string) =>
  (
    typescript.parsers.typescript.parse(
      code,
      // Options are not used for anything useful for us
      // See https://github.com/prettier/prettier/blob/main/src/language-js/parse/typescript.js
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      undefined as any,
    ) as TSESTree.Program
  ).tokens ?? functionality.doThrow("Parsed TS program without tokens?");

interface TokenIndexAndTypeRef {
  tokenIndex: number;
  typeRef: text.CodeGenerationTypeRef;
}

const ensureIdentifierToken = (
  token: TSESTree.Token,
): TSESTree.IdentifierToken => {
  if (token.type !== "Identifier") {
    throw new Error("Not identifier token when expected one");
  }
  return token;
};

const TYPES_PACKAGE_PREFIX = "@types/";
