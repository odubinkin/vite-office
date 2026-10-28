/** @fileoverview Public local-reference/parser/tracking protocols over real Calc and shared observer owners. */
import { assert, expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScAddress, ScRefFlags, ScRange, MAXROW, MAXCOL } from "../../../inc/address";
import { ScCompiler } from "../../../inc/compiler";
import { ScFormulaCell } from "../../../inc/formulacell";
import { ScTokenArray } from "../../../inc/tokenarray";
import { ScSingleRefData } from "../../../inc/refdata";
import { ScSingleRefToken, ScDoubleRefToken } from "../../../inc/token";
import { ScRefCellValue } from "../../../inc/cellvalue";
import { SetFormulaDirtyContext } from "../../../inc/refupdatecontext";
import { ScHint } from "../../../inc/brdcst";
import { broadcaster_block, formula_block } from "../../../inc/mtvelements";
import { ScInterpreter } from "../inc/interpre";
import { SvtBroadcaster } from "../../../../svl/source/notify/broadcast";
import { SvtListener } from "../../../../svl/source/notify/listener";
import { SfxHint, SfxHintId } from "../../../../svl/inc/hint";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
const grammar = FormulaGrammar.Grammar.GRAM_ODFF;
/** Constructs only a real native-subset document. @returns Document. */
function document(): ScDocument {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  return doc;
}

/** Borrows a real initialized formula after checking the public document lookup. @param doc - Owner. @param pos - Position. @returns Formula. */
function formula(doc: ScDocument, pos: ScAddress): ScFormulaCell {
  const cell = doc.GetFormulaCell(pos);
  assert(cell);
  return cell;
}

it("preserves local A1 details, absolute flags, bounds and unsupported parser families", /** Exercises actual initialized native values, not a second address parser. @returns Nothing. */ () => {
  const doc = document(),
    a = new ScAddress(5, 7, 0),
    conv = FormulaGrammar.AddressConvention;
  const byAddress = new ScAddress.Details(conv.CONV_OOO, a),
    byNumber = new ScAddress.Details(conv.CONV_ODF, 3, 4);
  expect([byAddress.nRow, byAddress.nCol]).toEqual([7, 5]);
  expect([byNumber.nRow, byNumber.nCol]).toEqual([3, 4]);
  for (const [source, col, row, flags] of [
    ["A1", 0, 0, 0],
    ["$B2", 1, 1, ScRefFlags.COL_ABS],
    ["C$3", 2, 2, ScRefFlags.ROW_ABS],
    ["$XFD$1048576", MAXCOL, MAXROW, 3],
  ] as const) {
    const out = new ScAddress(a),
      result = out.Parse(unicode(source), doc, byNumber);
    expect(result & ScRefFlags.VALID).toBe(ScRefFlags.VALID);
    expect(result & 3).toBe(flags);
    expect(out.GetVars()).toEqual([col, row, 0]);
  }
  expect(a.Parse(unicode(""), doc, byAddress)).toBe(ScRefFlags.ZERO);
  for (const source of ["Sheet.A1", "A0", "XFE1", "A1048577"])
    expect(
      /** Refuses an unavailable native fallback. @returns Flags. */ () =>
        a.Parse(unicode(source), doc, byAddress),
    ).toThrow(/implemented/);
  expect(
    /** Refuses the missing R1C1 convention. @returns Flags. */ () =>
      a.Parse(unicode("A1"), doc, new ScAddress.Details(conv.CONV_XL_R1C1)),
  ).toThrow(/implemented/);
  const compiler = new ScCompiler(doc, a, grammar);
  for (const source of ["=[.A1", "=[Sheet.A1]", "=[.]", "=[Sheet.A1:.A2]"])
    expect(
      /** Refuses an unavailable scanner/reference family. @returns Code. */ () =>
        compiler.CompileString(unicode(source)),
    ).toThrow(/implemented/);
  expect(compiler.CompileString(unicode("=+" + "1+".repeat(4095) + "[.A1]")).GetCodeError()).toBe(
    FormulaError.CodeOverflow,
  );
});

