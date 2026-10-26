/** @fileoverview md4c.c native inner-to-outer link resolution, including source wiki and nested-autolink edge behavior. See ../LICENSE. */
import type { MD_LINE } from "./md4c.scan";
import { ISNEWLINE_ } from "./md4c.scan";
import { type MD_LINK_ATTR, md_is_inline_link_spec, md_is_link_reference } from "./md4c.ref";
import { MD_FLAG_PERMISSIVEAUTOLINKS, MD_FLAG_WIKILINKS } from "./md4c.h";
import { md_analyze_link_contents } from "./md4c.mark.analyze";
import * as M from "./md4c.mark";
/** Resolves source bracket pairs in closer order, retaining source mutation order and ownership metadata. @param ctx - Context. @param lines - Source line bounds. @returns Nothing. */
export function md_resolve_links(ctx: M.MD_MARK_CONTEXT, lines: readonly MD_LINE[]): void {
  let openerIndex = ctx.unresolved_link_head,
    lastLinkBeg = 0,
    lastLinkEnd = 0,
    lastImgBeg = 0,
    lastImgEnd = 0;
  while (openerIndex >= 0) {
    const opener = ctx.marks[openerIndex] as M.MD_MARK,
      closerIndex = opener.next,
      closer = ctx.marks[closerIndex] as M.MD_MARK;
    let nextIndex = opener.prev,
      isLink = false,
      attr: MD_LINK_ATTR | undefined;
    const nextOpener = nextIndex >= 0 ? (ctx.marks[nextIndex] as M.MD_MARK) : undefined,
      nextCloser = nextOpener === undefined ? undefined : (ctx.marks[nextOpener.next] as M.MD_MARK);
    if (
      (opener.beg < lastLinkBeg && closer.end < lastLinkEnd) ||
      (opener.beg < lastImgBeg && closer.end < lastImgEnd) ||
      (opener.beg < lastLinkEnd && opener.ch === 91)
    ) {
      openerIndex = nextIndex;
      continue;
    }
    if (
      ctx.parser.flags & MD_FLAG_WIKILINKS &&
      opener.end - opener.beg === 1 &&
      nextOpener !== undefined &&
      nextOpener.ch === 91 &&
      nextOpener.beg === opener.beg - 1 &&
      nextOpener.end - nextOpener.beg === 1 &&
      nextCloser !== undefined &&
      nextCloser.ch === 93 &&
      nextCloser.beg === closer.beg + 1 &&
      nextCloser.end - nextCloser.beg === 1
    ) {
      isLink = true;
      let delimiter: M.MD_MARK | undefined,
        delimiterIndex = openerIndex + 1;
      while (delimiterIndex < closerIndex) {
        const mark = ctx.marks[delimiterIndex] as M.MD_MARK;
        if (mark.ch === 124) {
          delimiter = mark;
          break;
        }
        if (mark.ch !== 68) {
          if (mark.beg - opener.end > 100) break;
          if (mark.flags & M.MD_MARK_OPENER) delimiterIndex = mark.next;
        }
        delimiterIndex++;
      }
      const destBeg = opener.end,
        destEnd = delimiter === undefined ? closer.beg : delimiter.beg;
      if (destEnd - destBeg === 0 || destEnd - destBeg > 100) isLink = false;
      if (isLink)
        for (let off = destBeg; off < destEnd; off++)
          if (ISNEWLINE_(ctx.text[off] as number)) {
            isLink = false;
            break;
          }
      if (isLink) {
        M.md_pop_openers(ctx, openerIndex);
        if (delimiter !== undefined) {
          if (delimiter.end < closer.beg) {
            // The pinned source passes this reversed interval; do not repair its no-op.
            M.md_disable_marks(ctx, delimiterIndex + 1, delimiterIndex);
            delimiter.flags |= M.MD_MARK_RESOLVED;
            opener.end = delimiter.beg;
          } else {
            M.md_disable_marks(ctx, openerIndex + 1, closerIndex);
            closer.beg = delimiter.beg;
          }
        }
        opener.beg = nextOpener.beg;
        opener.next = closerIndex;
        opener.flags |= M.MD_MARK_OPENER | M.MD_MARK_RESOLVED;
        closer.end = nextCloser.end;
        closer.prev = openerIndex;
        closer.flags |= M.MD_MARK_CLOSER | M.MD_MARK_RESOLVED;
        lastLinkBeg = opener.beg;
        lastLinkEnd = closer.end;
        if (delimiter !== undefined)
          md_analyze_link_contents(ctx, lines, delimiterIndex + 1, closerIndex);
        openerIndex = nextOpener.prev;
        continue;
      }
    }
    if (nextOpener !== undefined && nextOpener.beg === closer.end) {
      if ((nextCloser as M.MD_MARK).beg > closer.end + 1) {
        if (!(nextOpener.flags & M.MD_MARK_HASNESTEDBRACKETS))
          attr = md_is_link_reference(ctx, lines, nextOpener.beg, (nextCloser as M.MD_MARK).end);
      } else if (!(opener.flags & M.MD_MARK_HASNESTEDBRACKETS))
        attr = md_is_link_reference(ctx, lines, opener.beg, closer.end);
      isLink = attr !== undefined;
      if (isLink) {
        closer.end = (nextCloser as M.MD_MARK).end;
        nextIndex = (ctx.marks[nextIndex] as M.MD_MARK).prev;
      }
    } else {
      if (closer.end < ctx.size && ctx.text[closer.end] === 40) {
        const inline = md_is_inline_link_spec(ctx, lines, closer.end);
        let following = closerIndex + 1;
        attr = inline?.attr;
        isLink = attr !== undefined;
        if (inline !== undefined) {
          while (following < ctx.n_marks) {
            const mark = ctx.marks[following] as M.MD_MARK;
            if (mark.beg >= inline.end) break;
            if (
              (mark.flags & (M.MD_MARK_OPENER | M.MD_MARK_RESOLVED)) ===
              (M.MD_MARK_OPENER | M.MD_MARK_RESOLVED)
            ) {
              if ((ctx.marks[mark.next] as M.MD_MARK).beg >= inline.end) {
                isLink = false;
                attr = undefined;
                break;
              }
              following = mark.next + 1;
            } else following++;
          }
          if (isLink) {
            closer.end = inline.end;
            M.md_disable_marks(ctx, closerIndex + 1, following);
          }
        }
      }
      if (!isLink) {
        if (!(opener.flags & M.MD_MARK_HASNESTEDBRACKETS))
          attr = md_is_link_reference(ctx, lines, opener.beg, closer.end);
        isLink = attr !== undefined;
      }
    }
    if (isLink && attr !== undefined) {
      opener.flags |= M.MD_MARK_OPENER | M.MD_MARK_RESOLVED;
      closer.flags |= M.MD_MARK_CLOSER | M.MD_MARK_RESOLVED;
      const destination = ctx.marks[openerIndex + 1] as M.MD_MARK,
        title = ctx.marks[openerIndex + 2] as M.MD_MARK;
      destination.beg = attr.dest_beg;
      destination.end = attr.dest_end;
      title.pointer = attr.title;
      if (attr.title_needs_free) M.md_mark_stack_push(ctx, ctx.ptr_stack, openerIndex + 2);
      title.prev = attr.title.length;
      if (opener.ch === 91) {
        lastLinkBeg = opener.beg;
        lastLinkEnd = closer.end;
      } else {
        lastImgBeg = opener.beg;
        lastImgEnd = closer.end;
      }
      md_analyze_link_contents(ctx, lines, openerIndex + 1, closerIndex);
      if (ctx.parser.flags & MD_FLAG_PERMISSIVEAUTOLINKS) {
        let first = openerIndex + 1,
          last = closerIndex - 1;
        while ((ctx.marks[first] as M.MD_MARK).ch === 68 && first < closerIndex) first++;
        // Pinned md4c tests first_nested here as well; preserve this source condition.
        while ((ctx.marks[first] as M.MD_MARK).ch === 68 && last > openerIndex) last--;
        const a = ctx.marks[first] as M.MD_MARK,
          b = ctx.marks[last] as M.MD_MARK;
        if (
          a.flags & M.MD_MARK_RESOLVED &&
          a.beg === opener.end &&
          [64, 58, 46].includes(a.ch) &&
          a.next === last &&
          b.end === closer.beg
        ) {
          a.ch = 68;
          a.flags &= ~M.MD_MARK_RESOLVED;
          b.ch = 68;
          b.flags &= ~M.MD_MARK_RESOLVED;
        }
      }
    }
    openerIndex = nextIndex;
  }
}
