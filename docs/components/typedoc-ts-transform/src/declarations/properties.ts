import { Throw } from "throw-expression";
import type * as types from "./functionality.types";
import * as flags from "../flags";
import * as text from "../text";

export default {
  text: {
    getPrefixText: ({ codeGenerationContext: { code }, declaration }) =>
      code`${text.text(flags.getFlagsText(declaration.flags))}`,
    getBodyText: ({
      codeGenerationContext: { code },
      declaration,
      getTypeText,
    }) =>
      code`${text.text(
        flags.getObjectMemberFlagsText(declaration.flags),
      )}: ${getTypeText(declaration.type ?? Throw("Property without type?"))};`,
  },
  getChildren: () => [],
} as const satisfies types.ReflectionKindFunctionality;
