import { Throw } from "throw-expression";

export const ensureOneItem = <T>(items: ReadonlyArray<T> | undefined): T =>
  (items?.length === 1 ? items[0] : undefined) ??
  Throw(`Expected one item but had ${items?.length}.`);
