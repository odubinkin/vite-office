/** @fileoverview Original shared-group token ownership over real detached formula cells;column splitting and group-area admission remain separate acceptance. */
import { expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScAddress } from "../../../inc/address";
import { ScFormulaCell, ScFormulaCellGroup } from "../../../inc/formulacell";
import { ScCompiler } from "../../../inc/compiler";
import { ScTokenArray } from "../../../inc/tokenarray";
import { GroupCalcDisabled, GroupCalcEnabled, GroupCalcRunning } from "../../../inc/types";
import { SvNumFormatType } from "../../../../svl/inc/zforlist";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { FormulaDoubleToken, FormulaByteToken } from "../../../../formula/inc/token";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { OpCode } from "../../../../formula/inc/opcode";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";

const grammar = FormulaGrammar.Grammar.GRAM_NATIVE;
/** Creates actual document and sheet owners. @returns Document. */
function document(): ScDocument {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  return doc;
}
it("keeps original group defaults and copies source tokens independently before computing invariance and hash", /** Physical intrusive refcounts are intentionally absent under GC. @returns Nothing. */ () => {
  const doc = document(),
    group = new ScFormulaCellGroup();
  expect([
    group.mpCode,
    group.mpTopCell,
    group.mnLength,
    group.mnWeight,
    group.mnFormatType,
    group.mbInvariant,
    group.mbSubTotal,
    group.mbPartOfCycle,
    group.meCalcState,
  ]).toEqual([null, null, 0, 0, 16, false, false, false, 1]);
  expect([GroupCalcDisabled, GroupCalcEnabled, GroupCalcRunning]).toEqual([0, 1, 2]);
  const source = new ScFormulaCell(doc, new ScAddress(1, 1, 0), unicode("=A1*2"), grammar);
  group.setCode(source.GetCode());
  expect(group.mpCode).not.toBe(source.GetCode());
  expect(group.mpCode?.GetArray()?.[0]).not.toBe(source.GetCode().GetArray()?.[0]);
  expect(group.mpCode?.GetCode()?.[0]).toBe(group.mpCode?.GetArray()?.[0]);
  expect(group.mpCode?.GetHash()).toBe(source.GetHash());
  expect(group.mbInvariant).toBe(false);
  const number = new ScFormulaCell(doc, new ScAddress(), unicode("=5"), grammar);
  group.setCode(number.GetCode());
  expect(group.mbInvariant).toBe(true);
  expect(group.mpCode?.GetHash()).toBe(number.GetHash());
  number.Dispose();
  source.Dispose();
  doc.Dispose();
});
it("moves the existing token buffers into the shared owner and keeps per-cell results independent", /** Real group construction shares code rather than reparsing or storing a second formula model. @returns Nothing. */ () => {
  const doc = document();
  doc.SetValue(new ScAddress(0, 0, 0), 3);
  doc.SetValue(new ScAddress(0, 1, 0), 7);
  const top = new ScFormulaCell(doc, new ScAddress(1, 0, 0), unicode("=A1*2"), grammar),
    oldCode = top.GetCode(),
    codeBuffer = oldCode.GetArray(),
    rpnBuffer = oldCode.GetCode(),
    hash = top.GetHash();
  expect(top.GetValue()).toBe(6);
  expect(top.GetDocument()).toBe(doc);
  expect(top.GetCellGroup()).toBeNull();
  expect(top.IsShared()).toBe(false);
  expect(top.IsSharedTop()).toBe(false);
  expect(top.GetSharedTopRow()).toBe(-1);
  expect(top.GetSharedLength()).toBe(0);
  expect(top.GetSharedCode()).toBeNull();
  top.SyncSharedCode();
  const group = top.CreateCellGroup(2, false) as ScFormulaCellGroup;
  expect(top.CreateCellGroup(2, false)).toBeNull();
  expect(top.GetCode()).not.toBe(oldCode);
  expect(top.GetCode().GetArray()).toBe(codeBuffer);
  expect(top.GetCode().GetCode()).toBe(rpnBuffer);
  expect(top.GetHash()).toBe(hash);
  const member = new ScFormulaCell(doc, new ScAddress(1, 1, 0), group, grammar);
  expect(member.GetCode()).toBe(top.GetCode());
  expect(member.GetSharedCode()).toBe(group.mpCode);
  expect(member.GetCellGroup()).toBe(group);
  expect(member.IsShared()).toBe(true);
  expect(member.IsSharedTop()).toBe(false);
  expect(top.IsSharedTop()).toBe(true);
  expect(member.GetSharedTopRow()).toBe(0);
  expect(member.GetSharedLength()).toBe(2);
  expect(member.GetValue()).toBe(14);
  expect(top.GetValue()).toBe(6);
  expect(top.HasBroadcaster()).toBe(false);
  expect(member.HasBroadcaster()).toBe(false);
  const copy = member.Clone();
  expect(copy.IsShared()).toBe(false);
  expect(copy.GetCode()).not.toBe(group.mpCode);
  expect(copy.GetHash()).toBe(member.GetHash());
  expect(copy.GetValue()).toBe(14);
  copy.Dispose();
  member.SetCellGroup(null);
  group.mnLength = 1;
  expect(member.IsShared()).toBe(false);
  expect(member.GetCode()).not.toBe(group.mpCode);
  expect(member.GetCode().GetArray()?.[0]).not.toBe(group.mpCode?.GetArray()?.[0]);
  member.SetCellGroup(null);
  member.Dispose();
  top.Dispose();
  expect(group.mpTopCell).toBeNull();
  doc.Dispose();
});
it("synchronizes borrowed code pointers after replacement and invalidates group weight on membership assignment", /** Source group updates and cell synchronization are distinct operations. @returns Nothing. */ () => {
  const doc = document(),
    top = new ScFormulaCell(doc, new ScAddress(), unicode("=2"), grammar),
    member = new ScFormulaCell(doc, new ScAddress(0, 1, 0), unicode("=2"), grammar),
    replacement = new ScFormulaCell(doc, new ScAddress(), unicode("=5"), grammar),
    group = top.CreateCellGroup(2, true) as ScFormulaCellGroup;
  group.mnWeight = 42;
  member.SetCellGroup(group);
  expect(group.mnWeight).toBe(0);
  const previous = member.GetCode();
  group.setCode(replacement.GetCode());
  expect(member.GetCode()).toBe(previous);
  top.SyncSharedCode();
  member.SyncSharedCode();
  expect(member.GetCode()).toBe(group.mpCode);
  expect(top.GetCode()).toBe(member.GetCode());
  expect(member.GetValue()).toBe(5);
  expect(top.GetValue()).toBe(5);
  member.SetCellGroup(null);
  group.mnLength = 1;
  member.Dispose();
  top.Dispose();
  replacement.Dispose();
  doc.Dispose();
});
it("preserves precompiled RPN and constructor format metadata without recompiling lexical code", /** Actual public RPN replacement is retained by the native owned-array constructor. @returns Nothing. */ () => {
  const doc = document(),
    position = new ScAddress(),
    compiler = new ScCompiler(doc, position, grammar),
    code = compiler.CompileString(unicode("=2+3"));
  compiler.CompileTokenArray();
  const replacement = new FormulaDoubleToken(8);
  code.ReplaceRPNToken(0, replacement);
  const cell = new ScFormulaCell(doc, position, code, grammar);
  expect(cell.GetCode().GetCode()?.[0]).toBe(replacement);
  expect(cell.GetValue()).toBe(11);
  expect(cell.GetFormatType()).toBe(SvNumFormatType.NUMBER);
  const group = new ScFormulaCellGroup();
  group.setCode(code);
  group.mnFormatType = SvNumFormatType.PERCENT;
  const member = new ScFormulaCell(doc, new ScAddress(0, 1, 0), group, grammar);
  group.mpTopCell = member;
  group.mnLength = 1;
  expect(member.GetFormatType()).toBe(SvNumFormatType.PERCENT);
  expect(member.Clone().GetFormatType()).toBe(SvNumFormatType.PERCENT);
  member.Dispose();
  cell.Dispose();
  doc.Dispose();
});
it("retains native empty group-code fallback and exposes unavailable subtotal registration", /** Existing genuine token values identify the unported document service. @returns Nothing. */ () => {
  const doc = document(),
    group = new ScFormulaCellGroup(),
    member = new ScFormulaCell(doc, new ScAddress(), group, grammar);
  expect(member.GetCode().GetLen()).toBe(0);
  expect(member.GetSharedCode()).toBeNull();
  member.Dispose();
  group.mbSubTotal = true;
  expect(
    /** Unsupported real group metadata. @returns Cell. */ () =>
      new ScFormulaCell(doc, new ScAddress(), group, grammar),
  ).toThrow(/Subtotal-cell/);
  for (const opcode of [OpCode.ocSubTotal, OpCode.ocAggregate]) {
    const code = new ScTokenArray(doc),
      token = code.AddToken(new FormulaByteToken(opcode, 1)) as FormulaByteToken;
    code.CreateNewRPNArrayFromData([token], 1);
    expect(
      /** Unsupported real subtotal RPN. @returns Cell. */ () =>
        new ScFormulaCell(doc, new ScAddress(), code, grammar),
    ).toThrow(/Subtotal-cell/);
  }
  const empty = new ScTokenArray(doc);
  empty.SetCodeError(FormulaError.NoName);
  const error = new ScFormulaCell(doc, new ScAddress(), empty, grammar);
  expect(error.GetErrCode()).toBe(FormulaError.NoName);
  error.Dispose();
  doc.Dispose();
});
