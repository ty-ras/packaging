import type * as typedoc from "typedoc/dist/lib/serialization/schema";
import type * as prettierTypes from "prettier";
import prettier from "prettier/standalone";
import estree from "prettier/plugins/estree";
import typescript from "prettier/plugins/typescript";
import type * as types from "./types";
import type * as AST from "@typescript-eslint/types/dist/index";
import * as someType from "./some-type";
import * as signature from "./signature";
import * as imports from "./imports";
import * as declaration from "./declaration";
import * as errors from "./errors";

export const createCodeGenerator = (
  index: types.ModelIndex,
  prettierOptions: PrettierOptions,
): CodeGenerator => {
  const getDeclarationTextImpl = (reflection: types.IndexableModel): string => {
    const { importContext, declarationToText } = createCallbacks(index);
    return textWithImports(
      importContext,
      `export declare ${declarationToText(reflection)}`,
    );
  };

  const getDeclarationText: CodeGenerator["getDeclarationText"] = (
    reflection,
  ) => {
    return isReference(reflection)
      ? getDeclarationText(
          (reflection.target < 0 ? undefined : index[reflection.target]) ??
            errors.doThrow(`Failed to find reference ${reflection.target}`),
        )
      : getDeclarationTextImpl(reflection);
  };

  const debug: AST.AST_NODE_TYPES.Program = typescript.parsers.typescript.parse(
    "import * as lel from 'io-ts';",
  );
  console.log(
    "DEBUG",
    typescript.parsers.typescript.parse("import * as lel from 'io-ts';"),
  );
  return {
    getTypeText: (type) => {
      const { importContext, typeToText } = createCallbacks(index);
      return textWithImports(importContext, `export ${typeToText(type)}`);
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
    formatCode: async (code) =>
      await prettier.format(code, {
        ...prettierOptions,
        parser: "typescript",
        plugins: [estree, typescript],
      }),
  };
};

export interface CodeGenerator {
  getTypeText: (type: typedoc.SomeType) => string;
  getSignatureText: (sig: typedoc.SignatureReflection) => string;
  getDeclarationText: (reflection: types.IndexableModel) => string;
  formatCode: (code: string) => Promise<string>;
}

export type PrettierOptions = Omit<prettierTypes.Options, "parser" | "plugins">;

const isReference = (
  reflection: types.IndexableModel,
): reflection is types.MakeChildrenIntegers<typedoc.ReferenceReflection> =>
  reflection.variant === "reference";

const createCallbacks = (index: types.ModelIndex) => {
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
            errors.doThrow(`Internal reference ${target} had no qualified name`)
          }`
        : registerImport(type, target),
    (sig) => sigToText(sig, "=>"),
  );
  const sigToText = signature.createGetSignatureText((type) =>
    typeToText(type),
  );
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
