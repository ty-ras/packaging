import type * as types from "./types";

export const getGroupNames = (docs: types.Documentation | undefined) =>
  docs?.groups?.map(({ title }) => title) ?? [];
export type GroupStates = Record<string, boolean>;
