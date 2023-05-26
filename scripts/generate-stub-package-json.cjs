#!/usr/bin/env node

const fs = require("fs");
const { version } = JSON.parse(fs.readFileSync("package.json"));
fs.writeFileSync(
  "dist-cjs/package.json",
  // Just version is enough
  JSON.stringify({ version })
);