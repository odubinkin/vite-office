/** @fileoverview md4c.c code-span recognition with native closer horizons and whitespace trimming. See ../LICENSE. */
import type { MD_MARK_CONTEXT, MD_MARK } from "./md4c.mark";
import { MD_MARK_POTENTIAL_OPENER, MD_MARK_POTENTIAL_CLOSER } from "./md4c.mark";
import { type MD_LINE, ISBLANK_ } from "./md4c.scan";
/** Source code-span scan result retains opener-end and paragraph-end side effects on failure. */
export interface MD_CODE_SPAN_RESULT {
  readonly opener_end: number;
  readonly reached_end: boolean;
  readonly opener?: MD_MARK;
  readonly closer?: MD_MARK;
}
/** Recognizes a source code span with the pinned 32-backtick limit. @param ctx - Context. @param lines - Source line slice. @param beg - Opening backtick. @param potential - Shared closer horizons. @param reached - Prior paragraph-end state. @returns Native result and side effects. */
export function md_is_code_span(
  ctx: MD_MARK_CONTEXT,
  lines: readonly MD_LINE[],
  beg: number,
  potential: number[],
  reached: boolean,
): MD_CODE_SPAN_RESULT {
  const text = ctx.text;
  let lineEnd = (lines[0] as MD_LINE).end,
    openerEnd = beg,
    lineIndex = 0;
  while (openerEnd < lineEnd && text[openerEnd] === 96) openerEnd++;
  const originalEnd = openerEnd,
    spaceAfter = openerEnd < lineEnd && text[openerEnd] === 32,
    eolAfter = openerEnd === lineEnd,
    length = openerEnd - beg;
  if (
    length > 32 ||
    (potential[length - 1] as number) >= (lines[lines.length - 1] as MD_LINE).end ||
    (reached && (potential[length - 1] as number) < openerEnd)
  )
    return { opener_end: originalEnd, reached_end: reached };
  let closerBeg = openerEnd,
    closerEnd: number,
    onlySpace = true,
    spaceBefore: boolean,
    eolBefore: boolean;
  while (true) {
    while (closerBeg < lineEnd && text[closerBeg] !== 96) {
      if (text[closerBeg] !== 32) onlySpace = false;
      closerBeg++;
    }
    closerEnd = closerBeg;
    while (closerEnd < lineEnd && text[closerEnd] === 96) closerEnd++;
    if (closerEnd - closerBeg === length) {
      spaceBefore = closerBeg > (lines[lineIndex] as MD_LINE).beg && text[closerBeg - 1] === 32;
      eolBefore = closerBeg === (lines[lineIndex] as MD_LINE).beg;
      break;
    }
    if (closerEnd - closerBeg > 0) {
      onlySpace = false;
      if (
        closerEnd - closerBeg < 32 &&
        closerBeg > (potential[closerEnd - closerBeg - 1] as number)
      )
        potential[closerEnd - closerBeg - 1] = closerBeg;
    }
    if (closerEnd >= lineEnd) {
      lineIndex++;
      if (lineIndex >= lines.length) return { opener_end: originalEnd, reached_end: true };
      lineEnd = (lines[lineIndex] as MD_LINE).end;
      closerBeg = (lines[lineIndex] as MD_LINE).beg;
    } else closerBeg = closerEnd;
  }
  if (!onlySpace && (spaceAfter || eolAfter) && (spaceBefore || eolBefore)) {
    openerEnd = spaceAfter ? openerEnd + 1 : (lines[1] as MD_LINE).beg;
    if (spaceBefore) closerBeg--;
    else {
      closerBeg = (lines[lineIndex - 1] as MD_LINE).end;
      while (closerBeg < ctx.size && ISBLANK_(text[closerBeg] as number)) closerBeg++;
    }
  }
  return {
    opener_end: openerEnd,
    reached_end: reached,
    opener: { ch: 96, beg, end: openerEnd, flags: MD_MARK_POTENTIAL_OPENER, prev: -1, next: -1 },
    closer: {
      ch: 96,
      beg: closerBeg,
      end: closerEnd,
      flags: MD_MARK_POTENTIAL_CLOSER,
      prev: -1,
      next: -1,
    },
  };
}
