/** @fileoverview Native raw import sheet/date setup, cached cell reads and numeric/shared-string-only fill-down on actual column stores. */
import { assert, expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScDocumentImport } from "../../../inc/documentimport";
import { ScAddress } from "../../../inc/address";
import { ColumnBlockPosition } from "../../../inc/mtvelements";
import { CellType } from "../../../inc/global";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import {
  FormulaError,
  GetDoubleErrorValue,
  CreateDoubleError,
} from "../../../../formula/inc/errorcodes";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { SvtScriptType } from "../../../../svl/inc/languageoptions";
/** Actual imported workbook owner with two directly appended sheets. @returns Native owners. */
function fixture(): { doc: ScDocument; importer: ScDocumentImport } {
  const doc = new ScDocument(),
    importer = new ScDocumentImport(doc);
  for (const label of ["Data", "Second 字"]) {
    const name = unicode(label);
    try {
      expect(importer.appendSheet(name)).toBe(true);
    } finally {
      name.dispose();
    }
  }
  importer.initForSheets();
  return { doc, importer };
}
it("appends source import sheets and sets document-origin options without a normal edit transaction", /** Dates and sheet names belong to the actual document rather than a workbook facade. @returns Nothing. */ () => {
  const { doc, importer } = fixture(),
    name = unicode("later"),
    output = unicode("");
  try {
    expect(importer.getSheetCount()).toBe(2);
    expect(doc.GetTableCount()).toBe(2);
    expect(doc.GetName(1, output)).toBe(true);
    expect(text(output)).toBe("Second 字");
    importer.setOriginDate(1904, 1, 1);
    const day: [number] = [0],
      month: [number] = [0],
      year: [number] = [0];
    doc.GetDocOptions().GetDate(day, month, year);
    expect([day[0], month[0], year[0]]).toEqual([1, 1, 1904]);
    expect(importer.appendSheet(name)).toBe(true);
    importer.initForSheets();
    importer.setNumericCell(new ScAddress(2, 4, 2), 9);
    importer.finalize();
    expect(importer.getSheetCount()).toBe(3);
    expect(doc.GetValue(new ScAddress(2, 4, 2))).toBe(9);
  } finally {
    output.dispose();
    name.dispose();
    doc.Dispose();
  }
});
it.each([42, -0, CreateDoubleError(FormulaError.DivisionByZero)])(
  "fills a numeric import block with native scalar bits %s",
  /** Bulk insertion preserves NaN error payloads and defers text metadata. @param value - Source value. @returns Nothing. */ (
    value,
  ) => {
    const { doc, importer } = fixture(),
      pos = new ScAddress(2, 3, 0);
    try {
      importer.setNumericCell(pos, value);
      importer.fillDownCells(pos, 3);
      const column = doc.FetchTable(0)?.FetchColumn(2);
      assert(column);
      for (let row = 3; row <= 6; ++row) {
        const actual = doc.GetRefCellValue(new ScAddress(2, row, 0)).getDouble();
        if (Number.isNaN(value))
          expect(GetDoubleErrorValue(actual)).toBe(FormulaError.DivisionByZero);
        else expect(Object.is(actual, value)).toBe(true);
        expect(column.GetCellTextAttr(row)).toBeNull();
      }
      importer.setDefaultNumericScript(SvtScriptType.LATIN);
      importer.finalize();
      for (let row = 3; row <= 6; ++row)
        expect(column.GetCellTextAttr(row)?.mnScriptType).toBe(SvtScriptType.LATIN);
      expect(doc.GetCellType(new ScAddress(2, 7, 0))).toBe(CellType.CELLTYPE_NONE);
    } finally {
      doc.Dispose();
    }
  },
);
it.each(["copied 字", ""])(
  "fills shared strings including empty native string %s",
  /** Range insertion owns independent SharedString values after its source is replaced. @param value - Source text. @returns Nothing. */ (
    value,
  ) => {
    const { doc, importer } = fixture(),
      input = unicode(value),
      replacement = unicode("new"),
      pos = new ScAddress(1, 2, 1);
    try {
      importer.setStringCell(pos, input);
      importer.fillDownCells(pos, 2);
      importer.setStringCell(pos, replacement);
      for (const row of [3, 4]) {
        const cell = new ScAddress(1, row, 1);
        expect(doc.GetCellType(cell)).toBe(CellType.CELLTYPE_STRING);
        expect(text(doc.GetSharedString(cell).getString())).toBe(value);
      }
      importer.finalize();
      expect(text(doc.GetSharedString(pos).getString())).toBe("new");
    } finally {
      replacement.dispose();
      input.dispose();
      doc.Dispose();
    }
  },
);
it("keeps zero fill, empty/formula sources and missing destinations on their source no-op routes", /** Actual existing cells prove no unintended fill or target allocation. @returns Nothing. */ () => {
  const { doc, importer } = fixture(),
    formula = unicode("=7"),
    pos = new ScAddress();
  try {
    importer.setNumericCell(pos, 5);
    importer.fillDownCells(pos, 0);
    importer.fillDownCells(new ScAddress(2, 0, 0), 2);
    importer.setFormulaCell(new ScAddress(1, 0, 0), formula, FormulaGrammar.Grammar.GRAM_NATIVE);
    importer.fillDownCells(new ScAddress(1, 0, 0), 2);
    importer.fillDownCells(new ScAddress(0, 0, 99), 2);
    importer.fillDownCells(new ScAddress(doc.MaxCol() + 1, 0, 0), 2);
    expect(doc.GetCellType(new ScAddress(0, 1, 0))).toBe(CellType.CELLTYPE_NONE);
    expect(doc.GetCellType(new ScAddress(1, 1, 0))).toBe(CellType.CELLTYPE_NONE);
    expect(doc.GetCellType(new ScAddress(2, 1, 0))).toBe(CellType.CELLTYPE_NONE);
    importer.setNumericCell(new ScAddress(0, 1, 0), 8);
    importer.finalize();
    expect(doc.GetValue(new ScAddress(0, 1, 0))).toBe(8);
  } finally {
    formula.dispose();
    doc.Dispose();
  }
});
it("updates the original mutable column block hint while returning a borrowed cell", /** The native hinted overload shares no extra store or copied value owner. @returns Nothing. */ () => {
  const { doc, importer } = fixture();
  try {
    importer.setNumericCell(new ScAddress(1, 7, 0), 42);
    const column = doc.FetchTable(0)?.FetchColumn(1),
      block = new ColumnBlockPosition();
    assert(column);
    column.InitBlockPosition(block);
    const value = column.GetCellValue(block, 7);
    expect(value.getDouble()).toBe(42);
    expect(block.miCellPos?.get().type).toBe(column.GetCellStore().position(7).first.get().type);
    expect(column.GetCellValue(7).getDouble()).toBe(42);
  } finally {
    doc.Dispose();
  }
});
