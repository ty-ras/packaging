import * as functionality from "../functionality";
import type * as types from "./types";

export const getGroupOrderNumber = (title: string, orders: OrderSpecifier) =>
  orders[title] ??
  functionality.doThrow(`Could not find order number for group "${title}"`);

export const getIndexedModel = (
  childId: number,
  parent: types.CodeGeneratorGenerationFunctionMap["getDeclarationText"],
  index: functionality.ModelIndex,
) =>
  index[childId] ??
  findFromInlineChildren(childId, parent.children) ??
  functionality.doThrow(`Could not to find declaration with ID ${childId}`);

export type OrderSpecifier = Record<string, number>;

const findFromInlineChildren = (
  childId: number,
  children: types.CodeGeneratorGenerationFunctionMap["getDeclarationText"]["children"],
) =>
  children?.find((child) => typeof child !== "number" && child.id === childId);
