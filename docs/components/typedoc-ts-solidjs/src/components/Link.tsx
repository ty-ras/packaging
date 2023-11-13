import {
  Match,
  Show,
  Switch,
  createMemo,
  useContext,
  type JSX,
} from "solid-js";
import { OpenInNew } from "@suid/icons-material";
import { Link as LinkMUI } from "@suid/material";
import type * as typedoc from "typedoc/dist/lib/serialization/schema";
import type * as navigation from "@typedoc-2-ts/browser";
import singleElementContext from "../context/single-element-contents";
import type * as types from "./types";
import SingleLineCode from "./SingleLineCode";

export default function Link(props: LinkProps) {
  const context = useContext(singleElementContext);
  const hrefInfo = createMemo(() =>
    getLinkHrefInfo(props.target.target, context.linkFunctionality()),
  );
  return (
    <Switch fallback={<SingleLineCode>{props.target.text}</SingleLineCode>}>
      <Match when={hrefInfo().href}>
        {(href) => (
          <Anchor
            href={href()}
            text={props.target.text}
            navigation={hrefInfo().navigation}
            onClick={context.linkFunctionality().onClick}
          />
        )}
      </Match>
    </Switch>
  );
}

export interface LinkProps {
  target: types.InlineLink;
}

const getLinkHrefInfo = (
  target: types.InlineLinkTarget,
  href: navigation.LinkHrefFunctionality,
): LinkHrefInfo => {
  switch (typeof target) {
    case "number":
      return { href: href.fromReflection(target), navigation: target };
    case "string": {
      const origin = window.location.origin;
      const targetURL = new URL(target, origin);
      return {
        href: targetURL.href,
        navigation: targetURL.origin === origin ? true : undefined,
      };
    }
    case "object":
      return { href: href.fromExternalSymbol(target), navigation: undefined };
    default:
      throw new Error(`Unrecognized target ${target}`);
  }
};

interface LinkHrefInfo {
  href: string | undefined;
  navigation: NavigationInfo | undefined;
}
type NavigationInfo = number | typedoc.ReflectionSymbolId | true;

// <SwitchDiscriminating object={obj} discriminator="type" fallback={(objFallback) => <></>}>
//   <Match when="kind1">{(objKind1) => <></>}</Match>
//   <Match when="kind2">{(objKind2) => <></>}</Match>
// </SwitchDiscriminating>

interface AnchorProps {
  href: string;
  navigation: NavigationInfo | undefined;
  text: string;
  onClick: navigation.HandleNavigation;
}

function Anchor(props: AnchorProps) {
  return (
    <LinkMUI
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyItems: "center",
      }}
      href={props.href}
      onClick={
        props.navigation === undefined || typeof props.navigation === "object"
          ? undefined
          : getEventHandler(props.href, props.navigation, props.onClick)
      }
      target={props.navigation === undefined ? "_blank" : undefined}
    >
      <span>{props.text}</span>
      <Show when={props.navigation === undefined}>
        <OpenInNew fontSize="small" />
      </Show>
    </LinkMUI>
  );
}

const getEventHandler =
  (
    href: string,
    target: Exclude<NavigationInfo, typedoc.ReflectionSymbolId>,
    onClick: AnchorProps["onClick"],
  ): JSX.EventHandlerUnion<HTMLAnchorElement, MouseEvent> =>
  (evt) => {
    evt.preventDefault();
    onClick({ href, target: target === true ? undefined : target });
  };
