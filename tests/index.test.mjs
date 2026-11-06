import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { wrapText } from '../dist/esm/index.js';

test('greedy wrapping and explicit paragraph boundaries', () => {
  assert.deepEqual(wrapText('  one\t two three\r\n\nlast ', { width: 7 }), [
    'one two',
    'three',
    '',
    'last',
  ]);
  assert.deepEqual(wrapText('', { width: 1 }), ['']);
});
test('code points not display cells or graphemes', () => {
  assert.deepEqual(wrapText('😀😀😀', { width: 2 }), ['😀😀', '😀']);
  assert.deepEqual(wrapText('a\u0301b', { width: 1 }), ['a', '\u0301', 'b']);
});
test('supplied whole-line width including spaces', () => {
  const measure = (s) => [...s].reduce((n, c) => n + (c === '界' ? 2 : 1), 0);
  assert.deepEqual(wrapText('界 a b', { width: 4, measure }), ['界 a', 'b']);
  assert.throws(() => wrapText('界', { width: 1, measure }), RangeError);
});
test('explicit long-word policies', () => {
  assert.deepEqual(wrapText('abcde x', { width: 3 }), ['abc', 'de', 'x']);
  assert.deepEqual(wrapText('abcde x', { width: 3, longWord: 'overflow' }), ['abcde', 'x']);
  assert.throws(() => wrapText('abcde', { width: 3, longWord: 'error' }), RangeError);
});
test('invalid inputs controls callbacks and budgets', () => {
  for (const width of [0, -1, NaN, 1.5, Infinity]) assert.throws(() => wrapText('x', { width }));
  assert.throws(() => wrapText('a\0b', { width: 2 }), TypeError);
  assert.throws(() => wrapText('abc', { width: 2, maxInput: 2 }), TypeError);
  assert.throws(() => wrapText('x', { width: 2, measure: () => -1 }), RangeError);
  assert.throws(() => wrapText('x', { width: 2, measure: () => 1 }), RangeError);
  assert.throws(() => wrapText('x', { width: 2, longWord: 'unknown' }), TypeError);
});
test('line budget exact boundary and owned output', () => {
  assert.deepEqual(wrapText('a b', { width: 1, maxLines: 2 }), ['a', 'b']);
  assert.throws(() => wrapText('a b', { width: 1, maxLines: 1 }), RangeError);
  const result = wrapText('a b', { width: 1 });
  result[0] = 'changed';
  assert.deepEqual(wrapText('a b', { width: 1 }), ['a', 'b']);
});
test('CJS and ESM agree', () => {
  const cjs = createRequire(import.meta.url)('../dist/cjs/index.js');
  assert.deepEqual(cjs.wrapText('a b', { width: 1 }), wrapText('a b', { width: 1 }));
});
