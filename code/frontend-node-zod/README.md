# TyRAS Library Bundle - Frontend using Node runtime to send HTTP requests and `zod` as Data Validation Library

This library bundles various `@ty-ras/*` libraries into one.
The purpose is to enable writing
```ts
import * as tyras from "@ty-ras/frontend-node-zod";
```
instead of
```ts
import * as tyrasData from "@ty-ras/data";
import * as tyrasDataFE from "@ty-ras/data-frontend";
...etc
```

This library exports all members of the following libraries:
- [`@ty-ras/protocol`](https://npmjs.com/package/@ty-ras/protocol),
- [`@ty-ras/client-node`](https://npmjs.com/package/@ty-ras/client-node),
- [`@ty-ras/data`](https://npmjs.com/package/@ty-ras/data),
- [`@ty-ras/data-zod`](https://npmjs.com/package/@ty-ras/data-zod),
- [`@ty-ras/data-frontend`](https://npmjs.com/package/@ty-ras/data-frontend), and
- [`@ty-ras/data-frontend-zod`](https://npmjs.com/package/@ty-ras/data-frontend-zod).
