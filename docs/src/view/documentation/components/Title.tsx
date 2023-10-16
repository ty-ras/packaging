import { Typography } from "@suid/material";
import type * as types from "./types";
import * as functionality from "../functionality";

export default function Title(props: TitleProps) {
  return (
    // <Box sx={{ overflow: "hidden", textOverflow: "ellipsis", width: "auto" }}>
    <Typography variant={props.variant}>
      {functionality.getReflectionKindTitle(props.element.kind)}{" "}
      {props.element.name}
    </Typography>
    // </Box>
  );
}

export interface TitleProps extends types.ReflectionElementProps {
  variant: Parameters<typeof Typography>[0]["variant"];
}
