import * as fsModule from "node:fs";
import * as process from "node:process";
import * as git from "isomorphic-git";
import type * as structure from "../src/routing/tyras-structure.types";

const fs = fsModule.promises;

const main = async () => {
  const codeDir = "../code";
  const codeInfo: {
    packages: Array<string>;
    structure: Record<structure.TyrasAspects, Set<string>>;
  } = {
    packages: [],
    structure: {
      dataValidation: new Set(),
      client: new Set(),
      server: new Set(),
    },
  };
  (
    await fs.readdir(codeDir, {
      encoding: "utf8",
      recursive: false,
      withFileTypes: true,
    })
  ).forEach((entry) => {
    const name = entry.name;
    if (entry.isDirectory() && !name.startsWith("extras-")) {
      codeInfo.packages.push(name);
      const firstDash = name.indexOf("-");
      const secondDash = name.indexOf("-", firstDash + 1);
      const isServer = name.startsWith("backend-");
      codeInfo.structure[isServer ? "server" : "client"].add(
        name.substring(firstDash + 1, secondDash),
      );
      codeInfo.structure.dataValidation.add(
        name.substring(
          secondDash + 1,
          isServer ? name.lastIndexOf("-") : undefined,
        ),
      );
    }
  });
  // If we don't specify gitdir, the isomorphic-git will crash... Not very trust-inspiring or convincing, but that's what we got.
  // The code has: gitdir = join(dir, '.git')
  // While typings claim that both gitdir and dir are optional...
  const tags = await git.listTags({ fs, dir: ".." });
  // eslint-disable-next-line no-console
  console.log("DEBUG", codeInfo, tags);
};

void (async () => {
  let exitCode = 1;
  try {
    await main();
    exitCode = 0;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("ERROR", e);
  }
  process.exit(exitCode);
})();
