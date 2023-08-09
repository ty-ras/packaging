/**
 * @file This file provides QoL function to create OpenAPI metadata provider.
 */

import type * as dataBE from "@ty-ras/data-backend";
import * as epSpec from "@ty-ras/endpoint-spec";
import * as dataValidation from "@ty-ras/data-zod";
import type * as md from "@ty-ras/metadata-openapi";
import * as stateGeneric from "@ty-ras/state";
import * as state from "@ty-ras/state-zod";
import * as dataIO from "@ty-ras/data-backend-zod";
import * as jsonIO from "@ty-ras/metadata-jsonschema-zod";
import * as mdProvider from "./md-provider";
import type * as server from "@ty-ras/server-node";
import * as t from "zod";

/**
 * This overload of `newBuilder` will create new {@link epSpec.ApplicationBuilder} with as many parameters set to sensible defaults as possible.
 * @param defaultReadRequestBody The default parameters for reading request bodies.
 * @returns A new {@link epSpec.ApplicationBuilder} with as many parameters set to sensible defaults as possible.
 */
export function newBuilder(
  defaultReadRequestBody: dataBE.ReadBody,
): DefaultApplicationBuilder;

/**
 * This overload of `newBuilder` will create new {@link epSpec.ApplicationBuilder}, allowing customization of various configuration values.
 * @param defaultReadRequestBody The default parameters for reading request bodies.
 * @param opts A {@link AppBuilderCreationParameters} tweaking various configurations for returned {@link epSpec.ApplicationBuilder}.
 * @returns A new {@link epSpec.ApplicationBuilder}.
 * @see AppBuilderCreationParameters
 */
export function newBuilder<
  TAuthenticatedState extends TStateSpecBase = typeof DEFAULT_AUTHENTICATED_STATE,
  TOtherState extends TStateSpecBase = typeof DEFAULT_NOT_AUTHENTICATED_STATE,
  TAllRequestBodyContentTypes extends string = typeof dataIO.CONTENT_TYPE,
  TAllResponseBodyContentTypes extends string = typeof dataIO.CONTENT_TYPE,
  TDefaultRequestBodyContentType extends TAllRequestBodyContentTypes = TAllRequestBodyContentTypes,
  TDefaultResponseBodyContentType extends TAllResponseBodyContentTypes = TAllResponseBodyContentTypes,
>(
  defaultReadRequestBody: dataBE.ReadBody,
  opts: AppBuilderCreationParameters<
    TAuthenticatedState,
    TOtherState,
    TAllRequestBodyContentTypes,
    TAllResponseBodyContentTypes,
    TDefaultRequestBodyContentType,
    TDefaultResponseBodyContentType
  >,
): DefaultApplicationBuilder<
  TAuthenticatedState,
  TOtherState,
  TAllRequestBodyContentTypes,
  TAllResponseBodyContentTypes,
  TDefaultRequestBodyContentType,
  TDefaultResponseBodyContentType
>;

/**
 * This is implementation of overloads for `newBuilder`.
 * @param defaultReadRequestBody The default parameters for reading request bodies.
 * @param opts A {@link AppBuilderCreationParameters} tweaking various configurations for returned {@link epSpec.ApplicationBuilder}.
 * @returns A new {@link epSpec.ApplicationBuilder}.
 */
export function newBuilder<
  TAuthenticatedState extends TStateSpecBase = typeof DEFAULT_AUTHENTICATED_STATE,
  TOtherState extends TStateSpecBase = typeof DEFAULT_NOT_AUTHENTICATED_STATE,
  TAllRequestBodyContentTypes extends string = typeof dataIO.CONTENT_TYPE,
  TAllResponseBodyContentTypes extends string = typeof dataIO.CONTENT_TYPE,
  TDefaultRequestBodyContentType extends TAllRequestBodyContentTypes = TAllRequestBodyContentTypes,
  TDefaultResponseBodyContentType extends TAllResponseBodyContentTypes = TAllResponseBodyContentTypes,
>(
  defaultReadRequestBody: dataBE.ReadBody,
  opts?: AppBuilderCreationParameters<
    TAuthenticatedState,
    TOtherState,
    TAllRequestBodyContentTypes,
    TAllResponseBodyContentTypes,
    TDefaultRequestBodyContentType,
    TDefaultResponseBodyContentType
  >,
): DefaultApplicationBuilder<
  TAuthenticatedState,
  TOtherState,
  TAllRequestBodyContentTypes,
  TAllResponseBodyContentTypes,
  TDefaultRequestBodyContentType,
  TDefaultResponseBodyContentType
