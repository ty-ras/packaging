import { type JSX, Match, Switch, useContext } from "solid-js";
import { OpenInNew } from "@suid/icons-material";
import { Link as LinkMUI } from "@suid/material";
import type * as navigation from "@typedoc-2-ts/browser";
import linkFunctionalityContext from "../context-def/link-functionality";
import type * as typedoc from "typedoc";
import SingleLineCode from "./SingleLineCode";

export default function Link(props: LinkProps) {
  const context = useContext(linkFunctionalityContext);
  return (
    <Switch fallback={<BrokenLink text={props.target.text} />}>
      <Match
        when={tryGetInternalLinkInfo(
          props.linkContext,
          props.target,
          context.linkFunctionality(),
        )}
      >
        {(internalLinkInfo) => (
          <InternalLink
            context={props.linkContext}
            href={internalLinkInfo().href}
            navigation={internalLinkInfo().navigation}
            // Don't use props.target.text, as it might be something like "<import name>.<type name>"
            text={internalLinkInfo().text}
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
  children?: JSX.Element;
  linkContext: navigation.LinkContext;
  target: InlineLink;
}

export interface InlineLink {
  text: string;
  target: InlineLinkTarget;
}

export type InlineLinkTarget = Exclude<
  typedoc.JSONOutput.InlineTagDisplayPart["target"],
  undefined
>;

const tryGetInternalLinkInfo = (
  context: navigation.LinkContext,
  { target, text }: InlineLink,
  href: navigation.LinkFunctionality,
):
  | (navigation.InternalLinkInfo & {
      navigation: InternalLinkProps["navigation"];
    })
  | undefined => {
  switch (typeof target) {
    case "number": {
      const info = href.fromReflection(context, target);
      return info === undefined ? undefined : { ...info, navigation: target };
    }
    case "string": {
      const { origin, targetURL } = getTargetURL(target);
      return targetURL.origin === origin
        ? {
            text,
            href: targetURL.href,
            navigation: true,
          }
        : undefined;
    }
  }
};

const tryGetExternalLinkInfo = (
  target: InlineLinkTarget,
  href: navigation.LinkFunctionality,
): navigation.ExternalLinkInfo | undefined => {
  switch (typeof target) {
    case "string": {
      const { origin, targetURL } = getTargetURL(target);
      return targetURL.origin === origin
        ? undefined
        : {
            href: targetURL.href,
          };
    }
    case "object":
      return href.fromExternalSymbol(target);
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
  context: navigation.LinkContext;
}

function InternalLink(props: InternalLinkProps) {
  return (
    <LinkMUI
      href={props.href}
      onClick={(evt) => {
        evt.preventDefault();
        props.onClick({
          context: props.context,
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
