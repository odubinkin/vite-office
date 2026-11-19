/** @fileoverview Real import attribute-vector transfer, sparse defaults, merge flags and const formula script hints. */
import { assert, expect, it } from "vitest";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { SvtScriptType } from "../../../../svl/inc/languageoptions";
import { ScAddress } from "../../../inc/address";
import { ScAttrEntry } from "../../../inc/attarray";
import { ScDocument } from "../../../inc/document";
import { ScDocumentImport } from "../../../inc/documentimport";
import { ScMF, ScMergeAttr, ScMergeFlagAttr } from "../../../inc/attrib";
import { ScPatternAttr } from "../../../inc/patattr";
import { ATTR_MERGE, ATTR_MERGE_FLAG } from "../../../inc/scitems";

/** Builds an actual document and import owner. @returns Owners. */
function setup() {
  const doc = new ScDocument(),
    name = unicode("Imported");
  try {
    doc.InsertTab(0, name);
  } finally {
    name.dispose();
  }
  return { doc, importer: new ScDocumentImport(doc) };
}
/** Builds two actual registered runs. @param doc - Document. @param latin - Format hint. @returns Owned vector. */
function attributes(doc: ScDocument, latin = false) {
  const attrs = new ScDocumentImport.Attrs();
  attrs.mbLatinNumFmtOnly = latin;
  for (const [row, height] of [
    [2, 400],
    [doc.MaxRow(), 600],
  ]) {
    const entry = new ScAttrEntry(),
      pattern = new ScPatternAttr(doc.getCellAttributeHelper());
    pattern.ItemSetPut(new SvxFontHeightItem(height as number, 100, 101));
    entry.setScPatternAttr(pattern, true);
    entry.nEndRow = row as number;
    attrs.mvData.push(entry);
  }
  return attrs;
}
/** Reads a real cell pattern. @param doc - Document. @param col - Column. @param row - Row. @returns Pattern. */
function pattern(doc: ScDocument, col: number, row = 0) {
  const value = doc.FetchTable(0)?.GetColumnData(col).GetPattern(row);
  assert(value);
  return value;
}
/** Reads height. @param doc - Document. @param col - Column. @param row - Row. @returns Twips. */
function height(doc: ScDocument, col: number, row = 0) {
  return (pattern(doc, col, row).GetItem(101) as SvxFontHeightItem).GetHeight();
}

it("copies both endpoints and canonical holders, then moves the last vector and replaces existing runs", /** Exercises real registrations and later release. @returns Nothing. */ () => {
  const { doc, importer } = setup(),
    attrs = attributes(doc),
    entry = attrs.mvData[0] as ScAttrEntry,
    copy = new ScAttrEntry(entry);
  expect(copy.equals(entry)).toBe(true);
  expect(copy.getCellAttributeHolder()).not.toBe(entry.getCellAttributeHolder());
  copy.nEndRow++;
  expect(copy.equals(entry)).toBe(false);
  importer.setAttrEntries(0, 1, 3, attrs);
  expect(attrs.mvData).toHaveLength(0);
  for (const col of [1, 2, 3]) {
    expect(height(doc, col, 2)).toBe(400);
    expect(height(doc, col, 3)).toBe(600);
  }
  expect(height(doc, 0)).toBe(200);
  expect(pattern(doc, 1)).toBe(pattern(doc, 3));
  importer.setAttrEntries(0, 3, 3, attributes(doc));
  expect(height(doc, 1, 3)).toBe(600);
  const same = attributes(doc),
    different = attributes(doc, true);
  expect(same.equals(different)).toBe(false);
  different.mbLatinNumFmtOnly = false;
  expect(same.equals(different)).toBe(true);
  different.mvData.pop()?.Dispose();
  expect(same.equals(different)).toBe(false);
  same.Dispose();
  different.Dispose();
  copy.Dispose();
  attrs.Dispose();
});

it("stores full-width attributes in the sparse default column and preserves the earlier allocated prefix", /** Checks both original MaxCol branches and subsequent allocation. @returns Nothing. */ () => {
  const { doc, importer } = setup(),
    table = doc.FetchTable(0);
  assert(table);
  const count = table.GetAllocatedColumnsCount();
  importer.setAttrEntries(0, count + 2, doc.MaxCol(), attributes(doc));
  expect(table.GetAllocatedColumnsCount()).toBe(count + 2);
  expect(height(doc, count + 1)).toBe(200);
  table.CreateColumnIfNotExists(count + 3);
  expect(height(doc, count + 3, 3)).toBe(600);
  importer.setAttrEntries(0, 0, doc.MaxCol(), attributes(doc));
  expect(height(doc, 0)).toBe(400);
  expect(height(doc, count + 3)).toBe(400);
  table.CreateColumnIfNotExists(count + 4);
  expect(height(doc, count + 4, 3)).toBe(600);
});

