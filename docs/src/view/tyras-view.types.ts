import type * as documentation from "./documentation/functionality";
import type * as structure from "../structure";

export interface SelectedElement {
  element: documentation.IndexableModel;
  index: documentation.ModelIndex;
  allDocKinds: ReadonlyArray<string> | undefined;
}

export type SimpleSetter<T> = (value: T) => void;

export type ToolbarNavigationParams = Omit<
  structure.DocumentationParams,
  "selectedReflection"
>;

export type ContentNavigationParams = structure.DocumentationParams;
