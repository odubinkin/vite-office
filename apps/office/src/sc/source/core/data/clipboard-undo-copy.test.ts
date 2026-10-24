/** @fileoverview Native CopyToDocContext and column clone-copy ownership used by paste Undo snapshots. */
import { ScDocShell } from "../../ui/docshell/docsh";
import { ScUndoPaste, ScUndoPasteOptions } from "../../ui/undo/undoblk";
import { ScRangeList } from "../../../inc/rangelst";
import { expect, it } from "vitest";
import { ScDocument, ScDocumentMode } from "../../../inc/document";
import { ScColumn } from "../../../inc/column";
import type { ScTable } from "../../../inc/table";
import { ScFormulaCell, ScMatrixMode } from "../../../inc/formulacell";
import { ScAddress, ScRange } from "../../../inc/address";
import { CopyToDocContext } from "../../../inc/clipcontext";
import { ScMarkData } from "../../../inc/markdata";
import { InsertDeleteFlags, ScCloneFlags, CellType } from "../../../inc/global";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { DelayFormulaGroupingSwitch } from "../../../inc/scopetools";
import { readOdsDocument, writeOdsDocument } from "../../filter/xml/xmlwrap";
import { CellTextAttr } from "../../../inc/celltextattr";
const grammar = FormulaGrammar.Grammar.GRAM_NATIVE;
/** Creates an actual ordinary document with one native table. @returns Document. */
function document(): ScDocument {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  return doc;
}
/** Borrows an actual allocated column. @param doc - Owner. @param col - Native column index. @returns Column. */
function column(doc: ScDocument, col: number): ScColumn {
  return (doc.FetchTable(0) as ScTable).CreateColumnIfNotExists(col);
}
it("copies scalar/string/formula blocks and keeps native empty-source and empty-string removal semantics", /** Actual dependencies and ODS reopen observe copied compiled offsets. @returns Completion. */ async () => {
  const doc = document(),
    source = column(doc, 0),
    target = column(doc, 1),
    context = new CopyToDocContext(doc);
  expect(context.isStartListening()).toBe(true);
  source.SetValue(0, 4);
  source.SetRawString(1, unicode("Hello"));
  source.SetRawString(2, unicode(""));
  source.SetFormula(3, unicode("=C4+1"), grammar);
  column(doc, 2).SetValue(3, 2);
  column(doc, 3).SetValue(3, 7);
  target.SetValue(2, 9);
  target.SetValue(4, 99);
  (source.GetCellTextAttr(0) as CellTextAttr).mnTextWidth = 42;
  source.CopyToColumn(context, 0, 4, InsertDeleteFlags.CONTENTS, false, target);
  expect(target.GetValue(0)).toBe(4);
  expect(target.GetValue(3)).toBe(8);
  expect(target.GetCellType(2)).toBe(CellType.CELLTYPE_NONE);
  expect(target.GetValue(4)).toBe(99);
  const string = target.GetSharedString(1),
    formula = target.GetFormulaCell(3)?.GetFormula(grammar);
  expect(text(string.getString())).toBe("Hello");
  expect(formula && text(formula)).toBe("=D4+1");
  string.dispose();
  formula?.dispose();
  expect(target.GetCellTextAttr(0)?.mnTextWidth).toBe(new CellTextAttr().mnTextWidth);
  column(doc, 3).SetValue(3, 33);
  expect(target.GetValue(3)).toBe(34);
  const reopened = await readOdsDocument(writeOdsDocument(doc));
  expect(reopened.GetValue(new ScAddress(1, 3, 0))).toBe(34);
  reopened.SetValue(new ScAddress(3, 3, 0), 40);
  expect(reopened.GetValue(new ScAddress(1, 3, 0))).toBe(41);
  reopened.Dispose();
  doc.Dispose();
});
it("keeps Undo pools,compiled code,groups and format requests independent from source owners", /** Snapshot copying uses real no-listening policy and same-coordinate clones. @returns Nothing. */ () => {
  const doc = document(),
    undo = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO),
    source = column(doc, 0);
  undo.InitUndo(doc, 0, 0);
  const context = new CopyToDocContext(undo),
    target = column(undo, 0);
  context.setStartListening(false);
  expect(context.isStartListening()).toBe(false);
  for (let row = 1; row < 4; ++row) source.SetFormula(row, unicode(`=B${row + 1}+1`), grammar);
  source.GetFormulaCell(1)?.SetNeedNumberFormat(false);
  source.CopyToColumn(context, 1, 3, InsertDeleteFlags.CONTENTS, false, target);
  const original = source.GetFormulaCell(1),
    copy = target.GetFormulaCell(1);
  expect(copy).not.toBe(original);
  expect(copy?.GetCode()).not.toBe(original?.GetCode());
  expect(copy?.GetSharedLength()).toBe(3);
  expect(copy?.NeedsNumberFormat()).toBe(false);
  expect(target.GetFormulaCell(2)?.NeedsNumberFormat()).toBe(true);
  expect(undo.GetPool()).toBe(doc.GetPool());
  expect(copy && undo.IsInFormulaTree(copy)).toBe(false);
  undo.Dispose();
  doc.Dispose();
});
it("retains FORMULA-only copying and native STRING-result conversion including Undo suppression", /** Missing masks leave scalar blocks unchanged;actual interpreter owners provide string results. @returns Nothing. */ () => {
  const doc = document(),
    source = column(doc, 0),
    target = column(doc, 1),
    context = new CopyToDocContext(doc),
    undo = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO);
  source.SetValue(0, 10);
  source.SetRawString(1, unicode("raw"));
  source.SetFormula(2, unicode('="result"'), grammar);
  source.SetFormula(3, unicode("=7"), grammar);
  target.SetValue(0, 99);
  target.SetValue(1, 88);
  source.CopyToColumn(context, 0, 3, InsertDeleteFlags.FORMULA, false, target);
  expect(target.GetValue(0)).toBe(99);
  expect(target.GetValue(1)).toBe(88);
  expect(target.GetFormulaCell(2)).not.toBeNull();
  const strings = column(doc, 2);
  source.CopyToColumn(context, 0, 3, InsertDeleteFlags.STRING, false, strings);
  const raw = strings.GetSharedString(1),
    result = strings.GetSharedString(2);
  expect(text(raw.getString())).toBe("raw");
  expect(text(result.getString())).toBe("result");
  raw.dispose();
  result.dispose();
  expect(strings.GetCellType(3)).toBe(CellType.CELLTYPE_NONE);
  undo.InitUndo(doc, 0, 0);
  source.CopyToColumn(
    new CopyToDocContext(undo),
    2,
    3,
    InsertDeleteFlags.STRING,
    false,
    column(undo, 0),
  );
  expect(column(undo, 0).GetCellType(2)).toBe(CellType.CELLTYPE_NONE);
  undo.Dispose();
  doc.Dispose();
});
it("copies original multi-mark intersections and leaves absent or simple marks untouched", /** Real ScMultiSelIter clips selected runs to the caller's row bounds. @returns Nothing. */ () => {
  const doc = document(),
    source = column(doc, 0),
    target = column(doc, 1),
    context = new CopyToDocContext(doc),
    marks = new ScMarkData(doc.GetSheetLimits());
  for (let row = 0; row < 12; ++row) {
    source.SetValue(row, row + 1);
    target.SetValue(row, -1);
  }
  marks.SetMultiMarkArea(new ScRange(0, 0, 0, 0, 0, 0));
  marks.SetMultiMarkArea(new ScRange(0, 2, 0, 0, 3, 0));
  marks.SetMultiMarkArea(new ScRange(0, 7, 0, 0, 10, 0));
  marks.SetMultiMarkArea(new ScRange(0, 14, 0, 0, 15, 0));
  source.CopyToColumn(context, 2, 8, InsertDeleteFlags.CONTENTS, true, target, marks);
  expect(
    [1, 2, 3, 4, 6, 7, 8, 9].map(
      /** Reads actual selected and excluded cells. @param row - Row. @returns Number. */ (row) =>
        target.GetValue(row),
    ),
  ).toEqual([-1, 3, 4, -1, -1, 8, 9, -1]);
  source.CopyToColumn(context, 0, 11, InsertDeleteFlags.CONTENTS, true, target);
  marks.ResetMark();
  marks.SetMarkArea(new ScRange(0, 0, 0));
  source.CopyToColumn(context, 0, 11, InsertDeleteFlags.CONTENTS, true, target, marks);
  expect(target.GetValue(0)).toBe(-1);
  doc.Dispose();
});
it("reinterns foreign scalar strings and preserves empty cursor-context lifetime boundaries", /** Real pools and an unadopted empty destination exercise original writeback guards. @returns Nothing. */ () => {
  const doc = document(),
    other = document(),
    source = column(doc, 0),
    target = column(other, 0),
    canonical = other.GetSharedStringPool().intern(unicode("FOREIGN"));
  source.SetRawString(1, unicode("foreign"));
  source.SetRawString(3, unicode(""));
  source.SetValue(5, 8);
  target.SetValue(3, 11);
  source.CopyToColumn(new CopyToDocContext(other), 0, 6, InsertDeleteFlags.CONTENTS, false, target);
  const string = target.GetSharedString(1),
    original = source.GetSharedString(1);
  expect(text(string.getString())).toBe("foreign");
  expect(string.getDataIgnoreCase()).toBe(canonical.getDataIgnoreCase());
  string.dispose();
  original.dispose();
  canonical.dispose();
  expect(target.GetCellType(3)).toBe(CellType.CELLTYPE_NONE);
  expect(target.GetValue(5)).toBe(8);
  const unadopted = new ScColumn(other);
  unadopted.Init(7, 3);
  column(doc, 4).CopyToColumn(
    new CopyToDocContext(other),
    0,
    5,
    InsertDeleteFlags.CONTENTS,
    false,
    unadopted,
  );
  unadopted.DisposeAttributes();
  other.Dispose();
  doc.Dispose();
});
it("rejects nondefault copy services before mutation and retains NONE as a no-content operation", /** Existing destination values prove admission precedes writes. @returns Nothing. */ () => {
  const doc = document(),
    source = column(doc, 0),
    target = column(doc, 1),
    context = new CopyToDocContext(doc);
  source.SetValue(0, 5);
  target.SetValue(0, 9);
  expect(
    /** Link mode requires the original unported link handler. @returns Nothing. */ () =>
      source.CopyToColumn(context, 0, 0, InsertDeleteFlags.CONTENTS, false, target, null, true),
  ).toThrow("Nondefault");
  expect(
    /** Selective number/date masks require number-type classification. @returns Nothing. */ () =>
      source.CopyToColumn(context, 0, 0, InsertDeleteFlags.VALUE, false, target),
  ).toThrow("Nondefault");
  expect(
    /** Drawing-copy flags require their native owner outside this column profile. @returns Nothing. */ () =>
      source.CopyToColumn(context, 0, 0, InsertDeleteFlags.OBJECTS, false, target),
  ).toThrow("Nondefault");
  source.CopyToColumn(context, 0, 0, InsertDeleteFlags.NONE, false, target);
  expect(target.GetValue(0)).toBe(9);
  doc.Dispose();
});
it("copies and restores a real long formula group with native bulk teardown and listener restoration", /** Actual compiled owners cross the upstream1024 threshold. @returns Nothing. */ () => {
  const doc = document(),
    source = column(doc, 0),
    values = column(doc, 1),
    undo = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO),
    count = 1025;
  doc.SetAutoCalc(false);
  const grouping = new DelayFormulaGroupingSwitch(doc, true);
  for (let row = 0; row < count; ++row) {
    values.SetValue(row, row + 1);
    source.SetFormula(row, unicode(`=B${row + 1}+1`), grammar);
  }
  grouping.Dispose();
  expect(source.GetFormulaCell(0)?.GetSharedLength()).toBe(count);
  undo.InitUndo(doc, 0, 0);
  const snapshot = column(undo, 0),
    context = new CopyToDocContext(undo);
  context.setStartListening(false);
  source.CopyToColumn(context, 0, count - 1, InsertDeleteFlags.CONTENTS, false, snapshot);
  snapshot.CopyToColumn(
    new CopyToDocContext(doc),
    0,
    count - 1,
    InsertDeleteFlags.CONTENTS,
    false,
    source,
  );
  expect(source.GetFormulaCell(0)?.GetSharedLength()).toBe(count);
  expect(doc.IsEnabledDelayStartListeningFormulaCells(source)).toBe(false);
  doc.SetAutoCalc(true);
  expect(source.GetValue(count - 1)).toBe(count + 1);
  values.SetValue(count - 1, 50);
  expect(source.GetValue(count - 1)).toBe(51);
  undo.Dispose();
  doc.Dispose();
}, 20000);

