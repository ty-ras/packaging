import * as get from "./get";
import type * as types from "./functionality.types";
import * as flags from "../flags";
import * as text from "../text";

const getChildren = get.createGetChildren({
  Properties: 0,
  Constructors: 1,
  Accessors: 2,
  Methods: 3,
});

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
