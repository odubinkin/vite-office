/** @fileoverview CRC32 library ABI adapter reusing the unchanged installed zip.js standalone codec, pinned in third_party/zipjs-codecs. The original RTL seed/result are finalized CRCs; the library field is the inverted running register. No CRC algorithm is reimplemented here. */
import { Crc32 } from "@vite-office/zipjs-codecs";
/** Original zlib crc32 seed/count semantics over actual bytes. @param seed - Finalized unsigned32 seed. @param data - Actual byte span. @returns Finalized unsigned32 CRC. */
export function crc32(seed: number, data: Uint8Array): number {
  const state = new Crc32();
  // Its optional constructor seed uses || and cannot represent a zero inverted register.
  state.crc = ~seed;
  for (let offset = 0; offset < data.length; offset += 65536)
    state.append(data.subarray(offset, offset + 65536));
  return state.get() >>> 0;
}
