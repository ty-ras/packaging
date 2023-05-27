/**
 * @file This file provides QoL function to create OpenAPI metadata provider.
 */

import * as dataBE from "@ty-ras/data-backend-zod";
import * as md from "@ty-ras/metadata-openapi";
import * as mdJsonSchema from "@ty-ras/metadata-jsonschema-zod";

/**
 * Creates a {@link md.OpenAPIMetadataProvider}, optionally specifying the content type name of the supported request/response body content types.
 * @param contentTypes Optionally, the supported content types of the data validators. By default is just {@link dataBE.CONTENT_TYPE}.
 * @returns A {@link md.OpenAPIMetadataProvider} to be used when building the application.
 */
export const createOpenAPIProvider = (contentTypes = [dataBE.CONTENT_TYPE]) =>
  md.createOpenAPIProviderGeneric(
    mdJsonSchema.createJsonSchemaFunctionality({
      contentTypes,
      transformSchema: md.convertToOpenAPISchemaObject,
    }),
  );
