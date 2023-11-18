import * as get from "./get";
import type * as types from "./types";
import * as text from "../text";

const getChildren = get.createGetChildren({
  Properties: 0,
  Accessors: 2,
  Methods: 3,
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
