import * as documentation from "./documentation/functionality";

export interface SelectedElement {
  element: documentation.IndexableModel;
  index: documentation.ModelIndex;
  allDocKinds: ReadonlyArray<string> | undefined;
}