it("keeps matrix cloning and multiline result storage at genuine unported owner boundaries", /** Actual formula metadata and string results reach their native copy alternatives. @returns Nothing. */ () => {
  const doc = document(),
    source = column(doc, 0),
    target = column(doc, 1),
    context = new CopyToDocContext(doc);
  source.SetFormula(0, unicode("=1"), grammar);
  const tokens = (source.GetFormulaCell(0) as ScFormulaCell).GetCode().Clone();
  source.SetFormulaCell(
    0,
    new ScFormulaCell(doc, new ScAddress(0, 0, 0), tokens, grammar, ScMatrixMode.Formula),
  );
  target.SetValue(0, 9);
  expect(
    /** The native matrix-copy services are unported. @returns Nothing. */ () =>
      source.CopyToColumn(context, 0, 0, InsertDeleteFlags.CONTENTS, false, target),
  ).toThrow("Matrix");
  source.SetFormula(1, unicode('="a\nb"'), grammar);
  target.SetValue(1, 8);
  expect(
    /** The native rich result alternative requires EditText storage. @returns Nothing. */ () =>
      source.CopyToColumn(context, 1, 1, InsertDeleteFlags.STRING, false, target),
  ).toThrow("Multiline");
  expect(target.GetValue(0)).toBe(9);
  expect(target.GetValue(1)).toBe(8);
  doc.Dispose();
});

