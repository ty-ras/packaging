import { Throw } from "throw-expression";
import type * as types from "./types";

export const getGroupedTopLevelElements = (
  groupNames: ReadonlyArray<string>,
  groupStates: Record<string, boolean>,
  docs: Record<string, types.Documentation>,
) =>
  groupNames
    .filter((groupName) => groupStates[groupName] === true)
    .map((groupName) => ({
      groupName,
      items: getTopLevelElements(
        docs,
        (seenGroupName) => seenGroupName === groupName,
      ),
    }));

export const getTopLevelElements = (
  docs: Record<string, types.Documentation>,
  includeGroup?: (groupName: string) => boolean,
) =>
  deduplicateTopLevelElements(
    Object.entries(docs).flatMap(([docKind, doc]) =>
      getTopLevelElementsWithMutableDocKinds(
        docKind,
        doc,
        includeGroup ?? (() => true),
      ),
    ),
  );

const getTopLevelElementsWithMutableDocKinds = (
  docKind: string,
  documentation: types.Documentation,
  includeGroup: (groupName: string) => boolean,
): Array<TopLevelElement<Set<string>>> => {
  const globalContext: GlobalElementContext = {
    project: documentation.project,
    index: documentation.modelIndex,
    docKind,
  };
  return (
    documentation.project.groups
      ?.filter(({ title }) => includeGroup(title))
      .flatMap(
        ({ children }) =>
          children?.map((id) => {
            const element =
              documentation.modelIndex[id] ??
              Throw(
                `Could not find element with ID ${id} in ${documentation.project.packageName}@${documentation.project.packageVersion}`,
              );
            return {
              allDocKinds: new Set([docKind]),
              id,
              text: element.name,
              element,
              globalContext,
              showKind: false, // Will be set to true by deduplication if needed
            };
          }) ?? [],
      ) ?? []
  );
};

const deduplicateTopLevelElements = (
  elements: ReturnType<typeof getTopLevelElementsWithMutableDocKinds>,
): Array<TopLevelElement> => {
  const retVal = Object.values(
    elements.reduce<
      Record<string, Record<string, TopLevelElement<Set<string>>>>
    >((state, item) => {
      const key = item.text;
      const docKind = item.globalContext.docKind;
      if (key in state) {
        const sameByDocKind = state[key];
        if (docKind in sameByDocKind) {
          throw new Error(
            `Duplicate exported member ${item.text} in kind ${docKind}.`,
          );
        } else if (
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
          sameByDocKind[docKind] = item;
        } else {
          Object.values(sameByDocKind).forEach((el) =>
            el.allDocKinds.add(docKind),
          );
        }
      } else {
        state[key] = { [docKind]: item };
      }
      return state;
    }, {}),
  ).flatMap((byDocKind): Array<TopLevelElement> => {
    const retVal = Object.values(byDocKind);
    if (retVal.length > 1) {
      retVal.forEach((otherItem) => (otherItem.showKind = true));
    }
    return retVal.map(({ allDocKinds, ...element }) => ({
      ...element,
      allDocKinds: Array.from(allDocKinds),
    }));
  });

  retVal.sort(({ text: xText }, { text: yText }) => xText.localeCompare(yText));
  return retVal;
};

export interface TopLevelElement<TAllDocKinds = ReadonlyArray<string>> {
  allDocKinds: TAllDocKinds;
  id: number;
  text: string;
  showKind: boolean;
  element: types.IndexableModel;
  globalContext: GlobalElementContext;
}

export interface GlobalElementContext {
  project: types.Project;
  index: types.ModelIndex;
  docKind: string;
}

export interface TopLevelElementGroup {
  groupName: string;
  items: Array<TopLevelElement>;
}
