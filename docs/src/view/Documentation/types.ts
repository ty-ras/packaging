import type * as typedoc from "typedoc/dist/lib/serialization/schema";

export type Documentation = typedoc.ProjectReflection;

export interface TopLevelElement {
  docKind: string;
  id: number;
  text: string;
  showKind: boolean;
  element: typedoc.DeclarationReflection;
  project: Documentation;
}
