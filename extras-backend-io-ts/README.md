# TyRAS Extras Library Bundle - Backend using `io-ts` as Data Validation Library

This library bundles various backend-related `@ty-ras-extras/*` libraries into one.
The purpose is to enable writing
```ts
import { single-extras-aspect } from "@ty-ras-extras/backend-io-ts";
```
instead of
```ts
import * as tyrasConfig from "@ty-ras-extras/config-io-ts";
import * as tyrasCache from "@ty-ras-extras/cache";
...etc
```

This library exports all members of the following libraries:
- [`@ty-ras/cache`](https://npmjs.com/package/@ty-ras-extras/cache),
- [`@ty-ras/config-io-ts`](https://npmjs.com/package/@ty-ras-extras/config-io-ts),
- [`@ty-ras-extras/resource-pool-fp-ts`](https://npmjs.com/package/@ty-ras-extras/resource-pool-fp-ts),
- [`@ty-ras-extras/typed-sql-io-ts`](https://npmjs.com/package/@ty-ras-extras/typed-sql-io-ts),
- [`@ty-ras-extras/main-io-ts`](https://npmjs.com/package/@ty-ras-extras/main-io-ts), and
- [`@ty-ras-extras/state-io-ts`](https://npmjs.com/package/@ty-ras-extras/state-io-ts).
