import type * as typedoc from "typedoc/dist/lib/serialization/schema";
import type * as types from "./types";

export const getGroupNames = (
  model: types.MakeChildrenIntegers<typedoc.ContainerReflection> | undefined,
) => model?.groups?.map(({ title }) => title) ?? [];

export type GroupStates = Record<string, boolean>;
