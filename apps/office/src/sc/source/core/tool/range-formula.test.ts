/** @fileoverview Source-backed range formula acceptance across native tokens,area lifetime,numeric blocks and actual ODS persistence. */
import { assert, expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import {
  ScAddress,
  ScRange,
  BCA_BRDCST_ALWAYS,
  BCA_LISTEN_ALWAYS,
  MAXROW,
  ScRefFlags,
  MAXCOL,
} from "../../../inc/address";
import { ScHint, ScAreaChangedHint } from "../../../inc/brdcst";
import { SfxHint, SfxHintId } from "../../../../svl/inc/hint";
import { SvtListener, type SvtDyingHint } from "../../../../svl/source/notify/listener";
import { type SvtBroadcaster } from "../../../../svl/source/notify/broadcast";
import { ScBroadcastArea, ScBroadcastAreaSlot, ScBulkBroadcast } from "../inc/bcaslot";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ScCompiler } from "../../../inc/compiler";
import { ScDoubleRefToken } from "../../../inc/token";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { RangeColumnSpanSet, type ColumnAction } from "../../../inc/columnspanset";
import { ScValueIterator } from "../../../inc/dociter";
import { SubtotalFlags, UpdateRefMode } from "../../../inc/global";
import { NumericCellAccumulator, FuncSum } from "./interpr6";
import { ParseBlock } from "../../../inc/mtvfunctions";
import { gunzipSync } from "node:zlib";
import fixture from "../../../inc/native-array-sum-cases.json" with { type: "json" };
import { numeric_block } from "../../../inc/mtvelements";
import { sumArray } from "../../../inc/arraysumfunctor";
import { IDBFactory } from "fake-indexeddb";
import { IndexedDbDocumentStore } from "../../../../framework/browser/storage/document-store";
import { createCalcSession } from "../../../browser/composition/calc-module";
/** Observes genuine reciprocal registrations and source hints without replacing dispatch. */
class Listener extends SvtListener<SfxHint> {
  readonly hints: (SfxHint | SvtDyingHint)[] = [];
  readonly owners: SvtBroadcaster<SfxHint>[] = [];
  action: (() => void) | undefined;
  /** Retains the actual owner while forwarding original registration. @param owner - Broadcaster. @returns Newly registered. */
  override StartListening(owner: SvtBroadcaster<SfxHint>): boolean {
    this.owners.push(owner);
    return super.StartListening(owner);
  }
  /** Observes original notifications and optional reentrant work. @param hint - Actual hint. @returns Nothing. */
  override Notify(hint: SfxHint | SvtDyingHint): void {
    this.hints.push(hint);
    if (hint instanceof ScHint) this.action?.();
  }
}

/** Creates a normal actual document with two native sheets. @returns Document. */
function document(): ScDocument {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("One"));
  doc.InsertTab(1, unicode("Two"));
  return doc;
}

it("preserves native logarithmic boundaries and default slot counts", /** Runs original DoChecks witnesses directly against the initialized private geometry helper. @returns Nothing. */ () => {
  const doc = document(),
    machine = doc.GetBASM();
  assert(machine);
  const offset = machine["ComputeSlotOffset"].bind(machine);
  expect(machine["mnBcaSlotsCol"]).toBe(896);
  expect(machine["mnBcaSlots"]).toBe(172032);
  expect(offset(new ScAddress(0, 0, 0))).toBe(0);
  expect(offset(new ScAddress(1, 0, 0))).toBe(0);
  expect(offset(new ScAddress(0, 128, 0))).toBe(1);
  expect(offset(new ScAddress(16, 0, 0))).toBe(896);
  expect(offset(new ScAddress(0, 32767, 0))).toBe(255);
  expect(offset(new ScAddress(0, 32768, 0))).toBe(256);
  expect(offset(new ScAddress(1023, 0, 0))).toBe(63 * 896);
  expect(offset(new ScAddress(1024, 0, 0))).toBe(64 * 896);
  expect(offset(new ScAddress(doc.MaxCol(), doc.MaxRow(), 0))).toBe(172031);
  expect(offset(new ScAddress(-1, 0, 0))).toBe(0);
  expect(offset(new ScAddress(0, -1, 0))).toBe(0);
  doc.Dispose();
});

it("shares identical areas across all native slots and sheets,then removes their final listener", /** Range identity and ordinary repeat delivery match native bulk rules. @returns Nothing. */ () => {
  const doc = document(),
    machine = doc.GetBASM();
  assert(machine);
  const area = new ScRange(15, 127, 0, 16, 128, 1),
    a = new Listener(),
    b = new Listener();
  machine.StartListeningArea(area, false, a);
  machine.StartListeningArea(area, false, b);
  expect(a.owners[0]).toBe(b.owners[0]);
  expect(a.owners).toHaveLength(1);
  expect(b.owners).toHaveLength(1);
  expect(
    machine.AreaBroadcast(new ScHint(SfxHintId.ScDataChanged, new ScAddress(16, 128, 1))),
  ).toBe(true);
  expect(a.hints).toHaveLength(1);
  expect(b.hints).toHaveLength(1);
  const bulk = new ScBulkBroadcast(machine, SfxHintId.ScDataChanged),
    nested = new ScBulkBroadcast(machine, SfxHintId.ScDataChanged);
  expect(machine.AreaBroadcast(area, SfxHintId.ScDataChanged)).toBe(true);
  expect(a.hints).toHaveLength(9);
  expect(
    machine.AreaBroadcast(new ScHint(SfxHintId.ScDataChanged, new ScAddress(15, 127, 0))),
  ).toBe(false);
  nested.Dispose();
  expect(machine.IsInBulkBroadcast()).toBe(true);
  bulk.Dispose();
  expect(machine.IsInBulkBroadcast()).toBe(false);
  machine.EndListeningArea(area, false, a);
  expect(a.HasBroadcaster()).toBe(false);
  expect(b.HasBroadcaster()).toBe(true);
  machine.EndListeningArea(area, false, b);
  expect(b.HasBroadcaster()).toBe(false);
  expect(
    machine.AreaBroadcast(new ScHint(SfxHintId.ScDataChanged, new ScAddress(16, 128, 1))),
  ).toBe(false);
  doc.Dispose();
});

