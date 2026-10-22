/** @fileoverview Original compiler return-format lifecycle for the represented scalar/aggregate opcode slice. */
import { expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScAddress } from "../../../inc/address";
import { ScCompiler } from "../../../inc/compiler";
import { ScTokenArray } from "../../../inc/tokenarray";
import { ScFormulaCell } from "../../../inc/formulacell";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { SvNumFormatType } from "../../../../svl/inc/zforlist";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";

it("starts undefined and retains native factor/default return format including error exits", /** Original lcl_GetRetFormat runs before invalid factor rejection;postfix percent follows a numeric factor. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    position = new ScAddress(),
    grammar = FormulaGrammar.Grammar.GRAM_NATIVE;
  for (const [formula, expected] of [
    ["=2", 16],
    ["=SUM(1;2)", 16],
    ["=1%", 16],
    ["=(2+3)", 16],
    ["=SUM()", 16],
    ["=%2", 128],
    ["=)", 16],
    ["= ", 16],
  ] as const) {
    const compiler = new ScCompiler(doc, position, grammar);
    compiler.CompileString(unicode(formula));
    expect(compiler.GetNumFormatType()).toBe(SvNumFormatType.UNDEFINED);
    compiler.CompileTokenArray();
    expect(compiler.GetNumFormatType()).toBe(expected);
  }
  const code = new ScTokenArray(doc);
  code.AddDouble(1);
  code.SetCodeError(FormulaError.NoName);
  const compiler = new ScCompiler(doc, position, code, grammar);
  compiler.CompileTokenArray();
  expect(compiler.GetNumFormatType()).toBe(SvNumFormatType.NUMBER);
  compiler.CompileTokenArray();
  expect(compiler.GetNumFormatType()).toBe(SvNumFormatType.NUMBER);
  expect(code.GetCodeError()).toBe(FormulaError.NoName);
  const cell = new ScFormulaCell(doc, position, code, grammar);
  expect(cell.GetErrCode()).toBe(FormulaError.NoName);
  cell.Dispose();
  doc.Dispose();
});
it("retains distinct original string/owned-array error-format assignment rules", /** The owned-array constructor publishes the compiler format even when compilation sets an error. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    position = new ScAddress(),
    grammar = FormulaGrammar.Grammar.GRAM_NATIVE,
    compiler = new ScCompiler(doc, position, grammar),
    code = compiler.CompileString(unicode("=%2")),
    owned = new ScFormulaCell(doc, position, code, grammar),
    source = new ScFormulaCell(doc, position, unicode("=%2"), grammar);
  expect(owned.GetErrCode()).not.toBe(FormulaError.NONE);
  expect(owned.GetFormatType()).toBe(SvNumFormatType.PERCENT);
  expect(source.GetFormatType()).toBe(SvNumFormatType.NUMBER);
  owned.Dispose();
  source.Dispose();
  doc.Dispose();
});
