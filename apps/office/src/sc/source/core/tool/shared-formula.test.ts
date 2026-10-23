/** @fileoverview Source-bound sharedformula.hxx/cxx topology and subscriptions on real column storage. */
import { assert, expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScAddress } from "../../../inc/address";
import { ScFormulaCell, ScFormulaCellGroup } from "../../../inc/formulacell";
import { SharedFormulaUtil } from "../../../inc/sharedformula";
import { StartListeningContext, EndListeningContext } from "../../../inc/listenercontext";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";

/** Actual initially unshared adjacent formulas and their borrowed block pointer. @param count - Number of members. @param formula - First member formula. @returns Native owners. */
function fixture(count: number, formula = "=SUM(A1:A3)") {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  doc.DelayFormulaGrouping(true);
  for (let row = 0; row < 10; row++) doc.SetValue(new ScAddress(0, row, 0), row + 1);
  const first = new ScFormulaCell(doc, new ScAddress(1, 2, 0), unicode(formula), doc.GetGrammar());
  doc.SetFormulaCell(first.aPos, first);
  for (let offset = 1; offset < count; offset++) {
    const position = new ScAddress(1, 2 + offset, 0);
    doc.SetFormulaCell(position, first.Clone(position));
  }
  const column = doc.FetchTable(0)?.FetchColumn(1);
  assert(column);
  const pointer = column.GetFormulaCellBlockAddress(2, [0]);
  assert(pointer);
  for (let offset = 0; offset < count; offset++)
    (pointer.copy().advance(offset).get() as ScFormulaCell).EndListeningTo(doc);
  SharedFormulaUtil.groupFormulaCells(pointer, pointer.copy().advance(count));
  doc.DelayFormulaGrouping(false);
  return { doc, column, pointer, first };
}
it("groups real cells and splits one owner into two with independent code and pending-listening flags", /** Source split operates within one contiguous mdds block. @returns Nothing. */ () => {
  const { doc, column, pointer, first } = fixture(6),
    group = first.GetCellGroup();
  assert(group);
  expect(group.mnLength).toBe(6);
  expect(group.mbInvariant).toBe(false);
  SharedFormulaUtil.startListeningAsGroup(new StartListeningContext(doc), pointer);
  expect(group.m_AreaListeners.size).toBe(1);
  const store = column.GetCellStore(),
    lower = doc.GetFormulaCell(new ScAddress(1, 5, 0));
  assert(lower);
  expect(SharedFormulaUtil.getSharedTopFormulaCell(store.position(5))).toBe(first);
  expect(
    SharedFormulaUtil.splitFormulaCellGroup(store.position(5), new EndListeningContext(doc)),
  ).toBe(true);
  expect(first.GetSharedLength()).toBe(3);
  expect(lower.GetSharedLength()).toBe(3);
  expect(lower.IsSharedTop()).toBe(true);
  expect(lower.GetCode()).not.toBe(first.GetCode());
  expect(lower.GetCode().EqualTokens(first.GetCode())).toBe(true);
  expect(first.NeedsListening()).toBe(true);
  expect(lower.NeedsListening()).toBe(true);
  expect(group.m_AreaListeners.size).toBe(0);
  expect(SharedFormulaUtil.splitFormulaCellGroup(store.position(5))).toBe(false);
  expect(SharedFormulaUtil.splitFormulaCellGroup(store.position(2))).toBe(false);
  expect(SharedFormulaUtil.splitFormulaCellGroup(store.position(0))).toBe(false);
  expect(SharedFormulaUtil.getSharedTopFormulaCell(store.position(0))).toBeNull();
  SharedFormulaUtil.startListeningAsGroup(new StartListeningContext(doc), pointer);
  SharedFormulaUtil.startListeningAsGroup(
    new StartListeningContext(doc),
    pointer.copy().advance(3),
  );
  doc.SetValue(new ScAddress(0, 0, 0), 100);
  expect(doc.GetValue(first.aPos)).toBe(105);
  expect(doc.GetValue(lower.aPos)).toBe(15);
  doc.Dispose();
});
it("ungroups single-cell remainders and preserves source top,bottom and middle unsharing lengths", /** Every topology uses initialized actual shared owners. @returns Nothing. */ () => {
  for (const [count, offset, upper, lower] of [
    [2, 0, 0, 0],
    [2, 1, 0, 0],
    [4, 0, 0, 3],
    [4, 3, 3, 0],
    [3, 1, 0, 0],
    [6, 2, 2, 3],
  ] as const) {
    const { doc, column, first } = fixture(count),
      address = new ScAddress(1, 2 + offset, 0),
      cell = doc.GetFormulaCell(address);
    assert(cell);
    SharedFormulaUtil.unshareFormulaCell(column.GetCellStore().position(address.Row()), cell);
    expect(cell.IsShared()).toBe(false);
    if (offset > 0) expect(first.GetSharedLength()).toBe(upper);
    if (offset + 1 < count)
      expect(doc.GetFormulaCell(new ScAddress(1, address.Row() + 1, 0))?.GetSharedLength()).toBe(
        lower,
      );
    SharedFormulaUtil.unshareFormulaCell(column.GetCellStore().position(address.Row()), cell);
    doc.Dispose();
  }
  for (const split of [3, 5]) {
    const { doc, column, first } = fixture(4),
      lower = doc.GetFormulaCell(new ScAddress(1, split, 0));
    assert(lower);
    expect(SharedFormulaUtil.splitFormulaCellGroup(column.GetCellStore().position(split))).toBe(
      true,
    );
    expect(split === 3 ? first.IsShared() : lower.IsShared()).toBe(false);
    expect(SharedFormulaUtil.splitFormulaCellGroup(column.GetCellStore().position(split))).toBe(
      false,
    );
    doc.Dispose();
  }
});
it("uses individual single-reference subscriptions and group area subscriptions together", /** The original enabled path scans lexical references rather than replacing all dependencies with per-cell areas. @returns Nothing. */ () => {
  const { doc, pointer, first } = fixture(3, "=A1+SUM($A$1:A3)"),
    group = first.GetCellGroup();
  assert(group);
  for (let offset = 0; offset < 3; offset++)
    (pointer.copy().advance(offset).get() as ScFormulaCell).SetNeedsListening(true);
  SharedFormulaUtil.startListeningAsGroup(new StartListeningContext(doc), pointer);
  expect(group.m_AreaListeners.size).toBe(1);
  const input = doc.FetchTable(0)?.FetchColumn(0);
  assert(input);
  expect(input.GetBroadcaster(0)?.HasListeners()).toBe(true);
  expect(input.GetBroadcaster(1)?.HasListeners()).toBe(true);
  expect(input.GetBroadcaster(2)?.HasListeners()).toBe(true);
  for (let offset = 0; offset < 3; offset++) {
    const cell = pointer.copy().advance(offset).get() as ScFormulaCell;
    expect(cell.NeedsListening()).toBe(false);
    expect(cell.GetValue()).toBe([7, 12, 18][offset]);
  }
  doc.SetValue(new ScAddress(0, 1, 0), 20);
  expect(first.GetValue()).toBe(25);
  group.endAllGroupListening(doc);
  expect(first.HasBroadcaster()).toBe(true);
  doc.Dispose();
});
it("retains separate adjacent groups for unequal source tokens and invariant groups for absolute references", /** Native template comparison controls actual code identity. @returns Nothing. */ () => {
  const { doc, column, first, pointer } = fixture(2, "=$A$1");
  expect(first.GetCellGroup()?.mbInvariant).toBe(true);
  const extra = new ScFormulaCell(doc, new ScAddress(1, 4, 0), unicode("=2"), doc.GetGrammar());
  doc.SetFormulaCell(extra.aPos, extra);
  // Storage mutation may invalidate borrowed pointers: acquire the real pointer again.
  const all = column.GetFormulaCellBlockAddress(2, [0]);
  assert(all);
  first.SetCellGroup(null);
  (all.copy().advance(1).get() as ScFormulaCell).SetCellGroup(null);
  SharedFormulaUtil.groupFormulaCells(all, all.copy().advance(3));
  expect(extra.IsShared()).toBe(false);
  expect(SharedFormulaUtil.getSharedTopFormulaCell(column.GetCellStore().position(4))).toBeNull();
  void pointer;
  expect(SharedFormulaUtil.splitFormulaCellGroup(column.GetCellStore().position(4))).toBe(false);
  doc.Dispose();
});
it("automatically joins,rejoins and splits real formulas through ordinary document edits", /** Standard SingleCellListening insertion uses original column join/detach affected-span restart. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  for (let row = 0; row < 9; row++) doc.SetValue(new ScAddress(0, row, 0), row + 1);
  for (const row of [2, 3, 6, 5, 4])
    doc.SetFormula(
      new ScAddress(1, row, 0),
      unicode(`=SUM(A${row - 1}:A${row + 1})`),
      doc.GetGrammar(),
    );
  const top = doc.GetFormulaCell(new ScAddress(1, 2, 0));
  assert(top);
  expect(top.GetSharedLength()).toBe(5);
  for (let row = 2; row <= 6; row++)
    expect(doc.GetFormulaCell(new ScAddress(1, row, 0))?.GetCode()).toBe(top.GetCode());
  doc.SetValue(new ScAddress(1, 4, 0), 99);
  expect(top.GetSharedLength()).toBe(2);
  const bottom = doc.GetFormulaCell(new ScAddress(1, 5, 0));
  assert(bottom);
  expect(bottom.GetSharedLength()).toBe(2);
  expect(bottom.GetCode()).not.toBe(top.GetCode());
  expect(top.GetCellGroup()?.m_AreaListeners.size).toBe(1);
  expect(bottom.GetCellGroup()?.m_AreaListeners.size).toBe(1);
  doc.SetValue(new ScAddress(0, 4, 0), 50);
  expect(doc.GetValue(bottom.aPos)).toBe(60);
  doc.SetFormula(new ScAddress(1, 4, 0), unicode("=SUM(A3:A5)"), doc.GetGrammar());
  expect(top.GetSharedLength()).toBe(5);
  doc.SetTextCell(top.aPos, unicode("text"));
  const next = doc.GetFormulaCell(new ScAddress(1, 3, 0));
  assert(next);
  expect(next.IsSharedTop()).toBe(true);
  expect(next.GetSharedLength()).toBe(4);
  doc.FetchTable(0)?.FetchColumn(1)?.Delete(6);
  expect(next.GetSharedLength()).toBe(3);
  doc.SetFormula(new ScAddress(1, 4, 0), unicode("=999"), doc.GetGrammar());
  expect(next.IsShared()).toBe(false);
  expect(doc.GetFormulaCell(new ScAddress(1, 5, 0))?.IsShared()).toBe(false);
  doc.Dispose();
});
it("regroups actual existing groups and singletons after original delayed-range accumulation", /** Nullable native range is retained on nested enable and cleared on disable. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  expect(doc.IsDelayedFormulaGrouping()).toBe(false);
  doc.DelayFormulaGrouping(true);
  doc.DelayFormulaGrouping(true);
  for (let row = 0; row < 6; row++)
    doc.SetFormula(new ScAddress(1, row, 0), unicode("=7"), doc.GetGrammar());
  const top = doc.GetFormulaCell(new ScAddress(1, 0, 0));
  assert(top);
  expect(top.IsShared()).toBe(false);
  doc.DelayFormulaGrouping(false);
  expect(doc.IsDelayedFormulaGrouping()).toBe(false);
  expect(top.GetSharedLength()).toBe(6);
  const column = doc.FetchTable(0)?.FetchColumn(1);
  assert(column);
  SharedFormulaUtil.splitFormulaCellGroup(column.GetCellStore().position(3));
  expect(top.GetSharedLength()).toBe(3);
  const positions: ScAddress[] = [];
  column.RegroupFormulaCells(positions);
  expect(top.GetSharedLength()).toBe(6);
  expect(
    positions.map(
      /** Reads each original changed-group position. @param p - Actual address. @returns Row. */ (
        p,
      ) => p.Row(),
    ),
  ).toEqual([3]);
  // Unsharing produces two real singleton gaps;regroup joins each native combination.
  SharedFormulaUtil.unshareFormulaCell(column.GetCellStore().position(0), top);
  column.RegroupFormulaCells();
  expect(top.GetSharedLength()).toBe(6);
  const last = doc.GetFormulaCell(new ScAddress(1, 5, 0));
  assert(last);
  SharedFormulaUtil.unshareFormulaCell(column.GetCellStore().position(5), last);
  column.RegroupFormulaCells();
  expect(top.GetSharedLength()).toBe(6);
  doc.RegroupFormulaCells(5, 1);
  doc.RegroupFormulaCells(0, 5);
  doc.RegroupFormulaCells(0, -1);
  doc.DelayFormulaGrouping(true);
  doc.DelayFormulaGrouping(false);
  doc.Dispose();
});
it("backtracks and extends partial group listening spans using the original block handler", /** Context teardown covers members outside requested bounds before restoring the one real group area. @returns Nothing. */ () => {
  const { doc, column, first } = fixture(5);
  const start = new StartListeningContext(doc),
    end = new EndListeningContext(doc);
  column.StartListeningFormulaCells(start, end, 4, 4);
  expect(first.GetCellGroup()?.m_AreaListeners.size).toBe(1);
  expect(first.GetValue()).toBe(6);
  doc.SetValue(new ScAddress(0, 0, 0), 10);
  expect(first.GetValue()).toBe(15);
  column.StartListeningFormulaCells(start, end, 0, 1);
  const empty = doc.FetchTable(0)?.CreateColumnIfNotExists(3);
  assert(empty);
  empty.StartListeningFormulaCells(start, end, 0, 5);
  expect(empty.HasFormulaCell()).toBe(false);
  doc.Dispose();
});
it("preserves unequal groups and singletons during whole-column regrouping", /** Existing native groups are skipped as units without reparsing their members. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  doc.DelayFormulaGrouping(true);
  for (const [row, value] of [1, 2, 2, 3].entries())
    doc.SetFormula(new ScAddress(0, row, 0), unicode(`=${value}`), doc.GetGrammar());
  doc.DelayFormulaGrouping(false);
  const column = doc.FetchTable(0)?.FetchColumn(0);
  assert(column);
  column.RegroupFormulaCells();
  for (const [row, length] of [0, 2, 2, 0].entries())
    expect(doc.GetFormulaCell(new ScAddress(0, row, 0))?.GetSharedLength()).toBe(length);
  doc.Dispose();
});
it("retains fixed references,always subscriptions and invalid relative-row termination", /** Native lexical reference traversal continues after registering the always area. @returns Nothing. */ () => {
  const { doc, column, pointer, first } = fixture(2, "=SUM($A$1:$A$3)+$A$1"),
    group = first.GetCellGroup();
  assert(group);
  group.mpCode?.SetExclusiveRecalcModeAlways();
  SharedFormulaUtil.startListeningAsGroup(new StartListeningContext(doc), pointer);
  expect(group.m_AreaListeners.size).toBe(2);
  expect(first.GetValue()).toBe(7);
  doc.SetValue(new ScAddress(0, 0, 0), 10);
  expect(first.GetValue()).toBe(25);
  const singleton = new ScFormulaCell(doc, new ScAddress(1, 8, 0), unicode("=2"), doc.GetGrammar());
  doc.SetFormulaCell(singleton.aPos, singleton);
  const singlePointer = column.GetFormulaCellBlockAddress(8, [0]);
  assert(singlePointer);
  expect(
    /** Rejects a real singleton passed to the native group-only boundary. @returns Nothing. */ () =>
      SharedFormulaUtil.startListeningAsGroup(new StartListeningContext(doc), singlePointer),
  ).toThrow("Expected shared top");
  doc.Dispose();
  const tail = fixture(2, "=A1048576"),
    tailPointer = tail.column.GetFormulaCellBlockAddress(2, [0]);
  assert(tailPointer);
  SharedFormulaUtil.startListeningAsGroup(new StartListeningContext(tail.doc), tailPointer);
  expect(
    tail.doc.FetchTable(0)?.FetchColumn(0)?.GetBroadcaster(tail.doc.MaxRow())?.HasListeners(),
  ).toBe(true);
  tail.doc.Dispose();
});
it("adopts compiled formulas with table group conversion and preserves subscriptions when extending a group", /** Table2 explicitly selects ConvertToGroupListening while the column default remains SingleCellListening. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  for (let row = 0; row < 6; row++) doc.SetValue(new ScAddress(0, row, 0), row + 1);
  for (let row = 0; row < 4; row++) {
    const position = new ScAddress(1, row, 0),
      cell = new ScFormulaCell(
        doc,
        position,
        unicode(`=SUM(A${row + 1}:A${row + 3})`),
        doc.GetGrammar(),
      );
    doc.SetFormulaCell(position, cell);
  }
  const top = doc.GetFormulaCell(new ScAddress(1, 0, 0));
  assert(top);
  expect(top.GetSharedLength()).toBe(4);
  expect(top.GetCellGroup()?.m_AreaListeners.size).toBe(1);
  doc.SetValue(new ScAddress(0, 1, 0), 20);
  expect(doc.GetValue(top.aPos)).toBe(24);
  expect(doc.GetValue(new ScAddress(1, 1, 0))).toBe(27);
  doc.Dispose();
});
it("records deferred-listening flags on native surviving groups and singletons", /** NoListening callers use real native groups and context-owned subscriptions. @returns Nothing. */ () => {
  const { doc, column, pointer } = fixture(5, "=$A$1");
  SharedFormulaUtil.startListeningAsGroup(new StartListeningContext(doc), pointer);
  const position = new ScAddress(1, 4, 0),
    replacement = new ScFormulaCell(doc, position, unicode("=2"), doc.GetGrammar());
  column.SetFormulaCell(4, replacement, 2);
  for (const row of [2, 3, 5, 6])
    expect(doc.GetFormulaCell(new ScAddress(1, row, 0))?.NeedsListening()).toBe(true);
  column.SetNeedsListeningGroup(4);
  expect(replacement.NeedsListening()).toBe(true);
  column.SetNeedsListeningGroup(6);
  column.SetNeedsListeningGroup(5);
  column.SetNeedsListeningGroup(0);
  doc.Dispose();
});
it("disposes rejected compiled owners at the actual document and table adoption boundaries", /** Semantic disposal ends real subscriptions without manufacturing physical deletion. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  for (const target of [new ScAddress(1, 1, 4), new ScAddress(-1, 1, 0)]) {
    const cell = new ScFormulaCell(doc, new ScAddress(1, 1, 0), unicode("=A1"), doc.GetGrammar());
    cell.StartListeningTo(doc);
    expect(cell.HasBroadcaster()).toBe(true);
    expect(doc.SetFormulaCell(target, cell)).toBeNull();
    expect(cell.HasBroadcaster()).toBe(false);
  }
  doc.Dispose();
});

it("retains already deferred flags through a second native NoListening replacement", /** Repeated actual column edits preserve pending survivors without resetting or fabricating their flags. @returns Nothing. */ () => {
  const { doc, column } = fixture(5, "=$A$1");
  column.SetFormulaCell(
    2,
    new ScFormulaCell(doc, new ScAddress(1, 2, 0), unicode("=2"), doc.GetGrammar()),
    2,
  );
  expect(doc.GetFormulaCell(new ScAddress(1, 3, 0))?.NeedsListening()).toBe(true);
  column.SetFormulaCell(
    4,
    new ScFormulaCell(doc, new ScAddress(1, 4, 0), unicode("=3"), doc.GetGrammar()),
    2,
  );
  expect(doc.GetFormulaCell(new ScAddress(1, 3, 0))?.NeedsListening()).toBe(true);
  doc.Dispose();
});
it.each(["=$A$1+A1", "=SUM($A$1:$A$2)+SUM(A1:A2)"])(
  "skips genuine invalid references in automatically grouped relocated formulas: %s",
  /** Both copied formulas cross the first column while retaining valid absolute references and actual grouping/listening owners. @param input - Formula. @returns Nothing. */ (
    input,
  ) => {
    const doc = new ScDocument();
    doc.InsertTab(0, unicode("Data"));
    const source = new ScFormulaCell(doc, new ScAddress(1, 1, 0), unicode(input), doc.GetGrammar());
    for (let row = 2; row < 4; row++) {
      const pos = new ScAddress(0, row, 0);
      doc.SetFormulaCell(pos, source.Clone(pos));
    }
    const top = doc.GetFormulaCell(new ScAddress(0, 2, 0));
    assert(top);
    expect(top.GetSharedLength()).toBe(2);
    const column = doc.FetchTable(0)?.FetchColumn(0);
    assert(column);
    column.StartListeningFormulaCells(
      new StartListeningContext(doc),
      new EndListeningContext(doc),
      2,
      3,
    );
    source.Dispose();
    doc.Dispose();
  },
);

