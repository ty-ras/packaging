import type * as functionality from "../functionality";
import type * as codeGen from "../code-generation";

export interface ReflectionElementProps {
  element: Element;
}

export type Element = functionality.IndexableModel;

export interface CodeGenerationProps {
  codeGenerator: codeGen.CodeGenerator;
}
