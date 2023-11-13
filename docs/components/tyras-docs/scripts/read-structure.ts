import * as fs from "node:fs/promises";
import * as path from "node:path";
// import * as git from "isomorphic-git";
import type * as codeInfo from "./code-info.types";

export default async (): Promise<codeInfo.CodeInfo> => {
  const codeDir = "../../../code";
  const packages: codeInfo.VersionsSpecific = {};
  const structure: codeInfo.Structure<Set<string>> = {
    dataValidation: new Set(),
    client: new Set(),
    server: new Set(),
  };
  const putServerOrClientRecord = getOrCreate(packages);
  (
    await fs.readdir(codeDir, {
      encoding: "utf8",
      recursive: false,
      withFileTypes: true,
    })
  ).forEach((entry) => {
    const name = entry.name;
    if (entry.isDirectory() && !name.startsWith("extras-")) {
      const firstDash = name.indexOf("-");
      const secondDash = name.indexOf("-", firstDash + 1);
      const isServer = name.startsWith("backend-");
      const serverOrClient = isServer ? "server" : "client";
      const serverOrClientKind = name.substring(firstDash + 1, secondDash);
      structure[serverOrClient].add(serverOrClientKind);
      const dataValidation = name.substring(
        secondDash + 1,
        isServer ? name.lastIndexOf("-") : undefined,
      );
      structure.dataValidation.add(dataValidation);
      getOrCreate(
        putServerOrClientRecord(dataValidation, () => ({
          server: {},
          client: {},
        }))[serverOrClient],
      )(serverOrClientKind, () => path.resolve(codeDir, name));
    }
  });
  return {
    packages,
    structure: {
      dataValidation: Array.from(structure.dataValidation.values()),
      server: Array.from(structure.server.values()),
      client: Array.from(structure.client.values()),
    },
  };
};

// We curry first parameter because otherwise compiler lets us do code which isn't super typesafe
const getOrCreate =
  <TKey extends PropertyKey, TValue>(
    rec: Record<TKey, TValue>,
  ): ((key: TKey, factory: (key: TKey) => TValue) => TValue) =>
  (key, factory) => {
    let value: TValue;
    if (key in rec) {
      value = rec[key];
    } else {
      value = factory(key);
      rec[key] = value;
    }
    return value;
  };
