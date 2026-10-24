/** @fileoverview Genuine conditional-format entries,ranges,clone ownership and subscribed cache behavior needed by native copy Undo. */
import { assert, expect, it } from "vitest";
import { ScDocument, ScDocumentMode } from "../../../inc/document";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScRangeList } from "../../../inc/rangelst";
import {
  ScConditionalFormat,
  ScConditionalFormatList,
  ScCondDateFormatEntry,
  ScCondFormatDateType,
  ScFormatEntry,
  ScColorFormatCache,
} from "../../../inc/conditio";
import {
  RefUpdateContext,
  RefUpdateInsertTabContext,
  RefUpdateDeleteTabContext,
  RefUpdateMoveTabContext,
} from "../../../inc/refupdatecontext";
import { UpdateRefMode } from "../../../inc/global";
import { SfxHint, SfxHintId } from "../../../../svl/inc/hint";
import { SvtBroadcaster } from "../../../../svl/source/notify/broadcast";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
/** Creates genuine populated source sheets. @param count - Native sheet count. @returns Document. */
function document(count = 1): ScDocument {
  const doc = new ScDocument();
  for (let tab = 0; tab < count; ++tab) {
    const name = unicode(`Data${tab}`);
    doc.InsertTab(tab, name);
    name.dispose();
  }
  return doc;
}
/** Creates an actual owned date entry inside a conditional format. @param doc - Native owner. @param key - Attribute index. @param range - Native range. @returns Format. */
function format(doc: ScDocument, key: number, range = new ScRange()): ScConditionalFormat {
  const result = new ScConditionalFormat(key, doc);
  result.SetRange(new ScRangeList(range));
  result.AddEntry(new ScCondDateFormatEntry(doc));
  return result;
}
it("copies native date-entry defaults and independent style values while retaining original default-false equality", /** No date evaluator,style resolver or fake subclass supplies copy state. @returns Nothing. */ () => {
  const doc = document(),
    other = document(),
    source = new ScCondDateFormatEntry(doc),
    a = new ScConditionalFormat(1, doc),
    b = new ScConditionalFormat(2, other);
  const style = unicode("Original"),
    changed = unicode("Changed");
  try {
    expect(source.GetType()).toBe(ScFormatEntry.Type.Date);
    expect(source.GetDateType()).toBe(ScCondFormatDateType.TODAY);
    expect(text(source.GetStyleName())).toBe("");
    expect(a.IsEmpty()).toBe(true);
    expect(a.EqualEntries(b)).toBe(true);
    expect(a.GetEntry(0)).toBeNull();
    source.SetDateType(ScCondFormatDateType.LAST7DAYS);
    source.SetStyleName(style);
    const clone = source.Clone(other);
    a.AddEntry(source);
    b.AddEntry(clone);
    expect(a.size()).toBe(1);
    expect(a.GetEntry(0)).toBe(source);
    expect(clone.GetDateType()).toBe(ScCondFormatDateType.LAST7DAYS);
    clone.SetStyleName(changed);
    expect(text(source.GetStyleName())).toBe("Original");
    expect(text(clone.GetStyleName())).toBe("Changed");
    expect(a.EqualEntries(b)).toBe(false);
    const empty = new ScConditionalFormat(3, doc);
    expect(a.EqualEntries(empty, true)).toBe(false);
    empty.Dispose();
  } finally {
    style.dispose();
    changed.dispose();
    a.Dispose();
    b.Dispose();
    other.Dispose();
    doc.Dispose();
  }
});
it("clones real nonempty formats across ordinary and Undo owners without sharing entries,ranges or live cache values", /** Actual destination resources and native clone listeners are retained. @returns Nothing. */ () => {
  const doc = document(),
    undo = new ScDocument(ScDocumentMode.SCDOCMODE_UNDO),
    source = format(doc, 9, new ScRange(0, 0, 0, 2, 2, 0));
  undo.InitUndo(doc, 0, 0);
  const same = source.Clone(),
    other = source.Clone(undo);
  try {
    expect(same.GetDocument()).toBe(doc);
    expect(other.GetDocument()).toBe(undo);
    expect(other.GetKey()).toBe(9);
    expect(other.GetEntry(0)).not.toBe(source.GetEntry(0));
    source.SetCache([2, 4]);
    expect(same.GetCache()).toEqual([]);
    expect(other.GetCache()).toEqual([]);
    same.GetRangeList().at(0).aEnd.SetCol(7);
    expect(source.GetRange().at(0).aEnd.Col()).toBe(2);
    expect(other.GetRange().at(0).aEnd.Col()).toBe(2);
    doc.SetValue(new ScAddress(1, 1, 0), 8);
    expect(source.GetCache()).toEqual([]);
  } finally {
    other.Dispose();
    same.Dispose();
    source.Dispose();
    undo.Dispose();
    doc.Dispose();
  }
});
it("retains the native listening superset on shrinking ranges and replaces it on expansion", /** Real area notifications invalidate the original borrowed vector. @returns Nothing. */ () => {
  const doc = document(),
    source = format(doc, 1, new ScRange(0, 0, 0, 4, 4, 0));
  try {
    source.SetCache([1, 2]);
    const initial = source.GetCache();
    assert(initial);
    source.SetCache(initial);
    expect(source.GetCache()).toBe(initial);
    expect(initial).toEqual([1, 2]);
    source.SetRange(new ScRangeList(new ScRange()));
    expect(source.GetCache()).toBe(initial);
    source.SetCache([3]);
    doc.SetValue(new ScAddress(4, 4, 0), 7);
    expect(initial).toEqual([]);
    source.SetRange(new ScRangeList(new ScRange(6, 6, 0, 7, 7, 0)));
    expect(source.GetCache()).not.toBe(initial);
    source.SetCache([9]);
    doc.SetValue(new ScAddress(), 1);
    expect(source.GetCache()).toEqual([9]);
    doc.SetValue(new ScAddress(6, 6, 0), 2);
    expect(source.GetCache()).toEqual([]);
    source.DeleteArea(6, 6, 7, 7);
    expect(source.GetRange().empty()).toBe(true);
    // Native ResetCache retains its previous listener when the current range becomes empty.
    expect(source.GetCache()).toEqual([]);
  } finally {
    source.Dispose();
    doc.Dispose();
  }
});
it("keeps empty-cache defaults and sheet-local deletion fragments through native ranges", /** Does not manufacture cached listener owners or alternate rectangles. @returns Nothing. */ () => {
  const doc = document(),
    source = new ScConditionalFormat(3, doc);
  try {
    expect(source.GetCache()).toBeNull();
    source.SetCache([5]);
    expect(source.GetCache()).toBeNull();
    source.DeleteArea(0, 0, 4, 4);
    const ranges = new ScRangeList(new ScRange(0, 0, 0, 4, 4, 0));
    source.SetRange(ranges);
    ranges.at(0).aEnd.SetCol(8);
    expect(source.GetRange().at(0).aEnd.Col()).toBe(4);
    source.DeleteArea(1, 1, 3, 3);
    expect(source.GetRange().GetCellCount()).toBe(16n);
    expect(source.GetRange().Contains(new ScRange())).toBe(true);
    expect(source.GetRange().Contains(new ScRange(0, 4, 0, 0, 4, 0))).toBe(true);
    expect(source.GetRange().Intersects(new ScRange(1, 1, 0, 3, 3, 0))).toBe(false);
  } finally {
    source.Dispose();
    doc.Dispose();
  }
});
it("ends every real subscription on either native Dying delivery and preserves cached values at that notification", /** The shared broadcaster's destruction binding and ordinary native hint both reach the actual cache. @returns Nothing. */ () => {
  const doc = document(),
    cache = new ScColorFormatCache(doc, new ScRangeList(new ScRange())),
    broadcaster = new SvtBroadcaster<SfxHint>();
  try {
    cache.maValues.push(4);
    expect(cache.HasBroadcaster()).toBe(true);
    cache.StartListening(broadcaster);
    broadcaster.Dispose();
    expect(cache.HasBroadcaster()).toBe(false);
    expect(cache.maValues).toEqual([4]);
    doc.StartListeningArea(new ScRange(), false, cache);
    cache.Notify(new SfxHint(SfxHintId.Dying));
    expect(cache.HasBroadcaster()).toBe(false);
    expect(cache.maValues).toEqual([4]);
  } finally {
    cache.Dispose();
    doc.Dispose();
  }
});
it.each([ScDocumentMode.SCDOCMODE_CLIP, ScDocumentMode.SCDOCMODE_UNDO])(
  "retains native temporary-cache defaults and implicit base destruction in mode%s",
  /** Uses shared native resource initialization. @param mode - Source mode. @returns Nothing. */ (
    mode,
  ) => {
    const source = document(),
      doc = new ScDocument(mode);
    doc.SharePooledResources(source);
    const cache = new ScColorFormatCache(doc, new ScRangeList(new ScRange())),
      external = new SvtBroadcaster<SfxHint>();
    let destroyed = false;
    try {
      expect(cache.HasBroadcaster()).toBe(false);
      expect(cache.maValues).toEqual([]);
      cache.StartListening(external);
      expect(external.GetAllListeners().length).toBe(1);
      cache.Dispose();
      destroyed = true;
      expect(external.GetAllListeners().length).toBe(0);
    } finally {
      if (!destroyed) cache.Dispose();
      external.Dispose();
      doc.Dispose();
      source.Dispose();
    }
  },
);
it("copies key-ordered unique native lists and preserves distinct existing owners on duplicate insertion", /** Real nonempty date entries and their cache subscriptions participate. @returns Nothing. */ () => {
  const doc = document(),
    other = document(),
    list = new ScConditionalFormatList(),
    first = format(doc, 7),
    second = format(doc, 2, new ScRange(2, 2, 0, 3, 3, 0));
  list.InsertNew(first);
  list.InsertNew(second);
  const duplicate = format(doc, 7);
  list.InsertNew(duplicate);
  const same = new ScConditionalFormatList(list),
    copy = list.Clone(other);
  try {
    expect(list.size()).toBe(2);
    expect(list.empty()).toBe(false);
    expect(
      Array.from(
        list,
        /** Reads real index order. @param entry - Owner. @returns Key. */ (entry) =>
          entry.GetKey(),
      ),
    ).toEqual([2, 7]);
    expect(list.GetFormat(7)).toBe(first);
    expect(list.GetFormat(99)).toBeNull();
    expect(same.GetFormat(7)?.GetDocument()).toBe(doc);
    expect(copy.GetFormat(7)?.GetDocument()).toBe(other);
    expect(copy.GetFormat(7)?.GetEntry(0)).not.toBe(first.GetEntry(0));
    expect(list.GetCombinedRange().GetCellCount()).toBe(5n);
    list.erase(99);
    list.erase(7);
    expect(list.GetFormat(7)).toBeNull();
  } finally {
    copy.Dispose();
    same.Dispose();
    list.Dispose();
    other.Dispose();
    doc.Dispose();
  }
});
it("validates actual empty ranges before destruction and deletes only intersected sheet-local formats", /** Original callback sees the live invalid owner before erase. @returns Nothing. */ () => {
  const doc = document(),
    list = new ScConditionalFormatList(),
    empty = new ScConditionalFormat(5, doc),
    valid = format(doc, 2, new ScRange(2, 2, 0, 3, 3, 0)),
    seen: number[] = [];
  empty.SetKey(8);
  list.InsertNew(empty);
  list.InsertNew(valid);
  try {
    expect(
      list.CheckAllEntries(
        /** Observes a still-owned native entry. @param entry - Invalid owner. @returns Nothing. */ (
          entry,
        ) => {
          expect(list.GetFormat(entry.GetKey())).toBe(entry);
          seen.push(entry.GetKey());
        },
      ),
    ).toBe(false);
    expect(seen).toEqual([8]);
    expect(list.CheckAllEntries()).toBe(true);
    list.InsertNew(new ScConditionalFormat(9, doc));
    expect(list.CheckAllEntries()).toBe(false);
    list.DeleteArea(0, 0, 0, 0);
    expect(list.size()).toBe(1);
    list.DeleteArea(2, 2, 3, 3);
    expect(list.empty()).toBe(true);
    expect(list.GetCombinedRange().empty()).toBe(true);
  } finally {
    list.Dispose();
    doc.Dispose();
  }
});
it("updates cloned ranges through native copy-as-move and preserves date-entry reference no-ops", /** Actual context owners retain original sheet-index remapping and initialized name/error state. @returns Nothing. */ () => {
  const doc = document(6),
    source = format(doc, 1, new ScRange(1, 1, 0, 2, 2, 0)),
    context = new RefUpdateContext(doc),
    entry = source.GetEntry(0);
  assert(entry);
  try {
    context.meMode = UpdateRefMode.URM_COPY;
    context.maRange.assign(new ScRange(3, 3, 0, 4, 4, 0));
    context.mnColDelta = 2;
    context.mnRowDelta = 2;
    source.UpdateReference(context, true);
    expect(source.GetRange().at(0).GetVars()).toEqual([3, 3, 0, 4, 4, 0]);
    source.UpdateReference(context);
    expect(source.GetRange().at(0).GetVars()).toEqual([3, 3, 0, 4, 4, 0]);
    const insert = new RefUpdateInsertTabContext(doc, 2, 1),
      remove = new RefUpdateDeleteTabContext(doc, 2, 1),
      right = new RefUpdateMoveTabContext(doc, 2, 4),
      left = new RefUpdateMoveTabContext(doc, 4, 2);
    entry.UpdateInsertTab(insert);
    entry.UpdateDeleteTab(remove);
    entry.UpdateMoveTab(right);
    expect(insert.mrDoc).toBe(doc);
    expect(remove.mnDeletePos).toBe(2);
    expect(insert.maUpdatedNames.isEmpty(0)).toBe(true);
    expect(remove.maRefErrors.mbErrorCreated).toBe(false);
    expect(right.maUpdatedNames.isEmpty(0)).toBe(true);
    expect(
      Array.from(
        { length: 6 },
        /** Applies actual rightward mapping. @param _ - Unused. @param tab - Old sheet. @returns New sheet. */ (
          _,
          tab,
        ) => right.getNewTab(tab),
      ),
    ).toEqual([0, 1, 4, 2, 3, 5]);
    expect(
      Array.from(
        { length: 6 },
        /** Applies actual leftward mapping. @param _ - Unused. @param tab - Old sheet. @returns New sheet. */ (
          _,
          tab,
        ) => left.getNewTab(tab),
      ),
    ).toEqual([0, 1, 3, 4, 2, 5]);
    const identity = new RefUpdateMoveTabContext(doc, 2, 2);
    expect(identity.getNewTab(2)).toBe(2);
  } finally {
    source.Dispose();
    doc.Dispose();
  }
});

