/** @fileoverview Verifies native signed integer numbering-property conversion at the UNO/Writer boundary. */
import { expect, it } from "vitest";
import { SwNumRule } from "../doc/number";
import {
  NumberingRulePropertyError,
  SwXNumberingRules,
  numberingPositionToTwips,
  numberingPositionToMM100,
} from "./unosett";

it("uses native integer ratios in both directions and retains only present properties", /** Asserts source-derived manual MM100/Twip values and missing property ownership. @returns Nothing. */ () => {
  expect(numberingPositionToTwips({})).toEqual({});
  expect(numberingPositionToMM100({ labelFollowedBy: "space" })).toEqual({
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
    const result = numberingPositionToTwips({
      absLSpace: mm100,
      firstLineOffset: mm100,
      charTextDistance: mm100,
      positionAndSpaceMode: "label-width-and-position",
      firstLineIndent: mm100,
      indentAt: mm100,
      labelFollowedBy: "listtab",
      listTabPosition: mm100,
    });
    expect(result).toEqual({
      absLSpace: twips,
      firstLineOffset: twips,
      charTextDistance: twips,
      positionAndSpaceMode: "label-width-and-position",
      firstLineIndent: twips,
      indentAt: twips,
      labelFollowedBy: "listtab",
      listTabPosition: twips,
    });
    expect(numberingPositionToMM100(result)).toEqual({
      absLSpace: exported,
      firstLineOffset: exported,
      charTextDistance: exported,
      positionAndSpaceMode: "label-width-and-position",
      firstLineIndent: exported,
      indentAt: exported,
      labelFollowedBy: "listtab",
      listTabPosition: exported,
    });
  }
});

it("validates the native numbering properties before committing one complete level", /** Checks rejection independent of selected mode and retains an already applied level. @returns Nothing. */ () => {
  const rule = new SwNumRule("application");
  const service = new SwXNumberingRules(rule);
  service.replaceByIndex(2, {
    kind: "bullet",
    bulletChar: "●",
    suffix: "",
    charTextDistance: 32767,
    absLSpace: -1,
    firstLineOffset: 1,
    positionAndSpaceMode: "label-width-and-position",
    listTabPosition: 127,
  });
  expect(rule.GetNumFormat(2).GetCharTextDistance()).toBe(18577);
  expect(rule.GetNumFormat(2).GetAbsLSpace()).toBe(-1);
  expect(rule.GetNumFormat(2).GetFirstLineOffset()).toBe(1);
  expect(rule.GetNumFormat(2).GetBulletFont()).toBe("");
  const applied = rule.GetNumFormat(2);
  for (const positionAndSpaceMode of ["label-alignment", "label-width-and-position"] as const)
    for (const invalid of [
      { charTextDistance: -1 },
      { charTextDistance: -32768 },
      { listTabPosition: -1 },
    ]) {
      expect(
        /** Attempts a complete replacement with rejected geometry. @returns Nothing. */ () =>
          service.replaceByIndex(2, {
            kind: "numbered",
            suffix: ".",
            absLSpace: 999,
            firstLineIndent: -10,
            positionAndSpaceMode,
            ...invalid,
          }),
      ).toThrow(NumberingRulePropertyError);
      expect(rule.GetNumFormat(2)).toBe(applied);
    }
  service.replaceByIndex(2, { kind: "numbered", suffix: "." });
  expect(rule.GetNumFormat(2).GetBulletChar()).toBe("●");
  expect(rule.GetNumFormat(2).GetCharTextDistance()).toBe(18577);
});
