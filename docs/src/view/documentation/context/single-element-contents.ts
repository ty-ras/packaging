import { createContext } from "solid-js";
import type * as navigation from "../navigation";
import type * as codeGen from "../code-generation";

export interface SingleElementContext {
  linkFunctionality: () => navigation.LinkHrefFunctionality;
  codeGenerator: () => codeGen.CodeGenerator;
}

const requiresContext = () => {
  throw new Error(
    "Please use SingleElementContentsContextProvider as ancestor of this element",
  );
};
const ERRORING_CONTEXT: SingleElementContext = {
  linkFunctionality: requiresContext,
  codeGenerator: requiresContext,
};
export default createContext<SingleElementContext>(ERRORING_CONTEXT);
