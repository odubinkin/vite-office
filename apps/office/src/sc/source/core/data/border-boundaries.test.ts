/** @fileoverview Native border interval, default-tail, absent sheet and compressed-filter boundary contracts. */
import { expect, it } from "vitest";
import { InsertDeleteFlags } from "../../../inc/global";
import { ScDocument } from "../../../inc/document";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScMarkData } from "../../../inc/markdata";
import { ScPatternAttr, CellAttributeHolder } from "../../../inc/patattr";
import { ScAttrArray } from "./attarray";
import { ScItemPoolCache } from "../../../inc/poolcach";
import { ScLineFlags } from "../../../inc/attarray";
import {
  SvxBoxItem,
  SvxBoxInfoItem,
  SvxBoxItemLine as E,
  SvxBoxInfoItemValidFlags as V,
} from "../../../../editeng/source/items/frmitems";
import { SvxBorderLine } from "../../../../editeng/source/items/borderline";
import { SvxLineItem } from "../../../../editeng/inc/lineitem";
import { ScMergeAttr } from "../../../inc/attrib";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
/** Creates an actual native sheet. @returns Document. */
function document() {
  const d = new ScDocument(),
    n = unicode("Data");
  d.InsertTab(0, n);
  n.dispose();
  return d;
}
/** Releases document resources. @param d - Owner. @returns Nothing. */
function close(d: ScDocument) {
  d.DisposeAttributes();
  d.GetSharedStringPool().dispose();
}
/** Reads actual native edge. @param d - Document. @param row - Row. @returns Box. */
function box(d: ScDocument, row = 0) {
  return required(d.GetPattern(new ScAddress(0, row, 0))).GetItem(150) as SvxBoxItem;
}
it("preserves validation, removed-sheet traversal, no-mark queries and optional filter outputs", /** preserves validation, removed-sheet traversal, no-mark queries and optional filter outputs. @returns Observed test result. */ () => {
  const d = document(),
    m = new ScMarkData(d.GetSheetLimits()),
    outer = new SvxBoxItem(150),
    inner = new SvxBoxInfoItem(151),
    p = new ScPatternAttr(d.getCellAttributeHelper()),
    holder = new CellAttributeHolder(p),
    table = required(d.FetchTable(0));
  try {
    const f = table.getFilterData();
    expect(f.rowHidden(-1)).toBe(true);
    expect(f.rowFiltered(0)).toBe(false);
    expect(f.rowHidden(0)).toBe(false);
    const end: [number] = [-9];
    expect(f.rowFiltered(-1, undefined, end)).toBe(false);
    expect(end[0]).toBe(-9);
    expect(d.ApplySelectionPattern(p, m)).toBe(false);
    m.SelectOneTable(8);
    d.SetLayoutRTL(8, true);
    d.ApplySelectionLineStyle(m, undefined, false);
    d.ApplySelectionLineStyle(m, undefined, true);
    d.ChangeSelectionIndent(true, m);
    d.GetSelectionFrame(m, outer, inner);
    m.SetMarkArea(new ScRange(0, 0, 8, 1, 1, 8));
    d.GetSelectionFrame(m, outer, inner);
    d.ApplySelectionFrame(m, outer, inner);
    outer.SetRemoveAdjacentCellBorder(true);
    d.ApplySelectionFrame(m, outer, inner);
    p.ItemSetPut(new SvxLineItem(141));
    d.ApplySelectionPattern(p, m);
    table.ApplyPattern(-1, 0, p);
    table.SetPattern(0, -1, holder);
    table.ApplySelectionLineStyle(m, undefined, true);
    const flags = new ScLineFlags();
    table.MergeBlockFrame(outer, inner, flags, -1, 0, 0, 0);
    table.MergeBlockFrame(outer, inner, flags, 1, 2, 0, 0);
    table.ApplyBlockFrame(outer, inner, -1, 0, 0, 0);
    table.ApplyBlockFrame(outer, inner, 1, 2, 0, 0);
    expect(box(d).GetTop()).toBeUndefined();
  } finally {
    holder.Dispose();
    p.Dispose();
    close(d);
  }
});
it("applies canonical cache changes and diagonal line edits through whole compressed runs", /** applies canonical cache changes and diagonal line edits through whole compressed runs. @returns Observed test result. */ () => {
  const d = document(),
    a = new ScAttrArray(0, 0, d),
    p = new ScPatternAttr(d.getCellAttributeHelper()),
    b = new SvxBoxItem(150),
    line = new SvxBorderLine(null, 40),
    diag = new SvxLineItem(141),
    other = new SvxLineItem(142);
  b.SetLine(line, E.TOP);
  diag.SetLine(line);
  other.SetLine(line);
  p.ItemSetPut(b);
  p.ItemSetPut(diag);
  p.ItemSetPut(other);
  const h = new CellAttributeHolder(p, true),
    cache = new ScItemPoolCache(d.getCellAttributeHelper(), p.GetItemSet());
  try {
    a.ApplyCacheArea(-1, 0, cache);
    a.ApplyLineStyleArea(-1, 0, line, false);
    a.ApplyLineStyleArea(0, 1, undefined, true);
    a.ApplyCacheArea(0, d.MaxRow(), cache);
    expect((required(a.GetPattern(0)).GetItem(141) as SvxLineItem).GetLine()?.GetWidth()).toBe(40);
    a.ApplyCacheArea(0, d.MaxRow(), cache);
    a.SetPatternArea(2, 3, h);
    a.ApplyLineStyleArea(0, d.MaxRow(), new SvxBorderLine(null, 60), false);
    expect((required(a.GetPattern(0)).GetItem(150) as SvxBoxItem).GetTop()?.GetWidth()).toBe(60);
    a.ApplyLineStyleArea(0, d.MaxRow(), undefined, false);
    expect((required(a.GetPattern(0)).GetItem(141) as SvxLineItem).GetLine()).toBeNull();
    a.ApplyLineStyleArea(0, d.MaxRow(), line, false);
  } finally {
    cache.Dispose();
    a.Dispose();
    h.Dispose();
    close(d);
  }
});
it("merges unequal interior lines with sticky mixed flags and honors native RTL merge extents", /** merges unequal interior lines with sticky mixed flags and honors native RTL merge extents. @returns Observed test result. */ () => {
  const d = document(),
    m = new ScMarkData(d.GetSheetLimits()),
    o = new SvxBoxItem(150),
    i = new SvxBoxInfoItem(151),
    p = new ScPatternAttr(d.getCellAttributeHelper());
  try {
    m.SelectOneTable(0);
    m.SetMarkArea(new ScRange(0, 0, 0, 2, 3, 0));
    d.SetLayoutRTL(0, true);
    for (const e of [E.TOP, E.BOTTOM, E.LEFT, E.RIGHT]) o.SetLine(new SvxBorderLine(null, 30), e);
    d.ApplySelectionFrame(m, o, i);
    for (let row = 0; row < 4; row++) {
      const b = new SvxBoxItem(150);
      for (const e of [E.TOP, E.BOTTOM, E.LEFT, E.RIGHT])
        b.SetLine(new SvxBorderLine(null, 20 + row * 10), e);
      p.ItemSetPut(b);
      p.ItemSetPut(new ScMergeAttr(2, 2));
      d.ApplyPattern(1, row, 0, p);
    }
    d.GetSelectionFrame(m, new SvxBoxItem(150), i);
    expect(i.IsValid(V.HORI)).toBe(false);
    expect(i.IsValid(V.VERT)).toBe(false);
    i.SetValid(V.ALL, false);
    d.ApplySelectionFrame(m, o, i);
    expect(box(d).GetTop()?.GetWidth()).toBe(30);
    const a = new ScAttrArray(0, 0, d);
    a.MergeBlockFrame(o, i, new ScLineFlags(), 0, 3, false, 2);
    a.Dispose();
  } finally {
    p.Dispose();
    close(d);
  }
});
it("transforms selected default-column tails and retains simple versus multi selection boundaries", /** transforms selected default-column tails and retains simple versus multi selection boundaries. @returns Observed test result. */ () => {
  const d = document(),
    t = required(d.FetchTable(0)),
    m = new ScMarkData(d.GetSheetLimits()),
    p = new ScPatternAttr(d.getCellAttributeHelper()),
    o = new SvxBoxItem(150);
  o.SetDistance(9, E.RIGHT);
  p.ItemSetPut(o);
  const cache = new ScItemPoolCache(d.getCellAttributeHelper(), p.GetItemSet());
  try {
    m.SelectOneTable(0);
    t.GetColumnData(0).ApplySelectionLineStyle(m, undefined, false);
    t.GetColumnData(0).ApplySelectionLineStyle(m, undefined, true);
    t.ShowRows(0, 1, false);
    expect(t.RowHidden(0)).toBe(true);
    t.CopyRowHeight(t, 0, 1, d.MaxRow() + 1);
    m.SetMarkArea(new ScRange(0, 1, 0, d.MaxCol(), 2, 0));
    expect(t.ApplySelectionCache(cache, m)).toBe(true);
    expect(
      (
        required(d.GetPattern(new ScAddress(d.MaxCol(), 1, 0))).GetItem(150) as SvxBoxItem
      ).GetDistance(E.RIGHT),
    ).toBe(9);
    const h = new CellAttributeHolder(new ScPatternAttr(d.getCellAttributeHelper()), true);
    try {
      const changed = cache.ApplyTo(h);
      expect(
        (required(changed.getScPatternAttr()).GetItem(150) as SvxBoxItem).GetDistance(E.RIGHT),
      ).toBe(9);
    } finally {
      h.Dispose();
    }
    m.ResetMark();
    m.SetMarkArea(new ScRange(1, 0, 0, 1, 0, 0));
    expect(d.ApplySelectionPattern(p, m)).toBe(true);
  } finally {
    cache.Dispose();
    p.Dispose();
    close(d);
  }
});

