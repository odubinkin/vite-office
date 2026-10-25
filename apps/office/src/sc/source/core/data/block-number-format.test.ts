/** @fileoverview Native selected-block number-format compatibility through real attribute runs and formatter ownership. */
import { expect, it } from "vitest";
import { ScDocument, ScDocumentMode } from "../../../inc/document";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScMarkData } from "../../../inc/markdata";
import { ScPatternAttr } from "../../../inc/patattr";
import { SvNumFormatType } from "../../../../svl/inc/zforlist";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
/** Reads a genuine pattern's height. @param doc - Actual document. @param col - Column. @param row - Row. @param tab - Sheet. @returns Twips. */
function height(doc: ScDocument, col: number, row: number, tab = 0): number {
  return (
    (doc.GetPattern(new ScAddress(col, row, tab)) as ScPatternAttr).GetItem(
      101,
    ) as SvxFontHeightItem
  ).GetHeight();
}
it("retains compatible General runs and applies only incompatible clipped runs across selected sparse sheets", /** Actual cache mutation preserves outside rows and original table guards. @returns Nothing. */ () => {
  const doc = new ScDocument();
  for (let tab = 0; tab < 3; ++tab) doc.InsertTab(tab, unicode(`Sheet${tab}`));
  doc.SetValue(new ScAddress(2, 0, 0), 1);
  doc.SetValue(new ScAddress(2, 0, 2), 2);
  const pattern = new ScPatternAttr(doc.getCellAttributeHelper());
  pattern.ItemSetPut(new SvxFontHeightItem(330, 100, 101));
  const marks = new ScMarkData(doc.GetSheetLimits());
  marks.SelectTable(0, true);
  const range = new ScRange(1, 2, 0, 2, 5, 0);
  doc.ApplyPatternIfNumberformatIncompatible(range, marks, pattern, SvNumFormatType.NUMBER);
  expect(height(doc, 1, 2)).toBe(200);
  doc.ApplyPatternAreaTab(1, 3, 1, 4, 0, pattern);
  pattern.ItemSetPut(new SvxFontHeightItem(420, 100, 101));
  doc.ApplyPatternIfNumberformatIncompatible(range, marks, pattern, SvNumFormatType.LOGICAL);
  expect([
    height(doc, 1, 1),
    height(doc, 1, 2),
    height(doc, 1, 3),
    height(doc, 1, 5),
    height(doc, 1, 6),
  ]).toEqual([200, 420, 420, 420, 200]);
  expect([height(doc, 2, 2), height(doc, 2, 5), height(doc, 2, 6)]).toEqual([420, 420, 200]);
  const sparse = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO);
  sparse.InitUndo(doc, 2, 2);
  sparse.SetValue(new ScAddress(2, 0, 2), 3);
  marks.SelectTable(1, true);
  marks.SelectTable(2, true);
  marks.SelectTable(4, true);
  sparse.ApplyPatternIfNumberformatIncompatible(range, marks, pattern, SvNumFormatType.LOGICAL);
  expect(height(sparse, 2, 3, 2)).toBe(420);
  marks.SelectTable(1, false);
  marks.SelectTable(2, false);
  marks.SelectTable(4, false);
  const reversed = new ScRange(2, 6, 0, 1, 5, 0);
  // Native coordinates are publicly mutable;preserve the caller's empty loop bounds.
  reversed.aStart.SetCol(2);
  reversed.aEnd.SetCol(1);
  doc.ApplyPatternIfNumberformatIncompatible(reversed, marks, pattern, SvNumFormatType.LOGICAL);
  reversed.aStart.SetCol(1);
  reversed.aEnd.SetCol(2);
  reversed.aStart.SetRow(6);
  reversed.aEnd.SetRow(5);
  doc.ApplyPatternIfNumberformatIncompatible(reversed, marks, pattern, SvNumFormatType.LOGICAL);
  expect(pattern.GetNumberFormat(doc.GetFormatTable())).toBe(0);
  pattern.Dispose();
  sparse.Dispose();
  doc.Dispose();
});
