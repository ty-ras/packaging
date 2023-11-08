import type * as typedoc from "typedoc/dist/lib/serialization/schema";
import type * as prettier from "prettier";
import type * as functionality from "../functionality";
import type * as text from "./text";

export interface CodeGeneratorGenerationFunctionMap {
  getTypeText: typedoc.SomeType;
  getSignatureText: typedoc.SignatureReflection;
  getDeclarationText:
    | functionality.IndexableModel
    | typedoc.DeclarationReflection;
}

export type PrettierOptions = Omit<prettier.Options, "parser" | "plugins">;

export type GetDeclarationText = (
  declaration: CodeGeneratorGenerationFunctionMap["getDeclarationText"],
) => text.IntermediateCode;

export type GetSomeTypeText = (
  type: CodeGeneratorGenerationFunctionMap["getTypeText"],
) => text.IntermediateCode;

export type GetSignatureText = (
  signature: CodeGeneratorGenerationFunctionMap["getSignatureText"],
  returnTypeSeparator?: SignatureContext,
) => text.IntermediateCode;

export const SIG_CONTEXT_DEF = ":";
export const SIG_CONTEXT_TYPE = "=>";

export type SignatureContext =
  | typeof SIG_CONTEXT_DEF
  | typeof SIG_CONTEXT_TYPE
  | null;

export interface Code {
  code: string;
  typeReferences: TypeReferencesInCode;
}

export type TypeReferencesInCode = Array<{
  ref: text.CodeGenerationTypeRef;
  range: { start: number; length: number };
}>;
