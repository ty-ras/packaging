import { Throw } from "throw-expression";
import type * as types from "./functionality.types";
import * as flags from "../flags";
import * as text from "../text";

export default {
  text: ({ codeGenerationContext: { code }, declaration, getTypeText }) =>
    code`export declare ${text.text(
      flags.getFlagsText(declaration.flags),
    )} ${text.ref(declaration.name, declaration.id)}: ${getTypeText(
      declaration.type ?? Throw("Variable without type?"),
    )}`,
  getChildren: () => [],
} as const satisfies types.ReflectionKindFunctionality;
