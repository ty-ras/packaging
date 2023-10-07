import { Stack, Typography } from "@suid/material";
import type * as model from "typedoc/dist/lib/serialization/schema";

export default function Documentation(props: DocumentationProps) {
  return (
    <Stack direction="column">
      <Typography>
        {props.serverDocs?.name} {props.serverDocs?.packageVersion}
      </Typography>
      <Typography>
        {props.clientDocs?.name} {props.clientDocs?.packageVersion}
      </Typography>
      <Typography>
        {props.protocolDocs?.name} {props.protocolDocs?.packageVersion}
      </Typography>
    </Stack>
  );
}

export interface DocumentationProps {
  protocolDocs: Documentation | undefined;
  serverDocs: Documentation | undefined;
  clientDocs: Documentation | undefined;
}

export type Documentation = model.ProjectReflection;
