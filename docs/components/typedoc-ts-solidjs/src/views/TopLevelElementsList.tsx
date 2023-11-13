import { For } from "solid-js";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
} from "@suid/material";
import type * as functionality from "@typedoc-2-ts/browser";

export default function TopLevelElementsList(props: TopLevelElementsListProps) {
  return (
    <List dense sx={{ "& ul": { padding: 0 } }} subheader={<li />}>
      <For each={props.elements}>
        {({ groupName, items }) => (
          <li>
            <ul>
              <ListSubheader>{groupName}</ListSubheader>
              <For each={items}>
                {(element, index) => (
                  <ListItem disablePadding>
                    <ListItemButton
                      autoFocus={
                        index() === 0 && props.lastSelectedGroup === groupName
                      }
                      onClick={() => props.setCurrentElement(element)}
                    >
                      <ListItemText
                        primary={element.text}
                        secondary={
                          element.showKind
                            ? element.globalContext.docKind
                            : undefined
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
  );
}

export interface TopLevelElementsListProps {
  elements: Array<functionality.TopLevelElementGroup>;
  setCurrentElement: (element: functionality.TopLevelElement) => void;
  lastSelectedGroup: string | undefined;
}
