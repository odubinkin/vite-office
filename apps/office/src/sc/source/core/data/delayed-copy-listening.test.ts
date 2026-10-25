/** @fileoverview Native clipboard-copy listener scopes,adjacent-span batching and full intersected-group teardown. */
import { expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScAddress } from "../../../inc/address";
import { ScColumn } from "../../../inc/column";
import { StartListeningContext, EndListeningContext } from "../../../inc/listenercontext";
import {
  DelayFormulaGroupingSwitch,
  DelayStartListeningFormulaCells,
} from "../../../inc/scopetools";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
const grammar = FormulaGrammar.Grammar.GRAM_NATIVE;
/** Builds real separated or adjacent formula groups with native deferred construction. @param adjacent - Build adjacent groups. @returns Actual owners. */
function fixture(adjacent = false) {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const table = doc.FetchTable(0);
  if (!table) throw Error("Missing native sheet");
  const input = table.CreateColumnIfNotExists(0),
    column = table.CreateColumnIfNotExists(1),
    next = adjacent ? 3 : 6;
  for (let row = 0; row < 12; ++row) input.SetValue(row, 1);
  doc.SetInsertingFromOtherDoc(true);
  for (const first of [0, next])
    for (let row = first; row < first + 3; ++row)
      column.SetFormula(row, unicode(`=SUM(A${row + 1}:A${row + 3})${first ? "+1" : ""}`), grammar);
  doc.SetInsertingFromOtherDoc(false);
  column.StartListeningFormulaCells(
    new StartListeningContext(doc),
    new EndListeningContext(doc),
    0,
    next + 2,
  );
  return { doc, column, input, next };
}
it("preserves nested native listening policies and admits only overlapping or adjacent pending spans", /** Public return values observe real pending-span behavior without exposing private maps. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const col = doc.FetchTable(0)?.CreateColumnIfNotExists(0) as ScColumn;
  expect(doc.CanDelayStartListeningFormulaCells(col, 4, 5)).toBe(false);
  const inactive = new DelayStartListeningFormulaCells(col);
  inactive.Dispose();
  const off = new DelayStartListeningFormulaCells(col, false);
  off.Dispose();
  const outer = new DelayStartListeningFormulaCells(col, true);
  expect(doc.IsEnabledDelayStartListeningFormulaCells(col)).toBe(true);
  expect(doc.CanDelayStartListeningFormulaCells(col, 4, 5)).toBe(true);
  expect(doc.CanDelayStartListeningFormulaCells(col, 9, 10)).toBe(false);
  expect(doc.CanDelayStartListeningFormulaCells(col, 0, 1)).toBe(false);
  expect(doc.CanDelayStartListeningFormulaCells(col, 6, 7)).toBe(true);
  expect(doc.CanDelayStartListeningFormulaCells(col, 2, 3)).toBe(true);
  const inner = new DelayStartListeningFormulaCells(col);
  inner.set();
  inner.Dispose();
  expect(doc.CanDelayStartListeningFormulaCells(col, 9, 10)).toBe(false);
  const temporarilyOff = new DelayStartListeningFormulaCells(col, false);
  expect(doc.IsEnabledDelayStartListeningFormulaCells(col)).toBe(false);
  temporarilyOff.Dispose();
  expect(doc.IsEnabledDelayStartListeningFormulaCells(col)).toBe(true);
  outer.Dispose();
  expect(doc.IsEnabledDelayStartListeningFormulaCells(col)).toBe(false);
  doc.Dispose();
});
it.each([false, true])(
  "restores actual deferred group subscriptions with adjacent second span=%s",
  /** Real area listeners distinguish the immediate disjoint fallback from the deferred merged path. @param adjacent - Group arrangement. @returns Nothing. */ (
    adjacent,
  ) => {
    const { doc, column, input, next } = fixture(adjacent),
      first = column.GetFormulaCell(0)?.GetCellGroup(),
      second = column.GetFormulaCell(next)?.GetCellGroup();
    expect(first?.m_AreaListeners.size).toBe(1);
    expect(second?.m_AreaListeners.size).toBe(1);
    column.EndListeningFormulaCells(new EndListeningContext(doc), 0, next + 2);
    expect(first?.m_AreaListeners.size).toBe(0);
    expect(second?.m_AreaListeners.size).toBe(0);
    const delay = new DelayStartListeningFormulaCells(column, true);
    column.StartListeningUnshared([0, 2, next, next + 2]);
    expect(first?.m_AreaListeners.size).toBe(0);
    expect(second?.m_AreaListeners.size).toBe(adjacent ? 0 : 1);
    delay.Dispose();
    expect(first?.m_AreaListeners.size).toBe(1);
    expect(second?.m_AreaListeners.size).toBe(1);
    expect(doc.GetValue(new ScAddress(1, 0, 0))).toBe(3);
    input.SetValue(0, 5);
    expect(doc.GetValue(new ScAddress(1, 0, 0))).toBe(7);
    doc.Dispose();
  },
);
it("retains native start/end outputs for partial groups,singletons and formula-free intervals", /** The source end output is assigned only when a shared top is visited. @returns Nothing. */ () => {
  const { doc, column } = fixture(),
    end = new EndListeningContext(doc),
    first: [number] = [37],
    last: [number] = [38];
  column.EndListeningFormulaCells(end, 1, 1, first, last);
  expect([first[0], last[0]]).toEqual([0, 2]);
  column.SetFormula(10, unicode("=1"), grammar);
  column.EndListeningFormulaCells(end, 10, 10, first, last);
  expect([first[0], last[0]]).toEqual([10, -1]);
  column.EndListeningFormulaCells(end, 0, 10, first, last);
  expect([first[0], last[0]]).toEqual([10, 8]);
  column.EndListeningFormulaCells(end, 11, 11, first, last);
  expect([first[0], last[0]]).toEqual([-1, -1]);
  const empty = doc.FetchTable(0)?.CreateColumnIfNotExists(5) as ScColumn;
  first[0] = 37;
  last[0] = 38;
  empty.EndListeningFormulaCells(end, 0, 5, first, last);
  expect([first[0], last[0]]).toEqual([37, 38]);
  end.purgeEmptyBroadcasters();
  doc.Dispose();
});
it("restores nested native grouping scopes and explicit reset on actual formula owners", /** Regrouping is performed by the original document owner when delay ends. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const col = doc.FetchTable(0)?.CreateColumnIfNotExists(0) as ScColumn;
  const outer = new DelayFormulaGroupingSwitch(doc, true),
    inner = new DelayFormulaGroupingSwitch(doc, true);
  col.SetFormula(0, unicode("=B1+1"), grammar);
  col.SetFormula(1, unicode("=B2+1"), grammar);
  inner.Dispose();
  expect(doc.IsDelayedFormulaGrouping()).toBe(true);
  outer.reset();
  expect(doc.IsDelayedFormulaGrouping()).toBe(false);
  expect(col.GetFormulaCell(0)?.GetSharedLength()).toBe(2);
  outer.Dispose();
  doc.Dispose();
});
