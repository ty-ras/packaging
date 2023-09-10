/**
 * @file This file contains additional properties for the schemas present in OpenAPI response of the backend.
 */

import type { OpenAPIV3 as openapi } from "openapi-types";

// We can't do as const satisfies openapi.SchemaObject, because for one reason or another, '$schema' property is not present in openapi.SchemaObject

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unused-vars
const additionalProp: openapi.SchemaObject = {
  $schema: "http://json-schema.org/draft-07/schema#",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

export default additionalProp;
