import * as functionality from "../../functionality";
import * as types from "./types";
import * as flags from "../flags";
import * as text from "../text";

export default {
  text: {
    getPrefixText: ({ codeGenerationContext: { code }, declaration }) =>
      code`${text.text(flags.getFlagsText(declaration.flags))}`, // No single prefix text, instead we iterate the signatures in getBodyText
    getBodyText: ({
      codeGenerationContext: { code },
      declaration,
      getTypeText,
    }) =>
      code`${text.text(
        flags.getObjectMemberFlagsText(declaration.flags),
      )}: ${getTypeText(
        declaration.type ?? functionality.doThrow("Property without type?"),
      )};`,
  },
  getChildren: () => [],
} as const satisfies types.ReflectionKindFunctionality;