it("preserves native unsigned attribute keys and unsigned16 entry positions", /** Actual C++ parameter narrowing survives the language binding. @returns Nothing. */ () => {
  const doc = document(),
    list = new ScConditionalFormatList(),
    source = format(doc, -1);
  try {
    expect(source.GetKey()).toBe(0xffffffff);
    expect(source.GetEntry(0x10000)).toBe(source.GetEntry(0));
    expect(source.GetEntry(-1)).toBeNull();
    source.GetEntry(0)?.SetParent(null);
    source.SetKey(0x100000001);
    expect(source.GetKey()).toBe(1);
    list.InsertNew(source);
    expect(list.GetFormat(0x100000001)).toBe(source);
  } finally {
    list.Dispose();
    doc.Dispose();
  }
});

it("retains real table ownership,nullable replacement and native destructor release of entry strings", /** Observable OUString member ownership witnesses both replacement and document teardown. @returns Nothing. */ () => {
  const doc = document(),
    table = doc.FetchTable(0);
  assert(table);
  const style = unicode("Owned conditional style"),
    replacement = new ScConditionalFormatList();
  let closed = false;
  try {
    expect(table.GetCondFormList().empty()).toBe(true);
    const source = format(doc, 3),
      entry = source.GetEntry(0);
    assert(entry instanceof ScCondDateFormatEntry);
    const initial = style.pData.refCount;
    entry.SetStyleName(style);
    table.GetCondFormList().InsertNew(source);
    expect(style.pData.refCount).toBe(initial + 1);
    table.SetCondFormList(replacement);
    expect(style.pData.refCount).toBe(initial);
    expect(table.GetCondFormList()).toBe(replacement);
    table.SetCondFormList(null);
    table.SetCondFormList(null);
    const fresh = table.GetCondFormList();
    expect(fresh.empty()).toBe(true);
    const owned = format(doc, 4),
      date = owned.GetEntry(0);
    assert(date instanceof ScCondDateFormatEntry);
    date.SetStyleName(style);
    fresh.InsertNew(owned);
    table.DeleteConditionalFormat(99);
    table.DeleteConditionalFormat(4);
    expect(style.pData.refCount).toBe(initial);
    const closing = format(doc, 5),
      closingEntry = closing.GetEntry(0);
    assert(closingEntry instanceof ScCondDateFormatEntry);
    closingEntry.SetStyleName(style);
    fresh.InsertNew(closing);
    doc.Dispose();
    closed = true;
    expect(style.pData.refCount).toBe(initial);
  } finally {
    if (!closed) doc.Dispose();
    style.dispose();
  }
});

