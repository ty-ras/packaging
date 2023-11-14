import type * as typedoc from "typedoc";

export interface Documentation {
  project: Project;
  modelIndex: ModelIndex;
}

export type Project =
  MakeChildrenIntegers<typedoc.JSONOutput.ProjectReflection>;

export type ModelIndex = Record<number, IndexableModel>;

export type IndexableModel =
  MakeChildrenIntegers<typedoc.JSONOutput.DeclarationReflection> & WithParentID;

export interface WithParentID {
  parentId?: number;
}

export type MakeChildrenIntegers<
  T extends {
    children?: Array<typedoc.JSONOutput.DeclarationReflection> | undefined;
  },
> = Omit<T, "children"> & { children?: Array<number> | undefined };
