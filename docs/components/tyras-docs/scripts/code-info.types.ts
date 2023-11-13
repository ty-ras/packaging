import type * as fs from "node:fs";
import type * as structure from "../src/structure/tyras-structure.types";
import type * as versions from "../src/structure/tyras-versions.types";

export interface CodeInfo {
  packages: VersionsSpecific;
  structure: Structure;
}

export type Versions<TVersions = versions.Versions> =
  versions.TyrasVersions<TVersions>;

export type VersionList = versions.Versions;

export type VersionsSpecific<TVersions = string> =
  versions.TyrasVersionsSpecific<TVersions>;
export type Structure<TKinds = ReadonlyArray<string>> =
  structure.TyrasStructure<TKinds>;
export type PathLike = fs.PathLike;
