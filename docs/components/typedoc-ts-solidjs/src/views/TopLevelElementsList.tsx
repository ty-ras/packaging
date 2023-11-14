import { For, useContext } from "solid-js";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
} from "@suid/material";
import type * as functionality from "@typedoc-2-ts/browser";
import linkFunctionalityContext from "../context-def/link-functionality";

export default function TopLevelElementsList(props: TopLevelElementsListProps) {
  const linkFunctionality = useContext(linkFunctionalityContext);
  return (
    <List dense sx={{ "& ul": { padding: 0 } }} subheader={<li />}>
      <For each={props.elements}>
        {({ groupName, items }) => (
          <li>
            <ul>
              <ListSubheader>{groupName}</ListSubheader>
              <For each={items}>
                {(element, index) => {
                  const func = linkFunctionality.linkFunctionality();
                  const context = element.element;
                  const target = context.id;
                  const href = func.fromReflection(context, target);
                  return (
                    <ListItem disablePadding>
                      <ListItemButton
                        autoFocus={
                          index() === 0 && props.lastSelectedGroup === groupName
                        }
                        component="a"
                        href={href}
                        onClick={(evt) => {
                          evt.preventDefault();
                          if (href) {
                            func.onClick({ context, href, target });
                          }
                        }}
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
                  );
                }}
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
  lastSelectedGroup: string | undefined;
}
