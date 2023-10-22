import type * as typedoc from "typedoc/dist/lib/serialization/schema";

export interface ReflectionElementProps {
  element: Element;
}

export type Element = typedoc.DeclarationReflection;
