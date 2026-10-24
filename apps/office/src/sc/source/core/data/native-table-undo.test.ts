/** @fileoverview Original column/table Undo,manual-break ownership and stream-validity lock behavior over actual native stores. */
import { assert, expect, it } from "vitest";
import { ScDocument, ScDocumentMode } from "../../../inc/document";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScFormulaCell } from "../../../inc/formulacell";
import { CopyToDocContext } from "../../../inc/clipcontext";
import { InsertDeleteFlags } from "../../../inc/global";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { ScPatternAttr } from "../../../inc/patattr";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { ScConditionalFormat, ScCondDateFormatEntry } from "../../../inc/conditio";
import { ScRangeList } from "../../../inc/rangelst";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
/** Creates an ordinary real sheet. @returns Document. */
function document(): ScDocument {
  const doc = new ScDocument(),
    name = unicode("Data");
  doc.InsertTab(0, name);
  name.dispose();
  return doc;
}
/** Borrows an actual native sheet. @param doc - Owner. @returns Sheet. */
function table(doc: ScDocument) {
  const result = doc.FetchTable(0);
  assert(result);
  return result;
}
/** Compiles a real formula into the supplied actual column. @param doc - Owner. @param col - Column. @param row - Row. @param value - Source. @param compiler - Ordinary document compiling the snapshot. @returns Nothing. */
function formula(doc: ScDocument, col: number, row: number, value: string, compiler = doc): void {
  const source = unicode(value),
    address = new ScAddress(col, row, 0);
  try {
    const compiled = new ScFormulaCell(
      compiler,
      address,
      source,
      FormulaGrammar.Grammar.GRAM_NATIVE,
    );
    if (compiler === doc) table(doc).CreateColumnIfNotExists(col).SetFormulaCell(row, compiled);
    else {
      try {
        table(doc)
          .CreateColumnIfNotExists(col)
          .SetFormulaCell(row, new ScFormulaCell(compiled, doc, address));
      } finally {
        compiled.Dispose();
      }
    }
  } finally {
    source.dispose();
  }
}

