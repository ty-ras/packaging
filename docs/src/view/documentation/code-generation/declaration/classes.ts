import * as get from "../get-with-check";
import type * as types from "./types";
import * as flags from "../flags";
import * as text from "../text";

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
            .getIndexedModel(childIdX, declaration, index)
            .name.localeCompare(
              get.getIndexedModel(childIdY, declaration, index).name,
            ),
        ) ?? [],
    ) ?? [];

export default {
  text: {
    getPrefixText: ({ codeGenerationContext: { code }, declaration }) =>
      code`export declare ${text.text(
        flags.getFlagsText(declaration.flags),
      )} class`,
    getBodyText: ({
      codeGenerationContext: { code },
      index,
      getTypeText,
      getDeclarationText,
      declaration,
    }) => code`${text.getOptionalValueText(
      declaration.extendedTypes,
      (parentTypes) =>
        code` extends ${text.join(parentTypes.map(getTypeText), ", ")}`,
    )}${text.getOptionalValueText(
      declaration.implementedTypes,
      (implementedTypes) =>
        code` implements ${text.join(implementedTypes.map(getTypeText), ", ")}`,
    )} {
${text.join(
  getChildren({ declaration, index }).map((childId) =>
    getDeclarationText(get.getIndexedModel(childId, declaration, index)),
  ),
  "\n",
)}
  }`,
  },
  getChildren,
} as const satisfies types.ReflectionKindFunctionality;

const CLASS_CHILDREN_ORDER: get.OrderSpecifier = {
  Properties: 0,
  Constructors: 1,
  Accessors: 2,
  Methods: 3,
};
