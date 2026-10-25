/** @fileoverview Browser byte-container boundary for actual SFNT/TTC table data; native HarfBuzz cmap and face selection remain separate owners. */

/** Reads one unambiguous table from a supported SFNT face, using absolute collection offsets and the actual source view bounds. Unsupported/malformed containers stay unknown. @param bytes - Actual acquired file bytes. @param tag - Four-byte table identity. @param faceIndex - Explicit collection face, zero for a standalone font. @returns Actual table view or undefined. */
export function readSfntFontTable(
  bytes: Uint8Array,
  tag: string,
  faceIndex = 0,
): Uint8Array | undefined {
  if (bytes.length < 12 || tag.length !== 4 || !Number.isSafeInteger(faceIndex) || faceIndex < 0)
    return undefined;
  const data = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const signature = data.getUint32(0);
  let base = 0;
  if (signature === 0x74746366) {
    const version = data.getUint32(4),
      count = data.getUint32(8);
    if (
      (version !== 0x10000 && version !== 0x20000) ||
      faceIndex >= count ||
      count > (bytes.length - 12) / 4
    )
      return undefined;
    base = data.getUint32(12 + faceIndex * 4);
    if (base > bytes.length - 12) return undefined;
  } else if (faceIndex !== 0) return undefined;
  const type = data.getUint32(base);
  if (type !== 0x10000 && type !== 0x4f54544f && type !== 0x74727565) return undefined;
  const count = data.getUint16(base + 4);
  if (count > (bytes.length - base - 12) / 16) return undefined;
  let found: Uint8Array | undefined;
  for (let i = 0; i < count; ++i) {
    const entry = base + 12 + i * 16;
    const name = String.fromCharCode(
      data.getUint8(entry),
      data.getUint8(entry + 1),
      data.getUint8(entry + 2),
      data.getUint8(entry + 3),
    );
    if (name !== tag) continue;
    if (found !== undefined) return undefined;
    const offset = data.getUint32(entry + 8),
      length = data.getUint32(entry + 12);
    if (offset > bytes.length || length > bytes.length - offset) return undefined;
    found = bytes.subarray(offset, offset + length);
  }
  return found;
}
