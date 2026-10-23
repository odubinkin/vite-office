/** @fileoverview Native pre-paste deletion over actual typed stores,shared groups,sparse tabs and compact broadcast spans. */
import { expect, it } from "vitest";
import { ScDocument, ScDocumentMode } from "../../../inc/document";
import type { ScTable } from "../../../inc/table";
import { ScColumn } from "../../../inc/column";
import { ScAddress, ScRange } from "../../../inc/address";
import { CopyFromClipContext } from "../../../inc/clipcontext";
import { ColumnSpanSet, SingleColumnSpanSet, RowSpan } from "../../../inc/columnspanset";
import { ColumnBlockPosition } from "../../../inc/mtvelements";
import { ScMarkData } from "../../../inc/markdata";
import { CellType, InsertDeleteFlags } from "../../../inc/global";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
/** Reads actual compact spans,discarding false runs as native broadcast consumers do. @param doc - Actual document. @param spans - Original owner. @returns Coordinates. */
function changed(doc: ScDocument, spans: ColumnSpanSet): number[][] {
  const result: number[][] = [];
  spans.executeAction(doc, {
    /** No per-column state is needed. @returns Nothing. */ startColumn() {},
    /** Records original changed runs. @param at - Top. @param length - Count. @param value - Changed. @returns Nothing. */
    execute(at, length, value) {
      if (value) result.push([at.Tab(), at.Col(), at.Row(), length]);
    },
  });
  return result;
}
it("retains original compact inclusive span merge,clear,swap and output replacement", /** No row-sized array is used. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    first = new SingleColumnSpanSet(doc.GetSheetLimits()),
    second = new SingleColumnSpanSet(doc.GetSheetLimits());
  expect(first.empty()).toBe(true);
  first.set(4, 8, true);
  first.set(9, 11, true);
  first.set(6, 7, false);
  expect(first.empty()).toBe(false);
  const output = [new RowSpan(99, 99)];
  first.getSpans(output);
  expect(output).toEqual([new RowSpan(4, 5), new RowSpan(8, 11)]);
  first.swap(second);
  expect(first.empty()).toBe(true);
  second.getSpans(output);
  expect(output).toEqual([new RowSpan(4, 5), new RowSpan(8, 11)]);
  doc.Dispose();
});
it("deletes only real spans and restarts surviving shared formulas after a middle deletion", /** Group extents are captured before teardown and splitting. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  doc.InsertTab(0, unicode("Data"));
  clip.ResetClip(doc, 0);
  clip.SetClipArea(new ScRange());
  for (let row = 0; row < 6; ++row) {
    doc.SetValue(new ScAddress(1, row, 0), row + 2);
    doc.SetFormula(
      new ScAddress(0, row, 0),
      unicode(`=B${row + 1}*2`),
      FormulaGrammar.Grammar.GRAM_NATIVE,
    );
  }
  expect(doc.GetFormulaCell(new ScAddress())?.GetSharedLength()).toBe(6);
  expect(doc.GetValue(new ScAddress(0, 2, 0))).toBe(8);
  const context = new CopyFromClipContext(
      doc,
      null,
      clip,
      InsertDeleteFlags.CONTENTS,
      false,
      false,
    ),
    broadcasts = new ColumnSpanSet();
  context.setTabRange(0, 0);
  context.setDestRange(0, 2, 0, 3);
  context.setDeleteFlag(InsertDeleteFlags.CONTENTS);
  doc.DeleteBeforeCopyFromClip(context, new ScMarkData(doc.GetSheetLimits()), broadcasts);
  expect(doc.GetCellType(new ScAddress(0, 2, 0))).toBe(CellType.CELLTYPE_FORMULA); // No selected table.
  const marks = new ScMarkData(doc.GetSheetLimits());
  marks.SelectTable(0, true);
  doc.DeleteBeforeCopyFromClip(context, marks, broadcasts);
  expect(doc.GetCellType(new ScAddress(0, 2, 0))).toBe(CellType.CELLTYPE_NONE);
  expect(doc.GetCellType(new ScAddress(0, 3, 0))).toBe(CellType.CELLTYPE_NONE);
  expect(changed(doc, broadcasts)).toEqual([[0, 0, 2, 2]]);
  expect(doc.GetFormulaCell(new ScAddress())?.GetSharedLength()).toBe(2);
  expect(doc.GetFormulaCell(new ScAddress(0, 4, 0))?.GetSharedLength()).toBe(2);
  expect(doc.GetBroadcaster(new ScAddress(1, 2, 0))).toBeNull();
  context.startListeningFormulas();
  doc.SetValue(new ScAddress(1, 0, 0), 10);
  doc.SetValue(new ScAddress(1, 5, 0), 12);
  expect(doc.GetValue(new ScAddress())).toBe(20);
  expect(doc.GetValue(new ScAddress(0, 5, 0))).toBe(24);
  context.Dispose();
  clip.Dispose();
  doc.Dispose();
});
it("preserves holes and selective string/formula masks in original DeleteCells results", /** Full numeric selection needs no formatter. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  doc.SetValue(new ScAddress(), 7);
  doc.SetTextCell(new ScAddress(0, 2, 0), unicode("text"));
  doc.SetFormula(new ScAddress(0, 4, 0), unicode("=1/0"), FormulaGrammar.Grammar.GRAM_NATIVE);
  const column = (doc.FetchTable(0) as ScTable).CreateColumnIfNotExists(0),
    position = new ColumnBlockPosition();
  column.InitBlockPosition(position);
  expect(column.DeleteCells(position, 0, 9, InsertDeleteFlags.NONE).aDeletedRows.empty()).toBe(
    true,
  );
  const result = column.DeleteCells(
      position,
      0,
      9,
      InsertDeleteFlags.STRING | InsertDeleteFlags.FORMULA,
    ),
    spans: RowSpan[] = [];
  result.aDeletedRows.getSpans(spans);
  expect(spans).toEqual([new RowSpan(2, 2), new RowSpan(4, 4)]);
  expect(result.aFormulaRanges).toEqual([[4, 4]]);
  expect(doc.GetValue(new ScAddress())).toBe(7);
  expect(column.DeleteCells(position, 0, 9, InsertDeleteFlags.NONE).aDeletedRows.empty()).toBe(
    true,
  );
  expect(
    /** Exercises the genuine formatter boundary. @returns Native result. */ () =>
      column.DeleteCells(position, 0, 9, InsertDeleteFlags.VALUE),
  ).toThrow("native formatter");
  const all = column.DeleteCells(position, 0, doc.MaxRow(), InsertDeleteFlags.CONTENTS);
  all.aDeletedRows.getSpans(spans);
  expect(spans).toEqual([new RowSpan(0, 0)]);
  expect(column.IsEmptyData()).toBe(true);
  doc.EndListeningFormulaCells([]);
  doc.Dispose();
});
it("cycles a sparse clipboard source without allocating untouched destination columns", /** ResetClip preserves a source tab beyond zero. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  for (let tab = 0; tab < 3; ++tab) doc.InsertTab(tab, unicode(`Sheet${tab}`));
  clip.ResetClip(doc, 2);
  clip.SetClipArea(new ScRange(0, 0, 2, 0, 0, 2));
  doc.SetTextCell(new ScAddress(0, 4, 0), unicode("old"));
  doc.SetValue(new ScAddress(0, 4, 2), 9);
  doc.SetValue(new ScAddress(2, 4, 0), 18);
  const context = new CopyFromClipContext(
      doc,
      null,
      clip,
      InsertDeleteFlags.CONTENTS,
      false,
      false,
    ),
    marks = new ScMarkData(doc.GetSheetLimits()),
    broadcasts = new ColumnSpanSet();
  marks.SelectTable(0, true);
  marks.SelectTable(2, true);
  context.setTabRange(0, 3);
  context.setDestRange(0, 4, 30, 5);
  context.setDeleteFlag(InsertDeleteFlags.CONTENTS);
  const allocated = (doc.FetchTable(0) as ScTable).GetAllocatedColumnsCount();
  doc.DeleteBeforeCopyFromClip(context, marks, broadcasts);
  expect(changed(doc, broadcasts)).toEqual([
    [0, 0, 4, 1],
    [0, 2, 4, 1],
    [2, 0, 4, 1],
  ]);
  expect((doc.FetchTable(0) as ScTable).GetAllocatedColumnsCount()).toBe(allocated);
  context.setDestRange(-1, 0, 0, 1);
  doc.DeleteBeforeCopyFromClip(context, marks, broadcasts);
  context.setDestRange(0, -1, 0, 1);
  doc.DeleteBeforeCopyFromClip(context, marks, broadcasts);
  context.Dispose();
  clip.Dispose();
  doc.Dispose();
});
it("keeps original pre-delete cursor early return and rejects unavailable flag services before deletion", /** Native column can exist before adoption into a sheet. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP),
    column = new ScColumn(doc),
    context = new CopyFromClipContext(doc, null, clip, InsertDeleteFlags.CONTENTS, false, false),
    spans = new ColumnSpanSet();
  context.setDestRange(0, 0, 0, 1);
  context.setDeleteFlag(InsertDeleteFlags.CONTENTS);
  column.DeleteBeforeCopyFromClip(context, column, spans);
  doc.InsertTab(0, unicode("Data"));
  const adopted = (doc.FetchTable(0) as ScTable).CreateColumnIfNotExists(0);
  doc.SetValue(new ScAddress(), 17);
  context.setDeleteFlag(InsertDeleteFlags.ALL);
  expect(
    /** Exercises the genuine unsupported mask boundary. @returns Nothing. */ () =>
      adopted.DeleteBeforeCopyFromClip(context, column, spans),
  ).toThrow("Nondefault pre-paste");
  expect(doc.GetValue(new ScAddress())).toBe(17);
  context.Dispose();
  column.DisposeAttributes();
  clip.Dispose();
  doc.Dispose();
});

