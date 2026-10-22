/** @fileoverview Shared source-token serialization dispatch and native base virtuals. */
import { expect, it } from "vitest";
import { FormulaCompiler } from "../../../inc/FormulaCompiler";
import { FormulaTokenArray } from "../../../inc/tokenarray";
import { FormulaGrammar } from "../../../inc/grammar";
import { FormulaToken, FormulaByteToken, FormulaSpaceToken, StackVar } from "../../../inc/token";
import { OpCode } from "../../../inc/opcode";
import { SharedString } from "../../../../svl/inc/sharedstring";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
/** Configures the native protected grammar for direct base dispatch tests, without mocking tokens or storage. */
class OdffCompiler extends FormulaCompiler {
  /** Binds the actual source array to the tested ODFF convention. @param array - Owner. @returns Compiler. */
  constructor(array: FormulaTokenArray) {
    super(array);
    this.meGrammar = FormulaGrammar.Grammar.GRAM_ODFF;
  }
}

it("preserves output replacement, literal quotes, both whitespace classes and base reference dispatch", /** Actual arrays and string owners participate. @returns Nothing. */ () => {
  const code = new FormulaTokenArray(),
    compiler = new FormulaCompiler(code),
    out = unicode("old");
  compiler.CreateStringFromTokenArray(out);
  expect(text(out)).toBe("");
  code.AddDouble(1);
  expect(
    /** Native unspecified grammar has no symbol service here. @returns Nothing. */ () =>
      compiler.CreateStringFromTokenArray(out),
  ).toThrow(/selected/);
  const forced = new FormulaTokenArray();
  forced.AddDouble(1);
  forced.SetRecalcModeForced();
  new OdffCompiler(forced).CreateStringFromTokenArray(out);
  expect(text(out)).toBe("=1");
  const actual = new FormulaTokenArray(),
    configured = new OdffCompiler(actual);
  actual.AddString(new SharedString(unicode('a"b😀\0')));
  actual.AddToken(new FormulaByteToken(OpCode.ocSpaces, 2));
  actual.AddToken(new FormulaSpaceToken(1, 9));
  actual.AddToken(new FormulaToken(StackVar.svSingleRef));
  configured.CreateStringFromTokenArray(out);
  expect(text(out)).toBe('"a""b😀\0"  \t');
  const missingType = new FormulaTokenArray();
  missingType.AddToken(new FormulaToken(StackVar.svUnknown));
  const missing = new OdffCompiler(missingType);
  expect(
    /** Missing value family rejects explicitly. @returns Nothing. */ () =>
      missing.CreateStringFromTokenArray(out),
  ).toThrow(/not implemented/);
  const missingOp = new FormulaTokenArray();
  missingOp.AddToken(new FormulaByteToken(OpCode.ocIf));
  const opCompiler = new OdffCompiler(missingOp);
  expect(
    /** Missing function output rejects explicitly. @returns Nothing. */ () =>
      opCompiler.CreateStringFromTokenArray(out),
  ).toThrow(/not implemented/);
});
