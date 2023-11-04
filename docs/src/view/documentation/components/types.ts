import type * as typedoc from "typedoc/dist/lib/serialization/schema";
import type * as functionality from "../functionality";

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