it("preserves hint values and actual sparse cell/broadcaster view boundaries", /** Invalid or unallocated reads do not allocate cells; subscriptions use real shared listeners. @returns Nothing. */ () => {
  const doc = document(),
    a = new ScAddress(0, 0, 0),
    hint = new ScHint(SfxHintId.ScDataChanged, a, 3),
    listener = new SvtListener<SfxHint>();
  a.SetRow(9);
  expect(hint.GetStartAddress().Row()).toBe(0);
  hint.SetAddressTab(1);
  hint.SetAddressCol(2);
  hint.SetAddressRow(4);
  expect(hint.GetRowCount()).toBe(3);
  expect(hint.GetRange().aStart.GetVars()).toEqual([2, 4, 1]);
  expect(hint.GetRange().aEnd.GetVars()).toEqual([2, 6, 1]);
  for (const pos of [
    new ScAddress(-1, 0, 0),
    new ScAddress(0, -1, 0),
    new ScAddress(0, 0, 99),
    new ScAddress(5, 0, 0),
  ]) {
    expect(doc.GetRefCellValue(pos).isEmpty()).toBe(true);
    expect(doc.GetBroadcaster(pos)).toBeNull();
    doc.EndListeningCell(pos, listener);
  }
  doc.StartListeningCell(new ScAddress(-1, 0, 0), listener);
  doc.StartListeningCell(new ScAddress(0, 0, 99), listener);
  expect(listener.HasBroadcaster()).toBe(false);
  a.SetRow(0);
  doc.StartListeningCell(a, listener);
  doc.StartListeningCell(a, listener);
  expect(doc.GetBroadcaster(a)?.GetAllListeners().length).toBe(1);
  doc.EndListeningCell(new ScAddress(0, 9, 0), listener);
  doc.EndListeningCell(a, listener);
  expect(doc.GetBroadcaster(a)).toBeNull();
  doc.SetFormula(a, unicode("=1"), grammar);
  const actual = formula(doc, a);
  const view = new ScRefCellValue(actual),
    copy = new ScRefCellValue(view);
  expect(copy.getFormula()).toBe(actual);
  copy.clear();
  expect(copy.isEmpty()).toBe(true);
});

it("preserves native formula-list membership, manual calculation and forced wakeup", /** Exercises real logical queues rather than private-field mutations or memory-lifetime probes. @returns Nothing. */ () => {
  const doc = document(),
    positions = [new ScAddress(0, 0, 0), new ScAddress(1, 0, 0), new ScAddress(2, 0, 0)] as const;
  for (const pos of positions) doc.SetFormula(pos, unicode("=1"), grammar);
  const a = formula(doc, positions[0]),
    b = formula(doc, positions[1]),
    c = formula(doc, positions[2]);
  doc.PutInFormulaTree(b);
  doc.RemoveFromFormulaTree(a);
  doc.RemoveFromFormulaTree(b);
  doc.RemoveFromFormulaTree(c);
  doc.RemoveFromFormulaTree(c);
  for (const cell of [a, b, c]) doc.AppendToFormulaTrack(cell);
  doc.AppendToFormulaTrack(b);
  doc.RemoveFromFormulaTrack(c);
  doc.RemoveFromFormulaTrack(b);
  doc.AppendToFormulaTrack(c);
  doc.RemoveFromFormulaTrack(a);
  doc.RemoveFromFormulaTrack(c);
  doc.TrackFormulas();
  expect(doc.GetFormulaCodeInTree()).toBe(0);
  for (const cell of [a, b, c]) doc.AppendToFormulaTrack(cell);
  doc.TrackFormulas();
  const table = doc.FetchTable(0);
  assert(table);
  const context = new SetFormulaDirtyContext();
  expect([
    context.mnTabDeletedStart,
    context.mnTabDeletedEnd,
    context.mbClearTabDeletedFlag,
  ]).toEqual([-1, -1, false]);
  doc.SetAllFormulasDirty(context);
  doc.SetAllFormulasDirty(context);
  context.mbClearTabDeletedFlag = true;
  expect(
    /** Rejects unimplemented deleted-sheet restoration. @returns Nothing. */ () =>
      doc.SetAllFormulasDirty(context),
  ).toThrow(/implemented/);
  expect(
    /** Rejects unsupported table mode. @returns Nothing. */ () =>
      table.SetAllFormulasDirty(context),
  ).toThrow(/implemented/);
  expect(
    /** Rejects unsupported column mode. @returns Nothing. */ () =>
      table.CreateColumnIfNotExists(0).SetAllFormulasDirty(context),
  ).toThrow(/implemented/);
  doc.SetValue(positions[0], 2);
  doc.SetFormula(positions[1], unicode("=[.A1]+1"), grammar);
  doc.SetFormula(positions[2], unicode("=[.B1]+1"), grammar);
  doc.SetAutoCalc(false);
  doc.CalcFormulaTree();
  expect(doc.GetAutoCalc()).toBe(false);
  expect(doc.GetValue(positions[2])).toBe(4);
  doc.SetValue(positions[0], 8);
  expect(doc.GetValue(positions[2])).toBe(4);
  doc.CalcFormulaTree(false);
  expect(doc.GetValue(positions[2])).toBe(10);
  doc.SetFormula(positions[1], unicode("==[.A1]+1"), grammar);
  expect(doc.GetFormulaCell(positions[1])?.GetDirty()).toBe(true);
  doc.SetAutoCalc(true);
  expect(doc.GetFormulaCell(positions[1])?.GetDirty()).toBe(false);
  expect(doc.GetValue(positions[2])).toBe(10);
  const current = formula(doc, positions[2]);
  current.Notify(new SfxHint(SfxHintId.Dying));
  expect(current.GetDirty()).toBe(false);
  current.SetDirty(false);
  expect(current.GetDirty()).toBe(false);
  current.SetDirty();
  current.SetDirty();
  doc.CalcFormulaTree();
  current.GetCode().SetExclusiveRecalcModeAlways();
  current.SetDirty();
  current.Notify(new SfxHint(SfxHintId.ScDataChanged));
  doc.TrackFormulas();
  doc.GetValue(positions[2]);
  expect(doc.IsInFormulaTree(current)).toBe(true);
  current.GetCode().ClearRecalcMode();
  doc.SetEmptyCell(positions[2]);
});

