import { Throw } from "throw-expression";
import type * as types from "./functionality.types";

export default {
  text: {
    getPrefixText: ({ codeGenerationContext: { code } }) => code`export type`,
    getBodyText: ({
      codeGenerationContext: { code },
      getTypeText,
      declaration,
    }) =>
      code` = ${getTypeText(
        declaration.type ?? Throw("Type alias without type?"),
      )}`,
  },
  getChildren: () => [],
} as const satisfies types.ReflectionKindFunctionality;
