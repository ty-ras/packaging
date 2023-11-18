import {
  For,
  Match,
  Show,
  Switch,
  type JSX,
  createResource,
  useContext,
  onMount,
  ErrorBoundary,
} from "solid-js";
import { Box, Button, Chip, Stack, Typography } from "@suid/material";
import * as functionality from "@typedoc-2-ts/browser";
import * as transform from "@typedoc-2-ts/transform";
import type * as formatter from "@typedoc-2-ts/format";
import type * as common from "@typedoc-2-ts/types";
import codeContextDef from "../context-def/code-functionality";
import Comment from "../components/Comment";
import SmallHeader from "../components/SmallHeader";
import SingleSignatureView, { NOT_DOCUMENTED } from "./SingleSignatureContents";
import * as formatting from "../formatting";
import TokenizedCode from "../components/TokenizedCode";
import { CODE_SX_PROPS } from "../components/SingleLineCode";

export default function SingleElementView(
  props: SingleElementViewProps,
): JSX.Element {
  const codeContext = useContext(codeContextDef);
  const [formattedCode] = createResource(
    () => props.topLevelElement,
    async (reflection) =>
      await formatting.formatCodeAsync(
        codeContext,
        "getDeclarationText",
        reflection,
        undefined,
      ),
  );
  return (
    <ErrorBoundary
      fallback={(err, reset) =>
        (
          // eslint-disable-next-line no-console
          console.error("SingleElementView", err),
          (
            <Box>
              <Typography>
                Failed to generate type for {props.topLevelElement?.name} (ID{" "}
                {props.topLevelElement?.id}).
              </Typography>
              <Button onClick={reset}>Reload</Button>
            </Box>
          )
        )
      }
    >
      <SingleElementViewForTokens
        headerLevel={props.headerLevel}
        topLevelElement={props.topLevelElement}
        docKinds={props.docKinds}
        focusToChild={props.focusToChild}
        titlePrefix={`${getReflectionKindTypeScriptName(
          props.topLevelElement.kind,
        )} `}
        index={props.index}
        formattedCode={formattedCode()}
      />
    </ErrorBoundary>
  );
}

export interface SingleElementViewProps {
  headerLevel: number;
  index: functionality.ModelIndex;
  docKinds: ReadonlyArray<string> | undefined;
  topLevelElement: functionality.IndexableModel;
  focusToChild: number | undefined;
}

const tryGetSingleSignature = (element: functionality.IndexableModel) =>
  (element.signatures?.length ?? 0) === 1 ? element.signatures![0] : undefined;

const tryGetManySignatures = (element: functionality.IndexableModel) =>
  (element.signatures?.length ?? 0) > 1 ? element.signatures! : undefined;

function SingleElementViewForTokens(
  props: SingleElementViewForTokensProps,
): JSX.Element {
  let refElement: HTMLHeadingElement | undefined;
  onMount(() => {
    if (
      props.focusToChild !== undefined &&
      props.focusToChild === props.topLevelElement.id
    ) {
      refElement?.scrollIntoView();
    }
  });
  return (
    <>
      <section>
        <SmallHeader ref={refElement} headerLevel={props.headerLevel}>
          {props.titlePrefix}
          <Box
            component="code"
            sx={CODE_SX_PROPS}
            // variant={`h${functionality.ensureHeaderLevel(props.headerLevel)}`}
            // fontSize="1rem"
          >
            {props.topLevelElement.name}
          </Box>
        </SmallHeader>
        <Show when={props.docKinds}>
          {(docKinds) => (
            <Stack direction="row" spacing={1}>
              <For each={docKinds()}>
                {(docKind) => <Chip label={docKind} />}
              </For>
            </Stack>
          )}
        </Show>
      </section>
      <section>
        <SmallHeader headerLevel={props.headerLevel}>Definition</SmallHeader>
        <Show when={props.formattedCode}>
          {(theCode) => <TokenizedCode tokens={theCode().tokens} />}
        </Show>
        <Switch
          fallback={
            <>
              <SmallHeader headerLevel={props.headerLevel}>Summary</SmallHeader>
              <Comment
                comment={props.topLevelElement.comment ?? NOT_DOCUMENTED}
              />
            </>
          }
        >
          <Match when={tryGetSingleSignature(props.topLevelElement)}>
            {(signature) => (
              <SingleSignatureView
                signature={signature()}
                headerLevel={props.headerLevel}
              />
            )}
          </Match>
          <Match when={tryGetManySignatures(props.topLevelElement)}>
            {(signatures) => (
              <For each={signatures()}>
                {(signature, index) => (
                  <section>
                    <SingleSignatureView
                      signature={signature}
                      headerLevel={props.headerLevel}
                      overloadOrder={index() + 1}
                    />
                  </section>
                )}
              </For>
            )}
          </Match>
        </Switch>
      </section>

      <For
        each={transform.getDeclarationChildren({
          declaration: props.topLevelElement,
          index: (id) => props.index[id],
        })}
      >
        {(groupInfo) => (
          <section>
            <SmallHeader headerLevel={props.headerLevel}>
              {groupInfo.groupName}
            </SmallHeader>
            <For each={groupInfo.sortedChildren}>
              {(childId) => (
                <SingleElementViewForTokens
                  index={props.index}
                  focusToChild={props.focusToChild}
                  headerLevel={props.headerLevel + 1}
                  topLevelElement={props.index[childId]}
                  titlePrefix=""
                  docKinds={undefined}
                  formattedCode={{
                    declarationRanges:
                      props.formattedCode?.declarationRanges ?? {},
                    tokens: props.formattedCode
                      ? getTokensForDeclaration(
                          props.formattedCode.tokens,
                          props.formattedCode.declarationRanges[childId],
                        )
                      : [],
                  }}
                />
              )}
            </For>
          </section>
        )}
      </For>
    </>
  );
}

