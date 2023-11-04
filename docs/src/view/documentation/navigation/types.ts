import type * as typedoc from "typedoc/dist/lib/serialization/schema";

export interface LinkHrefFunctionality {
  fromReflection: (id: number) => string | undefined;
  fromExternalSymbol: (
    symbol: typedoc.ReflectionSymbolId,
  ) => string | undefined;
  // Only called if fromReflection ort fromExternalSymbol returns non-undefined
  onClick: HandleNavigation;
}

export type HandleNavigation = (info: NavigationInfo) => void;

export interface NavigationInfo {
  // When undefined, the link was to SOME target within same site
  target: TSNavigationInfo | undefined;
  href: string;
}

export type TSNavigationInfo = number | typedoc.ReflectionSymbolId;
