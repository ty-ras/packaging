import { Throw } from "throw-expression";
import type * as types from "./types";
import * as codeGenTypes from "../types";

export const createGetChildren =
  (orderSpec: OrderSpecifier): types.GetChildren =>
  ({ declaration, index }) =>
    // .toSorted is only Node20+, and for now we are Node18+
    [...(declaration.groups ?? [])]
      .sort(
        ({ title: titleX }, { title: titleY }) =>
          getGroupOrderNumber(titleX, orderSpec) -
          getGroupOrderNumber(titleY, orderSpec),
      )
      .map(({ title, children }) => ({
        groupName: title,
        sortedChildren: [...(children ?? [])].sort((childIdX, childIdY) =>
          index(childIdX).name.localeCompare(index(childIdY).name),
        ),
      }));

export type OrderSpecifier = Record<string, number>;

export const getChildrenInstances = (
  index: codeGenTypes.ModelIndex,
  reflection: types.MaybeDeclarationReflection,
  groupedChildren: ReadonlyArray<types.GroupChildren>,
): Array<types.MaybeDeclarationReflection> => {
  if ("children" in reflection) {
    const childrenById = Object.fromEntries(
      reflection.children?.map((child) => [child.id, child] as const) ?? [],
    );
    index = (id) =>
      childrenById[id] ?? Throw(`Children array did not have child ${id}.`);
  }
  return groupedChildren.flatMap(({ sortedChildren }) =>
    sortedChildren.map((childId) => index(childId)),
  );
};

const getGroupOrderNumber = (title: string, orders: OrderSpecifier) =>
  orders[title] ?? Throw(`Could not find order number for group "${title}"`);
