export default {
  cache: false, // We run Ava in non-coverage mode with 'ro' modifier for Docker volume
  extensions: {
    ts: "module"
  },
  nodeArguments: [
    "--loader=ts-node/esm",
    "--experimental-specifier-resolution=node",
    "--trace-warnings"
  ],
  files: [
    "**/__test__/*.spec.ts"
  ],
  timeout: "10m",
  verbose: true,
  // The default is number of corse, which in CI I guess is 1
  concurrency: 5
}
