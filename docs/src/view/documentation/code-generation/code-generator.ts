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

export const createCodeGenerator = (
  index: functionality.ModelIndex,
  prettierOptions: types.PrettierOptions,
): types.CodeGenerator => {
  const getDeclarationTextImpl = (
    reflection: functionality.IndexableModel,
  ): string => {
    const { importContext, declarationToText } = createCallbacks();
    return textWithImports(
      importContext,
      `export declare ${declarationToText(reflection)}`,
    );
  };

  const getDeclarationText: types.CodeGenerator["getDeclarationText"] = (
    reflection,
  ) => {
    return isReference(reflection)
      ? getDeclarationText(
          (reflection.target < 0 ? undefined : index[reflection.target]) ??
            functionality.doThrow(
              `Failed to find reference ${reflection.target}`,
            ),
        )
      : getDeclarationTextImpl(reflection);
  };

  return {
    getTypeText: (type) => {
      const { importContext, typeToText } = createCallbacks();
      return textWithImports(importContext, `export ${typeToText(type)}`);
    },
    getSignatureText: (sig) => {
      const { importContext, sigToText } = createCallbacks();
      const sigText = sigToText(sig, ":");
      return textWithImports(
        importContext,
        `export declare function ${sig.name}${sigText}`,
      );
    },
    getDeclarationText,
    formatCode: async (code) =>
      await prettier.format(code, {
        ...prettierOptions,
        parser: "typescript",
        plugins: [estree, typescript],
      }),
    getTokenInfos: (code) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { tokens }: TSESTree.Program = typescript.parsers.typescript.parse(
        code,
        // Options are not used for anything useful for us
        // See https://github.com/prettier/prettier/blob/main/src/language-js/parse/typescript.js
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
        undefined as any,
      );
      return Array.from(
        constructTokenInfoArray(
          code,
          tokens ?? functionality.doThrow("Parsed TS program without tokens?"),
        ),
      );
    },
  };
};

const isReference = (
  reflection: functionality.IndexableModel,
): reflection is functionality.MakeChildrenIntegers<typedoc.ReferenceReflection> =>
  reflection.variant === "reference";

const createCallbacks = () => {
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
            functionality.doThrow(
              `Internal reference ${target} had no qualified name`,
            )
          }`
        : registerImport(type, target),
    (sig) => sigToText(sig, "=>"),
  );
  const sigToText = sig.createGetSignatureText((type) => typeToText(type));
  const declarationToText = declaration.createGetDeclarationText(
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
            ? "* as"
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
