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
  declaration: functionality.IndexableModel;
}

export interface GetBodyTextArgs {
  index: functionality.ModelIndex;
  getTypeText: types.GetSomeTypeText;
  getDeclarationText: types.GetDeclarationText;
  getSignatureText: types.GetSignatureText;
  declaration: functionality.IndexableModel;
}

export interface GetChildrenArgs {
  declaration: functionality.IndexableModel;
  index: functionality.ModelIndex;
}
