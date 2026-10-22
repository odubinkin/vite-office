/** @fileoverview Source-backed scalar aggregate compilation,parameter iteration and actual document dependencies. */
import { assert, expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScAddress } from "../../../inc/address";
import { ScCompiler } from "../../../inc/compiler";
import { ScSingleRefToken, ScEmptyCellToken } from "../../../inc/token";
import {
  FormulaByteToken,
  FormulaToken,
  FormulaErrorToken,
  FormulaStringToken,
  FormulaDoubleToken,
  FormulaMissingToken,
  StackVar,
} from "../../../../formula/inc/token";
import { ScTokenArray } from "../../../inc/tokenarray";
import { ScInterpreter } from "../inc/interpre";
import { SharedString } from "../../../../svl/inc/sharedstring";
import { OpCode } from "../../../../formula/inc/opcode";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
const grammar = FormulaGrammar.Grammar.GRAM_NATIVE;
/** Creates actual source owners with a local data sheet. @returns Document. */
function document(): ScDocument {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  return doc;
}
/** Requires the actual formula cell owned by the document. @param doc - Document. @param position - Position. @returns Formula cell. */
function formula(doc: ScDocument, position: ScAddress) {
  const cell = doc.GetFormulaCell(position);
  assert(cell);
  return cell;
}
it("executes original scalar aggregate defaults,missing parameters,nesting and reverse argument order", /** Expected values follow interpr6 default non-subtotal branches. @returns Nothing. */ () => {
  const doc = document(),
    position = new ScAddress(5, 0, 0);
  for (const [source, value] of [
    ["=SUM()", 0],
    ["=SUMSQ()", 0],
    ["=PRODUCT()", 0],
    ["=SUM(1;2;3)", 6],
    ["=SUMSQ(1;-2;3)", 14],
    ["=PRODUCT(-2;3;4)", -24],
    ["=AVERAGE(1;2;6)", 3],
    ["=SUM(;2;)", 2],
    ["=AVERAGE(;2;)", 2 / 3],
    ["=PRODUCT(3;;4)", 0],
    ["=sum (1; PRODUCT(2;3); AVERAGE(2;4))", 10],
    ["=SUM(1E16;1;-1E16)", 0],
    ["=SUM(0.1;0.2;-0.3)", 0],
    ["=SUM(+2;-3;4%)*2", -1.92],
    ["=SUM(1;2", 3],
  ] as const) {
    doc.SetFormula(position, unicode(source), grammar);
    expect(doc.GetErrCode(position), source).toBe(FormulaError.NONE);
    expect(doc.GetValue(position), source).toBe(value);
  }
  for (const [source, error] of [
    ["=AVERAGE()", FormulaError.DivisionByZero],
    ['=SUM(1;"2";3)', FormulaError.NoValue],
    ['=SUMSQ("text")', FormulaError.NoValue],
    ['=PRODUCT("")', FormulaError.NoValue],
    ['=AVERAGE("text")', FormulaError.NoValue],
    ["=SUM(1;1/0;3)", FormulaError.DivisionByZero],
    ["=SUMSQ(1E200)", FormulaError.IllegalFPOperation],
    ["=PRODUCT(1E200;1E200)", FormulaError.IllegalFPOperation],
  ] as const) {
    doc.SetFormula(position, unicode(source), grammar);
    expect(doc.GetErrCode(position), source).toBe(error);
  }
  doc.SetFormula(position, unicode('="a""b\u0000😀"'), grammar);
  expect(text(formula(doc, position).GetString().getString())).toBe('a"b\u0000😀');
  expect(text(formula(doc, position).GetFormula(grammar))).toBe('="a""b\u0000😀"');
});

