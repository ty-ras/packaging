import { createContext } from "solid-js";
import type * as navigation from "@typedoc-2-ts/browser";
import type * as codeGen from "@typedoc-2-ts/transform";
import type * as formatting from "@typedoc-2-ts/format";
import type * as common from "@typedoc-2-ts/types";

export interface SingleElementContext {
  linkFunctionality: () => navigation.LinkHrefFunctionality;
  codeGenerator: () => codeGen.CodeGenerator;
  codeFormatter: () => (code: common.Code) => Promise<formatting.TokenInfos>;
}

const requiresContext = () => {
  throw new Error(
    "Please use SingleElementContentsContextProvider as ancestor of this element",
  );
};
const ERRORING_CONTEXT: SingleElementContext = {
  linkFunctionality: requiresContext,
  codeGenerator: requiresContext,
  codeFormatter: requiresContext,
};

export default createContext<SingleElementContext>(ERRORING_CONTEXT);
