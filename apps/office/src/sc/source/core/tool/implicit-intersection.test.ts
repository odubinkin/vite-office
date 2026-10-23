/** @fileoverview Original compute-II source vectors,borrowed RPN slot replacement and shared-group compile lifecycle. */
import { assert, expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScAddress } from "../../../inc/address";
import { ScCompiler } from "../../../inc/compiler";
import { ScFormulaCell, ScFormulaCellGroup, ScMatrixMode } from "../../../inc/formulacell";
import { ScTokenArray } from "../../../inc/tokenarray";
import { ScSingleRefData } from "../../../inc/refdata";
import { ScSingleRefToken, ScMatrixToken } from "../../../inc/token";
import { ScMatrix } from "../../../inc/scmatrix";
import { FormulaByteToken, FormulaDoubleToken, StackVar } from "../../../../formula/inc/token";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { OpCode } from "../../../../formula/inc/opcode";
import { SvNumFormatType } from "../../../../svl/inc/zforlist";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";

it("optimizes original eligible arithmetic slots while preserving lexical range owners and reference flags", /** Source vectors distinguish pending RPN location from the source token array. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const position = new ScAddress(1, 1, 0);
  for (const input of [
    "=A1:A3+1",
    "=1+A1:A3",
    "=A1:A3^2",
    "=2^A1:A3",
    "=A1:A3*2",
    "=2/A1:A3",
    "=-A1:A3",
    "=A1:A3%",
    "=+A1:A3+1",
    "=A$1:A3+1",
  ]) {
    const scanning = new ScCompiler(doc, position),
      code = scanning.CompileString(unicode(input)),
      lexical = Array.from(code.Tokens());
    const compiler = new ScCompiler(
      doc,
      position,
      code,
      FormulaGrammar.Grammar.GRAM_UNSPECIFIED,
      true,
    );
    expect(compiler.CompileTokenArray()).toBe(false);
    expect(code.GetCodeError()).toBe(FormulaError.NONE);
    const refs = Array.from(code.RPNTokens()).filter(
      /** Selects actual compiled references. @param token - RPN token. @returns Single reference. */ (
        token,
      ) => token.GetType() === StackVar.svSingleRef,
    );
    expect(refs).toHaveLength(1);
    const single = (refs[0] as ScSingleRefToken).GetSingleRef();
    expect(single.toAbs(doc, position)).toEqual(new ScAddress(0, 1, 0));
    expect(single.IsRowRel()).toBe(true);
    expect(single.IsColRel()).toBe(true);
    expect(Array.from(code.Tokens())).toEqual(lexical);
    expect(
      lexical.some(
        /** Source ranges remain genuine double-reference tokens. @param token - Lexical token. @returns Double reference. */ (
          token,
        ) => token.GetType() === StackVar.svDoubleRef,
      ),
    ).toBe(true);
  }
  const cell = new ScFormulaCell(doc, position, unicode("=A1:A3+1"), doc.GetGrammar());
  expect(cell.GetMatrixFlag()).toBe(ScMatrixMode.NONE);
  const copied = cell.Clone();
  expect(copied.GetMatrixFlag()).toBe(ScMatrixMode.NONE);
  copied.Dispose();
  expect(Array.from(cell.GetCode().RPNTokens())[0]?.GetType()).toBe(StackVar.svSingleRef);
  expect(text(cell.GetFormula(doc.GetGrammar()))).toBe("=A1:A3+1");
  cell.Dispose();
  doc.Dispose();
});
it("retains fully absolute,trivial,ambiguous and nonintersecting ranges and preserves compiler defaults", /** Native replacement refuses these source cases even with compute-II enabled. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const position = new ScAddress(1, 1, 0);
  for (const input of ["=A$1:A$3+1", "=$A$1:$A$3+1", "=A2:A2+1", "=A1:C3+1", "=A5:A7+1"]) {
    const compiler = new ScCompiler(doc, position),
      code = compiler.CompileString(unicode(input));
    new ScCompiler(doc, position, code, undefined, true).CompileTokenArray();
    expect(code.GetCodeError()).toBe(FormulaError.NONE);
    expect(
      Array.from(code.RPNTokens()).some(
        /** Unoptimized range identity remains represented. @param token - RPN token. @returns Range. */ (
          token,
        ) => token.GetType() === StackVar.svDoubleRef,
      ),
    ).toBe(true);
  }
  const scanner = new ScCompiler(doc, position),
    code = scanner.CompileString(unicode("=A1:A3+1"));
  new ScCompiler(doc, position, code).CompileTokenArray();
  expect(Array.from(code.RPNTokens())[0]?.GetType()).toBe(StackVar.svDoubleRef);
  new ScCompiler(doc, position, code, undefined, true).CompileTokenArray();
  expect(Array.from(code.RPNTokens())[0]?.GetType()).toBe(StackVar.svSingleRef);
  doc.Dispose();
});
it("keeps aggregate reference arguments while optimizing separate arithmetic operands and final nested context", /** Native pointers select each operand root rather than a reparsed expression. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const position = new ScAddress(1, 1, 0);
  for (const [input, singles, doubles] of [
    ["=SUM(A1:A3)+A1:A3", 1, 1],
    ["=A1:A3+SUM(A1:A3)", 1, 1],
    ["=A1:A3+A1:A3", 2, 0],
    ["=SUM(A1:A3)", 0, 1],
    ["=SUM(A1:A3+1)", 1, 0],
  ] as const) {
    const compiler = new ScCompiler(doc, position),
      code = compiler.CompileString(unicode(input));
    new ScCompiler(doc, position, code, undefined, true).CompileTokenArray();
    const rpn = Array.from(code.RPNTokens());
    expect(code.GetCodeError()).toBe(FormulaError.NONE);
    expect(
      rpn.filter(
        /** Counts independently optimized references. @param token - RPN token. @returns Single. */ (
          token,
        ) => token.GetType() === StackVar.svSingleRef,
      ),
    ).toHaveLength(singles);
    expect(
      rpn.filter(
        /** Counts retained aggregate references. @param token - RPN token. @returns Range. */ (
          token,
        ) => token.GetType() === StackVar.svDoubleRef,
      ),
    ).toHaveLength(doubles);
  }
  doc.Dispose();
});
it("compiles real group-owned code with native II and preserves already compiled/error/subtotal branches", /** Group code is the same actual token array borrowed by its top cell. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const position = new ScAddress(1, 1, 0),
    grammar = doc.GetGrammar(),
    group = new ScFormulaCellGroup();
  group.compileCode(doc, position, grammar);
  expect(group.mpCode).toBeNull();
  const scanner = new ScCompiler(doc, position),
    code = scanner.CompileString(unicode("=A1:A3+1"));
  group.setCode(code);
  group.mnLength = 2;
  const top = new ScFormulaCell(doc, position, group, grammar);
  group.mpTopCell = top;
  group.compileCode(doc, position, grammar);
  assert(group.mpCode);
  expect(top.GetCode()).toBe(group.mpCode);
  expect(group.mpCode.GetCodeError()).toBe(FormulaError.NONE);
  expect(Array.from(group.mpCode.RPNTokens())[0]?.GetType()).toBe(StackVar.svSingleRef);
  expect(group.mnFormatType).toBe(SvNumFormatType.NUMBER);
  expect(group.mbSubTotal).toBe(false);
  const rpn = group.mpCode.GetCode();
  group.compileCode(doc, position, grammar);
  expect(group.mpCode.GetCode()).toBe(rpn);
  group.mpCode.CreateNewRPNArrayFromData(
    [new FormulaDoubleToken(1), new FormulaByteToken(OpCode.ocSubTotal, 1)],
    2,
  );
  group.compileCode(doc, position, grammar);
  expect(group.mbSubTotal).toBe(true);
  group.mpCode.CreateNewRPNArrayFromData([new FormulaByteToken(OpCode.ocAggregate, 1)], 1);
  group.compileCode(doc, position, grammar);
  expect(group.mbSubTotal).toBe(true);
  group.mpCode.SetCodeError(FormulaError.NoName);
  group.mpCode.DelRPN();
  group.compileCode(doc, position, grammar);
  expect(group.mbSubTotal).toBe(false);
  expect(group.mpCode.GetCodeError()).toBe(FormulaError.NoName);
  const empty = new ScTokenArray(doc);
  group.setCode(empty);
  top.SyncSharedCode();
  group.compileCode(doc, position, grammar);
  expect(group.mpCode.GetCodeLen()).toBe(0);
  top.Dispose();
  doc.Dispose();
});
it("caps native II argument locations at eight and retains actual malformed-expression errors", /** Source argument-count and dummy-before-code handling use real compiler inputs. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const position = new ScAddress(1, 1, 0);
  const scanner = new ScCompiler(doc, position),
    code = scanner.CompileString(
      unicode("=SUM(A1:A3;A1:A3;A1:A3;A1:A3;A1:A3;A1:A3;A1:A3;A1:A3;A1:A3)"),
    );
  new ScCompiler(doc, position, code, undefined, true).CompileTokenArray();
  expect(code.GetCodeError()).toBe(FormulaError.NONE);
  expect(Array.from(code.RPNTokens())).toHaveLength(10);
  for (const input of ["=A1:A3+", "=-", "=A1:A3*()", "=SUM(A1:A3+;2)"]) {
    const bad = new ScCompiler(doc, position),
      array = bad.CompileString(unicode(input));
    new ScCompiler(doc, position, array, undefined, true).CompileTokenArray();
    expect(array.GetCodeError()).not.toBe(FormulaError.NONE);
    expect(array.GetCodeLen()).toBe(0);
  }
  doc.Dispose();
});

it("retains native precompiled matrix mode,copy identity and explicit unsupported evaluation", /** Mode is supplied through the actual native constructor,without altering private cell state. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  doc.SetAutoCalc(false);
  const position = new ScAddress(0, 0, 0),
    token = new FormulaDoubleToken(1),
    code = new ScTokenArray(doc);
  code.AddToken(token);
  code.CreateNewRPNArrayFromData([token], 1);
  const matrix = new ScFormulaCell(doc, position, code, doc.GetGrammar(), ScMatrixMode.Formula),
    copy = matrix.Clone(new ScAddress(0, 1, 0));
  expect(matrix.GetCode()).toBe(code);
  expect(matrix.GetMatrixFlag()).toBe(ScMatrixMode.Formula);
  expect(copy.GetMatrixFlag()).toBe(ScMatrixMode.Formula);
  expect(copy.GetCode()).not.toBe(code);
  expect(matrix.CompareByTokenArray(copy)).toBe(ScFormulaCell.NotEqual);
  expect(text(matrix.GetFormula(doc.GetGrammar()))).toBe("{=1}");
  expect(text(copy.GetFormula(doc.GetGrammar()))).toBe("{=1}");
  expect(
    /** Attempts actual matrix evaluation. @returns Result or explicit unsupported service error. */ () =>
      matrix.GetValue(),
  ).toThrow("Matrix formula evaluation is not implemented");
  expect(
    /** Attempts copied matrix evaluation. @returns Result or explicit unsupported service error. */ () =>
      copy.GetValue(),
  ).toThrow("Matrix formula evaluation is not implemented");
  for (const input of [unicode("=1"), new ScCompiler(doc, position).CompileString(unicode("=1"))])
    expect(
      /** Requests the actual unported matrix compiler. @returns Cell or explicit unsupported service error. */ () =>
        new ScFormulaCell(doc, position, input, doc.GetGrammar(), ScMatrixMode.Formula),
    ).toThrow("Formula matrix compilation is not implemented");
  matrix.Dispose();
  copy.Dispose();
  doc.Dispose();
});
it("resolves real matrix reference origins and retains native orphan source formatting", /** Real local MatRef tokens own source and RPN references to an actual document cell. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  doc.SetAutoCalc(false);
  const originPosition = new ScAddress(0, 0, 0),
    origin = new ScFormulaCell(doc, originPosition, unicode("=2+3"), doc.GetGrammar());
  doc.SetFormulaCell(originPosition, origin);
  const position = new ScAddress(1, 0, 0),
    reference = new ScSingleRefData();
  reference.InitAddressRel(doc, originPosition, position);
  const token = new ScSingleRefToken(doc.GetSheetLimits(), reference, OpCode.ocMatRef),
    code = new ScTokenArray(doc);
  code.AddToken(token);
  code.CreateNewRPNArrayFromData([token], 1);
  const follower = new ScFormulaCell(doc, position, code, doc.GetGrammar(), ScMatrixMode.Reference);
  expect(follower.GetMatrixFlag()).toBe(ScMatrixMode.Reference);
  expect(text(follower.GetFormula(doc.GetGrammar()))).toBe("=2+3");
  doc.SetValue(originPosition, 7);
  expect(text(follower.GetFormula(doc.GetGrammar()))).toBe("{=A1}");
  expect(
    /** Attempts matrix reference evaluation. @returns Result or explicit unsupported service error. */ () =>
      follower.GetValue(),
  ).toThrow("Matrix formula evaluation is not implemented");
  follower.Dispose();
  doc.Dispose();
});

