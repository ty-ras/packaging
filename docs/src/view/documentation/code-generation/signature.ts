import type * as typedoc from "typedoc/dist/lib/serialization/schema";
import * as functionality from "../functionality";
import * as types from "./types";
import * as flags from "./flags";

/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */

export const createGetSignatureText = (
  getSomeTypeText: types.GetSomeTypeText,
): types.GetSignatureText => {
  function getSignatureText(
    signature: typedoc.SignatureReflection,
    returnTypeSeparator: types.SignatureContext = types.SIG_CONTEXT_DEF,
  ): string {
    return `${flags.getFlagsText(signature.flags)}${
      returnTypeSeparator === types.SIG_CONTEXT_TYPE &&
      signature.kind === functionality.ReflectionKind.ConstructorSignature
        ? " new "
        : ""
    }(${signature.parameters?.map(
      (p) =>
        `${flags.getParametersFlagsText(p.flags)}${p.name}: ${getSomeTypeText(
          p.type ?? functionality.doThrow("Parameter without type"),
        )}${functionality.getOptionalValueText(
          p.defaultValue,
          (defaultValue) => ` = ${defaultValue}`,
        )}`,
    )}) ${returnTypeSeparator} ${getSomeTypeText(
      signature.type ??
        functionality.doThrow("Function signature without return type"),
    )}`;
  }
  return getSignatureText;
};
