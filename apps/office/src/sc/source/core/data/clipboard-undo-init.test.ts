/** @fileoverview Native Undo document initialization,pool lifetime,sparse tabs and optional table geometry. */
import { expect, it } from "vitest";
import { ScDocument, ScDocumentMode } from "../../../inc/document";
import type { ScTable } from "../../../inc/table";
import { CopyToDocContext } from "../../../inc/clipcontext";
import { InsertDeleteFlags, ScCloneFlags } from "../../../inc/global";
import { ScAddress } from "../../../inc/address";
import { ScMarkData } from "../../../inc/markdata";
import { ScDocOptions } from "../../../inc/docoptio";
import { ScFormulaCell } from "../../../inc/formulacell";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
const grammar = FormulaGrammar.Grammar.GRAM_NATIVE;
it("initializes sparse contiguous Undo sheets with shared genuine resources and native geometry defaults", /** Geometry-less Undo tables retain real default column/cell owners. @returns Nothing. */ () => {
  const source = new ScDocument(),
    undo = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO);
  source.InsertTab(0, unicode("Data"));
  const options = new ScDocOptions(source.GetDocOptions());
  options.SetIterCount(37);
  source.SetDocOptions(options);
  undo.InitUndo(source, 2, 3);
  expect(undo.GetTableCount()).toBe(4);
  expect(undo.FetchTable(0)).toBe(null);
  expect(undo.FetchTable(1)).toBe(null);
  const table = undo.FetchTable(2) as ScTable;
  expect(text(table.GetName())).toBe("");
  expect(undo.FetchTable(3)).not.toBe(null);
  expect(undo.GetPool()).toBe(source.GetPool());
  expect(undo.GetSharedStringPool()).toBe(source.GetSharedStringPool());
  expect(undo.getCellAttributeHelper()).toBe(source.getCellAttributeHelper());
  expect(undo.GetDocOptions().GetIterCount()).toBe(100);
  expect(undo.GetAutoCalc()).toBe(false);
  const width = table.GetColWidth(0),
    height = table.GetRowHeight(0);
  table.SetColWidth(0, 321);
  table.SetRowHeightOnly(0, 2, 456);
  table.SetManualHeight(0, 2, true);
  table.SetManualHeight(0, 2, false);
  table.SetColHidden(0, 0, true);
  table.SetRowHidden(0, 0, true);
  expect(table.GetColWidth(0)).toBe(width);
  expect(table.GetRowHeight(0)).toBe(height);
  expect(table.SetRowHeightRange(0, 2, 500, 1 / 15, true)).toBe(false);
  undo.SetValue(new ScAddress(0, 0, 2), 7);
  expect(undo.GetValue(new ScAddress(0, 0, 2))).toBe(7);
  undo.Dispose();
  source.Dispose();
});
it("allocates column and row geometry independently when explicitly requested", /** Public native constructor options are preserved through InitUndo. @returns Nothing. */ () => {
  const source = new ScDocument(),
    undo = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO);
  source.InsertTab(0, unicode("Data"));
  for (const [cols, rows] of [
    [true, false],
    [false, true],
    [true, true],
  ] as const) {
    undo.InitUndo(source, 0, 0, cols, rows);
    const table = undo.FetchTable(0) as ScTable;
    const oldWidth = table.GetColWidth(0),
      oldHeight = table.GetRowHeight(0);
    table.SetColWidth(0, 321);
    table.SetRowHeightOnly(0, 1, 456);
    expect(table.GetColWidth(0)).toBe(cols ? 321 : oldWidth);
    expect(table.GetRowHeight(0)).toBe(rows ? 456 : oldHeight);
    table.SetColHidden(0, 0, true);
    table.SetRowHidden(0, 0, true);
    expect(table.GetColWidth(0)).toBe(cols ? 0 : oldWidth);
    expect(table.GetRowHeight(0)).toBe(rows ? 0 : oldHeight);
  }
  undo.Dispose();
  source.Dispose();
});
it("adds missing Undo tabs without replacing existing cells or previously allocated geometry", /** Incremental allocation keeps original table identity and flags. @returns Nothing. */ () => {
  const source = new ScDocument(),
    undo = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO);
  source.InsertTab(0, unicode("Data"));
  undo.InitUndo(source, 2, 2, true, true);
  const original = undo.FetchTable(2) as ScTable;
  original.SetColWidth(0, 333);
  undo.SetValue(new ScAddress(0, 0, 2), 12);
  undo.AddUndoTab(0, 3);
  expect(undo.GetTableCount()).toBe(4);
  expect(undo.FetchTable(2)).toBe(original);
  expect(original.GetColWidth(0)).toBe(333);
  expect(undo.GetValue(new ScAddress(0, 0, 2))).toBe(12);
  const first = undo.FetchTable(0) as ScTable,
    initial = first.GetColWidth(0);
  first.SetColWidth(0, 555);
  expect(first.GetColWidth(0)).toBe(initial);
  undo.AddUndoTab(0, 1, true, true);
  expect(undo.FetchTable(0)).toBe(first);
  first.SetColWidth(0, 444);
  expect(first.GetColWidth(0)).toBe(initial);
  undo.Dispose();
  source.Dispose();
});
it("replaces previous Undo content with exactly selected sparse sheets and independent option defaults", /** Selected initialization clears old owner subscriptions and slots. @returns Nothing. */ () => {
  const source = new ScDocument(),
    undo = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO);
  source.InsertTab(0, unicode("Data"));
  undo.InitUndo(source, 0, 4);
  undo.SetValue(new ScAddress(), 99);
  const marks = new ScMarkData(source.GetSheetLimits());
  marks.SelectTable(1, true);
  marks.SelectTable(3, true);
  undo.InitUndoSelected(source, marks, true, false);
  expect(undo.GetTableCount()).toBe(4);
  expect(undo.FetchTable(0)).toBe(null);
  expect(undo.FetchTable(2)).toBe(null);
  expect(undo.GetValue(new ScAddress(0, 0, 1))).toBe(0);
  const table = undo.FetchTable(3) as ScTable;
  table.SetColWidth(0, 666);
  expect(table.GetColWidth(0)).toBe(666);
  marks.SelectTable(1, false);
  marks.SelectTable(3, false);
  undo.InitUndoSelected(source, marks);
  expect(undo.GetTableCount()).toBe(1);
  expect(undo.FetchTable(0)).toBe(null);
  undo.Dispose();
  source.Dispose();
});
it("retains pooled strings and copied compiled formulas after closing the source", /** Undo ownership borrows genuine pools but owns its actual copied payloads. @returns Nothing. */ () => {
  const source = new ScDocument(),
    undo = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO);
  source.InsertTab(0, unicode("Data"));
  source.SetFormula(new ScAddress(), unicode("=1+2"), grammar);
  const formula = source.GetFormulaCell(new ScAddress()) as ScFormulaCell;
  expect(formula.GetValue()).toBe(3);
  undo.InitUndo(source, 0, 0);
  undo.SetFormulaCell(new ScAddress(), new ScFormulaCell(formula, undo, new ScAddress()));
  undo.SetTextCell(new ScAddress(1, 0, 0), unicode("retained"));
  source.Dispose();
  expect(undo.GetValue(new ScAddress())).toBe(3);
  const string = undo.GetSharedString(new ScAddress(1, 0, 0));
  expect(text(string.getString())).toBe("retained");
  string.dispose();
  undo.InitUndoSelected(undo, new ScMarkData(undo.GetSheetLimits()));
  expect(undo.GetTableCount()).toBe(1);
  expect(undo.FetchTable(0)).toBe(null);
  undo.Dispose();
});
it("preserves native normal-document diagnostic no-ops", /** Wrong-mode initialization cannot clear ordinary content. @returns Nothing. */ () => {
  const source = new ScDocument(),
    normal = new ScDocument();
  source.InsertTab(0, unicode("Source"));
  normal.InsertTab(0, unicode("Data"));
  normal.SetValue(new ScAddress(), 17);
  normal.InitUndo(source, 0, 2);
  normal.AddUndoTab(0, 2);
  normal.InitUndoSelected(source, new ScMarkData(source.GetSheetLimits()));
  expect(normal.GetTableCount()).toBe(1);
  expect(normal.GetValue(new ScAddress())).toBe(17);
  normal.Dispose();
  source.Dispose();
});
it("copies geometry only when both source and destination actually own the corresponding stores", /** Native CopyToTable pointer guards apply independently to rows and columns. @returns Nothing. */ () => {
  const source = new ScDocument(),
    undo = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO);
  source.InsertTab(0, unicode("Data"));
  const table = source.FetchTable(0) as ScTable;
  table.SetColWidth(0, 444);
  table.SetColHidden(0, 0, true);
  table.SetRowHeightOnly(0, 1, 555);
  table.SetRowHidden(0, 0, true);
  for (const [cols, rows] of [
    [false, false],
    [true, false],
    [false, true],
  ] as const) {
    undo.InitUndo(source, 0, 0, cols, rows);
    const destination = undo.FetchTable(0) as ScTable;
    table.CopyToTable(
      new CopyToDocContext(undo),
      0,
      0,
      source.MaxCol(),
      source.MaxRow(),
      InsertDeleteFlags.NONE,
      false,
      destination,
      null,
      false,
      true,
      ScCloneFlags.Default,
      true,
    );
    expect(destination.GetColWidth(0, false)).toBe(cols ? 444 : destination.GetColWidth(-1));
    expect(destination.GetRowHeight(0, false)).toBe(
      rows ? 555 : destination.GetOptimalMinRowHeight(),
    );
    destination.CopyToTable(
      new CopyToDocContext(source),
      0,
      0,
      source.MaxCol(),
      source.MaxRow(),
      InsertDeleteFlags.NONE,
      false,
      table,
      null,
      false,
      true,
      ScCloneFlags.Default,
      true,
    );
  }
  undo.Dispose();
  source.Dispose();
});

