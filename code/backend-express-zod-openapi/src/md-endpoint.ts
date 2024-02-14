/**
 * @file This file contains the implementation for endpoint returning OpenAPI information about other endpoints composing a REST API.
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type * as protocol from "@ty-ras/protocol"; // Imported only for JSDoc
import * as dataIO from "@ty-ras/data-backend-zod";
import type * as server from "@ty-ras/server-express";
import type * as serverGeneric from "@ty-ras/server";
import type * as epSpecBase from "@ty-ras/endpoint-spec";
import * as md from "@ty-ras/metadata-openapi";
import * as t from "zod";
import * as tls from "node:tls";
import * as epSpec from "./endpoint-spec";

/**
 * Given the builder and the {@link epSpecBase.EndpointsCreationResult} from the builder, returns the endpoints of given {@link epSpecBase.EndpointsCreationResult}, along with endpoint(s) to serve OpenAPI document built from the endpoints.
 *
 * Notice that the OpenAPI endpoint strips authenticated endpoints for requests which are not considered to be authenticated.
 * @param builder The {@link epSpec.ApplicationBuilder} that was used to create `creationResult`.
 * @param creationResult The {@link epSpecBase.EndpointsCreationResult} that was created from `builder`.
 * @param openAPIPath The URL path to serve the OpenAPI document from.
 * @returns All of the endpoints of `creationResult` along with endpoints to serve the OpenAPI document.
 */
export function endpointsWithOpenAPI(
  builder: epSpec.ApplicationBuilderAny,
  creationResult: epSpecBase.EndpointsCreationResult<
    epSpec.MetadataProviders,
    server.ServerContext,
    epSpec.DefaultStateInfo
  >,
  openAPIPath?: string,
): MutableServerEndpoints;

/**
 * Given the builder and the {@link epSpecBase.EndpointsCreationResult} from the builder, returns the endpoints of given {@link epSpecBase.EndpointsCreationResult}, along with endpoint(s) to serve OpenAPI document built from the endpoints.
 *
 * Notice that the OpenAPI endpoint strips authenticated endpoints for requests which are not considered to be authenticated.
 * @param builder The {@link epSpec.ApplicationBuilder} that was used to create `creationResult`.
 * @param creationResult The {@link epSpecBase.EndpointsCreationResult} that was created from `builder`.
 * @param responseContentType The content type of the data returned by OpenAPI endpoint.
 * @param authState The validation of state properties related to authentication.
 * @param stateKeys The state keys which signify the authenticated state necessary for the request to be considered as authenticated.
 * @param additionalData The additional data for the endpoint, as specified by the {@link epSpecBase.EndpointSpecAdditionalDataHKTBase} of the given `builder`.
 * @param openAPIPath The URL path to serve the OpenAPI document from.
 * @returns All of the endpoints of `creationResult` along with endpoints to serve the OpenAPI document.
 */
export function endpointsWithOpenAPI<
  TAuthenticatedState extends epSpec.TStateSpecBase,
  TOtherState extends epSpec.TStateSpecBase,
  TAllRequestBodyContentTypes extends string,
  TAllResponseBodyContentTypes extends string,
  TDefaultRequestBodyContentType extends TAllRequestBodyContentTypes,
  TDefaultResponseBodyContentType extends TAllResponseBodyContentTypes,
  TAdditionalDataSpecHKT extends epSpecBase.EndpointSpecAdditionalDataHKTBase,
  TStateKeys extends [
    keyof TAuthenticatedState,
    ...Array<keyof TAuthenticatedState>,
  ],
>(
  builder: epSpec.ApplicationBuilderAny<
    TAuthenticatedState,
    TOtherState,
    TAllRequestBodyContentTypes,
    TAllResponseBodyContentTypes,
    TDefaultRequestBodyContentType,
    TDefaultResponseBodyContentType,
    TAdditionalDataSpecHKT
  >,
  creationResult: epSpecBase.EndpointsCreationResult<
    epSpec.MetadataProviders,
    server.ServerContext,
    epSpec.DefaultStateInfo<TAuthenticatedState, TOtherState>
  >,
  responseContentType: TAllResponseBodyContentTypes,
  authState: TAuthenticatedState,
  stateKeys: TStateKeys,
  additionalData: epSpecBase.MaterializeEndpointSpecAdditionalData<
    TAdditionalDataSpecHKT,
    OpenAPIEndpointProtocol,
    { [P in TStateKeys[number]]: false }
  >,
  openAPIPath?: string,
): MutableServerEndpoints<TAuthenticatedState, TOtherState>;

