import type * as fs from "node:fs";
import type * as structure from "../src/routing/tyras-structure.types";
import type * as versions from "../src/routing/tyras-versions.types";

export interface CodeInfo {
  packages: Packages;
  structure: Structure;
}

export type Packages = versions.TyrasVersions<fs.PathLike>;
export type Structure = structure.TyrasStructure<Set<string>>;
export type PathLike = fs.PathLike;
