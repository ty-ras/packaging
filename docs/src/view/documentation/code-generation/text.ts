/* eslint-disable @typescript-eslint/no-duplicate-type-constituents */
import type * as types from "./types";

export interface CodeGenerationContext {
  code: (
    this: void,
    fragments: TemplateStringsArray,
    ...args: Readonly<CodeGenerationFragments>
  ) => types.Code;
}

export type CodeGenerationFragments = Array<CodeGenerationFragment>;

export type CodeGenerationFragment = string | types.Code;

export function getOptionalValueText<T>(
  type: T | undefined | null,
  transform: (type: T) => string,
) {
  return type ? transform(type) : "";
}
