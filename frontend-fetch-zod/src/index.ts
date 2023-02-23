// Really waiting for that "export type *": https://github.com/microsoft/TypeScript/issues/37238
// If we just do "export * from", our index.[m]js file ends up with "export" statement as well, thus causing runtime errors.
// Another option is rename .d.ts files into .ts files and end up with a bunch of empty .[m]js files and index.[m]js exporting those - not very optimal either.
export type {
  Encoded,
  EncodedOf,
  GetRuntimeArray,
  GetRuntimeObject,
  HKTEncodedBase,
  ProtocolSpecCore,
  ProtocolSpecHeaderData,
  ProtocolSpecHeaders,
  ProtocolSpecQuery,
  ProtocolSpecRequestBody,
  ProtocolSpecResponseHeaders,
  ProtocolSpecURL,
  RuntimeOf,
} from "@ty-ras/protocol";
export * from "@ty-ras/client-fetch";
export * from "@ty-ras/data";
export * from "@ty-ras/data-zod";
export * from "@ty-ras/data-frontend";
export * from "@ty-ras/data-frontend-zod";
