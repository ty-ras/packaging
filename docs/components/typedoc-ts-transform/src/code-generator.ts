import type * as typedoc from "typedoc";
import { type TSESTree } from "@typescript-eslint/types";

import type * as types from "./types";
import * as declaration from "./declaration";
import * as someType from "./some-type";
import * as sig from "./signature";
import * as imports from "./imports";
import * as text from "./text";

export const createCodeGenerator = (index: types.ModelIndex): CodeGenerator => {
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

  const getDeclarationText: CodeGenerator["getDeclarationText"] = (
    reflection,
  ) => {
    return isReference(reflection)
      ? getDeclarationText(index(reflection.target))
      : getDeclarationTextImpl(reflection);
  };

  return {
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
        processTokenInfos: processTokenInfosForType,
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
  };
};

export type CodeGenerator = {
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

const createCallbacks = (index: types.ModelIndex) => {
  const textGenerator = createCodeGenerationContext();
  const importContext: imports.ImportContext = {
    imports: {},
    globals: new Set(["typescript"]),
    // TODO make this callback customizable
    getVisiblePackageName: (packageName, { qualifiedName }) => {
      let visiblePackageName = packageName.startsWith(TYPES_PACKAGE_PREFIX)
        ? packageName.substring(TYPES_PACKAGE_PREFIX.length)
        : packageName;
      if (visiblePackageName === "node") {
        // Node is special
        const secondIdx = qualifiedName.indexOf('".', 1);
        if (secondIdx < 0 || !qualifiedName.startsWith('"')) {
          throw new Error(
            `Named Node module import "${qualifiedName}" did not have quotes`,
          );
        }
        visiblePackageName = `node:${qualifiedName.substring(1, secondIdx)}`;
      }
      return visiblePackageName;
    },
  };
  const registerImport = imports.createRegisterImport(
    textGenerator,
    importContext,
  );
  const typeToText = someType.createGetSomeTypeText(
    textGenerator,
    registerImport,
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

const TYPE = "type";
const TYPE_NAME = "___X___";
const EQUALS = "=";

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
    typeof tokenInfos[tokenIndex] === "string"
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

const TYPES_PACKAGE_PREFIX = "@types/";
