/** @fileoverview Native import write/finalize lifecycle against actual Calc stores and formula listeners. */
import { assert, expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScDocumentImport } from "../../../inc/documentimport";
import { ScAddress } from "../../../inc/address";
import { TableColumnBlockPositionSet } from "../../../inc/mtvelements";
import { CellType } from "../../../inc/global";
import { TEXTWIDTH_DIRTY } from "../../../inc/globalnames";
import { SvtScriptType } from "../../../../svl/inc/languageoptions";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { EditTextObjectImpl, TextRotation } from "../../../../editeng/inc/editobj";
import { MapUnit } from "../../../../tools/inc/mapunit";

it("transfers the actual edit object and initializes its metadata after import", () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Sheet1"));
  const importer = new ScDocumentImport(doc),
    edit = new EditTextObjectImpl(
      null,
      MapUnit.Map100thMM,
      false,
      TextRotation.NONE,
      SvtScriptType.LATIN,
    ),
    value = unicode("imported");
  try {
    edit.CreateAndInsertContent().SetText(value);
  } finally {
    value.dispose();
  }
  importer.setEditCell(new ScAddress(), edit);
  expect(doc.GetRefCellValue(new ScAddress()).getEditText()).toBe(edit);
  expect(doc.FetchTable(0)?.FetchColumn(0)?.GetCellTextAttr(0)).toBeNull();
  importer.finalize();
  expect(doc.GetCellType(new ScAddress())).toBe(CellType.CELLTYPE_EDIT);
  expect(doc.FetchTable(0)?.FetchColumn(0)?.GetCellTextAttr(0)?.mnTextWidth).toBe(TEXTWIDTH_DIRTY);
});

it("initializes sparse imported metadata only on finalize and preserves the configured numeric script", () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Sheet1"));
  const importer = new ScDocumentImport(doc);
  importer.initForSheets();
  importer.setDefaultNumericScript(SvtScriptType.LATIN);
  importer.setNumericCell(new ScAddress(1, 3, 0), 42);
  const value = unicode("literal");
  try {
    importer.setStringCell(new ScAddress(1, 5, 0), value);
  } finally {
    value.dispose();
  }
  const column = doc.FetchTable(0)?.FetchColumn(1);
  assert(column);
  expect(column.GetCellTextAttr(3)).toBeNull();
  expect(column.GetCellTextAttr(5)).toBeNull();
  expect(doc.GetValue(new ScAddress(1, 3, 0))).toBe(42);
  importer.finalize();
  expect(column.GetCellTextAttr(2)).toBeNull();
  expect(column.GetCellTextAttr(4)).toBeNull();
  expect(column.GetCellTextAttr(3)?.mnTextWidth).toBe(TEXTWIDTH_DIRTY);
  expect(column.GetCellTextAttr(3)?.mnScriptType).toBe(SvtScriptType.LATIN);
  expect(column.GetCellTextAttr(5)?.mnScriptType).toBe(SvtScriptType.UNKNOWN);
  expect(text(doc.GetSharedString(new ScAddress(1, 5, 0)).getString())).toBe("literal");
});

it("defers formula listeners until finalize then groups relative formulas and reacts to later edits", () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Sheet1"));
  const importer = new ScDocumentImport(doc);
  for (let row = 0; row < 2; row++) {
    const formula = unicode(`=A${row + 1}*2`);
    try {
      importer.setFormulaCell(
        new ScAddress(1, row, 0),
        formula,
        FormulaGrammar.Grammar.GRAM_NATIVE,
      );
    } finally {
      formula.dispose();
    }
    importer.setNumericCell(new ScAddress(0, row, 0), row + 1);
  }
  expect(doc.GetBroadcaster(new ScAddress())).toBeNull();
  expect(doc.GetBroadcaster(new ScAddress(0, 1, 0))).toBeNull();
  importer.finalize();
  const top = doc.GetFormulaCell(new ScAddress(1, 0, 0));
  assert(top);
  expect(top.IsSharedTop()).toBe(true);
  expect(top.GetSharedLength()).toBe(2);
  expect(doc.GetBroadcaster(new ScAddress())).not.toBeNull();
  expect(doc.GetValue(new ScAddress(1, 0, 0))).toBe(2);
  expect(doc.GetValue(new ScAddress(1, 1, 0))).toBe(4);
  doc.SetValue(new ScAddress(), 7);
  expect(doc.GetValue(new ScAddress(1, 0, 0))).toBe(14);
  expect(doc.GetValue(new ScAddress(1, 1, 0))).toBe(4);
});

it("keeps empty imported strings as string cells and ignores absent target sheets", () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Sheet1"));
  const importer = new ScDocumentImport(doc),
    value = unicode("");
  try {
    importer.setStringCell(new ScAddress(), value);
    importer.setNumericCell(new ScAddress(0, 0, 1), 9);
  } finally {
    value.dispose();
  }
  importer.finalize();
  expect(doc.GetCellType(new ScAddress())).toBe(CellType.CELLTYPE_STRING);
  expect(doc.GetTableCount()).toBe(1);
});

it("reuses one-sheet block positions until explicitly invalidated", () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Sheet1"));
  const positions = new TableColumnBlockPositionSet(doc, 0),
    first = positions.getBlockPosition(2);
  assert(first);
  expect(positions.getBlockPosition(2)).toBe(first);
  expect(first.miCellPos).toBeDefined();
  positions.invalidate();
  expect(positions.getBlockPosition(2)).not.toBe(first);
  expect(() => new TableColumnBlockPositionSet(doc, 1)).toThrow("Passed table index 1 is invalid.");
});
