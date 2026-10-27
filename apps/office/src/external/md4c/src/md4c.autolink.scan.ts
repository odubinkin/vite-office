/** @fileoverview md4c.c angle-autolink URI and email scanners. See ../LICENSE. */
import type { MD_SCAN_CONTEXT } from "./md4c.scan";
import { ISALNUM_, ISWHITESPACE_ } from "./md4c.scan";
/** Recognizes the native URI scanner, including its ASCII first-scheme-byte test. @param ctx - Context. @param beg - Opening angle. @param maxEnd - Limit. @returns End or -1. */
export function md_is_autolink_uri(ctx: MD_SCAN_CONTEXT, beg: number, maxEnd: number): number {
  const text = ctx.text;
  let off = beg + 1;
  if (off >= maxEnd || (text[off] as number) > 127) return -1;
  off++;
  while (true) {
    if (off >= maxEnd || off - beg > 32) return -1;
    if (text[off] === 58 && off - beg >= 3) break;
    if (!ISALNUM_(text[off] as number) && ![43, 45, 46].includes(text[off] as number)) return -1;
    off++;
  }
  while (off < maxEnd && text[off] !== 62) {
    const c = text[off] as number;
    if (ISWHITESPACE_(c) || c <= 31 || c === 127 || c === 60) return -1;
    off++;
  }
  return off >= maxEnd ? -1 : off + 1;
}
/** Recognizes native email local/domain parts with the 63-byte label limit. @param ctx - Context. @param beg - Opening angle. @param maxEnd - Limit. @returns End or -1. */
export function md_is_autolink_email(ctx: MD_SCAN_CONTEXT, beg: number, maxEnd: number): number {
  const text = ctx.text,
    extra = ".!#$%&'*+/=?^_`{|}~-";
  let off = beg + 1;
  while (
    off < maxEnd &&
    (ISALNUM_(text[off] as number) ||
      (text[off] !== 0 && extra.includes(String.fromCharCode(text[off] as number))))
  )
    off++;
  if (off <= beg + 1 || off >= maxEnd || text[off] !== 64) return -1;
  off++;
  let length = 0;
  while (off < maxEnd) {
    const c = text[off] as number;
    if (ISALNUM_(c)) length++;
    else if (c === 45 && length > 0) length++;
    else if (c === 46 && length > 0 && text[off - 1] !== 45) length = 0;
    else break;
    if (length > 63) return -1;
    off++;
  }
  return length <= 0 || off >= maxEnd || text[off] !== 62 || text[off - 1] === 45 ? -1 : off + 1;
}
/** Retains native URI-before-email recognition order. @param ctx - Context. @param beg - Start. @param maxEnd - Limit. @returns Native end and mailto flag or undefined. */
export function md_is_autolink(
  ctx: MD_SCAN_CONTEXT,
  beg: number,
  maxEnd: number,
): { readonly end: number; readonly missing_mailto: boolean } | undefined {
  const uri = md_is_autolink_uri(ctx, beg, maxEnd);
  if (uri >= 0) return { end: uri, missing_mailto: false };
  const email = md_is_autolink_email(ctx, beg, maxEnd);
  return email >= 0 ? { end: email, missing_mailto: true } : undefined;
}
