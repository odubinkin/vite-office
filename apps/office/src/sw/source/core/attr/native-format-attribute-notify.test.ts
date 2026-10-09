/** @fileoverview Verifies native original format attribute changes, locking and inherited delta filtering without upstream runtime. */
import { expect, it, vi } from "vitest";
import { SvtListener, type SvtDyingHint } from "../../../../svl/source/notify/listener";
import { SwDoc } from "../doc/doc";
import { SwAttrSet } from "./swatrset";
import { SwClient, SwModify, ClientNotifyAttrChg } from "../../../inc/calbck";
import { AttrSetChangeHint, SwAttrSetChg, type SwModelHint } from "../../../inc/hints";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SwFormatVertOrient } from "../../../inc/fmtornt";
import { SvxBoxItem, SvxProtectItem } from "../../../../editeng/source/items/frmitems";
import { SfxItemSet, SfxItemState } from "../../../../svl/source/items/itemset";
import { SfxUInt16Item, SfxUInt32Item } from "../../../../svl/source/items/intitem";
import { CntUInt32Item } from "../../../../svl/source/items/cintitem";
import type { SfxPoolItemValue } from "../../../../svl/source/items/poolitem";
import {
  SwTableBoxNumFormat,
  SwTableBoxFormula,
  SwTableBoxValue,
  getSwDefaultTextFormat,
} from "./cellatr";
import { SwRowFrame, SwCellFrame } from "../layout/tabfrm";
/** Requires an original owner. @param value - Optional owner. @returns Native owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing native attribute change");
  return value;
}
/** Collects actual native hints at an original registered source. @param format - Native owner. @returns Original client and ordered hints. */
function observe(format: SwModify) {
  const hints: SwModelHint[] = [];
  const client = new SwClient(
    /** Captures actual native hint references. @param source - Original emitting source. @param hint - Borrowed native hint. @returns Nothing. */ (
      source,
      hint,
    ) => {
      expect(source).toBe(format);
      hints.push(hint);
    },
  );
  client.RegisterToModify(format);
  return { client, hints };
}
/** Extracts original native deltas. @param hint - Recorded original hint. @returns Typed native change. */
function native(hint: SwModelHint | undefined): AttrSetChangeHint {
  expect(hint).toBeInstanceOf(AttrSetChangeHint);
  return hint as AttrSetChangeHint;
}
it("native change descriptors borrow originals and copy only independently owned delta items", /** Checks exact native ownership, copy and clearing contracts. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    format = doc.MakeTableBoxFormat(),
    source = format.GetAttrSet(),
    delta = new SwAttrSet(doc.GetAttrPool(), source.GetRanges());
  delta.Put(new SwFormatVertOrient(720, 3, 7));
  const borrowed = new SwAttrSetChg(source, delta),
    copy = new SwAttrSetChg(borrowed),
    hint = new AttrSetChangeHint(borrowed, copy);
  expect(borrowed.GetTheChgdSet()).toBe(source);
  expect(borrowed.GetChgSet()).toBe(delta);
  expect(copy.GetTheChgdSet()).toBe(source);
  expect(copy.GetChgSet()).not.toBe(delta);
  expect(copy.GetChgSet().Get(109)).toEqual(delta.Get(109));
  expect(copy.GetChgSet().Get(109)).not.toBe(delta.Get(109));
  expect(hint.m_pOld).toBe(borrowed);
  expect(hint.m_pNew).toBe(copy);
  expect(copy.Count()).toBe(1);
  copy.ClearItem(109);
  expect(copy.Count()).toBe(0);
  expect(borrowed.Count()).toBe(1);
});
it("single native item mutation publishes precise effective deltas to original clients before the native notifier", /** Checks storage, lock and original hint identity. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    format = doc.MakeTableBoxFormat(),
    events: unknown[] = [];
  const a = new SwClient(
    /** Reads exact original values while native modify is locked. @param source - Original format. @param hint - Native change. @returns Nothing. */ (
      source,
      hint,
    ) => {
      const h = native(hint);
      events.push(["native", source, h, format.IsModifyLocked()]);
      expect(format.GetVertOrient()).toEqual(new SwFormatVertOrient(720, 3, 7));
      expect(required(h.m_pOld).GetChgSet().Get(109)).toEqual(new SwFormatVertOrient());
      expect(required(h.m_pNew).GetChgSet().Get(109)).toEqual(new SwFormatVertOrient(720, 3, 7));
      expect(required(h.m_pOld).GetTheChgdSet()).toBe(format.GetAttrSet());
      expect(required(h.m_pNew).GetTheChgdSet()).toBe(format.GetAttrSet());
    },
  );
  a.RegisterToModify(format);
  const b = observe(format);
  const revision = doc.GetDocumentStateManager().GetModelRevision();
  const documentSignal = vi.spyOn(doc.GetDocumentStateManager(), "CallSwClientNotify");
  /** Original native notifier receiver, independent of Writer clients. */
  class Observer extends SvtListener<SwModelHint> {
    /** Observes the same original native hint after Writer clients under the modify lock. @param hint - Original native notification. @returns Nothing. */
    public override Notify(hint: SwModelHint | SvtDyingHint): void {
      events.push(["notifier", native(hint as SwModelHint), format.IsModifyLocked()]);
    }
  }
  const device = new Observer();
  device.StartListening(format.GetNotifier());
  expect(format.SetFormatAttr(new SwFormatVertOrient(720, 3, 7))).toBe(true);
  expect(events[0]).toEqual(["native", format, b.hints[0], true]);
  expect(events[1]).toEqual(["notifier", b.hints[0], true]);
  expect(documentSignal).not.toHaveBeenCalled();
  expect(events).toHaveLength(2);
  expect(doc.GetDocumentStateManager().GetModelRevision()).toBe(revision);
  expect(format.SetFormatAttr(new SwFormatVertOrient(720, 3, 7))).toBe(false);
  expect(b.hints).toHaveLength(1);
  expect(events).toHaveLength(2);
  a.Dispose();
  b.client.Dispose();
  device.Dispose();
  documentSignal.mockRestore();
});
it("native multi-item changes and reset ranges retain inherited old and effective default new values", /** Checks atomic deltas, no-ops, and reset return contracts. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    parent = doc.MakeTableBoxFormat(),
    format = doc.MakeTableBoxFormat(),
    set = new SwAttrSet(doc.GetAttrPool(), format.GetAttrSet().GetRanges());
  parent.SetFormatAttr(new SwFormatVertOrient(240, 3, 7));
  format.SetDerivedFrom(parent);
  const o = observe(format);
  set.Put(new SwFormatFrameSize(SwFrameSize.Fixed, 6000, 500));
  set.Put(new SwFormatVertOrient(720, 2, 8));
  expect(format.SetFormatAttrSet(set)).toBe(true);
  expect(o.hints).toHaveLength(1);
  let h = native(o.hints[0]);
  expect(required(h.m_pNew).Count()).toBe(2);
  expect(required(h.m_pOld).GetChgSet().Get(109)).toEqual(new SwFormatVertOrient(240, 3, 7));
  expect(format.SetFormatAttrSet(set)).toBe(false);
  expect(format.SetFormatAttrSet(new SwAttrSet(doc.GetAttrPool(), set.GetRanges()))).toBe(false);
  expect(format.ResetFormatAttr(90, 89)).toBe(true);
  h = native(o.hints[1]);
  expect(required(h.m_pOld).GetChgSet().Get(90)).toEqual(
    new SwFormatFrameSize(SwFrameSize.Fixed, 6000, 500),
  );
  expect(required(h.m_pNew).GetChgSet().Get(90)).toEqual(new SwFormatFrameSize());
  expect(format.ResetFormatAttr(90)).toBe(false);
  expect(format.ResetAllFormatAttr()).toBe(1);
  h = native(o.hints[2]);
  expect(required(h.m_pNew).GetChgSet().Get(109)).toEqual(new SwFormatVertOrient(240, 3, 7));
  expect(format.ResetAllFormatAttr()).toBe(0);
  expect(format.ResetFormatAttr(109, 113)).toBe(false);
  expect(o.hints).toHaveLength(3);
  o.client.Dispose();
});
it("native boolean modify lock suppresses single set set-copy and all reset notifications while retaining mutations", /** Checks every represented locked mutation branch without a depth-counter shim. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    format = doc.MakeTableBoxFormat(),
    o = observe(format),
    set = new SwAttrSet(doc.GetAttrPool(), format.GetAttrSet().GetRanges());
  set.Put(new SwFormatFrameSize(SwFrameSize.Fixed, 6000, 500));
  set.Put(new SwFormatVertOrient(720, 3, 7));
  expect(format.IsModifyLocked()).toBe(false);
  format.LockModify();
  format.LockModify();
  expect(format.SetFormatAttr(new SwFormatVertOrient(240, 3, 7))).toBe(true);
  expect(format.SetFormatAttrSet(set)).toBe(true);
  expect(format.ResetFormatAttr(109)).toBe(true);
  format.SetFormatAttrSet(set);
  expect(format.ResetFormatAttr(90, 109)).toBe(true);
  format.SetFormatAttrSet(set);
  expect(format.ResetAllFormatAttr()).toBe(2);
  expect(o.hints).toEqual([]);
  format.UnlockModify();
  expect(format.IsModifyLocked()).toBe(false);
  format.SetFormatAttr(new SwFormatVertOrient(720, 3, 7));
  expect(o.hints).toHaveLength(1);
  o.client.Dispose();
});
it("original parent format clients filter every local WhichId and reparent without graph copies", /** Checks inherited native borrowed identity and filtered copy ownership. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    parent = doc.MakeTableBoxFormat(),
    child = doc.MakeTableBoxFormat(),
    peer = doc.MakeTableBoxFormat();
  child.SetDerivedFrom(parent);
  peer.SetDerivedFrom(parent);
  child.SetFormatAttr(new SwFormatVertOrient(240, 3, 7));
  const c = observe(child),
    p = observe(peer),
    root = observe(parent);
  const set = new SwAttrSet(doc.GetAttrPool(), parent.GetAttrSet().GetRanges());
  set.Put(new SwFormatVertOrient(720, 2, 8));
  set.Put(new SwFormatFrameSize(SwFrameSize.Fixed, 6000, 500));
  parent.SetFormatAttrSet(set);
  const h = native(c.hints[0]),
    original = native(root.hints[0]);
  expect(child.GetRegisteredIn()).toBe(parent);
  expect(child.GetAttrSet().GetParent()).toBe(parent.GetAttrSet());
  expect(required(h.m_pNew).GetTheChgdSet()).toBe(parent.GetAttrSet());
  expect(required(h.m_pNew).Count()).toBe(1);
  expect(required(h.m_pNew).GetChgSet().GetItemState(109, false)).not.toBe(SfxItemState.SET);
  expect(required(h.m_pNew).GetChgSet()).not.toBe(required(original.m_pNew).GetChgSet());
  expect(p.hints[0]).not.toBe(original);
  expect(required(native(p.hints[0]).m_pNew).Count()).toBe(2);
  expect(required(original.m_pNew).Count()).toBe(2);
  parent.SetFormatAttr(new SwFormatVertOrient(360, 3, 7));
  expect(c.hints).toHaveLength(1);
  expect(p.hints).toHaveLength(2);
  child.SetDerivedFrom(undefined);
  expect(child.GetRegisteredIn()).toBeUndefined();
  expect(child.GetAttrSet().GetParent()).toBeUndefined();
  parent.SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Fixed, 8000, 500));
  expect(c.hints).toHaveLength(2);
  expect(c.hints[1]).toEqual({ kind: "format-inheritance-changed", formatId: child.GetName() });
  expect(p.hints).toHaveLength(3);
  c.client.Dispose();
  p.client.Dispose();
  root.client.Dispose();
});
it("native Differentiate includes invalid disabled and unequal local identities plus self and empty branches", /** Checks source identity-based differentiation and native inherited filtering. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    parent = doc.MakeTableBoxFormat(),
    child = doc.MakeTableBoxFormat(),
    set = new SwAttrSet(doc.GetAttrPool(), parent.GetAttrSet().GetRanges());
  child.SetDerivedFrom(parent);
  child.GetAttrSet().InvalidateItem(109);
  child.GetAttrSet().DisableItem(113);
  const c = observe(child);
  set.Put(new SwFormatVertOrient(720, 3, 7));
  const box = new SvxBoxItem(113);
  box.SetAllDistances(60);
  set.Put(box);
  set.Put(new SwFormatFrameSize(SwFrameSize.Fixed, 6000, 500));
  parent.SetFormatAttrSet(set);
  expect(required(native(c.hints[0]).m_pNew).Count()).toBe(1);
  expect(required(native(c.hints[0]).m_pNew).GetChgSet().GetItemState(90, false)).toBe(
    SfxItemState.SET,
  );
  const delta = set.CloneAsValue(),
    empty = new SfxItemSet(doc.GetAttrPool(), set.GetRanges());
  empty.Differentiate(set);
  delta.Differentiate(empty);
  expect(delta.Count()).toBe(3);
  delta.Differentiate(child.GetAttrSet());
  expect(delta.Count()).toBe(1);
  expect(delta.GetItemState(90, false)).toBe(SfxItemState.SET);
  delta.Differentiate(delta);
  expect(delta.Count()).toBe(0);
  c.client.Dispose();
});
it("native inherited transactions filter atomic deltas before forwarding one original client batch", /** Checks compatibility with the existing notification transaction boundary. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    parent = doc.MakeTableBoxFormat(),
    child = doc.MakeTableBoxFormat();
  child.SetDerivedFrom(parent);
  child.SetFormatAttr(new SwFormatVertOrient(240, 3, 7));
  const c = observe(child);
  parent.RunNotificationTransaction(
    /** Applies two actual native parent changes. @returns Nothing. */ () => {
      parent.SetFormatAttr(new SwFormatVertOrient(720, 3, 7));
      parent.SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Fixed, 6000, 500));
    },
  );
  expect(c.hints).toHaveLength(1);
  const h = required(c.hints[0]);
  expect(h.kind).toBe("model-transaction");
  if (h.kind !== "model-transaction") throw Error("Missing native batch");
  expect(h.hints).toHaveLength(1);
  expect(required(native(h.hints[0]).m_pNew).GetChgSet().GetItemState(90, false)).toBe(
    SfxItemState.SET,
  );
  c.client.Dispose();
});
it("native modify guard suppresses recursive writes and releases the original lock after a client exception", /** Checks actual accepted storage and exception lifetime. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    format = doc.MakeTableBoxFormat(),
    hints: SwModelHint[] = [];
  const observer = new SwClient(
    /** Mutates the actual owner during its native locked callback. @param source - Native owner. @param hint - Native change. @returns Nothing. */ (
      source,
      hint,
    ) => {
      expect(source).toBe(format);
      hints.push(hint);
      expect(format.IsModifyLocked()).toBe(true);
      format.SetFormatAttr(new SwFormatVertOrient(240, 3, 7));
      ClientNotifyAttrChg(
        format,
        format.GetAttrSet(),
        new SwAttrSet(doc.GetAttrPool(), format.GetAttrSet().GetRanges()),
        new SwAttrSet(doc.GetAttrPool(), format.GetAttrSet().GetRanges()),
      );
    },
  );
  observer.RegisterToModify(format);
  format.SetFormatAttr(new SwFormatVertOrient(720, 3, 7));
  expect(hints).toHaveLength(1);
  expect(format.GetVertOrient()).toEqual(new SwFormatVertOrient(240, 3, 7));
  expect(format.IsModifyLocked()).toBe(false);
  observer.Dispose();
  const failure = new SwClient(
    /** Throws from an actual native client. @returns Never. */ () => {
      throw Error("Native client failure");
    },
  );
  failure.RegisterToModify(format);
  expect(
    /** Performs a real original format mutation. @returns Accepted flag. */ () =>
      format.SetFormatAttr(new SwFormatVertOrient(360, 3, 7)),
  ).toThrow("Native client failure");
  expect(format.IsModifyLocked()).toBe(false);
  failure.Dispose();
  const c = observe(format);
  format.SwClientNotify(format, { kind: "document-state-changed" });
  expect(c.hints).toEqual([]);
  format.SwClientNotify(format, new AttrSetChangeHint(undefined, undefined));
  expect(c.hints).toHaveLength(1);
  format.SwClientNotify(
    format,
    new AttrSetChangeHint(
      new SwAttrSetChg(
        format.GetAttrSet(),
        new SwAttrSet(doc.GetAttrPool(), format.GetAttrSet().GetRanges()),
      ),
      undefined,
    ),
  );
  expect(c.hints).toHaveLength(2);
  c.client.Dispose();
});
it("actual linked row and cell frame clients receive precise native format item deltas through their original registrations", /** Checks the real frame path and removed generic override methods. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Frames");
  table.AddColumnWidth(3000);
  const row = doc.nodes.AppendTableRow(table, 1),
    frame = new SwRowFrame(row),
    cell = required(frame.Lower()) as SwCellFrame,
    box = required(row.GetTabBoxes()[0]);
  const rowNotify = vi.spyOn(frame, "Notify"),
    cellNotify = vi.spyOn(cell, "Notify"),
    rowFormat = row.GetFrameFormat(),
    cellFormat = box.GetFrameFormat();
  expect(Object.hasOwn(Object.getPrototypeOf(rowFormat), "NotifyAttributeSet")).toBe(false);
  expect(Object.hasOwn(Object.getPrototypeOf(cellFormat), "NotifyAttributeSet")).toBe(false);
  const size = new SwFormatFrameSize(SwFrameSize.Fixed, 0, 720);
  rowFormat.SetFormatAttr(size);
  cellFormat.SetFormatAttr(new SwFormatVertOrient(720, 2, 7));
  expect(rowNotify).toHaveBeenCalledOnce();
  expect(cellNotify).toHaveBeenCalledOnce();
  expect(rowNotify.mock.calls[0]?.[0]).toBe(rowFormat);
  expect(cellNotify.mock.calls[0]?.[0]).toBe(cellFormat);
  expect(required(native(rowNotify.mock.calls[0]?.[1]).m_pNew).GetTheChgdSet()).toBe(
    rowFormat.GetAttrSet(),
  );
  expect(required(native(cellNotify.mock.calls[0]?.[1]).m_pNew).GetTheChgdSet()).toBe(
    cellFormat.GetAttrSet(),
  );
  expect(frame.HasFixSize()).toBe(true);
  expect(cell.GetFormat()).toBe(cellFormat);
  expect(cell.GetTabBox()).toBe(box);
  frame.DestroyImpl();
  vi.restoreAllMocks();
});

it("native unsigned32 items retain native inheritance, signed UNO bits and independent clones", /** Checks actual unsigned scalar ownership and native UNO conversion. @returns Nothing. */ () => {
  const item = new SfxUInt32Item();
  expect(item).toBeInstanceOf(CntUInt32Item);
  expect(item.Which()).toBe(0);
  expect(item.GetValue()).toBe(0);
  item.SetValue(0xffffffff);
  expect(item.QueryValue()).toBe(-1);
  expect(item.Clone()).toEqual(item);
  expect(item.Clone()).not.toBe(item);
  const base = new CntUInt32Item(157, 1);
  expect(base.Clone()).toEqual(base);
  expect(base.equals(new CntUInt32Item(157, 1))).toBe(true);
  expect(base.equals(new CntUInt32Item(158, 1))).toBe(false);
  expect(base.equals(new CntUInt32Item(157, 2))).toBe(false);
  expect(base.equals(new SfxUInt32Item(157, 1))).toBe(false);
  expect(base.equals(new SfxUInt16Item(157, 1))).toBe(false);
  expect(base.PutValue(-2147483648)).toBe(true);
  expect(base.GetValue()).toBe(2147483648);
  for (const value of [false, "1", 1.5, -2147483649, 2147483648])
    expect(base.PutValue(value)).toBe(false);
  expect(base.GetValue()).toBe(2147483648);
  for (const value of [NaN, 1.5, -1, 4294967296])
    expect(
      /** Rejects invalid unsigned scalar ownership. @returns Never. */ () =>
        new CntUInt32Item(157, value),
    ).toThrow("unsigned 32-bit");
  expect(new SwTableBoxNumFormat().GetValue()).toBe(getSwDefaultTextFormat());
  expect(getSwDefaultTextFormat()).toBe(100);
  for (const value of [100, 10100, 20100, 4294900100])
    expect(new SwTableBoxNumFormat(value).GetValue()).toBe(100);
  const number = new SwTableBoxNumFormat(4294967295);
  expect(number.GetValue()).toBe(4294967295);
  expect(number.Clone()).toEqual(number);
  expect(number.equals(new SwTableBoxNumFormat(4294967295))).toBe(true);
  expect(number.equals(new SwTableBoxNumFormat(7))).toBe(false);
});
it("native protection defaults keep three independent flags and exact member clone contracts", /** Checks native flags rather than an opaque substitute. @returns Nothing. */ () => {
  const item = new SvxProtectItem(127);
  expect([item.IsContentProtected(), item.IsSizeProtected(), item.IsPosProtected()]).toEqual([
    false,
    false,
    false,
  ]);
  expect(item.Clone()).toEqual(item);
  item.SetContentProtect(true);
  expect(item.equals(new SvxProtectItem(127))).toBe(false);
  item.SetSizeProtect(true);
  item.SetPosProtect(true);
  const clone = item.Clone();
  expect(clone).toEqual(item);
  expect(clone).not.toBe(item);
  expect(item.equals(new SvxProtectItem(128))).toBe(false);
  expect(item.equals(new SfxUInt16Item(127, 0))).toBe(false);
  for (const member of [0, 1, 2]) {
    expect(item.QueryValue(member | 0x80)).toBe(true);
    expect(item.PutValue(false, member | 0x80)).toBe(true);
    expect(item.QueryValue(member)).toBe(false);
  }
  expect(item.QueryValue(3)).toBeUndefined();
  expect(item.PutValue(true, 3)).toBe(false);
  expect(clone.QueryValue()).toEqual([true, true, true]);
  const size = new SvxProtectItem(127);
  size.SetSizeProtect(true);
  const pos = new SvxProtectItem(127);
  pos.SetPosProtect(true);
  expect(item.equals(size)).toBe(false);
  expect(item.equals(pos)).toBe(false);
});
it("native formula items are non-shareable and clone represented text without defined-in ownership", /** Checks original formula format, box and node identities. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Formula");
  table.AddColumnWidth(3000);
  const row = doc.nodes.AppendTableRow(table, 1),
    box = required(row.GetTabBoxes()[0]);
  const formula = new SwTableBoxFormula("<A1>+1");
  expect(formula.isShareable()).toBe(false);
  expect(formula.GetFormula()).toBe("<A1>+1");
  expect(formula.QueryValue()).toBe("<A1>+1");
  expect(formula.GetDefinedIn()).toBeUndefined();
  expect(formula.GetTableBox()).toBeUndefined();
  expect(formula.GetNodeOfFormula()).toBeUndefined();
  expect(formula.equals(new SwTableBoxFormula("<A1>+1"))).toBe(true);
  expect(formula.equals(new SwTableBoxFormula("2"))).toBe(false);
  expect(formula.equals(new SfxUInt16Item(158, 0))).toBe(false);
  const changedWhich = new SwTableBoxFormula("<A1>+1");
  changedWhich.SetWhich(159);
  expect(formula.equals(changedWhich)).toBe(false);
  formula.ChgDefinedIn(box.GetFrameFormat());
  expect(formula.GetDefinedIn()).toBe(box.GetFrameFormat());
  expect(formula.GetTableBox()).toBe(box);
  expect(formula.GetNodeOfFormula()).toBe(box.GetStartNode());
  const copy = formula.Clone();
  expect(copy.GetFormula()).toBe(formula.GetFormula());
  expect(copy.GetDefinedIn()).toBeUndefined();
  expect(copy.equals(formula)).toBe(false);
  expect(copy.isShareable()).toBe(false);
  formula.ChgDefinedIn(undefined);
  expect(copy.equals(formula)).toBe(true);
});
it("native numeric cell values pool NaNs and preserve zero, negative zero, doubles and independent clones", /** Checks the native double pooling rule. @returns Nothing. */ () => {
  expect(new SwTableBoxValue().GetValue()).toBe(0);
  for (const value of [0, -0, 1.5, Infinity, NaN]) {
    const item = new SwTableBoxValue(value),
      copy = item.Clone();
    expect(copy).not.toBe(item);
    expect(copy.GetValue()).toBe(value);
    expect(copy.QueryValue()).toBe(value);
    expect(copy.equals(item)).toBe(true);
  }
  expect(new SwTableBoxValue(NaN).equals(new SwTableBoxValue(0))).toBe(false);
  expect(new SwTableBoxValue(1).equals(new SwTableBoxValue(2))).toBe(false);
  expect(new SwTableBoxValue(0).equals(new SfxUInt16Item(159, 0))).toBe(false);
  const changedWhich = new SwTableBoxValue(0);
  changedWhich.SetWhich(158);
  expect(new SwTableBoxValue(0).equals(changedWhich)).toBe(false);
  expect(new SwTableBoxValue(-0).equals(new SwTableBoxValue(0))).toBe(true);
});
it("actual pooled protection and cell defaults supply effective native old and reset deltas", /** Checks original pool values, real format notifications and browser restoration. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    pool = doc.GetAttrPool(),
    format = doc.MakeTableBoxFormat(),
    o = observe(format);
  const protection = new SvxProtectItem(127);
  protection.SetContentProtect(true);
  protection.SetPosProtect(true);
  const items = [
    protection,
    new SwTableBoxNumFormat(7),
    new SwTableBoxFormula("<A1>+1"),
    new SwTableBoxValue(1.5),
  ];
  const defaults = [
    new SvxProtectItem(127),
    new SwTableBoxNumFormat(),
    new SwTableBoxFormula(""),
    new SwTableBoxValue(),
  ];
  for (const [index, item] of items.entries()) {
    const expected = required(defaults[index]);
    expect(pool.GetUserOrPoolDefaultItem(item.Which())).toEqual(expected);
    expect(format.SetFormatAttr(item)).toBe(true);
    const hint = native(o.hints.at(-1));
    expect(required(hint.m_pOld).GetChgSet().Get(item.Which())).toEqual(expected);
    expect(required(hint.m_pNew).GetChgSet().Get(item.Which())).toEqual(item);
    const restored = pool.CreateItem({
      which: item.Which(),
      value: item.QueryValue() as SfxPoolItemValue,
    });
    expect(restored).toEqual(item);
    expect(restored).not.toBe(item);
    expect(format.ResetFormatAttr(item.Which())).toBe(true);
    expect(
      required(native(o.hints.at(-1)).m_pNew)
        .GetChgSet()
        .Get(item.Which()),
    ).toEqual(expected);
  }
  expect(pool.CreateItem({ which: 157, value: -1 })).toEqual(new SwTableBoxNumFormat(0xffffffff));
  expect(
    /** Rejects an invalid protection snapshot. @returns Never. */ () =>
      pool.CreateItem({ which: 127, value: 1 }),
  ).toThrow("protection is invalid");
  o.client.Dispose();
});

