import { Accessor, For, createEffect, createMemo } from "solid-js";
import { createStore, produce } from "solid-js/store";
import {
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
} from "@suid/material";
import * as structure from "../structure";
import { ReflectionKind } from "typedoc";

export default function Documentation(props: DocumentationProps) {
  const groupNames = createMemo(() => {
    const arr = Array.from(
      new Set(
        Object.values(props.docs()).flatMap((doc) => getGroupNames(doc())),
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

  const [topLevelNames, setTopLevelNames] = createStore<
    Record<string, Record<number, string>>
  >({});

  createEffect(() => {});

  const topLevelIds = createMemo(() =>
    Object.values(props.docs()).flatMap(
      (doc) =>
        doc()?.project.groups?.flatMap(({ title, children }) =>
          groupStates[title] === true ? children ?? [] : [],
        ) ?? [],
    ),
  );

  return (
    <Grid container>
      <Grid item sx={{ maxHeight: "100vh", overflow: "auto" }}>
        <Stack direction="row" spacing={1}>
          <For each={groupNames()}>
            {(title) => (
              <Chip
                label={title}
                variant={groupStates[title] === false ? "outlined" : "filled"}
                onClick={() => {
                  setGroupStates(
                    produce((s) => {
                      s[title] = !s[title];
                    }),
                  );
                }}
              />
            )}
          </For>
        </Stack>
        <nav aria-label={`Documented entities: ${groupNames().join(", ")}.`}>
          <List dense>
            <For each={topLevelIds()}>
              {(id) => (
                <ListItem disablePadding>
                  <ListItemButton>
                    <ListItemText primary={id} />
                  </ListItemButton>
                </ListItem>
              )}
            </For>
          </List>
        </nav>
      </Grid>
      <Divider orientation="vertical" flexItem />
      <Grid item xs>
        Content of each item
      </Grid>
    </Grid>
  );
}

export interface DocumentationProps {
  docs: Accessor<Record<string, Accessor<structure.Documentation | undefined>>>;
}

const getGroupNames = (docs: structure.Documentation | undefined) =>
  docs?.project.groups?.map(({ title }) => title) ?? [];

const getElementText = (project: structure.Documentation, id: number) => {
  const element =
    project.project.children?.[id] ??
    structure.doThrow(`Could not find element with ID ${id}`);
  // eslint-disable-next-line sonarjs/no-small-switch
  switch (element.kind) {
    case ReflectionKind.Class:
      // For classes, we are happy with the name
      return element.name;
    default:
      throw new Error(`Add implementation for ${element.kind}`);
  }
};
