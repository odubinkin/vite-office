/** @fileoverview Original automatic-input policy, number-format overwrite and formula ownership on actual document stores. */
import { afterEach, assert, expect, it } from "vitest";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { FormulaByteToken } from "../../../../formula/inc/token";
import { OpCode } from "../../../../formula/inc/opcode";
import { SvNumFormatType as T, NfEvalDateFormat } from "../../../../svl/inc/zforlist";
import { ScAddress } from "../../../inc/address";
import { ScDocument } from "../../../inc/document";
import { ScDocumentImport } from "../../../inc/documentimport";
import { ScSetStringParam } from "../../../inc/stringutil";
import { CellType } from "../../../inc/global";
import { ScCellValue } from "../../../inc/cellvalue";
import { ScFormulaCell } from "../../../inc/formulacell";
import { ScTokenArray } from "../../../inc/tokenarray";
const documents: ScDocument[] = [];
afterEach(
  /** Releases actual fixture documents. @returns Nothing. */ () => {
    for (const document of documents.splice(0)) document.Dispose();
  },
);
/** Real document and import owner. @returns Fixture owners. */
function fixture() {
  const document = new ScDocument(),
    name = unicode("Input");
  documents.push(document);
  try {
    document.InsertTab(0, name);
  } finally {
    name.dispose();
  }
  return { document, importer: new ScDocumentImport(document), position: new ScAddress() };
}
/** Original import caller requires explicit link-check admission for supplied policies. @returns Actual policy. */
function policy(): ScSetStringParam {
  const result = new ScSetStringParam();
  result.mbCheckLinkFormula = true;
  return result;
}
/** Supplies an original input owner and finalizes actual metadata/listeners. @param importer - Real importer. @param input - Input text. @param parameter - Original optional policy. @returns Nothing. */
function enter(
  importer: ScDocumentImport,
  input: string,
  parameter: ScSetStringParam | null = null,
): void {
  const value = unicode(input);
  try {
    importer.setAutoInput(new ScAddress(), value, parameter);
    importer.finalize();
  } finally {
    value.dispose();
  }
}
it.each([false, true])(
  "applies native special-number policy %s with actual format attributes",
  /** False forces detected special numbers to Text; true stores value and format. @param detect - Detection flag. @returns Nothing. */ (
    detect,
  ) => {
    const { document, importer, position } = fixture(),
      parameter = policy();
    parameter.mbDetectNumberFormat = detect;
    parameter.meSetTextNumFormat = ScSetStringParam.SpecialNumberOnly;
    enter(importer, "12.5%", parameter);
    expect(document.GetCellType(position)).toBe(
      detect ? CellType.CELLTYPE_VALUE : CellType.CELLTYPE_STRING,
    );
    const key = document.GetPattern(position)?.GetNumberFormat(document.GetFormatTable()) as number;
    expect(document.GetFormatTable().GetType(key)).toBe(detect ? T.PERCENT : T.TEXT);
    if (detect) expect(document.GetValue(position)).toBe(0.125);
  },
);
it("retains the original apostrophe default and the explicit import override", /** The same real cell switches between numeric-looking text values without CSV-specific stripping. @returns Nothing. */ () => {
  const { document, importer, position } = fixture();
  enter(importer, "'12");
  let value = document.GetSharedString(position);
  try {
    expect(text(value.getString())).toBe("12");
  } finally {
    value.dispose();
  }
  const parameter = policy();
  parameter.mbHandleApostrophe = false;
  enter(importer, "'12", parameter);
  value = document.GetSharedString(position);
  try {
    expect(text(value.getString())).toBe("'12");
  } finally {
    value.dispose();
  }
});
it("preserves a nonstandard numeric format but lets Boolean replace it", /** Source overwrites only selected standard categories, with an unconditional Boolean exception. @returns Nothing. */ () => {
  const { document, importer, position } = fixture();
  document.SetNumberFormat(position, 1);
  enter(importer, "12.5%");
  expect(document.GetValue(position)).toBe(0.125);
  expect(document.GetPattern(position)?.GetNumberFormat(document.GetFormatTable())).toBe(1);
  enter(importer, "TRUE");
  expect(document.GetValue(position)).toBe(1);
  expect(document.GetPattern(position)?.GetNumberFormat(document.GetFormatTable())).toBe(99);
});
it("retains an actual ISO date display format and restores date-evaluation policy", /** Actual VALUE content triggers the source edit-date branch. @returns Nothing. */ () => {
  const { document, importer, position } = fixture(),
    formatter = document.GetFormatTable();
  document.SetValue(position, 45657);
  document.SetNumberFormat(position, 49);
  formatter.SetEvalDateFormat(NfEvalDateFormat.InternationalThenFormat);
  enter(importer, "2025-01-02");
  expect(document.GetValue(position)).toBe(45659);
  expect(document.GetPattern(position)?.GetNumberFormat(formatter)).toBe(49);
  expect(formatter.GetEvalDateFormat()).toBe(NfEvalDateFormat.InternationalThenFormat);
});
it("adopts compiled formulas through real store callbacks and rejects an unchecked explicit policy", /** No formula string reparse or second cell store is substituted. @returns Nothing. */ () => {
  const { document, importer, position } = fixture();
  enter(importer, "=1+2", policy());
  expect(document.GetCellType(position)).toBe(CellType.CELLTYPE_FORMULA);
  expect(document.GetValue(position)).toBe(3);
  const value = unicode("4");
  try {
    expect(
      /** Source explicit-policy assertion. @returns Nothing or native guard. */ () =>
        importer.setAutoInput(position, value, new ScSetStringParam()),
    ).toThrow(/mbCheckLinkFormula/);
  } finally {
    value.dispose();
  }
});
it("preserves pointer-release variant tags and the transferred formula lifetime", /** Source releaseFormula leaves the FORMULA alternative containing null. @returns Nothing. */ () => {
  const { document, position } = fixture(),
    code = unicode("=7"),
    cell = new ScCellValue();
  const formula = new ScFormulaCell(document, position, code, FormulaGrammar.Grammar.GRAM_NATIVE);
  code.dispose();
  try {
    cell.set(formula);
    expect(cell.releaseFormula()).toBe(formula);
    expect(cell.getType()).toBe(CellType.CELLTYPE_FORMULA);
    expect(cell.getFormula()).toBeNull();
    cell.clear();
    expect(formula.GetValue()).toBe(7);
  } finally {
    cell.clear();
    formula.Dispose();
  }
});
it("checks link opcodes in tokenized code while preferring available RPN", /** Actual ScTokenArray methods construct both profiles without calling any external service. @returns Nothing. */ () => {
  const { document, position } = fixture(),
    raw = new ScTokenArray(document),
    source = unicode("=1"),
    formula = new ScFormulaCell(document, position, source, FormulaGrammar.Grammar.GRAM_NATIVE);
  source.dispose();
  try {
    const code = formula.GetCode();
    expect(code.GetCodeLen()).toBeGreaterThan(0);
    code.AddToken(new FormulaByteToken(OpCode.ocDde));
    document.CheckLinkFormulaNeedingCheck(code);
    expect(document.HasLinkFormulaNeedingCheck()).toBe(false);
    raw.AddToken(new FormulaByteToken(OpCode.ocWebservice));
    document.CheckLinkFormulaNeedingCheck(raw);
    expect(document.HasLinkFormulaNeedingCheck()).toBe(true);
  } finally {
    raw.Clear();
    formula.Dispose();
  }
});

import { EditTextObjectImpl, TextRotation } from "../../../../editeng/inc/editobj";
import { SvtScriptType } from "../../../../svl/inc/languageoptions";
import { MapUnit } from "../../../../tools/inc/mapunit";
it("rejects invalid edit-text rows before adopting or normalizing the supplied owner", /** The real column must leave valid cells intact and the rejected rich object owned by its caller. @returns Nothing. */ () => {
  const { document, position } = fixture();
  document.SetValue(position, 17);
  const column = document.FetchTable(0)?.FetchColumn(0),
    value = new EditTextObjectImpl(
      null,
      MapUnit.Map100thMM,
      false,
      TextRotation.NONE,
      SvtScriptType.LATIN,
    ),
    input = unicode("Retained");
  assert(column);
  value.CreateAndInsertContent().SetText(input);
  input.dispose();
  try {
    document.SetValue(position, 17);
    for (const row of [-1, document.MaxRow() + 1]) column.SetEditText(row, value);
    expect(document.GetValue(position)).toBe(17);
    expect(value.GetParagraphCount()).toBe(1);
    const content = value.GetText(0);
    try {
      expect(text(content)).toBe("Retained");
    } finally {
      content.dispose();
    }
  } finally {
    value.dispose();
  }
});
