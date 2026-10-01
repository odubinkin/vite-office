/** @fileoverview Verifies real Writer handle mutations against unchanged native owners and independent lifecycle/delta assertions. */
import { expect, it, vi } from "vitest";
import { isDeepStrictEqual } from "node:util";
import cases from "../../../../test/writer-native-attribute-handles.json";
import { SfxItemSet, SfxItemState } from "../../../../svl/source/items/itemset";
import { SfxItemPool } from "../../../../svl/source/items/itempool";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import { type SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { SwAttrSet } from "../attr/swatrset";
import { SwDoc } from "../doc/doc";
import { WRITER_TEXT_NODE_WHICH_RANGES } from "../../../inc/hintids";
import { SwContentNode } from "./node";

/** Requires an actual fixture member. @param value - Candidate fixture value. @returns Present fixture value. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native handle fixture member");
  return value;
}

/** Projects the direct raw fixture states; inherited/default values are asserted separately. @param set - Retained or current actual set. @returns Direct numeric records or null. */
function snapshot(set: SwAttrSet | undefined): number[][] | null {
  if (set === undefined) return null;
  const items: number[][] = [];
  for (const which of [84, 85, 86, 87]) {
    const state = set.GetItemState(which, false);
    if (state === SfxItemState.SET)
      items.push([which, Number(set.Get(which, false).QueryValue()), 0]);
    if (state === SfxItemState.INVALID) items.push([which, 0, 1]);
    if (state === SfxItemState.DISABLED) items.push([which, 0, 2]);
  }
  return items;
}

it("matches unchanged native handle owners over300 sequences and1815 states", /** Compares real document nodes, retained handles and synchronous callback order in the bounded fresh-handle adapter profile. @returns Nothing. */ () => {
  let delta: [SwAttrSet | undefined, SwAttrSet | undefined] = [undefined, undefined];
  const put = SwAttrSet.prototype.Put_BC;
  const clear = SwAttrSet.prototype.ClearItem_BC;
  vi.spyOn(SwAttrSet.prototype, "Put_BC").mockImplementation(
    /** Observes real source-owned delta arguments without synthesizing values. @param this - Actual attribute receiver. @param source - Real source. @param oldSet - Old receiver. @param newSet - New receiver. @returns Real operation result. */
    function observePut(this: SwAttrSet, source, oldSet, newSet) {
      delta = [oldSet, newSet];
      return put.call(this, source, oldSet, newSet);
    },
  );
  vi.spyOn(SwAttrSet.prototype, "ClearItem_BC").mockImplementation(
    /** Observes single/range receivers without replacing native responsibilities. @param this - Actual attribute receiver. @param first - First WhichId. @param lastOrOld - Last WhichId or old receiver. @param oldOrNew - Old or new receiver. @param newSet - Range new receiver. @returns Real operation result. */
    function observeClear(
      this: SwAttrSet,
      first: number,
      lastOrOld?: number | SwAttrSet,
      oldOrNew?: SwAttrSet,
      newSet?: SwAttrSet,
    ) {
      delta = typeof lastOrOld === "number" ? [oldOrNew, newSet] : [lastOrOld, oldOrNew];
      return typeof lastOrOld === "number"
        ? clear.call(this, first, lastOrOld, oldOrNew, newSet)
        : (
            clear as (this: SwAttrSet, first: number, old?: SwAttrSet, next?: SwAttrSet) => number
          ).call(this, first, lastOrOld, oldOrNew);
    },
  );
  let states = 0;
  try {
    for (const [index, test] of cases.entries()) {
      const doc = new SwDoc();
      const node = required(doc.paragraphs[0]);
      let pending: number[] | undefined;
      const events: number[][] = [];
      const notify = doc.NotifyModelChange.bind(doc);
      doc.NotifyModelChange =
        /** Captures ownership and real deltas before nested callbacks. @param hint - Real model hint. @returns Nothing. */
        (hint) => {
          if (hint.kind === "attribute-set-changed") {
            events.push([
              required(node.GetpSwAttrSet()).Count(),
              required(delta[0]).Count(),
              required(delta[1]).Count(),
            ]);
            const action = pending;
            pending = undefined;
            if (action !== undefined) {
              const [kind, which, value] = action as [number, number, number];
              if (kind === 0)
                SwContentNode.prototype.SetAttr.call(node, new SfxInt16Item(which, value));
              if (kind === 1) SwContentNode.prototype.ResetAttr.call(node, which);
              if (kind === 2)
                doc.GetDfltTextFormatColl().GetAttrSet().Put(new SfxInt16Item(which, value));
            }
          }
          notify(hint);
        };
      for (const [step, op] of test.ops.entries()) {
        const [kind, which, value] = op as [number, number, number];
        const before = node.GetpSwAttrSet();
        events.splice(0);
        let result = -1;
        if (kind === 0)
          result = Number(
            SwContentNode.prototype.SetAttr.call(node, new SfxInt16Item(which, value)),
          );
        if (kind === 1) {
          const source = new SfxItemSet(doc.GetAttrPool(), WRITER_TEXT_NODE_WHICH_RANGES);
          for (let at = 1; at < op.length; at += 2)
            source.Put(new SfxInt16Item(required(op[at]), required(op[at + 1])));
          result = Number(SwContentNode.prototype.SetAttr.call(node, source));
        }
        if (kind === 2) result = Number(SwContentNode.prototype.ResetAttr.call(node, which, value));
        if (kind === 3) result = Number(SwContentNode.prototype.ResetAttr.call(node, op.slice(1)));
        if (kind === 4) result = SwContentNode.prototype.ResetAllAttr.call(node);
        if (kind === 5 || kind === 6) {
          if (!node.HasSwAttrSet())
            SwContentNode.prototype.SetAttr.call(
              node,
              new SfxItemSet(doc.GetAttrPool(), WRITER_TEXT_NODE_WHICH_RANGES),
            );
          if (kind === 5) required(node.GetpSwAttrSet()).InvalidateItem(which);
          else required(node.GetpSwAttrSet()).DisableItem(which);
        }
        if (kind === 7)
          result = Number(
            SwContentNode.prototype.SetAttr.call(
              node,
              new SfxItemSet(doc.GetAttrPool(), WRITER_TEXT_NODE_WHICH_RANGES),
            ),
          );
        if (kind === 8)
          doc.GetDfltTextFormatColl().GetAttrSet().Put(new SfxInt16Item(which, value));
        if (kind === 9) pending = op.slice(1);
        const actual = {
          result,
          same: before === node.GetpSwAttrSet(),
          current: snapshot(node.GetpSwAttrSet()),
          retained: snapshot(before),
          events: [...events],
        };
        if (!isDeepStrictEqual(actual, test.expected[step]))
          throw new Error(
            `Native handle case${index} step${step}: ${JSON.stringify({ op, actual, expected: test.expected[step] })}`,
          );
        states++;
      }
    }
  } finally {
    vi.restoreAllMocks();
  }
  expect(cases).toHaveLength(300);
  expect(states).toBe(1815);
});

it("retains empty handles on scalar/all no-ops but releases an empty vector handle", /** Independently checks the source overload distinction. @returns Nothing. */ () => {
  const doc = new SwDoc();
  const node = required(doc.paragraphs[0]);
  expect(node.SetAttr(new SfxItemSet(doc.GetAttrPool(), WRITER_TEXT_NODE_WHICH_RANGES))).toBe(
    false,
  );
  const empty = node.GetpSwAttrSet();
  expect(node.ResetAttr(84)).toBe(false);
  expect(node.GetpSwAttrSet()).toBe(empty);
  expect(node.ResetAttr(84, 83)).toBe(false);
  expect(node.GetpSwAttrSet()).toBe(empty);
  expect(node.ResetAllAttr()).toBe(0);
  expect(node.GetpSwAttrSet()).toBe(empty);
  expect(node.ResetAttr([])).toBe(false);
  expect(node.HasSwAttrSet()).toBe(false);
});

it("keeps retained values independent and broadcasts a still-owned cleared handle before nested writes", /** Checks source handle ownership through real text wrappers and model callbacks. @returns Nothing. */ () => {
  const doc = new SwDoc();
  const node = required(doc.paragraphs[0]);
  node.SetAttr(new SfxInt16Item(84, 4));
  const original = required(node.GetpSwAttrSet());
  node.SetAttr(new SfxInt16Item(84, 2));
  expect(original.Get(84).QueryValue()).toBe(4);
  const retained = required(node.GetpSwAttrSet());
  const observed: SwAttrSet[] = [];
  const notify = doc.NotifyModelChange.bind(doc);
  let pending = true;
  doc.NotifyModelChange =
    /** Retains the cleared handle and writes while notification is active. @param hint - Model hint. @returns Nothing. */
    (hint) => {
      if (hint.kind === "attribute-set-changed" && pending) {
        pending = false;
        const cleared = required(node.GetpSwAttrSet());
        expect(node.HasSwAttrSet()).toBe(true);
        expect(cleared.Count()).toBe(0);
        expect(cleared).not.toBe(retained);
        observed.push(cleared);
        node.SetAttr(new SfxInt16Item(84, 7));
      }
      notify(hint);
    };
  expect(node.ResetAllAttr()).toBe(1);
  expect(retained.Get(84).QueryValue()).toBe(2);
  expect(required(observed[0]).Count()).toBe(0);
  expect(node.GetAttr(84).QueryValue()).toBe(7);
  expect(node.HasSwAttrSet()).toBe(true);
});

it("collects inherited/default deltas while excluding sentinels and slot IDs", /** Asserts actual SwAttrSet delta values, category boundaries and receiver lifetime. @returns Nothing. */ () => {
  const doc = new SwDoc();
  const pool = doc.GetAttrPool();
  const parent = new SwAttrSet(pool, [[1, 6000]]);
  parent.Put(new SfxInt16Item(84, 3));
  const set = new SwAttrSet(pool, [[1, 6000]], parent);
  const old = new SwAttrSet(pool, [[1, 6000]]);
  const next = new SwAttrSet(pool, [[1, 6000]]);
  expect(set.Put_BC(new SfxInt16Item(84, 4), old, next)).toBe(true);
  expect(old.Get(84).QueryValue()).toBe(3);
  expect(next.Get(84).QueryValue()).toBe(4);
  expect(set.ClearItem_BC(84, old, next)).toBe(1);
  expect(old.Get(84).QueryValue()).toBe(4);
  expect(next.Get(84).QueryValue()).toBe(3);
  set.SetParent(undefined);
  expect(set.Put_BC(new SfxInt16Item(84, 2), old, undefined)).toBe(true);
  expect(old.Get(84).QueryValue()).toBe(0);
  expect(set.ClearItem_BC(84, undefined, next)).toBe(1);
  expect(next.Get(84).QueryValue()).toBe(0);
  set.Put(new SfxInt16Item(84, 7));
  expect(old.Get(84).QueryValue()).toBe(0);
  set.InvalidateItem(85);
  set.DisableItem(87);
  const freshOld = new SwAttrSet(pool, [[1, 6000]]);
  const freshNext = new SwAttrSet(pool, [[1, 6000]]);
  expect(set.ClearItem_BC(0, freshOld, freshNext)).toBe(3);
  expect(freshOld.Count()).toBe(1);
  expect(freshNext.Count()).toBe(1);
  expect(freshOld.Get(84).QueryValue()).toBe(7);
  expect(freshNext.Get(84).QueryValue()).toBe(0);
  expect(set.Put_BC(new SfxInt16Item(5000, 2), freshOld, freshNext)).toBe(true);
  expect(set.ClearItem_BC(5000, freshOld, freshNext)).toBe(1);
  expect(freshOld.Count()).toBe(1);
  expect(freshNext.Count()).toBe(1);
  expect(SfxItemPool.IsWhich(0)).toBe(false);
  expect(SfxItemPool.IsWhich(1)).toBe(true);
  expect(SfxItemPool.IsWhich(4999)).toBe(true);
  expect(SfxItemPool.IsWhich(5000)).toBe(false);
  expect(SfxItemPool.IsWhich(9)).toBe(true);
});

/** Observes storage from within the native pre-mutation hook. */
class ObservedSet extends SfxItemSet {
  public readonly counts: number[] = [];
  /** Captures the direct count before mutation. @param oldItem - Previous item. @param newItem - New item. @returns Nothing. */
  protected override Changed(
    oldItem: SfxPoolItem | undefined,
    newItem: SfxPoolItem | undefined,
  ): void {
    void oldItem;
    void newItem;
    this.counts.push(this.Count());
  }
}

it("calls storage Changed before replacement and removal", /** Checks the virtual storage boundary independently of Writer owner code. @returns Nothing. */ () => {
  const doc = new SwDoc();
  const set = new ObservedSet(doc.GetAttrPool(), [[84, 87]]);
  set.Put(new SfxInt16Item(84, 4));
  set.Put(new SfxInt16Item(84, 2));
  set.ClearItem(84);
  set.Put(new SfxInt16Item(84, 2));
  set.Put(new SfxInt16Item(86, 7));
  set.ClearItem();
  expect(set.counts).toEqual([0, 1, 1, 0, 1, 2, 2]);
});
