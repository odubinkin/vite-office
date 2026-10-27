/** @fileoverview md4c.c native inline callback emission from resolved marks. See ../LICENSE. */
import { type MD_LINE, ISNEWLINE_, ISBLANK_ } from "./md4c.scan";
import {
  MD_SPANTYPE as S,
  MD_TEXTTYPE as T,
  MD_FLAG_UNDERLINE,
  MD_FLAG_HARD_SOFT_BREAKS,
} from "./md4c.h";
import { md_build_attribute } from "./md4c.attribute";
import { type MD_CTX, md_emit_span, md_emit_text } from "./md4c.context";
import {
  type MD_MARK,
  MD_MARK_RESOLVED,
  MD_MARK_OPENER,
  MD_MARK_AUTOLINK,
  MD_MARK_AUTOLINK_MISSING_MAILTO,
} from "./md4c.mark";
const enc = new TextEncoder(),
  SPACE = new Uint8Array([32]),
  LF = new Uint8Array([10]),
  NUL = new Uint8Array([0]);
/** Emits source links/images with independently built native attribute details. @param ctx - Context. @param enter - Entry flag. @param type - Span kind. @param dest - Destination. @param autolink - Native escape mode. @param title - Title. @returns Nothing. */
function md_enter_leave_span_a<U>(
  ctx: MD_CTX<U>,
  enter: boolean,
  type: S,
  dest: Uint8Array,
  autolink: boolean,
  title: Uint8Array,
): void {
  const href = md_build_attribute(dest, autolink ? 1 : 0),
    titleAttr = md_build_attribute(title);
  md_emit_span(
    ctx,
    enter,
    type,
    type === S.MD_SPAN_IMG
      ? { src: href, title: titleAttr }
      : { href, title: titleAttr, is_autolink: Number(autolink) },
  );
}
/** Emits native resolved inline marks with original callback boundaries and line transitions. @param ctx - Context. @param lines - Native content lines. @returns Nothing. */
export function md_process_inlines<U>(ctx: MD_CTX<U>, lines: readonly MD_LINE[]): void {
  const text = ctx.text;
  let lineIndex = 0,
    line = lines[0] as MD_LINE,
    markIndex = 0,
    off = line.beg,
    type = T.MD_TEXT_NORMAL,
    hardBreak = false;
  const end = (lines[lines.length - 1] as MD_LINE).end;
  while (!((ctx.marks[markIndex] as MD_MARK).flags & MD_MARK_RESOLVED)) markIndex++;
  while (true) {
    const mark = ctx.marks[markIndex] as MD_MARK;
    let tmp = Math.min(line.end, mark.beg);
    if (tmp > off) {
      md_emit_text(ctx, type, text.subarray(off, tmp));
      off = tmp;
    }
    if (off >= mark.beg) {
      switch (mark.ch) {
        case 92:
          if (ISNEWLINE_(text[mark.beg + 1] as number)) hardBreak = true;
          else md_emit_text(ctx, type, text.subarray(mark.beg + 1, mark.beg + 2));
          break;
        case 32:
          md_emit_text(ctx, type, SPACE);
          break;
        case 96:
          md_emit_span(ctx, Boolean(mark.flags & MD_MARK_OPENER), S.MD_SPAN_CODE, undefined);
          type = mark.flags & MD_MARK_OPENER ? T.MD_TEXT_CODE : T.MD_TEXT_NORMAL;
          break;
        case 95:
        case 42:
          if (mark.ch === 95 && ctx.parser.flags & MD_FLAG_UNDERLINE) {
            while (off < mark.end) {
              md_emit_span(ctx, Boolean(mark.flags & MD_MARK_OPENER), S.MD_SPAN_U, undefined);
              off++;
            }
            break;
          }
          if (mark.flags & MD_MARK_OPENER) {
            if ((mark.end - off) % 2) {
              md_emit_span(ctx, true, S.MD_SPAN_EM, undefined);
              off++;
            }
            while (off + 1 < mark.end) {
              md_emit_span(ctx, true, S.MD_SPAN_STRONG, undefined);
              off += 2;
            }
          } else {
            while (off + 1 < mark.end) {
              md_emit_span(ctx, false, S.MD_SPAN_STRONG, undefined);
              off += 2;
            }
            if ((mark.end - off) % 2) {
              md_emit_span(ctx, false, S.MD_SPAN_EM, undefined);
            }
          }
          break;
        case 126:
          md_emit_span(ctx, Boolean(mark.flags & MD_MARK_OPENER), S.MD_SPAN_DEL, undefined);
          break;
        case 36:
          md_emit_span(
            ctx,
            Boolean(mark.flags & MD_MARK_OPENER),
            (mark.end - off) % 2 ? S.MD_SPAN_LATEXMATH : S.MD_SPAN_LATEXMATH_DISPLAY,
            undefined,
          );
          type = mark.flags & MD_MARK_OPENER ? T.MD_TEXT_LATEXMATH : T.MD_TEXT_NORMAL;
          break;
        case 91:
        case 33:
        case 93: {
          const openerIndex = mark.ch !== 93 ? markIndex : mark.prev,
            opener = ctx.marks[openerIndex] as MD_MARK,
            closer = ctx.marks[opener.next] as MD_MARK;
          if (
            opener.ch === 91 &&
            closer.ch === 93 &&
            opener.end - opener.beg >= 2 &&
            closer.end - closer.beg >= 2
          ) {
            const hasLabel = opener.end - opener.beg > 2,
              start = hasLabel ? opener.beg + 2 : opener.end,
              size = hasLabel ? opener.end - (opener.beg + 2) : closer.beg - opener.end;
            md_emit_span(ctx, mark.ch !== 93, S.MD_SPAN_WIKILINK, {
              target: md_build_attribute(text.subarray(start, start + size)),
            });
            break;
          }
          const dest = ctx.marks[openerIndex + 1] as MD_MARK,
            title = ctx.marks[openerIndex + 2] as MD_MARK;
          md_enter_leave_span_a(
            ctx,
            mark.ch !== 93,
            opener.ch === 33 ? S.MD_SPAN_IMG : S.MD_SPAN_A,
            text.subarray(dest.beg, dest.end),
            false,
            (title.pointer ?? new Uint8Array()).subarray(0, title.prev),
          );
          if (mark.ch === 93) while (mark.end > line.end) line = lines[++lineIndex] as MD_LINE;
          break;
        }
        case 60:
        case 62:
        case 64:
        case 58:
        case 46: {
          if ((mark.ch === 60 || mark.ch === 62) && !(mark.flags & MD_MARK_AUTOLINK)) {
            type = mark.flags & MD_MARK_OPENER ? T.MD_TEXT_HTML : T.MD_TEXT_NORMAL;
            break;
          }
          const opener = mark.flags & MD_MARK_OPENER ? mark : (ctx.marks[mark.prev] as MD_MARK),
            closer = ctx.marks[opener.next] as MD_MARK;
          let destination = text.subarray(opener.end, closer.beg);
          if (mark.flags & MD_MARK_OPENER) closer.flags |= 32;
          if (
            opener.ch === 64 ||
            opener.ch === 46 ||
            (opener.ch === 60 && opener.flags & MD_MARK_AUTOLINK_MISSING_MAILTO)
          ) {
            const prefix = enc.encode(opener.ch === 46 ? "http://" : "mailto:"),
              joined = new Uint8Array(prefix.length + destination.length);
            joined.set(prefix);
            joined.set(destination, prefix.length);
            destination = joined;
          }
          if (closer.flags & 32)
            md_enter_leave_span_a(
              ctx,
              Boolean(mark.flags & MD_MARK_OPENER),
              S.MD_SPAN_A,
              destination,
              true,
              new Uint8Array(),
            );
          break;
        }
        case 38:
          md_emit_text(ctx, T.MD_TEXT_ENTITY, text.subarray(mark.beg, mark.end));
          break;
        case 0:
          md_emit_text(ctx, T.MD_TEXT_NULLCHAR, NUL);
          break;
        case 127:
          return;
      }
      off = mark.end;
      markIndex++;
      while (
        !((ctx.marks[markIndex] as MD_MARK).flags & MD_MARK_RESOLVED) ||
        (ctx.marks[markIndex] as MD_MARK).beg < off
      )
        markIndex++;
    }
    if (off >= line.end) {
      if (off >= end) return;
      if (type === T.MD_TEXT_CODE || type === T.MD_TEXT_LATEXMATH) {
        tmp = off;
        while (off < ctx.size && ISBLANK_(text[off] as number)) off++;
        if (off > tmp) md_emit_text(ctx, type, text.subarray(tmp, off));
        if (off === line.end) md_emit_text(ctx, type, SPACE);
      } else if (type === T.MD_TEXT_HTML) {
        tmp = off;
        while (tmp < end && ISBLANK_(text[tmp] as number)) tmp++;
        if (tmp > off) md_emit_text(ctx, T.MD_TEXT_HTML, text.subarray(off, tmp));
        md_emit_text(ctx, T.MD_TEXT_HTML, LF);
      } else {
        let breakType = T.MD_TEXT_SOFTBR;
        if (type === T.MD_TEXT_NORMAL) {
          if (hardBreak || ctx.parser.flags & MD_FLAG_HARD_SOFT_BREAKS) breakType = T.MD_TEXT_BR;
          else {
            while (off < ctx.size && ISBLANK_(text[off] as number)) off++;
            if (
              off >= line.end + 2 &&
              text[off - 2] === 32 &&
              text[off - 1] === 32 &&
              ISNEWLINE_(text[off] as number)
            )
              breakType = T.MD_TEXT_BR;
          }
        }
        md_emit_text(ctx, breakType, LF);
      }
      line = lines[++lineIndex] as MD_LINE;
      off = Math.max(off, line.beg);
      hardBreak = false;
    }
  }
}
