import type * as typedoc from "typedoc/dist/lib/serialization/schema";

export const getFlagsText = (flags: typedoc.ReflectionFlags): string =>
  Object.entries(flags)
    // These two flags are handled in different way
    .filter(([flag]) => flag !== "isOptional" && flag !== "isRest")
    // Transform "isXyz" into "xyz"
    .map(([flag]) => flag.substring(flag.search(/[A-Z]/)).toLowerCase())
    .join(" ");

export const getParametersFlagsText = (flags: typedoc.ReflectionFlags) => {
  let retVal = "";
  if (flags.isRest) {
    retVal = `${retVal}...`;
  }
  return retVal;
};

export const getObjectMemberFlagsText = (flags: typedoc.ReflectionFlags) => {
  let retVal = "";
  if (flags.isOptional) {
    retVal = `${retVal}?`;
  }
  return retVal;
};
