/** @fileoverview md4c.c delimiter analysis, rule-of-three stacks and native inline precedence passes. See ../LICENSE. */
import { type MD_LINE } from "./md4c.scan";
import { md_is_entity_str } from "./md4c.attribute";
import { md_collect_marks } from "./md4c.mark.collect";
import { md_analyze_permissive_autolink } from "./md4c.autolink";
import { md_resolve_links } from "./md4c.mark.link";
import { MD_FLAG_PERMISSIVEAUTOLINKS } from "./md4c.h";
import * as M from "./md4c.mark";
/** Builds the original inner-to-outer list of bracket pairs. @param ctx - Context. @param index - Bracket mark. @returns Nothing. */
function md_analyze_bracket(ctx: M.MD_MARK_CONTEXT, index: number): void {
  const mark = ctx.marks[index] as M.MD_MARK,
    stack = ctx.opener_stacks[14] as M.MD_MARKSTACK;
  if (mark.flags & M.MD_MARK_POTENTIAL_OPENER) {
    if (stack.top >= 0) (ctx.marks[stack.top] as M.MD_MARK).flags |= M.MD_MARK_HASNESTEDBRACKETS;
    M.md_mark_stack_push(ctx, stack, index);
    return;
  }
  if (stack.top >= 0) {
    const openerIndex = M.md_mark_stack_pop(ctx, stack),
      opener = ctx.marks[openerIndex] as M.MD_MARK;
    opener.next = index;
    mark.prev = openerIndex;
    if (ctx.unresolved_link_tail >= 0)
      (ctx.marks[ctx.unresolved_link_tail] as M.MD_MARK).prev = openerIndex;
    else ctx.unresolved_link_head = openerIndex;
    ctx.unresolved_link_tail = openerIndex;
    opener.prev = -1;
  }
}
/** Resolves an entity with its immediately following native semicolon mark. @param ctx - Context. @param index - Ampersand. @returns Nothing. */
function md_analyze_entity(ctx: M.MD_MARK_CONTEXT, index: number): void {
  if (index + 1 >= ctx.n_marks) return;
  const a = ctx.marks[index] as M.MD_MARK,
    b = ctx.marks[index + 1] as M.MD_MARK;
  if (b.ch === 59 && md_is_entity_str(ctx.text, a.beg, b.end) >= 0) {
    M.md_resolve_range(ctx, index, index + 1);
    a.end = b.end;
  }
}
/** Adds one source table-cell delimiter to its index chain. @param ctx - Context. @param index - Pipe. @returns Nothing. */
function md_analyze_table_cell_boundary(ctx: M.MD_MARK_CONTEXT, index: number): void {
  const mark = ctx.marks[index] as M.MD_MARK;
  mark.flags |= M.MD_MARK_RESOLVED;
  mark.next = -1;
  if (ctx.table_cell_boundaries_head < 0) ctx.table_cell_boundaries_head = index;
  else (ctx.marks[ctx.table_cell_boundaries_tail] as M.MD_MARK).next = index;
  ctx.table_cell_boundaries_tail = index;
  ctx.n_table_cell_boundaries++;
}
/** Splits an original delimiter into a reserved dummy slot without replacing that slot's object identity. @param ctx - Context. @param index - Delimiter. @param count - New suffix length. @returns New mark index. */
function md_split_emph_mark(ctx: M.MD_MARK_CONTEXT, index: number, count: number): number {
  const mark = ctx.marks[index] as M.MD_MARK,
    nextIndex = index + mark.end - mark.beg - count,
    dummy = ctx.marks[nextIndex] as M.MD_MARK;
  delete dummy.pointer;
  Object.assign(dummy, mark);
  mark.end -= count;
  dummy.beg = mark.end;
  return nextIndex;
}
/** Resolves source emphasis with its exact rule-of-three stack order. @param ctx - Context. @param index - Candidate. @returns Nothing. */
function md_analyze_emph(ctx: M.MD_MARK_CONTEXT, index: number): void {
  const mark = ctx.marks[index] as M.MD_MARK;
  if (mark.flags & M.MD_MARK_POTENTIAL_CLOSER) {
    const stacks: M.MD_MARKSTACK[] = [],
      flags = mark.flags,
      mod = flags & M.MD_MARK_EMPH_MOD3_MASK;
    stacks.push(M.md_emph_stack(ctx, mark.ch, M.MD_MARK_EMPH_MOD3_0 | M.MD_MARK_EMPH_OC));
    if (mod !== M.MD_MARK_EMPH_MOD3_2)
      stacks.push(M.md_emph_stack(ctx, mark.ch, M.MD_MARK_EMPH_MOD3_1 | M.MD_MARK_EMPH_OC));
    if (mod !== M.MD_MARK_EMPH_MOD3_1)
      stacks.push(M.md_emph_stack(ctx, mark.ch, M.MD_MARK_EMPH_MOD3_2 | M.MD_MARK_EMPH_OC));
    stacks.push(M.md_emph_stack(ctx, mark.ch, M.MD_MARK_EMPH_MOD3_0));
    if (!(flags & M.MD_MARK_EMPH_OC) || mod !== M.MD_MARK_EMPH_MOD3_2)
      stacks.push(M.md_emph_stack(ctx, mark.ch, M.MD_MARK_EMPH_MOD3_1));
    if (!(flags & M.MD_MARK_EMPH_OC) || mod !== M.MD_MARK_EMPH_MOD3_1)
      stacks.push(M.md_emph_stack(ctx, mark.ch, M.MD_MARK_EMPH_MOD3_2));
    let opener: M.MD_MARK | undefined,
      openerIndex = 0;
    for (const stack of stacks)
      if (stack.top >= 0) {
        const candidate = ctx.marks[stack.top] as M.MD_MARK;
        if (opener === undefined || candidate.end > opener.end) {
          openerIndex = stack.top;
          opener = candidate;
        }
      }
    if (opener !== undefined) {
      const openerSize = opener.end - opener.beg,
        closerSize = mark.end - mark.beg,
        stack = M.md_opener_stack(ctx, openerIndex);
      if (openerSize > closerSize) {
        openerIndex = md_split_emph_mark(ctx, openerIndex, closerSize);
        M.md_mark_stack_push(ctx, stack, openerIndex);
      } else if (openerSize < closerSize) md_split_emph_mark(ctx, index, closerSize - openerSize);
      M.md_pop_openers(ctx, openerIndex);
      M.md_resolve_range(ctx, openerIndex, index);
      return;
    }
  }
  if (mark.flags & M.MD_MARK_POTENTIAL_OPENER)
    M.md_mark_stack_push(ctx, M.md_emph_stack(ctx, mark.ch, mark.flags), index);
}
/** Resolves source one/two-tilde pairs of equal length. @param ctx - Context. @param index - Candidate. @returns Nothing. */
function md_analyze_tilde(ctx: M.MD_MARK_CONTEXT, index: number): void {
  const mark = ctx.marks[index] as M.MD_MARK,
    stack = M.md_opener_stack(ctx, index);
  if (mark.flags & M.MD_MARK_POTENTIAL_CLOSER && stack.top >= 0) {
    const opener = stack.top;
    M.md_pop_openers(ctx, opener);
    M.md_resolve_range(ctx, opener, index);
    return;
  }
  if (mark.flags & M.MD_MARK_POTENTIAL_OPENER) M.md_mark_stack_push(ctx, stack, index);
}
/** Resolves source non-nesting math pairs. @param ctx - Context. @param index - Candidate. @returns Nothing. */
function md_analyze_dollar(ctx: M.MD_MARK_CONTEXT, index: number): void {
  const mark = ctx.marks[index] as M.MD_MARK,
    stack = ctx.opener_stacks[15] as M.MD_MARKSTACK;
  if (mark.flags & M.MD_MARK_POTENTIAL_CLOSER && stack.top >= 0) {
    const openerIndex = stack.top,
      opener = ctx.marks[openerIndex] as M.MD_MARK;
    if (opener.end - opener.beg === mark.end - mark.beg) {
      M.md_pop_openers(ctx, openerIndex);
      M.md_disable_marks(ctx, openerIndex + 1, index);
      M.md_resolve_range(ctx, openerIndex, index);
      stack.top = -1;
      return;
    }
  }
  if (mark.flags & M.MD_MARK_POTENTIAL_OPENER) M.md_mark_stack_push(ctx, stack, index);
}
/** Performs a native precedence pass over selected mark families. @param ctx - Context. @param lines - Source lines. @param first - First mark. @param end - Exclusive end. @param chars - Selected ASCII families. @param flags - MD_ANALYZE_NOSKIP_EMPH bit. @returns Nothing. */
export function md_analyze_marks(
  ctx: M.MD_MARK_CONTEXT,
  lines: readonly MD_LINE[],
  first: number,
  end: number,
  chars: string,
  flags: number,
): void {
  let index = first,
    lastEnd = (lines[0] as MD_LINE).beg;
  while (index < end) {
    const mark = ctx.marks[index] as M.MD_MARK;
    if (mark.flags & M.MD_MARK_RESOLVED) {
      if (mark.flags & M.MD_MARK_OPENER && !(flags & 1 && [42, 95, 126].includes(mark.ch)))
        index = mark.next + 1;
      else index++;
      continue;
    }
    if (mark.ch === 0 || !chars.includes(String.fromCharCode(mark.ch)) || mark.beg < lastEnd) {
      index++;
      continue;
    }
    switch (mark.ch) {
      case 91:
      case 33:
      case 93:
        md_analyze_bracket(ctx, index);
        break;
      case 38:
        md_analyze_entity(ctx, index);
        break;
      case 124:
        md_analyze_table_cell_boundary(ctx, index);
        break;
      case 95:
      case 42:
        md_analyze_emph(ctx, index);
        break;
      case 126:
        md_analyze_tilde(ctx, index);
        break;
      case 36:
        md_analyze_dollar(ctx, index);
        break;
      case 46:
      case 58:
      case 64:
        md_analyze_permissive_autolink(ctx, index);
        break;
    }
    if (mark.flags & M.MD_MARK_RESOLVED)
      lastEnd = mark.flags & M.MD_MARK_OPENER ? (ctx.marks[mark.next] as M.MD_MARK).end : mark.end;
    index++;
  }
}
/** Analyzes entities/emphasis/autolinks in source link contents and clears all opener stacks. @param ctx - Context. @param lines - Native lines. @param first - Start mark. @param end - End mark. @returns Nothing. */
export function md_analyze_link_contents(
  ctx: M.MD_MARK_CONTEXT,
  lines: readonly MD_LINE[],
  first: number,
  end: number,
): void {
  md_analyze_marks(ctx, lines, first, end, "&", 0);
  md_analyze_marks(ctx, lines, first, end, "*_~$", 0);
  if (ctx.parser.flags & MD_FLAG_PERMISSIVEAUTOLINKS)
    md_analyze_marks(ctx, lines, first, end, "@:.", 1);
  for (const stack of ctx.opener_stacks) stack.top = -1;
}
/** Runs the native collect/link/table/emphasis precedence pipeline. @param ctx - Context. @param lines - Native lines. @param tableMode - Table boundary pass. @returns Nothing. */
export function md_analyze_inlines(
  ctx: M.MD_MARK_CONTEXT,
  lines: readonly MD_LINE[],
  tableMode: boolean,
): void {
  ctx.n_marks = 0;
  md_collect_marks(ctx, lines, tableMode);
  md_analyze_marks(ctx, lines, 0, ctx.n_marks, "[]!", 0);
  md_resolve_links(ctx, lines);
  (ctx.opener_stacks[14] as M.MD_MARKSTACK).top = -1;
  ctx.unresolved_link_head = -1;
  ctx.unresolved_link_tail = -1;
  if (tableMode) {
    ctx.n_table_cell_boundaries = 0;
    md_analyze_marks(ctx, lines, 0, ctx.n_marks, "|", 0);
    return;
  }
  md_analyze_link_contents(ctx, lines, 0, ctx.n_marks);
}
