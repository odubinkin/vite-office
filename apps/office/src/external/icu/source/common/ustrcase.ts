/** @fileoverview Consumed original u_strncasecmp/_cmpFold full-fold comparison from ICU78.3. Borrowed UTF16 strings and small fold buffers project native pointers/stacks; unused prefix-match outputs and other wrappers remain unported. */
import { ucase_toFullFolding, type FullFoldingPointer } from "./ucase";
import { UCASE_MAX_STRING_LENGTH } from "./ucase.h";
/** Native previous-level start/current/limit pointer frame. */
interface CmpEquivLevel {
  readonly units: string | readonly number[];
  readonly start: number;
  pos: number;
  readonly limit: number | null;
}
/** Single consumed source fold-stack state. */
interface FoldSide {
  frame: CmpEquivLevel;
  previous: CmpEquivLevel | null;
  level: number;
}
/** Original UTF16 pointer dereference with the input C-string terminator represented explicitly. @param frame - Pointer frame. @param index - Offset. @returns Code unit. */
function unit(frame: CmpEquivLevel, index: number): number {
  if (index === frame.units.length) return 0;
  return typeof frame.units === "string"
    ? frame.units.charCodeAt(index)
    : (frame.units[index] as number);
}
/** Original leading surrogate predicate. @param c - Unit. @returns Lead. */
function lead(c: number): boolean {
  return c >= 0xd800 && c <= 0xdbff;
}
/** Original trailing surrogate predicate. @param c - Unit. @returns Trail. */
function trail(c: number): boolean {
  return c >= 0xdc00 && c <= 0xdfff;
}
/** Original supplementary reconstruction. @param high - Lead. @param low - Trail. @returns Code point. */
function supplementary(high: number, low: number): number {
  return (high << 10) + low - 0x35fdc00;
}
/** Original current-level fetch and end-of-fold pop. STRNCMP_STYLE is always set by this consumed public entrypoint. @param side - Actual source-side state. @returns Unit or minus one for source exhaustion. */
function fetch(side: FoldSide): number {
  for (;;) {
    const frame = side.frame;
    if (frame.pos === frame.limit || unit(frame, frame.pos) === 0) {
      if (side.level === 0) return -1;
      side.frame = side.previous as CmpEquivLevel;
      side.previous = null;
      --side.level;
    } else return unit(frame, frame.pos++);
  }
}
/** Original complete code-point lookahead/lookbehind without advancing the current pointer. @param side - State. @param c - Already consumed unit. @returns Lookup code point. */
function codePoint(side: FoldSide, c: number): number {
  const f = side.frame;
  if (lead(c) && f.pos !== f.limit && trail(unit(f, f.pos)))
    return supplementary(c, unit(f, f.pos));
  if (trail(c) && f.start <= f.pos - 2 && lead(unit(f, f.pos - 2)))
    return supplementary(unit(f, f.pos - 2), c);
  return c;
}
/** Original push and copy of full-fold results, or unsafe UTF16 encoding of a mapped scalar. @param side - State. @param result - Native tagged result. @param pointer - Borrowed full mapping. @returns Nothing. */
function pushFold(side: FoldSide, result: number, pointer: FullFoldingPointer | null): void {
  side.previous = side.frame;
  ++side.level;
  const units: number[] = [];
  if (result <= UCASE_MAX_STRING_LENGTH) {
    for (let i = 0; i < result; ++i)
      units.push(
        (pointer as FullFoldingPointer).data[(pointer as FullFoldingPointer).index + i] as number,
      );
  } else if (result <= 0xffff) units.push(result);
  else units.push((result >> 10) + 0xd7c0, (result & 0x3ff) + 0xdc00);
  side.frame = { units, start: 0, pos: 0, limit: units.length };
}
/** Original code-point-order surrogate adjustment. @param side - State. @param c - Consumed unit. @returns Adjusted unit. */
function orderUnit(side: FoldSide, c: number): number {
  const f = side.frame;
  return (c <= 0xdbff && f.pos !== f.limit && trail(unit(f, f.pos))) ||
    (trail(c) && f.start !== f.pos - 1 && lead(unit(f, f.pos - 2)))
    ? c
    : c - 0x2800;
}
/** Original limited NUL-terminated full-fold comparison, preserving equal-unit fast paths, mismatched-surrogate rewinds, source fold-stack order and exact comparison differences. Nonnegative n or native -1 mode and readable source spans are the consumed preconditions. @param left - UTF16 C string. @param right - UTF16 C string. @param n - Native int32 maximum units. @param options - ICU fold/comparison flags. @returns Native comparison result. */
export function u_strncasecmp(left: string, right: string, n: number, options: number): number {
  n |= 0;
  options = (options | 0x11000) >>> 0;
  const a: FoldSide = {
      frame: {
        units: left,
        start: 0,
        pos: 0,
        limit: n === -1 ? null : n,
      },
      previous: null,
      level: 0,
    },
    b: FoldSide = {
      frame: {
        units: right,
        start: 0,
        pos: 0,
        limit: n === -1 ? null : n,
      },
      previous: null,
      level: 0,
    };
  let c1 = -1,
    c2 = -1;
  const pointer: [FullFoldingPointer | null] = [null];
  for (;;) {
    if (c1 < 0) c1 = fetch(a);
    if (c2 < 0) c2 = fetch(b);
    if (c1 === c2) {
      if (c1 < 0) return 0;
      c1 = c2 = -1;
      continue;
    }
    if (c1 < 0) return -1;
    if (c2 < 0) return 1;
    const cp1 = codePoint(a, c1),
      cp2 = codePoint(b, c2);
    let result: number;
    if (a.level === 0 && (result = ucase_toFullFolding(cp1, pointer, options)) >= 0) {
      if (lead(c1)) ++a.frame.pos;
      else if (trail(c1)) {
        --b.frame.pos;
        c2 = unit(b.frame, b.frame.pos - 1);
      }
      pushFold(a, result, pointer[0]);
      c1 = -1;
      continue;
    }
    if (b.level === 0 && (result = ucase_toFullFolding(cp2, pointer, options)) >= 0) {
      if (lead(c2)) ++b.frame.pos;
      else if (trail(c2)) {
        --a.frame.pos;
        c1 = unit(a.frame, a.frame.pos - 1);
      }
      pushFold(b, result, pointer[0]);
      c2 = -1;
      continue;
    }
    if (c1 >= 0xd800 && c2 >= 0xd800 && options & 0x8000) {
      c1 = orderUnit(a, c1);
      c2 = orderUnit(b, c2);
    }
    return c1 - c2;
  }
}
