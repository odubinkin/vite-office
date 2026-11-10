/** @fileoverview Original ICU78.3 UTF-8-to-UTF16 conversion loops, exact substitution/error publication and termination. Native readable-span preconditions apply; overlapping storage is unverified. */
import { UErrorCode as E, U_FAILURE } from "./unicode/utypes";
import { U8_IS_SINGLE, U8_IS_VALID_LEAD3_AND_T1, utf8_nextCharSafeBody } from "./unicode/utf8";
import { u_terminateUChars } from "./ustring";
/** Original UTF-8 conversion with caller-selected substitution; integer offsets represent only native pointer arithmetic. @param dest - Actual UTF16 allocation/null. @param destCapacity - Writable capacity. @param pDestLength - Optional output length. @param source - Actual readable bytes/null. @param srcLength - Count or minus one for NUL termination. @param subchar - Substitution scalar, negative to fail. @param pNumSubstitutions - Optional substitution count. @param status - Sticky source status. @returns Original destination pointer on normal completion, null on failure. */
export function u_strFromUTF8WithSub(
  dest: Uint16Array | null,
  destCapacity: number,
  pDestLength: [number] | null,
  source: Uint8Array | null,
  srcLength: number,
  subchar: number,
  pNumSubstitutions: [number] | null,
  status: [number],
): Uint16Array | null {
  if (U_FAILURE(status[0])) return null;
  if (
    (source === null && srcLength !== 0) ||
    srcLength < -1 ||
    destCapacity < 0 ||
    (dest === null && destCapacity > 0) ||
    subchar > 0x10ffff ||
    (subchar & 0xfffff800) === 0xd800
  ) {
    status[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
    return null;
  }
  if (pNumSubstitutions !== null) pNumSubstitutions[0] = 0;
  const src = source as Uint8Array,
    output = dest as Uint16Array;
  let pDest = 0,
    reqLength = 0,
    numSubstitutions = 0;
  if (srcLength < 0) {
    let i = 0,
      c: number;
    for (; (c = src[i] as number) !== 0 && pDest < destCapacity;) {
      ++i;
      if (U8_IS_SINGLE(c)) output[pDest++] = c;
      else {
        let t1: number, t2: number;
        if (
          0xe0 <= c &&
          c < 0xf0 &&
          U8_IS_VALID_LEAD3_AND_T1(c, src[i] as number) &&
          (t2 = ((src[i + 1] as number) - 0x80) & 255) <= 0x3f
        ) {
          output[pDest++] = ((c & 15) << 12) | (((src[i] as number) & 0x3f) << 6) | t2;
          i += 2;
        } else if (c < 0xe0 && c >= 0xc2 && (t1 = ((src[i] as number) - 0x80) & 255) <= 0x3f) {
          output[pDest++] = ((c & 31) << 6) | t1;
          ++i;
        } else {
          const index: [number] = [i];
          c = utf8_nextCharSafeBody(src, index, -1, c, -1);
          i = index[0];
          if (c < 0) {
            ++numSubstitutions;
            c = subchar;
            if (c < 0) {
              status[0] = E.U_INVALID_CHAR_FOUND;
              return null;
            }
          }
          if (c <= 0xffff) output[pDest++] = c;
          else {
            output[pDest++] = (c >> 10) + 0xd7c0;
            if (pDest < destCapacity) output[pDest++] = (c & 0x3ff) | 0xdc00;
            else {
              ++reqLength;
              break;
            }
          }
        }
      }
    }
    while ((c = src[i] as number) !== 0) {
      ++i;
      if (U8_IS_SINGLE(c)) ++reqLength;
      else {
        if (
          0xe0 <= c &&
          c < 0xf0 &&
          U8_IS_VALID_LEAD3_AND_T1(c, src[i] as number) &&
          (((src[i + 1] as number) - 0x80) & 255) <= 0x3f
        ) {
          ++reqLength;
          i += 2;
        } else if (c < 0xe0 && c >= 0xc2 && (((src[i] as number) - 0x80) & 255) <= 0x3f) {
          ++reqLength;
          ++i;
        } else {
          const index: [number] = [i];
          c = utf8_nextCharSafeBody(src, index, -1, c, -1);
          i = index[0];
          if (c < 0) {
            ++numSubstitutions;
            c = subchar;
            if (c < 0) {
              status[0] = E.U_INVALID_CHAR_FOUND;
              return null;
            }
          }
          reqLength += c >>> 0 <= 0xffff ? 1 : 2;
        }
      }
    }
  } else {
    let i = 0,
      c: number;
    for (;;) {
      let count = destCapacity - pDest;
      const count2 = Math.trunc((srcLength - i) / 3);
      if (count > count2) count = count2;
      if (count < 3) break;
      do {
        c = src[i++] as number;
        if (U8_IS_SINGLE(c)) output[pDest++] = c;
        else {
          let t1: number, t2: number;
          if (
            0xe0 <= c &&
            c < 0xf0 &&
            i + 1 < srcLength &&
            U8_IS_VALID_LEAD3_AND_T1(c, src[i] as number) &&
            (t2 = ((src[i + 1] as number) - 0x80) & 255) <= 0x3f
          ) {
            output[pDest++] = ((c & 15) << 12) | (((src[i] as number) & 0x3f) << 6) | t2;
            i += 2;
          } else if (
            c < 0xe0 &&
            c >= 0xc2 &&
            i !== srcLength &&
            (t1 = ((src[i] as number) - 0x80) & 255) <= 0x3f
          ) {
            output[pDest++] = ((c & 31) << 6) | t1;
            ++i;
          } else {
            if (c >= 0xf0 || subchar > 0xffff) {
              if (--count === 0) {
                --i;
                break;
              }
            }
            const index: [number] = [i];
            c = utf8_nextCharSafeBody(src, index, srcLength, c, -1);
            i = index[0];
            if (c < 0) {
              ++numSubstitutions;
              c = subchar;
              if (c < 0) {
                status[0] = E.U_INVALID_CHAR_FOUND;
                return null;
              }
            }
            if (c <= 0xffff) output[pDest++] = c;
            else {
              output[pDest++] = (c >> 10) + 0xd7c0;
              output[pDest++] = (c & 0x3ff) | 0xdc00;
            }
          }
        }
      } while (--count > 0);
    }
    while (i < srcLength && pDest < destCapacity) {
      c = src[i++] as number;
      if (U8_IS_SINGLE(c)) output[pDest++] = c;
      else {
        let t1: number, t2: number;
        if (
          0xe0 <= c &&
          c < 0xf0 &&
          i + 1 < srcLength &&
          U8_IS_VALID_LEAD3_AND_T1(c, src[i] as number) &&
          (t2 = ((src[i + 1] as number) - 0x80) & 255) <= 0x3f
        ) {
          output[pDest++] = ((c & 15) << 12) | (((src[i] as number) & 0x3f) << 6) | t2;
          i += 2;
        } else if (
          c < 0xe0 &&
          c >= 0xc2 &&
          i !== srcLength &&
          (t1 = ((src[i] as number) - 0x80) & 255) <= 0x3f
        ) {
          output[pDest++] = ((c & 31) << 6) | t1;
          ++i;
        } else {
          const index: [number] = [i];
          c = utf8_nextCharSafeBody(src, index, srcLength, c, -1);
          i = index[0];
          if (c < 0) {
            ++numSubstitutions;
            c = subchar;
            if (c < 0) {
              status[0] = E.U_INVALID_CHAR_FOUND;
              return null;
            }
          }
          if (c <= 0xffff) output[pDest++] = c;
          else {
            output[pDest++] = (c >> 10) + 0xd7c0;
            if (pDest < destCapacity) output[pDest++] = (c & 0x3ff) | 0xdc00;
            else {
              ++reqLength;
              break;
            }
          }
        }
      }
    }
    while (i < srcLength) {
      c = src[i++] as number;
      if (U8_IS_SINGLE(c)) ++reqLength;
      else {
        if (
          0xe0 <= c &&
          c < 0xf0 &&
          i + 1 < srcLength &&
          U8_IS_VALID_LEAD3_AND_T1(c, src[i] as number) &&
          (((src[i + 1] as number) - 0x80) & 255) <= 0x3f
        ) {
          ++reqLength;
          i += 2;
        } else if (
          c < 0xe0 &&
          c >= 0xc2 &&
          i !== srcLength &&
          (((src[i] as number) - 0x80) & 255) <= 0x3f
        ) {
          ++reqLength;
          ++i;
        } else {
          const index: [number] = [i];
          c = utf8_nextCharSafeBody(src, index, srcLength, c, -1);
          i = index[0];
          if (c < 0) {
            ++numSubstitutions;
            c = subchar;
            if (c < 0) {
              status[0] = E.U_INVALID_CHAR_FOUND;
              return null;
            }
          }
          reqLength += c >>> 0 <= 0xffff ? 1 : 2;
        }
      }
    }
  }
  reqLength += pDest;
  if (pNumSubstitutions !== null) pNumSubstitutions[0] = numSubstitutions;
  if (pDestLength !== null) pDestLength[0] = reqLength;
  u_terminateUChars(dest, destCapacity, reqLength, status);
  return dest;
}
/** Original strict wrapper selects U_SENTINEL and no substitution counter. @param dest - Actual output/null. @param capacity - Output capacity. @param length - Optional output length. @param src - Actual byte storage/null. @param srcLength - Count or NUL marker. @param status - Sticky status. @returns Original conversion result. */
export function u_strFromUTF8(
  dest: Uint16Array | null,
  capacity: number,
  length: [number] | null,
  src: Uint8Array | null,
  srcLength: number,
  status: [number],
): Uint16Array | null {
  return u_strFromUTF8WithSub(dest, capacity, length, src, srcLength, -1, null, status);
}