it("retains deferred erasure through nested broadcasts and actual listener destruction", /** Native erased flags protect later entries during the same slot iteration. @returns Nothing. */ () => {
  const doc = document(),
    machine = doc.GetBASM();
  assert(machine);
  const range = new ScRange(0, 0, 0, 3, 3, 0),
    other = new ScRange(0, 0, 0, 4, 4, 0),
    a = new Listener(),
    b = new Listener();
  doc.StartListeningArea(range, false, a);
  doc.StartListeningArea(other, false, b);
  a.action =
    /** Removes this and the later actual area,reentering the same slot before outer erasure completes. @returns Nothing. */ () => {
      a.action = undefined;
      doc.EndListeningArea(range, false, a);
      doc.EndListeningArea(other, false, b);
      expect(machine.AreaBroadcast(new ScHint(SfxHintId.ScDataChanged, new ScAddress()))).toBe(
        true,
      );
    };
  expect(machine.AreaBroadcast(new ScHint(SfxHintId.ScDataChanged, new ScAddress()))).toBe(true);
  expect(
    a.hints.filter(
      /** Selects original cell changes. @param h - Hint. @returns Membership. */ (h) =>
        h instanceof ScHint,
    ),
  ).toHaveLength(1);
  expect(
    b.hints.filter(
      /** Selects original cell changes. @param h - Hint. @returns Membership. */ (h) =>
        h instanceof ScHint,
    ),
  ).toHaveLength(0);
  expect(a.HasBroadcaster()).toBe(false);
  expect(b.HasBroadcaster()).toBe(false);
  doc.Dispose();
});

it("clips start/end sheets symmetrically and preserves always-listen and lifetime semantics", /** No per-cell registration expansion participates. @returns Nothing. */ () => {
  const doc = document(),
    a = new Listener(),
    b = new Listener(),
    range = new ScRange(0, 0, -5, 1, 1, 9),
    machine = doc.GetBASM();
  assert(machine);
  doc.StartListeningArea(range, false, a);
  doc.Broadcast(new ScHint(SfxHintId.ScDataChanged, new ScAddress(1, 1, 1)));
  expect(a.hints).toHaveLength(1);
  doc.EndListeningArea(range, false, a);
  expect(a.HasBroadcaster()).toBe(false);
  for (const invalid of [new ScRange(0, 0, -5, 1, 1, -1), new ScRange(0, 0, 5, 1, 1, 9)])
    doc.StartListeningArea(invalid, false, a);
  expect(a.HasBroadcaster()).toBe(false);
  machine.EndListeningArea(BCA_LISTEN_ALWAYS(), false, b);
  expect(machine.AreaBroadcast(new ScHint(SfxHintId.ScDataChanged, BCA_BRDCST_ALWAYS()))).toBe(
    false,
  );
  doc.StartListeningArea(BCA_LISTEN_ALWAYS(), false, a);
  doc.StartListeningArea(BCA_LISTEN_ALWAYS(), false, b);
  expect(machine.AreaBroadcast(new ScHint(SfxHintId.ScDataChanged, BCA_BRDCST_ALWAYS()))).toBe(
    true,
  );
  expect(a.hints).toHaveLength(2);
  doc.EndListeningArea(BCA_LISTEN_ALWAYS(), false, a);
  expect(b.HasBroadcaster()).toBe(true);
  doc.EndListeningArea(BCA_LISTEN_ALWAYS(), false, b);
  expect(b.HasBroadcaster()).toBe(false);
  doc.StartListeningArea(new ScRange(0, 0, 0, 0, 0, 0), false, a);
  doc.Dispose();
  expect(a.HasBroadcaster()).toBe(false);
  expect(doc.GetBASM()).toBeNull();
  doc.StartListeningArea(range, false, a);
  doc.EndListeningArea(range, false, a);
  doc.Broadcast(new ScHint(SfxHintId.ScDataChanged, new ScAddress()));
  doc.TrackFormulas();
  doc.Dispose();
});

it("retains native slot area counts and hard-recalc gates on actual owners", /** Exercises public original slot operations and actual state,not a substituted dispatcher. @returns Nothing. */ () => {
  const doc = document(),
    machine = doc.GetBASM();
  assert(machine);
  const first = new ScBroadcastAreaSlot(doc, machine),
    second = new ScBroadcastAreaSlot(doc, machine),
    range = new ScRange(0, 0, 0, 1, 1, 0),
    listener = new Listener(),
    ref: [ScBroadcastArea | null] = [null];
  expect(new ScBroadcastArea(range).DecRef()).toBe(0);
  expect(first.StartListeningArea(range, false, listener, ref)).toBe(true);
  assert(ref[0]);
  const owner = ref[0];
  expect(owner.GetRef()).toBe(1);
  second.InsertListeningArea(owner);
  second.InsertListeningArea(owner);
  expect(owner.GetRef()).toBe(2);
  doc.SetHardRecalcState(ScDocument.HardRecalcState.ETERNAL);
  first.InsertListeningArea(new ScBroadcastArea(new ScRange(1, 1, 0, 2, 2, 0)));
  expect(first.StartListeningArea(range, false, listener, [null])).toBe(false);
  doc.SetHardRecalcState(ScDocument.HardRecalcState.OFF);
  ref[0] = null;
  first.EndListeningArea(range, false, listener, ref);
  second.EndListeningArea(range, false, listener, ref);
  expect(owner.GetRef()).toBe(0);
  first.Dispose();
  second.Dispose();
  machine.LeaveBulkBroadcast(SfxHintId.ScDataChanged);
  const pending = new ScBroadcastArea(range);
  expect(machine.InsertBulkArea(pending)).toBe(true);
  expect(machine.InsertBulkArea(pending)).toBe(false);
  expect(machine.RemoveBulkArea(pending)).toBe(1);
  expect(machine.RemoveBulkArea(pending)).toBe(0);
  new ScBulkBroadcast(null, SfxHintId.ScDataChanged).Dispose();
  doc.Dispose();
});