it("uses source-native default clone flags inside marked recursion", /** A real multi mark reaches the native default recursive call despite an outer nondefault flag. @returns Nothing. */ () => {
  const doc = document(),
    undo = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO);
  undo.InitUndo(doc, 0, 0);
  const source = doc.FetchTable(0)?.CreateColumnIfNotExists(0),
    target = undo.FetchTable(0)?.CreateColumnIfNotExists(0);
  if (!source || !target) throw Error("Missing native column");
  doc.SetValue(new ScAddress(), 7);
  const marks = new ScMarkData(doc.GetSheetLimits());
  marks.SelectTable(0, true);
  marks.SetMultiMarkArea(new ScRange());
  source.CopyToColumn(
    new CopyToDocContext(undo),
    0,
    0,
    InsertDeleteFlags.CONTENTS,
    true,
    target,
    marks,
    false,
    ScCloneFlags.NoMakeAbsExternal,
  );
  expect(target.GetValue(0)).toBe(7);
  expect(
    /** Unmarked admission preserves the still-unsupported clone policy. @returns Nothing. */ () =>
      source.CopyToColumn(
        new CopyToDocContext(undo),
        0,
        0,
        InsertDeleteFlags.CONTENTS,
        false,
        target,
        null,
        false,
        ScCloneFlags.NoMakeAbsExternal,
      ),
  ).toThrow("Nondefault document copy services");
  undo.Dispose();
  doc.Dispose();
});

