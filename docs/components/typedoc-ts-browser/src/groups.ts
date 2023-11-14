import type * as typedoc from "typedoc";
import type * as types from "./types";

export const getGroupNames = (
  model:
    | types.MakeChildrenIntegers<typedoc.JSONOutput.ContainerReflection>
    | undefined,
): Array<string> => model?.groups?.map(({ title }) => title) ?? [];

export type GroupStates = Record<string, boolean>;