/**
 * Given the builder and the {@link epSpecBase.EndpointsCreationResult} from the builder, returns the endpoints of given {@link epSpecBase.EndpointsCreationResult}, along with endpoint(s) to serve OpenAPI document built from the endpoints.
 *
 * Notice that the OpenAPI endpoint strips authenticated endpoints for requests which are not considered to be authenticated.
 * @param builder The {@link epSpec.ApplicationBuilder} that was used to create `creationResult`.
 * @param creationResult The {@link epSpecBase.EndpointsCreationResult} that was created from `builder`.
 * @param creationResult.metadata Privately deconstructed variable.
 * @param creationResult.endpoints Privately deconstructed variable.
 * @param responseContentTypeOrOpenAPIPath The content type of the data returned by OpenAPI endpoint, or the openAPI endpoint if other overload.
 * @param authState The validation of state properties related to authentication.
 * @param stateKeys The state keys which signify the authenticated state necessary for the request to be considered as authenticated.
 * @param additionalData The additional data for the endpoint, as specified by the {@link epSpecBase.EndpointSpecAdditionalDataHKTBase} of the given `builder`.
 * @param openAPIPath The URL path to serve the OpenAPI document from.
 * @returns All of the endpoints of `creationResult` along with endpoints to serve the OpenAPI document.
 */
export function endpointsWithOpenAPI<
  TAuthenticatedState extends epSpec.TStateSpecBase,
  TOtherState extends epSpec.TStateSpecBase,
  TAllRequestBodyContentTypes extends string,
  TAllResponseBodyContentTypes extends string,
  TDefaultRequestBodyContentType extends TAllRequestBodyContentTypes,
  TDefaultResponseBodyContentType extends TAllResponseBodyContentTypes,
  TAdditionalDataSpecHKT extends epSpecBase.EndpointSpecAdditionalDataHKTBase,
  TStateKeys extends [
    keyof TAuthenticatedState,
    ...Array<keyof TAuthenticatedState>,
  ],
