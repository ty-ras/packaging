export const doThrow = (msg: string, ...args: Array<unknown>) => {
  if (args.length > 0) {
    // eslint-disable-next-line no-console
    console.error(msg, ...args);
  }
  throw new Error(msg);
};
