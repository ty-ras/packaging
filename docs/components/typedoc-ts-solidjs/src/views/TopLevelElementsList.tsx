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
                  const info = func.fromReflection(context, target);
                  return (
                    <ListItem disablePadding>
                      <ListItemButton
                        autoFocus={
                          index() === 0 && props.lastSelectedGroup === groupName
                        }
                        component="a"
                        href={info?.href}
                        onClick={(evt) => {
                          evt.preventDefault();
                          if (info) {
                            func.onClick({ context, href: info.href, target });
                          }
                        }}
                      >
                        <ListItemText
                          primary={info?.text ?? element.text}
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
