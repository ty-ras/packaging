import { Throw } from "throw-expression";
import type * as types from "./functionality.types";
import * as text from "../text";

const getChildren: types.GetChildren = () => [];

export default {
  text: ({ codeGenerationContext: { code }, declaration, getSignatureText }) =>
    code`${text.join(
      (declaration.signatures ?? Throw("Function without signatures?")).map(
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
