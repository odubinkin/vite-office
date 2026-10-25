/** @fileoverview HarfBuzz 14.2.1 cmap selection, sanitized byte bounds and collect_unicodes; native JavaScript owns storage and lifetime. */

/** Source encoding search order, including the final any-Mac wildcard. */
const encodings = [
  [3, 0],
  [3, 10],
  [0, 6],
  [0, 4],
  [3, 1],
  [0, 3],
  [0, 2],
  [0, 1],
  [0, 0],
  [1, 0],
  [1, 0xffff],
] as const;

/** Checks the consumed subtable's source sanitizer bounds. Nested format14 offsets can be neutered independently and never contribute ordinary unicodes. @param view - Subtable through the end of cmap. @returns Whether the subtable survives sanitization. */
function sanitize(view: DataView): boolean {
  if (view.byteLength < 2) return false;
  switch (view.getUint16(0)) {
    case 0:
      return view.byteLength >= 262;
    case 4:
      return view.byteLength >= 14 && view.byteLength >= 16 + 4 * view.getUint16(6);
    case 6:
      return view.byteLength >= 10 && view.byteLength >= 10 + 2 * view.getUint16(8);
    case 10:
      return view.byteLength >= 20 && view.byteLength >= 20 + 2 * view.getUint32(16);
    case 12:
    case 13:
      return view.byteLength >= 16 && view.getUint32(12) <= (view.byteLength - 16) / 12;
    case 14:
      return view.byteLength >= 10 && view.getUint32(6) <= (view.byteLength - 10) / 11;
    default:
      return true;
  }
}

/** Finds the source's first preferred non-null sanitized subtable with its original binary search, without sorting or trying duplicate records. @param table - Actual cmap bytes. @returns Selected subtable through the end of cmap, or undefined. */
export function findBestCmapSubtableDetails(
  table: Uint8Array,
): Readonly<{ subtable: DataView; symbol: boolean }> | undefined {
  if (table.length < 4) return undefined;
  const data = new DataView(table.buffer, table.byteOffset, table.byteLength);
  const count = data.getUint16(2);
  if (data.getUint16(0) !== 0 || count > (table.length - 4) / 8) return undefined;
  for (const [platform, encoding] of encodings) {
    let min = 0,
      max = count - 1;
    while (min <= max) {
      const mid = Math.floor((min + max) / 2),
        record = 4 + 8 * mid;
      const comparison =
        platform - data.getUint16(record) ||
        (encoding === 0xffff ? 0 : encoding - data.getUint16(record + 2));
      if (comparison < 0) max = mid - 1;
      else if (comparison > 0) min = mid + 1;
      else {
        const offset = data.getUint32(record + 4);
        if (offset !== 0 && offset <= table.length) {
          const view = new DataView(table.buffer, table.byteOffset + offset, table.length - offset);
          if (sanitize(view)) return { subtable: view, symbol: platform === 3 && encoding === 0 };
        }
        break;
      }
    }
  }
  return undefined;
}

/** Retains the consumed data-only projection of the source selection. @param table - Actual cmap bytes. @returns Selected subtable or undefined. */
export function findBestCmapSubtable(table: Uint8Array): DataView | undefined {
  return findBestCmapSubtableDetails(table)?.subtable;
}

/** Adds one inclusive source range using JS storage. @param out - Collected unicodes. @param start - Inclusive start. @param end - Inclusive end. @returns Nothing. */
function addRange(out: Set<number>, start: number, end: number): void {
  for (let code = start; code <= end; ++code) out.add(code);
}

/** Preserves ordered segment addition/deletion, sentinel handling and the source's raw-glyph check for nonzero range offsets. @param data - Sanitized format4 and remaining cmap bytes. @param out - Collected unicodes. @returns Nothing. */
function collectFormat4(data: DataView, out: Set<number>): void {
  const segments = Math.floor(data.getUint16(6) / 2);
  const starts = 16 + 2 * segments,
    deltas = starts + 2 * segments,
    offsets = deltas + 2 * segments,
    glyphs = offsets + 2 * segments;
  const glyphCount = Math.floor((data.byteLength - glyphs) / 2);
  let count = segments;
  if (count && data.getUint16(starts + 2 * (count - 1)) === 0xffff) --count;
  for (let i = 0; i < count; ++i) {
    const start = data.getUint16(starts + 2 * i),
      end = data.getUint16(14 + 2 * i),
      offset = data.getUint16(offsets + 2 * i);
    addRange(out, start, end);
    for (let code = start; code <= end; ++code) {
      if (offset === 0) {
        if (((code + data.getUint16(deltas + 2 * i)) & 0xffff) === 0) out.delete(code);
      } else {
        const index = (Math.floor(offset / 2) + code - start + i - segments) >>> 0;
        if (index >= glyphCount) {
          for (let rest = code; rest <= end; ++rest) out.delete(rest);
          break;
        }
        if (data.getUint16(glyphs + 2 * index) === 0) out.delete(code);
      }
    }
  }
}

/** Collects ordinary unicodes exactly from the selected source cmap; no symbol/Mac remapping or shaping is performed here. @param table - Actual cmap bytes. @param numGlyphs - Actual hb_face glyph population. @returns Collected unicode set, empty for missing/invalid/unsupported subtables. */
export function collectCmapUnicodes(table: Uint8Array, numGlyphs: number): Set<number> {
  numGlyphs >>>= 0;
  const out = new Set<number>(),
    data = findBestCmapSubtable(table);
  if (data === undefined) return out;
  const format = data.getUint16(0);
  if (format === 0) {
    for (let code = 0; code < 256; ++code) if (data.getUint8(6 + code)) out.add(code);
  } else if (format === 4) collectFormat4(data, out);
  else if (format === 6 || format === 10) {
    const wide = format === 10,
      start = wide ? data.getUint32(12) : data.getUint16(6),
      count = wide ? data.getUint32(16) : data.getUint16(8),
      base = wide ? 20 : 10;
    for (let i = 0; i < count; ++i) {
      const code = (start + i) >>> 0;
      if (data.getUint16(base + 2 * i) && code !== 0xffffffff) out.add(code);
    }
  } else if (format === 12 || format === 13) {
    for (let i = 0; i < data.getUint32(12); ++i) {
      const base = 16 + 12 * i;
      let start = data.getUint32(base),
        end = Math.min(data.getUint32(base + 4), 0x10ffff),
        gid = data.getUint32(base + 8);
      if (gid === 0) {
        if (format === 13 || (gid + end - start) >>> 0 === 0) continue;
        start = (start + 1) >>> 0;
        ++gid;
      }
      if (gid >= numGlyphs) continue;
      if ((gid + end - start) >>> 0 >= numGlyphs) end = (start + numGlyphs - gid) >>> 0;
      addRange(out, start, Math.min(end, 0x10ffff));
    }
  }
  return out;
}