interface SingleElementViewForTokensProps extends SingleElementViewProps {
  formattedCode: formatter.CodeFormattingResult | undefined;
  titlePrefix: string;
}

const getTokensForDeclaration = (
  tokens: formatter.TokenInfos,
  ranges: common.DeclarationRangeInCode | undefined,
) => {
  return ranges && ranges.length > 0
    ? buildTokensForRanges(tokens, ranges)
    : [];
};

const getReflectionKindTypeScriptName = (
  reflectionKind: transform.ReflectionKind,
): string => {
  switch (reflectionKind) {
    case transform.ReflectionKind.Enum:
      return "enum";
    case transform.ReflectionKind.Variable:
      return "const";
    case transform.ReflectionKind.Function:
      return "function";
    case transform.ReflectionKind.Class:
      return "class";
    case transform.ReflectionKind.Interface:
      return "interface";
    case transform.ReflectionKind.Constructor:
      return "constructor";
    case transform.ReflectionKind.Property:
      return "property";
    case transform.ReflectionKind.Method:
      return "method";
    default:
      throw new Error(`Implement TS name for ${reflectionKind}.`);
  }
};

const buildTokensForRanges = (
  tokens: formatter.TokenInfos,
  ranges: common.DeclarationRangeInCode,
) => {
  let stringIdx = 0;
  let rangeIdx = 0;
  let prevIsInsideRange = false;
  const tokensForRanges = new Array<formatter.TokenInfos>(ranges.length).fill(
    [],
  );
  tokens.forEach((token) => {
    if (rangeIdx < ranges.length) {
      const range = ranges[rangeIdx];
      const [start, end] =
        "token" in token
          ? token.token.range
          : [stringIdx, stringIdx + token.text.length];
      const isInsideRange =
        start >= range.start && end <= range.start + range.length;

      if (isInsideRange) {
        tokensForRanges[rangeIdx].push(token);
      } else if (prevIsInsideRange) {
        ++rangeIdx;
      }
      prevIsInsideRange = isInsideRange;
      stringIdx = end;
    }
  });

  // Remove all leading and trailing pure-string tokens for each range
  return tokensForRanges.flatMap(trimLeadingAndTrailingTextTokens);
};

const trimLeadingAndTrailingTextTokens = (
  tokensForOneRange: formatter.TokenInfos,
): formatter.TokenInfos => {
  let idx = 0;
  while (idx < tokensForOneRange.length && "text" in tokensForOneRange[idx]) {
    ++idx;
  }
  if (idx > 0) {
    tokensForOneRange.splice(0, idx);
  }
  if (tokensForOneRange.length > 0) {
    idx = tokensForOneRange.length - 1;
    while (idx >= 0 && "text" in tokensForOneRange[idx]) {
      --idx;
    }
    tokensForOneRange.splice(idx + 1);
  }
  return tokensForOneRange;
};
