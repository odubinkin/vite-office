/** @fileoverview md4c.c reference-label hashing and comparison with source Unicode folding. See ../LICENSE. */
import {
  md_decode_unicode,
  md_get_unicode_fold_info,
  md_is_unicode_whitespace__,
  md_skip_unicode_whitespace,
} from "./md4c.unicode";
/** Source FNV-1a unsigned byte hash. @param base - Initial hash. @param bytes - Byte sequence. @returns Wrapped 32-bit value. */
export function md_fnv1a(base: number, bytes: Uint8Array): number {
  let hash = base >>> 0;
  for (const byte of bytes) hash = Math.imul(hash ^ byte, 16777619) >>> 0;
  return hash;
}
/** Hashes native unsigned codepoints using the pinned little-endian build ABI. @param base - Initial hash. @param points - Folded scalars. @returns Wrapped hash. */
function hashPoints(base: number, points: readonly number[]): number {
  let hash = base;
  for (const cp of points)
    for (let shift = 0; shift < 32; shift += 8)
      hash = Math.imul(hash ^ ((cp >>> shift) & 255), 16777619) >>> 0;
  return hash;
}
/** Hashes a reference label after source whitespace/fold normalization. @param label - UTF-8 label. @returns Source hash. */
export function md_link_label_hash(label: Uint8Array): number {
  let hash = 2166136261,
    off = md_skip_unicode_whitespace(label, 0);
  while (off < label.length) {
    const [cp, size] = md_decode_unicode(label, off);
    if (md_is_unicode_whitespace__(cp) || label[off] === 10 || label[off] === 13) {
      hash = hashPoints(hash, [32]);
      off = md_skip_unicode_whitespace(label, off);
    } else {
      hash = hashPoints(hash, md_get_unicode_fold_info(cp));
      off += size;
    }
  }
  return hash;
}
/** Loads the next source comparison fold or end-of-label space. @param label - UTF-8 label. @param off - Byte position. @returns Next offset and scalar sequence. */
function md_link_label_cmp_load_fold_info(
  label: Uint8Array,
  off: number,
): readonly [number, readonly number[]] {
  if (off >= label.length) return [md_skip_unicode_whitespace(label, off), [32]];
  const [cp, size] = md_decode_unicode(label, off);
  off += size;
  return md_is_unicode_whitespace__(cp)
    ? [md_skip_unicode_whitespace(label, off), [32]]
    : [off, md_get_unicode_fold_info(cp)];
}
/** Retains the source reversed subtraction and end-as-space comparison. @param a - First label. @param b - Second label. @returns Native signed ordering. */
export function md_link_label_cmp(a: Uint8Array, b: Uint8Array): number {
  let aOff = md_skip_unicode_whitespace(a, 0),
    bOff = md_skip_unicode_whitespace(b, 0);
  let aFold: readonly number[] = [],
    bFold: readonly number[] = [],
    ai = 0,
    bi = 0;
  while (aOff < a.length || ai < aFold.length || bOff < b.length || bi < bFold.length) {
    if (ai >= aFold.length) {
      ai = 0;
      [aOff, aFold] = md_link_label_cmp_load_fold_info(a, aOff);
    }
    if (bi >= bFold.length) {
      bi = 0;
      [bOff, bFold] = md_link_label_cmp_load_fold_info(b, bOff);
    }
    const cmp = (bFold[bi] as number) - (aFold[ai] as number);
    if (cmp !== 0) return cmp;
    ai++;
    bi++;
  }
  return 0;
}
