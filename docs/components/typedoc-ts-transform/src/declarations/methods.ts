import * as arrays from "../arrays";
import type * as types from "./functionality.types";
import * as flags from "../flags";
import * as text from "../text";

export default {
  text: {
    getPrefixText: ({ codeGenerationContext: { code }, declaration }) =>
      code`${text.text(flags.getFlagsText(declaration.flags))}`, // No single prefix text, instead we iterate the signatures in getBodyText
    getBodyText: ({
      codeGenerationContext: { code },
      declaration,
      getSignatureText,
    }) =>
      code`${getSignatureText(arrays.ensureOneItem(declaration.signatures))};`,
  },
  getChildren: () => [],
} as const satisfies types.ReflectionKindFunctionality;
