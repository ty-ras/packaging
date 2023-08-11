# TyRAS Extras Library Bundle - Backend using `runtypes` as Data Validation Library

This library bundles various backend-related `@ty-ras-extras/*` libraries into one.
The purpose is to enable writing
```ts
import { single-extras-aspect } from "@ty-ras-extras/backend-runtypes";
```
instead of
```ts
import * as tyrasConfig from "@ty-ras-extras/config-runtypes";
import * as tyrasCache from "@ty-ras-extras/cache";
...etc
```

This library exports all members of the following libraries:
- [`@ty-ras-extras/cache`](https://npmjs.com/package/@ty-ras-extras/cache),
- [`@ty-ras-extras/config-runtypes`](https://npmjs.com/package/@ty-ras-extras/config-runtypes),
- [`@ty-ras-extras/resource-pool-fp-ts`](https://npmjs.com/package/@ty-ras-extras/resource-pool-fp-ts),
- [`@ty-ras-extras/typed-sql-runtypes`](https://npmjs.com/package/@ty-ras-extras/typed-sql-runtypes), and
- [`@ty-ras-extras/main-runtypes`](https://npmjs.com/package/@ty-ras-extras/main-runtypes).