it("rejects group-listening before replaced shared code has been synchronized", /** The real public code replacement/synchronization lifecycle preserves borrowed-code identity. @returns Nothing. */ () => {
  const { doc, column, first, pointer } = fixture(3);
  const group = first.GetCellGroup();
  assert(group);
  assert(group.mpCode);
  group.setCode(group.mpCode.CloneValue());
  expect(
    /** Native shared-code precondition catches an unfinished code replacement. @returns No subscription. */ () =>
      SharedFormulaUtil.startListeningAsGroup(new StartListeningContext(doc), pointer),
  ).toThrow("Shared code differs");
  for (let row = 2; row < 5; row++) column.GetFormulaCell(row)?.SyncSharedCode();
  SharedFormulaUtil.startListeningAsGroup(new StartListeningContext(doc), pointer);
  expect(first.GetCode()).toBe(group.mpCode);
  doc.Dispose();
});
it.each(["different", "merge", "extend"] as const)(
  "validates an unfinished native group adoption before regrouping: %s",
  /** Public group construction can precede complete column adoption;native RegroupFormulaCells must reject an overlong incoming span. @param kind - Original validation path. @returns Nothing. */ (
    kind,
  ) => {
    const doc = new ScDocument();
    doc.InsertTab(0, unicode("Data"));
    doc.DelayFormulaGrouping(true);
    const column = doc.FetchTable(0)?.CreateColumnIfNotExists(1);
    assert(column);
    /** Adopts actual native predeclared group members,leaving the caller-specified remainder pending. @param start - Top row. @param length - Declared total. @param adopted - Present prefix. @returns Nothing. */
    function adopt(start: number, length: number, adopted: number): void {
      const template = new ScFormulaCell(
          doc,
          new ScAddress(1, start, 0),
          unicode("=7"),
          doc.GetGrammar(),
        ),
        group = new ScFormulaCellGroup();
      group.setCode(template.GetCode().CloneValue());
      group.mnLength = length;
      for (let offset = 0; offset < adopted; offset++) {
        const cell = new ScFormulaCell(
          doc,
          new ScAddress(1, start + offset, 0),
          group,
          doc.GetGrammar(),
        );
        if (!offset) group.mpTopCell = cell;
        column?.SetFormulaCell(start + offset, cell, 1);
      }
      template.Dispose();
    }
    if (kind === "merge") {
      adopt(0, 2, 2);
      adopt(2, 3, 2);
    } else {
      column.SetFormulaCell(
        0,
        new ScFormulaCell(
          doc,
          new ScAddress(1, 0, 0),
          unicode(kind === "different" ? "=8" : "=7"),
          doc.GetGrammar(),
        ),
        1,
      );
      adopt(1, 2, 1);
    }
    expect(
      /** Native IllegalArgumentException boundary rejects a span whose pending members are not adopted yet. @returns No completed regroup. */ () =>
        column.RegroupFormulaCells(),
    ).toThrow("Shared group exceeds formula block");
    doc.Dispose();
  },
);

