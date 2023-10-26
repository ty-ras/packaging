import type * as functionality from "../functionality";

export interface ReflectionElementProps {
  element: Element;
}

export type Element = functionality.IndexableModel;

export interface CodeGenerationProps {
  codeGenerator: functionality.CodeGenerator;
}
