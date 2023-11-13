import type * as typedoc from "typedoc/dist/lib/serialization/schema";
import type * as functionality from "@typedoc-2-ts/browser";

export interface ReflectionElementProps {
  element: Element;
}

export type Element = functionality.IndexableModel;

export interface InlineLink {
  text: string;
  target: InlineLinkTarget;
}

export type InlineLinkTarget = Exclude<
  typedoc.InlineTagDisplayPart["target"],
  undefined
>;
