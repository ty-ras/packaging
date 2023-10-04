import type * as fs from "node:fs";
import type * as structure from "../src/routing/tyras-structure.types";
import type * as versions from "../src/routing/tyras-versions.types";

export interface CodeInfo {
  packages: VersionsSpecific;
  structure: Structure;
}

export type Versions<TVersions = versions.Versions> =
  versions.TyrasVersions<TVersions>;

export type VersionList = versions.Versions;

export type VersionsSpecific<TVersions = string> =
  versions.TyrasVersionsSpecific<TVersions>;
export type Structure = structure.TyrasStructure<Set<string>>;
export type PathLike = fs.PathLike;
