/**
 * @file This file defines type for tyras-versions.json file in this folder, which is generated by code in scripts folder. It is used by code both in src and scripts folders.
 */

export interface TyrasVersions<TVersions = Versions> {
  specific: TyrasVersionsSpecific<TVersions>;
  protocol: Record<string, TVersions>;
}

export type TyrasVersionsSpecific<TVersions = Versions> = Record<
  string,
  Record<VersionKind, Record<string, TVersions>>
>;

export type VersionKind = VersionKindServer | VersionKindClient;

// TODO extract these and some others to consts.ts
export type VersionKindServer = "server";
export type VersionKindClient = "client";

export type Versions = ReadonlyArray<string>;
