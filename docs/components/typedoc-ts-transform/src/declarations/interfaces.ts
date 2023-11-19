import * as get from "./get";
import type * as types from "./functionality.types";
import * as text from "../text";

const getChildren = get.createGetChildren({
  Properties: 0,
  Accessors: 1,
  Methods: 2,
});

export default {
  text: {
    getPrefixText: ({ codeGenerationContext: { code } }) =>
      code`export interface`,
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
    )} {
${text.join(
  get
    .getChildrenInstances(
      index,
      declaration,
      getChildren({ declaration, index }),
    )
    .map(getDeclarationText),
  "\n",
)}
  }`,
  },
  getChildren,
} as const satisfies types.ReflectionKindFunctionality;
