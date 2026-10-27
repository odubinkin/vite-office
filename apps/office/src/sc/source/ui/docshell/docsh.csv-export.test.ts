/** @fileoverview Native CSV export contracts for sparse sheets, encoded quotes and formula output. */
import { assert, expect, it } from "vitest";
import { EditTextObjectImpl, TextRotation } from "../../../../editeng/inc/editobj";
import { SvxHorJustifyItem } from "../../../../editeng/inc/justifyitem";
import { SvxCellHorJustify } from "../../../../editeng/inc/svxenum";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import {
  RTL_TEXTENCODING_UNICODE,
  RTL_TEXTENCODING_JIS_X_0201,
  RTL_TEXTENCODING_ISO_2022_JP,
} from "../../../../sal/inc/rtl/textenc";
import { ScAddress } from "../../../inc/address";
import { SvtScriptType } from "../../../../svl/inc/languageoptions";
import { MapUnit } from "../../../../tools/inc/mapunit";
import { ATTR_HOR_JUSTIFY } from "../../../inc/scitems";
import { ScPatternAttr } from "../../core/data/patattr";
import { ScImportOptions } from "../dbgui/imoptdlg";
import { ScDocShell } from "./docsh";

it("retains empty fields between sparse cells and rows in separated output", /** Checks output positions through a complete export. @returns Nothing. */ () => {
  const shell = new ScDocShell();
  try {
    const doc = shell.GetDocument();
    doc.SetTextCell(new ScAddress(1, 0, 0), unicode("A"));
    doc.SetTextCell(new ScAddress(2, 2, 0), unicode("B"));
    doc.SetTextCell(new ScAddress(0, 3, 0), unicode("C"));
    expect(new TextDecoder().decode(shell.AsciiSave())).toBe(",A,\n,,\n,,B\nC,,\n");
    expect(
      /** Rejects a negative sheet index. @returns No stream. */ () =>
        shell.AsciiSave(undefined, -1),
    ).toThrow("CSV sheet is unavailable");
    expect(
      /** Rejects an index beyond the last sheet. @returns No stream. */ () =>
        shell.AsciiSave(undefined, 1),
    ).toThrow("CSV sheet is unavailable");
  } finally {
    shell.Close();
  }
});

it("exports actual multi-paragraph edit cells and releases their owned text on replacement", /** Checks the document-to-column edit-text path and CSV newline escaping. @returns Nothing. */ () => {
  const shell = new ScDocShell();
  try {
    const doc = shell.GetDocument();
    const edit = new EditTextObjectImpl(
      null,
      MapUnit.Map100thMM,
      false,
      TextRotation.NONE,
      SvtScriptType.LATIN,
    );
    for (const line of ["first", "second"]) {
      const value = unicode(line);
      try {
        edit.CreateAndInsertContent().SetText(value);
      } finally {
        value.dispose();
      }
    }
    doc.SetEditText(new ScAddress(), edit);
    const column = doc.FetchTable(0)?.FetchColumn(0);
    assert(column);
    expect(column.GetEditText(0)).toBe(edit);
    expect(column.GetEditText(1)).toBeNull();
    expect(new TextDecoder().decode(shell.AsciiSave())).toBe('"first\nsecond"\n');
    doc.SetValue(new ScAddress(), 42);
    expect(new TextDecoder().decode(shell.AsciiSave())).toBe("42\n");
    const endCol: [number] = [99],
      endRow: [number] = [99];
    expect(doc.GetCellArea(99, endCol, endRow)).toBe(false);
    expect([endCol[0], endRow[0]]).toEqual([0, 0]);
  } finally {
    shell.Close();
  }
});