it("retains original full-sheet ending bounds and missing/intersection/group boundaries", /** Valid default geometry exercises the native full-sheet optimized traversal without allocating every slot. @returns Nothing. */ () => {
  const doc = document(),
    machine = doc.GetBASM();
  assert(machine);
  const listener = new Listener(),
    range = new ScRange(0, 0, 0, 3, 3, 0),
    full = new ScRange(0, 0, 0, doc.MaxCol(), doc.MaxRow(), 0);
  machine.StartListeningArea(range, false, listener);
  expect(machine.AreaBroadcast(new ScHint(SfxHintId.ScDataChanged, new ScAddress(4, 4, 0)))).toBe(
    false,
  );
  expect(
    machine.AreaBroadcast(new ScHint(SfxHintId.ScDataChanged, new ScAddress(0, 1000, 0))),
  ).toBe(false);
  expect(Array.from(machine["Offsets"](full, true)).at(-1)).toBe(172030);
  machine.EndListeningArea(full, false, listener);
  expect(listener.HasBroadcaster()).toBe(true);
  const grouped = new Listener();
  machine.StartListeningArea(range, true, grouped);
  expect(grouped.HasBroadcaster()).toBe(true);
  machine.EndListeningArea(range, true, grouped);
  expect(grouped.HasBroadcaster()).toBe(false);
  const slot = new ScBroadcastAreaSlot(doc, machine),
    owner = new ScBroadcastArea(range),
    ref: [ScBroadcastArea | null] = [owner];
  expect(slot.StartListeningArea(range, false, listener, ref)).toBe(false);
  expect(owner.GetRef()).toBe(1);
  const missing = new ScBroadcastAreaSlot(doc, machine);
  missing.EndListeningArea(range, false, listener, ref);
  const groupArea: [ScBroadcastArea | null] = [null];
  expect(slot.StartListeningArea(range, true, grouped, groupArea)).toBe(true);
  expect(groupArea[0]?.IsGroupListening()).toBe(true);
  slot.EndListeningArea(range, true, grouped, [null]);
  expect(grouped.HasBroadcaster()).toBe(false);
  slot.Dispose();
  missing.Dispose();
  doc.Dispose();
});

it("preserves deferred areas belonging to other reentrant slots", /** Native per-machine erasure work survives inner-slot completion. @returns Nothing. */ () => {
  const doc = document(),
    machine = doc.GetBASM();
  assert(machine);
  const first = new ScRange(0, 0, 0, 0, 1, 0),
    second = new ScRange(0, 200, 0, 0, 201, 0),
    a = new Listener(),
    b = new Listener();
  doc.StartListeningArea(first, false, a);
  doc.StartListeningArea(second, false, b);
  a.action = /** Starts an actual nested slot iteration. @returns Nothing. */ () => {
    a.action = undefined;
    machine.AreaBroadcast(new ScHint(SfxHintId.ScDataChanged, new ScAddress(0, 200, 0)));
  };
  b.action =
    /** Defers both original slot entries and observes the existing erased flag on a repeated end. @returns Nothing. */ () => {
      b.action = undefined;
      doc.EndListeningArea(first, false, a);
      doc.EndListeningArea(first, false, a);
      doc.EndListeningArea(second, false, b);
    };
  expect(machine.AreaBroadcast(new ScHint(SfxHintId.ScDataChanged, new ScAddress()))).toBe(true);
  expect(a.HasBroadcaster()).toBe(false);
  expect(b.HasBroadcaster()).toBe(false);
  doc.Dispose();
});

it("keeps native temporary recalculation and hidden-row bulk tracking distinct from ordinary delivery", /** The actual document owns both modes and clips a valid-start out-of-bounds-end range. @returns Nothing. */ () => {
  const doc = document(),
    listener = new Listener(),
    range = new ScRange(0, 0, 0, 0, 1, 9),
    machine = doc.GetBASM();
  assert(machine);
  doc.StartListeningArea(range, false, listener);
  doc.SetHardRecalcState(ScDocument.HardRecalcState.TEMPORARY);
  doc.Broadcast(new ScHint(SfxHintId.ScDataChanged, new ScAddress()));
  expect(listener.hints).toHaveLength(0);
  doc.SetHardRecalcState(ScDocument.HardRecalcState.OFF);
  doc.Broadcast(new ScHint(SfxHintId.ScDataChanged, new ScAddress()));
  expect(listener.hints).toHaveLength(1);
  machine.EnterBulkBroadcast();
  doc.TrackFormulas(SfxHintId.ScHiddenRowsChanged);
  expect(doc.IsTrackFormulasPending()).toBe(true);
  machine.LeaveBulkBroadcast(SfxHintId.ScHiddenRowsChanged);
  expect(doc.IsTrackFormulasPending()).toBe(false);
  doc.EndListeningArea(range, false, listener);
  doc.EndListeningArea(new ScRange(0, 0, 4, 1, 1, 9), false, listener);
  doc.Dispose();
});

const grammar = FormulaGrammar.Grammar.GRAM_NATIVE;

