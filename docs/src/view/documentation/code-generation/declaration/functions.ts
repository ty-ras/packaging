import * as functionality from "../../functionality";
import * as types from "./types";
import * as text from "../text";

// TODO are there parameters as children of function?
const getChildren: types.GetChildren = () => [];

export default {
  text: ({ codeGenerationContext: { code }, declaration, getSignatureText }) =>
    code`${text.join(
      (
        declaration.signatures ??
        functionality.doThrow("Function without signatures?")
      ).map(
        (sig) =>
          code`export declare function ${text.ref(
            sig.name,
            declaration.id,
          )}${getSignatureText(sig)}`,
      ),
      ";\n\n",
    )}`,
  getChildren,
} as const satisfies types.ReflectionKindFunctionality;
