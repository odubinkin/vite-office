/** @fileoverview Native ConventionOOO_A1 input/output over the actual Calc formula and dependency owners. */
import { assert, expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScAddress } from "../../../inc/address";
import { ScCompiler } from "../../../inc/compiler";
import { ScSingleRefToken } from "../../../inc/token";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
const G = FormulaGrammar.Grammar;
it("round-trips native A1 references through ODFF without replacing token or dependency owners", /** Exercises source-relative and absolute coordinates with real recalculation. @returns Nothing. */ () => {
  for (const grammar of [G.GRAM_NATIVE, G.GRAM_ENGLISH, G.GRAM_ODFF_A1]) {
    const doc = new ScDocument(),
      position = new ScAddress(2, 3, 0);
    doc.InsertTab(0, unicode("Sheet1"));
    doc.SetValue(new ScAddress(0, 0, 0), 4);
    doc.SetValue(new ScAddress(1, 1, 0), 2);
    doc.SetFormula(position, unicode("=a1+$B$2*2"), grammar);
    let cell = doc.GetFormulaCell(position);
    assert(cell);
    expect(doc.GetValue(position)).toBe(8);
    const tokens = Array.from(cell.GetCode().Tokens()),
      dirty = cell.GetDirty();
    expect(text(cell.GetFormula(grammar))).toBe("=A1+$B$2*2");
    expect(text(cell.GetFormula(G.GRAM_ODFF))).toBe("=[.A1]+[.$B$2]*2");
    expect(Array.from(cell.GetCode().Tokens())).toEqual(tokens);
    expect(cell.GetDirty()).toBe(dirty);
    doc.SetValue(new ScAddress(0, 0, 0), 10);
    expect(doc.GetValue(position)).toBe(14);
    doc.SetFormula(position, unicode("=[.$A1]+[.B$2]"), G.GRAM_ODFF);
    cell = doc.GetFormulaCell(position);
    assert(cell);
    expect(text(cell.GetFormula(grammar))).toBe("=$A1+B$2");
    for (const source of ["=1+2*(3-4)/5^2%", "==1+1", "=+1", "= -1 +\t2 "]) {
      doc.SetFormula(position, unicode(source), grammar);
      cell = doc.GetFormulaCell(position);
      assert(cell);
      expect(text(cell.GetFormula(grammar))).toBe(source.trimEnd());
    }
    doc.SetFormula(position, unicode("=XFD1048576"), grammar);
    cell = doc.GetFormulaCell(position);
    assert(cell);
    expect(text(cell.GetFormula(grammar))).toBe("=XFD1048576");
    const token = cell.GetCode().FirstToken();
    assert(token instanceof ScSingleRefToken);
    token.GetSingleRef().SetRowDeleted(true);
    expect(text(cell.GetFormula(grammar))).toBe("=XFD#REF!");
    token.GetSingleRef().SetRowDeleted(false);
    token.GetSingleRef().SetColDeleted(true);
    expect(text(cell.GetFormula(grammar))).toBe("=#REF!1048576");
    token.GetSingleRef().SetColDeleted(false);
    token.GetSingleRef().InitAddress(-1, 0, 0);
    expect(text(cell.GetFormula(grammar))).toBe("=$#REF!$1");
    token.GetSingleRef().InitAddress(0, -1, 0);
    expect(text(cell.GetFormula(grammar))).toBe("=$A$#REF!");
  }
});
it("rejects unimplemented grammars and semantic reference families without silently converting text", /** No formula syntax is rewritten by a UI adapter. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    pos = new ScAddress(0, 0, 0);
  doc.InsertTab(0, unicode("Sheet1"));
  for (const grammar of [G.GRAM_PODF, G.GRAM_NATIVE_XL_A1, G.GRAM_UNSPECIFIED])
    expect(
      /** Unavailable convention has no implementation. @returns Compiler. */ () =>
        new ScCompiler(doc, pos, grammar),
    ).toThrow(/not implemented/);
  for (const source of ["=[.A1]", "=A1#B2", "=Sheet2.A1", "=UNPORTED(A1)", "=XFE1", "=A1048577"])
    expect(
      /** Unsupported reference families reject. @returns Tokens. */ () =>
        new ScCompiler(doc, pos, G.GRAM_NATIVE).CompileString(unicode(source)),
    ).toThrow(/not implemented/);
});
