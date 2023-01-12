# TyRAS Extras Library Bundle - Frontend using `io-ts` as Data Validation Library

This library bundles various frontend-related `@ty-ras-extras/*` libraries into one.
The purpose is to enable writing
```ts
import { single-extras-aspect } from "@ty-ras-extras/frontend-io-ts";
```
instead of
```ts
import * as tyrasConfig from "@ty-ras-extras/config-io-ts/string";
import * as tyrasCache from "@ty-ras-extras/cache";
...etc
```

This library exports all members of the following libraries:
- [`@ty-ras/cache`](https://npmjs.com/package/@ty-ras-extras/cache), and
- [`@ty-ras/config-io-ts`](https://npmjs.com/package/@ty-ras-extras/config-io-ts), specifically only `string` subpath export, as other export uses Node `fs` module.