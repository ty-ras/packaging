import type * as typedoc from "typedoc/dist/lib/serialization/schema";

export interface Documentation {
  project: Project;
  modelIndex: ModelIndex;
}

export type Project = MakeChildrenIntegers<typedoc.ProjectReflection>;

export type ModelIndex = Record<number, IndexableModel>;

export type IndexableModel =
  MakeChildrenIntegers<typedoc.DeclarationReflection>;

export type MakeChildrenIntegers<
  T extends { children?: Array<typedoc.DeclarationReflection> | undefined },
> = Omit<T, "children"> & { children?: Array<number> | undefined };

// Callbacks
export type GetSomeTypeText = (type: typedoc.SomeType) => string;

export type GetSignatureText = (
  signature: typedoc.SignatureReflection,
  returnTypeSeparator: ":" | "=>",
) => string;

export type GetDeclarationText = (declaration: IndexableModel) => string;
