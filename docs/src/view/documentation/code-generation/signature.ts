import type * as typedoc from "typedoc/dist/lib/serialization/schema";
import * as functionality from "../functionality";
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
      signature.kind === functionality.ReflectionKind.ConstructorSignature
        ? " new "
        : ""
    }(${signature.parameters?.map(
      (p) =>
        `${getParametersFlagsText(p.flags)}${p.name}: ${getSomeTypeText(
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
