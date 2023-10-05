import { Navigate } from "@solidjs/router";
import * as routing from "../routing";
import Header from "./TyRASDocumentationHeader";
import Contents from "./Documentation";

export default function TyRASDocumentation() {
  const paramsOrNavigate = routing.useParamsOrNavigate();

  return routing.isNavigate(paramsOrNavigate) ? (
    <Navigate href={paramsOrNavigate} />
  ) : (
    <TyRASDocumentationActual params={paramsOrNavigate} />
  );
}

// This is separate component because useRouteData calls useParams which will throw if redirect is neede
function TyRASDocumentationActual({ params }: DocumentationProps) {
  const serverDocs = routing.useRouteData(params, "server");
  const clientDocs = routing.useRouteData(params, "client");
  const protocolDocs = routing.useRouteData(params, undefined);
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

interface DocumentationProps {
  params: routing.DocumentationParams;
}
