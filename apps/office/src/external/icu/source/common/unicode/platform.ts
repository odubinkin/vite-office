/** @fileoverview Consumed ICU platform byte-order and invariant-character-family bindings. Typed-array storage exposes the actual host byte order; browser invariant byte literals use the original ASCII family. */
export const U_IS_BIG_ENDIAN = new Uint8Array(Uint16Array.of(1).buffer)[0] === 0 ? 1 : 0;
export const U_ASCII_FAMILY = 0;
export const U_EBCDIC_FAMILY = 1;
export const U_CHARSET_FAMILY = U_ASCII_FAMILY;