it("compresses adjacent formula notifications and cleans real semantic resources", /** Owner removal ends subscriptions; no JS memory manager or native memory sanitizer is involved. @returns Nothing. */ () => {
  const doc = document(),
    a = new ScAddress(0, 0, 0),
    b = new ScAddress(1, 0, 0),
    b2 = new ScAddress(1, 1, 0),
    c = new ScAddress(2, 0, 0);
  doc.SetValue(a, 1);
  doc.SetFormula(b, unicode("=[.A1]+1"), grammar);
  doc.SetFormula(b2, unicode("=[.A1]+2"), grammar);
  doc.SetFormula(c, unicode("=[.B1]+[.B2]"), grammar);
  expect(doc.GetValue(c)).toBe(5);
  doc.SetValue(a, 5);
  expect(doc.GetValue(c)).toBe(13);
  const listener = new SvtListener<SfxHint>(),
    broadcaster = new SvtBroadcaster<SfxHint>();
  listener.StartListening(broadcaster);
  const block = new broadcaster_block([broadcaster]),
    copy = new broadcaster_block(block);
  expect(broadcaster_block.at(copy, 0)).not.toBe(broadcaster);
  copy.dispose();
  expect(listener.HasBroadcaster()).toBe(true);
  block.dispose();
  expect(listener.HasBroadcaster()).toBe(false);
  const detached = new ScFormulaCell(doc, new ScAddress(3, 0, 0), unicode("=[.A1]"), grammar);
  detached.StartListeningTo(doc);
  const owner = new formula_block([detached]);
  owner.dispose();
  expect(doc.GetBroadcaster(a)?.GetAllListeners().length).toBe(2);
  const other = new SvtBroadcaster<SfxHint>();
  formula(doc, c).StartListening(other);
  other.Dispose();
});

