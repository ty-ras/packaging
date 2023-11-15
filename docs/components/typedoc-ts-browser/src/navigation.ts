import type * as typedoc from "typedoc";
import type * as types from "./types";

export interface LinkFunctionality {
  fromReflection: (
    context: LinkContext,
    id: number,
  ) => InternalLinkInfo | undefined;
  fromExternalSymbol: (
    symbol: typedoc.JSONOutput.ReflectionSymbolId,
  ) => ExternalLinkInfo | undefined;
  // Only called if fromReflection ort fromExternalSymbol returns non-undefined
  onClick: HandleNavigation;
}

export interface InternalLinkInfo {
  href: string;
  text: string;
}

export interface ExternalLinkInfo {
  href: string;
}

export type LinkContext = types.IndexableModel;

export type HandleNavigation = (info: NavigationInfo) => void;

export interface NavigationInfo {
  context: LinkContext;
  // When undefined, the link was to SOME target within same site
  target: number | undefined;
  href: string;
}
