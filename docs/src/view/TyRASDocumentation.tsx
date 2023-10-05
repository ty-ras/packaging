import { Navigate } from "@solidjs/router";
import * as routing from "../routing";
import Header from "./TyRASDocumentationHeader";
import Contents from "./Documentation";

export default function TyRASDocumentation() {
  const paramsOrNavigate = routing.useParamsOrNavigate();

  return routing.isNavigate(paramsOrNavigate) ? (
    <Navigate href={paramsOrNavigate} />
  ) : (
    <TyRASDocumentationActual />
  );
}

// This is separate component because useRouteData calls useParams which will throw if redirect is neede
function TyRASDocumentationActual() {
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
