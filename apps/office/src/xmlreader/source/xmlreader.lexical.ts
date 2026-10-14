/** @fileoverview Original xmlreader whitespace, comments, PI, DTD, CDATA and name scanning. */
import { Span } from "../inc/span";
import { byte, peek, read, span, fail, isSpace, matches, literal } from "./xmlreader.state";
import type { ReaderState } from "./xmlreader.state";
/** Original line-end normalization into the actual Pad. @param r - Reader. @param value - Source span. @returns Nothing. */
export function normalizeLineEnds(r: ReaderState, value: Span): void {
  const input = value.begin as Uint8Array;
  let p = 0,
    n = value.length;
  for (;;) {
    const i = input.subarray(p, p + n).indexOf(13);
    if (i < 0) break;
    r.pad_.add(input.subarray(p, p + i), i);
    p += i + 1;
    n -= i + 1;
    if (n === 0 || input[p] !== 10) r.pad_.add(literal("\n"), 1);
  }
  r.pad_.add(input.subarray(p, p + n), n);
}
/** Original whitespace skip. @param r - Reader. @returns Nothing. */
export function skipSpace(r: ReaderState): void {
  while (isSpace(peek(r))) ++r.pos_;
}
/** Original optional comment scanner. @param r - Reader. @returns Whether consumed. */
export function skipComment(r: ReaderState): boolean {
  if (!matches(r, r.pos_, r.end_, "--")) return false;
  r.pos_ += 2;
  let end = r.pos_;
  while (end < r.end_ && !matches(r, end, r.end_, "--")) ++end;
  if (end === r.end_) fail(r, "premature end (within comment) of ");
  r.pos_ = end + 2;
  if (read(r) !== 62) fail(r, 'illegal "--" within comment in ');
  return true;
}
/** Original processing instruction scanner. @param r - Reader. @returns Nothing. */
export function skipProcessingInstruction(r: ReaderState): void {
  let end = r.pos_;
  while (end < r.end_ && !matches(r, end, r.end_, "?>")) ++end;
  if (end === r.end_) fail(r, "bad '<?' in ");
  r.pos_ = end + 2;
}
/** Original DTD quote scan, shared by the outer declaration and internal subset. @param r - Reader. @param quote - Delimiter. @returns Nothing. */
function skipQuote(r: ReaderState, quote: number): void {
  const end = r.bytes_.indexOf(quote, r.pos_);
  if (end < 0) fail(r, "premature end (within DTD) of ");
  r.pos_ = end + 1;
}
/** Original permissive DTD skip, without entity expansion. @param r - Reader. @returns Nothing. */
export function skipDocumentTypeDeclaration(r: ReaderState): void {
  for (;;) {
    const c = read(r);
    switch (c) {
      case 0:
        return fail(r, "premature end (within DTD) of ");
      case 34:
      case 39:
        skipQuote(r, c);
        break;
      case 62:
        return;
      case 91:
        for (;;) {
          const nested = read(r);
          switch (nested) {
            case 0:
              return fail(r, "premature end (within DTD) of ");
            case 34:
            case 39:
              skipQuote(r, nested);
              break;
            case 60:
              switch (read(r)) {
                case 0:
                  return fail(r, "premature end (within DTD) of ");
                case 33:
                  skipComment(r);
                  break;
                case 63:
                  skipProcessingInstruction(r);
                  break;
                default:
                  break;
              }
              break;
            case 93:
              skipSpace(r);
              if (read(r) !== 62) fail(r, 'missing ">" of DTD in ');
              return;
            default:
              break;
          }
        }
      default:
        break;
    }
  }
}
/** Original optional CDATA scanner. @param r - Reader. @returns Absent or borrowed content. */
export function scanCdataSection(r: ReaderState): Span {
  if (!matches(r, r.pos_, r.end_, "[CDATA[")) return new Span();
  r.pos_ += 7;
  const begin = r.pos_;
  let end = begin;
  while (end < r.end_ && !matches(r, end, r.end_, "]]>")) ++end;
  if (end === r.end_) fail(r, "premature end (within CDATA section) of ");
  r.pos_ = end + 3;
  return span(r, begin, end);
}
/** Original byte-name scan retaining the last colon and permissive name grammar. @param r - Reader. @param colon - Nullable colon output. @returns Nonempty. */
export function scanName(r: ReaderState, colon: [number | null]): boolean {
  const begin = r.pos_;
  for (; ; ++r.pos_) {
    const c = byte(r, r.pos_);
    switch (c) {
      case 0:
      case 9:
      case 10:
      case 13:
      case 32:
      case 47:
      case 61:
      case 62:
        return r.pos_ !== begin;
      case 58:
        colon[0] = r.pos_;
        break;
      default:
        break;
    }
  }
}