it("binds explicit scanning-constructor II switches to the original working token owner", /** Native scanning and existing-array overloads carry distinct argument positions for the same flag. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const position = new ScAddress(1, 1, 0);
  for (const enabled of [false, true]) {
    const compiler = new ScCompiler(
        doc,
        position,
        FormulaGrammar.Grammar.GRAM_UNSPECIFIED,
        enabled,
      ),
      code = compiler.CompileString(unicode("=A1:A3+1")),
      lexical = Array.from(code.Tokens());
    compiler.CompileTokenArray();
    expect(code.GetCodeError()).toBe(FormulaError.NONE);
    expect(Array.from(code.RPNTokens())[0]?.GetType()).toBe(
      enabled ? StackVar.svSingleRef : StackVar.svDoubleRef,
    );
    expect(Array.from(code.Tokens())).toEqual(lexical);
  }
  doc.Dispose();
});
it("rejects actual matrix operands at the explicit unported compilation boundary without changing source owners", /** Real matrix tokens carry native ForceArrayReturn;the current scalar compiler rejects this context instead of claiming native matrix compilation. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const position = new ScAddress(1, 1, 0),
    range = new ScCompiler(doc, position).CompileString(unicode("=A1:A3"));
  const reference = Array.from(range.Tokens()).find(
    /** Selects the actual scanner-owned range. @param token - Source token. @returns Whether it is a range. */ (
      token,
    ) => token.GetType() === StackVar.svDoubleRef,
  );
  assert(reference);
  for (const matrixFirst of [false, true]) {
    const matrix = new ScMatrix(1, 1, 2.5),
      matrixToken = new ScMatrixToken(matrix),
      code = new ScTokenArray(doc);
    code.AddToken(matrixFirst ? matrixToken : reference);
    code.AddToken(new FormulaByteToken(OpCode.ocAdd));
    code.AddToken(matrixFirst ? reference : matrixToken);
    const lexical = Array.from(code.Tokens());
    expect(
      /** Requests the genuine currently unported array compilation context. @returns Subtotal flag or explicit unsupported error. */ () =>
        new ScCompiler(doc, position, code, doc.GetGrammar(), true).CompileTokenArray(),
    ).toThrow("Formula opcode or array context is not implemented by scalar compilation");
    expect(code.GetCodeLen()).toBe(0);
    for (let index = 0; index < lexical.length; index++)
      expect(code.TokenAt(index)).toBe(lexical[index]);
    expect((lexical[matrixFirst ? 0 : 2] as ScMatrixToken).GetMatrix()).toBe(matrix);
  }
  doc.Dispose();
});
