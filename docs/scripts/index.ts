import * as process from "node:process";
import * as folderSrc from "./folder-src";

const main = async () => {
  await folderSrc.acquireCodeInfo();
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