it.each(["split", "unshare"] as const)(
  "retains native pending-group span assertions during %s",
  /** Real predeclared groups enter the column through native constructors;partial adoption must be diagnosed before any out-of-block traversal. @param operation - Native helper. @returns Nothing. */ (
    operation,
  ) => {
    const doc = new ScDocument();
    doc.InsertTab(0, unicode("Data"));
    doc.DelayFormulaGrouping(true);
    const column = doc.FetchTable(0)?.CreateColumnIfNotExists(1);
    assert(column);
    /** Creates a genuine incoming group whose final member is still pending adoption. @param row - Top. @param length - Declared count. @param count - Adopted prefix. @returns Group. */
    function incoming(row: number, length: number, count: number): ScFormulaCellGroup {
      const source = new ScFormulaCell(
          doc,
          new ScAddress(1, row, 0),
          unicode("=7"),
          doc.GetGrammar(),
        ),
        group = new ScFormulaCellGroup();
      group.setCode(source.GetCode().CloneValue());
      group.mnLength = length;
      for (let offset = 0; offset < count; offset++) {
        const cell = new ScFormulaCell(
          doc,
          new ScAddress(1, row + offset, 0),
          group,
          doc.GetGrammar(),
        );
        if (!offset) group.mpTopCell = cell;
        column?.SetFormulaCell(row + offset, cell, 1);
      }
      source.Dispose();
      return group;
    }
    if (operation === "split") {
      incoming(0, 4, 2);
      expect(
        /** Splitting cannot traverse the pending tail. @returns No complete split. */ () =>
          SharedFormulaUtil.splitFormulaCellGroup(column.GetCellStore().position(1)),
      ).toThrow("goes beyond the formula block");
    } else {
      incoming(0, 4, 3);
      const member = column.GetFormulaCell(1);
      assert(member);
      expect(
        /** Unsharing cannot traverse the pending tail. @returns No complete unshare. */ () =>
          SharedFormulaUtil.unshareFormulaCell(column.GetCellStore().position(1), member),
      ).toThrow("goes beyond the formula block");
    }
    doc.Dispose();
  },
);

