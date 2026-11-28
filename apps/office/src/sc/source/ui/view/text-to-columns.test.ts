/** @fileoverview Text to Columns source admission and unquoted export using native Calc owners. */
import { expect, it } from "vitest";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ScAddress, ScRange } from "../../../inc/address";
import { CellType } from "../../../inc/global";
import { ScAsciiOptions } from "../dbgui/asciiopt";
import { ScDocShell } from "../docshell/docsh";
import { ScImportExport } from "../docshell/impex";
import { ScTabViewShell } from "../inc/tabvwsh";
import { GetTextToColumnsRange } from "./cellsh2";

it("admits only the native cursor or populated single-column mark and shrinks whole-column selection", /** Admits only the native cursor or populated single-column mark and shrinks whole-column selection. @returns Nothing. */ () => {
  const shell = new ScDocShell();
  try {
    const doc = shell.GetDocument();
    const view = new ScTabViewShell(shell).GetViewData();
    const marks = view.GetMarkData();
    const range = new ScRange();
    expect(GetTextToColumnsRange(view, range, true)).toBe(false);
    doc.SetValue(new ScAddress(2, 4, 0), 11);
    doc.SetValue(new ScAddress(2, 9, 0), 24);
    doc.SetValue(new ScAddress(3, 11, 0), 9);
    view.SetCurX(2);
    view.SetCurY(4);
    expect(GetTextToColumnsRange(view, range, true)).toBe(true);
    expect(range.GetVars()).toEqual([2, 4, 0, 2, 4, 0]);
    marks.SetMarkArea(new ScRange(2, 0, 0, 3, doc.MaxRow(), 0));
    expect(GetTextToColumnsRange(view, range, true)).toBe(false);
    marks.SetMarkArea(new ScRange(2, 0, 0, 2, doc.MaxRow(), 0));
    expect(GetTextToColumnsRange(view, range, true)).toBe(true);
    expect(range.aEnd.Row()).toBe(doc.MaxRow());
    expect(GetTextToColumnsRange(view, range, false)).toBe(true);
    expect(range.GetVars()).toEqual([2, 4, 0, 2, 9, 0]);
    marks.SetMarkArea(new ScRange(2, 5, 0, 2, 7, 0));
    expect(GetTextToColumnsRange(view, range, true)).toBe(false);
    marks.ResetMark();
    marks.SetMultiMarkArea(new ScRange(2, 4, 0, 2, 4, 0));
    marks.SetMultiMarkArea(new ScRange(2, 9, 0, 2, 9, 0));
    expect(GetTextToColumnsRange(view, range, false)).toBe(true);
    expect(range.GetVars()).toEqual([2, 4, 0, 2, 4, 0]);
  } finally {
    shell.Close();
  }
});

it("exports the selected data with raw delimiters, internal empty rows and the source line ending", /** Exports the selected data with raw delimiters, internal empty rows and the source line ending. @returns Nothing. */ () => {
  const shell = new ScDocShell();
  const first = unicode('alpha\t"beta"'),
    last = unicode("gamma;delta");
  try {
    const doc = shell.GetDocument();
    doc.SetString(new ScAddress(0, 1, 0), first);
    doc.SetString(new ScAddress(0, 3, 0), last);
    const exporter = new ScImportExport(doc);
    expect(exporter.ExportTextToColumns(new ScRange(0, 1, 0, 0, 3, 0))).toBe(
      'alpha\t"beta"\n\ngamma;delta\n',
    );
    expect(exporter.ExportTextToColumns(new ScRange(0, 1, 0, 0, 1, 0))).toBe('alpha\t"beta"');
  } finally {
    last.dispose();
    first.dispose();
    shell.Close();
  }
});

it("uses native editing setters for overwriting without clearing cells outside parsed fields", /** Uses native editing setters for overwriting without clearing cells outside parsed fields. @returns Nothing. */ () => {
  const shell = new ScDocShell();
  const formula = unicode("=A1+1");
  try {
    const doc = shell.GetDocument();
    const a1 = new ScAddress(0, 0, 0),
      b1 = new ScAddress(1, 0, 0),
      b2 = new ScAddress(1, 1, 0),
      d1 = new ScAddress(3, 0, 0);
    doc.SetValue(a1, 1);
    doc.SetValue(b1, 80);
    doc.SetValue(b2, 90);
    doc.SetFormula(d1, formula, doc.GetGrammar());
    expect(doc.GetValue(d1)).toBe(2);
    const converter = new ScImportExport(doc, a1);
    const options = new ScAsciiOptions();
    options.aFieldSeps = ",";
    converter.SetExtOptions(options);
    converter.SetOverwriting(true);
    expect(converter.ImportStream(new TextEncoder().encode("2,,8\n4\n"))).toBe(true);
    expect(doc.GetCellType(b1)).toBe(CellType.CELLTYPE_NONE);
    expect(doc.GetValue(b2)).toBe(90);
    expect(doc.GetValue(d1)).toBe(3);
  } finally {
    formula.dispose();
    shell.Close();
  }
});
