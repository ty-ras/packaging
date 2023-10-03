// import * as fs from "node:fs/promises";
// import * as git from "isomorphic-git";
// import type * as codeInfo from "./code-info.types";
import * as td from "typedoc";

export const generateVersionedTypeDocs = async () =>
  // codeInfo: codeInfo.CodeInfo,
  {
    // read dir recursive + get all tags
    // If some component not in dir -> take only latest tag
    // From this, if any per-lib tag list > 1 => throw not implemented
    // If per lib tag list > 0 and package.json.version != tag version => throw not implemented (using NPM registry to download old releases and handle their installations)
    // For remaining, generate docs

    const json = "/path/to/file.json";
    const app = await td.Application.bootstrap(
      {
        json,
        tsconfig: "/path/to/tsconfig.json", // This tsconfig must include necessary setup to resolve @ty-ras/xyz imports into src folder.
      },
      [
        // new td.TypeDocReader(),
        // new td.PackageJsonReader(),
        // new td.TSConfigReader(),
      ],
    );

    const project = await app.convert();
    if (!project) {
      throw new Error("Failed to generate Typedoc project");
    }
    if (app.logger.hasWarnings()) {
      throw new Error("Typedoc found warnings");
    }
    const preValidationWarnCount = app.logger.warningCount;
    app.validate(project);
    const hadValidationWarnings =
      app.logger.warningCount !== preValidationWarnCount;
    if (app.logger.hasErrors()) {
      throw new Error("Failed to validate Typedoc project");
    }
    if (hadValidationWarnings) {
      throw new Error("Typedoc validation found warnings");
    }

    await app.generateJson(project, json);
  };
