/**
 * @file This file contains additional properties for the schemas present in OpenAPI response of the backend.
 */

import type { OpenAPIV3 as openapi } from "openapi-types";

export default {
  description: "string",
} as const satisfies openapi.SchemaObject;
