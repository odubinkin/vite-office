/** @fileoverview md4c.c permissive autolink analysis over already resolved native marks. See ../LICENSE. */
import { ISALNUM_ } from "./md4c.scan";
import {
  md_decode_unicode,
  md_decode_utf8_before__,
  md_is_unicode_whitespace__,
} from "./md4c.unicode";
import {
  type MD_MARK_CONTEXT,
  type MD_MARK,
  MD_MARK_RESOLVED,
  MD_MARK_OPENER,
  MD_MARK_CLOSER,
  md_resolve_range,
} from "./md4c.mark";
/** Source mark-search result retains the cursor even when no resolved range is found. */
interface MarkSearch {
  readonly index: number | undefined;
  readonly cursor: number;
}
/** Searches left using the native mark interval rules. @param ctx - Context. @param from - Starting mark. @param off - Byte position. @returns Resolved index and next cursor. */
function md_scan_left_for_resolved_mark(
  ctx: MD_MARK_CONTEXT,
  from: number,
  off: number,
): MarkSearch {
  let index = from;
  for (; index >= 0; index--) {
    const mark = ctx.marks[index] as MD_MARK;
    if (mark.ch === 68 || mark.beg > off) continue;
    if (mark.beg <= off && off < mark.end && mark.flags & MD_MARK_RESOLVED)
      return { index, cursor: index };
    if (mark.end <= off) break;
  }
  return { index: undefined, cursor: index };
}
/** Searches right using the native mark interval rules. @param ctx - Context. @param from - Starting mark. @param off - Byte position. @returns Resolved index and next cursor. */
function md_scan_right_for_resolved_mark(
  ctx: MD_MARK_CONTEXT,
  from: number,
  off: number,
): MarkSearch {
  let index = from;
  for (; index < ctx.n_marks; index++) {
    const mark = ctx.marks[index] as MD_MARK;
    if (mark.ch === 68 || mark.end <= off) continue;
    if (mark.beg <= off && off < mark.end && mark.flags & MD_MARK_RESOLVED)
      return { index, cursor: index };
    if (mark.beg > off) break;
  }
  return { index: undefined, cursor: index };
}
/** Source palette predicate excludes NUL. @param c - Byte. @param palette - ASCII palette. @returns Membership. */
function any(c: number, palette: string): boolean {
  return c !== 0 && palette.includes(String.fromCharCode(c));
}
const URL_MAP = [
  { start: 0, delim: 46, inside: ".-_", any: "", min: 2, last: 0 },
  { start: 47, delim: 47, inside: "/._", any: "+-", min: 0, last: 47 },
  { start: 63, delim: 38, inside: "&.-+_=()", any: "", min: 1, last: 0 },
  { start: 35, delim: 0, inside: ".-+_", any: "", min: 1, last: 0 },
];
/** Resolves source permissive email/URL/WWW spans without crossing earlier marks. @param ctx - Context. @param markIndex - Candidate opener. @returns Nothing. */
export function md_analyze_permissive_autolink(ctx: MD_MARK_CONTEXT, markIndex: number): void {
  const text = ctx.text,
    opener = ctx.marks[markIndex] as MD_MARK,
    closer = ctx.marks[markIndex + 1] as MD_MARK,
    lineBeg = closer.beg,
    lineEnd = closer.end;
  let beg = opener.beg,
    end = opener.end,
    leftCursor = markIndex,
    rightCursor = markIndex;
  if (opener.ch === 64) {
    while (beg > lineBeg) {
      if (ISALNUM_(text[beg - 1] as number)) beg--;
      else if (
        beg >= lineBeg + 2 &&
        ISALNUM_(text[beg - 2] as number) &&
        any(text[beg - 1] as number, ".-_+") &&
        ISALNUM_(text[beg] as number)
      ) {
        const found = md_scan_left_for_resolved_mark(ctx, leftCursor, beg - 1);
        leftCursor = found.cursor;
        if (found.index === undefined) beg--;
        else break;
      } else break;
    }
    if (beg === opener.beg) return;
  }
  let leftOkay =
    beg === lineBeg ||
    md_is_unicode_whitespace__(md_decode_utf8_before__(text, beg)) ||
    any(text[beg - 1] as number, "({[");
  if (!leftOkay && any(text[beg - 1] as number, "*_~")) {
    const found = md_scan_left_for_resolved_mark(ctx, leftCursor, beg - 1);
    leftOkay =
      found.index !== undefined &&
      Boolean((ctx.marks[found.index] as MD_MARK).flags & MD_MARK_OPENER);
  }
  if (!leftOkay) return;
  for (const part of URL_MAP) {
    let components = 0,
      openBrackets = 0,
      length = 0;
    if (part.start !== 0) {
      if (end >= lineEnd || text[end] !== part.start) continue;
      if (part.min > 0 && (end + 1 >= lineEnd || !ISALNUM_(text[end + 1] as number))) continue;
      end++;
    }
    while (end < lineEnd) {
      const c = text[end] as number;
      if (ISALNUM_(c) || any(c, part.any)) {
        if (components === 0) components++;
        length++;
        end++;
      } else if (
        length > 0 &&
        c === part.delim &&
        end + 1 < lineEnd &&
        (ISALNUM_(text[end + 1] as number) || any(text[end + 1] as number, part.any))
      ) {
        components++;
        length = 0;
        end++;
      } else if (any(c, part.inside)) {
        const found = md_scan_right_for_resolved_mark(ctx, rightCursor, end);
        rightCursor = found.cursor;
        if (
          found.index !== undefined ||
          !(
            (end > lineBeg && (ISALNUM_(text[end - 1] as number) || text[end - 1] === 41)) ||
            c === 40
          ) ||
          !(
            (end + 1 < lineEnd && (ISALNUM_(text[end + 1] as number) || text[end + 1] === 40)) ||
            c === 41
          )
        )
          break;
        if (c === 40) openBrackets++;
        else if (c === 41) {
          if (openBrackets <= 0) break;
          openBrackets--;
        }
        length++;
        end++;
      } else break;
    }
    if (end < lineEnd && part.last !== 0 && text[end] === part.last) end++;
    if (components < part.min || openBrackets !== 0) return;
    if (opener.ch === 64) break;
  }
  let rightOkay =
    end === lineEnd ||
    md_is_unicode_whitespace__(md_decode_unicode(text, end, ctx.size)[0]) ||
    any(text[end] as number, ")}].!?,;");
  if (!rightOkay) {
    const found = md_scan_right_for_resolved_mark(ctx, rightCursor, end);
    rightOkay =
      found.index !== undefined &&
      Boolean((ctx.marks[found.index] as MD_MARK).flags & MD_MARK_CLOSER);
  }
  if (!rightOkay) return;
  opener.beg = beg;
  opener.end = beg;
  closer.beg = end;
  closer.end = end;
  closer.ch = opener.ch;
  md_resolve_range(ctx, markIndex, markIndex + 1);
}
