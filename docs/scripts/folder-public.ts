import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as zlib from "node:zlib";
import * as os from "node:os";
import * as tar from "tar";
import * as git from "isomorphic-git";
import * as semver from "semver";
import * as td from "typedoc";
import { request } from "undici";
import type * as codeInfo from "./code-info.types";
import * as url from "../src/routing/url";

export const writeVersionedTypeDocs = async ({
  packages,
  structure,
}: codeInfo.CodeInfo) => {
  const versionDirs: codeInfo.Versions<VersionInfo> = {
    specific: {},
    protocol: {},
  };
  // If we don't specify gitdir, the isomorphic-git will crash... Not very trust-inspiring or convincing, but that's what we got.
  // The code has: gitdir = join(dir, '.git')
  // While typings claim that both gitdir and dir are optional...
  const tags = await git.listTags({ fs, dir: ".." });
  for (const dataValidation of structure.dataValidation) {
    // Save data dir for protocol (BE&FE -agnostic) docs
    versionDirs.protocol[dataValidation] = await getVersionInfo(
      packages,
      tags,
      dataValidation,
      undefined,
      undefined,
    );
    const specific: codeInfo.VersionsSpecific<VersionInfo>[string] = {
      server: {},
      client: {},
    };
    versionDirs.specific[dataValidation] = specific;
    // Save data dirs for server-specific docs
    for (const server of structure.server) {
      specific.server[server] = await getVersionInfo(
        packages,
        tags,
        dataValidation,
        server,
        undefined,
      );
    }
    // Save data dirs for client-specific docs
    for (const client of structure.client) {
      specific.client[client] = await getVersionInfo(
        packages,
        tags,
        dataValidation,
        undefined,
        client,
      );
    }
  }

  const versions: codeInfo.Versions<codeInfo.VersionList> = {
    specific: {},
    protocol: {},
  };

  for (const [dataValidation, info] of Object.entries(versionDirs.specific)) {
    const protocol = versionDirs.protocol[dataValidation];
    await generateDocs(protocol);
    versions.protocol[dataValidation] = getAllVersions(protocol);
    const specific: (typeof versions)["specific"][string] = {
      client: {},
      server: {},
    };
    versions.specific[dataValidation] = specific;
    for (const [server, versionInfo] of Object.entries(info.server)) {
      await generateDocs(versionInfo);
      specific.server[server] = getAllVersions(versionInfo);
    }
    for (const [client, versionInfo] of Object.entries(info.client)) {
      await generateDocs(versionInfo);
      specific.client[client] = getAllVersions(versionInfo);
    }
  }

  return versions;
};

const doThrow = (msg: string) => {
  throw new Error(msg);
};

const PUBLIC = path.resolve("public");

const urlToPath = (url: string) => path.join(PUBLIC, path.dirname(url));

interface VersionInfoBase {
  latestVersion: string;
  currentVersions: ReadonlyArray<string>;
  taggedVersions: ReadonlyArray<string>;
}

interface VersionInfoDirs {
  versionDir: string;
  packageSource: PackageSource;
}
interface VersionInfo extends VersionInfoBase, VersionInfoDirs {
  versionsToGenerate: ReadonlyArray<string>;
}

const getVersionInfo = async (
  packages: codeInfo.VersionsSpecific,
  tags: ReadonlyArray<string>,
  dataValidation: string,
  server: string | undefined,
  client: string | undefined,
  // eslint-disable-next-line sonarjs/cognitive-complexity
): Promise<VersionInfo> => {
  const versionDir = urlToPath(
    url.buildDataURL(
      {
        dataValidation,
        server: server ? server : url.ASPECT_NONE,
        serverVersion: server ? "0.0.0" : url.ASPECT_NONE,
        client: client ? client : url.ASPECT_NONE,
        clientVersion: client ? "0.0.0" : url.ASPECT_NONE,
      },
      server ? "server" : client ? "client" : undefined,
    ) ??
      doThrow(
        `Failed to build data URL for ${dataValidation}, ${server}, ${client}`,
      ),
  );
  let currentVersions: Array<string>;
  try {
    currentVersions = (
      await fs.readdir(versionDir, { withFileTypes: true, encoding: "utf8" })
    )
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map((entry) => entry.name);
  } catch (e) {
    if (e instanceof Error && (e as NodeJS.ErrnoException).code === "ENOENT") {
      currentVersions = [];
    } else {
      throw e;
    }
  }
  const packageSource: PackageSource =
    server || client
      ? {
          source: "local",
          path: path.join(
            packages[dataValidation][server ? "server" : "client"][
              server ?? client ?? doThrow("This should never happen")
            ],
            "package.json",
          ),
        }
      : await getNPMPackageSource(dataValidation);
  let taggedVersions: Array<string>;
  if (packageSource.source === "local") {
    const tagStart = `${path.basename(path.dirname(packageSource.path))}-v`;
    taggedVersions = tags
      .filter((tag) => tag.startsWith(tagStart))
      .map((tag) => tag.substring(tagStart.length));
  } else {
    taggedVersions = Object.keys(packageSource.tarballs);
  }
  // Sort all versions in descending order (switch arg order when passing to semver.compare)
  const descendingOrder = (x: string, y: string) => semver.compare(y, x);
  taggedVersions.sort(descendingOrder);
  currentVersions.sort(descendingOrder);
  const base: VersionInfoBase = {
    latestVersion:
      packageSource.source === "local"
        ? (
            JSON.parse(await fs.readFile(packageSource.path, "utf8")) as {
              version: string;
            }
          ).version
        : taggedVersions[0],
    currentVersions,
    taggedVersions,
  };
  const versionsToGenerate = getVersionsToGenerateDocs(base);
  versionsToGenerate.sort(descendingOrder);
  return {
    ...base,
    versionDir,
    packageSource,
    versionsToGenerate,
  };
};

