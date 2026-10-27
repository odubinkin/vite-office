/** @fileoverview md4c.c reference definitions, source hash buckets and inline destination/title specifications. See ../LICENSE. */
import { md_link_label_hash, md_link_label_cmp } from "./md4c.label";
import { md_is_link_label, md_is_link_destination, md_is_link_title } from "./md4c.link";
import {
  type MD_SCAN_CONTEXT,
  type MD_LINE,
  ISWHITESPACE_,
  ISNEWLINE_,
  md_merge_lines,
  md_lookup_line,
} from "./md4c.scan";
/** Native reference definition with source byte ranges and borrowed/merged label/title values. */
export interface MD_REF_DEF {
  readonly label: Uint8Array;
  readonly title: Uint8Array;
  hash: number;
  readonly dest_beg: number;
  readonly dest_end: number;
}
/** Native link properties before attribute construction. */
export interface MD_LINK_ATTR {
  readonly dest_beg: number;
  readonly dest_end: number;
  readonly title: Uint8Array;
  readonly title_needs_free: boolean;
}
/** Original context fields consumed by reference parsing and lookup. */
export interface MD_REF_CONTEXT extends MD_SCAN_CONTEXT {
  readonly ref_defs: MD_REF_DEF[];
  ref_def_hashtable: (MD_REF_DEF | MD_REF_DEF[] | undefined)[];
  max_ref_def_output: number;
}
/** Source hash-first, reversed-label comparison. @param a - First definition. @param b - Second definition. @returns Native ordering. */
function md_ref_def_cmp(a: MD_REF_DEF, b: MD_REF_DEF): number {
  return a.hash < b.hash ? -1 : a.hash > b.hash ? 1 : md_link_label_cmp(a.label, b.label);
}
/** Builds source single/complex buckets and first-definition duplicate selection. @param ctx - Original context. @returns Nothing. */
export function md_build_ref_def_hashtable(ctx: MD_REF_CONTEXT): void {
  if (ctx.ref_defs.length === 0) return;
  ctx.ref_def_hashtable = new Array<MD_REF_DEF | MD_REF_DEF[] | undefined>(
    Math.trunc((ctx.ref_defs.length * 5) / 4),
  ).fill(undefined);
  for (const def of ctx.ref_defs) {
    def.hash = md_link_label_hash(def.label);
    const slot = def.hash % ctx.ref_def_hashtable.length,
      bucket = ctx.ref_def_hashtable[slot];
    if (bucket === undefined) ctx.ref_def_hashtable[slot] = def;
    else if (!Array.isArray(bucket)) {
      if (md_link_label_cmp(def.label, bucket.label) !== 0)
        ctx.ref_def_hashtable[slot] = [bucket, def];
    } else bucket.push(def);
  }
  const order = new Map(
    ctx.ref_defs.map(
      /** Applies map to def, index. @param def - def value. @param index - index value. @returns Callback result. */ (
        def,
        index,
      ) => [def, index],
    ),
  );
  for (const bucket of ctx.ref_def_hashtable) {
    if (!Array.isArray(bucket)) continue;
    bucket.sort(
      /** Applies sort to a, b. @param a - a value. @param b - b value. @returns Callback result. */ (
        a,
        b,
      ) => md_ref_def_cmp(a, b) || (order.get(a) as number) - (order.get(b) as number),
    );
    for (let index = 1; index < bucket.length; index++)
      if (md_ref_def_cmp(bucket[index - 1] as MD_REF_DEF, bucket[index] as MD_REF_DEF) === 0)
        bucket[index] = bucket[index - 1] as MD_REF_DEF;
  }
}
/** Looks up the native single or binary-searched complex bucket. @param ctx - Original context. @param label - UTF-8 bytes. @returns First native definition or undefined. */
export function md_lookup_ref_def(ctx: MD_REF_CONTEXT, label: Uint8Array): MD_REF_DEF | undefined {
  const size = ctx.ref_def_hashtable.length;
  if (size === 0) return undefined;
  const hash = md_link_label_hash(label),
    bucket = ctx.ref_def_hashtable[hash % size];
  if (bucket === undefined) return undefined;
  if (!Array.isArray(bucket))
    return md_link_label_cmp(bucket.label, label) === 0 ? bucket : undefined;
  const key: MD_REF_DEF = { label, hash, title: new Uint8Array(), dest_beg: 0, dest_end: 0 };
  let lo = 0,
    hi = bucket.length;
  while (lo < hi) {
    const index = Math.trunc((lo + hi) / 2),
      item = bucket[index] as MD_REF_DEF,
      cmp = md_ref_def_cmp(key, item);
    if (cmp === 0) return item;
    if (cmp < 0) hi = index;
    else lo = index + 1;
  }
  return undefined;
}
/** Recognizes and stores source reference definitions, preserving title scanner side effects. @param ctx - Original context. @param lines - Candidate paragraph lines. @returns Consumed line count or zero. */
export function md_is_link_reference_definition(
  ctx: MD_REF_CONTEXT,
  lines: readonly MD_LINE[],
): number {
  const text = ctx.text,
    label = md_is_link_label(ctx, lines, (lines[0] as MD_LINE).beg);
  if (label === undefined) return 0;
  let off = label.end,
    lineIndex = label.end_line_index;
  if (off >= (lines[lineIndex] as MD_LINE).end || text[off] !== 58) return 0;
  off++;
  while (off < (lines[lineIndex] as MD_LINE).end && ISWHITESPACE_(text[off] as number)) off++;
  if (off >= (lines[lineIndex] as MD_LINE).end) {
    lineIndex++;
    if (lineIndex >= lines.length) return 0;
    off = (lines[lineIndex] as MD_LINE).beg;
  }
  const dest = md_is_link_destination(ctx, off, (lines[lineIndex] as MD_LINE).end);
  if (dest === undefined) return 0;
  off = dest.end;
  const title = md_is_link_title(ctx, lines.slice(lineIndex), off);
  // A successful scanner writes off even when the following end-of-line condition rejects its title.
  if (title !== undefined) off = title.end;
  let titleBytes: Uint8Array = new Uint8Array();
  if (title !== undefined && off >= (lines[lineIndex + title.end_line_index] as MD_LINE).end) {
    const titleBegLine = lineIndex + title.beg_line_index;
    titleBytes =
      title.beg_line_index !== title.end_line_index
        ? md_merge_lines(
            text,
            title.contents_beg,
            title.contents_end,
            lines.slice(titleBegLine),
            10,
          )
        : text.subarray(title.contents_beg, title.contents_end);
    lineIndex += title.end_line_index;
  }
  if (off < (lines[lineIndex] as MD_LINE).end) return 0;
  ctx.ref_defs.push({
    label:
      label.beg_line_index !== label.end_line_index
        ? md_merge_lines(
            text,
            label.contents_beg,
            label.contents_end,
            lines.slice(label.beg_line_index),
            32,
          )
        : text.subarray(label.contents_beg, label.contents_end),
    title: titleBytes,
    hash: 0,
    dest_beg: dest.contents_beg,
    dest_end: dest.contents_end,
  });
  return lineIndex + 1;
}
/** Resolves a source full/collapsed/shortcut reference with its strict cumulative output budget. @param ctx - Original context. @param lines - Text lines. @param beg - First bracket/image mark. @param end - Exclusive closing bracket. @returns Native properties or undefined. */
export function md_is_link_reference(
  ctx: MD_REF_CONTEXT,
  lines: readonly MD_LINE[],
  beg: number,
  end: number,
): MD_LINK_ATTR | undefined {
  if (ctx.max_ref_def_output === 0) return undefined;
  beg += ctx.text[beg] === 33 ? 2 : 1;
  end--;
  const found = md_lookup_line(beg, lines);
  if (found === undefined) return undefined;
  const [line, index] = found;
  const label =
    end > line.end
      ? md_merge_lines(ctx.text, beg, end, lines.slice(index), 32)
      : ctx.text.subarray(beg, end);
  const def = md_lookup_ref_def(ctx, label);
  if (def === undefined) return undefined;
  const size = def.label.length + def.title.length + def.dest_end - def.dest_beg;
  if (size >= ctx.max_ref_def_output) {
    ctx.max_ref_def_output = 0;
    return undefined;
  }
  ctx.max_ref_def_output -= size;
  return {
    dest_beg: def.dest_beg,
    dest_end: def.dest_end,
    title: def.title,
    title_needs_free: false,
  };
}
/** Recognizes a complete source inline-link suffix, including omitted destinations and multiline titles. @param ctx - Original context. @param lines - Native text lines. @param beg - Opening parenthesis. @returns End and native properties or undefined. */
export function md_is_inline_link_spec(
  ctx: MD_SCAN_CONTEXT,
  lines: readonly MD_LINE[],
  beg: number,
): { readonly end: number; readonly attr: MD_LINK_ATTR } | undefined {
  const text = ctx.text,
    found = md_lookup_line(beg, lines);
  if (found === undefined) return undefined;
  let lineIndex = found[1],
    off = beg + 1;
  while (off < (lines[lineIndex] as MD_LINE).end && ISWHITESPACE_(text[off] as number)) off++;
  if (
    off >= (lines[lineIndex] as MD_LINE).end &&
    (off >= ctx.size || ISNEWLINE_(text[off] as number))
  ) {
    lineIndex++;
    if (lineIndex >= lines.length) return undefined;
    off = (lines[lineIndex] as MD_LINE).beg;
  }
  if (off < ctx.size && text[off] === 41)
    return {
      end: off + 1,
      attr: { dest_beg: off, dest_end: off, title: new Uint8Array(), title_needs_free: false },
    };
  const dest = md_is_link_destination(ctx, off, (lines[lineIndex] as MD_LINE).end);
  if (dest === undefined) return undefined;
  off = dest.end;
  const title = md_is_link_title(ctx, lines.slice(lineIndex), off);
  let titleBytes: Uint8Array = new Uint8Array();
  if (title !== undefined) {
    off = title.end;
    const titleBegLine = lineIndex + title.beg_line_index;
    titleBytes =
      title.beg_line_index !== title.end_line_index
        ? md_merge_lines(
            text,
            title.contents_beg,
            title.contents_end,
            lines.slice(titleBegLine),
            10,
          )
        : text.subarray(title.contents_beg, title.contents_end);
    lineIndex += title.end_line_index;
  }
  while (off < (lines[lineIndex] as MD_LINE).end && ISWHITESPACE_(text[off] as number)) off++;
  if (off >= (lines[lineIndex] as MD_LINE).end) {
    lineIndex++;
    if (lineIndex >= lines.length) return undefined;
    off = (lines[lineIndex] as MD_LINE).beg;
  }
  if (text[off] !== 41) return undefined;
  return {
    end: off + 1,
    attr: {
      dest_beg: dest.contents_beg,
      dest_end: dest.contents_end,
      title: titleBytes,
      title_needs_free:
        title !== undefined &&
        title.beg_line_index !== title.end_line_index &&
        titleBytes.length > 0,
    },
  };
}
