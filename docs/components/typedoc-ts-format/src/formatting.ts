import { type TSESTree } from "@typescript-eslint/types";
import prettier from "prettier/standalone";
import estree from "prettier/plugins/estree";
import typescript from "prettier/plugins/typescript";
import { Throw } from "throw-expression";
import type * as common from "@typedoc-2-ts/types";
import type * as types from "./formatting.types";
import { diffArrays, type ArrayChange } from "diff";

export const formatCode = async ({
  code,
  prettierOptions,
  onTokenInconsistency,
}: types.CodeFormattingArgs): Promise<types.CodeFormattingResult> => {
  const formattedCode = await prettier.format(code.code, {
    ...prettierOptions,
    parser: "typescript",
    plugins: [estree, typescript],
  });
  return fixTypeReferences(code, formattedCode, onTokenInconsistency);
};

const fixTypeReferences = (
  { code: originalCode, typeReferences, declarationRanges }: common.Code,
  formattedCode: string,
  onTokenInconsistency: types.OnTokenInconsistency | undefined,
  // eslint-disable-next-line sonarjs/cognitive-complexity
): types.CodeFormattingResult => {
  // Find out which tokens are the ones which are type refs
  const originalTokens = getTSTokens(originalCode);
  const typeRefTokenInfos: Array<TokenIndexAndTypeRef> = [];
  let curTypeRefIdx = 0;
  for (const [tokenIdx, token] of originalTokens.entries()) {
    if (token.type === "Identifier" && curTypeRefIdx < typeReferences.length) {
      const {
        range: { start: refStart, length: refLength },
        ref,
      } = typeReferences[curTypeRefIdx];
      const [tokenStart, tokenEnd] = token.range;
      if (refStart === tokenStart) {
        if (refStart + refLength !== tokenEnd) {
          onTokenInconsistency?.({
            typeReference: { start: refStart, length: refLength },
            token: { start: tokenStart, length: tokenEnd - tokenStart },
          });
        }
        typeRefTokenInfos.push({ tokenIndex: tokenIdx, typeRef: ref });
        ++curTypeRefIdx;
      }
    }
  }

  const codeDiff = diffArrays(originalCode.split(""), formattedCode.split(""));
  declarationRanges = Object.entries(declarationRanges).reduce<
    typeof declarationRanges
  >((newDeclarationRanges, [id, ranges]) => {
    // Using parseInt is a bit silly but using `as` is maybe more dangerous
    newDeclarationRanges[parseInt(id)] = ranges.reduce<typeof ranges>(
      (newRanges, { start, length }) => {
        const diffIndices: DiffIndices = {
          diffIdx: 0,
          originalIdx: 0,
          formattedIdx: 0,
        };
        const subtractFromStringIndices = advanceDiffIndices(
          codeDiff,
          start,
          diffIndices,
        );
        const newStart = diffIndices.formattedIdx;
        advanceDiffIndices(
          codeDiff,
          start + length,
          diffIndices,
          subtractFromStringIndices,
        );
        newRanges.push({
          start: newStart,
          length: diffIndices.formattedIdx - newStart,
        });

        return newRanges;
      },
      [],
    );
    return newDeclarationRanges;
  }, {});

  return {
    declarationRanges,
    tokens: Array.from(
      constructTokenInfoArray(
        originalTokens,
        typeRefTokenInfos,
        formattedCode,
        getTSTokens(formattedCode),
      ),
    ),
  };
};

const getTSTokens = (code: string) =>
  (
    typescript.parsers.typescript.parse(
      code,
      // Options are not used for anything useful for us
      // See https://github.com/prettier/prettier/blob/main/src/language-js/parse/typescript.js
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
      undefined as any,
    ) as TSESTree.Program
  ).tokens ?? Throw("Parsed TS program without tokens?");

interface TokenIndexAndTypeRef {
  tokenIndex: number;
  typeRef: common.CodeGenerationTypeRef;
}

