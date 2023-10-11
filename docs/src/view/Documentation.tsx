import {
  Accessor,
  For,
  createEffect,
  createMemo,
  createSignal,
} from "solid-js";
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
  Typography,
} from "@suid/material";
import * as structure from "../structure";

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

  const [topLevelElements, setTopLevelElements] = createStore<
    Array<{ docKind: string; id: number; text: string }>
  >([]);

  // TODO make sticky headers
  createEffect(() => {
    setTopLevelElements(
      groupNames()
        .filter((groupName) => groupStates[groupName] === true)
        .flatMap((groupName) =>
          Object.entries(props.docs()).flatMap(([docKind, doc]) => {
            const docObj = doc();
            return (
              docObj?.project?.groups
                ?.filter(({ title }) => title === groupName)
                .flatMap(({ title, children }) =>
                  groupStates[title] === true
                    ? children?.map((id) => ({
                        docKind,
                        id,
                        text: getElementText(docObj, id),
                      })) ?? []
                    : [],
                ) ?? []
            );
          }),
        ),
    );
  });

  const [currentContent, setCurrentContent] = createSignal<
    { docKind: string; id: number } | undefined
  >();

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
            <For each={topLevelElements}>
              {({ docKind, id, text }) => (
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => setCurrentContent({ docKind, id })}
                  >
                    <ListItemText primary={text} />
                  </ListItemButton>
                </ListItem>
              )}
            </For>
          </List>
        </nav>
      </Grid>
      <Divider orientation="vertical" flexItem />
      <Grid item xs>
        <Typography>
          Content for {currentContent()?.docKind} and {currentContent()?.id}
        </Typography>
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
    project.project.children?.find(({ id: childId }) => childId === id) ??
    structure.doThrow(
      `Could not find element with ID ${id} in ${project.project.packageName}`,
    );
  // eslint-disable-next-line sonarjs/no-small-switch
  switch (element.kind) {
    case ReflectionKind.Interface:
    case ReflectionKind.Class:
    case ReflectionKind.Function:
    case ReflectionKind.TypeAlias:
    case ReflectionKind.ObjectLiteral:
    case ReflectionKind.Variable:
      return element.name;
    default:
      throw new Error(`Add implementation for ${element.kind}`);
  }
};

// We can't include this from typedoc package in browsers
// See: https://github.com/TypeStrong/typedoc/issues/1861
enum ReflectionKind {
  Project = 0x1,
  Module = 0x2,
  Namespace = 0x4,
  Enum = 0x8,
  EnumMember = 0x10,
  Variable = 0x20,
  Function = 0x40,
  Class = 0x80,
  Interface = 0x100,
  Constructor = 0x200,
  Property = 0x400,
  Method = 0x800,
  CallSignature = 0x1000,
  IndexSignature = 0x2000,
  ConstructorSignature = 0x4000,
  Parameter = 0x8000,
  TypeLiteral = 0x10000,
  TypeParameter = 0x20000,
  Accessor = 0x40000,
  GetSignature = 0x80000,
  SetSignature = 0x100000,
  ObjectLiteral = 0x200000,
  TypeAlias = 0x400000,
  Event = 0x800000,
  Reference = 0x1000000,
}
