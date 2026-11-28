/** @fileoverview Calc output fitting decisions measured through the output device boundary. */
import { expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScAddress } from "../../../inc/address";
import { ScLineBreakCell, ScShrinkToFitCell } from "../../../inc/attrib";
import { readOdsDocument, writeOdsDocument } from "../../filter/xml/xmlwrap";
import { getCellTextLayout, getCellTextRepeatCount, getCellTextShrinkScale } from "./output2";

it("repeats only whole text runs and retains one copy for clipped or empty text", /** Exercises native integer output widths. @returns Nothing. */ () => {
  expect(getCellTextRepeatCount(100, 26)).toBe(3);
  expect(getCellTextRepeatCount(100, 100)).toBe(1);
  expect(getCellTextRepeatCount(100, 101)).toBe(1);
  expect(getCellTextRepeatCount(100, 0)).toBe(1);
});

it("remeasures integer shrink percentages and stops after seven retries", /** Preserves the native retry contract if output hinting still clips. @returns Nothing. */ () => {
  const percentages: number[] = [];
  const result = getCellTextShrinkScale(
    80,
    100,
    /** Emulates a device that cannot render the requested size. @param ratio - Native scale percent. @returns Device extent. */
    (ratio) => {
      percentages.push(ratio);
      return 81;
    },
  );
  expect(percentages).toEqual([80, 72, 64, 57, 51, 45, 40, 36]);
  expect(result).toEqual({ percent: 36, fits: false });
  expect(
    getCellTextShrinkScale(
      80,
      100,
      /** Measures the eightieth percent with device rounding. @param ratio - Native percent. @returns Rounded extent. */
      (ratio) => ratio + 2,
    ),
  ).toEqual({ percent: 72, fits: true });
});

it("preserves the pinned wrap and shrink cell matrix through native ODS", /** Replays the source XML test's ordered flags with supported ODS property mappings. @returns Completion. */ async () => {
  const original = new ScDocument();
  const cases = [
    [false, false],
    [true, false],
    [false, true],
    [true, true],
  ] as const;
  try {
    for (const [row, [wrap, shrink]] of cases.entries()) {
      original.ApplyAttr(1, row, 0, new ScLineBreakCell(wrap));
      original.ApplyAttr(1, row, 0, new ScShrinkToFitCell(shrink));
    }
    const doc = await readOdsDocument(await writeOdsDocument(original));
    try {
      for (const [row, [wrap, shrink]] of cases.entries()) {
        const pos = new ScAddress(1, row, 0);
        const pattern = doc.GetPattern(pos);
        expect(pattern).toBeDefined();
        if (!pattern) continue;
        expect(getCellTextLayout(doc, pos, pattern)).toMatchObject({
          lineBreak: wrap,
          shrink: shrink && !wrap,
        });
      }
    } finally {
      doc.DisposeAttributes();
    }
  } finally {
    original.DisposeAttributes();
  }
});
