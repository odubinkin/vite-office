/** @fileoverview Native interval invariants, canonical ownership and dense differential checks over a real Calc document. */
import { expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScPatternAttr, CellAttributeHolder } from "../../../inc/patattr";
import { ScAttrArray } from "./attarray";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
/** Creates a real native delta and canonical holder. @param doc - Document. @param height - Twips. @returns Holder. */
function pattern(doc: ScDocument, height: number): CellAttributeHolder {
  const value = new ScPatternAttr(doc.getCellAttributeHelper());
  value.ItemSetPut(new SvxFontHeightItem(height, 100, 101));
  return new CellAttributeHolder(value, true);
}
/** Reads actual represented height. @param value - Actual pattern. @returns Twips. */
function height(value: ScPatternAttr | null): number | undefined {
  return value === null ? undefined : (value.GetItem(101) as SvxFontHeightItem).GetHeight();
}
it("keeps native empty/default/invalid lookup and canonical holder lifetime", /** Uses real owner defaults and source single-run search behavior. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    a = new ScAttrArray(0, 0, doc),
    start: [number] = [-1],
    end: [number] = [-1],
    none = new CellAttributeHolder();
  expect(a.GetPattern(-1)).toBeNull();
  expect(a.GetPatternRange(start, end, -1)).toBeNull();
  expect(height(a.GetPattern(0))).toBe(200);
  expect(height(a.GetPatternRange(start, end, 2))).toBe(200);
  expect([start[0], end[0]]).toEqual([0, doc.MaxRow()]);
  a.Reset(none);
  a.SetPatternArea(0, 1, none);
  const h = pattern(doc, 400);
  a.SetPatternArea(-1, 1, h);
  a.SetPatternArea(0, doc.MaxRow() + 1, h);
  expect(height(a.GetPattern(0))).toBe(200);
  a.SetPatternArea(0, doc.MaxRow(), h);
  expect(height(a.GetPattern(doc.MaxRow()))).toBe(400);
  // Literal Search single-entry fast path has no row check after initialization.
  expect(height(a.GetPattern(doc.MaxRow() + 1))).toBe(400);
  expect(height(a.GetPatternRange(start, end, -1))).toBe(400);
  a.SetPatternArea(2, 4, pattern(doc, 600));
  expect(a.GetPattern(doc.MaxRow() + 1)).toBeNull();
  expect(a.GetPatternRange(start, end, doc.MaxRow() + 1)).toBeNull();
  const copy = new ScAttrArray(2, 0, doc, a),
    defaults = new ScAttrArray(-1, 0, doc, a);
  expect(height(copy.GetPattern(3))).toBe(600);
  expect(height(defaults.GetPattern(3))).toBe(200);
  a.Dispose();
  expect(height(copy.GetPattern(3))).toBe(600);
  copy.Dispose();
  defaults.Dispose();
  h.Dispose();
  none.Dispose();
  a.Dispose();
});
it("matches dense values and maximal runs across deterministic split,shrink,replace,merge and reset operations", /** Differential model contains only expected scalar test values, never production document state. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    a = new ScAttrArray(0, 0, doc),
    holders = [pattern(doc, 200), pattern(doc, 400), pattern(doc, 600)],
    expected = Array<number>(72).fill(200);
  let tail = 200,
    seed = 197;
  for (let i = 0; i < 900; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const start = seed % 64;
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const end = start + (seed % (65 - start)),
      which = seed % 3;
    const whole = i % 113 === 0;
    a.SetPatternArea(
      whole ? 0 : start,
      whole ? doc.MaxRow() : end,
      holders[which] as CellAttributeHolder,
    );
    if (whole) {
      expected.fill([200, 400, 600][which] as number);
      tail = expected[0] as number;
    } else expected.fill([200, 400, 600][which] as number, start, end + 1);
    for (let row = 0; row < expected.length; row++) {
      const first: [number] = [0],
        last: [number] = [0];
      expect(height(a.GetPatternRange(first, last, row))).toBe(expected[row]);
      let low = row,
        high = row;
      while (low > 0 && expected[low - 1] === expected[row]) low--;
      while (high + 1 < expected.length && expected[high + 1] === expected[row]) high++;
      expect(first[0]).toBe(low);
      expect(last[0]).toBe(high === expected.length - 1 ? doc.MaxRow() : high);
    }
    expect(height(a.GetPattern(doc.MaxRow()))).toBe(tail);
  }
  a.Dispose();
  for (const h of holders) h.Dispose();
});
