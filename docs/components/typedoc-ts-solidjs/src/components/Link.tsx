import { Match, Switch, useContext } from "solid-js";
import { OpenInNew } from "@suid/icons-material";
import { Link as LinkMUI } from "@suid/material";
import type * as navigation from "@typedoc-2-ts/browser";
import singleElementContext from "../context/single-element-contents";
import type * as types from "./types";
import SingleLineCode from "./SingleLineCode";

export default function Link(props: LinkProps) {
  const context = useContext(singleElementContext);
  return (
    <Switch fallback={<BrokenLink text={props.target.text} />}>
      <Match
        when={tryGetInternalLinkInfo(
          props.target.target,
          context.linkFunctionality(),
        )}
      >
        {(internalLinkInfo) => (
          <InternalLink
            href={internalLinkInfo().href}
            navigation={internalLinkInfo().navigation}
            text={props.target.text}
            onClick={context.linkFunctionality().onClick}
          />
        )}
      </Match>
      <Match
        when={tryGetExternalLinkInfo(
          props.target.target,
          context.linkFunctionality(),
        )}
      >
        {(externalLinkInfo) => (
          <ExternalLink
            href={externalLinkInfo().href}
            text={props.target.text}
          />
        )}
      </Match>
    </Switch>
  );
}

export interface LinkProps {
  target: types.InlineLink;
}

const tryGetInternalLinkInfo = (
  target: types.InlineLinkTarget,
  href: navigation.LinkHrefFunctionality,
):
  | { href: string; navigation: InternalLinkProps["navigation"] }
  | undefined => {
  switch (typeof target) {
    case "number": {
      const hrefText = href.fromReflection(target);
      return hrefText === undefined
        ? undefined
        : { href: hrefText, navigation: target };
    }
    case "string": {
      const { origin, targetURL } = getTargetURL(target);
      return targetURL.origin === origin
        ? {
            href: targetURL.href,
            navigation: true,
          }
        : undefined;
    }
  }
};

const tryGetExternalLinkInfo = (
  target: types.InlineLinkTarget,
  href: navigation.LinkHrefFunctionality,
): { href: string } | undefined => {
  switch (typeof target) {
    case "string": {
      const { origin, targetURL } = getTargetURL(target);
      return targetURL.origin === origin
        ? undefined
        : {
            href: targetURL.href,
          };
    }
    case "object": {
      const hrefText = href.fromExternalSymbol(target);
      return hrefText === undefined ? undefined : { href: hrefText };
    }
  }
};

interface BaseLinkProps {
  text: string;
}

interface InternalOrExternalLinkProps extends BaseLinkProps {
  href: string;
}

interface InternalLinkProps extends InternalOrExternalLinkProps {
  navigation: number | true;
  onClick: navigation.HandleNavigation;
}

function InternalLink(props: InternalLinkProps) {
  return (
    <LinkMUI
      href={props.href}
      onClick={(evt) => {
        evt.preventDefault();
        props.onClick({
          href: props.href,
          target: props.navigation === true ? undefined : props.navigation,
        });
      }}
    >
      {props.text}
    </LinkMUI>
  );
}

interface ExternalLinkProps extends InternalOrExternalLinkProps {
  // No additional props
}

function ExternalLink(props: ExternalLinkProps) {
  return (
    <LinkMUI
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyItems: "center",
      }}
      href={props.href}
      target={"_blank"}
      rel="noreferrer"
    >
      <span>{props.text}</span>
      <OpenInNew fontSize="inherit" />
    </LinkMUI>
  );
}
interface BrokenLinkProps extends BaseLinkProps {
  // No custom properties so far
}
function BrokenLink(props: BrokenLinkProps) {
  return <SingleLineCode>{props.text}</SingleLineCode>;
}

const getTargetURL = (href: string) => {
  const origin = window.location.origin;
  return {
    origin,
    targetURL: new URL(href, origin),
  };
};
