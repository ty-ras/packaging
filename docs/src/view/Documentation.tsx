import { Accessor, For, createEffect, createMemo } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { Chip, Divider, Grid, List, Stack, Typography } from "@suid/material";
import type * as structure from "../structure";

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
    setGroupStates({
      ...Object.fromEntries(
        groupNames().map((key) => [key, groupStates[key] ?? true] as const),
      ),
    });
  });

  const topLevelIds = createMemo(() =>
    Object.values(props.docs()).flatMap(
      (doc) =>
        doc()?.project.groups?.map(({ title, children }) =>
          groupStates[title] === true ? children : undefined,
        ) ?? [],
    ),
  );

  return (
    <Grid container>
      <Grid item>
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
        <List>
          <For each={topLevelIds()}>
            {(id) => <Typography>{id}</Typography>}
          </For>
        </List>
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