type PackageSource =
  | { source: "local"; path: string }
  | { source: "npm"; packageName: string; tarballs: Record<string, string> };

const getVersionsToGenerateDocs = ({
  taggedVersions,
  latestVersion,
  currentVersions,
}: VersionInfoBase) => {
  let versions: Array<string>;
  if (currentVersions.length > 0) {
    // When there are current versions present, we want to generate docs only for newer versions
    const latestCurrent = currentVersions[0];
    versions = Array.from(
      new Set(
        [...taggedVersions, latestVersion].filter(
          (version) => semver.compare(version, latestCurrent) > 0,
        ),
      ).values(),
    );
  } else {
    // When there are no current versions present, we want to generate docs only for latest
    versions = [latestVersion];
  }
  return versions;
};

const generateDocs = async ({
  versionsToGenerate,
  ...versionInfo
}: VersionInfo) => {
  if (versionsToGenerate.length > 0) {
    if (versionsToGenerate.length > 1) {
      throw new Error(
        "Not implemented: generating docs for more than one version at a time",
      );
    }
    const version = versionsToGenerate[0];
    if (version !== versionInfo.latestVersion) {
      throw new Error(
        "Not implemented: generating docs for other version than current one.",
      );
    }
    await generateDocsForVersion(versionInfo, version);
  }
};

const generateDocsForVersion = async (
  { versionDir, packageSource }: VersionInfoDirs,
  version: string,
) => {
  const sourceDir =
    packageSource.source === "local"
      ? path.dirname(packageSource.path)
      : await extractNpmToFolder(packageSource.tarballs[version]);

  const json = path.join(versionDir, `${version}.json`);
  const app = await td.Application.bootstrap({
    json,
    tsconfig: path.join(sourceDir, "tsconfig.json"),
    entryPoints: [path.join(sourceDir, "src", "index.ts")],
    entryPointStrategy: "expand",
    logLevel: "Verbose",
    // For some reason the TSC ran by TD fails - this doesn't matter, as we validate TS code elsewhere
    skipErrorChecking: true,
    // Don't emit any .js files
    emit: "none",
  });

  const project = await app.convert();
  if (!project) {
    throw new Error("Failed to generate Typedoc project");
  }
  // if (app.logger.hasWarnings()) {
  //   throw new Error("Typedoc found warnings");
  // }
  // const preValidationWarnCount = app.logger.warningCount;
  app.validate(project);
  // const hadValidationWarnings =
  //   app.logger.warningCount !== preValidationWarnCount;
  if (app.logger.hasErrors()) {
    throw new Error("Failed to validate Typedoc project");
  }
  // if (hadValidationWarnings) {
  //   throw new Error("Typedoc validation found warnings");
  // }

  await app.generateJson(project, json);
};

const getAllVersions = ({ currentVersions, versionsToGenerate }: VersionInfo) =>
  // Both versions are sorted in descending order, and versions to generate are always newer than latest current version
  [...versionsToGenerate, ...currentVersions];

interface Packument {
  versions: Record<string, { dist: { tarball: string } }>;
}

const getNPMPackageSource = async (
  dataValidation: string,
): Promise<PackageSource> => {
  const packageName = `@ty-ras/data-${dataValidation}`;
  return {
    source: "npm",
    packageName,
    tarballs: Object.fromEntries(
      Object.entries(
        (
          (await (
            await request(`https://registry.npmjs.com/${packageName}`)
          ).body.json()) as Packument
        ).versions,
      ).map(
        ([
          version,
          {
            dist: { tarball },
          },
        ]) => [version, tarball] as const,
      ),
    ),
  };
};

const extractNpmToFolder = async (tarballURL: string) => {
  const targetDir = await fs.mkdtemp(path.join(os.tmpdir(), "ty-ras-docs-"));
  const responseBody = (await request(tarballURL)).body;
  await new Promise<void>((resolve, reject) => {
    responseBody.once("error", reject);
    const tarStream = responseBody.pipe(zlib.createUnzip()).pipe(
      tar.x({
        C: targetDir,
      }),
    );
    tarStream.once("error", reject);
    tarStream.on("close", resolve);
  });
  const packageDir = path.join(targetDir, "package");
  await fs.writeFile(
    path.join(packageDir, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        noEmit: true,
        rootDir: "./src",
        esModuleInterop: true,
        strict: true,
      },
      include: ["src/**/*"],
    }),
  );
  // TODO run yarn install (no dev deps) here
  return packageDir;
};
