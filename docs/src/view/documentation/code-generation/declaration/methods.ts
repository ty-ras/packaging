import * as functionality from "../../functionality";
import * as types from "./types";
import * as flags from "../flags";

export default {
  text: {
    getPrefixText: ({ declaration }) => flags.getFlagsText(declaration.flags), // No single prefix text, instead we iterate the signatures in getBodyText
    getBodyText: ({ declaration, getSignatureText }) =>
      `${getSignatureText(
        functionality.ensureOneItem(declaration.signatures),
      )};`,
  },
  getChildren: () => [],
} as const satisfies types.ReflectionKindFunctionality;
