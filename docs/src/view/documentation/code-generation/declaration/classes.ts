import * as functionality from "../../functionality";
import * as get from "../get-with-check";
import type * as types from "./types";
import * as flags from "../flags";

const getChildren: types.GetChildren = ({ declaration, index }) =>
  declaration.groups
    ?.toSorted(
      ({ title: titleX }, { title: titleY }) =>
        get.getGroupOrderNumber(titleX, CLASS_CHILDREN_ORDER) -
        get.getGroupOrderNumber(titleY, CLASS_CHILDREN_ORDER),
    )
    .flatMap(
      ({ children }) =>
        children?.toSorted((childIdX, childIdY) =>
          get
            .getIndexedModel(childIdX, index)
            .name.localeCompare(get.getIndexedModel(childIdY, index).name),
        ) ?? [],
    ) ?? [];

export default {
  getPrefixText: ({ declaration }) =>
    `export declare ${flags.getFlagsText(declaration.flags)} class`,
  getBodyText: ({
    index,
    getTypeText,
    getDeclarationText,
    declaration,
  }) => `${functionality.getOptionalValueText(
    declaration.extendedTypes,
    (parentTypes) => ` extends ${parentTypes.map(getTypeText).join(", ")}`,
  )}${functionality.getOptionalValueText(
    declaration.implementedTypes,
    (implementedTypes) =>
      ` implements ${implementedTypes.map(getTypeText).join(", ")}`,
  )} {
${
  getChildren({ declaration, index })
    .map((childId) => getDeclarationText(get.getIndexedModel(childId, index)))
    .join("\n") ?? ""
}
  }`,
  getChildren,
} as const satisfies types.ReflectionKindFunctionality;

const CLASS_CHILDREN_ORDER: get.OrderSpecifier = {
  Properties: 0,
  Constructors: 1,
  Accessors: 2,
  Methods: 3,
};
