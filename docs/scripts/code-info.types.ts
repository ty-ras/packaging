import type * as fs from "node:fs";
import type * as structure from "../src/routing/tyras-structure.types";
import type * as versions from "../src/routing/tyras-versions.types";

export interface CodeInfo {
  packages: versions.TyrasVersions<fs.PathLike>;
  structure: structure.TyrasStructure<Set<string>>;
}
