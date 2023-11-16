import {
  For,
  Match,
  Show,
  Switch,
  type JSX,
  createResource,
  useContext,
} from "solid-js";
import { Chip, Stack } from "@suid/material";
import * as functionality from "@typedoc-2-ts/browser";
import * as transform from "@typedoc-2-ts/transform";
import type * as formatter from "@typedoc-2-ts/format";
import type * as common from "@typedoc-2-ts/types";
import codeContextDef from "../context-def/code-functionality";
import Comment from "../components/Comment";
import SmallHeader from "../components/SmallHeader";
import SingleSignatureView from "./SingleSignatureContents";
import * as formatting from "../formatting";
import TokenizedCode from "../components/TokenizedCode";

export default function SingleElementView(
  props: SingleElementViewProps,
): JSX.Element {
  const codeContext = useContext(codeContextDef);
  const [formattedCode] = createResource(
    () => props.currentElement,
    async (reflection) =>
      await formatting.formatCodeAsync(
        codeContext,
        "getDeclarationText",
        reflection,
        undefined,
      ),
  );
  return (
    <SingleElementViewForTokens
      headerLevel={props.headerLevel}
      titlePrefix={`${getReflectionKindTypeScriptName(
        props.currentElement.kind,
      )} `}
      index={props.index}
      currentElement={props.currentElement}
      docKinds={props.docKinds}
      formattedCode={formattedCode()}
    />
  );
}

export interface SingleElementViewProps {
  headerLevel: number;
  index: functionality.ModelIndex;
  docKinds: ReadonlyArray<string> | undefined;
  currentElement: functionality.IndexableModel;
}

const tryGetSingleSignature = (element: functionality.IndexableModel) =>
  (element.signatures?.length ?? 0) === 1 ? element.signatures![0] : undefined;

const tryGetManySignatures = (element: functionality.IndexableModel) =>
  (element.signatures?.length ?? 0) > 1 ? element.signatures! : undefined;

function SingleElementViewForTokens(
  props: SingleElementViewForTokensProps,
): JSX.Element {
  return (
    <>
      <section>
        <SmallHeader headerLevel={props.headerLevel}>
          {props.titlePrefix}
          <code>{props.currentElement.name}</code>
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
        <Switch>
          <Match when={props.currentElement.comment}>
            {(summary) => (
              <>
                <SmallHeader headerLevel={props.headerLevel}>
                  Summary
                </SmallHeader>
                <Comment comment={summary()} />
              </>
            )}
          </Match>
          <Match when={tryGetSingleSignature(props.currentElement)}>
            {(signature) => (
              <SingleSignatureView
                signature={signature()}
                headerLevel={props.headerLevel}
              />
            )}
          </Match>
          <Match when={tryGetManySignatures(props.currentElement)}>
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
      <Show when={props.formattedCode}>
        {(theCode) => (
          <For
            each={transform.getDeclarationChildren({
              declaration: props.currentElement,
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
                      currentElement={props.index[childId]}
                      titlePrefix=""
                      headerLevel={props.headerLevel + 1}
                      index={props.index}
                      docKinds={undefined}
                      formattedCode={{
                        declarationRanges: theCode().declarationRanges,
                        tokens: getTokensForDeclaration(
                          theCode().tokens,
                          theCode().declarationRanges[childId],
                        ),
                      }}
                    />
                  )}
                </For>
              </section>
            )}
          </For>
        )}
      </Show>
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
  if (ranges) {
    let rangeIdx = 0;
    let isInsideRange = false;
    tokens = tokens.filter((token) => {
      if (rangeIdx < ranges.length && "token" in token) {
        const range = ranges[rangeIdx];
        const [start, end] = token.token.range;
        isInsideRange =
          start >= range.start && end <= range.start + range.length;
        if (!isInsideRange && start > range.start + range.length) {
          ++rangeIdx;
        }
      }
      return isInsideRange;
    });
  } else {
    tokens = [];
  }
  return tokens;
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
