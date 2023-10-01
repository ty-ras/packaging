import * as routing from "../routing";
import Header from "./TyRASDocumentationHeader";
import Contents from "./Documentation";

export default function TyRASDocumentation() {
  const serverDocs = routing.useRouteData("server");
  const clientDocs = routing.useRouteData("client");
  const protocolDocs = routing.useRouteData(undefined);

  return (
    <>
      <Header />
      <Contents
        protocolDocs={protocolDocs()}
        serverDocs={serverDocs()}
        clientDocs={clientDocs()}
      />
    </>
  );
}
