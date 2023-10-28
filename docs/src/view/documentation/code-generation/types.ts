import type * as typedoc from "typedoc/dist/lib/serialization/schema";
import type * as prettier from "prettier";
import { type TSESTree } from "@typescript-eslint/types/dist/index";
import type * as functionality from "../functionality";

export interface CodeGenerator {
  getTypeText: (type: typedoc.SomeType) => string;
  getSignatureText: (sig: typedoc.SignatureReflection) => string;
  getDeclarationText: (reflection: functionality.IndexableModel) => string;
  formatCode: (code: string) => Promise<string>;
  getTokenInfos: (code: string) => Array<TSESTree.Token | string>;
}

export type PrettierOptions = Omit<prettier.Options, "parser" | "plugins">;

export type GetSomeTypeText = (type: typedoc.SomeType) => string;

export type GetSignatureText = (
  signature: typedoc.SignatureReflection,
  returnTypeSeparator?: SignatureContext,
) => string;

export const SIG_CONTEXT_DEF = ":";
export const SIG_CONTEXT_TYPE = "=>";

export type SignatureContext = typeof SIG_CONTEXT_DEF | typeof SIG_CONTEXT_TYPE;

export type GetDeclarationText = (
  declaration: functionality.IndexableModel,
) => string;
