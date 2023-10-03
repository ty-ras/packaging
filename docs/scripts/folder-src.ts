import * as fs from "node:fs/promises";
import * as path from "node:path";
// import * as git from "isomorphic-git";
import type * as codeInfo from "./code-info.types";

export const acquireCodeInfo = async () => {
  const codeDir = "../code";
  const codeInfo: codeInfo.CodeInfo = {
    packages: {},
    structure: {
      dataValidation: new Set(),
      client: new Set(),
      server: new Set(),
    },
  };
  const putServerOrClientRecord = getOrCreate(codeInfo.packages);
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
      codeInfo.structure[serverOrClient].add(serverOrClientKind);
      const dataValidation = name.substring(
        secondDash + 1,
        isServer ? name.lastIndexOf("-") : undefined,
      );
      codeInfo.structure.dataValidation.add(dataValidation);
      getOrCreate(
        putServerOrClientRecord(dataValidation, () => ({
          server: {},
          client: {},
        }))[serverOrClient],
      )(serverOrClientKind, () => path.resolve(codeDir, name));
    }
  });
  // If we don't specify gitdir, the isomorphic-git will crash... Not very trust-inspiring or convincing, but that's what we got.
  // The code has: gitdir = join(dir, '.git')
  // While typings claim that both gitdir and dir are optional...
  // const tags = await git.listTags({ fs, dir: ".." });
  // eslint-disable-next-line no-console
  // console.log("DEBUG", codeInfo.packages, tags);
  return codeInfo;
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