it("diagnoses public adoption arguments whose row and formula position disagree", /** Actual native constructors and column calls preserve coordinate preconditions;no private cell/store field is changed. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const column = doc.FetchTable(0)?.CreateColumnIfNotExists(1);
  assert(column);
  const first = new ScFormulaCell(doc, new ScAddress(1, 2, 0), unicode("=7"), doc.GetGrammar()),
    second = new ScFormulaCell(doc, new ScAddress(1, 1, 0), unicode("=7"), doc.GetGrammar());
  column.SetFormulaCell(0, first, 1);
  expect(
    /** Native adjacent adoption validates the upper cell position. @returns No completed join. */ () =>
      column.SetFormulaCell(1, second, 1),
  ).toThrow("Formula row differs from block position");
  expect(
    /** Native regroup validates the previous actual formula coordinate. @returns No regroup. */ () =>
      column.RegroupFormulaCells(),
  ).toThrow("Previous formula row differs from storage");
  doc.Dispose();
});
it("requires native top metadata to be committed before flagging a prepended member", /** These are the original public SetCellGroup,mpTopCell,length mutation steps used by native regroup;premature flag traversal is diagnosed. @returns Nothing. */ () => {
  const { doc, column, first } = fixture(2, "=7"),
    group = first.GetCellGroup();
  assert(group);
  doc.DelayFormulaGrouping(true);
  const above = new ScFormulaCell(doc, new ScAddress(1, 1, 0), unicode("=7"), doc.GetGrammar());
  column.SetFormulaCell(1, above, 1);
  above.SetCellGroup(group);
  expect(
    /** Source precondition prevents traversal with the old top during ownership handover. @returns No flags. */ () =>
      column.SetNeedsListeningGroup(1),
  ).toThrow("Negative shared top delta");
  group.mpTopCell = above;
  ++group.mnLength;
  column.SetNeedsListeningGroup(1);
  for (let row = 1; row < 4; row++) expect(column.GetFormulaCell(row)?.NeedsListening()).toBe(true);
  doc.Dispose();
});
it("requires the adopted incoming top identity before group traversal", /** A live detached top and its incoming replacement use genuine group constructors;the original identity assertion protects the handover. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const column = doc.FetchTable(0)?.CreateColumnIfNotExists(1);
  assert(column);
  const source = new ScFormulaCell(doc, new ScAddress(1, 0, 0), unicode("=7"), doc.GetGrammar()),
    group = new ScFormulaCellGroup();
  group.setCode(source.GetCode().CloneValue());
  group.mnLength = 2;
  const detached = new ScFormulaCell(doc, new ScAddress(1, 0, 0), group, doc.GetGrammar());
  group.mpTopCell = detached;
  const incoming = new ScFormulaCell(doc, new ScAddress(1, 0, 0), group, doc.GetGrammar());
  column.SetFormulaCell(0, incoming, 1);
  expect(
    /** Actual top pointer must match the adopted cell. @returns No flags. */ () =>
      column.SetNeedsListeningGroup(0),
  ).toThrow("Shared top differs from store");
  expect(
    /** A pending top cannot be traversed as a singleton. @returns No subscriptions. */ () =>
      column.StartListeningFormulaCells(
        new StartListeningContext(doc),
        new EndListeningContext(doc),
        0,
        0,
      ),
  ).toThrow("Expected singleton or shared top");
  group.mpTopCell = incoming;
  column.SetFormulaCell(
    1,
    new ScFormulaCell(doc, new ScAddress(1, 1, 0), group, doc.GetGrammar()),
    1,
  );
  column.SetNeedsListeningGroup(0);
  expect(incoming.NeedsListening()).toBe(true);
  doc.Dispose();
  detached.Dispose();
  source.Dispose();
});

