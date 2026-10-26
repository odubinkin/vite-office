/** @fileoverview Native input-line formatting preserves owned text and original formula/error dispatch. */
import { assert, expect, it, vi } from "vitest";
import { EditTextObjectImpl, TextRotation } from "../../../../editeng/inc/editobj";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { SvtScriptType } from "../../../../svl/inc/languageoptions";
import { SvNumFormatType } from "../../../../svl/inc/zforlist";
import { SvNumberformat } from "../../../../svl/source/numbers/zformat";
import { MapUnit } from "../../../../tools/inc/mapunit";
import { Color } from "../../../../tools/inc/color";
import { ScAddress } from "../../../inc/address";
import { ScRefCellValue } from "../../../inc/cellvalue";
import { ScDocument } from "../../../inc/document";
import { ScFormulaCell } from "../../../inc/formulacell";
import { ScEmptyCellToken } from "../../../inc/token";
import { CellType } from "../../../inc/global";
import { ScCellFormat } from "./cellform";

it("keeps the upstream typed-null edit pointer input empty", /** Projects the native EDIT tag at the borrowed getter boundary because the JavaScript null constructor selects the string overload. The actual null getter and formatter remain unchanged. @returns Nothing. */ () => {
  const doc = new ScDocument();
  const cell = new ScRefCellValue();
  const tag = vi.spyOn(cell, "getType").mockReturnValue(CellType.CELLTYPE_EDIT);
  try {
    expect(cell.getEditText()).toBeNull();
    const result = ScCellFormat.GetInputString(cell, 0, null, doc);
    try {
      expect(result.isEmpty()).toBe(true);
    } finally {
      result.dispose();
    }
  } finally {
    tag.mockRestore();
    doc.Dispose();
  }
});

it("returns independently owned plain, rich and numeric input text", /** Checks actual cell alternatives while replacing their source storage after formatting. @returns Nothing. */ () => {
  const doc = new ScDocument();
  const name = unicode("Data");
  doc.InsertTab(0, name);
  name.dispose();
  try {
    const literal = unicode("Plain");
    doc.SetTextCell(new ScAddress(), literal);
    literal.dispose();
    const plain = ScCellFormat.GetInputString(
      new ScRefCellValue(doc, new ScAddress()),
      0,
      null,
      doc,
    );
    doc.SetValue(new ScAddress(), 1);
    try {
      expect(text(plain)).toBe("Plain");
    } finally {
      plain.dispose();
    }
    const edit = new EditTextObjectImpl(
      null,
      MapUnit.Map100thMM,
      false,
      TextRotation.NONE,
      SvtScriptType.LATIN,
    );
    for (const line of ["First", "Second"]) {
      const value = unicode(line);
      try {
        edit.CreateAndInsertContent().SetText(value);
      } finally {
        value.dispose();
      }
    }
    doc.SetEditText(new ScAddress(), edit);
    const rich = ScCellFormat.GetInputString(
      new ScRefCellValue(doc, new ScAddress()),
      0,
      null,
      doc,
    );
    doc.SetEmptyCell(new ScAddress());
    try {
      expect(text(rich)).toBe("First\nSecond");
    } finally {
      rich.dispose();
    }
    const numeric = ScCellFormat.GetInputString(
      new ScRefCellValue(1.2345),
      0,
      doc.GetNonThreadedContext(),
      doc,
    );
    try {
      expect(text(numeric)).toBe("1.2345");
    } finally {
      numeric.dispose();
    }
    const empty = ScCellFormat.GetInputString(new ScRefCellValue(), 0, null, doc);
    try {
      expect(empty.isEmpty()).toBe(true);
    } finally {
      empty.dispose();
    }
  } finally {
    doc.Dispose();
  }
});

it("formats numeric and string formulas while keeping empty or erroneous input results blank", /** Checks real formula evaluation and original empty-result/error ordering. @returns Nothing. */ () => {
  const doc = new ScDocument();
  try {
    for (const [source, expected] of [
      ["=1+2", "3"],
      ['="abc"', "abc"],
      ["=1/0", ""],
    ] as const) {
      const code = unicode(source);
      const cell = new ScFormulaCell(
        doc,
        new ScAddress(),
        code,
        FormulaGrammar.Grammar.GRAM_NATIVE,
      );
      code.dispose();
      try {
        const result = ScCellFormat.GetInputString(new ScRefCellValue(cell), 0, null, doc);
        try {
          expect(text(result), source).toBe(expected);
        } finally {
          result.dispose();
        }
      } finally {
        cell.Dispose();
      }
    }
    const code = unicode("=1");
    const cell = new ScFormulaCell(doc, new ScAddress(), code, FormulaGrammar.Grammar.GRAM_NATIVE);
    code.dispose();
    try {
      cell.GetValue();
      cell.SetResultToken(new ScEmptyCellToken(false, true));
      const empty = ScCellFormat.GetInputString(new ScRefCellValue(cell), 0, null, doc);
      try {
        expect(empty.isEmpty()).toBe(true);
      } finally {
        empty.dispose();
      }
      cell.GetCode().SetCodeError(FormulaError.NoName);
      const error = ScCellFormat.GetInputString(new ScRefCellValue(cell), 0, null, doc);
      try {
        expect(error.isEmpty()).toBe(true);
      } finally {
        error.dispose();
      }
    } finally {
      cell.Dispose();
    }
  } finally {
    doc.Dispose();
  }
});

it("propagates native formatter failure after resetting the color output", /** Checks the existing numeric formatting boundary for an unrepresented output format. @returns Nothing. */ () => {
  const doc = new ScDocument();
  try {
    const entry = doc.GetFormatTable().GetEntry(0) as SvNumberformat | null;
    assert(entry);
    entry.SetType(SvNumFormatType.CURRENCY);
    const color: [Color | null] = [new Color(0x123456)];
    expect(
      /** Runs original display formatting through the actual interpreter context. @returns No output. */ () =>
        ScCellFormat.GetString(new ScRefCellValue(1), 0, color, null, doc),
    ).toThrow("SvNumberformat nonstandard output is not implemented");
    expect(color[0]).toBeNull();
  } finally {
    doc.Dispose();
  }
});
