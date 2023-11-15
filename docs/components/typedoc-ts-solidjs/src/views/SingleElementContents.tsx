import { For, Match, Show, Switch, type JSX } from "solid-js";
import { Chip, Stack } from "@suid/material";
import * as functionality from "@typedoc-2-ts/browser";
import * as transform from "@typedoc-2-ts/transform";
import Title from "../components/Title";
import Comment from "../components/Comment";
import FormattedCode from "../components/FormattedCode";
import SmallHeader from "../components/SmallHeader";
import SingleSignatureView from "./SingleSignatureContents";

export default function SingleElementView(
  props: SingleElementViewProps,
): JSX.Element {
  // Functions, Constructors, and Accessors never have comments directly on them.
  return (
    <>
      <section>
        <Title element={props.currentElement} headerLevel={props.headerLevel} />
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
        <FormattedCode
          reflection={props.currentElement}
          kind="getDeclarationText"
        />
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
                <SingleElementView
                  currentElement={props.index[childId]}
                  headerLevel={props.headerLevel + 1}
                  index={props.index}
                  docKinds={undefined}
                />
              )}
            </For>
          </section>
        )}
      </For>
    </>
  );
}

export interface SingleElementViewProps {
  currentElement: functionality.IndexableModel;
  headerLevel: number;
  index: functionality.ModelIndex;
  docKinds: ReadonlyArray<string> | undefined;
}

const tryGetSingleSignature = (element: functionality.IndexableModel) =>
  (element.signatures?.length ?? 0) === 1 ? element.signatures![0] : undefined;

const tryGetManySignatures = (element: functionality.IndexableModel) =>
  (element.signatures?.length ?? 0) > 1 ? element.signatures! : undefined;
