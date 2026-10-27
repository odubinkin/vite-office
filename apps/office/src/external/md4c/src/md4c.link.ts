/** @fileoverview md4c.c native link-label, destination and title recognition. See ../LICENSE. */
import {
  type MD_LINE,
  type MD_SCAN_CONTEXT,
  ISNEWLINE_,
  ISPUNCT_,
  ISWHITESPACE_,
} from "./md4c.scan";
import { md_decode_unicode, md_is_unicode_whitespace__ } from "./md4c.unicode";
/** Native scanner result retains source offsets and line indices. */
export interface MD_LINK_RANGE {
  readonly end: number;
  readonly contents_beg: number;
  readonly contents_end: number;
  readonly beg_line_index: number;
  readonly end_line_index: number;
}
/** Scans a native link label with the 999-character limit and source escape counting. @param ctx - Context. @param lines - Content lines. @param beg - Opening bracket. @returns Source bounds or undefined. */
export function md_is_link_label(
  ctx: MD_SCAN_CONTEXT,
  lines: readonly MD_LINE[],
  beg: number,
): MD_LINK_RANGE | undefined {
  const text = ctx.text;
  let off = beg,
    contentsBeg = 0,
    contentsEnd = 0,
    lineIndex = 0,
    begLine = 0,
    length = 0;
  if (text[off] !== 91) return undefined;
  off++;
  while (true) {
    const lineEnd = (lines[lineIndex] as MD_LINE).end;
    while (off < lineEnd) {
      if (
        text[off] === 92 &&
        off + 1 < ctx.size &&
        (ISPUNCT_(text[off + 1] as number) || ISNEWLINE_(text[off + 1] as number))
      ) {
        if (contentsEnd === 0) {
          contentsBeg = off;
          begLine = lineIndex;
        }
        contentsEnd = off + 2;
        off += 2;
      } else if (text[off] === 91) return undefined;
      else if (text[off] === 93)
        return contentsBeg < contentsEnd
          ? {
              end: off + 1,
              contents_beg: contentsBeg,
              contents_end: contentsEnd,
              beg_line_index: begLine,
              end_line_index: lineIndex,
            }
          : undefined;
      else {
        const [cp, size] = md_decode_unicode(text, off, ctx.size);
        if (!md_is_unicode_whitespace__(cp)) {
          if (contentsEnd === 0) {
            contentsBeg = off;
            begLine = lineIndex;
          }
          contentsEnd = off + size;
        }
        off += size;
      }
      length++;
      if (length > 999) return undefined;
    }
    lineIndex++;
    length++;
    if (lineIndex >= lines.length) return undefined;
    off = (lines[lineIndex] as MD_LINE).beg;
  }
}
/** Scans a source angle-delimited or balanced bare destination, retaining the depth-32 limit. @param ctx - Context. @param beg - Start. @param end - Limit. @returns Source bounds or undefined. */
export function md_is_link_destination(
  ctx: MD_SCAN_CONTEXT,
  beg: number,
  end: number,
): MD_LINK_RANGE | undefined {
  const text = ctx.text;
  let off = beg;
  if (text[beg] === 60) {
    if (off >= end) return undefined;
    off++;
    while (off < end) {
      if (text[off] === 92 && off + 1 < end && ISPUNCT_(text[off + 1] as number)) {
        off += 2;
        continue;
      }
      if (ISNEWLINE_(text[off] as number) || text[off] === 60) return undefined;
      if (text[off] === 62)
        return {
          end: off + 1,
          contents_beg: beg + 1,
          contents_end: off,
          beg_line_index: 0,
          end_line_index: 0,
        };
      off++;
    }
    return undefined;
  }
  let level = 0;
  while (off < end) {
    const c = text[off] as number;
    if (c === 92 && off + 1 < end && ISPUNCT_(text[off + 1] as number)) {
      off += 2;
      continue;
    }
    if (ISWHITESPACE_(c) || c <= 31 || c === 127) break;
    if (c === 40) {
      if (++level > 32) return undefined;
    } else if (c === 41) {
      if (level === 0) break;
      level--;
    }
    off++;
  }
  return level !== 0 || off === beg
    ? undefined
    : { end: off, contents_beg: beg, contents_end: off, beg_line_index: 0, end_line_index: 0 };
}
/** Scans native quoted/parenthesized titles after required whitespace. @param ctx - Context. @param lines - Source line slice. @param beg - Scan start after destination. @returns Source bounds or undefined. */
export function md_is_link_title(
  ctx: MD_SCAN_CONTEXT,
  lines: readonly MD_LINE[],
  beg: number,
): MD_LINK_RANGE | undefined {
  const text = ctx.text;
  let off = beg,
    index = 0;
  while (off < (lines[index] as MD_LINE).end && ISWHITESPACE_(text[off] as number)) off++;
  if (off >= (lines[index] as MD_LINE).end) {
    index++;
    if (index >= lines.length) return undefined;
    off = (lines[index] as MD_LINE).beg;
  }
  if (off === beg) return undefined;
  const begLine = index,
    opener = text[off],
    closer = opener === 34 ? 34 : opener === 39 ? 39 : opener === 40 ? 41 : 0;
  if (!closer) return undefined;
  off++;
  const contentsBeg = off;
  while (index < lines.length) {
    const lineEnd = (lines[index] as MD_LINE).end;
    while (off < lineEnd) {
      if (
        text[off] === 92 &&
        off + 1 < ctx.size &&
        (ISPUNCT_(text[off + 1] as number) || ISNEWLINE_(text[off + 1] as number))
      )
        off++;
      else if (text[off] === closer)
        return {
          end: off + 1,
          contents_beg: contentsBeg,
          contents_end: off,
          beg_line_index: begLine,
          end_line_index: index,
        };
      else if (closer === 41 && text[off] === 40) return undefined;
      off++;
    }
    index++;
  }
  return undefined;
}
