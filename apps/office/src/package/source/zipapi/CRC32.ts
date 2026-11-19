/** @fileoverview Original CRC32.cxx stream/Sequence/pointer owner over actual shared rtl_crc32. */
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import type { ByteElements } from "../../../sal/inc/rtl/byteseq.h";
import { n_ConstBufferSize } from "../../inc/PackageConstants";
import { rtl_crc32 } from "../../../sal/rtl/crc";
/** Actual original CRC state; returned getValue is signed32. */
export class CRC32 {
  private nCRC = 0;
  /** Original reset. @returns Nothing. */
  reset(): void {
    this.nCRC = 0;
  }
  /** Original sal_Int32 return narrowing. @returns Signed CRC bits. */
  getValue(): number {
    return this.nCRC | 0;
  }
  /** Original pointer and Sequence overloads. @param bytes - Actual storage. @param length - Signed count, converted by rtl_crc32 unsigned parameter. @returns Nothing. */
  updateSegment(bytes: Sequence<number> | ByteElements, length: number): void {
    this.nCRC = rtl_crc32(
      this.nCRC,
      bytes instanceof Sequence ? (bytes.getConstArray() as ByteElements) : bytes,
      length,
    );
  }
  /** Original full Sequence update. @param bytes - Actual bytes. @returns Nothing. */
  update(bytes: Sequence<number>): void {
    this.nCRC = rtl_crc32(this.nCRC, bytes.getConstArray() as ByteElements, bytes.getLength());
  }
  /** Original do/while32KiB reads, including final zero-length update. Does not close the stream. @param input - Actual source. @returns Signed64 total. */
  updateStream(input: Reference<XInputStream>): bigint {
    let count: number,
      total = 0n;
    const buffer = new (Sequence.specialize<number>("sal_Int8", 1))(n_ConstBufferSize);
    try {
      do {
        count = input.operatorStar().readBytes(buffer, n_ConstBufferSize);
        this.updateSegment(buffer, count);
        total = BigInt.asIntN(64, total + BigInt(count));
      } while (count === n_ConstBufferSize);
      return total;
    } finally {
      buffer.dispose();
    }
  }
}
