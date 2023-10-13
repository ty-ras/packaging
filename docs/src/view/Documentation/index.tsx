import { Accessor, createSignal } from "solid-js";
import { Divider, Grid } from "@suid/material";
import type * as types from "./types";
import TopLevelElements from "./TopLevelElements";
import SingleElementContents from "./SingleElementContents";

export type * from "./types";

export default function Documentation(props: DocumentationProps) {
  const [currentElement, setCurrentContent] = createSignal<
    types.TopLevelElement | undefined
  >();
  return (
    <Grid container>
      <Grid item sx={{ maxHeight: "100vh", overflow: "auto" }}>
        <TopLevelElements
          docs={props.docs}
          setCurrentContent={setCurrentContent}
        />
      </Grid>
      <Divider orientation="vertical" flexItem />
      <Grid item xs>
        <SingleElementContents currentElement={currentElement()} />
      </Grid>
    </Grid>
  );
}

export interface DocumentationProps {
  docs: Accessor<Record<string, types.Documentation | undefined>>;
}
