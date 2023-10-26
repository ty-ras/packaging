import { For, Show } from "solid-js";
import { Typography } from "@suid/material";
import * as functionality from "../functionality";
import * as codeGen from "../code-generation";
import Title from "../components/Title";
import Comment from "../components/Comment";
import ElementDefinition from "../components/ElementDefinition";

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
              codeGenerator={codeGen.createCodeGenerator(
                props.currentElement.globalContext.index,
                props.prettierOptions,
              )}
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
  currentElement: functionality.TopLevelElement;
  prettierOptions: codeGen.PrettierOptions;
  headerLevel: 1 | 2 | 3 | 4 | 5 | 6;
}
