import * as process from "node:process";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as folderSrc from "./generate-docs";
import * as folderPublic from "./read-structure";

const main = async () => {
  const codeInfo = await folderSrc.acquireCodeInfo();
  const versionContent = await folderPublic.writeVersionedTypeDocs(codeInfo);
  const routingDir = "./src/routing";
  await Promise.all([
    fs.writeFile(
      path.join(routingDir, "tyras-structure.json"),
      JSON.stringify(codeInfo.structure, undefined, 2),
      "utf8",
    ),
    fs.writeFile(
      path.join(routingDir, "tyras-versions.json"),
      JSON.stringify(versionContent, undefined, 2),
      "utf8",
    ),
  ]);
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
