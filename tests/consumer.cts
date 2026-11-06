import { wrapText, type WrapOptions } from '@lp-labs/text-wrap';
const options: WrapOptions = { width: 8, measure: (text) => [...text].length };
const result: string[] = wrapText('hello world', options);
// @ts-expect-error width is numeric
wrapText('hello', { width: '8' });
// @ts-expect-error long word policy is a finite union
wrapText('hello', { width: 8, longWord: 'clip' });
void result;
