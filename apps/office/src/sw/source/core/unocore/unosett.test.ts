/** @fileoverview Verifies native signed integer numbering-property conversion at the UNO/Writer boundary. */
import { expect, it } from "vitest";
import { numberingLabelAlignmentToTwips, numberingLabelAlignmentToMM100 } from "./unosett";

it("uses native integer ratios in both directions and retains only present properties", /** Asserts source-derived manual MM100/Twip values and missing property ownership. @returns Nothing. */ () => {
  expect(numberingLabelAlignmentToTwips({})).toEqual({});
  expect(numberingLabelAlignmentToMM100({ labelFollowedBy: "space" })).toEqual({
    labelFollowedBy: "space",
  });
  for (const [mm100, twips, exported] of [
    [0, 0, 0],
    [1, 1, 2],
    [-1, -1, -2],
    [2, 1, 2],
    [-2, -1, -2],
    [127, 72, 127],
    [250, 142, 250],
    [1008, 571, 1007],
    [32767, 18577, 32768],
    [-32768, -18577, -32768],
  ] as const) {
    const result = numberingLabelAlignmentToTwips({
      firstLineIndent: mm100,
      indentAt: mm100,
      labelFollowedBy: "listtab",
      listTabPosition: mm100,
    });
    expect(result).toEqual({
      firstLineIndent: twips,
      indentAt: twips,
      labelFollowedBy: "listtab",
      listTabPosition: twips,
    });
    expect(numberingLabelAlignmentToMM100(result)).toEqual({
      firstLineIndent: exported,
      indentAt: exported,
      labelFollowedBy: "listtab",
      listTabPosition: exported,
    });
  }
});
