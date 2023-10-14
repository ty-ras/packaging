import { Typography } from "@suid/material";
import type * as types from "../functionality";

export default function SingleElementView(props: SingleElementViewProps) {
  return (
    <Typography>
      {JSON.stringify(props.currentElement?.element ?? {}, undefined, 2)}
    </Typography>
  );
}

export interface SingleElementViewProps {
  currentElement: types.TopLevelElement | undefined;
}