it("uses native scalar/range row-height overloads and absent-store fallbacks", /** Actual height/hidden segments determine sums,including empty and invalid intervals. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    undo = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO);
  doc.InsertTab(0, unicode("Rows"));
  undo.InitUndo(doc, 0, 0);
  const table = doc.FetchTable(0) as ScTable,
    missing = undo.FetchTable(0) as ScTable;
  doc.SetRowHeightOnly(0, 2, 0, 300);
  doc.SetRowHeightOnly(0, 2, 9, 999);
  table.SetRowHidden(1, 1, true);
  expect(table.GetRowHeight(0, 2)).toBe(600);
  expect(table.GetRowHeight(0, 2, false)).toBe(900);
  expect(table.GetRowHeight(1, true)).toBe(0);
  expect(table.GetRowHeight(1, false)).toBe(300);
  expect(table.GetRowHeight(2, 1)).toBe(0);
  expect(table.GetRowHeight(-1, 1)).toBe(3 * table.GetOptimalMinRowHeight());
  expect(table.GetRowHeight(0, doc.MaxRow() + 1)).toBe(
    (doc.MaxRow() + 2) * table.GetOptimalMinRowHeight(),
  );
  expect(missing.GetRowHeight(0, 2)).toBe(3 * missing.GetOptimalMinRowHeight());
  undo.Dispose();
  doc.Dispose();
});
it("validates native table-copy endpoints before touching destination payload or geometry", /** The source API receives its real context and original policy arguments. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    undo = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO);
  doc.InsertTab(0, unicode("Data"));
  undo.InitUndo(doc, 0, 0);
  const source = doc.FetchTable(0) as ScTable,
    target = undo.FetchTable(0) as ScTable,
    context = new CopyToDocContext(undo);
  undo.SetValue(new ScAddress(), 17);
  for (const [c1, r1, c2, r2] of [
    [-1, 0, 0, 0],
    [0, -1, 0, 0],
    [0, 0, doc.MaxCol() + 1, 0],
    [0, 0, 0, doc.MaxRow() + 1],
  ])
    source.CopyToTable(
      context,
      c1 as number,
      r1 as number,
      c2 as number,
      r2 as number,
      InsertDeleteFlags.CONTENTS,
      false,
      target,
      null,
      false,
      true,
      ScCloneFlags.Default,
      true,
    );
  expect(undo.GetValue(new ScAddress())).toBe(17);
  undo.Dispose();
  doc.Dispose();
});

it("retains native segmented FilterData copy contracts independently of table-copy orchestration", /** Real source segments propagate hidden and filtered flags across actual destination tables. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Source"));
  doc.InsertTab(1, unicode("Target"));
  const source = doc.FetchTable(0) as ScTable,
    target = doc.FetchTable(1) as ScTable;
  source.SetColHidden(0, 0, true);
  source.SetRowHidden(0, 0, true);
  source.getFilterData().setRowFiltered(0, 0, true);
  const input = source.getFilterData(),
    output = target.getFilterData();
  output.copyColHidden(input, 0, 2);
  output.copyRowHidden(input, 0, 2);
  output.copyRowFiltered(input, 0, 2);
  expect([
    target.ColHidden(0),
    target.ColHidden(1),
    target.RowHidden(0),
    target.RowHidden(1),
    output.rowFiltered(0),
    output.rowFiltered(1),
  ]).toEqual([true, false, true, false, true, false]);
  source.SetColHidden(0, 0, false);
  source.SetRowHidden(0, 0, false);
  input.setRowFiltered(0, 0, false);
  output.copyColHidden(input, 0, 2);
  output.copyRowHidden(input, 0, 2);
  output.copyRowFiltered(input, 0, 2);
  expect([target.ColHidden(0), target.RowHidden(0), output.rowFiltered(0)]).toEqual([
    false,
    false,
    false,
  ]);
  doc.Dispose();
});
