import { For, Show } from "solid-js";
import { Chip, Stack, Typography } from "@suid/material";
import type * as typedoc from "typedoc/dist/lib/serialization/schema";
import * as functionality from "../functionality";
import * as codeGen from "../code-generation";
import Title from "../components/Title";
import Comment from "../components/Comment";
import ElementDefinition from "../components/ElementDefinition";

export default function SingleSignatureView(props: SingleSignatureViewProps) {
  // TODO before comment, if so specified
  // - header "Overload #x"
  // - SignatureDefinition
  // TODO after comment:
  // - parameters (including header)
  // - return type
  return (
    <Show when={props.signature.comment}>
      {(comment) => <Comment comment={comment()} />}
    </Show>
  );
}

export interface SingleSignatureViewProps {
  signature: typedoc.SignatureReflection;
}
