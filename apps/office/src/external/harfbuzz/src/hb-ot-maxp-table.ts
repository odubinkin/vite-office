/** @fileoverview HarfBuzz maxp sanitizer and glyph-count projection; invalid or missing tables expose the Null table population. */

/** Reads the native maxp glyph population after its version-dependent bounds check. @param table - Actual maxp bytes, if present. @returns Glyph population, zero for a rejected table. */
export function readMaxpGlyphCount(table: Uint8Array | undefined): number {
  if (table === undefined || table.length < 6) return 0;
  const data = new DataView(table.buffer, table.byteOffset, table.byteLength);
  const major = data.getUint16(0),
    minor = data.getUint16(2);
  if (major === 1 ? table.length < 32 : major !== 0 || minor !== 0x5000) return 0;
  return data.getUint16(4);
}