it("closes a native sheet after its conditional-format list was explicitly removed", /** Original nullable unique ownership remains safe during managed document destruction. @returns Nothing. */ () => {
  const doc = document(),
    table = doc.FetchTable(0);
  assert(table);
  table.SetCondFormList(null);
  const context = new RefUpdateContext(doc);
  context.meMode = UpdateRefMode.URM_COPY;
  table.UpdateReference(context);
  expect(
    /** Executes actual document destruction with the absent member. @returns Nothing. */ () =>
      doc.Dispose(),
  ).not.toThrow();
});

it("forwards actual table reference updates even when copied cells do not intersect conditional ranges", /** Native cache reset is an owner update,not merely a downstream cell broadcast. @returns Nothing. */ () => {
  const doc = document(),
    table = doc.FetchTable(0);
  assert(table);
  const source = format(doc, 1),
    context = new RefUpdateContext(doc);
  table.GetCondFormList().InsertNew(source);
  try {
    source.SetCache([17]);
    context.meMode = UpdateRefMode.URM_COPY;
    context.maRange.assign(new ScRange(5, 5, 0, 5, 5, 0));
    table.UpdateReference(context);
    expect(source.GetCache()).toEqual([]);
    table.GetCondFormList().InsertNew(new ScConditionalFormat(9, doc));
    table.GetCondFormList().UpdateReference(context);
    expect(table.GetCondFormList().GetFormat(9)).not.toBeNull();
    context.meMode = UpdateRefMode.URM_INSDEL;
    table.GetCondFormList().UpdateReference(context);
    expect(table.GetCondFormList().GetFormat(9)).toBeNull();
  } finally {
    doc.Dispose();
  }
});
