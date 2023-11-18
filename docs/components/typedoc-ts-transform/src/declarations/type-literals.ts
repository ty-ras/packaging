import * as text from "../text";
import * as types from "./types";
import * as get from "./get";

const getChildren = get.createGetChildren({
  Properties: 0,
  Accessors: 2,
  Methods: 3,
});

export default {
  text: ({
    codeGenerationContext: { code },
    declaration,
    index,
    getDeclarationText,
  }) =>
    code`{ ${text.join(
      get
        .getChildrenInstances(
          index,
          declaration,
          getChildren({ declaration, index }),
        )
        .map(getDeclarationText),
      "\n",
    )} }`,
  getChildren,
} as const satisfies types.ReflectionKindFunctionality;