it("copies compiled document payload through native scope guards and completes restored listening", /** Same-pool Undo owns compiled tokens and default geometry remains optional at the document boundary. @returns Nothing. */ () => {
  const doc = document(),
    undo = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO);
  undo.InitUndo(doc, 0, 0);
  const sourceName = unicode("Source"),
    targetName = unicode("Snapshot");
  doc.SetName(sourceName);
  undo.SetName(targetName);
  sourceName.dispose();
  targetName.dispose();
  doc.SetValue(new ScAddress(), 2);
  const input = unicode("=A1+1"),
    formula = new ScFormulaCell(doc, new ScAddress(1, 0, 0), input, grammar);
  input.dispose();
  doc.SetFormulaCell(new ScAddress(1, 0, 0), formula);
  expect(doc.GetValue(new ScAddress(1, 0, 0))).toBe(3);
  const range = new ScRange(0, 0, 0, 1, 0, 0);
  range.aStart.SetCol(1);
  range.aEnd.SetCol(0);
  doc.CopyToDocument(range, InsertDeleteFlags.CONTENTS, false, undo, null, false);
  const stored = undo.GetFormulaCell(new ScAddress(1, 0, 0));
  expect(stored).not.toBe(formula);
  expect(doc.IsDelayedDeletingBroadcasters()).toBe(false);
  expect(doc.GetAutoCalc()).toBe(true);
  doc.SetValue(new ScAddress(1, 0, 0), 18);
  doc.SetColWidth(0, 0, 777);
  undo.CopyToDocument(range, InsertDeleteFlags.CONTENTS, false, doc, null, false);
  doc.SetValue(new ScAddress(), 11);
  expect(doc.GetValue(new ScAddress(1, 0, 0))).toBe(12);
  expect(doc.GetColWidth(0, 0)).toBe(777);
  undo.Dispose();
  doc.Dispose();
});
it("uses actual sparse table presence and native minimum table-count bounds", /** Native range iteration skips null source/target slots without using sheet selection as an alternate filter. @returns Nothing. */ () => {
  const doc = document(),
    source = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO),
    target = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO);
  source.InitUndo(doc, 0, 0);
  source.AddUndoTab(2, 2);
  target.InitUndo(doc, 1, 1);
  source.SetValue(new ScAddress(), 9);
  source.CopyToDocument(new ScRange(0, 0, 0, 0, 0, 9), InsertDeleteFlags.CONTENTS, false, target);
  expect(target.GetTableCount()).toBe(2);
  expect(target.GetValue(new ScAddress(0, 0, 1))).toBe(0);
  target.Dispose();
  source.Dispose();
  doc.Dispose();
});