it("compiles native and ODFF ranges without individual-cell subscriptions and preserves source flags", /** Actual lexical double references and shared range-operator merging remain distinct source code. @returns Nothing. */ () => {
  const doc = document(),
    pos = new ScAddress(3, 3, 0);
  for (const [source, odff] of [
    ["=SUM(A1:$B$2)", "=SUM([.A1:.$B$2])"],
    ["=SUM($B2:A$1)", "=SUM([.A$1:.$B2])"],
    ["=SUM(A1 : B2)", "=SUM([.A1] : [.B2])"],
  ] as const) {
    const compiler = new ScCompiler(doc, pos, grammar),
      code = compiler.CompileString(unicode(source));
    compiler.CompileTokenArray();
    expect(code.GetCodeError()).toBe(FormulaError.NONE);
    const reference = Array.from(code.RPNTokens()).find(
      /** Selects the real compiled range. @param token - RPN token. @returns Range membership. */ (
        token,
      ) => token instanceof ScDoubleRefToken,
    );
    assert(reference instanceof ScDoubleRefToken);
    expect(reference.GetDoubleRef().toAbs(doc, pos).GetVars()).toEqual([0, 0, 0, 1, 1, 0]);
    doc.SetFormula(pos, unicode(source), grammar);
    const cell = doc.GetFormulaCell(pos);
    assert(cell);
    expect(text(cell.GetFormula(FormulaGrammar.Grammar.GRAM_ODFF))).toBe(odff);
    doc.SetFormula(pos, unicode(odff), FormulaGrammar.Grammar.GRAM_ODFF);
    expect(doc.GetErrCode(pos)).toBe(FormulaError.NONE);
  }
  doc.Dispose();
});

it("executes default SUM,SUMSQ,PRODUCT,AVERAGE ranges with text/empty/error semantics and live dependency chains", /** Both source aggregation paths read actual column stores. @returns Nothing. */ () => {
  const doc = document(),
    a = new ScAddress(0, 0, 0),
    b = new ScAddress(0, 2, 0),
    p = new ScAddress(2, 0, 0),
    dependent = new ScAddress(3, 0, 0);
  doc.SetValue(a, 1);
  doc.SetValue(b, 3);
  for (const [source, value] of [
    ["=SUM(A1:A3)", 4],
    ["=SUMSQ(A1:A3)", 10],
    ["=PRODUCT(A1:A3)", 3],
    ["=AVERAGE(A1:A3)", 2],
    ["=SUM(PRODUCT(A1:A3);SUMSQ(A1:A3);AVERAGE(A1:A3))", 15],
  ] as const) {
    doc.SetFormula(p, unicode(source), grammar);
    expect(doc.GetErrCode(p), source).toBe(FormulaError.NONE);
    expect(doc.GetValue(p), source).toBe(value);
  }
  doc.SetTextCell(new ScAddress(0, 1, 0), unicode("42"));
  doc.SetFormula(p, unicode("=SUM(A1:A3)"), grammar);
  doc.SetFormula(dependent, unicode("=SUM(C1:C2)"), grammar);
  expect(doc.GetValue(dependent)).toBe(4);
  doc.SetValue(b, 9);
  expect(doc.GetValue(dependent)).toBe(10);
  doc.SetFormula(new ScAddress(0, 1, 0), unicode('="text"'), grammar);
  expect(doc.GetValue(dependent)).toBe(10);
  doc.SetFormula(new ScAddress(0, 1, 0), unicode("=1/0"), grammar);
  expect(doc.GetErrCode(dependent)).toBe(FormulaError.DivisionByZero);
  doc.SetEmptyCell(new ScAddress(0, 1, 0));
  expect(doc.GetValue(dependent)).toBe(10);
  doc.SetEmptyCell(p);
  doc.SetValue(a, 7);
  expect(doc.GetValue(dependent)).toBe(0);
  doc.Dispose();
});

it("keeps sparse extreme rows bounded and registers changes in formerly empty members", /** Native slots and block spans avoid expanding a million empty rows. @returns Nothing. */ () => {
  const doc = document(),
    p = new ScAddress(1, 0, 0),
    last = new ScAddress(0, MAXROW, 0);
  doc.SetValue(new ScAddress(0, 0, 0), 2);
  doc.SetValue(last, 3);
  doc.SetFormula(p, unicode("=SUM(A1:A1048576)"), grammar);
  expect(doc.GetValue(p)).toBe(5);
  const middle = new ScAddress(0, 500000, 0);
  doc.SetValue(middle, 7);
  expect(doc.GetValue(p)).toBe(12);
  doc.SetEmptyCell(last);
  expect(doc.GetValue(p)).toBe(9);
  doc.Dispose();
});

it("retains range endpoint flags,reversed axes,whole-axis sticky rules and untouched failed outputs", /** Literal expected values come from the original local range parser. @returns Nothing. */ () => {
  const d = document(),
    details = ScAddress.detailsOOOa1;
  for (const [source, coordinates, absolute] of [
    ["$B$3:A1", [0, 0, 0, 1, 2, 0], 0x30],
    ["$A:$C", [0, 0, 0, 2, MAXROW, 0], 0x33],
    ["$3:1", [0, 0, 0, MAXCOL, 2, 0], 0x31],
    ["A1:B1048576", [0, 0, 0, 1, MAXROW, 0], 0x22],
    ["A1:XFD3", [0, 0, 0, MAXCOL, 2, 0], 0x11],
  ] as const) {
    const r = new ScRange(),
      flags = r.Parse(unicode(source), d, details);
    expect(r.GetVars(), source).toEqual(coordinates);
    expect(flags & 0x33, source).toBe(absolute);
  }
  const initial = new ScRange(4, 5, 0, 6, 7, 0),
    before = initial.GetVars();
  expect(initial.Parse(unicode("A1"), d, details)).toBe(ScRefFlags.ZERO);
  expect(initial.GetVars()).toEqual(before);
  expect(initial.Parse(unicode(":A1"), d, details)).toBe(ScRefFlags.ZERO);
  expect(initial.GetVars()).toEqual(before);
  expect(initial.Parse(unicode("A1:"), d, details)).toBe(ScRefFlags.ZERO);
  expect(
    /** Rejects the missing R1C1 parser service. @returns Flags. */ () =>
      initial.Parse(
        unicode("A1:B2"),
        d,
        new ScAddress.Details(FormulaGrammar.AddressConvention.CONV_XL_R1C1),
      ),
  ).toThrow(/not implemented/);
  d.Dispose();
});

