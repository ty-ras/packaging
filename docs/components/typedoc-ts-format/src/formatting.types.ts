import { type TSESTree } from "@typescript-eslint/types";
import type * as prettier from "prettier";
import type * as common from "@typedoc-2-ts/types";

export interface CodeFormattingArgs {
  code: common.Code;
  prettierOptions: PrettierOptions;
  onTokenInconsistency?: OnTokenInconsistency;
}

export type PrettierOptions = Omit<prettier.Options, "parser" | "plugins">;

export interface CodeFormattingResult {
  tokens: TokenInfos;
  declarationRanges: common.DeclarationRangesInCode;
}

export type TokenInfos = Array<TokenInfo>;
export type TokenInfo = TokenInfoToken | TokenInfoText | TokenInfoTypeRef;

export interface TokenInfoToken {
  token: TSESTree.Token;
}

export interface TokenInfoText {
  text: string;
}

export interface TokenInfoTypeRef {
  token: TSESTree.IdentifierToken;
  typeRef: common.CodeGenerationTypeRef;
}

export type OnTokenInconsistency = (args: OnTokenInconsistencyArgs) => void;

export interface OnTokenInconsistencyArgs {
  typeReference: common.TokenRange;
  token: common.TokenRange;
}
