import { createSignal, createResource, createEffect } from "solid-js";
import * as routing from "../routing";
import Header from "./TyRASDocumentationHeader";
import Contents, { type Documentation } from "./Documentation";

export default function TyRASDocumentation() {
  const [params, setParams] = createSignal(
    routing.parseParamsAndMaybeNewURL(window.location.hash).params,
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
