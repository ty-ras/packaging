// ESLint config for formatting the resulting .[m]js files (<project name>/dist-(cjs|mjs)/**/*.[m]js) that end up in NPM package.
module.exports = {
  root: true,
  extends: [
    // See https://github.com/prettier/eslint-config-prettier/blob/main/CHANGELOG.md#version-800-2021-02-21
    "plugin:prettier/recommended",
  ],
  plugins: ["prettier"],
  parser: "@babel/eslint-parser",
  parserOptions: {
    requireConfigFile: false
  },
  env: {
    node: true,
    es2020: true
  },
  rules: {
    "prettier/prettier": "error",
  }
};