it("retains rejected vectors and the original reverse-range end-column behavior", /** No normalization or hidden ownership transfer. @returns Nothing. */ () => {
  const { doc, importer } = setup(),
    attrs = attributes(doc);
  importer.setAttrEntries(1, 0, 1, attrs);
  importer.setAttrEntries(0, -1, 1, attrs);
  importer.setAttrEntries(0, 0, doc.MaxCol() + 1, attrs);
  expect(attrs.mvData).toHaveLength(2);
  expect(height(doc, 1)).toBe(200);
  importer.setAttrEntries(0, 3, 1, attrs);
  expect(attrs.mvData).toHaveLength(0);
  expect(height(doc, 1)).toBe(400);
  expect(height(doc, 3)).toBe(200);
});

it("imports merge extents and overlap flags without deleting stored values", /** Uses actual table attribute application. @returns Nothing. */ () => {
  const { doc, importer } = setup();
  importer.setNumericCell(new ScAddress(2, 2, 0), 17);
  importer.setMergedCells(1, 0, 0, 1, 1);
  importer.setMergedCells(0, 1, 1, 3, 3);
  const merge = pattern(doc, 1, 1).GetItem(ATTR_MERGE) as ScMergeAttr;
  expect([merge.GetColMerge(), merge.GetRowMerge()]).toEqual([3, 3]);
  for (const [col, row, flag] of [
    [2, 1, ScMF.Hor],
    [1, 2, ScMF.Ver],
    [2, 2, ScMF.Hor | ScMF.Ver],
  ])
    expect(
      (pattern(doc, col as number, row).GetItem(ATTR_MERGE_FLAG) as ScMergeFlagAttr).GetValue(),
    ).toBe(flag);
  expect(doc.GetValue(new ScAddress(2, 2, 0))).toBe(17);
  importer.setMergedCells(0, 5, 5, 5, 5);
  expect((pattern(doc, 5, 5).GetItem(ATTR_MERGE) as ScMergeAttr).GetColMerge()).toBe(1);
});

it("uses Latin hints for numeric blocks and only already-clean all-numeric formula blocks", /** Const classification must not evaluate dirty cached formulas during finalization. @returns Nothing. */ () => {
  const { doc, importer } = setup();
  importer.setDefaultNumericScript(SvtScriptType.ASIAN);
  importer.setAttrEntries(0, 0, 2, attributes(doc, true));
  importer.setNumericCell(new ScAddress(0, 0, 0), 7);
  importer.setNumericCell(new ScAddress(3, 0, 0), 8);
  for (const [col, row, formula] of [
    [1, 0, "=2"],
    [1, 1, "=3"],
    [2, 0, "=2"],
    [2, 1, '="text"'],
    [0, 2, "=9"],
  ] as const) {
    const input = unicode(formula);
    try {
      importer.setFormulaCell(
        new ScAddress(col, row, 0),
        input,
        FormulaGrammar.Grammar.GRAM_NATIVE,
      );
    } finally {
      input.dispose();
    }
    if (col !== 0) doc.GetFormulaCell(new ScAddress(col, row, 0))?.Interpret();
  }
  importer.finalize();
  expect(doc.FetchTable(0)?.FetchColumn(0)?.GetCellTextAttr(0)?.mnScriptType).toBe(
    SvtScriptType.LATIN,
  );
  expect(doc.FetchTable(0)?.FetchColumn(3)?.GetCellTextAttr(0)?.mnScriptType).toBe(
    SvtScriptType.ASIAN,
  );
  expect(doc.FetchTable(0)?.FetchColumn(1)?.GetCellTextAttr(0)?.mnScriptType).toBe(
    SvtScriptType.LATIN,
  );
  expect(doc.FetchTable(0)?.FetchColumn(2)?.GetCellTextAttr(0)?.mnScriptType).toBe(
    SvtScriptType.UNKNOWN,
  );
  expect(doc.FetchTable(0)?.FetchColumn(0)?.GetCellTextAttr(2)?.mnScriptType).toBe(
    SvtScriptType.UNKNOWN,
  );
  const dirty = doc.GetFormulaCell(new ScAddress(0, 2, 0));
  assert(dirty);
  expect(dirty.GetDirty()).toBe(true);
  expect(dirty.IsValueNoErrorConst()).toBe(false);
  expect(dirty.IsValueNoError()).toBe(true);
});

it("classifies cached numeric results with auto-calc disabled and rejects code errors and strings", /** Exercises original const/mutable overload differences on real formula cells. @returns Nothing. */ () => {
  const { doc, importer } = setup();
  doc.SetAutoCalc(false);
  const formulas = ["=4", '="text"', "=1/0", "=)"];
  for (let col = 0; col < formulas.length; ++col) {
    const input = unicode(formulas[col] as string);
    try {
      importer.setFormulaCell(new ScAddress(col, 0, 0), input, FormulaGrammar.Grammar.GRAM_NATIVE);
    } finally {
      input.dispose();
    }
    const cell = doc.GetFormulaCell(new ScAddress(col, 0, 0));
    assert(cell);
    if (col === 0) {
      cell.SetResultDouble(4);
      expect(cell.GetDirty()).toBe(true);
      expect(cell.IsValueNoErrorConst()).toBe(true);
      expect(cell.IsValueNoError()).toBe(true);
      expect(cell.GetDirty()).toBe(true);
    } else {
      cell.Interpret();
      expect(cell.IsValueNoErrorConst()).toBe(false);
      expect(cell.IsValueNoError()).toBe(false);
    }
  }
});
