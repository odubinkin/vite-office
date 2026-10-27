/** @fileoverview md4c.c md_collect_marks with native precedence for escapes, code, HTML, links and delimiter runs. See ../LICENSE. */
import type { MD_LINE } from "./md4c.scan";
import {
  ISALNUM_,
  ISNEWLINE_,
  ISPUNCT_,
  ISWHITESPACE_,
  md_ascii_eq,
  md_lookup_line,
} from "./md4c.scan";
import {
  md_decode_unicode,
  md_decode_utf8_before__,
  md_is_unicode_punct__,
  md_is_unicode_whitespace__,
} from "./md4c.unicode";
import { md_is_code_span } from "./md4c.codespan";
import { md_is_html_any } from "./md4c.html";
import { md_is_autolink } from "./md4c.autolink.scan";
import * as F from "./md4c.h";
import * as M from "./md4c.mark";
/** Collects native delimiter records without rebuilding text or rewriting Markdown syntax. @param ctx - Context. @param lines - Source line bounds. @param tableMode - Table boundary pass. @returns Nothing. */
export function md_collect_marks(
  ctx: M.MD_MARK_CONTEXT,
  lines: readonly MD_LINE[],
  tableMode: boolean,
): void {
  const text = ctx.text,
    enc = new TextEncoder(),
    potential = new Array<number>(32).fill(0);
  let scannedEnd = false;
  /** Resolves native character context before a delimiter. @param off - Byte position. @returns Whitespace/punctuation/other level. */
  function before(off: number): number {
    const cp = md_decode_utf8_before__(text, off);
    return md_is_unicode_whitespace__(cp) ? 0 : md_is_unicode_punct__(cp) ? 1 : 2;
  }
  /** Resolves native character context after a delimiter. @param off - Byte position. @returns Whitespace/punctuation/other level. */
  function after(off: number): number {
    const cp = md_decode_unicode(text, off, ctx.size)[0];
    return md_is_unicode_whitespace__(cp) ? 0 : md_is_unicode_punct__(cp) ? 1 : 2;
  }
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    let line = lines[lineIndex] as MD_LINE,
      off = line.beg;
    while (true) {
      while (off < line.end && !ctx.mark_char_map[text[off] as number]) off++;
      if (off >= line.end) break;
      const ch = text[off] as number;
      if (
        ch === 92 &&
        off + 1 < ctx.size &&
        (ISPUNCT_(text[off + 1] as number) || ISNEWLINE_(text[off + 1] as number))
      ) {
        if (!ISNEWLINE_(text[off + 1] as number) || lineIndex + 1 < lines.length)
          M.md_add_mark(ctx, ch, off, off + 2, M.MD_MARK_RESOLVED);
        off += 2;
        continue;
      }
      if (ch === 42 || ch === 95) {
        let tmp = off + 1;
        while (tmp < line.end && text[tmp] === ch) tmp++;
        let left = off === line.beg ? 0 : before(off),
          right = tmp === line.end ? 0 : after(tmp);
        if (ch === 95 && left === 2 && right === 2) {
          left = 0;
          right = 0;
        }
        if (left !== 0 || right !== 0) {
          let flags = 0;
          if (left > 0 && left >= right) flags |= M.MD_MARK_POTENTIAL_CLOSER;
          if (right > 0 && right >= left) flags |= M.MD_MARK_POTENTIAL_OPENER;
          if (flags === (M.MD_MARK_POTENTIAL_OPENER | M.MD_MARK_POTENTIAL_CLOSER))
            flags |= M.MD_MARK_EMPH_OC;
          flags |= [M.MD_MARK_EMPH_MOD3_0, M.MD_MARK_EMPH_MOD3_1, M.MD_MARK_EMPH_MOD3_2][
            (tmp - off) % 3
          ] as number;
          M.md_add_mark(ctx, ch, off, tmp, flags);
          off++;
          while (off < tmp) {
            M.md_add_mark(ctx, 68, off, off, 0);
            off++;
          }
          continue;
        }
        off = tmp;
        continue;
      }
      if (ch === 96) {
        const result = md_is_code_span(ctx, lines.slice(lineIndex), off, potential, scannedEnd);
        scannedEnd = result.reached_end;
        if (result.opener !== undefined && result.closer !== undefined) {
          const a = result.opener,
            b = result.closer;
          M.md_add_mark(ctx, a.ch, a.beg, a.end, a.flags);
          M.md_add_mark(ctx, b.ch, b.beg, b.end, b.flags);
          M.md_resolve_range(ctx, ctx.n_marks - 2, ctx.n_marks - 1);
          off = b.end;
          if (off > line.end) {
            const found = md_lookup_line(off, lines);
            if (found === undefined) throw new Error("Invalid md4c code span line.");
            [line, lineIndex] = found;
          }
          continue;
        }
        off = result.opener_end;
        continue;
      }
      if (ch === 38) {
        M.md_add_mark(ctx, ch, off, off + 1, M.MD_MARK_POTENTIAL_OPENER);
        off++;
        continue;
      }
      if (ch === 59) {
        if (ctx.n_marks > 0 && (ctx.marks[ctx.n_marks - 1] as M.MD_MARK).ch === 38)
          M.md_add_mark(ctx, ch, off, off + 1, M.MD_MARK_POTENTIAL_CLOSER);
        off++;
        continue;
      }
      if (ch === 60) {
        if (!(ctx.parser.flags & F.MD_FLAG_NOHTMLSPANS)) {
          const htmlEnd = md_is_html_any(
            ctx,
            lines.slice(lineIndex),
            off,
            (lines[lines.length - 1] as MD_LINE).end,
          );
          if (htmlEnd >= 0) {
            M.md_add_mark(ctx, 60, off, off, M.MD_MARK_OPENER | M.MD_MARK_RESOLVED);
            M.md_add_mark(ctx, 62, htmlEnd, htmlEnd, M.MD_MARK_CLOSER | M.MD_MARK_RESOLVED);
            (ctx.marks[ctx.n_marks - 2] as M.MD_MARK).next = ctx.n_marks - 1;
            (ctx.marks[ctx.n_marks - 1] as M.MD_MARK).prev = ctx.n_marks - 2;
            off = htmlEnd;
            if (off > line.end) {
              const found = md_lookup_line(off, lines);
              if (found === undefined) throw new Error("Invalid md4c HTML span line.");
              [line, lineIndex] = found;
            }
            continue;
          }
        }
        const link = md_is_autolink(ctx, off, (lines[lines.length - 1] as MD_LINE).end);
        if (link !== undefined) {
          const flags =
            M.MD_MARK_RESOLVED |
            M.MD_MARK_AUTOLINK |
            (link.missing_mailto ? M.MD_MARK_AUTOLINK_MISSING_MAILTO : 0);
          M.md_add_mark(ctx, 60, off, off + 1, M.MD_MARK_OPENER | flags);
          M.md_add_mark(ctx, 62, link.end - 1, link.end, M.MD_MARK_CLOSER | flags);
          (ctx.marks[ctx.n_marks - 2] as M.MD_MARK).next = ctx.n_marks - 1;
          (ctx.marks[ctx.n_marks - 1] as M.MD_MARK).prev = ctx.n_marks - 2;
          off = link.end;
          continue;
        }
        off++;
        continue;
      }
      if (ch === 91 || (ch === 33 && off + 1 < line.end && text[off + 1] === 91)) {
        const tmp = ch === 91 ? off + 1 : off + 2;
        M.md_add_mark(ctx, ch, off, tmp, M.MD_MARK_POTENTIAL_OPENER);
        off = tmp;
        M.md_add_mark(ctx, 68, off, off, 0);
        M.md_add_mark(ctx, 68, off, off, 0);
        continue;
      }
      if (ch === 93) {
        M.md_add_mark(ctx, ch, off, off + 1, M.MD_MARK_POTENTIAL_CLOSER);
        off++;
        continue;
      }
      if (ch === 64) {
        if (
          line.beg + 1 <= off &&
          ISALNUM_(text[off - 1] as number) &&
          off + 3 < line.end &&
          ISALNUM_(text[off + 1] as number)
        ) {
          M.md_add_mark(ctx, ch, off, off + 1, M.MD_MARK_POTENTIAL_OPENER);
          M.md_add_mark(ctx, 68, line.beg, line.end, 0);
        }
        off++;
        continue;
      }
      if (ch === 58) {
        for (const scheme of ["http", "https", "ftp"]) {
          const value = enc.encode(scheme);
          if (
            line.beg + value.length <= off &&
            md_ascii_eq(text.subarray(off - value.length), value, value.length) &&
            off + 3 < line.end &&
            text[off + 1] === 47 &&
            text[off + 2] === 47
          ) {
            M.md_add_mark(ctx, ch, off - value.length, off + 3, M.MD_MARK_POTENTIAL_OPENER);
            M.md_add_mark(ctx, 68, line.beg, line.end, 0);
            off += 3;
            break;
          }
        }
        off++;
        continue;
      }
      if (ch === 46) {
        if (
          line.beg + 3 <= off &&
          md_ascii_eq(text.subarray(off - 3), enc.encode("www"), 3) &&
          (off - 3 === line.beg || before(off - 3) <= 1)
        ) {
          M.md_add_mark(ctx, ch, off - 3, off + 1, M.MD_MARK_POTENTIAL_OPENER);
          M.md_add_mark(ctx, 68, line.beg, line.end, 0);
          off++;
          continue;
        }
        off++;
        continue;
      }
      if ((tableMode || ctx.parser.flags & F.MD_FLAG_WIKILINKS) && ch === 124) {
        M.md_add_mark(ctx, ch, off, off + 1, 0);
        off++;
        continue;
      }
      if (ch === 36 || ch === 126) {
        let tmp = off + 1;
        while (tmp < line.end && text[tmp] === ch) tmp++;
        if (tmp - off <= 2) {
          let flags = M.MD_MARK_POTENTIAL_OPENER | M.MD_MARK_POTENTIAL_CLOSER;
          if (off > line.beg && before(off) === 2) flags &= ~M.MD_MARK_POTENTIAL_OPENER;
          if (tmp < line.end && after(tmp) === 2) flags &= ~M.MD_MARK_POTENTIAL_CLOSER;
          if (flags !== 0) M.md_add_mark(ctx, ch, off, tmp, flags);
        }
        off = tmp;
        continue;
      }
      if (ISWHITESPACE_(ch)) {
        let tmp = off + 1;
        while (tmp < line.end && ISWHITESPACE_(text[tmp] as number)) tmp++;
        if (tmp - off > 1 || ch !== 32) M.md_add_mark(ctx, ch, off, tmp, M.MD_MARK_RESOLVED);
        off = tmp;
        continue;
      }
      if (ch === 0) {
        M.md_add_mark(ctx, ch, off, off + 1, M.MD_MARK_RESOLVED);
        off++;
        continue;
      }
      off++;
    }
  }
  M.md_add_mark(ctx, 127, ctx.size, ctx.size, M.MD_MARK_RESOLVED);
}
