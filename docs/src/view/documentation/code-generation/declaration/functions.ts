import * as functionality from "../../functionality";
import * as types from "./types";

// TODO actually we probably want to NOT have functionality related to functions here?

// TODO are there parameters as children of function?
const getChildren: types.GetChildren = () => [];

export default {
  getPrefixText: () => "", // No single prefix text, instead we iterate the signatures in getBodyText
  getBodyText: ({ declaration, getSignatureText }) =>
    (
      declaration.signatures ??
      functionality.doThrow("Function without signatures?")
    )
      .map(
        (sig) => `export declare function ${sig.name}${getSignatureText(sig)}`,
      )
      .join(";\n"),
  getChildren,
} as const satisfies types.ReflectionKindFunctionality;
