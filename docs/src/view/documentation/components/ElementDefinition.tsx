import { Box } from "@suid/material";
import { For, Match, Show, Switch } from "solid-js";
import * as functionality from "../functionality";
import type * as types from "./types";
import SingleLineCode from "./SingleLineCode";

/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */

export default function ElementDefinition(props: ElementDefinitionProps) {
  return (
    <Box>
      <SingleLineCode>
        <b>{functionality.getReflectionKindTitle(props.element.kind)}</b>{" "}
        {props.element.name}
        <Switch>
          <Match
            when={props.element.kind === functionality.ReflectionKind.Class}
          >
            <Show when={props.element.typeParameters}>
              {(typeParams) => (
                <>
                  {"<"}
                  <For each={typeParams()}>
                    {(typeParam, index) => (
                      <>
                        {typeParam.name}
                        {typeParam.type &&
                          ` extends ${functionality.getSomeTypeText(
                            typeParam.type,
                          )}`}
                        {typeParam.default &&
                          ` = ${functionality.getSomeTypeText(
                            typeParam.default,
                          )}`}
                        {index() === typeParams().length - 1 ? "" : ", "}
                      </>
                    )}
                  </For>
                  {">"}
                </>
              )}
            </Show>
            <Show when={props.element.extendedTypes}>
              {(parentTypes) => (
                <>
                  {" extends "}
                  <For each={parentTypes()}>
                    {(parentType, index) => (
                      <>
                        {functionality.getSomeTypeText(parentType)}
                        {index() === parentTypes().length - 1 ? "" : ", "}
                      </>
                    )}
                  </For>
                </>
              )}
            </Show>
            <Show when={props.element.implementedTypes}>
              {(implementedTypes) => (
                <>
                  {" implements "}
                  <For each={implementedTypes()}>
                    {(implementedType, index) => (
                      <>
                        {functionality.getSomeTypeText(implementedType)}
                        {index() === implementedTypes().length - 1 ? "" : ", "}
                      </>
                    )}
                  </For>
                </>
              )}
            </Show>
          </Match>
        </Switch>
      </SingleLineCode>
    </Box>
  );
}

export interface ElementDefinitionProps extends types.ReflectionElementProps {
  // Currently no extra properties
}
