import { Typography } from "@suid/material";
import { For, Match, Show, Switch } from "solid-js";
import type * as typedoc from "typedoc/dist/lib/serialization/schema";
import type * as types from "./types";
import SingleLineCode from "./SingleLineCode";
import Link from "./Link";

export default function Comment(props: CommentProps) {
  // TODO multi-line code blocks might need breaking props.comment.summary into multiple arrays, each being its own <p>aragraph.
  return (
    <Show when={props.comment}>
      {(comment) => (
        <Typography>
          <For each={getDisplayParts(comment())}>
            {(summary) => (
              <Switch
                fallback={
                  <Typography component="span" color="red">
                    Unknown comment fragment kind {JSON.stringify(summary)}.
                  </Typography>
                }
              >
                <Match when={tryGetText(summary)}>
                  {(summaryText) => (
                    <Typography component="span">
                      {summaryText().text}
                    </Typography>
                  )}
                </Match>
                <Match when={tryGetCode(summary)}>
                  {(summaryCode) => (
                    <SingleLineCode>
                      {
                        // Typedoc leaves the backtick characters in the string, we probably want to detect the ```-case and use multiline <pre> in this case.
                        indexTrim(summaryCode().text, "`")
                      }
                    </SingleLineCode>
                  )}
                </Match>
                <Match when={tryGetLink(summary)}>
                  {(summaryLink) => (
                    <Typography component="span">
                      <Link target={summaryLink()} />
                    </Typography>
                  )}
                </Match>
              </Switch>
            )}
          </For>
        </Typography>
      )}
    </Show>
  );
}

export interface CommentProps {
  comment: typedoc.Comment | Array<typedoc.CommentDisplayPart> | undefined;
}

const tryGetText = (summary: typedoc.CommentDisplayPart) =>
  summary.kind === "text" ? summary : undefined;

const tryGetCode = (summary: typedoc.CommentDisplayPart) =>
  summary.kind === "code" ? summary : undefined;

const tryGetLink = ({
  text,
  ...summary
}: typedoc.CommentDisplayPart): types.InlineLink | undefined =>
  summary.kind === "inline-tag" && !!summary.target
    ? {
        text:
          (typeof summary.target === "object"
            ? summary.target.qualifiedName
            : undefined) ?? text,
        target: summary.target,
      }
    : undefined;

// From https://www.measurethat.net/Benchmarks/Show/12738/0/trimming-leadingtrailing-characters
// Sad that JS standard library still does not have this, instead .trim methods are all only whitespace-oriented
function indexTrim(str: string, ch: string) {
  let start = 0,
    end = str.length;

  while (start < end && str[start] === ch) ++start;

  while (end > start && str[end - 1] === ch) --end;

  return start > 0 || end < str.length ? str.substring(start, end) : str;
}

const getDisplayParts = (
  comment: Exclude<CommentProps["comment"], undefined>,
) => (Array.isArray(comment) ? comment : comment.summary);
