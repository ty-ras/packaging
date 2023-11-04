import { For, Show } from "solid-js";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@suid/material";
import type * as typedoc from "typedoc/dist/lib/serialization/schema";
import * as codeGen from "../code-generation";
import * as functionality from "../functionality";
import Comment from "../components/Comment";
import SingleLineCode from "../components/SingleLineCode";
import FormattedCode from "../components/FormattedCode";
import SmallHeader from "../components/SmallHeader";

export default function SingleSignatureView(props: SingleSignatureViewProps) {
  return (
    <>
      <Show when={props.overloadOrder !== undefined}>
        <SmallHeader headerLevel={props.headerLevel}>
          Overload #{props.overloadOrder}
        </SmallHeader>
        <FormattedCode reflection={props.signature} kind="getSignatureText" />
      </Show>
      <SmallHeader headerLevel={props.headerLevel}>Summary</SmallHeader>
      <Comment comment={props.signature.comment} />
      <SmallHeader headerLevel={props.headerLevel}>Details</SmallHeader>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Summary</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <For each={props.signature.parameters}>
              {(parameter) => (
                <TableRow>
                  <TableCell component="th" scope="row">
                    <SingleLineCode>{parameter.name}</SingleLineCode>
                  </TableCell>
                  <TableCell>
                    <FormattedCode
                      reflection={
                        parameter.type ??
                        functionality.doThrow("Parameter without type")
                      }
                      kind="getTypeText"
                      tokenInfoProcessor={typeTokensProcessor}
                    />
                  </TableCell>
                  <TableCell>
                    <Comment comment={parameter.comment ?? NOT_DOCUMENTED} />
                  </TableCell>
                </TableRow>
              )}
            </For>
            <TableRow>
              <TableCell component="th" scope="row">
                Return value
              </TableCell>
              <TableCell>
                <FormattedCode
                  reflection={
                    props.signature.type ??
                    functionality.doThrow("Signature without return type")
                  }
                  kind="getTypeText"
                  tokenInfoProcessor={typeTokensProcessor}
                />
              </TableCell>
              <TableCell>
                <Comment
                  comment={
                    props.signature.comment?.blockTags?.find(
                      (cTag) => cTag.tag === "@returns",
                    )?.content ?? NOT_DOCUMENTED
                  }
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export interface SingleSignatureViewProps {
  signature: typedoc.SignatureReflection;
  headerLevel: number;
  overloadOrder?: number;
}

const NOT_DOCUMENTED: Array<typedoc.CommentDisplayPart> = [
  { kind: "text", text: "<Not documented>" },
];

const typeTokensProcessor: codeGen.TokenInfoProcessor = (tokenInfos) => {
  let idx = tokenInfos.length - 1;
  while (idx >= 0 && shouldBeDroppedFromEndOfTypeTokens(tokenInfos[idx])) {
    --idx;
  }
  return tokenInfos.slice(0, idx + 1);
};

const shouldBeDroppedFromEndOfTypeTokens = (tokenInfo: codeGen.TokenInfo) =>
  typeof tokenInfo === "string" ||
  (tokenInfo.type === "Punctuator" && tokenInfo.value === ";");
