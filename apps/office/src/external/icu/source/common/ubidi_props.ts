/** @fileoverview ICU78.3 original bidi-class and paired-bracket scalar lookup over its pinned property trie; joining and unrelated APIs are outside this consumed slice. */
// Copyright Unicode, Inc. and others. Unicode License V3: https://www.unicode.org/license.txt
import { UTRIE2_GET16 } from "./utrie2.h";
import { ubidi_props_trie, ubidi_props_mirrors } from "./ubidi_props_data";
/** Original property class mask. @param c - Signed32 Unicode scalar. @returns UCharDirection value. */
export function ubidi_getClass(c: number): number {
  return UTRIE2_GET16(ubidi_props_trie, c | 0) & 0x1f;
}
/** Original two-bit paired-bracket type. @param c - Signed32 Unicode scalar. @returns NONE,OPEN or CLOSE. */
export function ubidi_getPairedBracketType(c: number): number {
  return (UTRIE2_GET16(ubidi_props_trie, c | 0) & 0x300) >> 8;
}
/** Original mirror-delta and sorted escape-table lookup. @param c - Signed32 Unicode scalar. @param props - Actual trie word. @returns Mirror or input itself. */
export function getMirror(c: number, props: number): number {
  const delta = (props << 16) >> 29;
  if (delta !== -4) return c + delta;
  for (const word of ubidi_props_mirrors) {
    const c2 = word & 0x1fffff;
    if (c === c2) return (ubidi_props_mirrors[word >>> 21] as number) & 0x1fffff;
    if (c < c2) break;
  }
  return c;
}
/** Original paired-bracket lookup does not mirror ordinary mirrored characters. @param c - Signed32 Unicode scalar. @returns Matching bracket or input itself. */
export function ubidi_getPairedBracket(c: number): number {
  c |= 0;
  const props = UTRIE2_GET16(ubidi_props_trie, c);
  return (props & 0x300) === 0 ? c : getMirror(c, props);
}

/** Original public uchar.h bidi-direction API delegates to the same frozen property owner. @param c - Signed32 Unicode scalar. @returns UCharDirection value. */
export function u_charDirection(c: number): number {
  return ubidi_getClass(c);
}