>(
  builder: epSpec.ApplicationBuilderAny<
    TAuthenticatedState,
    TOtherState,
    TAllRequestBodyContentTypes,
    TAllResponseBodyContentTypes,
    TDefaultRequestBodyContentType,
    TDefaultResponseBodyContentType,
    TAdditionalDataSpecHKT
  >,
  {
    metadata,
    endpoints,
  }: epSpecBase.EndpointsCreationResult<
    epSpec.MetadataProviders,
    server.ServerContext,
    epSpec.DefaultStateInfo<TAuthenticatedState, TOtherState>
  >,
  responseContentTypeOrOpenAPIPath?: TAllResponseBodyContentTypes | string,
  authState?: TAuthenticatedState,
  stateKeys?: TStateKeys,
  additionalData?: epSpecBase.MaterializeEndpointSpecAdditionalData<
    TAdditionalDataSpecHKT,
    OpenAPIEndpointProtocol,
    { [P in TStateKeys[number]]: false }
  >,
  openAPIPath?: string,
): MutableServerEndpoints<TAuthenticatedState, TOtherState> {
  const noMD = builder.showContextToEndpoints().resetMetadataProviders();
  const noURLParameters = noMD.url``({});
  const params: ParametersValidation<
    TAuthenticatedState,
    TAllResponseBodyContentTypes,
    TAdditionalDataSpecHKT,
    TStateKeys
  > = stateKeys
    ? validateComplexParameters(
        openAPIPath,
        authState,
        stateKeys,
        responseContentTypeOrOpenAPIPath,
        additionalData,
      )
    : validateSimpleParameters(responseContentTypeOrOpenAPIPath);
  const stateSpec = Object.fromEntries(
    params.stateKeys.map((key) => [key, false] as const),
  ) as epSpecBase.StateSpecBaseOfAppBuilder<typeof builder>;

  const openAPIDocumentFull = metadata.openapi;
  const openAPIDocumentUnauth =
    md.removeAuthenticatedOperations(openAPIDocumentFull);

  /**
   * Dynamically generated class so that we can use decorators.
   */
  class OpenAPIEndpoint {
    /**
     * Implements OpenAPI endpoint.
     * @param param0 The endpoint arguments.
     * @param param0.state Privately deconstructed variable.
     * @param param0.context Privately deconstructed variable.
     * @param param0.context.req Privately deconstructed variable.
     * @returns The OpenAPI document. If the request is not authenticated, the returned document will not contain any endpoints that require authentication.
     */
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    @noURLParameters<OpenAPIEndpointProtocol>({})({
      ...(additionalData as object),
      method: "GET",
      responseBody: dataIO.responseBody(
        t.unknown(),
        params.responseContentType,
      ),
      state: stateSpec,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    static getOpenAPIDocument({
      state,
      context: { req },
    }: epSpecBase.GetMethodArgs<
      OpenAPIEndpointProtocol,
      typeof noURLParameters,
      typeof stateSpec
    >) {
      let returnMD = params.stateKeys.every(
        (stateKey) =>
          params.authState[stateKey].safeParse(
            state[stateKey as keyof typeof state],
          ).success,
      )
        ? openAPIDocumentFull
        : openAPIDocumentUnauth;
      if (returnMD) {
        const host = req.get("host");
        if (host) {
          const scheme = req.socket instanceof tls.TLSSocket ? "https" : "http";
          returnMD = {
            ...returnMD,
            servers: [{ url: `${scheme}://${host}` }],
          };
        }
      }
      return returnMD;
    }
  }

  return [
    ...endpoints,
    ...noMD.createEndpoints({}, { [params.urlPath]: OpenAPIEndpoint })
      .endpoints,
  ];
}

/**
 * Helper type to specify return type of {@link endpointsWithOpenAPI}.
 */
export type MutableServerEndpoints<
  TAuthenticatedState extends epSpec.TStateSpecBase = epSpec.TStateSpecBase,
  TOtherState extends epSpec.TStateSpecBase = epSpec.TStateSpecBase,
> = Array<
  serverGeneric.ServerEndpoints<
    server.ServerContext,
    epSpec.DefaultStateInfo<TAuthenticatedState, TOtherState>
  >[number]
>;

/**
 * This is the protocol interface for OpenAPI endpoint.
 * @see protocol.ProtocolSpecCore
 */
export interface OpenAPIEndpointProtocol {
  /**
   * The method for the endpoint: `GET`.
   */
  method: "GET";
  /**
   * The response body for the endpoint: `unknown`.
   * The full validation for OpenAPI document is not feasible to use here, especially on runtime.
   */
  responseBody: unknown;
}

const doThrow = (msg: string) => {
  throw new Error(msg);
};

const DEFAULT_OPENAPI_PATH = "/openapi";

interface ParametersValidation<
  TAuthenticatedState extends epSpec.TStateSpecBase,
  TAllResponseBodyContentTypes extends string,
  TAdditionalDataSpecHKT extends epSpecBase.EndpointSpecAdditionalDataHKTBase,
  TStateKeys extends [
    keyof TAuthenticatedState,
    ...Array<keyof TAuthenticatedState>,
  ],
> {
  responseContentType: TAllResponseBodyContentTypes;
  urlPath: string;
  authState: TAuthenticatedState;
  stateKeys: TStateKeys;
  additionalData: epSpecBase.MaterializeEndpointSpecAdditionalData<
    TAdditionalDataSpecHKT,
    OpenAPIEndpointProtocol,
    { [P in TStateKeys[number]]: false }
  >;
}

const validateSimpleParameters = <
  TAuthenticatedState extends epSpec.TStateSpecBase,
  TAllResponseBodyContentTypes extends string,
  TAdditionalDataSpecHKT extends epSpecBase.EndpointSpecAdditionalDataHKTBase,
  TStateKeys extends [
    keyof TAuthenticatedState,
    ...Array<keyof TAuthenticatedState>,
  ],
>(
  openAPIPath: string | undefined,
): ParametersValidation<
  TAuthenticatedState,
  TAllResponseBodyContentTypes,
  TAdditionalDataSpecHKT,
  TStateKeys
> => ({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
  authState: epSpec.DEFAULT_AUTHENTICATED_STATE as any,
  stateKeys: Object.keys(epSpec.DEFAULT_AUTHENTICATED_STATE) as TStateKeys,
  responseContentType: dataIO.CONTENT_TYPE as TAllResponseBodyContentTypes,
  urlPath: openAPIPath ?? DEFAULT_OPENAPI_PATH,
  additionalData: {} as epSpecBase.MaterializeEndpointSpecAdditionalData<
    TAdditionalDataSpecHKT,
    OpenAPIEndpointProtocol,
    { [P in TStateKeys[number]]: false }
  >,
});

const validateComplexParameters = <
  TAuthenticatedState extends epSpec.TStateSpecBase,
  TAllResponseBodyContentTypes extends string,
  TAdditionalDataSpecHKT extends epSpecBase.EndpointSpecAdditionalDataHKTBase,
  TStateKeys extends [
    keyof TAuthenticatedState,
    ...Array<keyof TAuthenticatedState>,
  ],
>(
  openAPIPath: string | undefined,
  authState: TAuthenticatedState | undefined,
  stateKeys: TStateKeys,
  responseContentType: string | undefined,
  additionalData:
    | epSpecBase.MaterializeEndpointSpecAdditionalData<
        TAdditionalDataSpecHKT,
        OpenAPIEndpointProtocol,
        { [P in TStateKeys[number]]: false }
      >
    | undefined,
): ParametersValidation<
  TAuthenticatedState,
  TAllResponseBodyContentTypes,
  TAdditionalDataSpecHKT,
  TStateKeys
> => ({
  authState:
    authState ??
    doThrow(
      "When using the more complex overload of this function, please specify full authentication state validation.",
    ),
  // Prevent future modifications to stateKeys
  stateKeys: [...stateKeys],
  responseContentType: (responseContentType ??
    doThrow(
      "When using the more complex overload of this function, please specify response content type.",
    )) as TAllResponseBodyContentTypes,
  urlPath: openAPIPath ?? DEFAULT_OPENAPI_PATH,
  additionalData:
    additionalData ??
    doThrow(
      "When using the more complex overload of this function, please specify additional data for endpoint decorator.",
    ),
});