it("uses native local scalar intersection for standalone and arithmetic range operands", /** Horizontal,vertical,singleton and nonunique cases follow source branch order. @returns Nothing. */ () => {
  const d = document(),
    a = new ScAddress(0, 0, 0),
    b = new ScAddress(1, 0, 0),
    p = new ScAddress(1, 3, 0);
  d.SetValue(a, 4);
  d.SetValue(b, 11);
  d.SetValue(new ScAddress(0, 1, 0), 7);
  for (const [source, value] of [
    ["=A1:C1", 11],
    ["=A1:C1+2", 13],
    ["=A1:A1", 4],
    ["=A1:A1+2", 6],
  ] as const) {
    d.SetFormula(p, unicode(source), grammar);
    expect(d.GetValue(p), source).toBe(value);
  }
  const vertical = new ScAddress(3, 1, 0);
  d.SetFormula(vertical, unicode("=A1:A3"), grammar);
  expect(d.GetValue(vertical)).toBe(7);
  for (const source of ["=A1:C3", "=A1:A3+1"]) {
    d.SetFormula(p, unicode(source), grammar);
    expect(d.GetErrCode(p), source).toBe(FormulaError.NoValue);
  }
  d.SetFormula(p, unicode("=SUM(A1:A3)"), grammar);
  const cell = d.GetFormulaCell(p);
  assert(cell);
  cell.EndListeningTo(d);
  const token = Array.from(cell.GetCode().RPNTokens()).find(
    /** Selects the native range operand. @param t - Token. @returns Membership. */ (t) =>
      t instanceof ScDoubleRefToken,
  );
  assert(token instanceof ScDoubleRefToken);
  token.GetDoubleRef().Ref2.SetRowDeleted(true);
  cell.SetDirtyVar();
  expect(d.GetErrCode(p)).toBe(FormulaError.NoRef);
  token.GetDoubleRef().Ref2.SetRowDeleted(false);
  token.GetDoubleRef().Ref2.InitAddress(-1, 0, 0);
  cell.SetDirtyVar();
  expect(d.GetErrCode(p)).toBe(FormulaError.NoRef);
  expect(
    /** Keeps unavailable 3D intersection explicit. @returns Choice. */ () =>
      ScCompiler.DoubleRefToPosSingleRefScalarCase(
        new ScRange(0, 0, 1, 2, 0, 1),
        new ScAddress(),
        p,
      ),
  ).toThrow(/3D/);
  d.Dispose();
});

it("walks real numeric/formula blocks in native column/sheet order and preserves terminal output values", /** Empty columns,text results,errors,clamps and the native cursor increment paths participate. @returns Nothing. */ () => {
  const d = document();
  d.SetValue(new ScAddress(0, 0, 0), 2);
  d.SetValue(new ScAddress(0, 1, 0), 3);
  d.SetFormula(new ScAddress(0, 2, 0), unicode('="text"'), grammar);
  d.SetValue(new ScAddress(0, 3, 0), 4);
  d.SetFormula(new ScAddress(1, 0, 0), unicode("=1/0"), grammar);
  d.SetValue(new ScAddress(1, 2, 1), 8);
  const iterator = new ScValueIterator(d.GetNonThreadedContext(), new ScRange(0, 0, 0, 1, 3, 1)),
    out = { error: FormulaError.NONE, value: 99 },
    seen: [number, FormulaError][] = [];
  for (let more = iterator.GetFirst(out); more; more = iterator.GetNext(out))
    seen.push([out.value, out.error]);
  expect(seen).toEqual([
    [2, 0],
    [3, 0],
    [4, 0],
    [4, FormulaError.DivisionByZero],
    [8, 0],
  ]);
  expect(out.value).toBe(8);
  expect(out.error).toBe(FormulaError.NONE);
  const invalid = new ScRange(-1, -1, -1, MAXCOL + 1, MAXROW + 1, 99),
    clamped = new ScValueIterator(d.GetNonThreadedContext(), invalid);
  out.value = 33;
  expect(clamped.GetFirst(out)).toBe(false);
  expect(out.value).toBe(33);
  expect(
    new ScValueIterator(d.GetNonThreadedContext(), new ScRange(2, 0, 0, 3, 1, 0)).GetFirst(out),
  ).toBe(false);
  expect(
    new ScValueIterator(d.GetNonThreadedContext(), new ScRange(0, 4, 0, 0, 5, 0)).GetFirst(out),
  ).toBe(false);
  const empty = new ScDocument(),
    absent = new ScValueIterator(empty.GetNonThreadedContext(), new ScRange());
  out.error = FormulaError.NoName;
  expect(absent.GetFirst(out)).toBe(false);
  expect(out.error).toBe(FormulaError.NoName);
  expect(
    /** Rejects unavailable subtotal filtering. @returns Iterator. */ () =>
      new ScValueIterator(d.GetNonThreadedContext(), new ScRange(), SubtotalFlags.IgnoreHidden),
  ).toThrow(/Subtotal/);
  expect(
    /** Rejects unavailable text-as-zero services. @returns Iterator. */ () =>
      new ScValueIterator(d.GetNonThreadedContext(), new ScRange(), SubtotalFlags.NONE, true),
  ).toThrow(/text-as-zero/);
  empty.Dispose();
  d.Dispose();
});

