import type * as typedoc from "typedoc/dist/lib/serialization/schema";

export const getFlagsText = (flags: typedoc.ReflectionFlags): string =>
  Object.entries(flags)
    .map(([key]) => key.substring(key.search(/[A-Z]/)).toLowerCase())
    .join(" ");

export const getParametersFlagsText = (
  flags: typedoc.ReflectionFlags,
): string => {
  let retVal = "";
  if (flags.isRest) {
    retVal = `${retVal}...`;
  }
  return retVal;
};
