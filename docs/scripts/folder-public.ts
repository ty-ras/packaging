// import * as fs from "node:fs/promises";
import * as path from "node:path";
// import * as git from "isomorphic-git";
// import * as td from "typedoc";
import type * as codeInfo from "./code-info.types";
import * as url from "../src/routing/url";

export const writeVersionedTypeDocs = async (codeInfo: codeInfo.CodeInfo) => {
  const versionDirs: {
    specific: codeInfo.Packages;
    protocol: Record<string, codeInfo.PathLike>;
  } = {
    specific: {},
    protocol: {},
  };
  for (const dataValidation of codeInfo.structure.dataValidation) {
    // Save data dir for protocol (BE&FE -agnostic) docs
    versionDirs.protocol[dataValidation] = urlToPath(
      url.buildDataURL(
        {
          dataValidation,
          server: url.ASPECT_NONE,
          serverVersion: url.ASPECT_NONE,
          client: url.ASPECT_NONE,
          clientVersion: url.ASPECT_NONE,
        },
        undefined,
      ) ?? doThrow(`Failed to build protocol data URL for ${dataValidation}`),
      false,
    );
    const specific: (typeof versionDirs)["specific"][string] = {
      server: {},
      client: {},
    };
    versionDirs.specific[dataValidation] = specific;
    // Save data dirs for server-specific docs
    for (const server of codeInfo.structure.server) {
      specific.server[server] = urlToPath(
        url.buildDataURL(
          {
            dataValidation,
            server,
            serverVersion: "0.0.0",
            client: url.ASPECT_NONE,
            clientVersion: url.ASPECT_NONE,
          },
          "server",
        ) ??
          doThrow(
            `Failed to build server data URL for ${dataValidation}, ${server}`,
          ),
        true,
      );
    }
    // Save data dirs for client-specific docs
    for (const client of codeInfo.structure.client) {
      specific.client[client] = urlToPath(
        url.buildDataURL(
          {
            dataValidation,
            client,
            clientVersion: "0.0.0",
            server: url.ASPECT_NONE,
            serverVersion: url.ASPECT_NONE,
          },
          "client",
        ) ??
          doThrow(
            `Failed to build client data URL for ${dataValidation}, ${client}`,
          ),
        true,
      );
    }
  }

  // for (const [dataValidation, info] of Object.entries(codeInfo.packages)) {
  // }
  // eslint-disable-next-line no-console
  console.log("DEBUG", versionDirs);
  // }
  // read dir recursive + get all tags
  // If some component not in dir -> take only latest tag
  // From this, if any per-lib tag list > 1 => throw not implemented
  // If per lib tag list > 0 and package.json.version != tag version => throw not implemented (using NPM registry to download old releases and handle their installations)
  // For remaining, generate docs

  // const json = "/path/to/file.json";
  // const app = await td.Application.bootstrap(
  //   {
  //     json,
  //     tsconfig: "/path/to/tsconfig.json", // This tsconfig must include necessary setup to resolve @ty-ras/xyz imports into src folder.
  //   },
  //   [
  //     // new td.TypeDocReader(),
  //     // new td.PackageJsonReader(),
  //     // new td.TSConfigReader(),
  //   ],
  // );

  // const project = await app.convert();
  // if (!project) {
  //   throw new Error("Failed to generate Typedoc project");
  // }
  // if (app.logger.hasWarnings()) {
  //   throw new Error("Typedoc found warnings");
  // }
  // const preValidationWarnCount = app.logger.warningCount;
  // app.validate(project);
  // const hadValidationWarnings =
  //   app.logger.warningCount !== preValidationWarnCount;
  // if (app.logger.hasErrors()) {
  //   throw new Error("Failed to validate Typedoc project");
  // }
  // if (hadValidationWarnings) {
  //   throw new Error("Typedoc validation found warnings");
  // }

  // await app.generateJson(project, json);
};

// async function* readDirRecursive(
//   dir: string,
// ): AsyncGenerator<string, void, unknown> {
//   const entries = await fs.readdir(dir, { withFileTypes: true });
//   for (const entry of entries) {
//     const res = path.resolve(dir, entry.name);
//     if (entry.isDirectory()) {
//       yield* readDirRecursive(res);
//     } else if (entry.isFile()) {
//       yield res;
//     }
//   }
// }

const doThrow = (msg: string) => {
  throw new Error(msg);
};

const PUBLIC = path.resolve("../public");

const urlToPath = (url: string, fileNameIrrelevant: boolean) =>
  path.join(PUBLIC, fileNameIrrelevant ? path.dirname(url) : url);
