/** @fileoverview md4c.c byte classification, line lookup and merging shared by native scanners. See ../LICENSE. */
/** Source line content bounds omit container indentation. */
export interface MD_LINE {
  readonly beg: number;
  readonly end: number;
}
/** Shared scanner view of the original MD_CTX; no independent parser state. */
export interface MD_SCAN_CONTEXT {
  readonly text: Uint8Array;
  readonly size: number;
  html_comment_horizon: number;
  html_proc_instr_horizon: number;
  html_decl_horizon: number;
  html_cdata_horizon: number;
}
/** Source ASCII alpha predicate. @param c - Byte. @returns Predicate. */
export function ISALPHA_(c: number): boolean {
  return (c >= 65 && c <= 90) || (c >= 97 && c <= 122);
}
/** Source ASCII digit predicate. @param c - Byte. @returns Predicate. */
export function ISDIGIT_(c: number): boolean {
  return c >= 48 && c <= 57;
}
/** Source ASCII alphanumeric predicate. @param c - Byte. @returns Predicate. */
export function ISALNUM_(c: number): boolean {
  return ISALPHA_(c) || ISDIGIT_(c);
}
/** Source space and tab predicate. @param c - Byte. @returns Predicate. */
export function ISBLANK_(c: number): boolean {
  return c === 32 || c === 9;
}
/** Source whitespace excludes line endings. @param c - Byte. @returns Predicate. */
export function ISWHITESPACE_(c: number): boolean {
  return ISBLANK_(c) || c === 11 || c === 12;
}
/** Source CR/LF predicate. @param c - Byte. @returns Predicate. */
export function ISNEWLINE_(c: number): boolean {
  return c === 10 || c === 13;
}
/** Source ASCII punctuation predicate. @param c - Byte. @returns Predicate. */
export function ISPUNCT_(c: number): boolean {
  return (
    (c >= 33 && c <= 47) || (c >= 58 && c <= 64) || (c >= 91 && c <= 96) || (c >= 123 && c <= 126)
  );
}
/** Source ASCII exact comparison. @param a - First bytes. @param b - Second bytes. @param n - Native length. @returns Equality. */
export function md_ascii_eq(a: Uint8Array, b: Uint8Array, n: number): boolean {
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) return false;
  return true;
}
/** Source ASCII-only case comparison. @param a - First bytes. @param b - Second bytes. @param n - Native length. @returns Equality. */
export function md_ascii_case_eq(a: Uint8Array, b: Uint8Array, n: number): boolean {
  for (let i = 0; i < n; i++) {
    const ac = a[i] as number,
      bc = b[i] as number;
    if ((ac >= 65 && ac <= 90 ? ac + 32 : ac) !== (bc >= 65 && bc <= 90 ? bc + 32 : bc))
      return false;
  }
  return true;
}
/** Returns the native binary-search result, including following-line gap selection. @param off - Byte offset. @param lines - Native lines. @returns Line and index or undefined. */
export function md_lookup_line(
  off: number,
  lines: readonly MD_LINE[],
): readonly [MD_LINE, number] | undefined {
  let lo = 0,
    hi = lines.length - 1;
  while (lo <= hi) {
    const pivot = Math.trunc((lo + hi) / 2),
      line = lines[pivot] as MD_LINE;
    if (off < line.beg) {
      if (hi === 0 || (lines[hi - 1] as MD_LINE).end < off) return [line, pivot];
      hi = pivot - 1;
    } else if (off > line.end) lo = pivot + 1;
    else return [line, pivot];
  }
  return undefined;
}
/** Copies source lines while replacing inter-line gaps with one byte. @param text - Document bytes. @param beg - Starting offset. @param end - End offset. @param lines - Sliced source lines. @param replacement - One replacement byte. @returns Merged bytes. */
export function md_merge_lines(
  text: Uint8Array,
  beg: number,
  end: number,
  lines: readonly MD_LINE[],
  replacement: number,
): Uint8Array {
  const output: number[] = [];
  let off = beg,
    index = 0;
  while (true) {
    const line = lines[index] as MD_LINE,
      limit = Math.min(end, line.end);
    for (; off < limit; off++) output.push(text[off] as number);
    if (off >= end) return new Uint8Array(output);
    output.push(replacement);
    index++;
    off = (lines[index] as MD_LINE).beg;
  }
}
