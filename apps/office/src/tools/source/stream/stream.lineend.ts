/** @fileoverview Original Unicode convertLineEnd template body from stream.cxx over actual SAL string and buffer owners. The byte-string overload remains separate. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { LineEnd } from "../../inc/lineend";
/** Original two-pass conversion including opposite CR/LF pair collapse and unchanged-value sharing. @param input - Borrowed original UTF16 text. @param lineEnd - Original target enum. @returns Owned source result. */
export function convertLineEnd(input: OUStringConstReference, lineEnd: LineEnd): OUString {
  let convert = false;
  const length = input.getLength(),
    endLength = lineEnd === LineEnd.LINEEND_CRLF ? 2 : 1;
  let resultLength = 0,
    index = 0;
  while (index < length) {
    const current = input.charAt(index);
    if (current === 13 || current === 10) {
      resultLength += endLength;
      if (!convert) {
        if (
          (lineEnd !== LineEnd.LINEEND_LF && current === 10) ||
          (lineEnd === LineEnd.LINEEND_CRLF &&
            index + 1 < length &&
            input.charAt(index + 1) !== 10) ||
          (lineEnd === LineEnd.LINEEND_LF &&
            (current === 13 || (index + 1 < length && input.charAt(index + 1) === 13))) ||
          (lineEnd === LineEnd.LINEEND_CR &&
            (current === 10 || (index + 1 < length && input.charAt(index + 1) === 10)))
        )
          convert = true;
      }
      if (
        index + 1 < length &&
        (input.charAt(index + 1) === 13 || input.charAt(index + 1) === 10) &&
        current !== input.charAt(index + 1)
      )
        index++;
    } else resultLength++;
    index++;
  }
  if (!convert) return new OUString(input);
  const result = new OUStringBuffer(resultLength);
  try {
    index = 0;
    while (index < length) {
      const current = input.charAt(index);
      if (current === 13 || current === 10) {
        if (lineEnd === LineEnd.LINEEND_CRLF) result.append(Uint16Array.of(13, 10));
        else result.append(Uint16Array.of(lineEnd === LineEnd.LINEEND_CR ? 13 : 10));
        if (
          index + 1 < length &&
          (input.charAt(index + 1) === 13 || input.charAt(index + 1) === 10) &&
          current !== input.charAt(index + 1)
        )
          index++;
      } else result.append(Uint16Array.of(current));
      index++;
    }
    return result.makeStringAndClear();
  } finally {
    result.dispose();
  }
}
