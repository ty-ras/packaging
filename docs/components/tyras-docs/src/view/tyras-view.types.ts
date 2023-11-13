import type * as documentation from "@typedoc-2-ts/browser";
import type * as structure from "../structure";

export interface SelectedElement {
  element: documentation.IndexableModel;
  index: documentation.ModelIndex;
  allDocKinds: ReadonlyArray<string>;
}

export type SimpleSetter<T> = (value: T) => void;

export type FullNavigationParams = structure.DocumentationParams;

export type ContentNavigationParamsKeys = "selectedReflection";

export type ToolbarNavigationParams =
  | Omit<structure.DocumentationParamsServer, ContentNavigationParamsKeys>
  | Omit<structure.DocumentationParamsClient, ContentNavigationParamsKeys>
  | Omit<
      structure.DocumentationParamsServerAndClient,
      ContentNavigationParamsKeys
    >
  | Omit<structure.DocumentationParamsProtocol, ContentNavigationParamsKeys>;

export type ContentNavigationParamsKeysForPick =
  | ContentNavigationParamsKeys
  | "kind";
export type ContentNavigationParams =
  | Pick<structure.DocumentationParamsServer, ContentNavigationParamsKeys>
  | Pick<structure.DocumentationParamsClient, ContentNavigationParamsKeys>
  | Pick<
      structure.DocumentationParamsServerAndClient,
      ContentNavigationParamsKeys
    >
  | Pick<structure.DocumentationParamsProtocol, ContentNavigationParamsKeys>;
