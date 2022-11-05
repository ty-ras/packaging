// ESLint config for formatting the resulting .d.ts files (<project name>/dist-ts/**/*.d.ts) that end up in NPM package for typing information.
module.exports = {
  root: true,
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    // See https://github.com/prettier/eslint-config-prettier/blob/main/CHANGELOG.md#version-800-2021-02-21
    "plugin:prettier/recommended",
  ],
  plugins: ["prettier"],
  parser: "@typescript-eslint/parser",
  env: {
    node: true,
    es2020: true
  },
  parserOptions: {
    project: "./tsconfig.out.json",
    sourceType: "module",
    ecmaVersion: 2020,
    tsconfigRootDir: __dirname,
  },
  rules: {
    "prettier/prettier": "error",
  },
  settings: {
    "import/resolver": {
      node: {
        paths: ["dist-ts"],
        extensions: [".ts"] // Add .tsx, .js, .jsx if needed
      }
    }
  }
};
