import type * as structure from "../structure";

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

export type ContentNavigationParams =
  | Pick<structure.DocumentationParamsServer, ContentNavigationParamsKeys>
  | Pick<structure.DocumentationParamsClient, ContentNavigationParamsKeys>
  | Pick<
      structure.DocumentationParamsServerAndClient,
      ContentNavigationParamsKeys
    >
  | Pick<structure.DocumentationParamsProtocol, ContentNavigationParamsKeys>;
