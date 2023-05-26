// ESLint config for formatting the resulting .d.ts files (<project name>/dist-ts/**/*.d.ts) that end up in NPM package for typing information.
const { extends: extendsArray, plugins, rules } = require("./.eslintrc.cjs");
module.exports = {
  root: true,
  extends: extendsArray.filter((ext) => ext.startsWith("plugin:jsdoc/") || ext.startsWith("plugin:prettier/")),
  plugins: plugins.filter((plugin) => plugin === "jsdoc" || plugin === "prettier"),
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.out.json",
    sourceType: "module",
    ecmaVersion: "latest",
    tsconfigRootDir: __dirname,
  },
  rules: Object.fromEntries(Object.entries(rules).filter(([ruleKey]) => ruleKey.startsWith("jsdoc/") || ruleKey.startsWith("prettier/"))),
  // So we won't get errors on comments disable e.g. @typescript-eslint/xyz rules.
  noInlineConfig: true,
};
