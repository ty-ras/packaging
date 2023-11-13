import { Throw } from "throw-expression";
import type * as typedoc from "typedoc/dist/lib/serialization/schema";
import * as types from "./types";
import * as flags from "./flags";
import * as text from "./text";
import * as kind from "./reflection-kind";

export const createGetSignatureText = (
  { code }: text.CodeGenerationContext,
  getSomeTypeText: types.GetSomeTypeText,
): types.GetSignatureText => {
  function getSignatureText(
    signature: typedoc.SignatureReflection,
    returnTypeSeparator: types.SignatureContext = types.SIG_CONTEXT_DEF,
  ): text.IntermediateCode {
    return code`${text.text(flags.getFlagsText(signature.flags))}${text.text(
      returnTypeSeparator === types.SIG_CONTEXT_TYPE &&
        signature.kind === kind.ReflectionKind.ConstructorSignature
        ? " new "
        : "",
    )}(${text.join(
      signature.parameters?.map(
        (p) =>
          code`${text.text(flags.getParametersFlagsText(p.flags))}${text.text(
            p.name,
          )}: ${getSomeTypeText(
            p.type ?? Throw("Parameter without type"),
          )}${text.getOptionalValueText(
            p.defaultValue,
            (defaultValue) => code` = ${text.text(defaultValue)}`,
          )}`,
      ) ?? [],
      ", ",
    )})${text.getOptionalValueText(
      returnTypeSeparator,
      (separator) =>
        code` ${text.text(separator)} ${getSomeTypeText(
          signature.type ?? Throw("Function signature without return type"),
        )}`,
    )}`;
  }
  return getSignatureText;
};
