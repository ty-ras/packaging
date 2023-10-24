import type * as types from "./types";
import * as errors from "./errors";

export const getTopLevelElementsFromMultipleDocumentations = (
  groupNames: ReadonlyArray<string>,
  groupStates: Record<string, boolean>,
  docs: Record<string, types.Documentation>,
) =>
  groupNames
    .filter((groupName) => groupStates[groupName] === true)
    .map((groupName) => ({
      groupName,
      items: deduplicateTopLevelElements(
        Object.entries(docs).flatMap(([docKind, doc]) =>
          getTopLevelElements(docKind, doc, groupName, groupStates),
        ),
      ),
    }));

export const getTopLevelElements = (
  docKind: string,
  documentation: types.Documentation,
  groupName: string,
  groupStates: Record<string, boolean>,
): Array<TopLevelElement> =>
  documentation.project.groups
    ?.filter(({ title }) => title === groupName)
    .flatMap(({ title, children }) =>
      groupStates[title] === true
        ? children?.map((id) => {
            const element =
              documentation.modelIndex[id] ??
              errors.doThrow(
                `Could not find element with ID ${id} in ${documentation.project.packageName}@${documentation.project.packageVersion}`,
              );
            return {
              docKind,
              id,
              text: element.name,
              element,
              index: documentation.modelIndex,
              showKind: false, // Will be set to true by deduplication if needed
            };
          }) ?? []
        : [],
    ) ?? [];

export const deduplicateTopLevelElements = (
  elements: ReturnType<typeof getTopLevelElements>,
) => {
  const retVal = Object.values(
    elements.reduce<Record<string, Record<string, TopLevelElement>>>(
      (state, item) => {
        const key = item.text;
        if (key in state) {
          const sameByDocKind = state[key];
          if (item.docKind in sameByDocKind) {
            throw new Error(
              `Duplicate exported member ${item.text} in kind ${item.docKind}.`,
            );
          } else {
            if (
              Object.values(sameByDocKind).some(
                (otherElement) =>
                  otherElement.element.sources?.length !==
                    item.element.sources?.length ||
                  otherElement.element.sources?.some(
                    (other, idx) =>
                      other.fileName !== item.element.sources?.[idx].fileName,
                  ),
              )
            ) {
              // This is not a shared top-level element (= not in "protocol" packages)
              sameByDocKind[item.docKind] = item;
            }
          }
        } else {
          state[key] = { [item.docKind]: item };
        }
        return state;
      },
      {},
    ),
  ).flatMap((byDocKind) => {
    const retVal = Object.values(byDocKind);
    if (retVal.length > 1) {
      retVal.forEach((otherItem) => (otherItem.showKind = true));
    }
    return retVal;
  });

  retVal.sort(({ text: xText }, { text: yText }) => xText.localeCompare(yText));
  return retVal;
};

export interface TopLevelElement {
  docKind: string;
  id: number;
  text: string;
  showKind: boolean;
  element: types.IndexableModel;
  index: types.ModelIndex;
}

export interface TopLevelElementGroup {
  groupName: string;
  items: Array<TopLevelElement>;
}
