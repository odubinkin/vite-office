/** @fileoverview Actual OS/2 capability projection using PhysicalFontFace.cxx offsets and defined SvStream ReadUInt32 failure semantics. */
import type { FontCapabilities } from "../../inc/fontcapabilities";

/** Reads source capability words, including reuse of the last successful value after a short read. If the first word is unavailable the native source uses an uninitialized value; the browser reports unknown instead of inventing bits. @param table - Actual OS/2 bytes. @returns Defined source capability data or undefined at the uninitialized-input boundary. */
export function readOs2FontCapabilities(table: Uint8Array): FontCapabilities | undefined {
  if (table.length < 46) return undefined;
  const data = new DataView(table.buffer, table.byteOffset, table.byteLength);
  let value = data.getUint32(42),
    good = true;
  /** Preserves the previous output on failure, exactly as SvStream::ReadNumber. @param offset - Source byte offset. @returns Last successfully read unsigned word. */
  function read(offset: number): number {
    if (offset + 4 <= table.length) value = data.getUint32(offset);
    else good = false;
    return value;
  }
  /** Appends original low-to-high bitset indices. @param set - Output bitset. @param offset - Bit offset. @param word - Actual source word. @returns Nothing. */
  function append(set: Set<number>, offset: number, word: number): void {
    for (let i = 0; i < 32; ++i) if (((word >>> i) & 1) !== 0) set.add(offset + i);
  }
  const unicode = new Set<number>();
  for (let i = 0; i < 4; ++i) append(unicode, i * 32, read(42 + i * 4));
  if (!good) return { oUnicodeRange: unicode };
  const codePages = new Set<number>();
  append(codePages, 0, read(78));
  append(codePages, 32, read(82));
  return { oUnicodeRange: unicode, oCodePageRange: codePages };
}
