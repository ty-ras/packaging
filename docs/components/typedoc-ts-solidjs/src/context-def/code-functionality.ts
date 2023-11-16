import { createContext } from "solid-js";
import type * as codeGen from "@typedoc-2-ts/transform";
import type * as formatting from "@typedoc-2-ts/format";
import type * as common from "@typedoc-2-ts/types";
import * as ctx from "./common";

export interface CodeFunctionalityContext {
  codeGenerator: () => codeGen.CodeGenerator;
  codeFormatter: () => (
    code: common.Code,
  ) => Promise<formatting.CodeFormattingResult>;
}

const requiresContext = ctx.requiresContext("CodeFunctionality");

const ERRORING_CONTEXT: CodeFunctionalityContext = {
  codeGenerator: requiresContext,
  codeFormatter: requiresContext,
};

export default createContext<CodeFunctionalityContext>(ERRORING_CONTEXT);
