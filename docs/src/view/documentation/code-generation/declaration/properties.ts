import * as functionality from "../../functionality";
import * as types from "./types";
import * as flags from "../flags";

export default {
  text: {
    getPrefixText: ({ declaration }) => flags.getFlagsText(declaration.flags), // No single prefix text, instead we iterate the signatures in getBodyText
    getBodyText: ({ declaration, getTypeText }) =>
      `${flags.getObjectMemberFlagsText(declaration.flags)}: ${getTypeText(
        declaration.type ?? functionality.doThrow("Property without type?"),
      )};`,
  },
  getChildren: () => [],
} as const satisfies types.ReflectionKindFunctionality;
