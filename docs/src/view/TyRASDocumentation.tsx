import { createSignal, createResource, createEffect } from "solid-js";
import * as routing from "../structure";
import Header from "./TyRASDocumentationHeader";
import Contents, { type Documentation } from "./Documentation";

export default function TyRASDocumentation() {
  const [params, setParams] = createSignal(
    parseParamsAndMaybeNewURL(window.location.hash).params,
  );

  createEffect(() => {
    const paramsValue = params();
    const fromParams = routing.buildNavigationURL(paramsValue);
    if (window.location.hash !== fromParams) {
      window.location.hash = fromParams;
    }
  });

  const useResource = (versionKind: routing.VersionKind | undefined) => {
    const [resource] = createResource<
      Documentation | undefined,
      routing.DocumentationParams
    >(params, async (paramsValue) => {
      // TODO maybe cache value here? key: data URL, value: promise
      const dataURL = routing.buildDataURL(paramsValue, versionKind);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return dataURL === undefined
        ? undefined
        : await (await fetch(dataURL)).json();
    });
    return resource;
  };

  const serverDocs = useResource("server");
  const clientDocs = useResource("client");
  const protocolDocs = useResource(undefined);
  return (
    <>
      <Header params={params} setParams={setParams} />
      <Contents
        protocolDocs={protocolDocs()}
        serverDocs={serverDocs()}
        clientDocs={clientDocs()}
      />
    </>
  );
}

export const parseParamsAndMaybeNewURL = (pathname: string) => {
  let paramsOrFullURL = parseParamsFromPathname(pathname);
  let maybeURL: string | undefined;
  if (isNavigate(paramsOrFullURL)) {
    maybeURL = paramsOrFullURL;
    // The given URL was really partial
    paramsOrFullURL = parseParamsFromPathname(paramsOrFullURL);
    if (isNavigate(paramsOrFullURL)) {
      // If we get partial URL again even after rsult of parseParamsFromPathname, we have encountered internal error
      throw new Error(
        `The given partial navigation URL "${pathname}" was resolved to be partial even on 2nd attempt, this signals error in URL parsing logic.`,
      );
    }
  }

  return { params: paramsOrFullURL, maybeURL };
};

const parseParamsFromPathname = (
  pathname: string,
): DocumentationParamsOrNavigate => {
  const fragments = pathname
    .split("/")
    .filter((fragment) => fragment.length > 0);

  const [
    dataValidationFragment,
    serverFragment,
    serverVersionFragment,
    clientFragment,
    clientVersionFragment,
  ] = fragments;
  const dataValidation = inArrayOrFirst(
    dataValidationFragment,
    routing.tyrasStructure.dataValidation,
  );
  let urlValid = dataValidation === dataValidationFragment;
  const dvValid = urlValid;
  const protocolVersion = inArrayOrFirst(
    serverFragment,
    routing.tyrasVersions.protocol[dataValidation],
  );
  let params: routing.DocumentationParams;
  if (urlValid && protocolVersion === serverFragment) {
    params = { kind: "protocol", dataValidation, protocolVersion };
  } else {
    const versions = routing.tyrasVersions.specific[dataValidation];
    const server = inArrayOrFirst(
      serverFragment,
      routing.tyrasStructure.server,
    );
    const serverVersion = inArrayOrFirst(
      serverVersionFragment,
      versions.server[server],
    );
    urlValid =
      urlValid &&
      server === serverFragment &&
      serverVersion === serverVersionFragment;
    if (urlValid && clientFragment === undefined) {
      params = {
        kind: "server",
        dataValidation,
        server: { name: server, version: serverVersion },
      };
    } else {
      const client = inArrayOrFirst(
        clientFragment,
        routing.tyrasStructure.client,
      );
      const clientVersion = inArrayOrFirst(
        clientVersionFragment,
        versions.client[client],
      );
      urlValid =
        urlValid &&
        client === clientFragment &&
        clientVersion === clientVersionFragment;
      params =
        dvValid &&
        server === routing.ASPECT_NONE &&
        serverVersion === routing.ASPECT_NONE
          ? {
              kind: "client",
              dataValidation,
              client: {
                name: client,
                version: clientVersion,
              },
            }
          : {
              kind: "server-and-client",
              dataValidation,
              server: {
                name: server,
                version: serverVersion,
              },
              client: {
                name: client,
                version: clientVersion,
              },
            };
    }
  }

  return urlValid ? params : routing.buildNavigationURL(params);
};

type DocumentationParamsOrNavigate = routing.DocumentationParams | string;

const isNavigate = (
  paramsOrNavigate: DocumentationParamsOrNavigate,
): paramsOrNavigate is string => typeof paramsOrNavigate === "string";

const inArrayOrFirst = (
  item: string | undefined,
  array: ReadonlyArray<string>,
): string => (!!item && array.indexOf(item) >= 0 ? item : array[0]);
