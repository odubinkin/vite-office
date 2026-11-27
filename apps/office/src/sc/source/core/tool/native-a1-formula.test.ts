/** @fileoverview Native ConventionOOO_A1 input/output over the actual Calc formula and dependency owners. */
import { assert, expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScAddress } from "../../../inc/address";
import { ScCompiler } from "../../../inc/compiler";
import { ScSingleRefToken } from "../../../inc/token";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { FormulaErrorToken } from "../../../../formula/inc/token";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { OUString } from "../../../../sal/inc/rtl/ustring";
const G = FormulaGrammar.Grammar;

it("retains the valid sheet and deleted coordinate flags on qualified XLSX reference errors", /** Exercises both kinds of XLSX reference error token and native output. @returns Nothing. */ () => {
  const doc = new ScDocument();
  const position = new ScAddress(4, 3, 0);
  const first = unicode("Feuil1");
  const second = unicode("Owner's Rates");
  const unknown = unicode("Feuil1!UnknownName");
  const serialized = new OUString();
  try {
    doc.InsertTab(0, first);
    doc.InsertTab(1, second);
    expect(
      /** Keeps an unknown name distinct from a deleted reference token. @returns Native code. */ () =>
        new ScCompiler(doc, position, G.GRAM_OOXML).CompileString(unknown),
    ).toThrow(/not implemented/u);
    for (const [source, tab] of [
      ["Feuil1!#REF!+2", 0],
      ["'Owner''s Rates'!#REF!+2", 1],
      ["#REF!+2", -1],
    ] as const) {
      const formula = unicode(source);
      const code = new ScCompiler(doc, position, G.GRAM_OOXML).CompileString(formula);
      try {
        const token = code.FirstToken();
        if (tab === -1) {
          assert(token instanceof FormulaErrorToken);
          expect(token.GetError()).toBe(FormulaError.NoRef);
        } else {
          assert(token instanceof ScSingleRefToken);
          const reference = token.GetSingleRef();
          expect(reference.Tab()).toBe(tab);
          expect(reference.IsFlag3D()).toBe(true);
          expect(reference.IsTabRel()).toBe(false);
          expect(reference.IsTabDeleted()).toBe(false);
          expect(reference.IsColRel()).toBe(false);
          expect(reference.IsRowRel()).toBe(false);
          expect(reference.IsColDeleted()).toBe(true);
          expect(reference.IsRowDeleted()).toBe(true);
        }
        new ScCompiler(doc, position, code, G.GRAM_OOXML).CreateStringFromTokenArray(serialized);
        expect(text(serialized)).toBe("#REF!+2");
        new ScCompiler(doc, position, code, G.GRAM_ODFF).CreateStringFromTokenArray(serialized);
        expect(text(serialized)).toBe(tab === -1 ? "#REF!+2" : "[#REF!]+2");
      } finally {
        code.Clear();
        formula.dispose();
      }
    }
  } finally {
    serialized.dispose();
    unknown.dispose();
    second.dispose();
    first.dispose();
    doc.Dispose();
  }
});
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
it("reads pre-OpenFormula MINIFS and writes it in both ODF formula grammars", /** Checks the original formula resource selection around ODF references. @returns Nothing. */ () => {
  const doc = new ScDocument();
  const position = new ScAddress(1, 0);
  const sheet = unicode("Data");
  const formula = unicode("=MINIFS([.A1:.A2];[.A1:.A2];2)");
  try {
    doc.InsertTab(0, sheet);
    doc.SetValue(new ScAddress(0, 0), 2);
    doc.SetValue(new ScAddress(0, 1), 3);
    doc.SetFormula(position, formula, G.GRAM_PODF);
    const cell = doc.GetFormulaCell(position);
    assert(cell);
    expect(doc.GetValue(position)).toBe(2);
    expect(text(cell.GetFormula(G.GRAM_PODF))).toBe("=MINIFS([.A1:.A2];[.A1:.A2];2)");
    expect(text(cell.GetFormula(G.GRAM_ODFF))).toBe("=COM.MICROSOFT.MINIFS([.A1:.A2];[.A1:.A2];2)");
  } finally {
    formula.dispose();
    sheet.dispose();
    doc.Dispose();
  }
});
it("rejects unimplemented grammars and semantic reference families without silently converting text", /** No formula syntax is rewritten by a UI adapter. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    pos = new ScAddress(0, 0, 0);
  doc.InsertTab(0, unicode("Sheet1"));
  const namedRange = unicode("A1:B2");
  try {
    expect(new ScCompiler(doc, pos, G.GRAM_PODF_A1).CompileString(namedRange).GetLen()).toBe(1);
  } finally {
    namedRange.dispose();
  }
  const defaultCompiler = new ScCompiler(doc, pos, G.GRAM_UNSPECIFIED);
  expect(defaultCompiler.CompileString(unicode("=A1+2")).GetLen()).toBe(3);
  expect(
    /** Native SetGrammar requires an explicit grammar even though constructors resolve unspecified. @returns Nothing. */ () =>
      defaultCompiler.SetGrammar(G.GRAM_UNSPECIFIED),
  ).toThrow(/not implemented/);
  for (const source of ["=[.A1]", "=A1#B2", "=Sheet2.A1", "=UNPORTED(A1)", "=XFE1", "=A1048577"])
    expect(
      /** Unsupported reference families reject. @returns Tokens. */ () =>
        new ScCompiler(doc, pos, G.GRAM_NATIVE).CompileString(unicode(source)),
    ).toThrow(/not implemented/);
});