it("undoes and redoes real pasted formula groups through native documents and shared Sfx history", /** Actual lazy Redo capture retains text,empty,value and formula owners across selected sheets and fresh ODS reopen. @returns Completion. */ async () => {
  const doc = document();
  doc.InsertTab(1, unicode("Second"));
  const shell = new ScDocShell(doc),
    range = new ScRange(1, 3, 0, 1, 4, 0),
    marks = new ScMarkData(doc.GetSheetLimits());
  marks.SetMarkArea(range);
  marks.SelectTable(0, true);
  marks.SelectTable(1, true);
  marks.SelectTable(3, true); // Native actions tolerate retained marks beyond the current sheet count.
  for (let tab = 0; tab < 2; ++tab) {
    doc.SetValue(new ScAddress(0, 3, tab), 3 + tab * 2);
    doc.SetValue(new ScAddress(0, 4, tab), 4 + tab * 2);
  }
  doc.SetValue(new ScAddress(), 10);
  doc.SetTextCell(new ScAddress(1, 3, 0), unicode("old"));
  doc.SetFormula(new ScAddress(1, 3, 1), unicode("=A4+100"), grammar);
  doc.SetValue(new ScAddress(1, 4, 1), 7);
  const undo = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO);
  undo.InitUndoSelected(doc, marks);
  doc.CopyToDocument(new ScRange(1, 3, 0, 1, 4, 1), InsertDeleteFlags.CONTENTS, false, undo);
  const clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  clip.ResetClip(doc, 0);
  clip.SetClipArea(new ScRange(1, 0, 0, 1, 0, 0));
  doc.SetFormula(new ScAddress(1, 0, 0), unicode("=A1*2"), grammar);
  doc.GetValue(new ScAddress(1, 0, 0));
  doc.CopyToDocument(new ScRange(1, 0, 0, 1, 0, 0), InsertDeleteFlags.CONTENTS, false, clip);
  doc.CopyFromClip(range, marks, InsertDeleteFlags.CONTENTS, null, clip);
  const options = new ScUndoPasteOptions(),
    action = new ScUndoPaste(
      shell,
      new ScRangeList(range),
      marks,
      undo,
      null,
      InsertDeleteFlags.CONTENTS,
      null,
      false,
      options,
    );
  expect(action.GetComment()).toBe("Paste");
  expect(action["aPasteOptions"]).toEqual(options);
  expect(action.GetMarkData()).not.toBe(marks);
  expect(action.getAffectedRange().equals(range)).toBe(true);
  shell.GetUndoManager().AddUndoAction(action);
  expect(doc.GetValue(new ScAddress(1, 3, 0))).toBe(6);
  expect(doc.GetValue(new ScAddress(1, 4, 1))).toBe(12);
  expect(shell.Undo()).toBe(true);
  const restoredString = doc.GetSharedString(new ScAddress(1, 3, 0));
  expect(text(restoredString.getString())).toBe("old");
  restoredString.dispose();
  expect(doc.GetCellType(new ScAddress(1, 4, 0))).toBe(CellType.CELLTYPE_NONE);
  expect(doc.GetValue(new ScAddress(1, 3, 1))).toBe(105);
  expect(doc.GetValue(new ScAddress(1, 4, 1))).toBe(7);
  expect(shell.Redo()).toBe(true);
  expect(doc.GetValue(new ScAddress(1, 3, 0))).toBe(6);
  expect(doc.GetValue(new ScAddress(1, 4, 1))).toBe(12);
  doc.SetValue(new ScAddress(0, 4, 1), 20);
  expect(doc.GetValue(new ScAddress(1, 4, 1))).toBe(40);
  expect(shell.Undo()).toBe(true);
  expect(shell.Redo()).toBe(true);
  expect(doc.GetValue(new ScAddress(1, 4, 1))).toBe(40);
  const reopened = await readOdsDocument(writeOdsDocument(doc));
  reopened.SetValue(new ScAddress(0, 4, 1), 30);
  expect(reopened.GetValue(new ScAddress(1, 4, 1))).toBe(60);
  reopened.Dispose();
  clip.Dispose();
  shell.Close();
});

