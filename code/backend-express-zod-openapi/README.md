# TyRAS Library Bundle - Backend Running Express HTTP(S) 1 Server, `zod` as Data Validation Library, OpenAPI as Metadata Format

This library bundles various `@ty-ras/*` libraries into one.
The purpose is to enable writing
```ts
import * as tyras from "@ty-ras/backend-express-zod-openapi";
```
instead of
```ts
import * as tyrasData from "@ty-ras/data";
import * as tyrasDataBE from "@ty-ras/data-backend";
...etc
```

This library exports all members of the following libraries:
- [`@ty-ras/protocol`](https://npmjs.com/package/@ty-ras/protocol),
- [`@ty-ras/endpoint`](https://npmjs.com/package/@ty-ras/endpoint),
- [`@ty-ras/endpoint-spec`](https://npmjs.com/package/@ty-ras/endpoint-spec),
- [`@ty-ras/server`](https://npmjs.com/package/@ty-ras/server),
- [`@ty-ras/server-express`](https://npmjs.com/package/@ty-ras/server-express),
- [`@ty-ras/state`](https://npmjs.com/package/@ty-ras/state),
- [`@ty-ras/state-zod`](https://npmjs.com/package/@ty-ras/state-zod),
- [`@ty-ras/data`](https://npmjs.com/package/@ty-ras/data),
- [`@ty-ras/data-zod`](https://npmjs.com/package/@ty-ras/data-zod),
- [`@ty-ras/data-backend`](https://npmjs.com/package/@ty-ras/data-backend),
- [`@ty-ras/data-backend-zod`](https://npmjs.com/package/@ty-ras/data-backend-zod),
- [`@ty-ras/metadata`](https://npmjs.com/package/@ty-ras/metadata),
- [`@ty-ras/metadata-openapi`](https://npmjs.com/package/@ty-ras/metadata-openapi),
- [`@ty-ras/metadata-jsonschema`](https://npmjs.com/package/@ty-ras/metadata-jsonschema`), and
- [`@ty-ras/metadata-jsonschema-zod`](https://npmjs.com/package/@ty-ras/metadata-jsonschema-zod).
