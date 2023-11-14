import type * as typedoc from "typedoc";

export interface CodeGenerationContext {
  code: (
    this: void,
    fragments: TemplateStringsArray,
    ...args: Readonly<TemplateStringArgs>
  ) => IntermediateCode;
}

export type IntermediateCode = Array<CodeGenerationFragment>;

/**
 * This type purposefully misses "string".
 * The reason is that otherwise it is too easy to make accidental mistakes like ``code`prefix${children.map(getOtherIntermediateCode).join(", ")}suffix`;``, where we the result of `.join` would lose type reference information.
 */
export type TemplateStringArgs = Array<
  // Literals except string
  | LiteralValue
  // String literal wrapped
  | JustText
  // Reference to a type
  | CodeGenerationFragmentRef
  // Result of other code`...` invocation
  | IntermediateCode
>;

export type LiteralValue = Exclude<
  typedoc.JSONOutput.LiteralType["value"],
  string
>;

export type CodeGenerationFragment = string | CodeGenerationFragmentRef;

export interface CodeGenerationFragmentRef {
  name: string;
  ref: CodeGenerationTypeRef;
}

export type CodeGenerationTypeRef =
  | number
  | typedoc.JSONOutput.ReflectionSymbolId;

export interface JustText {
  text: string;
}

export function getOptionalValueText<T>(
  type: T | undefined | null,
  transform: (type: T) => IntermediateCode,
) {
  return type ? transform(type) : [];
}

export const text = (str: string): JustText => ({ text: str });

export const ref = (
  name: string,
  id: CodeGenerationFragmentRef["ref"],
): CodeGenerationFragmentRef => ({ name, ref: id });

export const join = (
  codes: ReadonlyArray<IntermediateCode>,
  separator: string,
): IntermediateCode => Array.from(joinImpl(codes, separator));

function* joinImpl(
  codes: ReadonlyArray<IntermediateCode>,
  separator: string,
): Generator<IntermediateCode[number], void, undefined> {
  for (const [idx, code] of codes.entries()) {
    if (idx > 0) {
      yield separator;
    }
    yield* code;
  }
}
