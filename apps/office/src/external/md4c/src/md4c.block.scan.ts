/** @fileoverview md4c.c native block marker recognizers, HTML block conditions and container indentation. See ../LICENSE. */
import { MD_FLAG_PERMISSIVEATXHEADERS } from "./md4c.h";
import { md_is_html_tag } from "./md4c.html";
import {
  type MD_SCAN_CONTEXT,
  ISALPHA_,
  ISDIGIT_,
  ISBLANK_,
  ISNEWLINE_,
  ISWHITESPACE_,
  md_ascii_case_eq,
  md_ascii_eq,
} from "./md4c.scan";
/** Original MD_CTX fields consumed by block scanners. */
export interface MD_BLOCK_SCAN_CONTEXT extends MD_SCAN_CONTEXT {
  readonly parser: { readonly flags: number };
  code_fence_length: number;
  html_block_type: number;
  readonly code_indent_offset: number;
}
/** Native scanner output parameters retain failure-side writes. */
export interface MD_BLOCK_SCAN_RESULT {
  readonly matched: boolean;
  readonly end?: number;
  readonly beg?: number;
  readonly level?: number;
  readonly killer?: number;
  readonly col_count?: number;
}
/** Native container data used by the same parser context. */
export interface MD_CONTAINER {
  ch: number;
  is_loose: boolean;
  is_task: boolean;
  start: number;
  mark_indent: number;
  contents_indent: number;
}
/** Recognizes a source thematic-line candidate. @param ctx - Context. @param beg - First marker. @returns Native match/end/killer outputs. */
export function md_is_hr_line(ctx: MD_BLOCK_SCAN_CONTEXT, beg: number): MD_BLOCK_SCAN_RESULT {
  const text = ctx.text;
  let off = beg + 1,
    n = 1;
  while (off < ctx.size && (text[off] === text[beg] || ISBLANK_(text[off] as number))) {
    if (text[off] === text[beg]) n++;
    off++;
  }
  return n < 3 || (off < ctx.size && !ISNEWLINE_(text[off] as number))
    ? { matched: false, killer: off }
    : { matched: true, end: off };
}
/** Recognizes native ATX heading prefixes; trailing hashes belong to leaf processing. @param ctx - Context. @param beg - First hash. @returns Native outputs. */
export function md_is_atxheader_line(
  ctx: MD_BLOCK_SCAN_CONTEXT,
  beg: number,
): MD_BLOCK_SCAN_RESULT {
  let off = beg + 1;
  while (off < ctx.size && ctx.text[off] === 35 && off - beg < 7) off++;
  const n = off - beg;
  if (n > 6) return { matched: false };
  if (
    !(ctx.parser.flags & MD_FLAG_PERMISSIVEATXHEADERS) &&
    off < ctx.size &&
    !ISBLANK_(ctx.text[off] as number) &&
    !ISNEWLINE_(ctx.text[off] as number)
  )
    return { matched: false, level: n };
  while (off < ctx.size && ISBLANK_(ctx.text[off] as number)) off++;
  return { matched: true, level: n, beg: off, end: off };
}
/** Recognizes a native setext underline, including one marker. @param ctx - Context. @param beg - Marker. @returns Native outputs. */
export function md_is_setext_underline(
  ctx: MD_BLOCK_SCAN_CONTEXT,
  beg: number,
): MD_BLOCK_SCAN_RESULT {
  let off = beg + 1;
  while (off < ctx.size && ctx.text[off] === ctx.text[beg]) off++;
  while (off < ctx.size && ISBLANK_(ctx.text[off] as number)) off++;
  return off < ctx.size && !ISNEWLINE_(ctx.text[off] as number)
    ? { matched: false }
    : { matched: true, level: ctx.text[beg] === 61 ? 1 : 2, end: off };
}
/** Recognizes source table underlines with the native 128-column limit. @param ctx - Context. @param beg - First byte. @returns Native outputs. */
export function md_is_table_underline(
  ctx: MD_BLOCK_SCAN_CONTEXT,
  beg: number,
): MD_BLOCK_SCAN_RESULT {
  const text = ctx.text;
  let off = beg,
    foundPipe = false,
    cols = 0;
  if (off < ctx.size && text[off] === 124) {
    foundPipe = true;
    off++;
    while (off < ctx.size && ISWHITESPACE_(text[off] as number)) off++;
  }
  while (true) {
    let delimited = false;
    if (off < ctx.size && text[off] === 58) off++;
    if (off >= ctx.size || text[off] !== 45) return { matched: false };
    while (off < ctx.size && text[off] === 45) off++;
    if (off < ctx.size && text[off] === 58) off++;
    if (++cols > 128) return { matched: false };
    while (off < ctx.size && ISWHITESPACE_(text[off] as number)) off++;
    if (off < ctx.size && text[off] === 124) {
      delimited = true;
      foundPipe = true;
      off++;
      while (off < ctx.size && ISWHITESPACE_(text[off] as number)) off++;
    }
    if (off >= ctx.size || ISNEWLINE_(text[off] as number)) break;
    if (!delimited) return { matched: false };
  }
  return foundPipe ? { matched: true, end: off, col_count: cols } : { matched: false };
}
/** Recognizes source opening fences, retaining fence-length writes on failed info strings. @param ctx - Context. @param beg - First marker. @returns Native outputs. */
export function md_is_opening_code_fence(
  ctx: MD_BLOCK_SCAN_CONTEXT,
  beg: number,
): MD_BLOCK_SCAN_RESULT {
  let off = beg;
  while (off < ctx.size && ctx.text[off] === ctx.text[beg]) off++;
  if (off - beg < 3) return { matched: false };
  ctx.code_fence_length = off - beg;
  while (off < ctx.size && ctx.text[off] === 32) off++;
  while (off < ctx.size && !ISNEWLINE_(ctx.text[off] as number)) {
    if (ctx.text[beg] === 96 && ctx.text[off] === 96) return { matched: false };
    off++;
  }
  return { matched: true, end: off };
}
/** Recognizes source closing fences and always writes the consumed offset. @param ctx - Context. @param ch - Opening marker byte. @param beg - Start offset. @returns Native outputs. */
export function md_is_closing_code_fence(
  ctx: MD_BLOCK_SCAN_CONTEXT,
  ch: number,
  beg: number,
): MD_BLOCK_SCAN_RESULT {
  let off = beg;
  while (off < ctx.size && ctx.text[off] === ch) off++;
  if (off - beg < ctx.code_fence_length) return { matched: false, end: off };
  while (off < ctx.size && ISBLANK_(ctx.text[off] as number)) off++;
  return { matched: off >= ctx.size || ISNEWLINE_(ctx.text[off] as number), end: off };
}
const enc = new TextEncoder();
const t1 = ["pre", "script", "style", "textarea"].map(
  /** Applies map to value. @param value - value value. @returns Callback result. */ (value) =>
    enc.encode(value),
);
const tags6 = [
  "address",
  "article",
  "aside",
  "base",
  "basefont",
  "blockquote",
  "body",
  "caption",
  "center",
  "col",
  "colgroup",
  "dd",
  "details",
  "dialog",
  "dir",
  "div",
  "dl",
  "dt",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "frame",
  "frameset",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hr",
  "html",
  "iframe",
  "legend",
  "li",
  "link",
  "main",
  "menu",
  "menuitem",
  "nav",
  "noframes",
  "ol",
  "optgroup",
  "option",
  "p",
  "param",
  "search",
  "section",
  "summary",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "title",
  "tr",
  "track",
  "ul",
].map(
  /** Applies map to value. @param value - value value. @returns Callback result. */ (value) =>
    enc.encode(value),
);
/** Recognizes the source seven raw HTML block types, including its ASCII type-four branch. @param ctx - Context. @param beg - Opening angle. @returns Native HTML type or zero. */
export function md_is_html_block_start_condition(ctx: MD_BLOCK_SCAN_CONTEXT, beg: number): number {
  const text = ctx.text;
  let off = beg + 1;
  for (const tag of t1)
    if (off + tag.length <= ctx.size && md_ascii_case_eq(text.subarray(off), tag, tag.length))
      return 1;
  if (off + 3 < ctx.size && text[off] === 33 && text[off + 1] === 45 && text[off + 2] === 45)
    return 2;
  if (off < ctx.size && text[off] === 63) return 3;
  if (off < ctx.size && text[off] === 33) {
    // Pinned source tests ISASCII, not its comment's uppercase-letter condition.
    if (off + 1 < ctx.size && (text[off + 1] as number) <= 127) return 4;
    if (off + 8 < ctx.size && md_ascii_eq(text.subarray(off), enc.encode("![CDATA["), 8)) return 5;
  }
  if (
    off + 1 < ctx.size &&
    (ISALPHA_(text[off] as number) || (text[off] === 47 && ISALPHA_(text[off + 1] as number)))
  ) {
    if (text[off] === 47) off++;
    const initial = text[off] as number,
      slot = initial >= 65 && initial <= 90 ? initial + 32 : initial;
    for (const tag of tags6) {
      if (tag[0] !== slot) continue;
      if (off + tag.length <= ctx.size && md_ascii_case_eq(text.subarray(off), tag, tag.length)) {
        const tmp = off + tag.length;
        if (
          tmp >= ctx.size ||
          ISBLANK_(text[tmp] as number) ||
          ISNEWLINE_(text[tmp] as number) ||
          text[tmp] === 62
        )
          return 6;
        if (tmp + 1 < ctx.size && text[tmp] === 47 && text[tmp + 1] === 62) return 6;
        break;
      }
    }
  }
  if (off + 1 < ctx.size) {
    let end = md_is_html_tag(ctx, [], beg, ctx.size);
    if (end >= 0) {
      while (end < ctx.size && ISWHITESPACE_(text[end] as number)) end++;
      if (end >= ctx.size || ISNEWLINE_(text[end] as number)) return 7;
    }
  }
  return 0;
}
/** Source line substring scan deliberately excludes a closer ending exactly at EOF. @param ctx - Context. @param beg - Start. @param marker - Sought bytes. @returns Native match/offset outputs. */
export function md_line_contains(
  ctx: MD_BLOCK_SCAN_CONTEXT,
  beg: number,
  marker: Uint8Array,
): MD_BLOCK_SCAN_RESULT {
  let off = beg;
  for (; off + marker.length < ctx.size; off++) {
    if (ISNEWLINE_(ctx.text[off] as number)) break;
    if (md_ascii_eq(ctx.text.subarray(off), marker, marker.length))
      return { matched: true, end: off + marker.length };
  }
  return { matched: false, end: off };
}
/** Recognizes native raw-HTML termination and preserves failure-side offset behavior. @param ctx - Context. @param beg - Start. @returns Native type and optional offset. */
export function md_is_html_block_end_condition(
  ctx: MD_BLOCK_SCAN_CONTEXT,
  beg: number,
): { readonly type: number; readonly end?: number } {
  const text = ctx.text;
  if (ctx.html_block_type === 1) {
    let off = beg;
    while (off + 1 < ctx.size && !ISNEWLINE_(text[off] as number)) {
      if (text[off] === 60 && text[off + 1] === 47)
        for (const tag of t1) {
          if (
            off + 2 + tag.length < ctx.size &&
            md_ascii_case_eq(text.subarray(off + 2), tag, tag.length) &&
            text[off + 2 + tag.length] === 62
          )
            return { type: 1, end: off + 2 + tag.length + 1 };
        }
      off++;
    }
    return { type: 0, end: off };
  }
  if (ctx.html_block_type >= 2 && ctx.html_block_type <= 5) {
    const marker = ["-->", "?>", ">", "]]>"][ctx.html_block_type - 2] as string;
    const result = md_line_contains(ctx, beg, enc.encode(marker));
    return {
      type: result.matched ? ctx.html_block_type : 0,
      ...(result.end === undefined ? {} : { end: result.end }),
    };
  }
  return beg >= ctx.size || ISNEWLINE_(text[beg] as number)
    ? { type: ctx.html_block_type, end: beg }
    : { type: 0 };
}
/** Retains native list-container compatibility, including marker equality and indentation. @param pivot - Existing container. @param container - Candidate. @returns Native predicate. */
export function md_is_container_compatible(pivot: MD_CONTAINER, container: MD_CONTAINER): boolean {
  return (
    container.ch !== 62 &&
    container.ch === pivot.ch &&
    container.mark_indent <= pivot.contents_indent
  );
}
/** Recognizes native quote/list markers and mutates the candidate container as the C owner does. @param ctx - Context. @param indent - Current indentation. @param beg - Source byte. @param container - Candidate owner. @returns Marker end or -1. */
export function md_is_container_mark(
  ctx: MD_BLOCK_SCAN_CONTEXT,
  indent: number,
  beg: number,
  container: MD_CONTAINER,
): number {
  const text = ctx.text;
  let off = beg;
  if (off >= ctx.size || indent >= ctx.code_indent_offset) return -1;
  if (
    text[off] === 62 ||
    ([45, 43, 42].includes(text[off] as number) &&
      (off + 1 >= ctx.size ||
        ISBLANK_(text[off + 1] as number) ||
        ISNEWLINE_(text[off + 1] as number)))
  ) {
    container.ch = text[off] as number;
    container.is_loose = false;
    container.is_task = false;
    container.mark_indent = indent;
    container.contents_indent = indent + 1;
    return off + 1;
  }
  const maxEnd = Math.min(off + 9, ctx.size);
  container.start = 0;
  while (off < maxEnd && ISDIGIT_(text[off] as number)) {
    container.start = container.start * 10 + (text[off] as number) - 48;
    off++;
  }
  if (
    off > beg &&
    off < ctx.size &&
    (text[off] === 46 || text[off] === 41) &&
    (off + 1 >= ctx.size ||
      ISBLANK_(text[off + 1] as number) ||
      ISNEWLINE_(text[off + 1] as number))
  ) {
    container.ch = text[off] as number;
    container.is_loose = false;
    container.is_task = false;
    container.mark_indent = indent;
    container.contents_indent = indent + off - beg + 1;
    return off + 1;
  }
  return -1;
}
/** Computes native tab-stop indentation relative to the current container column. @param ctx - Context. @param totalIndent - Current column. @param beg - First byte. @returns Added columns and consumed source end. */
export function md_line_indentation(
  ctx: MD_BLOCK_SCAN_CONTEXT,
  totalIndent: number,
  beg: number,
): { readonly indent: number; readonly end: number } {
  let off = beg,
    indent = totalIndent;
  while (off < ctx.size && ISBLANK_(ctx.text[off] as number)) {
    indent = ctx.text[off] === 9 ? (indent + 4) & ~3 : indent + 1;
    off++;
  }
  return { indent: indent - totalIndent, end: off };
}