it("uses actual reference tokens for deletion, error precedence and direct text results", /** Initialized deleted flags and unsupported LOCALE coercion are not replaced by guessed numeric values. @returns Nothing. */ () => {
  const doc = document(),
    a = new ScAddress(0, 0, 0),
    b = new ScAddress(1, 0, 0),
    pos = new ScAddress(2, 0, 0);
  doc.SetFormula(a, unicode("=1+1"), grammar);
  doc.SetFormula(b, unicode("=1/0"), grammar);
  const compiler = new ScCompiler(doc, pos, grammar),
    code = compiler.CompileString(unicode("=[.A1]+[.B1]"));
  compiler.CompileTokenArray();
  const interpreter = new ScInterpreter(null, doc, doc.GetNonThreadedContext(), pos, code);
  expect(interpreter.GetResultToken()).toBeNull();
  interpreter.Interpret();
  expect(interpreter.GetError()).toBe(FormulaError.DivisionByZero);
  expect(doc.GetFormulaCell(a)?.GetDirty()).toBe(false);
  doc.SetTextCell(a, unicode("hi"));
  const stringCode = compiler.CompileString(unicode("=[.A1]"));
  compiler.CompileTokenArray();
  const stringInterpreter = new ScInterpreter(
    null,
    doc,
    doc.GetNonThreadedContext(),
    pos,
    stringCode,
  );
  stringInterpreter.Interpret();
  expect(text(stringInterpreter.GetStringResult().getString())).toBe("hi");
  doc.SetFormula(b, unicode("=[.A1]"), grammar);
  doc.SetFormula(pos, unicode("=[.B1]+1"), grammar);
  expect(
    /** Refuses a formatter substitute for formula text. @returns Number. */ () =>
      doc.GetValue(pos),
  ).toThrow(/Locale/);
  doc.SetEmptyCell(pos);
  doc.SetFormula(a, unicode("=2+3"), grammar);
  doc.SetFormula(b, unicode("=[.A1]+1"), grammar);
  const cell = formula(doc, b);
  cell.EndListeningTo(doc);
  const token = Array.from(cell.GetCode().RPNTokens()).find(
    /** Finds the real reference token. @param value - Token. @returns Match. */ (value) =>
      value instanceof ScSingleRefToken,
  ) as ScSingleRefToken;
  token.GetSingleRef().SetRowDeleted(true);
  cell.StartListeningTo(doc);
  cell.SetDirty();
  expect(doc.GetErrCode(b)).toBe(FormulaError.NoRef);
  cell.EndListeningTo(doc);
  expect(formula(doc, a).GetDirty()).toBe(false);
  for (const address of [
    new ScAddress(-1, 0, 0),
    new ScAddress(0, -1, 0),
    new ScAddress(0, 0, 99),
    new ScAddress(0, 0, -1),
  ]) {
    token.GetSingleRef().InitAddress(address);
    cell.StartListeningTo(doc);
    cell.SetDirty();
    expect(doc.GetErrCode(b)).toBe(FormulaError.NoRef);
    cell.EndListeningTo(doc);
  }
  const invalid = new ScSingleRefData();
  invalid.InitAddress(a);
  invalid.SetRowDeleted(true);
  const array = new ScTokenArray(doc);
  array.AddSingleReference(invalid);
  new ScCompiler(doc, pos, array, grammar).CompileTokenArray();
  const bad = new ScInterpreter(null, doc, doc.GetNonThreadedContext(), pos, array);
  bad.Interpret();
  expect(bad.GetError()).toBe(FormulaError.NoRef);
  doc.SetFormula(a, unicode("=1+"), grammar);
  expect(formula(doc, a).GetString().isEmpty()).toBe(true);
});

it("keeps deleted range tokens unsubscribed and preserves empty aggregate and nonunique intersection results", /** Uses real compiled references and native deleted-axis flags. @returns Nothing. */ () => {
  const doc = document(),
    pos = new ScAddress(3, 3, 0);
  const cell = new ScFormulaCell(doc, pos, unicode("=SUM([.A1:.A2])"), grammar);
  const token = Array.from(cell.GetCode().RPNTokens()).find(
    /** Selects the actual native double reference. @param t - Token. @returns Membership. */ (t) =>
      t instanceof ScDoubleRefToken,
  );
  assert(token instanceof ScDoubleRefToken);
  token.GetDoubleRef().Ref1.SetColDeleted(true);
  token.GetDoubleRef().Ref1.SetAbsCol(-1);
  cell.StartListeningTo(doc);
  expect(cell.HasBroadcaster()).toBe(false);
  cell.Dispose();
  expect(
    ScCompiler.DoubleRefToPosSingleRefScalarCase(
      new ScRange(0, 0, 0, 1, 1, 0),
      new ScAddress(),
      new ScAddress(3, 1, 0),
    ),
  ).toBe(false);
  for (const [source, value, error] of [
    ["=SUMSQ([.A1:.A2])", 0, FormulaError.NONE],
    ["=PRODUCT([.A1:.A2])", 0, FormulaError.NONE],
    ["=AVERAGE([.A1:.A2])", 0, FormulaError.DivisionByZero],
  ] as const) {
    doc.SetFormula(pos, unicode(source), grammar);
    expect(doc.GetErrCode(pos)).toBe(error);
    expect(doc.GetValue(pos)).toBe(value);
  }
  doc.Dispose();
});
