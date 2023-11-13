import type * as typedoc from "typedoc/dist/lib/serialization/schema";
import type * as types from "./types";

export const indexProject = ({
  children,
  ...project
}: typedoc.ProjectReflection): types.Documentation => {
  const modelIndex: types.ModelIndex = {};
  const indexReflection = (
    reflection: typedoc.DeclarationReflection,
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
            children: children?.map((child) =>
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
      children: children?.map((child) => indexReflection(child, undefined)),
    },
  };
};
