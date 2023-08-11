# TyRAS Library Bundle - Frontend using Fetch API to send HTTP requests and `runtypes` as Data Validation Library

This library bundles various `@ty-ras/*` libraries into one.
The purpose is to enable writing
```ts
import * as tyras from "@ty-ras/frontend-fetch-runtypes";
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
- [`@ty-ras/data-runtypes`](https://npmjs.com/package/@ty-ras/data-runtypes),
- [`@ty-ras/data-frontend`](https://npmjs.com/package/@ty-ras/data-frontend), and
- [`@ty-ras/data-frontend-runtypes`](https://npmjs.com/package/@ty-ras/data-frontend-runtypes).
