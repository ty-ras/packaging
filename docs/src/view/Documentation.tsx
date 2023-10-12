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
  ListSubheader,
  Stack,
  Typography,
} from "@suid/material";
import * as structure from "../structure";
import type * as typedoc from "typedoc/dist/lib/serialization/schema";

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
    Array<{
      groupName: string;
      items: Array<TopLevelElement>;
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
              getAllTopLevelElements(docKind, doc(), groupName, groupStates),
            ),
          ),
        })),
    );
  });

  const [currentContent, setCurrentContent] = createSignal<
    TopLevelElement | undefined
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
          <List dense sx={{ "& ul": { padding: 0 } }} subheader={<li />}>
            <For each={topLevelElements}>
              {({ groupName, items }) => (
                <li>
                  <ul>
                    <ListSubheader>{groupName}</ListSubheader>
                    <For each={items}>
                      {(element) => (
                        <ListItem disablePadding>
                          <ListItemButton
                            onClick={() => setCurrentContent(element)}
                          >
                            <ListItemText primary={element.text} />
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
      </Grid>
      <Divider orientation="vertical" flexItem />
      <Grid item xs>
        <Typography>
          {JSON.stringify(currentContent()?.element ?? {}, undefined, 2)}
        </Typography>
      </Grid>
    </Grid>
  );
}

export interface DocumentationProps {
  docs: Accessor<Record<string, Accessor<structure.Documentation | undefined>>>;
}

interface TopLevelElement {
  docKind: string;
  id: number;
  text: string;
  showKind: boolean;
  element: typedoc.DeclarationReflection;
  project: typedoc.ProjectReflection;
}

const getGroupNames = (docs: structure.Documentation | undefined) =>
  docs?.project.groups?.map(({ title }) => title) ?? [];

const getAllTopLevelElements = (
  docKind: string,
  documentation: structure.Documentation | undefined,
  groupName: string,
  groupStates: Record<string, boolean>,
): Array<TopLevelElement> =>
  documentation?.project.groups
    ?.filter(({ title }) => title === groupName)
    .flatMap(({ title, children }) =>
      groupStates[title] === true
        ? children?.map((id) => {
            const element =
              documentation.project.children?.find(
                ({ id: childId }) => childId === id,
              ) ??
              structure.doThrow(
                `Could not find element with ID ${id} in ${documentation.project.packageName}`,
              );
            return {
              docKind,
              id,
              text: getElementText(element),
              element,
              project: documentation.project,
              showKind: false, // Will be set to true by deduplication if needed
            };
          }) ?? []
        : [],
    ) ?? [];

const getElementText = (element: typedoc.DeclarationReflection) => {
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

const deduplicateTopLevelElements = (
  elements: ReturnType<typeof getAllTopLevelElements>,
) => {
  const retVal = Object.values(
    elements.reduce<{
      names: Record<string, Record<string, TopLevelElement>>;
      elements: Array<TopLevelElement>;
    }>(
      (state, item) => {
        const key = item.text;
        let addElement = true;
        if (key in state.names) {
          const otherElement = state.names[key];
          if (otherElement.docKind !== item.docKind) {
            // This is acceptable situation, just need to adjust the element
            otherElement.showKind = true;
            item.showKind = true;
          } else if (
            otherElement.element.sources?.length !==
              item.element.sources?.length ||
            otherElement.element.sources?.some(
              (other, idx) =>
                other.fileName !== item.element.sources?.[idx].fileName,
            )
          ) {
            throw new Error(
              `Duplicate exported member ${item.text} which was not identical based on file name.`,
            );
          } else {
            addElement = false;
          }
        } else {
          state.names[key][item.docKind] = item;
        }
        if (addElement) {
          state.elements.push(item);
        }
        return state;
      },
      {
        names: {},
        elements: [],
      },
    ),
  );

  retVal.sort(({ text: xText }, { text: yText }) => xText.localeCompare(yText));
  return retVal;
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
