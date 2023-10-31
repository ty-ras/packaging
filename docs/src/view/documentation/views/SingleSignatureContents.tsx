import { For, Show } from "solid-js";
import type * as typedoc from "typedoc/dist/lib/serialization/schema";
import * as codeGen from "../code-generation";
import Comment from "../components/Comment";
import SignatureDefinition from "../components/SignatureDefinition";
import SmallHeader from "../components/SmallHeader";

export default function SingleSignatureView(props: SingleSignatureViewProps) {
  // TODO: parameters and return value probably would look a lot better if not used with header + content
  // Instead some kind of data grid would be much more compact
  return (
    <>
      <Show when={props.overload}>
        {(overload) => (
          <>
            <SmallHeader headerLevel={props.headerLevel}>
              Overload #{overload().orderNumber}
            </SmallHeader>
            <SignatureDefinition
              signature={props.signature}
              codeGenerator={overload().codeGenerator}
            />
          </>
        )}
      </Show>
      <SmallHeader headerLevel={props.headerLevel}>Summary</SmallHeader>
      <Comment comment={props.signature.comment} />
      <SmallHeader headerLevel={props.headerLevel}>
        Inputs and Outputs
      </SmallHeader>
      <For each={props.signature.parameters}>
        {(parameter) => (
          <>
            <SmallHeader headerLevel={props.headerLevel}>
              Parameter <code>{parameter.name}</code>
            </SmallHeader>
            <Comment comment={parameter.comment ?? NOT_DOCUMENTED} />
          </>
        )}
      </For>
      <SmallHeader headerLevel={props.headerLevel}>Return value</SmallHeader>
      <Comment
        comment={
          props.signature.comment?.blockTags?.find(
            (cTag) => cTag.tag === "@returns",
          )?.content ?? NOT_DOCUMENTED
        }
      />
    </>
  );
}

export interface SingleSignatureViewProps {
  signature: typedoc.SignatureReflection;
  headerLevel: number;
  overload?: SignatureOverloadShowInfo;
}

export interface SignatureOverloadShowInfo {
  orderNumber: number;
  codeGenerator: codeGen.CodeGenerator;
}

const NOT_DOCUMENTED: Array<typedoc.CommentDisplayPart> = [
  { kind: "text", text: "<Not documented>" },
];
