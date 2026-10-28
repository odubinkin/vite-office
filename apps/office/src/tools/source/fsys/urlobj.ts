/** @fileoverview Ports the consumed INetURLObject::decode ToIUri and Unambiguous UTF8 branches and getUTF32 escaped-scalar algorithm; general URL parsing and other nonconsumed decode modes remain outside this module's implemented slice. */

/** Ports original escaped UTF8 consumption, preserving escaped ASCII and invalid octets. @param target - URI reference. @returns Internationalized URI reference. */
export function decodeToIUri(target: string): string {
  return decodeEscapedUtf8(target, false);
}
/** Consumed original decode Unambiguous/UTF8 mode, with exact PART_UNAMBIGUOUS ASCII admission. @param target - Escaped source. @returns Native decoded text. */
export function decodeUnambiguous(target: string): string {
  return decodeEscapedUtf8(target, true);
}
/** Native PART_UNAMBIGUOUS bit projection from aMustEncodeMap; punctuation values are intentionally not browser URI categories. */
const unambiguousAscii = new Set([
  32, 33, 34, 36, 39, 40, 41, 42, 45, 46, 60, 62, 64, 92, 94, 95, 96, 123, 124, 125, 126,
]);
/** Shared original getUTF32 escaped-UTF8 path and decode-mode ASCII decision. @param target - Original source. @param unambiguous - Native Unambiguous instead of ToIUri. @returns Decoded text. */
function decodeEscapedUtf8(target: string, unambiguous: boolean): string {
  let output = "",
    index = 0;
  while (index < target.length) {
    const escaped = target.slice(index, index + 3);
    if (!/^%[0-9a-f]{2}$/i.test(escaped)) {
      output += target[index];
      ++index;
      continue;
    }
    const first = Number.parseInt(escaped.slice(1), 16);
    index += 3;
    if (
      unambiguous &&
      first < 128 &&
      (unambiguousAscii.has(first) ||
        (first >= 48 && first <= 57) ||
        (first >= 65 && first <= 90) ||
        (first >= 97 && first <= 122))
    ) {
      output += String.fromCharCode(first);
      continue;
    }
    if (first >= 0xc0 && first <= 0xf4) {
      let encoded: number, shift: number, minimum: number;
      if (first <= 0xdf) {
        encoded = (first & 0x1f) << 6;
        shift = 0;
        minimum = 0x80;
      } else if (first <= 0xef) {
        encoded = (first & 0x0f) << 12;
        shift = 6;
        minimum = 0x800;
      } else {
        encoded = (first & 7) << 18;
        shift = 12;
        minimum = 0x10000;
      }
      let next = index,
        valid = true;
      for (;;) {
        const continuation = target.slice(next, next + 3);
        if (!/^%[89ab][0-9a-f]$/i.test(continuation)) {
          valid = false;
          break;
        }
        encoded |= (Number.parseInt(continuation.slice(1), 16) & 0x3f) << shift;
        next += 3;
        if (shift === 0) break;
        shift -= 6;
      }
      if (
        valid &&
        encoded >= minimum &&
        encoded <= 0x10ffff &&
        (encoded < 0xd800 || encoded > 0xdfff)
      ) {
        index = next;
        output += String.fromCodePoint(encoded);
        continue;
      }
    }
    output += "%" + first.toString(16).toUpperCase().padStart(2, "0");
  }
  return output;
}