it("diagnoses an invalid public group adoption row before restarting recorded survivors", /** Native constructors declare positions separately from ScColumn adoption arguments;the source assertion rejects their disagreement without a private store replacement. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const column = doc.FetchTable(0)?.CreateColumnIfNotExists(1);
  assert(column);
  const source = new ScFormulaCell(doc, new ScAddress(1, 2, 0), unicode("=7"), doc.GetGrammar()),
    group = new ScFormulaCellGroup();
  group.setCode(source.GetCode().CloneValue());
  group.mnLength = 2;
  const top = new ScFormulaCell(doc, new ScAddress(1, 2, 0), group, doc.GetGrammar());
  group.mpTopCell = top;
  column.SetFormulaCell(0, top, 1);
  column.SetFormulaCell(
    1,
    new ScFormulaCell(doc, new ScAddress(1, 3, 0), group, doc.GetGrammar()),
    1,
  );
  const replacement = new ScFormulaCell(
    doc,
    new ScAddress(1, 0, 0),
    unicode("=8"),
    doc.GetGrammar(),
  );
  expect(
    /** Source survivor precondition prevents dereferencing a missing recorded formula. @returns No completed adoption. */ () =>
      column.SetFormulaCell(0, replacement, 2),
  ).toThrow("Missing surviving formula top");
  doc.Dispose();
  source.Dispose();
});

