/** @fileoverview HarfBuzz default hb_face_t::load_num_glyphs using both sanitized maxp and actual loca length. */
import { readHeadIndexToLocFormat } from "./hb-ot-head-table";
import { readMaxpGlyphCount } from "./hb-ot-maxp-table";

/** Reads source glyph population, including the default beyond-64K loca path. @param maxp - Actual maxp table. @param head - Actual head table. @param loca - Actual loca bytes, whose native sanitizer accepts any length. @returns Original maximum glyph population. */
export function readFaceGlyphCount(
  maxp: Uint8Array | undefined,
  head: Uint8Array | undefined,
  loca: Uint8Array | undefined,
): number {
  const format = readHeadIndexToLocFormat(head);
  const fromLoca =
    format <= 1 ? Math.max(1, Math.floor((loca?.length ?? 0) / (format === 0 ? 2 : 4))) - 1 : 0;
  return Math.max(fromLoca, readMaxpGlyphCount(maxp));
}
