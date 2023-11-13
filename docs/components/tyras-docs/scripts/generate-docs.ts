import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as zlib from "node:zlib";
import * as os from "node:os";
import * as process from "node:child_process";
import * as tar from "tar";
import * as git from "isomorphic-git";
import * as semver from "semver";
import * as td from "typedoc";
import { request } from "undici";
import * as functionality from "@typedoc-2-ts/browser";
import { Throw } from "throw-expression";

import type * as codeInfo from "./code-info.types";
import * as url from "../src/structure/url-to-string";
import type * as docs from "../src/structure/docs.types";

export default async ({
  packages,
  structure,
}: codeInfo.CodeInfo): Promise<codeInfo.Versions<codeInfo.VersionList>> => {
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
      server
        ? {
            kind: "server",
            dataValidation,
            server: {
              name: server,
              version: "0.0.0",
            },
          }
        : client
        ? {
            kind: "client",
            dataValidation,
            client: {
              name: client,
              version: "0.0.0",
            },
          }
        : {
            kind: "protocol",
            dataValidation,
            protocolVersion: "0.0.0",
          },
      server ? "server" : client ? "client" : undefined,
    ) ??
      Throw(
        `Failed to build data URL for ${dataValidation}, ${server}, ${client}`,
      ),
  );
  let currentVersions: Array<string>;
  try {
    const jsonExtension = ".json";
    currentVersions = (
      await fs.readdir(versionDir, { withFileTypes: true, encoding: "utf8" })
    )
      .filter((entry) => entry.isFile() && entry.name.endsWith(jsonExtension))
      .map((entry) =>
        entry.name.substring(0, entry.name.length - jsonExtension.length),
      );
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
              server ?? client ?? Throw("This should never happen")
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
  const packageDir =
    packageSource.source === "local"
      ? path.dirname(packageSource.path)
      : await preparePackageFromNpm(packageSource.tarballs[version]);

  const json = path.join(versionDir, `${version}.json`);
  // Call this always for each run, as otherwise the IDs will keep increasing between different typedoc Applications.
  td.resetReflectionID();
  const app = await td.Application.bootstrap({
    tsconfig: path.join(packageDir, "tsconfig.json"),
    entryPoints: [path.join(packageDir, "src", "index.ts")],
    entryPointStrategy: "expand",
    logLevel: "Verbose",
    // For some reason the TSC ran by TD fails - this doesn't matter, as we validate TS code elsewhere
    skipErrorChecking: true,
    // Don't emit any .js files
    emit: "none",
    // Include 'packageVersion' property
    includeVersion: true,
    basePath: packageDir,
    externalPattern: [
      `!${path.join(
        packageDir,
        `{${path.join("node_modules", "@ty-ras")},src}`,
      )}/**`,
    ],
    // No need to e.g. include parent class fields and methods when extending external class
    excludeExternals: true,
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

  const tdProject = app.serializer.projectToObject(project, packageDir);
  redefineProjectGroups(tdProject.groups ?? Throw("Project without groups"));
  const docs: docs.Documentation = {
    version: 1,
    ...functionality.indexProject(tdProject),
  };

  // TODO: merge project groups: interfaces, (classes), type aliases into one

  await fs.mkdir(path.dirname(json), { recursive: true });
  await fs.writeFile(json, JSON.stringify(docs));
};

const getAllVersions = ({ currentVersions, versionsToGenerate }: VersionInfo) =>
  // Both versions are sorted in descending order, and versions to generate are always newer than latest current version
  [...versionsToGenerate, ...currentVersions];

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

const preparePackageFromNpm = async (tarballURL: string) => {
  const packageDir = await downloadNpmTarBall(tarballURL);
  // Generate dummy tsconfig so that Typedoc will work
  await generateTSConfigFile(packageDir);
  // Tweak package.json because we don't want yarn to resolve dev deps
  // Also, we want to install peer deps
  // If we don't do this, yarn install will take ages as it tries to resolve dev deps as well (but not install them):
  // https://github.com/yarnpkg/yarn/issues/3630
  await tweakDownloadedPackageJsonFile(packageDir);
  // Now run yarn install (the --production flag is not needed after tweaking package.json but just in case)
  await installDependencies(packageDir);
  // Add extra "export * from" statements to index.ts so that sub packages would get documented as well
  await tweakDownloadedPackageIndexTSFile(packageDir);
  // Now we are done
  return packageDir;
};

const downloadNpmTarBall = async (tarballURL: string) => {
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
  return path.join(targetDir, "package");
};

const generateTSConfigFile = async (packageDir: string) => {
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
};

const tweakDownloadedPackageJsonFile = async (packageDir: string) => {
  const packageJson = path.join(packageDir, "package.json");
  await fs.writeFile(
    packageJson,
    JSON.stringify(
      modifyDownloadedPackageJsonFile(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        JSON.parse(await fs.readFile(packageJson, "utf8")),
      ),
    ),
    "utf8",
  );
};

const modifyDownloadedPackageJsonFile = ({
  dependencies = {},
  peerDependencies = {},
  devDependencies, // eslint-disable-line @typescript-eslint/no-unused-vars
  resolutions, // eslint-disable-line @typescript-eslint/no-unused-vars
  ...packageJson
}: PackageJson): PackageJson => ({
  ...packageJson,
  dependencies: { ...dependencies, ...peerDependencies },
});

const installDependencies = async (packageDir: string) => {
  const child = process.spawn(
    "yarn",
    [
      "install",
      "--non-interactive",
      "--production",
      "--ignore-scripts",
      "--no-lockfile",
    ],
    {
      cwd: packageDir,
      shell: false,
      // Don't provide stdin, and make all out/err output to be printed to this process
      stdio: ["ignore", "inherit", "inherit"],
    },
  );
  const exitCode = await new Promise<number | NodeJS.Signals>((resolve) =>
    child.once("exit", (code, signal) => resolve(code ?? signal ?? -1)),
  );
  if (exitCode !== 0) {
    throw new Error(`Failed to install runtime dependencies for ${packageDir}`);
  }
};

const tweakDownloadedPackageIndexTSFile = async (packageDir: string) => {
  const indexTS = path.join(packageDir, "src", "index.ts");
  await fs.writeFile(
    indexTS,
    modifyDownloadedPackageIndexTSFile(await fs.readFile(indexTS, "utf8")),
    "utf-8",
  );
};

const modifyDownloadedPackageIndexTSFile = (
  fileContents: string,
): string => `${fileContents}
export * from "@ty-ras/data";
export * from "@ty-ras/protocol";
`;

interface Packument {
  versions: Record<string, { dist: { tarball: string } }>;
}
type PackageJson = Record<string, unknown> & {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  resolutions?: Record<string, string>;
};

const redefineProjectGroups = (
  groups: Array<td.JSONOutput.ReflectionGroup>,
) => {
  for (const [newGroupName, composedGroups] of Object.entries(
    projectGroupRedefinition,
  )) {
    groups.push(
      newProjectGroup(
        newGroupName,
        removeMatching(groups, ({ title }) => composedGroups.has(title)),
      ),
    );
  }
};

const projectGroupRedefinition: Record<string, Set<string>> = {
  Types: new Set(
    [td.ReflectionKind.Interface, td.ReflectionKind.TypeAlias].map(
      td.ReflectionKind.pluralString,
    ),
  ),
};

const newProjectGroup = (
  title: string,
  removed: ReadonlyArray<td.JSONOutput.ReflectionGroup>,
): td.JSONOutput.ReflectionGroup => ({
  title,
  children: removed.flatMap(({ children }) => children ?? []),
});

const removeMatching = <T>(
  array: Array<T>,
  condition: (item: T) => boolean,
) => {
  const removed: Array<T> = [];
  for (let x = 0; x < array.length; ) {
    if (condition(array[x])) {
      removed.push(...array.splice(x, 1));
    } else {
      ++x;
    }
  }
  return removed;
};
