/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import suidPlugin from "@suid/vite-plugin";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 3001,
  },
  plugins: [
    suidPlugin(),
    //   {
    //   parserOptions: {
    //     plugins: [["importAttributes", { deprecatedAssertSyntax: true }]],
    //   },
    // }
    solidPlugin(),
    //   {
    //   babel: {
    //     generatorOpts: {
    //       importAttributesKeyword: "assert",
    //     } as any,
    //     // parserOpts: {
    //     //   plugins: [["importAttributes", { deprecatedAssertSyntax: true }]],
    //     // },
    //     plugins: [
    //       [
    //         "@babel/plugin-syntax-import-attributes",
    //         {
    //           deprecatedAssertSyntax: true,
    //         },
    //       ],
    //     ],
    //   },
    // }
  ],
  build: {
    target: "esnext",
  },
});
