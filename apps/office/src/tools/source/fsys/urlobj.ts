/** @fileoverview Ports the consumed INetURLObject::decode ToIUri/UTF8 branch and getUTF32 escaped-scalar algorithm; general URL parsing and other decode modes remain outside this module's implemented slice. */

/** Ports original escaped UTF8 consumption, preserving escaped ASCII and invalid octets. @param target - URI reference. @returns Internationalized URI reference. */
export function decodeToIUri(target: string): string {
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
