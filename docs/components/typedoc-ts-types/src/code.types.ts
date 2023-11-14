import type * as typedoc from "typedoc";

export interface Code {
  code: string;
  typeReferences: TypeReferencesInCode;
}

export type TypeReferencesInCode = Array<{
  ref: CodeGenerationTypeRef;
  range: TokenRange;
}>;

export type CodeGenerationTypeRef =
  | number
  | typedoc.JSONOutput.ReflectionSymbolId;

export interface TokenRange {
  start: number;
  length: number;
}
