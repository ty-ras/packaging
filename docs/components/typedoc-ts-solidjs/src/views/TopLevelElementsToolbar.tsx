import { For, Match, Setter, Switch, batch } from "solid-js";
import { SetStoreFunction, produce } from "solid-js/store";
import {
  CheckBoxOutlineBlankRounded,
  CheckBoxRounded,
} from "@suid/icons-material";
import { Chip, Toolbar } from "@suid/material";
import type * as functionality from "@typedoc-2-ts/browser";

export default function TopLevelElementsToolbar(
  props: TopLevelElementsToolbarProps,
) {
  return (
    <Toolbar>
      <For each={props.groupNames}>
        {(title) => {
          const onIconClick = () => {
            batch(() => {
              props.setLastSelectedGroup(undefined);
              props.setGroupStates(
                produce((s) => {
                  s[title] = !s[title];
                }),
              );
            });
          };
          return (
            <Chip
              label={title}
              variant={
                props.groupStates[title] === false ? "outlined" : "filled"
              }
              icon={
                <Switch fallback={<CheckBoxRounded onClick={onIconClick} />}>
                  <Match when={props.groupStates[title] === false}>
                    <CheckBoxOutlineBlankRounded onClick={onIconClick} />
                  </Match>
                </Switch>
              }
              onClick={() => {
                props.setLastSelectedGroup(title);
              }}
            />
          );
        }}
      </For>
    </Toolbar>
  );
}

export interface TopLevelElementsToolbarProps {
  groupNames: Array<string>;
  groupStates: functionality.GroupStates;
  setGroupStates: SetStoreFunction<functionality.GroupStates>;
  setLastSelectedGroup: Setter<string | undefined>;
}