it("retains every original deleted group extent while emptying disjoint spans in reverse order", /** Real subscriptions and formula ownership are released through actual store callbacks. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  for (let row = 2; row < 5; ++row)
    doc.SetFormula(
      new ScAddress(0, row, 0),
      unicode(`=B${row + 1}+1`),
      FormulaGrammar.Grammar.GRAM_NATIVE,
    );
  doc.SetValue(new ScAddress(0, 8, 0), 99);
  doc.SetTextCell(new ScAddress(0, 12, 0), unicode("last"));
  const column = (doc.FetchTable(0) as ScTable).CreateColumnIfNotExists(0),
    position = new ColumnBlockPosition();
  column.InitBlockPosition(position);
  const result = column.DeleteCells(position, 0, 20, InsertDeleteFlags.CONTENTS),
    spans: RowSpan[] = [];
  result.aDeletedRows.getSpans(spans);
  expect(spans).toEqual([new RowSpan(2, 4), new RowSpan(8, 8), new RowSpan(12, 12)]);
  expect(result.aFormulaRanges).toEqual([
    [2, 4],
    [2, 4],
    [2, 4],
  ]);
  expect(column.IsEmptyData()).toBe(true);
  for (let row = 2; row < 5; ++row) expect(doc.GetBroadcaster(new ScAddress(1, row, 0))).toBeNull();
  doc.SetFormula(new ScAddress(), unicode("=B1+1"), FormulaGrammar.Grammar.GRAM_NATIVE);
  expect(doc.GetValue(new ScAddress())).toBe(1);
  doc.SetValue(new ScAddress(1, 0, 0), 4);
  expect(doc.GetValue(new ScAddress())).toBe(5);
  doc.Dispose();
});
