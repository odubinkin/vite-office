/** @fileoverview Native inline matrix merge, scanner errors and grammar-specific output. */
import { assert, expect, it } from "vitest";
import { FormulaGrammar, type Grammar } from "../../../../formula/inc/grammar";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { OpCode } from "../../../../formula/inc/opcode";
import {
  FormulaByteToken,
  FormulaDoubleToken,
  FormulaToken,
  StackVar,
} from "../../../../formula/inc/token";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { ScAddress } from "../../../inc/address";
import { ScDocument } from "../../../inc/document";
import { ScTokenArray, ScMatrixToken } from "./token";
import { MergeArray } from "./token.matrix";
import { ScCompiler } from "./compiler";

const ooxml = FormulaGrammar.Grammar.GRAM_OOXML;
const odff = FormulaGrammar.Grammar.GRAM_ODFF;

/** Compiles the supplied source through the normal native scanner. @param document - Document. @param source - Formula text. @param grammar - Native grammar. @returns Tokens. */
function compile(document: ScDocument, source: string, grammar: Grammar = ooxml): ScTokenArray {
  const formula = unicode(source);
  try {
    return new ScCompiler(document, new ScAddress(), grammar).CompileString(formula);
  } finally {
    formula.dispose();
  }
}

it("replaces a literal suffix with a typed matrix and serializes it in both native grammars", /** Exercises integers, explicit signs, booleans, empty values, string quoting and whitespace. @returns Nothing. */ () => {
  const document = new ScDocument();
  const output = new OUString();
  try {
    const tokens = compile(document, '2+{ -2, +3,"a""b";\tTRUE,FALSE,}');
    expect(tokens.GetCodeError()).toBe(FormulaError.NONE);
    const code = [...tokens.Tokens()];
    expect(code.map(tokenOpcode)).toEqual([OpCode.ocPush, OpCode.ocAdd, OpCode.ocPush]);
    const literal = code[2];
    assert(literal instanceof ScMatrixToken);
    const matrix = literal.GetMatrix();
    assert(matrix);
    expect(matrix.IsBoolean(0, 1)).toBe(true);
    expect(matrix.IsEmpty(2, 1)).toBe(true);
    new ScCompiler(document, new ScAddress(), tokens, ooxml).CreateStringFromTokenArray(output);
    expect(text(output)).toBe('2+{-2,3,"a""b";TRUE,FALSE,#N/A}');
    expect(compile(document, text(output)).GetCodeError()).toBe(FormulaError.BadArrayContent);
    new ScCompiler(document, new ScAddress(), tokens, odff).CreateStringFromTokenArray(output);
    expect(text(output)).toBe('2+{-2;3;"a""b"|TRUE;FALSE;#N/A}');
    const odfTokens = compile(document, "{1;2|3;4}", odff);
    expect(odfTokens.GetCodeError()).toBe(FormulaError.NONE);
    new ScCompiler(document, new ScAddress(), odfTokens, ooxml).CreateStringFromTokenArray(output);
    expect(text(output)).toBe("{1,2;3,4}");
  } finally {
    output.dispose();
    document.Dispose();
  }
});

/** Borrows the original opcode from a code token. @param token - Code token. @returns Opcode. */
function tokenOpcode(token: FormulaToken): OpCode {
  return token.GetOpCode();
}

it("rejects nonliteral, jagged and nested inline matrices and uses native closing behavior", /** Tests source scanner and merge errors with actual token admission. @returns Nothing. */ () => {
  const document = new ScDocument();
  try {
    const sheetName = unicode("Sheet1");
    try {
      expect(document.InsertTab(0, sheetName)).toBe(true);
    } finally {
      sheetName.dispose();
    }
    for (const [formula, error] of [
      ["{1,2;3}", FormulaError.BadArrayContent],
      ["{1,2+3}", FormulaError.BadArrayContent],
      ['{1,-"text"}', FormulaError.BadArrayContent],
      ["{A1}", FormulaError.BadArrayContent],
      ["{{1}}", FormulaError.NestedArray],
      ["1}", FormulaError.PairExpected],
    ] as const) {
      expect(compile(document, formula).GetCodeError(), formula).toBe(error);
    }
    const open = compile(document, "{1,2");
    expect(open.GetCodeError()).toBe(FormulaError.NONE);
    expect([...open.Tokens()][0]).toBeInstanceOf(ScMatrixToken);
  } finally {
    document.Dispose();
  }
});

it("retains low-level separator alternation and the original malformed suffix behavior", /** Calls the merge owner with literal code tokens at the native boundary. @returns Nothing. */ () => {
  const row = new FormulaToken(StackVar.svSep, OpCode.ocArrayRowSep);
  const open = new FormulaToken(StackVar.svSep, OpCode.ocArrayOpen);
  const close = new FormulaToken(StackVar.svSep, OpCode.ocArrayClose);
  const separator = new FormulaToken(StackVar.svSep, OpCode.ocSep);
  const one = new FormulaDoubleToken(1);
  expect(MergeArray([one], 1)).toBeNull();
  expect(MergeArray([open, one], 2)).toBeNull();
  expect(MergeArray([open, one, separator, separator, one, close], 6)).toBeNull();
  expect(MergeArray([open, one, one, close], 4)).toBeNull();
  expect(MergeArray([open, new FormulaByteToken(OpCode.ocTrue), one, close], 4)).toBeNull();
  expect(MergeArray([open, one, close, separator, one, close], 6)).toBeNull();
  expect(MergeArray([open, new FormulaByteToken(OpCode.ocMul), close], 3)).toBeNull();
  const collapsed = MergeArray([one, row, new FormulaDoubleToken(2), close], 4);
  expect(collapsed?.matrix.GetElementCount()).toBe(1);
  const value = collapsed?.matrix.Get(0, 0);
  try {
    expect(value?.fVal).toBe(1);
  } finally {
    value?.dispose();
  }
});

it("exposes the upper-left string and empty elements through ordinary formula cells", /** Exercises the native interpreter result and workbook cell queries. @returns Nothing. */ () => {
  const document = new ScDocument();
  const sheet = unicode("Sheet1");
  try {
    assert(document.InsertTab(0, sheet));
    const position = new ScAddress();
    for (const [formula, expected] of [
      ['={"text",2}', "text"],
      ["={,2}", ""],
    ] as const) {
      const source = unicode(formula);
      try {
        document.SetFormula(position, source, ooxml);
        const cell = document.GetFormulaCell(position);
        assert(cell);
        expect(cell.GetErrCode()).toBe(FormulaError.NONE);
        expect(text(cell.GetString().getString())).toBe(expected);
      } finally {
        source.dispose();
      }
    }
  } finally {
    sheet.dispose();
    document.Dispose();
  }
});
