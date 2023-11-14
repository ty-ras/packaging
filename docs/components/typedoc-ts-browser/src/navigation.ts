import type * as typedoc from "typedoc";
import type * as types from "./types";

export interface LinkHrefFunctionality {
  fromReflection: (context: LinkContext, id: number) => string | undefined;
  fromExternalSymbol: (
    symbol: typedoc.JSONOutput.ReflectionSymbolId,
  ) => string | undefined;
  // Only called if fromReflection ort fromExternalSymbol returns non-undefined
  onClick: HandleNavigation;
}

export type LinkContext = types.IndexableModel;

export type HandleNavigation = (info: NavigationInfo) => void;

export interface NavigationInfo {
  context: LinkContext;
  // When undefined, the link was to SOME target within same site
  target: number | undefined;
  href: string;
}
