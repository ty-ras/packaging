import { Typography } from "@suid/material";
import type * as types from "../functionality";

export default function SingleElementView(props: SingleElementViewProps) {
  // <Title/>
  // <For items={signatures ?? generateSignatures(element)} />
  //   <SignatureHeader />
  //   <SignatureSummary />
  //   <SignatureContents />
  // </For>
  // <For items={children} />
  //   <SingleElementView currentElement={child} /> or maybe dedicated ChildElementView ? might need to decrease header-level for children
  // </For>
  return (
    <Typography>
      {JSON.stringify(props.currentElement.element, undefined, 2)}
    </Typography>
  );
}

export interface SingleElementViewProps {
  currentElement: types.TopLevelElement;
}
