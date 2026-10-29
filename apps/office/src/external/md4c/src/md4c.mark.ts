/** @fileoverview md4c.c native inline mark records, opener stacks and character-map initialization. See ../LICENSE. */
import type { MD_BLOCK_CONTEXT } from "./md4c.block.store";
import * as F from "./md4c.h";
import { ISWHITESPACE_ } from "./md4c.scan";
/** Native common and overlapping mark flags. */
export const MD_MARK_POTENTIAL_OPENER = 1,
  MD_MARK_POTENTIAL_CLOSER = 2,
  MD_MARK_OPENER = 4,
  MD_MARK_CLOSER = 8,
  MD_MARK_RESOLVED = 16,
  MD_MARK_EMPH_OC = 32,
  MD_MARK_EMPH_MOD3_0 = 64,
  MD_MARK_EMPH_MOD3_1 = 128,
  MD_MARK_EMPH_MOD3_2 = 192,
  MD_MARK_EMPH_MOD3_MASK = 192,
  MD_MARK_AUTOLINK = 32,
  MD_MARK_AUTOLINK_MISSING_MAILTO = 64,
  MD_MARK_HASNESTEDBRACKETS = 32;
/** Native inline mark, with a JS reference replacing only the dummy's pointer union member. */
export interface MD_MARK {
  beg: number;
  end: number;
  prev: number;
  next: number;
  ch: number;
  flags: number;
  pointer?: Uint8Array;
}
/** Native unresolved-opener stack head. */
export interface MD_MARKSTACK {
  top: number;
}
/** Original context fields used by the inline phase. */
export interface MD_MARK_CONTEXT extends MD_BLOCK_CONTEXT {
  readonly marks: MD_MARK[];
  n_marks: number;
  readonly mark_char_map: Uint8Array;
  readonly opener_stacks: MD_MARKSTACK[];
  readonly ptr_stack: MD_MARKSTACK;
  n_table_cell_boundaries: number;
  table_cell_boundaries_head: number;
  table_cell_boundaries_tail: number;
  unresolved_link_head: number;
  unresolved_link_tail: number;
}
/** Returns the source emphasis stack selected by character/modulo/mixed flags. @param ctx - Context. @param ch - Marker. @param flags - Original mark flags. @returns Stack head. */
export function md_emph_stack(ctx: MD_MARK_CONTEXT, ch: number, flags: number): MD_MARKSTACK {
  return ctx.opener_stacks[
    (ch === 42 ? 0 : 6) +
      (flags & MD_MARK_EMPH_OC ? 3 : 0) +
      ((flags & MD_MARK_EMPH_MOD3_MASK) === MD_MARK_EMPH_MOD3_0
        ? 0
        : (flags & MD_MARK_EMPH_MOD3_MASK) === MD_MARK_EMPH_MOD3_1
          ? 1
          : 2)
  ] as MD_MARKSTACK;
}
/** Returns the native stack belonging to a mark family. @param ctx - Context. @param index - Mark index. @returns Stack head. */
export function md_opener_stack(ctx: MD_MARK_CONTEXT, index: number): MD_MARKSTACK {
  const mark = ctx.marks[index] as MD_MARK;
  // Preserve the original expression and exact source-map boundary for this single-arm annotation.
  // prettier-ignore
  return mark.ch === 42 || mark.ch === 95
    ? md_emph_stack(ctx, mark.ch, mark.flags)
    : (ctx.opener_stacks[
        mark.ch === 126 ? (mark.end - mark.beg === 1 ? 12 : 13) : /* istanbul ignore next -- B8TCAE-M08: only emphasis or tilde analysis calls this helper. */ 14
      ] as MD_MARKSTACK);
}
/** Reuses or appends a source mark record and applies ADD_MARK initialization. @param ctx - Context. @param ch - Marker byte. @param beg - Start. @param end - End. @param flags - Flags. @returns Actual owned mark. */
export function md_add_mark(
  ctx: MD_MARK_CONTEXT,
  ch: number,
  beg: number,
  end: number,
  flags: number,
): MD_MARK {
  const mark = ctx.marks[ctx.n_marks] ?? { beg: 0, end: 0, prev: -1, next: -1, ch: 0, flags: 0 };
  mark.beg = beg;
  mark.end = end;
  mark.prev = -1;
  mark.next = -1;
  mark.ch = ch;
  mark.flags = flags;
  delete mark.pointer;
  ctx.marks[ctx.n_marks++] = mark;
  return mark;
}
/** Pushes an opener by reusing its next field. @param ctx - Context. @param stack - Head. @param index - Mark index. @returns Nothing. */
export function md_mark_stack_push(ctx: MD_MARK_CONTEXT, stack: MD_MARKSTACK, index: number): void {
  (ctx.marks[index] as MD_MARK).next = stack.top;
  stack.top = index;
}
/** Pops a source opener without changing the removed mark. @param ctx - Context. @param stack - Head. @returns Index or -1. */
export function md_mark_stack_pop(ctx: MD_MARK_CONTEXT, stack: MD_MARKSTACK): number {
  const top = stack.top;
  /* istanbul ignore else -- B8TCAE-M07: both original pop callers require a nonnegative top. */
  if (top >= 0) stack.top = (ctx.marks[top] as MD_MARK).next;
  return top;
}
/** Resolves a source opener/closer pair in place. @param ctx - Context. @param opener - Opening index. @param closer - Closing index. @returns Nothing. */
export function md_resolve_range(ctx: MD_MARK_CONTEXT, opener: number, closer: number): void {
  const a = ctx.marks[opener] as MD_MARK,
    b = ctx.marks[closer] as MD_MARK;
  a.next = closer;
  b.prev = opener;
  a.flags |= MD_MARK_OPENER | MD_MARK_RESOLVED;
  b.flags |= MD_MARK_CLOSER | MD_MARK_RESOLVED;
}
/** Removes all later openers to prevent crossing ranges. @param ctx - Context. @param opener - Boundary index. @returns Nothing. */
export function md_pop_openers(ctx: MD_MARK_CONTEXT, opener: number): void {
  for (const stack of ctx.opener_stacks) while (stack.top >= opener) md_mark_stack_pop(ctx, stack);
}
/** Turns a source mark interval into unresolved dummies. @param ctx - Context. @param first - First index. @param end - Exclusive end. @returns Nothing. */
export function md_disable_marks(ctx: MD_MARK_CONTEXT, first: number, end: number): void {
  for (let i = first; i < end; i++) {
    const mark = ctx.marks[i] as MD_MARK;
    mark.ch = 68;
    mark.flags &= ~MD_MARK_RESOLVED;
  }
}
/** Builds the original byte-mark map with parser flags. @param ctx - Context. @returns Nothing. */
export function md_build_mark_char_map(ctx: MD_MARK_CONTEXT): void {
  const map = ctx.mark_char_map;
  map.fill(0);
  for (const ch of [92, 42, 95, 96, 38, 59, 60, 62, 91, 33, 93, 0]) map[ch] = 1;
  for (const [flag, ch] of [
    [F.MD_FLAG_STRIKETHROUGH, 126],
    [F.MD_FLAG_LATEXMATHSPANS, 36],
    [F.MD_FLAG_PERMISSIVEEMAILAUTOLINKS, 64],
    [F.MD_FLAG_PERMISSIVEURLAUTOLINKS, 58],
    [F.MD_FLAG_PERMISSIVEWWWAUTOLINKS, 46],
  ] as const)
    if (ctx.parser.flags & flag) map[ch] = 1;
  if (ctx.parser.flags & (F.MD_FLAG_TABLES | F.MD_FLAG_WIKILINKS)) map[124] = 1;
  if (ctx.parser.flags & F.MD_FLAG_COLLAPSEWHITESPACE)
    for (let i = 0; i < 256; i++) if (ISWHITESPACE_(i)) map[i] = 1;
}