> {
  const actualOpts: AppBuilderCreationParametersFull<
    TAuthenticatedState,
    TOtherState,
    TAllRequestBodyContentTypes,
    TAllResponseBodyContentTypes,
    TDefaultRequestBodyContentType,
    TDefaultResponseBodyContentType
  > = Object.assign({}, DEFAULT_OPTS, opts ?? {});
  return epSpec.newBuilderGeneric<
    dataValidation.EncodedHKT,
    dataValidation.ValidatorHKT,
    state.StateHKT<
      stateGeneric.StatePropertyValidations<TAuthenticatedState, TOtherState>
    >,
    MetadataProviders,
    server.ServerContext,
    TAllRequestBodyContentTypes,
    TAllResponseBodyContentTypes,
    TDefaultRequestBodyContentType,
    TDefaultResponseBodyContentType
  >(
    actualOpts.defaultRequestBodyContentType,
    (validation, opts) =>
      dataIO.requestBody(validation, defaultReadRequestBody, {
        contentType:
          opts?.contentType ?? actualOpts.defaultRequestBodyContentType,
      }),
    state.createStateValidatorFactory(
      stateGeneric.getFullStateValidationInfo(
        actualOpts.authenticatedState,
        actualOpts.otherState,
      ),
    ),
    {
      openapi: mdProvider.createOpenAPIProvider({
        getSecurityObjects: actualOpts.getOpenAPISecurityInfo,
        requestBodyContentTypes: actualOpts.requestBodyContentTypes,
        responseBodyContentTypes: actualOpts.responseBodyContentTypes,
        fallbackValue: actualOpts.getJsonSchemaFallback,
        override: actualOpts.getJsonSchemaOverride,
      }),
    },
  );
}

/**
 * This type specializes generic {@link epSpec.ApplicationBuilder} type to use `io-ts` and OpenAPI -specific type parameters where possible.
 */
export type DefaultApplicationBuilder<
  TAuthenticatedState extends TStateSpecBase = typeof DEFAULT_AUTHENTICATED_STATE,
  TOtherState extends TStateSpecBase = typeof DEFAULT_NOT_AUTHENTICATED_STATE,
  TAllRequestBodyContentTypes extends string = typeof dataIO.CONTENT_TYPE,
  TAllResponseBodyContentTypes extends string = typeof dataIO.CONTENT_TYPE,
  TDefaultRequestBodyContentType extends TAllRequestBodyContentTypes = TAllRequestBodyContentTypes,
  TDefaultResponseBodyContentType extends TAllResponseBodyContentTypes = TAllResponseBodyContentTypes,
  // TMetadataProviders extends epSpec.TMetadataProvidersBase = MetadataProviders,
  TAdditionalDataSpecHKT extends epSpec.EndpointSpecAdditionalDataHKTBase = epSpec.NoAdditionalSpecDataHKT,
> = epSpec.ApplicationBuilder<
  dataValidation.EncodedHKT,
  dataValidation.ValidatorHKT,
  DefaultStateHKT<TAuthenticatedState, TOtherState>,
  MetadataProviders,
  server.ServerContext,
  TAllRequestBodyContentTypes,
  TAllResponseBodyContentTypes,
  TDefaultRequestBodyContentType,
  TDefaultResponseBodyContentType,
  TAdditionalDataSpecHKT
>;

/**
 * This is the {@link dataBE.MaterializeStateInfo} type for {@link DefaultStateHKT}.
 */
export type DefaultStateInfo<
  TAuthenticatedState extends TStateSpecBase = typeof DEFAULT_AUTHENTICATED_STATE,
  TOtherState extends TStateSpecBase = typeof DEFAULT_NOT_AUTHENTICATED_STATE,
> = dataBE.MaterializeStateInfo<
  DefaultStateHKT<TAuthenticatedState, TOtherState>,
  dataBE.MaterializeStateSpecBase<
    DefaultStateHKT<TAuthenticatedState, TOtherState>
  >
>;

/**
 * This is type for base constraints of generic parameters representing state specification objects with `io-ts` validators.
 */
export type TStateSpecBase = Readonly<
  Record<string, dataValidation.AnyDecoder>
>;

/**
 * This is the [higher-kinded type (HKT)](https://www.matechs.com/blog/encoding-hkts-in-typescript-once-again) for default usage of {@link state.StateHKT}.
 * The authenticated state consists of one property `userId`, and unauthenticated state has no properties.
 */
export type DefaultStateHKT<
  TAuthenticatedState extends TStateSpecBase = typeof DEFAULT_AUTHENTICATED_STATE,
  TOtherState extends TStateSpecBase = typeof DEFAULT_NOT_AUTHENTICATED_STATE,
> = state.StateHKT<
  stateGeneric.StatePropertyValidations<TAuthenticatedState, TOtherState>
>;

/**
 * This type is the metadata providers dictionary type for {@link epSpec.ApplicationBuilder} returned by {@link newBuilder}.
 * It specifies that OpenAPI -specific metadata should be behind `openapi` property in metadata arguments passed to endpoint builder functions.
 */
export type MetadataProviders = {
  /**
   * This property dictates that OpenAPI -specific metadata should be behind `openapi` property in metadata arguments passed to endpoint builder functions.
   */
  openapi: md.MetadataProviderHKT;
};

