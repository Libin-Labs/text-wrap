export interface WrapOptions {
  width: number;
  measure?: (text: string) => number;
  longWord?: 'split' | 'overflow' | 'error';
  maxInput?: number;
  maxLines?: number;
}
/** Wrap whitespace-separated words; explicit newlines are retained. */
export function wrapText(text: string, options: WrapOptions): string[] {
  const {
    width,
    measure = (value: string) => [...value].length,
    longWord = 'split',
    maxInput = 100_000,
    maxLines = 10_000,
  } = options;
  for (const n of [width, maxInput, maxLines])
    if (!Number.isSafeInteger(n) || n < 1)
      throw new RangeError('Limits must be positive integers.');
  if (!['split', 'overflow', 'error'].includes(longWord))
    throw new TypeError('Unknown longWord policy.');
  if (
    typeof text !== 'string' ||
    text.length > maxInput ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(text)
  )
    throw new TypeError('Invalid or oversized text.');
  const size = (value: string): number => {
    const n = measure(value);
    if (!Number.isFinite(n) || n < 0)
      throw new RangeError('measure must return a finite nonnegative width.');
    return n;
  };
  if (size('') !== 0) throw new RangeError('Empty text must measure zero.');
  const result: string[] = [];
  const emit = (line: string): void => {
    if (result.length >= maxLines) throw new RangeError('Line budget exceeded.');
    result.push(line);
  };
  for (const paragraph of text.split(/\r\n|\r|\n/u)) {
    let line = '';
    for (const word of paragraph.split(/[^\S\r\n]+/u).filter(Boolean)) {
      if (line && size(`${line} ${word}`) <= width) {
        line += ` ${word}`;
        continue;
      }
      if (line) {
        emit(line);
        line = '';
      }
      if (size(word) <= width || longWord === 'overflow') {
        line = word;
        continue;
      }
      if (longWord === 'error') throw new RangeError('Word exceeds width.');
      for (const point of word) {
        if (size(point) > width) throw new RangeError('One code point exceeds width.');
        if (line && size(line + point) > width) {
          emit(line);
          line = '';
        }
        line += point;
      }
    }
    emit(line);
  }
  return result;
}
