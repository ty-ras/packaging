import { For, Match, Show, Switch, type JSX } from "solid-js";
import { Chip, Stack } from "@suid/material";
import * as functionality from "../functionality";
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
                      overloadOrder={index()}
                    />
                  </section>
                )}
              </For>
            )}
          </Match>
        </Switch>
      </section>
      {
        // Traverse children and invoke itself recursively?
      }
    </>
  );
}

export interface SingleElementViewProps {
  currentElement: functionality.IndexableModel;
  headerLevel: number;
  docKinds: ReadonlyArray<string> | undefined;
}

const tryGetSingleSignature = (element: functionality.IndexableModel) =>
  (element.signatures?.length ?? 0) === 1 ? element.signatures![0] : undefined;

const tryGetManySignatures = (element: functionality.IndexableModel) =>
  (element.signatures?.length ?? 0) > 1 ? element.signatures! : undefined;
