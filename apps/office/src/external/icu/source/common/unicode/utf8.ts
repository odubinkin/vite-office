/** @fileoverview Original ICU78.3 consumed UTF-8 lead/trail validity macros and bit vectors. */
export const U8_LEAD3_T1_BITS = "\x20\x30\x30\x30\x30\x30\x30\x30\x30\x30\x30\x30\x30\x10\x30\x30";
export const U8_LEAD4_T1_BITS = "\x00\x00\x00\x00\x00\x00\x00\x00\x1e\x0f\x0f\x0f\x00\x00\x00\x00";
/** Original int8_t single-byte check. @param c - Byte. @returns Single-byte input. */
export function U8_IS_SINGLE(c: number): boolean {
  return (c & 255) < 128;
}
/** Original three-byte lead/first-trail bit test. @param lead - Lead byte or low nibble. @param t1 - First trail byte. @returns Source nonzero bit on validity. */
export function U8_IS_VALID_LEAD3_AND_T1(lead: number, t1: number): number {
  return U8_LEAD3_T1_BITS.charCodeAt(lead & 15) & (1 << ((t1 & 255) >> 5));
}
/** Original four-byte lead/first-trail bit test. @param lead - Lead byte or low bits. @param t1 - First trail byte. @returns Source nonzero bit on validity. */
export function U8_IS_VALID_LEAD4_AND_T1(lead: number, t1: number): number {
  return U8_LEAD4_T1_BITS.charCodeAt((t1 & 255) >> 4) & (1 << (lead & 7));
}
export { utf8_nextCharSafeBody } from "../utf_impl";
