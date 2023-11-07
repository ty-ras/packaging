import type * as typedoc from "typedoc/dist/lib/serialization/schema";
import type * as prettier from "prettier";
import type * as functionality from "../functionality";

export interface CodeGeneratorGenerationFunctionMap {
  getTypeText: typedoc.SomeType;
  getSignatureText: typedoc.SignatureReflection;
  getDeclarationText:
    | functionality.IndexableModel
    | typedoc.DeclarationReflection;
}

export type PrettierOptions = Omit<prettier.Options, "parser" | "plugins">;

export type GetSomeTypeText = (
  type: CodeGeneratorGenerationFunctionMap["getTypeText"],
) => string;

export type GetSignatureText = (
  signature: CodeGeneratorGenerationFunctionMap["getSignatureText"],
  returnTypeSeparator?: SignatureContext,
) => string;

export const SIG_CONTEXT_DEF = ":";
export const SIG_CONTEXT_TYPE = "=>";

export type SignatureContext =
  | typeof SIG_CONTEXT_DEF
  | typeof SIG_CONTEXT_TYPE
  | null;

export type GetDeclarationText = (
  declaration: CodeGeneratorGenerationFunctionMap["getDeclarationText"],
) => string;
