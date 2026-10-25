/** @fileoverview Real source-token formula output, independent from RPN evaluation or browser UI state. */
import { assert, expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScAddress } from "../../../inc/address";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { ScCompiler } from "../../../inc/compiler";
import { ScSingleRefToken } from "../../../inc/token";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
const grammar = FormulaGrammar.Grammar.GRAM_ODFF;
it("serializes actual code tokens and ODFF references without interpreting or rewriting owners", /** Round-trips through the same real document model. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    pos = new ScAddress(2, 3, 0);
  doc.InsertTab(0, unicode("Data"));
  for (const [source, expected] of [
    ["=1+2*(3-4)/5^2%", "=1+2*(3-4)/5^2%"],
    ["==1+1", "==1+1"],
    ["=+1", "=+1"],
    ["= -1 +\t2 ", "= -1 +\t2"],
    ["=[.$AA$2]+[.B$4]+[.$C8]", "=[.$AA$2]+[.B$4]+[.$C8]"],
    ["=1.2345678901234567", "=1.23456789012346"],
    ["=1e20", "=1E+020"],
    ["=1+(", "=1+()"],
  ] as const) {
    doc.SetFormula(pos, unicode(source), grammar);
    const cell = doc.GetFormulaCell(pos);
    assert(cell);
    const tokens = Array.from(cell.GetCode().Tokens()),
      rpn = Array.from(cell.GetCode().RPNTokens()),
      dirty = cell.GetDirty();
    const out = cell.GetFormula(grammar);
    expect(text(out)).toBe(expected);
    out.dispose();
    expect(Array.from(cell.GetCode().Tokens())).toEqual(tokens);
    expect(Array.from(cell.GetCode().RPNTokens())).toEqual(rpn);
    expect(cell.GetDirty()).toBe(dirty);
  }
  doc.SetFormula(pos, unicode("=[.A1]+1"), grammar);
  const cell = doc.GetFormulaCell(pos);
  assert(cell);
  const token = Array.from(cell.GetCode().Tokens()).find(
    /** Finds the actual reference. @param token - Token. @returns Match. */ (token) =>
      token instanceof ScSingleRefToken,
  ) as ScSingleRefToken;
  cell.EndListeningTo(doc);
  cell.aPos.IncCol();
  expect(text(cell.GetFormula(grammar))).toBe("=[.B1]+1");
  token.GetSingleRef().SetRowDeleted(true);
  expect(text(cell.GetFormula(grammar))).toBe("=[#REF!]+1");
  token.GetSingleRef().InitAddress(-1, 0, 0);
  expect(text(cell.GetFormula(grammar))).toBe("=[#REF!]+1");
  token.GetSingleRef().InitAddress(0, 0, 1);
  expect(
    /** Missing sheet convention rejects. @returns Formula. */ () => cell.GetFormula(grammar),
  ).toThrow(/not implemented/);
  token.GetSingleRef().InitAddress(0, 0, 0);
  token.GetSingleRef().SetFlag3D(true);
  expect(
    /** Missing 3D convention rejects. @returns Formula. */ () => cell.GetFormula(grammar),
  ).toThrow(/not implemented/);
  expect(
    /** Missing localized grammar rejects. @returns Formula. */ () =>
      cell.GetFormula(FormulaGrammar.Grammar.GRAM_NATIVE_XL_A1),
  ).toThrow(/implemented/);
  const compiler = new ScCompiler(doc, pos, grammar),
    empty = compiler.CompileString(unicode("=")),
    output = unicode("old");
  compiler.CreateStringFromTokenArray(output);
  expect(text(output)).toBe("");
  expect(empty.GetLen()).toBe(0);
  doc.SetFormula(pos, unicode("="), grammar);
  const invalid = doc.GetFormulaCell(pos);
  assert(invalid);
  expect(invalid.GetCode().GetCodeError()).toBe(FormulaError.UnknownToken);
  const invalidDirty = invalid.GetDirty();
  const invalidOutput = invalid.GetFormula(grammar);
  expect(text(invalidOutput)).toBe("Err:520");
  invalidOutput.dispose();
  expect(invalid.GetDirty()).toBe(invalidDirty);
});
