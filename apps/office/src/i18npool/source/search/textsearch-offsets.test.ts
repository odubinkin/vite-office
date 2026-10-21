/** @fileoverview Initialized native SearchResult group-remapping witnesses. Regex result values are constructed at the original kernel boundary; no regex backend or fake search service is supplied. */
import { expect, it } from "vitest";
import { replaceTransliterationOffsets } from "./textsearch";
import { searchResult, offsets } from "../../../test/search-result-values";
import { OUString } from "../../../sal/inc/rtl/ustring";
/** Exact native UTF16 source with a case expansion and supplementary code point. @returns Source owner. */
function source(): OUString {
  const units = new Uint16Array([0xdf, 65, 0xd83d, 0xde00, 66]);
  return new OUString(units, units.length);
}
it.each([true, false])(
  "preserves all group owners, unmatched groups and original code-point endpoints forward=%s",
  /** Explicit source-coordinate expectations cover expansions, supplementary units and empty groups at both boundaries. @param forward - Native direction. @returns Nothing. */ (
    forward,
  ) => {
    const low = [0, 3, -1, 6, 0, 2, 8],
      high = [2, 4, -1, 6, 0, 3, 8],
      result = searchResult(7, forward ? low : high, forward ? high : low),
      starts = result.startOffset,
      ends = result.endOffset,
      mappedLow = [0, 2, -1, 5, 0, 1, 5],
      mappedHigh = [1, 4, -1, 5, 0, 2, 5];
    try {
      replaceTransliterationOffsets(source(), [0, 0, 1, 2, 3, 4], result, forward);
      expect(result.subRegExpressions).toBe(7);
      expect(result.startOffset).toBe(starts);
      expect(result.endOffset).toBe(ends);
      expect(offsets(starts)).toEqual(forward ? mappedLow : mappedHigh);
      expect(offsets(ends)).toEqual(forward ? mappedHigh : mappedLow);
    } finally {
      result.dispose();
    }
  },
);
it("uses actual sequence length rather than the result count and leaves empty offset maps untouched", /** Native remapping loops over the start-offset sequence even for inconsistent scalar count metadata. @returns Nothing. */ () => {
  const result = searchResult(0, [2], [3]);
  try {
    replaceTransliterationOffsets(source(), [], result, true);
    expect(offsets(result.startOffset)).toEqual([2]);
    expect(offsets(result.endOffset)).toEqual([3]);
    replaceTransliterationOffsets(source(), [0, 0, 1, 2, 3, 4], result, true);
    expect(offsets(result.startOffset)).toEqual([1]);
    expect(offsets(result.endOffset)).toEqual([2]);
    expect(result.subRegExpressions).toBe(0);
  } finally {
    result.dispose();
  }
});