it("executes original partial block and column action boundaries without manufacturing cells", /** Actual cursors and source action contracts expose no-op and error branches. @returns Nothing. */ () => {
  const d = document();
  d.SetValue(new ScAddress(0, 0, 0), 2);
  d.SetValue(new ScAddress(0, 1, 0), 3);
  d.SetValue(new ScAddress(0, 2, 0), 4);
  const table = d.FetchTable(0);
  assert(table);
  const column = table.CreateColumnIfNotExists(0),
    store = column.GetCellStore(),
    node = store.cbegin().get(),
    sum = new NumericCellAccumulator();
  sum.call(node, 0, 0);
  expect(sum.getResult().get()).toBe(0);
  sum.call(node, 0, 3);
  expect(sum.getResult().get()).toBe(9);
  const action = new FuncSum(d.GetNonThreadedContext());
  action.execute(0, 2, false);
  action.startColumn(column);
  action.execute(0, 1, true);
  expect(action.getSum().get()).toBe(5);
  const calls: number[] = [],
    record = {
      call: /** Records original block spans. @param block - Actual node. @param offset - Offset. @param size - Count. @returns Nothing. */ (
        block: typeof node,
        offset: number,
        size: number,
      ) => {
        calls.push(block.position, offset, size);
      },
    };
  ParseBlock(store.cbegin(), store, record, 0, 2);
  expect(calls).toEqual([0, 0, 3]);
  calls.length = 0;
  ParseBlock(store.cbegin(), store, record, 2, 1);
  expect(calls).toEqual([]);
  const visits: number[] = [],
    columns: ColumnAction = {
      startColumn:
        /** Records actual native column identity. @param col - Column. @returns Nothing. */ (
          col,
        ) => {
          visits.push(col.GetCol());
        },
      execute:
        /** Records original span bounds. @param first - Start. @param last - End. @param flag - Span value. @returns Nothing. */ (
          first,
          last,
          flag,
        ) => {
          visits.push(first, last, Number(flag));
        },
    };
  new RangeColumnSpanSet(new ScRange(0, 1, 5, 1, 3, 6)).executeColumnAction(d, columns);
  new RangeColumnSpanSet(new ScRange(-1, 0, 0, 0, 1, 0)).executeColumnAction(d, columns);
  expect(visits).toEqual([]);
  d.SetFormula(new ScAddress(0, 0, 0), unicode("=1/0"), grammar);
  const failed = new FuncSum(d.GetNonThreadedContext());
  failed.startColumn(column);
  failed.execute(0, 0, true);
  failed.execute(0, 2, true);
  expect(failed.getError()).toBe(FormulaError.DivisionByZero);
  d.SetFormula(new ScAddress(0, 0, 0), unicode("=1+"), grammar);
  const cell = d.GetFormulaCell(new ScAddress());
  assert(cell);
  const out = { value: 37, error: FormulaError.NONE };
  expect(cell.GetErrorOrValue(out)).toBe(true);
  expect(out.error).not.toBe(FormulaError.NONE);
  expect(out.value).toBe(37);
  d.Dispose();
});

it("serializes genuine range data with native entire-axis,named-source and deleted-reference conventions", /** Existing reference owners carry the exact output flags;no UI text replacement participates. @returns Nothing. */ () => {
  const d = document(),
    p = new ScAddress(),
    compiler = new ScCompiler(d, p, grammar),
    array = compiler.CompileString(unicode("=SUM(A1:B2)"));
  compiler.CompileTokenArray();
  const token = Array.from(array.Tokens()).find(
    /** Selects actual source-order range data. @param item - Token. @returns Membership. */ (
      item,
    ) => item instanceof ScDoubleRefToken,
  );
  assert(token instanceof ScDoubleRefToken);
  const reference = token.GetDoubleRef(),
    output = unicode("");
  reference.Ref1.SetColDeleted(true);
  compiler.CreateStringFromTokenArray(output);
  expect(text(output)).toBe("SUM(#REF!1:B2)");
  compiler.SetGrammar(FormulaGrammar.Grammar.GRAM_ODFF);
  compiler.CreateStringFromTokenArray(output);
  expect(text(output)).toBe("SUM([#REF!])");
  reference.Ref1.SetColDeleted(false);
  for (const endpoint of [reference.Ref1, reference.Ref2]) {
    endpoint.InitAddress(-1, 0, 0);
    compiler.CreateStringFromTokenArray(output);
    expect(text(output)).toBe("SUM([#REF!])");
    endpoint.InitAddress(0, 0, 0);
  }
  for (const [range, short, expanded] of [
    [new ScRange(0, 0, 0, 0, MAXROW, 0), "A:A", "A1:A1048576"],
    [new ScRange(0, 0, 0, MAXCOL, 2, 0), "1:3", "A1:XFD3"],
  ] as const) {
    reference.InitRange(range);
    for (const endpoint of [reference.Ref1, reference.Ref2]) {
      endpoint.SetColRel(true);
      endpoint.SetRowRel(true);
      endpoint.SetTabRel(true);
    }
    reference.SetRange(d.GetSheetLimits(), range, p);
    compiler.SetGrammar(grammar);
    array.SetFromRangeName(false);
    compiler.CreateStringFromTokenArray(output);
    expect(text(output)).toBe("SUM(" + short + ")");
    array.SetFromRangeName(true);
    compiler.CreateStringFromTokenArray(output);
    expect(text(output)).toBe("SUM(" + expanded + ")");
  }
  expect(
    /** Preserves the native invalid-range/name fallback boundary. @returns Tokens. */ () =>
      new ScCompiler(d, p, FormulaGrammar.Grammar.GRAM_ODFF).CompileString(unicode("=SUM([.A1:])")),
  ).toThrow(/fallback/);
  expect(
    new ScCompiler(d, p, grammar)
      .CompileString(unicode("=" + "1+".repeat(4095) + "1A1:B2"))
      .GetCodeError(),
  ).toBe(FormulaError.CodeOverflow);
  output.dispose();
  d.Dispose();
});

