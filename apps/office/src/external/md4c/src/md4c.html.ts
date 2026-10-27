/** @fileoverview md4c.c native HTML tag automaton and scan-horizon recognizers. See ../LICENSE. */
import {
  type MD_LINE,
  type MD_SCAN_CONTEXT,
  ISALPHA_,
  ISALNUM_,
  ISBLANK_,
  ISWHITESPACE_,
  ISNEWLINE_,
  md_ascii_eq,
} from "./md4c.scan";
const enc = new TextEncoder();
/** Recognizes the source HTML-tag automaton; an empty line array selects block type seven's single-line mode. @param ctx - Original context view. @param lines - Native content bounds. @param beg - Opening angle. @param maxEnd - Exclusive limit. @returns End or -1. */
export function md_is_html_tag(
  ctx: MD_SCAN_CONTEXT,
  lines: readonly MD_LINE[],
  beg: number,
  maxEnd: number,
): number {
  const text = ctx.text;
  let off = beg,
    lineEnd = lines.length > 0 ? (lines[0] as MD_LINE).end : ctx.size,
    index = 0;
  if (off + 1 >= lineEnd) return -1;
  off++;
  let state = 0;
  if (text[off] === 47) {
    state = -1;
    off++;
  }
  if (off >= lineEnd || !ISALPHA_(text[off] as number)) return -1;
  off++;
  while (off < lineEnd && (ISALNUM_(text[off] as number) || text[off] === 45)) off++;
  while (true) {
    while (off < lineEnd && !ISNEWLINE_(text[off] as number)) {
      const c = text[off] as number;
      if (state > 40) {
        if (state === 41 && (ISBLANK_(c) || [34, 39, 61, 60, 62, 96].includes(c))) {
          state = 0;
          off--;
        } else if ((state === 42 && c === 39) || (state === 43 && c === 34)) state = 0;
        off++;
      } else if (ISWHITESPACE_(c)) {
        if (state === 0) state = 1;
        off++;
      } else if (state <= 2 && c === 62) return off < maxEnd ? off + 1 : -1;
      else if (state <= 2 && c === 47 && off + 1 < lineEnd && text[off + 1] === 62)
        return off + 1 < maxEnd ? off + 2 : -1;
      else if ((state === 1 || state === 2) && (ISALPHA_(c) || c === 95 || c === 58)) {
        off++;
        while (
          off < lineEnd &&
          (ISALNUM_(text[off] as number) || [95, 46, 58, 45].includes(text[off] as number))
        )
          off++;
        state = 2;
      } else if (state === 2 && c === 61) {
        off++;
        state = 3;
      } else if (state === 3) {
        if (c === 34) state = 43;
        else if (c === 39) state = 42;
        else if (![34, 39, 61, 60, 62, 96].includes(c) && !ISNEWLINE_(c)) state = 41;
        else return -1;
        off++;
      } else return -1;
    }
    if (lines.length === 0) return -1;
    index++;
    if (index >= lines.length) return -1;
    off = (lines[index] as MD_LINE).beg;
    lineEnd = (lines[index] as MD_LINE).end;
    if (state === 0 || state === 41) state = 1;
    if (off >= maxEnd) return -1;
  }
}
/** Searches only within individual content lines, retaining the source failure horizon. @param ctx - Original context. @param marker - Literal closer bytes. @param lines - Native content bounds. @param beg - Scan start. @param maxEnd - Scan limit. @param horizon - Original context field. @returns Closer end or -1. */
export function md_scan_for_html_closer(
  ctx: MD_SCAN_CONTEXT,
  marker: Uint8Array,
  lines: readonly MD_LINE[],
  beg: number,
  maxEnd: number,
  horizon:
    "html_comment_horizon" | "html_proc_instr_horizon" | "html_decl_horizon" | "html_cdata_horizon",
): number {
  let off = beg,
    index = 0;
  if (off < ctx[horizon] && ctx[horizon] >= maxEnd - marker.length) return -1;
  while (true) {
    while (off + marker.length <= (lines[index] as MD_LINE).end && off + marker.length <= maxEnd) {
      if (md_ascii_eq(ctx.text.subarray(off), marker, marker.length)) return off + marker.length;
      off++;
    }
    index++;
    if (off >= maxEnd || index >= lines.length) {
      ctx[horizon] = off;
      return -1;
    }
    off = (lines[index] as MD_LINE).beg;
  }
}
/** Recognizes native comments, including the source short closer forms. @param ctx - Context. @param lines - Lines. @param beg - Start. @param end - Limit. @returns End or -1. */
export function md_is_html_comment(
  ctx: MD_SCAN_CONTEXT,
  lines: readonly MD_LINE[],
  beg: number,
  end: number,
): number {
  if (
    beg + 4 >= (lines[0] as MD_LINE).end ||
    ctx.text[beg + 1] !== 33 ||
    ctx.text[beg + 2] !== 45 ||
    ctx.text[beg + 3] !== 45
  )
    return -1;
  return md_scan_for_html_closer(
    ctx,
    enc.encode("-->"),
    lines,
    beg + 2,
    end,
    "html_comment_horizon",
  );
}
/** Recognizes native processing instructions. @param ctx - Context. @param lines - Lines. @param beg - Start. @param end - Limit. @returns End or -1. */
export function md_is_html_processing_instruction(
  ctx: MD_SCAN_CONTEXT,
  lines: readonly MD_LINE[],
  beg: number,
  end: number,
): number {
  if (beg + 2 >= (lines[0] as MD_LINE).end || ctx.text[beg + 1] !== 63) return -1;
  return md_scan_for_html_closer(
    ctx,
    enc.encode("?>"),
    lines,
    beg + 2,
    end,
    "html_proc_instr_horizon",
  );
}
/** Recognizes native ASCII declaration names without host HTML parsing. @param ctx - Context. @param lines - Lines. @param beg - Start. @param end - Limit. @returns End or -1. */
export function md_is_html_declaration(
  ctx: MD_SCAN_CONTEXT,
  lines: readonly MD_LINE[],
  beg: number,
  end: number,
): number {
  if (beg + 2 >= (lines[0] as MD_LINE).end || ctx.text[beg + 1] !== 33) return -1;
  let off = beg + 2;
  if (!ISALPHA_(ctx.text[off] as number)) return -1;
  off++;
  while (off < (lines[0] as MD_LINE).end && ISALPHA_(ctx.text[off] as number)) off++;
  return md_scan_for_html_closer(ctx, enc.encode(">"), lines, off, end, "html_decl_horizon");
}
/** Recognizes native CDATA. @param ctx - Context. @param lines - Lines. @param beg - Start. @param end - Limit. @returns End or -1. */
export function md_is_html_cdata(
  ctx: MD_SCAN_CONTEXT,
  lines: readonly MD_LINE[],
  beg: number,
  end: number,
): number {
  const open = enc.encode("<![CDATA[");
  if (
    beg + open.length >= (lines[0] as MD_LINE).end ||
    !md_ascii_eq(ctx.text.subarray(beg), open, open.length)
  )
    return -1;
  return md_scan_for_html_closer(
    ctx,
    enc.encode("]]>"),
    lines,
    beg + open.length,
    end,
    "html_cdata_horizon",
  );
}
/** Retains native tag/comment/instruction/declaration/CDATA precedence. @param ctx - Context. @param lines - Lines. @param beg - Start. @param end - Limit. @returns End or -1. */
export function md_is_html_any(
  ctx: MD_SCAN_CONTEXT,
  lines: readonly MD_LINE[],
  beg: number,
  end: number,
): number {
  for (const scan of [
    md_is_html_tag,
    md_is_html_comment,
    md_is_html_processing_instruction,
    md_is_html_declaration,
    md_is_html_cdata,
  ]) {
    const result = scan(ctx, lines, beg, end);
    if (result >= 0) return result;
  }
  return -1;
}
