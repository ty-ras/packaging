/**
 * @file This file provides QoL function to create OpenAPI metadata provider.
 */

import type * as data from "@ty-ras/data-zod";
import type * as md from "@ty-ras/metadata";
import type * as state from "@ty-ras/state-zod";
import * as mdOpenAPI from "@ty-ras/metadata-openapi";
import * as mdJsonSchema from "@ty-ras/metadata-jsonschema-zod";

/**
 * Creates a new {@link OpenAPIMetadataProvider}, optionally specifying the content type name of the supported request/response body content types.
 * @param root0 The {@link OpenAPIMetadataProviderCreationOptions} to use when creating the provider.
 * @param root0.getSecurityObjects Privately deconstructed variable.
 * @returns A {@link OpenAPIMetadataProvider} to be used when building the application.
 */
export function createOpenAPIProvider<
  TFullStateValidationInfo extends state.TStateValidationBase,
  TRequestBodyContentTypes extends string,
  TResponseBodyContentTypes extends string,
>({
  getSecurityObjects,
  ...jsonSchemaOpts
}: OpenAPIMetadataProviderCreationOptions<
  TFullStateValidationInfo,
  TRequestBodyContentTypes,
  TResponseBodyContentTypes
>): OpenAPIMetadataProvider<TFullStateValidationInfo> {
  return mdOpenAPI.createOpenAPIProviderGeneric(
    getSecurityObjects,
    mdJsonSchema.createJsonSchemaFunctionality({
      ...jsonSchemaOpts,
      transformSchema: mdOpenAPI.convertToOpenAPISchemaObject,
    }),
  );
}

/**
 * The return type for {@link createOpenAPIProvider}.
 */
export type OpenAPIMetadataProvider<
  TFullStateValidationInfo extends state.TStateValidationBase,
> = md.MetadataProvider<
  data.EncodedHKT,
  data.ValidatorHKT,
  state.StateHKT<TFullStateValidationInfo>,
  mdOpenAPI.MetadataProviderHKT
>;

/**
 * This type encapsulates all necessary information for creating OpenAPI metadata provider able to auto-parse `io-ts` encoders and decoders into JSON schema.
 */
export type OpenAPIMetadataProviderCreationOptions<
  TFullStateValidationInfo extends state.TStateValidationBase,
  TRequestBodyContentTypes extends string,
  TResponseBodyContentTypes extends string,
> = {
  getSecurityObjects: mdOpenAPI.GetOperationSecurityInformation<
    state.StateHKT<TFullStateValidationInfo>
  >;
} & Omit<
  mdJsonSchema.Input<
    never,
    TRequestBodyContentTypes,
    TResponseBodyContentTypes
  >,
  "transformSchema"
>;
