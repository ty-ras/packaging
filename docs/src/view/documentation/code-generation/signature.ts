import type * as typedoc from "typedoc/dist/lib/serialization/schema";
import * as functionality from "../functionality";
import * as types from "./types";
import * as flags from "./flags";
import * as text from "./text";

export const createGetSignatureText = (
  textGenerationContext: text.CodeGenerationContext,
  getSomeTypeText: types.GetSomeTypeText,
): types.GetSignatureText => {
  function getSignatureText(
    signature: typedoc.SignatureReflection,
    returnTypeSeparator: types.SignatureContext = types.SIG_CONTEXT_DEF,
  ): types.Code {
    return `${flags.getFlagsText(signature.flags)}${
      returnTypeSeparator === types.SIG_CONTEXT_TYPE &&
      signature.kind === functionality.ReflectionKind.ConstructorSignature
        ? " new "
        : ""
    }(${signature.parameters?.map(
      (p) =>
        textGenerationContext.code`${flags.getParametersFlagsText(p.flags)}${
          p.name
        }: ${getSomeTypeText(
          p.type ?? functionality.doThrow("Parameter without type"),
        )}${text.getOptionalValueText(
          p.defaultValue,
          (defaultValue) => ` = ${defaultValue}`,
        )}`,
    )})${text.getOptionalValueText(
      returnTypeSeparator,
      (separator) =>
        textGenerationContext.code` ${separator} ${getSomeTypeText(
          signature.type ??
            functionality.doThrow("Function signature without return type"),
        )}`,
    )}`;
  }
  return getSignatureText;
};