/** Requires an actual test fixture owner and fails at its missing boundary. @param value - Actual fixture value. @returns Present fixture. */
function required<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error("Missing actual fixture owner");
  return value;
}
it("retains attributes across failed interval search and coalesces neighboring canonical runs", /** Checks actual interval invariants and the native failed-search guard. @returns Nothing. */ async () => {
  const { vi } = await import("vitest"),
    d = document(),
    a = new ScAttrArray(0, 0, d),
    p = new ScPatternAttr(d.getCellAttributeHelper()),
    o = new SvxBoxItem(150);
  o.SetLine(new SvxBorderLine(null, 20), E.TOP);
  p.ItemSetPut(o);
  const h = new CellAttributeHolder(p, true),
    cache = new ScItemPoolCache(d.getCellAttributeHelper(), p.GetItemSet());
  try {
    expect(a["Concat"](999)).toBe(false);
    const search = vi
      .spyOn(a as unknown as { Search: (row: number, index: [number]) => boolean }, "Search")
      .mockReturnValue(false);
    a.ApplyCacheArea(0, 1, cache);
    a.ApplyLineStyleArea(0, 1, new SvxBorderLine(null, 30), false);
    search.mockRestore();
    expect((required(a.GetPattern(0)).GetItem(150) as SvxBoxItem).GetTop()).toBeUndefined();
    a.SetPatternArea(0, 1, h);
    a.SetPatternArea(4, 5, h);
    a.ApplyCacheArea(0, 5, cache);
    expect(required(a.GetPattern(3))).toBe(required(a.GetPattern(0)));
    a.ApplyLineStyleArea(0, 5, new SvxBorderLine(null, 30), false);
    a.ApplyLineStyleArea(0, 5, undefined, false);
    a.ApplyLineStyleArea(0, d.MaxRow(), undefined, false);
  } finally {
    cache.Dispose();
    a.Dispose();
    h.Dispose();
    close(d);
  }
});
it("ignores temporarily absent native table slots in all selected-sheet dispatch paths", /** Exercises absent native pointer admission while retaining real marks and owners. @returns Nothing. */ async () => {
  const { vi } = await import("vitest"),
    d = document(),
    m = new ScMarkData(d.GetSheetLimits()),
    p = new ScPatternAttr(d.getCellAttributeHelper()),
    o = new SvxBoxItem(150),
    i = new SvxBoxInfoItem(151);
  p.ItemSetPut(new SvxLineItem(141));
  m.SelectOneTable(0);
  m.SetMarkArea(new ScRange(0, 0, 0, 1, 1, 0));
  const fetch = vi.spyOn(d, "FetchTable").mockReturnValue(null);
  try {
    d.GetSelectionFrame(m, o, i);
    d.ApplySelectionFrame(m, o, i);
    o.SetRemoveAdjacentCellBorder(true);
    d.ApplySelectionFrame(m, o, i);
    d.ApplySelectionLineStyle(m, new SvxBorderLine(null, 20), false);
    d.ChangeSelectionIndent(true, m);
    expect(d.ApplySelectionPattern(p, m)).toBe(false);
    m.MarkToMulti();
    d.GetSelectionFrame(m, o, i);
    expect(d.ApplySelectionPattern(p, m)).toBe(false);
  } finally {
    fetch.mockRestore();
    p.Dispose();
    close(d);
  }
});
it("styles independent diagonal-only runs without fabricating box or missing-line attributes", /** Actual diagonal-only compressed intervals exercise partial and whole-run transformations. @returns Nothing. */ () => {
  const d = document(),
    a = new ScAttrArray(0, 0, d),
    p = new ScPatternAttr(d.getCellAttributeHelper()),
    diag = new SvxLineItem(142);
  diag.SetLine(new SvxBorderLine(null, 20));
  p.ItemSetPut(diag);
  const h = new CellAttributeHolder(p, true);
  try {
    a.SetPatternArea(1, 2, h);
    a.ApplyLineStyleArea(1, 2, new SvxBorderLine(null, 30), false);
    expect((required(a.GetPattern(1)).GetItem(142) as SvxLineItem).GetLine()?.GetWidth()).toBe(30);
    a.ApplyLineStyleArea(1, 2, undefined, false);
    expect((required(a.GetPattern(1)).GetItem(142) as SvxLineItem).GetLine()).toBeNull();
    a.ApplyLineStyleArea(1, 2, undefined, false);
    a.ApplyLineStyleArea(0, d.MaxRow(), new SvxBorderLine(null, 40), true);
    expect((required(a.GetPattern(1)).GetItem(150) as SvxBoxItem).GetTop()).toBeUndefined();
  } finally {
    a.Dispose();
    h.Dispose();
    close(d);
  }
});
it("publishes row segment endpoints and retains native unmarked copy and repeated simple-cache applications", /** Real segmented outputs and native table callbacks. @returns Nothing. */ async () => {
  const { vi } = await import("vitest"),
    d = document(),
    t = required(d.FetchTable(0)),
    m = new ScMarkData(d.GetSheetLimits()),
    p = new ScPatternAttr(d.getCellAttributeHelper()),
    o = new SvxBoxItem(150),
    i = new SvxBoxInfoItem(151),
    dest = document();
  o.SetLine(new SvxBorderLine(null, 20), E.TOP);
  p.ItemSetPut(o);
  const cache = new ScItemPoolCache(d.getCellAttributeHelper(), p.GetItemSet());
  try {
    const first: [number] = [-1],
      last: [number] = [-1];
    expect(t.getFilterData().rowHidden(0, first, last)).toBe(false);
    expect(first[0]).toBe(0);
    expect(last[0]).toBe(d.MaxRow());
    expect(t.getFilterData().rowFiltered(0, first, last)).toBe(false);
    expect(first[0]).toBe(0);
    expect(d.RowFiltered(0, 8)).toBe(false);
    m.SelectOneTable(8);
    m.SetMultiMarkArea(new ScRange(0, 0, 8, 1, 1, 8));
    d.GetSelectionFrame(m, o, i);
    m.ResetMark();
    m.SelectOneTable(0);
    const noop = vi.fn();
    t["Apply"](m, 0, noop);
    expect(noop).not.toHaveBeenCalled();
    expect(t.ApplySelectionCache(cache, m)).toBe(false);
    m.SetMarkArea(new ScRange(1, 0, 0, 1, 0, 0));
    t.ApplyPatternArea(0, 0, 1, 0, p);
    expect(t.ApplyPatternArea(0, 0, 1, 0, p)).toBe(false);
    t.ApplySelectionCache(cache, m);
    t.ApplySelectionCache(cache, m);
    m.SelectOneTable(1);
    d.CopyToDocument(new ScRange(0, 0, 0, 1, 1, 1), InsertDeleteFlags.ATTRIB, false, dest, m);
    expect(
      (required(dest.GetPattern(new ScAddress())).GetItem(150) as SvxBoxItem).GetTop(),
    ).toEqual((required(d.GetPattern(new ScAddress())).GetItem(150) as SvxBoxItem).GetTop());
  } finally {
    cache.Dispose();
    p.Dispose();
    close(dest);
    close(d);
  }
});
it("preserves native selective RTL edges and skips adjacent removal when validity or requested outer lines forbid it", /** Genuine multi-cell RTL requests exercise both interior edge assignments. @returns Nothing. */ () => {
  const d = document(),
    m = new ScMarkData(d.GetSheetLimits()),
    o = new SvxBoxItem(150),
    i = new SvxBoxInfoItem(151);
  for (const e of [E.TOP, E.BOTTOM, E.LEFT, E.RIGHT]) o.SetLine(new SvxBorderLine(null, 30), e);
  o.SetRemoveAdjacentCellBorder(true);
  m.SelectOneTable(0);
  m.SetMarkArea(new ScRange(0, 0, 0, 2, 3, 0));
  d.SetLayoutRTL(0, true);
  try {
    d.ApplySelectionFrame(m, o, i);
    expect(box(d).GetLeft()?.GetWidth()).toBe(30);
    i.SetValid(V.ALL, false);
    d.ApplySelectionFrame(m, new SvxBoxItem(o), i);
    m.SetMarkArea(new ScRange(1, 1, 0, 1, 1, 0));
    d.ApplySelectionFrame(m, o, i);
    expect(box(d).GetLeft()?.GetWidth()).toBe(30);
  } finally {
    close(d);
  }
});
it("marks an interior horizontal seam mixed when a middle row top differs from the preceding bottom", /** Actual top-versus-bottom accumulation order. @returns Nothing. */ () => {
  const d = document(),
    m = new ScMarkData(d.GetSheetLimits()),
    p = new ScPatternAttr(d.getCellAttributeHelper()),
    b = new SvxBoxItem(150),
    o = new SvxBoxItem(150),
    i = new SvxBoxInfoItem(151);
  try {
    b.SetLine(new SvxBorderLine(null, 20), E.TOP);
    b.SetLine(new SvxBorderLine(null, 20), E.BOTTOM);
    p.ItemSetPut(b);
    d.ApplyPatternAreaTab(0, 0, 0, 2, 0, p);
    b.SetLine(new SvxBorderLine(null, 40), E.TOP);
    p.ItemSetPut(b);
    d.ApplyPattern(0, 1, 0, p);
    m.SelectOneTable(0);
    m.SetMarkArea(new ScRange(0, 0, 0, 0, 2, 0));
    d.GetSelectionFrame(m, o, i);
    expect(i.IsValid(V.HORI)).toBe(false);
  } finally {
    p.Dispose();
    close(d);
  }
});
