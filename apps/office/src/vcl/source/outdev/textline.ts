/** @fileoverview Consumed ImplDrawStrikeoutChar repetition arithmetic from textline.cxx; browser paint owns actual glyph layout. */
/** Preserves native repeated-glyph length arithmetic and2048 cap. @param width - Device fragment width. @param testWidth - Width of four original slash/X glyphs. @returns Character count. */
export function getStrikeoutCharacterCount(width: number, testWidth: number): number {
  if (!width) return 0;
  const atom = Math.trunc(testWidth / 4);
  if (atom <= 0) return 0;
  return Math.min(2048, Math.max(0, Math.trunc((width + atom - 1) / atom)));
}
