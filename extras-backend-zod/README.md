# TyRAS Extras Library Bundle - Backend using `zod` as Data Validation Library

This library bundles various backend-related `@ty-ras-extras/*` libraries into one.
The purpose is to enable writing
```ts
import { single-extras-aspect } from "@ty-ras-extras/backend-zod";
```
instead of
```ts
import * as tyrasConfig from "@ty-ras-extras/config-zod";
import * as tyrasCache from "@ty-ras-extras/cache";
...etc
```

This library exports all members of the following libraries:
- [`@ty-ras-extras/cache`](https://npmjs.com/package/@ty-ras-extras/cache),
- [`@ty-ras-extras/main`](https://npmjs.com/package/@ty-ras-extras/main),
- [`@ty-ras-extras/resource-pool`](https://npmjs.com/package/@ty-ras-extras/resource-pool),
- [`@ty-ras-extras/config-zod`](https://npmjs.com/package/@ty-ras-extras/config-zod),
- [`@ty-ras-extras/typed-sql-zod`](https://npmjs.com/package/@ty-ras-extras/typed-sql-zod), and
- [`@ty-ras-extras/state-zod`](https://npmjs.com/package/@ty-ras-extras/state-zod).
