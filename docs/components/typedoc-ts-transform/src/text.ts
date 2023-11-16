import type * as typedoc from "typedoc";
import type * as common from "@typedoc-2-ts/types";

export const createCodeGenerationContext = (
  id?: number,
): CodeGenerationContext => ({
  code: (fragments, ...args) =>
    Array.from(saveCodeTemplateArgs(id, fragments, args)),
});

// eslint-disable-next-line sonarjs/cognitive-complexity
function* saveCodeTemplateArgs(
  declarationId: number | undefined,
  fragments: ReadonlyArray<string>,
  args: Readonly<TemplateStringArgs>,
): Generator<CodeGenerationFragment, void, unknown> {
  for (const [idx, fragment] of fragments.entries()) {
    if (fragment.length > 0) {
      yield {
        declarationId,
        fragment: fragment,
      };
    }
    if (idx < args.length) {
      const arg = args[idx];
      if (Array.isArray(arg)) {
        for (const frag of arg) {
          if (!("fragment" in frag) || frag.fragment.length > 0) {
            yield {
              ...frag,
              declarationId: frag.declarationId ?? declarationId,
            };
          }
        }
      } else if (typeof arg === "object") {
        if (arg === null) {
          // Literal 'null'
          yield {
            declarationId,
            fragment: "null",
          };
        } else {
          if ("text" in arg) {
            // Plain text
            if (arg.text.length > 0) {
              yield {
                declarationId,
                fragment: arg.text,
              };
            }
          } else if ("value" in arg && "negative" in arg) {
            // Bigint literal
            yield {
              declarationId,
              fragment: `${arg.negative ? "-" : ""}${arg.value}n`,
            };
          } else {
            // Type reference
            yield {
              ...arg,
              declarationId: arg.declarationId ?? declarationId,
            };
          }
        }
      } else {
        // Number or boolean literal
        yield {
          declarationId,
          fragment: `${arg}`,
        };
      }
    }
  }
}

export const intermediateToComplete = (
  intermediate: IntermediateCode,
): common.Code => {
  let code = "";
  const typeReferences: common.TypeReferencesInCode = [];
  const declarationRanges: common.DeclarationRangesInCode = {};
  for (const fragment of intermediate) {
    const textFragment =
      "fragment" in fragment ? fragment.fragment : fragment.name;
    const range: common.TokenRange = {
      start: code.length,
      length: textFragment.length,
    };
    code += textFragment;
    const declarationId = fragment.declarationId;
    if (declarationId !== undefined) {
      let ranges = declarationRanges[declarationId];
      if (!ranges) {
        declarationRanges[declarationId] = ranges = [];
      }
      ranges.push(range);
    }
    if ("ref" in fragment) {
      typeReferences.push({
        range,
        ref: fragment.ref,
      });
    }
  }

  Object.values(declarationRanges).forEach(mergeRangesInPlace);

  return {
    code,
    typeReferences,
    declarationRanges,
  };
};

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

export type CodeGenerationFragment =
  | CodeGenerationFragmentText
  | CodeGenerationFragmentRef;

export interface CodeGenerationFragmentBase {
  declarationId?: number;
}
export interface CodeGenerationFragmentRef extends CodeGenerationFragmentBase {
  name: string;
  ref: CodeGenerationTypeRef;
}

export interface CodeGenerationFragmentText extends CodeGenerationFragmentBase {
  fragment: string;
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
      yield { fragment: separator };
    }
    yield* code;
  }
}

const mergeRangesInPlace = (ranges: common.DeclarationRangeInCode) => {
  let idx = 1;
  while (idx < ranges.length) {
    const cur = ranges[idx];
    const prev = ranges[idx - 1];
    if (prev.start + prev.length === cur.start) {
      // Current range starts immediately after previous, can be merged
      ranges.splice(idx, 1);
      prev.length += cur.length;
    } else {
      ++idx;
    }
  }
};