it("native parent rejection and delegated clear no-op keep original storage and clients unchanged", /** Checks native parent contracts and the clear API no-op guard. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    other = new SwDoc(),
    format = doc.MakeTableBoxFormat();
  expect(
    /** Rejects self inheritance. @returns Never. */ () => format.SetDerivedFrom(format),
  ).toThrow("derive from itself");
  expect(
    /** Rejects a foreign owning pool. @returns Never. */ () =>
      format.SetDerivedFrom(other.MakeTableBoxFormat()),
  ).toThrow("another pool");
  const item = new SwFormatVertOrient(720, 3, 7);
  format.SetFormatAttr(item);
  const o = observe(format),
    clear = vi.spyOn(format.GetAttrSet(), "ClearItem_BC").mockReturnValueOnce(0);
  expect(format.ResetAllFormatAttr()).toBe(0);
  expect(clear).toHaveBeenCalledOnce();
  expect(o.hints).toEqual([]);
  expect(format.GetVertOrient()).toEqual(item);
  clear.mockRestore();
  expect(format.ResetAllFormatAttr()).toBe(1);
  expect(required(native(o.hints[0]).m_pNew).GetChgSet().Get(109)).toEqual(
    new SwFormatVertOrient(),
  );
  o.client.Dispose();
});
it("native modify forwarding preserves non-native atomic and transaction identities and rejects foreign sources", /** Checks original transaction boundary behavior alongside the new native filter. @returns Nothing. */ () => {
  const parent = new SwModify(),
    child = new SwModify(),
    foreign = new SwModify(),
    o = observe(child);
  child.RegisterToModify(parent);
  const atomic = { kind: "document-state-changed" } as const;
  child.Notify(foreign, atomic);
  expect(o.hints).toEqual([]);
  child.Notify(parent, atomic);
  expect(o.hints).toEqual([atomic]);
  const batch = { kind: "model-transaction", hints: [atomic] } as const;
  child.Notify(parent, batch);
  expect(o.hints[1]).toBe(batch);
  child.RunNotificationTransaction(
    /** Forwards an original nested transaction while a child batch is open. @returns Nothing. */ () => {
      child.Notify(parent, batch);
    },
  );
  expect(o.hints[2]).toEqual(batch);
  expect(o.hints[2]).not.toBe(batch);
  o.client.Dispose();
  child.EndListening();
});
