import { Typography } from "@suid/material";
import { For, Match, Switch } from "solid-js";
import type * as typedoc from "typedoc/dist/lib/serialization/schema";

export default function Comment(props: CommentProps) {
  // TODO multi-line code blocks might need breaking props.comment.summary into multiple arrays, each being its own <p>aragraph.
  return (
    <Typography>
      <For each={props.comment.summary}>
        {(summary) => (
          <Switch
            fallback={
              <Typography component="span" color="red">
                Unknown comment fragment kind.
              </Typography>
            }
          >
            <Match when={tryGetText(summary)}>
              {(summaryText) => (
                <Typography component="span">{summaryText().text}</Typography>
              )}
            </Match>
            <Match when={tryGetCode(summary)}>
              {(summaryCode) => (
                <Typography
                  component="code"
                  fontFamily="monospace"
                  sx={{
                    backgroundColor: "grey.200",
                  }}
                >
                  {
                    // Typedoc leaves the backtick characters in the string, we probably want to detect the ```-case and use multiline <pre> in this case.
                    indexTrim(summaryCode().text, "`")
                  }
                </Typography>
              )}
            </Match>
            <Match when={tryGetLink(summary)}>
              {(summaryLink) => (
                <Typography component="span">{`{@link ${
                  summaryLink().target
                }}`}</Typography>
              )}
            </Match>
          </Switch>
        )}
      </For>
    </Typography>
  );
}

export interface CommentProps {
  comment: typedoc.Comment;
}

const tryGetText = (summary: typedoc.CommentDisplayPart) =>
  summary.kind === "text" ? summary : undefined;

const tryGetCode = (summary: typedoc.CommentDisplayPart) =>
  summary.kind === "code" ? summary : undefined;

const tryGetLink = (summary: typedoc.CommentDisplayPart) =>
  summary.kind === "inline-tag" ? summary : undefined;

// From https://www.measurethat.net/Benchmarks/Show/12738/0/trimming-leadingtrailing-characters
// Sad that JS standard library still does not have this, instead .trim methods are all only whitespace-oriented
function indexTrim(str: string, ch: string) {
  let start = 0,
    end = str.length;

  while (start < end && str[start] === ch) ++start;

  while (end > start && str[end - 1] === ch) --end;

  return start > 0 || end < str.length ? str.substring(start, end) : str;
}
