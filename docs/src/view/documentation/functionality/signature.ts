import type * as typedoc from "typedoc/dist/lib/serialization/schema";
import * as kind from "./reflection-kind";
import * as errors from "./errors";
import * as text from "./text";
import type * as types from "./types";

/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */

export const createGetSignatureText = (
  getSomeTypeText: types.GetSomeTypeText,
): types.GetSignatureText => {
  function getSignatureText(
    signature: typedoc.SignatureReflection,
    returnTypeSeparator: ":" | "=>",
  ): string {
    const str = getFlagsText(signature.flags);
    return `${str}${
      signature.kind === kind.ReflectionKind.ConstructorSignature ? " new " : ""
    }(${signature.parameters?.map(
      (p) =>
        `${getParametersFlagsText(p.flags)}${p.name}: ${getSomeTypeText(
          p.type ?? errors.doThrow("Parameter without type"),
        )}${text.getOptionalValueText(
          p.defaultValue,
          (defaultValue) => ` = ${defaultValue}`,
        )}`,
    )}) ${returnTypeSeparator} ${getSomeTypeText(
      signature.type ??
        errors.doThrow("Function signature without return type"),
    )}`;
  }
  return getSignatureText;
};

const getFlagsText = (flags: typedoc.ReflectionFlags): string =>
  Object.entries(flags)
    .filter(([key, val]) => val && key !== "isExternal")
    .map(([key]) => key.substring(key.search(/[A-Z]/)).toLowerCase())
    .join(" ");

const getParametersFlagsText = (flags: typedoc.ReflectionFlags): string => {
  let retVal = "";
  if (flags.isRest) {
    retVal = `${retVal}...`;
  }
  return retVal;
};
