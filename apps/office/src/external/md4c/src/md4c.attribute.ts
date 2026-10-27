/** @fileoverview md4c.c entity recognition and native UTF-8 attribute substring construction. See ../LICENSE. */
import { MD_TEXTTYPE as T, type MD_ATTRIBUTE } from "./md4c.h";
/** Recognizes native entity syntax, including unknown named entities. @param text - UTF-8 bytes. @param beg - Ampersand position. @param end - Exclusive end. @returns Entity end or -1. */
export function md_is_entity_str(text: Uint8Array, beg: number, end = text.length): number {
  let off = beg + 1;
  const numeric = text[off] === 35;
  const hex = numeric && (text[off + 1] === 120 || text[off + 1] === 88);
  off += numeric ? (hex ? 2 : 1) : 0;
  const start = off;
  while (off < end) {
    const c = text[off] as number;
    const digit = c >= 48 && c <= 57,
      alpha = (c >= 65 && c <= 90) || (c >= 97 && c <= 122);
    if (
      numeric
        ? !(digit || (hex && ((c >= 65 && c <= 70) || (c >= 97 && c <= 102))))
        : !(off === start ? alpha : digit || alpha)
    )
      break;
    off++;
    if (off - start > (numeric ? 8 : 48)) break;
  }
  const size = off - start;
  return text[off] === 59 && size >= (numeric ? 1 : 2) && size <= (numeric ? (hex ? 6 : 7) : 48)
    ? off + 1
    : -1;
}
/** Builds source attribute slices; only ASCII punctuation and newlines are unescaped. @param raw - Raw UTF-8 attribute. @param flags - MD_BUILD_ATTR_NO_ESCAPES bit. @returns Source text and typed substring boundaries. */
export function md_build_attribute(raw: Uint8Array, flags = 0): MD_ATTRIBUTE {
  const trivial = !raw.some(
    /** Applies some to byte. @param byte - byte value. @returns Callback result. */ (byte) =>
      byte === 0 || byte === 38 || byte === 92,
  );
  if (trivial)
    return {
      text: raw,
      size: raw.length,
      substr_types: [T.MD_TEXT_NORMAL],
      substr_offsets: [0, raw.length],
    };
  const output: number[] = [],
    types: T[] = [],
    offsets: number[] = [];
  let off = 0;
  while (off < raw.length) {
    const c = raw[off] as number;
    if (c === 0) {
      types.push(T.MD_TEXT_NULLCHAR);
      offsets.push(output.length);
      output.push(0);
      off++;
      continue;
    }
    const ent = c === 38 ? md_is_entity_str(raw, off) : -1;
    if (ent >= 0) {
      types.push(T.MD_TEXT_ENTITY);
      offsets.push(output.length);
      output.push(...raw.subarray(off, ent));
      off = ent;
      continue;
    }
    if (types.at(-1) !== T.MD_TEXT_NORMAL) {
      types.push(T.MD_TEXT_NORMAL);
      offsets.push(output.length);
    }
    const next = raw[off + 1];
    if (
      !(flags & 1) &&
      c === 92 &&
      next !== undefined &&
      ((next >= 33 && next <= 47) ||
        (next >= 58 && next <= 64) ||
        (next >= 91 && next <= 96) ||
        (next >= 123 && next <= 126) ||
        next === 10 ||
        next === 13)
    )
      off++;
    output.push(raw[off++] as number);
  }
  offsets.push(output.length);
  return {
    text: new Uint8Array(output),
    size: output.length,
    substr_types: types,
    substr_offsets: offsets,
  };
}
