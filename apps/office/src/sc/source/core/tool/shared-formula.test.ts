/** @fileoverview Source-bound sharedformula.hxx/cxx topology and subscriptions on real column storage. */
import { assert, expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScAddress } from "../../../inc/address";
import { ScFormulaCell } from "../../../inc/formulacell";
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