/** Reads an original native binary64 word. @param hex - Bits. @returns Number. */
function value(hex: string): number {
  const view = new DataView(new ArrayBuffer(8));
  view.setBigUint64(0, BigInt("0x" + hex), true);
  return view.getFloat64(0, true);
}

/** Reads exact result bits. @param number - Value. @returns Bits. */
function bits(number: number): string {
  const view = new DataView(new ArrayBuffer(8));
  view.setFloat64(0, number, true);
  return view.getBigUint64(0, true).toString(16).padStart(16, "0");
}

it("matches every unchanged original native finite/NoValue-empty array profile", /** Includes four-lane partition,tail,cancellation,subnormal,empty,offset and mutating-get timing. Mixed error-NaN provenance is not certified by this profile. @returns Nothing. */ () => {
  const rows = gunzipSync(Buffer.from(fixture.captures.values.gzipBase64, "base64"))
    .toString()
    .trimEnd()
    .split("\n");
  expect(rows).toHaveLength(4097);
  expect(rows[0]).toBe("PROFILE 0");
  for (const row of rows.slice(1)) {
    const words = row.split(" "),
      count = Number(words[1]),
      block = new numeric_block(count + 2, 0),
      base = numeric_block.data(block);
    base.set(100);
    base
      .copy()
      .advance(count + 1)
      .set(200);
    for (let i = 0; i < count; i++)
      base
        .copy()
        .advance(i + 1)
        .set(value(words[i + 2] as string));
    const pointer = base.copy().advance(1);
    for (let i = 0; i < count; i++)
      expect(bits(pointer.copy().advance(i).get())).toBe(words[i + 2]);
    const result = sumArray(pointer, count);
    const actual = [bits(result.get()), bits(result.get())];
    result.add(1);
    actual.push(bits(result.get()));
    expect(actual, row).toEqual(words.slice(2 + count));
    expect(pointer.position).toBe(1);
    numeric_block.delete_block(block);
  }
});

it("recomputes newly populated range members through Undo/Redo and canonical ODS reopening", /** Uses actual model/filter/storage rather than cached displayed values. @returns Completion. */ async () => {
  const db = new IndexedDbDocumentStore(crypto.randomUUID(), new IDBFactory()),
    session = createCalcSession(db),
    c = session.controller;
  c.EnterString("2");
  c.Select(0, 2);
  c.EnterString("4");
  c.Select(1, 0);
  expect(c.EnterString("=SUM(A1:A3)")).toBe(true);
  const p = new ScAddress(1, 0, 0);
  expect(c.shell.GetDocument().GetValue(p)).toBe(6);
  c.Select(0, 1);
  c.EnterString("3");
  expect(c.shell.GetDocument().GetValue(p)).toBe(9);
  c.Undo();
  expect(c.shell.GetDocument().GetValue(p)).toBe(6);
  c.Redo();
  expect(c.shell.GetDocument().GetValue(p)).toBe(9);
  c.Select(2, 0);
  expect(c.EnterString("=SUM(A1:A1048576)")).toBe(true);
  c.shell.GetDocument().SetValue(new ScAddress(0, MAXROW, 0), 5);
  await session.fileWorkflows.Flush();
  const record = (await db.list())[0];
  assert(record);
  session.Close();
  const reopened = createCalcSession(db);
  await reopened.fileWorkflows.OpenStored(record.id);
  const doc = reopened.controller.shell.GetDocument();
  expect(doc.GetValue(p)).toBe(9);
  expect(doc.GetValue(new ScAddress(2, 0, 0))).toBe(14);
  const full = doc.GetFormulaCell(new ScAddress(2, 0, 0));
  assert(full);
  expect(text(full.GetFormula(FormulaGrammar.Grammar.GRAM_NATIVE))).toBe("=SUM(A:A)");
  reopened.controller.Select(0, 1);
  reopened.controller.EnterString("10");
  expect(doc.GetValue(p)).toBe(16);
  expect(doc.GetValue(new ScAddress(2, 0, 0))).toBe(21);
  reopened.Close();
});

it("updates actual area identities through native remove-chain-reinsert and merges equal targets", /** Uses genuine scalar reference geometry,including overlapping slots and unchanged areas. @returns Nothing. */ () => {
  const doc = document(),
    machine = doc.GetBASM();
  assert(machine);
  const a = new Listener(),
    b = new Listener(),
    stationary = new Listener();
  const before = new ScRange(15, 127, 0, 16, 128, 0),
    after = new ScRange(16, 128, 0, 17, 129, 0);
  doc.StartListeningArea(before, false, a);
  doc.StartListeningArea(after, false, b);
  doc.StartListeningArea(new ScRange(30, 300, 0, 30, 301, 0), false, stationary);
  const original = a.owners[0];
  machine.EnterBulkBroadcast();
  machine.AreaBroadcast(new ScHint(SfxHintId.ScDataChanged, new ScAddress(15, 127, 0)));
  machine.UpdateBroadcastAreas(UpdateRefMode.URM_MOVE, after, 1, 1, 0);
  machine.LeaveBulkBroadcast(SfxHintId.ScDataChanged);
  const changed = a.hints.find(
    /** Selects original area changes. @param h - Hint. @returns Membership. */ (h) =>
      h instanceof ScAreaChangedHint,
  );
  assert(changed instanceof ScAreaChangedHint);
  expect(changed.GetRange().GetVars()).toEqual(after.GetVars());
  expect(changed.GetId()).toBe(SfxHintId.ScAreaChanged);
  expect(a.owners[0]).toBe(original);
  machine.AreaBroadcast(new ScHint(SfxHintId.ScDataChanged, new ScAddress(17, 129, 0)));
  expect(
    a.hints.filter(
      /** Selects original cell changes. @param h - Hint. @returns Membership. */ (h) =>
        h instanceof ScHint,
    ),
  ).toHaveLength(2);
  expect(
    b.hints.filter(
      /** Selects original cell changes. @param h - Hint. @returns Membership. */ (h) =>
        h instanceof ScHint,
    ),
  ).toHaveLength(1);
  expect(stationary.hints).toHaveLength(0);
  doc.EndListeningArea(after, false, a);
  doc.EndListeningArea(after, false, b);
  expect(a.HasBroadcaster()).toBe(false);
  expect(b.HasBroadcaster()).toBe(false);
  doc.Dispose();
});

