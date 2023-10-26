import { For, Show } from "solid-js";
import * as types from "../functionality";
import Title from "../components/Title";
import Comment from "../components/Comment";
import ElementDefinition from "../components/ElementDefinition";
import { Typography } from "@suid/material";

export default function SingleElementView(props: SingleElementViewProps) {
  return (
    <>
      <section>
        <Title
          element={props.currentElement.element}
          variant={`h${props.headerLevel}`}
        />
        <Show when={props.currentElement.element.comment}>
          {(comment) => <Comment comment={comment()} />}
        </Show>
      </section>
      <section>
        <Typography variant={`h${props.headerLevel}`}>Definition</Typography>
        <For
          each={props.currentElement.element.signatures}
          fallback={
            <ElementDefinition
              element={props.currentElement.element}
              codeGenerator={props.currentElement.globalContext.codeGenerator}
            />
          }
        >
          {(signature) => (
            <Show when={signature.comment}>
              {(comment) => <Comment comment={comment()} />}
            </Show>
          )}
        </For>
        {
          // Traverse children and invoke itself recursively?
        }
      </section>
    </>
  );
}

export interface SingleElementViewProps {
  currentElement: types.TopLevelElement;
  headerLevel: 1 | 2 | 3 | 4 | 5 | 6;
}
