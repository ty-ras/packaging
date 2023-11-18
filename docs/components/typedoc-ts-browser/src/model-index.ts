import type * as typedoc from "typedoc";
import type * as types from "./types";

export const indexProject = ({
  children,
  ...project
}: typedoc.JSONOutput.ProjectReflection): types.Documentation => {
  const modelIndex: types.ModelIndex = {};
  const indexReflection = (
    reflection: typedoc.JSONOutput.DeclarationReflection,
    parentId: number | undefined,
  ): number => {
    const id = reflection.id;
    if (id in modelIndex) {
      throw new Error(`Duplicate ID ${id}`);
    }
    const { children, ...rest } = reflection;
    modelIndex[id] = {
      ...rest,
      ...((children?.length ?? 0) > 0
        ? {
            childIDs: children?.map((child) =>
              indexReflection(child, reflection.id),
            ),
          }
        : {}),
      ...(parentId === undefined ? {} : { parentId }),
    } as types.IndexableModel;
    return id;
  };

  return {
    modelIndex,
    project: {
      ...project,
      childIDs: children?.map((child) => indexReflection(child, undefined)),
    },
  };
};