it("retains native zero-tail split behavior for an invalid public adoption coordinate", /** The constructor's reference position and column row are independent public inputs;the original split path retains its zero-lower-part behavior for their disagreement. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const column = doc.FetchTable(0)?.CreateColumnIfNotExists(1);
  assert(column);
  const source = new ScFormulaCell(doc, new ScAddress(1, 0, 0), unicode("=7"), doc.GetGrammar()),
    group = new ScFormulaCellGroup();
  group.setCode(source.GetCode().CloneValue());
  group.mnLength = 2;
  const top = new ScFormulaCell(doc, new ScAddress(1, 0, 0), group, doc.GetGrammar());
  group.mpTopCell = top;
  column.SetFormulaCell(0, top, 1);
  column.SetFormulaCell(
    1,
    new ScFormulaCell(doc, new ScAddress(1, 1, 0), unicode("=8"), doc.GetGrammar()),
    1,
  );
  const tail = new ScFormulaCell(doc, new ScAddress(1, 1, 0), group, doc.GetGrammar());
  column.SetFormulaCell(2, tail, 1);
  expect(SharedFormulaUtil.splitFormulaCellGroup(column.GetCellStore().position(2))).toBe(true);
  expect(top.GetSharedLength()).toBe(2);
  doc.Dispose();
  source.Dispose();
});
