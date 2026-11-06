# @lp-labs/text-wrap

Greedy paragraph-preserving word wrapping with supplied width measurement and explicit long-word policies.

Standalone original implementation; zero runtime, peer, or sibling-package dependencies. Node.js 18+, ESM and CommonJS with separate declaration trees. No browser globals are accessed at import time; compiled runtime uses only standard JavaScript APIs.

## Install

```sh
npm install @lp-labs/text-wrap
```

## Quick start

```js
import { wrapText } from '@lp-labs/text-wrap';
console.log(wrapText('one two three', { width: 7 })); // ['one two', 'three']
```

CommonJS exposes the same named exports:

```cjs
const api = require('@lp-labs/text-wrap');
```

## Customization

```js
import { wrapText } from '@lp-labs/text-wrap';
const measure = (text) => [...text].reduce((n, c) => n + (c === '界' ? 2 : 1), 0);
console.log(wrapText('界 a b', { width: 4, measure, longWord: 'error' }));
```

## Semantics, limits and errors

`wrapText(text, options)` returns a fresh string array, without trailing newline characters. CRLF, LF and CR preserve paragraph boundaries, including empty paragraphs. Other whitespace between words is normalized to one ASCII space; leading/trailing whitespace is discarded. Empty text yields one empty line.

`width` is a positive safe integer. Default `measure` counts Unicode code points, **not wcwidth, display cells, graphemes, or terminal escape sequences**. It is called on complete candidate strings, including spaces, and must be deterministic and return a finite nonnegative number, with zero for empty text. Non-additive measurements are accepted, but greedy results need not be optimal.

`longWord` defaults to `split`: split at code-point boundaries; an individual point wider than the target throws. `overflow` retains an overlong word on its own line. `error` rejects it. A combining sequence may be divided. Default `maxInput` is 100,000 UTF-16 units and `maxLines` is 10,000 (both positive integers). Unsupported C0 controls and DEL throw TypeError; horizontal tabs/newlines are supported. Invalid widths, measurements and exhausted line budgets throw RangeError; callbacks propagate their own errors.

Work is greedy, with up to O(n²) total candidate text/measurement work for a long line or word; callback cost is additional. Output space is O(n + lines). No callback or input options are retained.

## Complete public declaration API

The following is the complete public ESM declaration surface; CommonJS has matching declarations and runtime exports. Optional properties are omitted rather than supplied as undefined under exactOptionalPropertyTypes.

```ts
export interface WrapOptions {
  width: number;
  measure?: (text: string) => number;
  longWord?: 'split' | 'overflow' | 'error';
  maxInput?: number;
  maxLines?: number;
}
/** Wrap whitespace-separated words; explicit newlines are retained. */
export declare function wrapText(text: string, options: WrapOptions): string[];
```

## Development and verification

```sh
npm ci --offline --ignore-scripts --no-audit --no-fund
npm run build
npm run typecheck
npm test
npm run format:check
```

The offline command requires the dev tools already present in npm's cache. TypeScript ^5.9.3 and Prettier ^3.6.2 are dev-only. Build targets ES2022 with strict NodeNext declarations, noUncheckedIndexedAccess, exactOptionalPropertyTypes, noUnused checks, ES2022/DOM libs and no ambient type packages. Runtime tests import the ESM distribution directly and check CommonJS parity. Bare-package .mts/.cts consumer tests include negative type assertions. Published files are only dist, this README, LICENSE and package.json. No publication is performed by tests.

## Support

If this library is useful to you, consider supporting its maintenance with a [donation via PayPal](https://www.paypal.me/LibinPrasanth).

## Author

Created by [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/). Connect on LinkedIn for updates and discussion.
