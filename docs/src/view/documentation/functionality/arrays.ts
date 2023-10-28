import * as errors from "./errors";

export const ensureOneItem = <T>(items: ReadonlyArray<T> | undefined): T =>
  (items?.length === 1 ? items[0] : undefined) ??
  errors.doThrow(`Expected one item but had ${items?.length}.`);
