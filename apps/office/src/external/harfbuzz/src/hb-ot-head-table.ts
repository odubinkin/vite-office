/** @fileoverview HarfBuzz head sanitizer and consumed indexToLocFormat, including the Null table value. */

/** Reads the source offset encoding after validating head. @param table - Actual head bytes. @returns Encoding or Null head's zero. */
export function readHeadIndexToLocFormat(table: Uint8Array | undefined): number {
  if (table === undefined || table.length < 54) return 0;
  const data = new DataView(table.buffer, table.byteOffset, table.byteLength);
  if (data.getUint16(0) !== 1 || data.getUint32(12) !== 0x5f0f3cf5) return 0;
  return data.getUint16(50);
}