export const DEFAULT_AUTHENTICATED_STATE = Object.freeze({
  /**
   * This property will be set to user ID whenever HTTP request is considered to be authenticated.
   */
  userId: t.string(),
} as const);

export const DEFAULT_NOT_AUTHENTICATED_STATE = Object.freeze({} as const);

/**
 * This type is `Partial` version of {@link AppBuilderCreationParametersFull}, to be used as input to overloads of {@link newBuilder}.
 */
export type AppBuilderCreationParameters<
  TAuthenticatedState extends TStateSpecBase,
  TOtherState extends TStateSpecBase,
  TAllRequestBodyContentTypes extends string,
  TAllResponseBodyContentTypes extends string,
  TDefaultRequestBodyContentType extends TAllRequestBodyContentTypes,
  TDefaultResponseBodyContentType extends TAllResponseBodyContentTypes,
> = Partial<
  AppBuilderCreationParametersFull<
    TAuthenticatedState,
    TOtherState,
    TAllRequestBodyContentTypes,
    TAllResponseBodyContentTypes,
    TDefaultRequestBodyContentType,
    TDefaultResponseBodyContentType
  >
>;

/**
 * This type encapsulates all the information required for creating a {@link epSpec.ApplicationBuilder}.
 */
export interface AppBuilderCreationParametersFull<
  TAuthenticatedState extends TStateSpecBase = typeof DEFAULT_AUTHENTICATED_STATE,
  TOtherState extends TStateSpecBase = typeof DEFAULT_NOT_AUTHENTICATED_STATE,
  TAllRequestBodyContentTypes extends string = typeof dataIO.CONTENT_TYPE,
  TAllResponseBodyContentTypes extends string = typeof dataIO.CONTENT_TYPE,
  TDefaultRequestBodyContentType extends TAllRequestBodyContentTypes = TAllRequestBodyContentTypes,
  TDefaultResponseBodyContentType extends TAllResponseBodyContentTypes = TAllResponseBodyContentTypes,
> {
  /**
   * This is state specification for properties which signal valid authentication.
   * The keys are property names, and values are `io-ts` validators.
   */
  authenticatedState: TAuthenticatedState;

  /**
   * This is state specification for properties which are not related to valid authentication.
   * The keys are property names, and values are `io-ts` validators.
   */
  otherState: TOtherState;

  /**
   * A list of all of the valid request body content types usable by endpoints.
   */
  requestBodyContentTypes: ReadonlyArray<TAllRequestBodyContentTypes>;

  /**
   * A list of all of the valid response body content types usable by endpoints.
   */
  responseBodyContentTypes: ReadonlyArray<TAllResponseBodyContentTypes>;

  /**
   * The default request body content type to use when left unspecified for the endpoints.
   */
  defaultRequestBodyContentType: TDefaultRequestBodyContentType;

  /**
   * The default response body content type to use when left unspecified for the endpoints.
   */
  defaultResponseBodyContentType: TDefaultResponseBodyContentType;

  /**
   * The callback to extract OpenAPI security information from the endpoint state information.
   * @see md.GetOperationSecurityInformation
   */
  getOpenAPISecurityInfo: md.GetOperationSecurityInformation<
    state.StateHKT<
      stateGeneric.StatePropertyValidations<TAuthenticatedState, TOtherState>
    >
  >;

  /**
   * The callback to get fallback JSON schema value whenever the built-in transformation from `io-ts` validators to JSON schema objects fails.
   */
  getJsonSchemaFallback: jsonIO.FallbackValue;

  /**
   * The callback to get override value for JSON schema whenever built-in transformation from `io-ts` validators to JSON schema objects is needed to be skipped.
   */
  getJsonSchemaOverride?: jsonIO.Override;
}

const DEFAULT_OPTS = {
  authenticatedState: DEFAULT_AUTHENTICATED_STATE,
  otherState: {},
  requestBodyContentTypes: [dataIO.CONTENT_TYPE],
  responseBodyContentTypes: [dataIO.CONTENT_TYPE],
  defaultRequestBodyContentType: dataIO.CONTENT_TYPE,
  defaultResponseBodyContentType: dataIO.CONTENT_TYPE,
  getOpenAPISecurityInfo: ({
    stateInfo: stateProperties,
    validator: stateValidator,
  }) =>
    stateProperties.some((propName) => propName in DEFAULT_AUTHENTICATED_STATE)
      ? {
          securitySchemes: [
            [
              {
                schemeID: "authentication",
                scheme: {
                  type: "http",
                  scheme: "bearer",
                },
                requirementData: [],
                isOptional:
                  stateValidator(DEFAULT_NOT_AUTHENTICATED_STATE).error ===
                  "none",
              },
            ],
          ],
          ifFailed: {
            description: "If authentication failed.",
          },
        }
      : undefined,
  getJsonSchemaFallback: {
    description:
      "This is fallback value for when the automatic JSON schema generation failed",
  },
} as const satisfies AppBuilderCreationParametersFull;
