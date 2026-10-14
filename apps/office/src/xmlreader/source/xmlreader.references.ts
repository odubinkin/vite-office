/** @fileoverview Original entity and attribute normalization behavior, including source-observed hexadecimal and CR quirks. */
import { byte, peek, span, fail, isSpace, matches, literal } from "./xmlreader.state";
import type { ReaderState } from "./xmlreader.state";
import type { Span } from "../inc/span";
/** Original numeric/predefined reference handling. The hex overflow guard is unreachable: valid single digits are below16; invalid digits break first. @param r - Reader. @param position - Ampersand offset. @param end - Valid input bound. @returns First byte after reference. */
export function handleReference(r: ReaderState, position: number, end: number): number {
  ++position;
  if (byte(r, position) === 35) {
    ++position;
    let val = 0,
      p: number;
    if (byte(r, position) === 120) {
      p = ++position;
      for (; ; ++position) {
        const digit = Number.parseInt(String.fromCharCode(byte(r, position)), 16);
        val = Number.isNaN(digit) ? 0xffffffff : digit;
        if (val >= 16) break;
      }
    } else {
      p = position;
      for (; ; ++position) {
        const c = byte(r, position);
        if (c >= 48 && c <= 57) val = 10 * val + c - 48;
        else break;
        if (val > 0x10ffff) fail(r, "'&#...' too large in ");
      }
    }
    if (position === p || byte(r, position++) !== 59) fail(r, "'&#...' missing ';' in ");
    if (
      (val < 32 && val !== 9 && val !== 10 && val !== 13) ||
      (val >= 0xd800 && val <= 0xdfff) ||
      val === 0xfffe ||
      val === 0xffff
    )
      fail(r, "character reference denoting invalid character in ");
    let encoded: Uint8Array;
    if (val < 0x80) encoded = new Uint8Array([val]);
    else if (val < 0x800) encoded = new Uint8Array([(val >> 6) | 0xc0, (val & 63) | 0x80]);
    else if (val < 0x10000)
      encoded = new Uint8Array([(val >> 12) | 0xe0, ((val >> 6) & 63) | 0x80, (val & 63) | 0x80]);
    else
      encoded = new Uint8Array([
        (val >>> 18) | 0xf0,
        ((val >>> 12) & 63) | 0x80,
        ((val >>> 6) & 63) | 0x80,
        (val & 63) | 0x80,
      ]);
    r.pad_.addEphemeral(encoded, encoded.length);
    return position;
  }
  for (const [input, output] of [
    ["amp;", "&"],
    ["lt;", "<"],
    ["gt;", ">"],
    ["apos;", "'"],
    ["quot;", '"'],
  ] as const) {
    if (matches(r, position, end, input)) {
      const encoded = literal(output);
      r.pad_.add(encoded, encoded.length);
      return position + input.length;
    }
  }
  return fail(r, "unknown entity reference in ");
}
/** Original attribute normalization and reference expansion. CR deliberately consults the reader's global peek. @param r - Reader. @param begin - Value start. @param end - Value end. @param fullyNormalize - Collapse and trim literal whitespace. @returns Current Pad span. */
export function handleAttributeValue(
  r: ReaderState,
  begin: number,
  end: number,
  fullyNormalize: boolean,
): Span {
  r.pad_.clear();
  if (fullyNormalize) {
    while (begin !== end && isSpace(byte(r, begin))) ++begin;
    while (end !== begin && isSpace(byte(r, end - 1))) --end;
    let p = begin;
    let space: "None" | "Span" | "Break" = "None";
    while (p !== end) {
      switch (byte(r, p)) {
        case 9:
        case 10:
        case 13:
          switch (space) {
            case "None":
              r.pad_.add(span(r, begin, p).begin as Uint8Array, p - begin);
              r.pad_.add(literal(" "), 1);
              space = "Break";
              break;
            case "Span":
              r.pad_.add(span(r, begin, p).begin as Uint8Array, p - begin);
              space = "Break";
              break;
            case "Break":
              break;
          }
          begin = ++p;
          break;
        case 32:
          switch (space) {
            case "None":
              ++p;
              space = "Span";
              break;
            case "Span":
              r.pad_.add(span(r, begin, p).begin as Uint8Array, p - begin);
              begin = ++p;
              space = "Break";
              break;
            case "Break":
              begin = ++p;
              break;
          }
          break;
        case 38:
          r.pad_.add(span(r, begin, p).begin as Uint8Array, p - begin);
          p = handleReference(r, p, end);
          begin = p;
          space = "None";
          break;
        default:
          ++p;
          space = "None";
          break;
      }
    }
    r.pad_.add(span(r, begin, p).begin as Uint8Array, p - begin);
  } else {
    let p = begin;
    while (p !== end) {
      switch (byte(r, p)) {
        case 9:
        case 10:
          r.pad_.add(span(r, begin, p).begin as Uint8Array, p - begin);
          begin = ++p;
          r.pad_.add(literal(" "), 1);
          break;
        case 13:
          r.pad_.add(span(r, begin, p).begin as Uint8Array, p - begin);
          ++p;
          if (peek(r) === 10) ++p;
          begin = p;
          r.pad_.add(literal(" "), 1);
          break;
        case 38:
          r.pad_.add(span(r, begin, p).begin as Uint8Array, p - begin);
          p = handleReference(r, p, end);
          begin = p;
          break;
        default:
          ++p;
          break;
      }
    }
    r.pad_.add(span(r, begin, p).begin as Uint8Array, p - begin);
  }
  return r.pad_.get();
}
