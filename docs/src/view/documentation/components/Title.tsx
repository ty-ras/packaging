import { Typography } from "@suid/material";
import type * as types from "./types";
import * as functionality from "../functionality";

export default function Title(props: TitleProps) {
  return (
    <Typography variant="h1">
      {functionality.getReflectionKindTitle(props.element.kind)}{" "}
      {props.element.name}
    </Typography>
  );
}

export interface TitleProps extends types.ReflectionElementProps {
  // No additional properties yet
}
