import * as process from "node:process";
import * as folderSrc from "./folder-src";
import * as folderPublic from "./folder-public";

const main = async () => {
  const codeInfo = await folderSrc.acquireCodeInfo();
  await folderPublic.writeVersionedTypeDocs(codeInfo);
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
