/** @fileoverview ICU78.3 consumed UTF16 invariant-character predicate. ASCII platform conversion tables and EBCDIC machinery remain unported. */
const invariantChars = [0xfffffbff, 0xffffffe5, 0x87fffffe, 0x87fffffe];
/** Original counted or NUL-terminated UTF16 predicate; caller supplies the source span for nonnegative lengths. @param text - UTF16 pointer projection. @param length - Count or negative NUL-terminated mode. @returns Invariant repertoire only. */
export function uprv_isInvariantUString(text: string, length: number): boolean {
  length |= 0;
  for (let i = 0; ; ++i) {
    let c: number;
    if (length < 0) {
      c = i === text.length ? 0 : text.charCodeAt(i);
      if (c === 0) break;
    } else {
      if (length === 0) break;
      --length;
      c = text.charCodeAt(i);
    }
    if (!(c <= 0x7f && ((invariantChars[c >> 5] as number) & (1 << (c & 0x1f))) !== 0))
      return false;
  }
  return true;
}
