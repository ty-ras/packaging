import { For, Show } from "solid-js";
import { Chip, Stack, Typography } from "@suid/material";
import * as functionality from "../functionality";
import * as codeGen from "../code-generation";
import Title from "../components/Title";
import Comment from "../components/Comment";
import ElementDefinition from "../components/ElementDefinition";

export default function SingleElementView(props: SingleElementViewProps) {
  // Functions, Constructors, and Accessors never have comments directly on them.
  return (
    <>
      <section>
        <Title
          element={props.currentElement.element}
          variant={`h${ensureHeaderLevel(props.headerLevel)}`}
        />
        <Show when={props.showDocKinds}>
          <Stack direction="row" spacing={1}>
            <For each={props.currentElement.allDocKinds}>
              {(docKind) => <Chip label={docKind} />}
            </For>
          </Stack>
        </Show>
      </section>
      <section>
        <Typography variant={`h${ensureHeaderLevel(props.headerLevel)}`}>
          Definition
        </Typography>
        <ElementDefinition
          element={props.currentElement.element}
          codeGenerator={codeGen.createCodeGenerator(
            props.currentElement.globalContext.index,
            props.prettierOptions,
          )}
        />
        <Show when={props.currentElement.element.comment}>
          {(comment) => <Comment comment={comment()} />}
        </Show>
        <For each={props.currentElement.element.signatures}>
          {(signature) => (
            <Show when={signature.comment}>
              {(comment) => <Comment comment={comment()} />}
            </Show>
          )}
        </For>
      </section>
      {
        // Traverse children and invoke itself recursively?
      }
    </>
  );
}

export interface SingleElementViewProps {
  currentElement: functionality.TopLevelElement;
  prettierOptions: codeGen.PrettierOptions;
  headerLevel: number;
  showDocKinds: boolean;
}

const ensureHeaderLevel = (headerLevel: number) =>
  (headerLevel < 1 ? 1 : headerLevel > 6 ? 6 : headerLevel) as
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6;