it("restores requested rows and formulas outside them,retaining the original marked-without-marks asymmetry", /** Genuine compiled formula clones remain subscribed to actual destination cells. @returns Nothing. */ () => {
  const doc = document(),
    undo = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO);
  undo.InitUndo(doc, 0, 0);
  try {
    const source = table(undo).CreateColumnIfNotExists(0),
      target = table(doc).CreateColumnIfNotExists(0),
      context = new CopyToDocContext(doc);
    formula(undo, 0, 0, "=1", doc);
    source.SetValue(1, 11);
    source.SetValue(2, 22);
    formula(undo, 0, 3, "=B2+3", doc);
    source.SetValue(4, 44);
    formula(undo, 0, 5, "=6", doc);
    formula(doc, 0, 0, "=100");
    target.SetValue(1, 101);
    target.SetValue(2, 102);
    formula(doc, 0, 3, "=200");
    target.SetValue(4, 104);
    formula(doc, 0, 5, "=300");
    doc.SetValue(new ScAddress(1, 1, 0), 8);
    source.UndoToColumn(context, 2, 3, InsertDeleteFlags.CONTENTS, false, target);
    expect([
      target.GetValue(0),
      target.GetValue(1),
      target.GetValue(2),
      target.GetValue(3),
      target.GetValue(4),
      target.GetValue(5),
    ]).toEqual([1, 101, 22, 11, 104, 6]);
    expect(target.GetFormulaCell(3)?.GetCode()).not.toBe(source.GetFormulaCell(3)?.GetCode());
    doc.SetValue(new ScAddress(1, 1, 0), 9);
    expect(target.GetValue(3)).toBe(12);
    source.SetValue(2, 222);
    formula(undo, 0, 0, "=2", doc);
    formula(undo, 0, 3, "=9", doc);
    source.UndoToColumn(context, 2, 3, InsertDeleteFlags.CONTENTS, true, target);
    expect(target.GetValue(2)).toBe(22);
    expect(target.GetValue(3)).toBe(12);
    expect(target.GetValue(0)).toBe(2);
    source.UndoToColumn(context, 0, doc.MaxRow(), InsertDeleteFlags.FORMULA, false, target);
    expect(target.GetValue(3)).toBe(9);
    expect(target.GetValue(2)).toBe(22);
  } finally {
    undo.Dispose();
    doc.Dispose();
  }
});
it("undoes a rectangle with whole-column formula restoration and independent conditional-format ownership", /** Real canonical font/index patterns and live formula dependencies survive table Undo. @returns Nothing. */ () => {
  const doc = document(),
    undo = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO);
  undo.InitUndo(doc, 0, 0);
  const delta = new ScPatternAttr(doc.getCellAttributeHelper());
  delta.ItemSetPut(new SvxFontHeightItem(410, 100, 101));
  try {
    formula(undo, 0, 0, "=B3+1", doc);
    formula(undo, 1, 0, "=5", doc);
    formula(undo, 2, 0, "=7", doc);
    formula(undo, 1, 8, "=9", doc);
    undo.SetValue(new ScAddress(1, 2, 0), 22);
    undo.ApplyPattern(1, 2, 0, delta);
    const original = new ScConditionalFormat(4, undo);
    original.SetRange(new ScRangeList(new ScRange(1, 2, 0, 1, 2, 0)));
    original.AddEntry(new ScCondDateFormatEntry(undo));
    table(undo).GetCondFormList().InsertNew(original);
    undo.AddCondFormatData(original.GetRange(), 0, 4);
    doc.SetValue(new ScAddress(1, 2, 0), 200);
    doc.SetValue(new ScAddress(4, 3, 0), 404);
    const context = new CopyToDocContext(doc),
      source = table(undo),
      target = table(doc);
    source.UndoToTable(
      context,
      1,
      2,
      1,
      3,
      InsertDeleteFlags.CONTENTS | InsertDeleteFlags.ATTRIB,
      false,
      target,
    );
    expect(doc.GetValue(new ScAddress(0, 0, 0))).toBe(23);
    expect(doc.GetValue(new ScAddress(1, 0, 0))).toBe(5);
    expect(doc.GetValue(new ScAddress(2, 0, 0))).toBe(7);
    expect(doc.GetValue(new ScAddress(1, 8, 0))).toBe(9);
    expect(doc.GetValue(new ScAddress(4, 3, 0))).toBe(404);
    const pattern = doc.GetPattern(new ScAddress(1, 2, 0));
    assert(pattern);
    expect((pattern.GetItem(101) as SvxFontHeightItem).GetHeight()).toBe(410);
    const copied = target.GetCondFormList().GetFormat(4);
    assert(copied);
    expect(copied.GetEntry(0)).not.toBe(original.GetEntry(0));
    copied.GetRangeList().Join(new ScRange(1, 7, 0, 1, 7, 0));
    expect(original.GetRange().size()).toBe(1);
    const retained = target.GetCondFormList();
    source.UndoToTable(context, 1, 2, 1, 3, InsertDeleteFlags.NONE, false, target);
    expect(target.GetCondFormList()).toBe(retained);
    source.UndoToTable(context, -1, 2, 1, 3, InsertDeleteFlags.CONTENTS, false, target);
    source.UndoToTable(
      context,
      1,
      2,
      doc.MaxCol() + 1,
      3,
      InsertDeleteFlags.CONTENTS,
      false,
      target,
    );
    expect(doc.GetValue(new ScAddress(1, 2, 0))).toBe(22);
    doc.SetValue(new ScAddress(1, 2, 0), 30);
    expect(doc.GetValue(new ScAddress(0, 0, 0))).toBe(31);
  } finally {
    delta.Dispose();
    undo.Dispose();
    doc.Dispose();
  }
});
it("restores native full-axis geometry and whole manual-break sets while respecting absent Undo geometry", /** Geometry restoration does not depend on payload flags or overwrite hidden state. @returns Nothing. */ () => {
  const doc = document(),
    undo = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO),
    empty = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO);
  undo.InitUndo(doc, 0, 0, true, true);
  empty.InitUndo(doc, 0, 0);
  try {
    const source = table(undo),
      target = table(doc),
      absent = table(empty),
      context = new CopyToDocContext(doc);
    source.SetColWidth(0, 2100);
    source.SetColWidth(1, 3000);
    source.SetColWidth(2, 3200);
    target.SetColWidth(0, 5000);
    target.SetColWidth(1, 4000);
    target.SetColWidth(2, 4400);
    source.SetColManualBreaks(new Set([12, 3]));
    target.SetColManualBreaks(new Set([4]));
    source.UndoToTable(context, 1, 0, 2, doc.MaxRow(), InsertDeleteFlags.NONE, false, target);
    expect([target.GetColWidth(0), target.GetColWidth(1), target.GetColWidth(2)]).toEqual([
      5000, 3000, 3200,
    ]);
    const columns = new Set<number>();
    target.GetAllColBreaks(columns, false, true);
    expect([...columns]).toEqual([3, 12]);
    expect(source.HasColManualBreak(12)).toBe(true);
    source.SetRowHeightOnly(2, 4, 430);
    target.SetRowHeightOnly(2, 4, 250);
    source.SetRowHidden(2, 2, true);
    source.SetRowManualBreaks(new Set([20, 5]));
    target.SetRowManualBreaks(new Set([7]));
    source.UndoToTable(context, 0, 2, doc.MaxCol(), 4, InsertDeleteFlags.NONE, false, target);
    expect(target.GetRowHeight(2)).toBe(430);
    expect(target.RowHidden(2)).toBe(false);
    const rows = new Set<number>();
    target.GetAllRowBreaks(rows, false, true);
    expect([...rows]).toEqual([5, 20]);
    source.UndoToTable(
      context,
      0,
      0,
      doc.MaxCol(),
      doc.MaxRow(),
      InsertDeleteFlags.NONE,
      false,
      target,
    );
    expect(target.GetColWidth(0)).toBe(2100);
    absent.UndoToTable(
      context,
      0,
      0,
      doc.MaxCol(),
      doc.MaxRow(),
      InsertDeleteFlags.NONE,
      false,
      target,
    );
    expect(target.GetRowHeight(2)).toBe(430);
    source.UndoToTable(
      new CopyToDocContext(empty),
      0,
      0,
      doc.MaxCol(),
      doc.MaxRow(),
      InsertDeleteFlags.NONE,
      false,
      absent,
    );
    source.UndoToTable(
      context,
      0,
      0,
      doc.MaxCol() - 1,
      doc.MaxRow() - 1,
      InsertDeleteFlags.NONE,
      false,
      target,
    );
  } finally {
    empty.Dispose();
    undo.Dispose();
    doc.Dispose();
  }
});
it("owns native ordered manual/page sets and honors stream-validity locking and ignore-lock defaults", /** Every state is reached by real public native APIs,without private-state fixtures. @returns Nothing. */ () => {
  const doc = document(),
    sheet = table(doc);
  try {
    expect(sheet.IsStreamValid()).toBe(false);
    expect(doc.IsStreamValidLocked()).toBe(false);
    expect(sheet.HasManualBreaks()).toBe(false);
    sheet.SetStreamValid(false);
    sheet.SetStreamValid(true);
    doc.LockStreamValid(true);
    sheet.SetStreamValid(false);
    expect(sheet.IsStreamValid()).toBe(true);
    sheet.SetStreamValid(false, true);
    expect(sheet.IsStreamValid()).toBe(false);
    sheet.SetStreamValid(true);
    expect(sheet.IsStreamValid()).toBe(false);
    doc.LockStreamValid(false);
    sheet.SetStreamValid(true);
    const rowMove = new Set([8, 2]),
      colMove = new Set([9, 3]);
    sheet.SetRowManualBreaks(rowMove);
    rowMove.add(99);
    sheet.SetColManualBreaks(colMove);
    colMove.add(99);
    expect(sheet.IsStreamValid()).toBe(false);
    expect(sheet.HasManualBreaks()).toBe(true);
    expect(sheet.HasRowManualBreak(99)).toBe(false);
    expect(sheet.HasColManualBreak(99)).toBe(false);
    sheet.SetRowBreak(7, true, false);
    sheet.SetRowBreak(1, true, true);
    sheet.SetRowBreak(6, false, false);
    sheet.SetColBreak(7, true, false);
    sheet.SetColBreak(1, true, true);
    sheet.SetColBreak(6, false, false);
    sheet.SetRowBreak(-1, true, true);
    sheet.SetColBreak(doc.MaxCol() + 1, true, true);
    const rows = new Set([14]),
      cols = new Set([14]);
    sheet.GetAllRowBreaks(rows, false, false);
    sheet.GetAllColBreaks(cols, false, false);
    expect([...rows]).toEqual([14]);
    expect([...cols]).toEqual([14]);
    sheet.GetAllRowBreaks(rows, true, false);
    sheet.GetAllColBreaks(cols, true, false);
    expect([...rows]).toEqual([1, 7]);
    expect([...cols]).toEqual([1, 7]);
    sheet.GetAllRowBreaks(rows, false, true);
    sheet.GetAllColBreaks(cols, false, true);
    expect([...rows]).toEqual([1, 2, 7, 8]);
    expect([...cols]).toEqual([1, 3, 7, 9]);
    sheet.GetAllRowBreaks(rows, true, true);
    sheet.GetAllColBreaks(cols, true, true);
    expect([...rows]).toEqual([1, 2, 7, 8]);
    expect([...cols]).toEqual([1, 3, 7, 9]);
    expect(sheet.HasRowPageBreak(1)).toBe(true);
    expect(sheet.HasColPageBreak(1)).toBe(true);
    expect(sheet.HasRowPageBreak(5)).toBe(false);
    expect(sheet.HasColPageBreak(5)).toBe(false);
    expect(sheet.HasRowPageBreak(-1)).toBe(false);
    expect(sheet.HasColPageBreak(-1)).toBe(false);
    expect(sheet.HasRowManualBreak(2)).toBe(true);
    expect(sheet.HasColManualBreak(3)).toBe(true);
    expect(sheet.HasRowManualBreak(-1)).toBe(false);
    expect(sheet.HasColManualBreak(-1)).toBe(false);
    sheet.RemoveManualBreaks();
    expect(sheet.HasManualBreaks()).toBe(false);
    sheet.SetColBreak(4, false, true);
    expect(sheet.HasManualBreaks()).toBe(true);
    sheet.RemoveManualBreaks();
    expect(sheet.HasRowPageBreak(1)).toBe(true);
    expect(sheet.HasColPageBreak(1)).toBe(true);
  } finally {
    doc.Dispose();
  }
});
