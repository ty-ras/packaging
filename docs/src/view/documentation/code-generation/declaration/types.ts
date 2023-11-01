import * as functionality from "../../functionality";
import * as types from "../types";

export interface ReflectionKindFunctionality {
  text: ReflectionKindFunctionalityToText;
  getChildren: GetChildren;
}

export type ReflectionKindFunctionalityToText =
  | {
      getPrefixText: (args: GetPrefixTextArgs) => string;
      getBodyText: (args: GetBodyTextArgs) => string;
    }
  | ((args: GetBodyTextArgs) => string);

export type GetChildren = (args: GetChildrenArgs) => Array<number>;

export interface GetPrefixTextArgs {
  declaration: types.CodeGeneratorGenerationFunctionMap["getDeclarationText"];
}

export interface GetBodyTextArgs {
  index: functionality.ModelIndex;
  getTypeText: types.GetSomeTypeText;
  getDeclarationText: types.GetDeclarationText;
  getSignatureText: types.GetSignatureText;
  declaration: types.CodeGeneratorGenerationFunctionMap["getDeclarationText"];
}

export interface GetChildrenArgs {
  declaration: types.CodeGeneratorGenerationFunctionMap["getDeclarationText"];
  index: functionality.ModelIndex;
}
