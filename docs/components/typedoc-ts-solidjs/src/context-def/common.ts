export const requiresContext =
  (contextName: string): (() => never) =>
  () => {
    throw new Error(
      `Please use ${contextName}ContextProvider as ancestor of this element`,
    );
  };