it("quotes UTF-16 and contextual encodings before writing their stream", /** Checks native Unicode and contextual conversion branches. @returns Nothing. */ () => {
  const shell = new ScDocShell();
  try {
    const doc = shell.GetDocument();
    doc.SetTextCell(new ScAddress(), unicode('A"B,C'));
    for (const encoding of [RTL_TEXTENCODING_UNICODE, RTL_TEXTENCODING_ISO_2022_JP]) {
      const options = new ScImportOptions();
      options.SetTextEncoding(encoding);
      const bytes = shell.AsciiSave(options.BuildString());
      const result =
        encoding === RTL_TEXTENCODING_UNICODE
          ? new TextDecoder("utf-16le").decode(bytes)
          : new TextDecoder().decode(bytes);
      expect(result).toBe('"A""B,C"\n');
      doc.SetTextCell(new ScAddress(), unicode("plain"));
      options.bQuoteAllText = true;
      const all = shell.AsciiSave(options.BuildString());
      expect(
        encoding === RTL_TEXTENCODING_UNICODE
          ? new TextDecoder("utf-16le").decode(all)
          : new TextDecoder().decode(all),
      ).toBe('"plain"\n');
      doc.SetTextCell(new ScAddress(), unicode('A"B,C'));
    }
    // Native JIS X 0201 has no text-to-Unicode callback for CSV delimiter roundtrips.
    const unavailable = new ScImportOptions();
    unavailable.SetTextEncoding(RTL_TEXTENCODING_JIS_X_0201);
    expect(
      /** Preserves the original missing-converter rejection. @returns No CSV stream. */ () =>
        shell.AsciiSave(unavailable.BuildString()),
    ).toThrow("Native text-to-Unicode callback is null.");
  } finally {
    shell.Close();
  }
});

it("exports formula text, errors, numeric results and string results using native options", /** Checks source formula cell dispatch using actual interpreted cells. @returns Nothing. */ () => {
  const shell = new ScDocShell();
  try {
    const doc = shell.GetDocument();
    for (const [col, code] of [
      [0, "=1+2"],
      [1, "=1/0"],
      [2, '="text"'],
    ] as const) {
      doc.SetFormula(new ScAddress(col, 0, 0), unicode(code), FormulaGrammar.Grammar.GRAM_NATIVE);
    }
    const options = new ScImportOptions();
    expect(new TextDecoder().decode(shell.AsciiSave(options.BuildString()))).toBe(
      "3,#DIV/0!,text\n",
    );
    options.bSaveAsShown = true;
    expect(new TextDecoder().decode(shell.AsciiSave(options.BuildString()))).toBe(
      "3,#DIV/0!,text\n",
    );
    options.bSaveFormulas = true;
    expect(new TextDecoder().decode(shell.AsciiSave(options.BuildString()))).toBe(
      '=1+2,=1/0,"=""text"""\n',
    );
  } finally {
    shell.Close();
  }
});

it("clips fixed-width text, hashes overflowing numbers and centers text", /** Checks the existing column widths and native cell alignment. @returns Nothing. */ () => {
  const shell = new ScDocShell();
  try {
    const doc = shell.GetDocument();
    const table = doc.FetchTable(0);
    assert(table);
    for (let col = 0; col < 3; col++) table.SetColWidthOnly(col, 600);
    doc.SetTextCell(new ScAddress(0, 0, 0), unicode("abcdef"));
    doc.SetValue(new ScAddress(1, 0, 0), 123456);
    doc.SetTextCell(new ScAddress(2, 0, 0), unicode("X"));
    const pattern = new ScPatternAttr(doc.getCellAttributeHelper());
    pattern.ItemSetPut(new SvxHorJustifyItem(SvxCellHorJustify.Center, ATTR_HOR_JUSTIFY));
    doc.ApplyPatternAreaTab(2, 0, 2, 0, 0, pattern);
    const options = new ScImportOptions();
    options.bFixedWidth = true;
    expect(new TextDecoder().decode(shell.AsciiSave(options.BuildString()))).toBe(
      "abcde  ###  X  \n",
    );
  } finally {
    shell.Close();
  }
});