it("retains native range recalculation after inserting and deleting preceding sheets", /** Exercises actual formula positions and document-owned area lifetimes. @returns Nothing. */ () => {
  const doc = document();
  const output = new ScAddress(2, 0, 1),
    input = new ScAddress(0, 0, 1);
  doc.SetValue(input, 3);
  doc.SetFormula(output, unicode("=SUM(A1:A2)"), grammar);
  expect(doc.GetValue(output)).toBe(3);
  expect(doc.InsertTab(0, unicode("Before"))).toBe(true);
  input.SetTab(2);
  output.SetTab(2);
  doc.SetValue(input, 7);
  expect(doc.GetValue(output)).toBe(7);
  expect(doc.DeleteTab(0)).toBe(true);
  input.SetTab(1);
  output.SetTab(1);
  doc.SetValue(input, 11);
  expect(doc.GetValue(output)).toBe(11);
  expect(doc.IsExpandRefs()).toBe(false);
  doc.SetExpandRefs(true);
  expect(doc.IsExpandRefs()).toBe(true);
  expect(doc.DeleteTab(1)).toBe(true);
  doc.Dispose();
});

it("skips later erased native entries without nested iteration resetting the erasure shortcut", /** Both registrations are real and are removed during the current slot callback. @returns Nothing. */ () => {
  const doc = document(),
    machine = doc.GetBASM();
  assert(machine);
  const first = new ScRange(0, 0, 0, 1, 1, 0),
    second = new ScRange(0, 0, 0, 2, 2, 0),
    a = new Listener(),
    b = new Listener();
  doc.StartListeningArea(first, false, a);
  doc.StartListeningArea(second, false, b);
  a.action = /** Removes the later actual area before its turn. @returns Nothing. */ () => {
    a.action = undefined;
    doc.EndListeningArea(second, false, b);
  };
  machine.AreaBroadcast(new ScHint(SfxHintId.ScDataChanged, new ScAddress()));
  expect(a.hints).toHaveLength(1);
  expect(b.hints).toHaveLength(0);
  doc.Dispose();
});

it("deletes contained original areas with bulk cleanup while preserving partially intersecting observers", /** Uses multiple actual slots and both native bulk states. @returns Nothing. */ () => {
  for (const bulk of [false, true]) {
    const doc = document(),
      machine = doc.GetBASM();
    assert(machine);
    const a = new Listener(),
      b = new Listener(),
      range = new ScRange(15, 127, 0, 16, 128, 0);
    doc.StartListeningArea(range, false, a);
    doc.StartListeningArea(new ScRange(14, 126, 0, 17, 129, 0), false, b);
    if (bulk) machine.EnterBulkBroadcast();
    machine.AreaBroadcast(new ScHint(SfxHintId.ScDataChanged, range.aStart));
    machine.DelBroadcastAreasInRange(range);
    expect(a.HasBroadcaster()).toBe(false);
    expect(b.HasBroadcaster()).toBe(true);
    if (bulk) machine.LeaveBulkBroadcast(SfxHintId.ScDataChanged);
    doc.Dispose();
  }
});

it("preserves native multi-area update chains and observes policy changes from actual area callbacks", /** Source callbacks can alter expansion before a later chain entry is recomputed. @returns Nothing. */ () => {
  const doc = document(),
    machine = doc.GetBASM();
  assert(machine);
  const a = new Listener(),
    b = new Listener(),
    stable = new Listener();
  doc.StartListeningArea(new ScRange(15, 2, 0, 16, 128, 0), false, a);
  doc.StartListeningArea(new ScRange(15, 0, 0, 16, 1, 0), false, b);
  doc.StartListeningArea(new ScRange(0, 0, 1, 0, 1, 1), false, stable);
  doc.SetExpandRefs(true);
  a.Notify =
    /** Applies a real document option from the source update hint. @param hint - Actual hint. @returns Nothing. */ (
      hint,
    ) => {
      a.hints.push(hint);
      if (hint instanceof ScAreaChangedHint) doc.SetExpandRefs(false);
    };
  machine.UpdateBroadcastAreas(
    UpdateRefMode.URM_INSDEL,
    new ScRange(0, 2, 0, doc.MaxCol(), doc.MaxRow(), 0),
    0,
    1,
    0,
  );
  expect(a.hints).toHaveLength(1);
  expect(b.hints).toHaveLength(0);
  machine.AreaBroadcast(new ScHint(SfxHintId.ScDataChanged, new ScAddress(15, 1, 0)));
  expect(b.hints).toHaveLength(1);
  expect(doc.InsertTab(1, unicode("Middle"))).toBe(true);
  expect(stable.hints).toHaveLength(1);
  doc.Dispose();
});

it("retains source identity guards when independently owned ordinary areas share the same value", /** Calls original public slot update services with actual owned areas,never fabricated fields. @returns Nothing. */ () => {
  const doc = document(),
    machine = doc.GetBASM();
  assert(machine);
  const slot = new ScBroadcastAreaSlot(doc, machine),
    a = new ScBroadcastArea(new ScRange()),
    b = new ScBroadcastArea(new ScRange());
  slot.UpdateInsert(a);
  slot.UpdateInsert(a);
  slot.UpdateRemoveArea(b);
  expect(a.GetRef()).toBe(1);
  expect(b.GetRef()).toBe(0);
  slot.Dispose();
  doc.Dispose();
});
