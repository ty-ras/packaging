import type * as typedoc from "typedoc/dist/lib/serialization/schema";

export interface Documentation {
  project: Project;
  modelIndex: ModelIndex;
}

export type Project = MakeChildrenIntegers<typedoc.ProjectReflection>;

export type ModelIndex = Record<number, IndexableModel>;

export type IndexableModel =
  MakeChildrenIntegers<typedoc.DeclarationReflection> & WithParentID;

export interface WithParentID {
  parentId?: number;
}

export type MakeChildrenIntegers<
  T extends { children?: Array<typedoc.DeclarationReflection> | undefined },
> = Omit<T, "children"> & { children?: Array<number> | undefined };
