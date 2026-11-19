/** @fileoverview Original rtl_crc32 from sal/rtl/crc.cxx: preserve initial seed, null-pointer guard and delegation to the shared zlib CRC implementation. Actual Sequence address cells are compiler byte-pointer storage. */
import { crc32 } from "../../external/zlib/crc32";
import type { ByteElements } from "../inc/rtl/byteseq.h";
/** Original unsigned32 seed/count/result and null no-op. Invalid native pointer/range domains remain unqualified. @param seed - Running finalized CRC. @param data - Actual byte pointer or null. @param length - Unsigned32 byte extent. @returns CRC. */
export function rtl_crc32(seed: number, data: ByteElements | null, length: number): number {
  seed >>>= 0;
  length >>>= 0;
  if (data) {
    let bytes: Uint8Array;
    if (ArrayBuffer.isView(data)) bytes = new Uint8Array(data.buffer, data.byteOffset, length);
    else {
      bytes = new Uint8Array(length);
      for (let i = 0; i < length; ++i)
        bytes[i] = ((data as Pick<ReadonlyMap<number, unknown>, "get">).get(i) as [number])[0];
    }
    seed = crc32(seed, bytes);
  }
  return seed;
}