it("preserves actual RPN aggregate error assignment and raw missing/empty/stack boundaries", /** Uses public token-array input,including source-invalid arity witnesses,without replacing interpreter state. @returns Nothing. */ () => {
  const doc = document(),
    p = new ScAddress(0, 0, 0);
  /** Interprets actual initialized native tokens. @param code - RPN tokens. @returns Interpreter result. */
  function run(code: FormulaToken[]): ScInterpreter {
    const array = new ScTokenArray(doc);
    array.CreateNewRPNArrayFromData(code, code.length);
    const interpreter = new ScInterpreter(null, doc, doc.GetNonThreadedContext(), p, array);
    interpreter.Interpret();
    return interpreter;
  }
  /** Creates the native aggregate token with its byte arity. @param count - Parameter count. @returns SUM token. */
  function sum(count: number): FormulaByteToken {
    return new FormulaByteToken(OpCode.ocSum, count);
  }
  expect(run([new ScEmptyCellToken(false, false), sum(1)]).GetNumResult()).toBe(0);
  expect(
    run([
      new FormulaMissingToken(),
      new FormulaDoubleToken(2),
      new FormulaByteToken(OpCode.ocAdd),
    ]).GetNumResult(),
  ).toBe(2);
  expect(run([sum(1)]).GetError()).toBe(FormulaError.UnknownStackVariable);
  expect(run([new FormulaErrorToken(FormulaError.NoName), sum(1)]).GetError()).toBe(
    FormulaError.NoName,
  );
  expect(
    run([
      new FormulaErrorToken(FormulaError.NoName),
      new FormulaStringToken(new SharedString()),
      sum(2),
    ]).GetError(),
  ).toBe(FormulaError.NoName);
  expect(run([new FormulaStringToken(new SharedString()), sum(3)]).GetError()).toBe(
    FormulaError.UnknownStackVariable,
  );
  expect(
    run([
      new FormulaErrorToken(FormulaError.NoName),
      new FormulaDoubleToken(2),
      new FormulaByteToken(OpCode.ocAdd),
    ]).GetError(),
  ).toBe(FormulaError.NoName);
  expect(
    /** Rejects an unavailable aggregate operand family. @returns Interpreter. */ () =>
      run([new FormulaToken(StackVar.svUnknown), sum(1)]),
  ).toThrow(/Aggregate/);
});
it("ignores empty/text references and tracks real numeric/error/formula dependencies through replacement", /** Reference reads remain owned by document formula cells. @returns Nothing. */ () => {
  const doc = document(),
    a = new ScAddress(0, 0, 0),
    b = new ScAddress(1, 0, 0),
    c = new ScAddress(2, 0, 0),
    p = new ScAddress(5, 0, 0);
  doc.SetValue(a, 4);
  doc.SetTextCell(b, unicode("123"));
  for (const [source, value] of [
    ["=SUM(A1;B1;C1)", 4],
    ["=SUMSQ(A1;B1;C1)", 16],
    ["=PRODUCT(A1;B1;C1)", 4],
    ["=AVERAGE(A1;B1;C1)", 4],
    ["=PRODUCT(B1;C1)", 0],
  ] as const) {
    doc.SetFormula(p, unicode(source), grammar);
    expect(doc.GetValue(p)).toBe(value);
  }
  doc.SetFormula(c, unicode('="text"'), grammar);
  doc.SetFormula(p, unicode("=SUM(A1;B1;C1)"), grammar);
  expect(doc.GetValue(p)).toBe(4);
  doc.SetValue(a, 7);
  expect(formula(doc, p).GetDirty()).toBe(true);
  expect(doc.GetValue(p)).toBe(7);
  doc.SetFormula(c, unicode("=PRODUCT(A1;2)"), grammar);
  expect(doc.GetValue(p)).toBe(21);
  doc.SetFormula(c, unicode("=1/0"), grammar);
  expect(doc.GetErrCode(p)).toBe(FormulaError.DivisionByZero);
  doc.SetEmptyCell(c);
  expect(doc.GetValue(p)).toBe(7);
  doc.SetEmptyCell(p);
  doc.SetValue(a, 9);
  expect(doc.GetFormulaCell(p)).toBeNull();
  doc.SetFormula(p, unicode("=SUM(A1)"), grammar);
  const token = formula(doc, p).GetCode().FirstToken();
  // The function token precedes the reference in source order.
  assert(token);
  expect(token.GetOpCode()).toBe(OpCode.ocSum);
  const reference = Array.from(formula(doc, p).GetCode().Tokens()).find(
    /** Finds the genuine reference token. @param t - Token. @returns Reference membership. */ (
      t,
    ) => t instanceof ScSingleRefToken,
  );
  assert(reference instanceof ScSingleRefToken);
  reference.GetSingleRef().SetRowDeleted(true);
  expect(doc.GetErrCode(p)).toBe(FormulaError.NoRef);
});
it("compiles real function byte arity and preserves native/ODFF serialization and bounded strings", /** Includes native255-argument bound and scanner overflow paths. @returns Nothing. */ () => {
  const doc = document(),
    p = new ScAddress(5, 0, 0);
  for (const g of [grammar, FormulaGrammar.Grammar.GRAM_ODFF]) {
    const source =
      g === grammar ? '=sum(1;product(2;3);;"a""b";A1)' : '=sum(1;product(2;3);;"a""b";[.A1])';
    const compiler = new ScCompiler(doc, p, g),
      array = compiler.CompileString(unicode(source));
    compiler.CompileTokenArray();
    expect(array.GetCodeError()).toBe(FormulaError.NONE);
    const functions = Array.from(array.RPNTokens()).filter(
      /** Selects actual compiled aggregate tokens. @param t - Token. @returns Membership. */ (t) =>
        t.GetOpCode() === OpCode.ocSum || t.GetOpCode() === OpCode.ocProduct,
    );
    expect(
      functions.map(
        /** Reads native opcode and byte arity. @param t - Token. @returns Observation. */ (t) => [
          t.GetOpCode(),
          (t as FormulaByteToken).GetByte(),
        ],
      ),
    ).toEqual([
      [OpCode.ocProduct, 2],
      [OpCode.ocSum, 5],
    ]);
    expect(
      Array.from(array.RPNTokens()).some(
        /** Finds the source missing-argument token. @param t - Token. @returns Membership. */ (
          t,
        ) => t.GetType() === StackVar.svMissing,
      ),
    ).toBe(true);
    doc.SetFormula(p, unicode(source), g);
    expect(text(formula(doc, p).GetFormula(g))).toBe(
      source.replace("sum", "SUM").replace("product", "PRODUCT"),
    );
  }
  for (const count of [255, 256]) {
    const compiler = new ScCompiler(doc, p, grammar),
      array = compiler.CompileString(unicode("=SUM(" + Array(count).fill("1").join(";") + ")"));
    compiler.CompileTokenArray();
    expect(array.GetCodeError()).toBe(
      count === 255 ? FormulaError.NONE : FormulaError.CodeOverflow,
    );
    if (count === 255)
      expect((Array.from(array.RPNTokens()).at(-1) as FormulaByteToken).GetByte()).toBe(255);
    else expect(array.GetCodeLen()).toBe(0);
  }
  for (const length of [1022, 1023]) {
    const compiler = new ScCompiler(doc, p, grammar),
      array = compiler.CompileString(unicode('="' + "x".repeat(length) + '"'));
    expect(array.GetCodeError()).toBe(
      length === 1022 ? FormulaError.NONE : FormulaError.StringOverflow,
    );
  }
  expect(
    /** Rejects the unavailable malformed-name fallback. @returns Tokens. */ () =>
      new ScCompiler(doc, p, grammar).CompileString(unicode('="unterminated')),
  ).toThrow(/Unterminated/);
});

it("preserves scanner token ceilings for function,string and missing arguments", /** Native array capacity is unchanged when new lexical families reach it. @returns Nothing. */ () => {
  const doc = document(),
    p = new ScAddress(0, 0, 0);
  for (const suffix of ['"text"', "SUM(1)"]) {
    const array = new ScCompiler(doc, p, grammar).CompileString(
      unicode("=" + "1+".repeat(4095) + "1" + suffix),
    );
    expect(array.GetCodeError()).toBe(FormulaError.CodeOverflow);
  }
  const missing = new ScCompiler(doc, p, grammar).CompileString(
    unicode("=SUM(" + "1;".repeat(4094) + " ;)"),
  );
  expect(missing.GetCodeError()).toBe(FormulaError.CodeOverflow);
});
