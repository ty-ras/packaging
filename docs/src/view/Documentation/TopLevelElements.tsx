import {
  Accessor,
  Setter,
  For,
  Match,
  Switch,
  batch,
  createEffect,
  createMemo,
  createSignal,
} from "solid-js";
import { createStore, produce } from "solid-js/store";
import {
  AppBar,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Stack,
} from "@suid/material";
import {
  CheckBoxRounded,
  CheckBoxOutlineBlankRounded,
} from "@suid/icons-material";
import type * as types from "./types";
import * as structure from "../../structure";

export default function TopLevelElements(props: TopLevelElementsProps) {
  const groupNames = createMemo(() => {
    const arr = Array.from(
      new Set(
        Object.values(props.docs()).flatMap((doc) => getGroupNames(doc)),
      ).values(),
    );
    arr.sort();
    return arr;
  });

  const [groupStates, setGroupStates] = createStore<Record<string, boolean>>(
    {},
  );

  createEffect(() => {
    setGroupStates(
      Object.fromEntries(
        groupNames().map((key) => [key, groupStates[key] ?? true] as const),
      ),
    );
  });

  const [topLevelElements, setTopLevelElements] = createStore<
    Array<{
      groupName: string;
      items: Array<types.TopLevelElement>;
    }>
  >([]);

  createEffect(() => {
    setTopLevelElements(
      groupNames()
        .filter((groupName) => groupStates[groupName] === true)
        .map((groupName) => ({
          groupName,
          items: deduplicateTopLevelElements(
            Object.entries(props.docs()).flatMap(([docKind, doc]) =>
              getAllTopLevelElements(docKind, doc, groupName, groupStates),
            ),
          ),
        })),
    );
  });

  const [lastSelectedGroup, setLastSelectedGroup] = createSignal<
    string | undefined
  >();

  return (
    <>
      <AppBar position="sticky">
        <Stack direction="row" spacing={1}>
          <For each={groupNames()}>
            {(title) => {
              const onIconClick = () => {
                batch(() => {
                  setLastSelectedGroup(undefined);
                  setGroupStates(
                    produce((s) => {
                      s[title] = !s[title];
                    }),
                  );
                });
              };
              return (
                <Chip
                  label={title}
                  variant={groupStates[title] === false ? "outlined" : "filled"}
                  icon={
                    <Switch
                      fallback={<CheckBoxRounded onClick={onIconClick} />}
                    >
                      <Match when={groupStates[title] === false}>
                        <CheckBoxOutlineBlankRounded onClick={onIconClick} />
                      </Match>
                    </Switch>
                  }
                  onClick={() => {
                    setLastSelectedGroup(title);
                  }}
                />
              );
            }}
          </For>
        </Stack>
      </AppBar>
      <nav aria-label={`Documented entities: ${groupNames().join(", ")}.`}>
        <List dense sx={{ "& ul": { padding: 0 } }} subheader={<li />}>
          <For each={topLevelElements}>
            {({ groupName, items }) => (
              <li>
                <ul>
                  <ListSubheader>{groupName}</ListSubheader>
                  <For each={items}>
                    {(element, index) => (
                      <ListItem disablePadding>
                        <ListItemButton
                          autoFocus={
                            index() === 0 && lastSelectedGroup() === groupName
                          }
                          onClick={() => props.setCurrentContent(element)}
                        >
                          <ListItemText
                            primary={element.text}
                            secondary={
                              element.showKind ? element.docKind : undefined
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                    )}
                  </For>
                </ul>
              </li>
            )}
          </For>
        </List>
      </nav>
    </>
  );
}

export interface TopLevelElementsProps {
  docs: Accessor<Record<string, types.Documentation | undefined>>;
  setCurrentContent: Setter<types.TopLevelElement | undefined>;
}

const getGroupNames = (docs: types.Documentation | undefined) =>
  docs?.groups?.map(({ title }) => title) ?? [];

const getAllTopLevelElements = (
  docKind: string,
  documentation: types.Documentation | undefined,
  groupName: string,
  groupStates: Record<string, boolean>,
): Array<types.TopLevelElement> =>
  documentation?.groups
    ?.filter(({ title }) => title === groupName)
    .flatMap(({ title, children }) =>
      groupStates[title] === true
        ? children?.map((id) => {
            const element =
              documentation.children?.find(
                ({ id: childId }) => childId === id,
              ) ??
              structure.doThrow(
                `Could not find element with ID ${id} in ${documentation.packageName}`,
              );
            return {
              docKind,
              id,
              text: element.name,
              element,
              project: documentation,
              showKind: false, // Will be set to true by deduplication if needed
            };
          }) ?? []
        : [],
    ) ?? [];

const deduplicateTopLevelElements = (
  elements: ReturnType<typeof getAllTopLevelElements>,
) => {
  const retVal = Object.values(
    elements.reduce<Record<string, Record<string, types.TopLevelElement>>>(
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
