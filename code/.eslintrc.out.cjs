// ESLint config for formatting the resulting .[m]js files (<project name>/dist-(cjs|mjs)/**/*.[m]js) that end up in NPM package.
module.exports = {
  root: true,
  extends: [
    "plugin:path-import-extension/recommended",
    "plugin:prettier/recommended",
  ],
  plugins: [
    "path-import-extension",
    "prettier"
  ],
  parser: "@babel/eslint-parser",
  parserOptions: {
    requireConfigFile: false
  },
  rules: {
    "prettier/prettier": "error",
  }
};
