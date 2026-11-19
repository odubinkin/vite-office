/** @fileoverview Original script URL lexical responsibilities, independent of the generic SAL percent decoder. */
import { convertToHex } from "../../../o3tl/inc/numeric";
import { isUnicodeScalarValue } from "../../../sal/inc/rtl/character";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import type { OUString, OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { Uri, createUriCharClass } from "../../../sal/inc/rtl/uri";
import { rtl_UriEncodeMechanism } from "../../../sal/inc/rtl/uri.h";
import { RTL_TEXTENCODING_UTF8 } from "../../../sal/inc/rtl/textenc";
/** Original escaped byte parser; failure leaves the in/out index untouched. @param part - Borrowed UTF16 view. @param index - Pointer-reference offset. @returns Octet or -1. */
function parseEscaped(part: Uint16Array, index: [number]): number {
  if (part.length - index[0] < 3 || part[index[0]] !== 37) return -1;
  const n1 = convertToHex(part[index[0] + 1] as number),
    n2 = convertToHex(part[index[0] + 2] as number);
  if (n1 < 0 || n2 < 0) return -1;
  index[0] += 3;
  return (n1 << 4) | n2;
}
/** Original script fragment scanner, retaining malformed cursor position and the five/six-byte rejection branches. @param part - Borrowed view. @param namePart - Original delimiter selection. @param index - In/out pointer offset. @returns Owned decoded prefix. */
export function parsePart(part: Uint16Array, namePart: boolean, index: [number]): OUString {
  const buffer = new OUStringBuffer(64);
  try {
    while (index[0] >>> 0 < part.length) {
      const c = part[index[0]] as number;
      if (namePart ? c === 63 : c === 38 || c === 61) break;
      else if (c === 37) {
        const i: [number] = [index[0]];
        let n = parseEscaped(part, i);
        if (n >= 0 && n <= 0x7f) buffer.insertChar(buffer.getLength(), n);
        else if (n >= 0xc0 && n <= 0xfc) {
          let encoded: number, shift: number, min: number;
          if (n <= 0xdf) {
            encoded = (n & 0x1f) << 6;
            shift = 0;
            min = 0x80;
          } else if (n <= 0xef) {
            encoded = (n & 0x0f) << 12;
            shift = 6;
            min = 0x800;
          } else if (n <= 0xf7) {
            encoded = (n & 7) << 18;
            shift = 12;
            min = 0x10000;
          } else if (n <= 0xfb) {
            encoded = (n & 3) << 24;
            shift = 18;
            min = 0x200000;
          } else {
            encoded = 0;
            shift = 24;
            min = 0x4000000;
          }
          let utf8 = true;
          for (; shift >= 0; shift -= 6) {
            n = parseEscaped(part, i);
            if (n < 0x80 || n > 0xbf) {
              utf8 = false;
              break;
            }
            encoded |= (n & 0x3f) << shift;
          }
          if (!utf8 || !isUnicodeScalarValue(encoded) || encoded < min) break;
          buffer.appendUtf32(encoded);
        } else break;
        index[0] = i[0];
      } else {
        buffer.insertChar(buffer.getLength(), c);
        ++index[0];
      }
    }
    return buffer.makeStringAndClear();
  } finally {
    buffer.dispose();
  }
}
const nameOrParamFragment = createUriCharClass(
  Uint8Array.from(
    "!$'()*+,-.0123456789:;@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]_abcdefghijklmnopqrstuvwxyz~",
    /** Converts a literal character to its code unit without normalization. @param c - Character from the literal. @returns Character code unit. */ (
      c,
    ) => c.charCodeAt(0),
  ),
);
/** Original custom character class and IgnoreEscapes encoder. @param fragment - Borrowed unescaped value. @returns Owned encoded fragment. */
export function encodeNameOrParamFragment(fragment: OUStringConstReference): OUString {
  return Uri.encode(
    fragment,
    nameOrParamFragment,
    rtl_UriEncodeMechanism.rtl_UriEncodeIgnoreEscapes,
    RTL_TEXTENCODING_UTF8,
  );
}
/** Original scheme-specific admission including duplicates and empty parameter values. @param part - Borrowed UTF16 view. @returns Original admission result. */
export function parseSchemeSpecificPart(part: Uint16Array): boolean {
  const i: [number] = [0],
    name = parsePart(part, true, i);
  try {
    if (name.isEmpty() || part[0] === 47) return false;
  } finally {
    name.dispose();
  }
  if (i[0] >>> 0 === part.length) return true;
  for (;;) {
    ++i[0];
    const key = parsePart(part, false, i);
    try {
      if (key.isEmpty() || i[0] >>> 0 === part.length || part[i[0]] !== 61) return false;
    } finally {
      key.dispose();
    }
    ++i[0];
    parsePart(part, false, i).dispose();
    if (i[0] >>> 0 === part.length) return true;
    if (part[i[0]] !== 38) return false;
  }
}