const ensureIdentifierToken = (
  token: TSESTree.Token,
): TSESTree.IdentifierToken => {
  if (token.type !== "Identifier") {
    throw new Error("Not identifier token when expected one");
  }
  return token;
};

// eslint-disable-next-line sonarjs/cognitive-complexity
function* constructTokenInfoArray(
  originalCodeTokens: TSESTokens,
  typeRefTokenInfos: ReadonlyArray<TokenIndexAndTypeRef>,
  formattedCode: string,
  formattedCodeTokens: TSESTokens,
): Generator<types.TokenInfo, void, unknown> {
  let prevIndex = 0;
  let originalCodeTokenIndex = 0; // Index to originalCodeTokens
  let typeRefTokenInfoIndex = 0; // Index to typeRefTokenInfos
  for (const token of formattedCodeTokens) {
    const {
      range: [start, end],
    } = token;
    if (start > prevIndex) {
      yield {
        text: formattedCode.substring(prevIndex, start),
      };
    }

    // We exploit the two facts:
    // - formatting the code never breaks the identifier tokens which are type references, and
    // - the type reference tokens always will come in same order
    const startingTypeRefTokenInfoIndex = typeRefTokenInfoIndex;
    if (typeRefTokenInfoIndex < typeRefTokenInfos.length) {
      const originalToken = originalCodeTokens[originalCodeTokenIndex];
      if (
        originalToken.type === token.type &&
        originalToken.value === token.value
      ) {
        // We found the matching token, now check if it is type reference
        const { tokenIndex: typeRefTokenIndex, typeRef } =
          typeRefTokenInfos[typeRefTokenInfoIndex];
        if (originalCodeTokenIndex === typeRefTokenIndex) {
          yield {
            token: ensureIdentifierToken(token),
            typeRef,
          };
          ++typeRefTokenInfoIndex;
        }
        // Advance original token index
        ++originalCodeTokenIndex;
      }
    }

    if (startingTypeRefTokenInfoIndex === typeRefTokenInfoIndex) {
      yield {
        token,
      };
    }
    prevIndex = end; // The end of the token range is exclusive
  }
  if (prevIndex < formattedCode.length) {
    yield {
      text: formattedCode.substring(prevIndex),
    };
  }
}

type TSESTokens = ReadonlyArray<TSESTree.Token>;

interface DiffIndices {
  diffIdx: number;
  originalIdx: number;
  formattedIdx: number;
}
const advanceDiffIndices = (
  codeDiff: ReadonlyArray<ArrayChange<string>>,
  originalEnd: number,
  indices: DiffIndices,
  subtractFromStringIndices = 0,
  // eslint-disable-next-line sonarjs/cognitive-complexity
) => {
  if (subtractFromStringIndices > 0) {
    indices.formattedIdx -= subtractFromStringIndices;
    indices.originalIdx -= subtractFromStringIndices;
  }
  do {
    const curDiff = codeDiff[indices.diffIdx];
    if (curDiff) {
      const startOriginal = indices.originalIdx;
      const { count, added, removed } = curDiff;
      if (added && removed) {
        throw new Error("Diff which is both added and removed?");
      } else if (count === undefined) {
        throw new Error("Diff item with undefined count?");
      }
      if (added) {
        indices.formattedIdx += count;
      } else if (removed) {
        indices.originalIdx += count;
      } else {
        indices.formattedIdx += count;
        indices.originalIdx += count;
      }

      if (indices.originalIdx > originalEnd) {
        indices.formattedIdx -= indices.originalIdx - originalEnd;
        indices.originalIdx = originalEnd;
        subtractFromStringIndices = originalEnd - startOriginal;
      } else {
        ++indices.diffIdx;
      }
    } else {
      // No more diff information
      subtractFromStringIndices = 0;
      indices.formattedIdx += originalEnd - indices.originalIdx;
      indices.originalIdx = originalEnd;
    }
  } while (indices.originalIdx !== originalEnd);

  return subtractFromStringIndices;
};
