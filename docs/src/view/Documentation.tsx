import { Typography } from "@suid/material";
import type * as model from "typedoc/dist/lib/serialization/schema";

export default function Documentation({ serverDocs }: DocumentationProps) {
  return <Typography>Hello {serverDocs?.name}</Typography>;
}

export interface DocumentationProps {
  protocolDocs: Documentation | undefined;
  serverDocs: Documentation | undefined;
  clientDocs: Documentation | undefined;
}

export type Documentation = model.ProjectReflection;
