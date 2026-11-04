/** @fileoverview Original ICU78.3 utf8_nextCharSafeBody, including obsolete strict modes and exact error cursor consumption. */
import { U8_IS_VALID_LEAD3_AND_T1, U8_IS_VALID_LEAD4_AND_T1 } from "./unicode/utf8";
const utf8_errorValue = [0x15, 0x9f, 0xffff, 0x10ffff, 0, 0];
/** Original errorValue helper. @param count - Already consumed trails. @param strict - Source strict mode. @returns Original error scalar. */
function errorValue(count: number, strict: number): number {
  return strict >= 0 ? (utf8_errorValue[count] as number) : strict === -3 ? 0xfffd : -1;
}
/** Original U_IS_UNICODE_NONCHAR macro expansion. @param c - Scalar. @returns Noncharacter. */
function isNoncharacter(c: number): boolean {
  return c >= 0xfdd0 && (c <= 0xfdef || (c & 0xfffe) === 0xfffe) && c <= 0x10ffff;
}
/** Original non-inline UTF-8 scanner; caller supplies a readable native span and index one beyond c. @param s - Actual byte storage. @param pi - Input/output cursor. @param length - Count or negative for NUL termination. @param c - Already consumed nonsingle byte. @param strict - Signed8 strict mode. @returns Scalar or original mode-specific error. */
export function utf8_nextCharSafeBody(
  s: Uint8Array,
  pi: [number],
  length: number,
  c: number,
  strict: number,
): number {
  let i = pi[0];
  strict = (strict << 24) >> 24;
  if (i === length || c > 0xf4) {
    // Original end/non-lead path reaches the shared error handling.
  } else if (c >= 0xf0) {
    const t1 = s[i] as number;
    let t2: number, t3: number;
    c &= 7;
    if (
      U8_IS_VALID_LEAD4_AND_T1(c, t1) &&
      ++i !== length &&
      (t2 = ((s[i] as number) - 0x80) & 255) <= 0x3f &&
      ++i !== length &&
      (t3 = ((s[i] as number) - 0x80) & 255) <= 0x3f
    ) {
      ++i;
      c = (c << 18) | ((t1 & 0x3f) << 12) | (t2 << 6) | t3;
      if (strict <= 0 || !isNoncharacter(c)) {
        pi[0] = i;
        return c;
      }
    }
  } else if (c >= 0xe0) {
    c &= 15;
    if (strict !== -2) {
      const t1 = s[i] as number;
      let t2: number;
      if (
        U8_IS_VALID_LEAD3_AND_T1(c, t1) &&
        ++i !== length &&
        (t2 = ((s[i] as number) - 0x80) & 255) <= 0x3f
      ) {
        ++i;
        c = (c << 12) | ((t1 & 0x3f) << 6) | t2;
        if (strict <= 0 || !isNoncharacter(c)) {
          pi[0] = i;
          return c;
        }
      }
    } else {
      const t1 = ((s[i] as number) - 0x80) & 255;
      let t2: number;
      if (
        t1 <= 0x3f &&
        (c > 0 || t1 >= 0x20) &&
        ++i !== length &&
        (t2 = ((s[i] as number) - 0x80) & 255) <= 0x3f
      ) {
        pi[0] = i + 1;
        return (c << 12) | (t1 << 6) | t2;
      }
    }
  } else if (c >= 0xc2) {
    const t1 = ((s[i] as number) - 0x80) & 255;
    if (t1 <= 0x3f) {
      pi[0] = i + 1;
      return ((c - 0xc0) << 6) | t1;
    }
  }
  c = errorValue(i - pi[0], strict);
  pi[0] = i;
  return c;
}
