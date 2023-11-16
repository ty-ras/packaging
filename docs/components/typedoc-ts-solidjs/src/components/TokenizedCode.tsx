import { For, useContext } from "solid-js";
import linkContextContextDef from "../context-def/link-context";
import MultiLineCode from "./MultiLineCode";
import type * as formatter from "@typedoc-2-ts/format";
import Link from "./Link";

export default function TokenizedCode(props: TokenizedCodeProps) {
  const linkContextContext = useContext(linkContextContextDef);

  return (
    <MultiLineCode>
      <For each={props.tokens}>
        {(token) =>
          "text" in token ? (
            token.text
          ) : "typeRef" in token ? (
            <Link
              linkContext={linkContextContext.linkContext()}
              target={{ text: token.token.value, target: token.typeRef }}
            />
          ) : token.token.type !== "Keyword" ? (
            token.token.value
          ) : (
            <b>{token.token.value}</b>
          )
        }
      </For>
    </MultiLineCode>
  );
}

export interface TokenizedCodeProps {
  tokens: formatter.TokenInfos;
}
