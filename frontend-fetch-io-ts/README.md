# TyRAS Library Bundle - Frontend using Fetch API to send HTTP requests and `io-ts` as Data Validation Library

This library bundles various `@ty-ras/*` libraries into one.
The purpose is to write this
```ts
import * as tyras from "@ty-ras/frontend-fetch-io-ts";
```
instead of
```ts
import * as tyrasData from "@ty-ras/data";
import * as tyrasDataFE from "@ty-ras/data-frontend";
...etc
```

This library exports all members of the following libraries:
- [`@ty-ras/protocol`](https://npmjs.com/package/@ty-ras/protocol),
- [`@ty-ras/client-fetch`](https://npmjs.com/package/@ty-ras/client-fetch),
- [`@ty-ras/data`](https://npmjs.com/package/@ty-ras/data),
- [`@ty-ras/data-io-ts`](https://npmjs.com/package/@ty-ras/data-io-ts),
- [`@ty-ras/data-frontend`](https://npmjs.com/package/@ty-ras/data-frontend), and
- [`@ty-ras/data-frontend-io-ts`](https://npmjs.com/package/@ty-ras/data-frontend-io-ts).
