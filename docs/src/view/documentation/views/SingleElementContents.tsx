import { For, Show } from "solid-js";
import type * as types from "../functionality";
import Title from "../components/Title";
import Comment from "../components/Comment";
import ElementDefinition from "../components/ElementDefinition";
import { Typography } from "@suid/material";

export default function SingleElementView(props: SingleElementViewProps) {
  // <Title/>
  // <Show when={element.comment}><Summary source={element.comment.summary} /></Show>
  // <For items={element.signatures} />
  //   <SignatureHeader />
  //   <Summary />
  //   <SignatureContents />
  // </For>
  // <For items={children} />
  //   <SingleElementView currentElement={child} /> or maybe dedicated ChildElementView ? might need to decrease header-level for children
  // </For>
  return (
    <>
      <section>
        <Title element={props.currentElement.element} variant="h3" />
        <Show when={props.currentElement.element.comment}>
          {(comment) => <Comment comment={comment()} />}
        </Show>
      </section>
      <section>
        <Typography variant="h3">Definition</Typography>
        <For
          each={props.currentElement.element.signatures}
          fallback={
            <ElementDefinition element={props.currentElement.element} />
          }
        >
          {(signature) => (
            <Show when={signature.comment}>
              {(comment) => <Comment comment={comment()} />}
            </Show>
          )}
        </For>
      </section>
    </>
  );
}

export interface SingleElementViewProps {
  currentElement: types.TopLevelElement;
}