it.each([false, true])(
  "retains prefilled/lazy existing Redo owners with filled=%s",
  /** Actual copied options and documents retain native constructor/default and first-undo behavior. @param filled - Original filled flag. @returns Nothing. */ (
    filled,
  ) => {
    const doc = document(),
      shell = new ScDocShell(doc),
      range = new ScRange(0, 0, 0, 0, 1, 0),
      marks = new ScMarkData(doc.GetSheetLimits());
    marks.SetMarkArea(range);
    marks.SelectTable(0, true);
    const undo = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO),
      redo = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO);
    undo.InitUndo(doc, 0, 0);
    redo.InitUndo(doc, 0, 0);
    undo.SetValue(new ScAddress(), 1);
    redo.SetValue(new ScAddress(), 2);
    doc.SetValue(new ScAddress(), 2);
    const action = new ScUndoPaste(
      shell,
      new ScRangeList(range),
      marks,
      undo,
      redo,
      InsertDeleteFlags.CONTENTS,
      null,
      filled,
    );
    action.Undo();
    expect(doc.GetValue(new ScAddress())).toBe(1);
    action.Redo();
    expect(doc.GetValue(new ScAddress())).toBe(2);
    action.Dispose();
    shell.Close();
  },
);
it("retains whole-axis Redo geometry and empty-range native undo guards", /** Column/row snapshot allocation follows actual full-axis bounds rather than forced disabled flags. @returns Nothing. */ () => {
  for (const rows of [false, true]) {
    const doc = document(),
      shell = new ScDocShell(doc),
      range = rows
        ? new ScRange(0, 0, 0, doc.MaxCol(), 0, 0)
        : new ScRange(0, 0, 0, 0, doc.MaxRow(), 0),
      marks = new ScMarkData(doc.GetSheetLimits());
    marks.SetMarkArea(range);
    marks.SelectTable(0, true);
    const table = doc.FetchTable(0) as ScTable;
    if (rows) table.SetRowHeightOnly(0, 0, 500);
    else table.SetColWidth(0, 700);
    const undo = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO);
    undo.InitUndoSelected(doc, marks, !rows, rows);
    doc.CopyToDocument(range, InsertDeleteFlags.CONTENTS, false, undo);
    if (rows) table.SetRowHeightOnly(0, 0, 900);
    else table.SetColWidth(0, 1200);
    const action = new ScUndoPaste(
      shell,
      new ScRangeList(range),
      marks,
      undo,
      null,
      InsertDeleteFlags.CONTENTS,
      null,
      false,
    );
    action.Undo();
    expect(rows ? table.GetOriginalHeight(0) : table.GetColWidth(0)).toBe(rows ? 500 : 700);
    action.Redo();
    expect(rows ? table.GetOriginalHeight(0) : table.GetColWidth(0)).toBe(rows ? 900 : 1200);
    action.Dispose();
    shell.Close();
  }
  const doc = document(),
    shell = new ScDocShell(doc),
    marks = new ScMarkData(doc.GetSheetLimits());
  marks.SelectTable(0, true);
  const undo = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO);
  undo.InitUndo(doc, 0, 0);
  const empty = new ScUndoPaste(
    shell,
    new ScRangeList(),
    marks,
    undo,
    null,
    InsertDeleteFlags.CONTENTS,
    null,
    true,
  );
  empty.Redo();
  empty.Undo();
  empty.Dispose();
  const rejected = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO);
  rejected.InitUndo(doc, 0, 0);
  expect(
    /** Unavailable flag families still destroy the actually transferred unique owner. @returns No action. */ () =>
      new ScUndoPaste(
        shell,
        new ScRangeList(),
        marks,
        rejected,
        null,
        InsertDeleteFlags.ATTRIB,
        null,
        false,
      ),
  ).toThrow("Nondefault paste undo");
  expect(rejected.GetPool()).toBeNull();
  shell.Close();
});
