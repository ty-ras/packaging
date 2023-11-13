import { type JSX } from "solid-js";
import Typography from "@suid/material/Typography";
import * as functionality from "@typedoc-2-ts/browser";

export default function SmallHeader(props: SmallHeaderProps) {
  return (
    <Typography
      component={`h${functionality.ensureHeaderLevel(props.headerLevel)}`}
      variant={`h${functionality.ensureHeaderLevel(props.headerLevel + 1)}`}
    >
      {props.children}
    </Typography>
  );
}

export interface SmallHeaderProps {
  headerLevel: number;
  children?: JSX.Element;
}
