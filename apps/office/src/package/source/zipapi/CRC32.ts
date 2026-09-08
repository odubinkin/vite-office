/**
 * @fileoverview Reimplements the ZIP CRC-32 accumulator from pinned LibreOffice `package/source/zipapi/CRC32.cxx`.
 */

/** ZIP polynomial used by LibreOffice's package CRC accumulator. */
const CRC32_POLYNOMIAL = 0xedb88320;

/** Incrementally computes the ISO 3309 CRC-32 stored in ZIP records. */
export class CRC32 {
  private value = 0xffffffff;

  /** Restores the initial accumulator state. @returns Nothing. */
  public reset(): void {
    this.value = 0xffffffff;
  }

  /** Returns the finalized unsigned CRC value. @returns Unsigned 32-bit CRC. */
  public getValue(): number {
    return (this.value ^ 0xffffffff) >>> 0;
  }

  /** Adds an exact byte segment to the checksum. @param bytes - Source bytes. @param length - Optional prefix length. @returns Nothing. */
  public updateSegment(bytes: Uint8Array, length = bytes.length): void {
    if (!Number.isInteger(length) || length < 0 || length > bytes.length)
      throw new Error("CRC32 segment length is invalid.");
    for (let index = 0; index < length; index += 1) {
      this.value ^= bytes[index] as number;
      for (let bit = 0; bit < 8; bit += 1)
        this.value = (this.value >>> 1) ^ (this.value & 1 ? CRC32_POLYNOMIAL : 0);
    }
  }

  /** Computes one complete byte sequence. @param bytes - Source bytes. @returns Unsigned 32-bit CRC. */
  public static compute(bytes: Uint8Array): number {
    const crc = new CRC32();
    crc.updateSegment(bytes);
    return crc.getValue();
  }
}
