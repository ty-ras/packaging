import type * as typedoc from "typedoc";
import type * as types from "../types";
import type * as text from "../text";

export interface ReflectionKindFunctionality {
  text: ReflectionKindFunctionalityToText;
  getChildren: GetChildren;
}

export type ReflectionKindFunctionalityToText =
  | {
      getPrefixText: (args: GetPrefixTextArgs) => text.IntermediateCode;
      getBodyText: (args: GetBodyTextArgs) => text.IntermediateCode;
    }
  | ((args: GetBodyTextArgs) => text.IntermediateCode);

export type GetChildren = (args: GetChildrenArgs) => Array<GroupChildren>;

export interface GroupChildren {
  groupName: string;
  sortedChildren: Array<number>;
}

export type MaybeDeclarationReflection =
  | types.IndexableModel
  | typedoc.JSONOutput.DeclarationReflection;

export interface GetSomeTextArgs {
  codeGenerationContext: text.CodeGenerationContext;
}

export interface GetPrefixTextArgs extends GetSomeTextArgs {
  declaration: MaybeDeclarationReflection;
}

export interface GetBodyTextArgs extends GetSomeTextArgs {
  index: types.ModelIndex;
  getTypeText: types.GetSomeTypeText;
  getDeclarationText: types.GetDeclarationText;
  getSignatureText: types.GetSignatureText;
  declaration: MaybeDeclarationReflection;
}

export interface GetChildrenArgs {
  declaration: types.CodeGeneratorGenerationFunctionMap["getDeclarationText"];
  index: types.ModelIndex;
}
