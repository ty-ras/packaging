import { Typography } from "@suid/material";
import type * as types from "./types";

export default function SingleElementView(props: SingleElementViewProps) {
  return (
    <Typography>
      {JSON.stringify(props.currentElement ?? {}, undefined, 2)}
    </Typography>
  );
}

export interface SingleElementViewProps {
  currentElement: types.TopLevelElement | undefined;
}
