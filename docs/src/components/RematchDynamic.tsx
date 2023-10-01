import {
  Component,
  JSXElement,
  createEffect,
  createSignal,
  on,
} from "solid-js";
import { Params, useParams } from "@solidjs/router";

// This component is from https://github.com/solidjs/solid-router/issues/264
// The `Show` solution discussed there does not work, because we don't use the proxy object returned by `useParams` directly
// Hence, we need to use this one.
// HOWEVER it does NOT solve the problem of Solid.JS router not calling the route function again

/**
 * Re-renders when contents of `useParams()` update.
 */
export const RematchDynamic: Component<{
  component: Component;
  on?: (params: Params) => unknown;
}> = (props) => {
  const params = useParams();
  const [page, setPage] = createSignal<JSXElement>(props.component({}));

  const paramSignal = () =>
    props.on ? props.on(params) : Object.values(params);

  createEffect(
    on(paramSignal, () => {
      setPage(() => props.component({}));
    }),
  );

  return page();
};
