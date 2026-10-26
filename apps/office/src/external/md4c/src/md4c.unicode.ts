/** @fileoverview md4c.c pinned Unicode range search, classification, folding and UTF-8 byte decoding. See ../LICENSE. */
import data from "./md4c-unicode-data.json";
/** Searches the source single/range encoded table. @param codepoint - Scalar value. @param map - Pinned encoded map. @returns First range index or -1. */
export function md_unicode_bsearch__(codepoint: number, map: readonly number[]): number {
  let beg = 0,
    end = map.length - 1;
  while (beg <= end) {
    let first = Math.trunc((beg + end) / 2),
      last = first;
    if ((map[last] as number) & 0x40000000) last++;
    if ((map[first] as number) & 0x80000000) first--;
    if (codepoint < ((map[first] as number) & 0xffffff)) end = first - 1;
    else if (codepoint > ((map[last] as number) & 0xffffff)) beg = last + 1;
    else return first;
  }
  return -1;
}
/** Source ASCII whitespace excludes CR/LF; callers admit line breaks separately. @param cp - Code point. @returns Native predicate. */
export function md_is_unicode_whitespace__(cp: number): boolean {
  return cp <= 0x7f
    ? cp === 32 || cp === 9 || cp === 11 || cp === 12
    : md_unicode_bsearch__(cp, data.WHITESPACE_MAP) >= 0;
}
/** Source P/S Unicode categories use the pinned table, not host Unicode. @param cp - Code point. @returns Native predicate. */
export function md_is_unicode_punct__(cp: number): boolean {
  return cp <= 0x7f
    ? (cp >= 33 && cp <= 47) ||
        (cp >= 58 && cp <= 64) ||
        (cp >= 91 && cp <= 96) ||
        (cp >= 123 && cp <= 126)
    : md_unicode_bsearch__(cp, data.PUNCT_MAP) >= 0;
}
const FOLD_MAP_LIST = [
  { map: data.FOLD_MAP_1, values: data.FOLD_MAP_1_DATA, count: 1 },
  { map: data.FOLD_MAP_2, values: data.FOLD_MAP_2_DATA, count: 2 },
  { map: data.FOLD_MAP_3, values: data.FOLD_MAP_3_DATA, count: 3 },
];
/** Returns source one-to-three codepoint case folding. @param cp - Code point. @returns Folded scalars. */
export function md_get_unicode_fold_info(cp: number): readonly number[] {
  if (cp <= 127) return [cp >= 65 && cp <= 90 ? cp + 32 : cp];
  for (const { map, values, count } of FOLD_MAP_LIST) {
    const index = md_unicode_bsearch__(cp, map);
    if (index < 0) continue;
    const result = values.slice(index * count, (index + 1) * count);
    if (map[index] !== cp) {
      const start = (map[index] as number) & 0xffffff;
      result[0] =
        start + 1 === result[0]
          ? cp + ((cp & 1) === ((map[index] as number) & 1) ? 1 : 0)
          : (result[0] as number) + cp - start;
    }
    return result;
  }
  return [cp];
}
/** Source permissive UTF-8 decoder does not reject overlong, surrogate or oversized scalars. @param bytes - Input bytes. @param off - First byte. @param end - End offset. @returns Code point and byte width. */
export function md_decode_unicode(
  bytes: Uint8Array,
  off: number,
  end = bytes.length,
): readonly [number, number] {
  const first = bytes[off] as number;
  const count =
    (first & 0xe0) === 0xc0 ? 2 : (first & 0xf0) === 0xe0 ? 3 : (first & 0xf8) === 0xf0 ? 4 : 1;
  if (count > 1 && off + count <= end) {
    let cp = first & (count === 2 ? 0x1f : count === 3 ? 0xf : 7);
    let index = 1;
    for (; index < count; index++) {
      const next = bytes[off + index] as number;
      if ((next & 0xc0) !== 0x80) break;
      cp = (cp << 6) | (next & 0x3f);
    }
    if (index === count) return [cp, count];
  }
  return [first < 128 ? first : (first - 256) >>> 0, 1];
}
/** Source reverse decoder searches at most four bytes. @param bytes - Input bytes. @param off - Exclusive end. @returns Previous scalar or source unsigned signed-byte fallback. */
export function md_decode_utf8_before__(bytes: Uint8Array, off: number): number {
  const last = bytes[off - 1] as number;
  if (last > 127)
    for (let width = 2; width <= 4; width++) {
      if (off < width) continue;
      const lead = bytes[off - width] as number;
      if (
        (lead & (width === 2 ? 0xe0 : width === 3 ? 0xf0 : 0xf8)) !==
        (width === 2 ? 0xc0 : width === 3 ? 0xe0 : 0xf0)
      )
        continue;
      const [cp, decoded] = md_decode_unicode(bytes, off - width, off);
      if (decoded === width) return cp;
    }
  return last < 128 ? last : (last - 256) >>> 0;
}
/** Skips Unicode spaces and source CR/LF bytes. @param bytes - Label bytes. @param off - Start offset. @param end - Exclusive end. @returns First nonspace offset. */
export function md_skip_unicode_whitespace(
  bytes: Uint8Array,
  off: number,
  end = bytes.length,
): number {
  while (off < end) {
    const [cp, size] = md_decode_unicode(bytes, off, end);
    if (!md_is_unicode_whitespace__(cp) && bytes[off] !== 10 && bytes[off] !== 13) break;
    off += size;
  }
  return off;
}
