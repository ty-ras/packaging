import * as functionality from "../../functionality";
import * as types from "./types";

// TODO are there parameters as children of function?
const getChildren: types.GetChildren = () => [];

export default {
  text: ({ declaration, getSignatureText }) =>
    (
      declaration.signatures ??
      functionality.doThrow("Function without signatures?")
    )
      .map(
        (sig) => `export declare function ${sig.name}${getSignatureText(sig)}`,
      )
      .join(";\n\n"),
  getChildren,
} as const satisfies types.ReflectionKindFunctionality;
