/** @fileoverview Native merge flag mutation and refresh on real sparse document attributes. */
import { expect, it } from "vitest";
import type { ScTable } from "../../../inc/table";
import { ScDocument } from "../../../inc/document";
import { ScAddress } from "../../../inc/address";
import { ScPatternAttr } from "../../../inc/patattr";
import { ScMF, ScMergeAttr, ScMergeFlagAttr } from "../../../inc/attrib";
import { ATTR_MERGE_FLAG } from "../../../inc/scitems";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
/** Borrows actual canonical flags. @param doc - Document. @param col - Column. @param row - Row. @returns Actual flags. */
function flags(doc: ScDocument, col: number, row: number): ScMF {
  return (
    (doc.GetPattern(new ScAddress(col, row, 0)) as ScPatternAttr).GetItem(
      ATTR_MERGE_FLAG,
    ) as ScMergeFlagAttr
  ).GetValue();
}
it("adds and removes native flags over split runs without replacing styles or allocating untouched tails", /** Real mutations retain canonical ownership and source booleans. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const table = doc.FetchTable(0) as ScTable;
  const initial = table.GetAllocatedColumnsCount();
  expect(doc.RemoveFlagsTab(0, 0, doc.MaxCol(), doc.MaxRow(), 0, ScMF.All)).toBe(false);
  expect(table.GetAllocatedColumnsCount()).toBe(initial);
  const pattern = new ScPatternAttr(doc.getCellAttributeHelper());
  pattern.ItemSetPut(new SvxFontHeightItem(440, 100, 101));
  doc.ApplyPatternAreaTab(1, 2, 1, 5, 0, pattern);
  expect(doc.ApplyFlagsTab(1, 1, 2, 6, 0, ScMF.Hor | ScMF.Auto)).toBe(true);
  expect(doc.ApplyFlagsTab(1, 1, 2, 6, 0, ScMF.Hor | ScMF.Auto)).toBe(false);
  expect(doc.ApplyFlagsTab(1, 3, 1, 4, 0, ScMF.Ver)).toBe(true);
  expect(flags(doc, 1, 0)).toBe(ScMF.NONE);
  expect(flags(doc, 1, 1)).toBe(ScMF.Hor | ScMF.Auto);
  expect(flags(doc, 1, 3)).toBe(ScMF.Hor | ScMF.Ver | ScMF.Auto);
  expect(flags(doc, 1, 7)).toBe(ScMF.NONE);
  expect(doc.RemoveFlagsTab(1, 2, 1, 5, 0, ScMF.Auto | ScMF.Ver)).toBe(true);
  expect(doc.RemoveFlagsTab(1, 2, 1, 5, 0, ScMF.Auto | ScMF.Ver)).toBe(false);
  expect(flags(doc, 1, 3)).toBe(ScMF.Hor);
  expect(flags(doc, 1, 1)).toBe(ScMF.Hor | ScMF.Auto);
  expect(
    (
      (doc.GetPattern(new ScAddress(1, 3, 0)) as ScPatternAttr).GetItem(101) as SvxFontHeightItem
    ).GetHeight(),
  ).toBe(440);
  expect(doc.ApplyFlagsTab(3, doc.MaxRow(), 3, doc.MaxRow(), 0, ScMF.Ver)).toBe(true);
  expect(doc.RemoveFlagsTab(3, doc.MaxRow(), 3, doc.MaxRow(), 0, ScMF.Ver)).toBe(true);
  expect(doc.ApplyFlagsTab(3, 5, 2, 4, 0, ScMF.Hor)).toBe(false);
  expect(doc.RemoveFlagsTab(3, 5, 2, 4, 0, ScMF.Hor)).toBe(false);
  for (const [col1, row1, col2, row2, tab] of [
    [-1, 0, 0, 0, 0],
    [0, -1, 0, 0, 0],
    [0, 0, doc.MaxCol() + 1, 0, 0],
    [0, 0, 0, doc.MaxRow() + 1, 0],
    [0, 0, 0, 0, -1],
    [0, 0, 0, 0, 1],
  ] as const) {
    expect(doc.ApplyFlagsTab(col1, row1, col2, row2, tab, ScMF.All)).toBe(false);
    expect(doc.RemoveFlagsTab(col1, row1, col2, row2, tab, ScMF.All)).toBe(false);
  }
  pattern.Dispose();
  doc.Dispose();
});
it("refreshes horizontal vertical and rectangular merges and clears orphan filter flags through original owners", /** Native post-mutation re-search preserves multiple merge anchors. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const pattern = new ScPatternAttr(doc.getCellAttributeHelper());
  pattern.ItemSetPut(new ScMergeAttr(3, 3));
  doc.ApplyPattern(1, 2, 0, pattern);
  pattern.ItemSetPut(new ScMergeAttr(2, 1));
  doc.ApplyPattern(1, 6, 0, pattern);
  pattern.ItemSetPut(new ScMergeAttr(1, 2));
  doc.ApplyPattern(5, 2, 0, pattern);
  doc.ApplyFlagsTab(2, 2, 3, 4, 0, ScMF.Auto);
  const x: [number] = [5],
    y: [number] = [6];
  expect(doc.ExtendMerge(1, 2, x, y, 0, true)).toBe(true);
  expect([x[0], y[0]]).toEqual([5, 6]);
  expect(flags(doc, 1, 2)).toBe(ScMF.NONE);
  expect(flags(doc, 2, 2)).toBe(ScMF.Hor);
  expect(flags(doc, 1, 3)).toBe(ScMF.Ver);
  expect(flags(doc, 3, 4)).toBe(ScMF.Hor | ScMF.Ver);
  expect(flags(doc, 2, 6)).toBe(ScMF.Hor);
  expect(flags(doc, 5, 3)).toBe(ScMF.Ver);
  expect(doc.ExtendMerge(1, 2, x, y, 0, true)).toBe(true);
  expect(doc.RefreshAutoFilter(1, 2, 5, 6, 0)).toBe(false);
  doc.ApplyFlagsTab(1, 8, 1, 8, 0, ScMF.Auto | ScMF.Hor);
  expect(doc.ExtendMerge(1, 8, [1], [8], 0, true)).toBe(false);
  expect(flags(doc, 1, 8)).toBe(ScMF.Hor);
  const smallX: [number] = [1],
    smallY: [number] = [2];
  expect(doc.ExtendMerge(1, 2, smallX, smallY, 0, true)).toBe(true);
  expect([smallX[0], smallY[0]]).toEqual([3, 4]);
  expect(doc.ExtendMerge(0, 0, [0], [0], 1, true)).toBe(false);
  expect(doc.ExtendMerge(-1, 0, [0], [0], 0, true)).toBe(false);
  pattern.Dispose();
  doc.Dispose();
});
