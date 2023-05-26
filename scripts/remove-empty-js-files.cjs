#!/usr/bin/env node

const fs = require("fs");
const glob = require("glob");

glob
  // Find all CommonJS files
  .sync("dist-cjs/**/*.js")
  // Read their contents while remembering the file path
  .map((file) => ({ file, contents: fs.readFileSync(file, "utf8") }))
  // Check whether the contents match what is emitted by a file without anything runtime-living to export
  .filter(({ contents }) => contents === '"use strict";\nObject.defineProperty(exports, "__esModule", { value: true });\n')
  // Delete the files
  .map(({ file }) => fs.unlinkSync(file))
  ;

glob
  // Find all ESM files
  .sync("dist-esm/**/*.js")
  // Read their contents while remembering the file path
  .map((file) => ({ file, contents: fs.readFileSync(file, "utf8") }))
  // Check whether the contents match what is emitted by a file without anything runtime-living to export
  .filter(({ contents }) => contents === 'export {};\n')
  // Delete the files
  .map(({ file }) => fs.unlinkSync(file))
  ;
