/** @fileoverview Original native box defaults,canonical cache,selection-frame validity/envelopes and existing-line transformations over real documents. */
import type { ScDocumentPool } from "./docpool";
import { expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScMarkData } from "../../../inc/markdata";
import { CellAttributeHolder, ScPatternAttr } from "../../../inc/patattr";
import { ScItemPoolCache } from "../../../inc/poolcach";
import {
  SvxBoxItem,
  SvxBoxInfoItem,
  SvxBoxItemLine as Edge,
  SvxBoxInfoItemLine as Inner,
  SvxBoxInfoItemValidFlags as Valid,
} from "../../../../editeng/source/items/frmitems";
import {
  SvxBorderLine,
  SvxBorderLineStyle as Style,
} from "../../../../editeng/source/items/borderline";
import { Color } from "../../../../tools/inc/color";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { SfxItemSet } from "../../../../svl/inc/itemset";
/** Creates actual native sheets without a browser/controller model. @param sheets - Sheet count. @returns Real document. */
function document(sheets = 1): ScDocument {
  const doc = new ScDocument();
  for (let tab = 0; tab < sheets; tab++) {
    const name = unicode("Data" + tab);
    try {
      doc.InsertTab(tab, name);
    } finally {
      name.dispose();
    }
  }
  return doc;
}
/** Releases genuine document logical resources. @param doc - Actual document. @returns Nothing. */
function close(doc: ScDocument): void {
  doc.DisposeAttributes();
  doc.GetSharedStringPool().dispose();
}
/** Reads actual box item from a canonical cell pattern. @param doc - Document. @param col - Column. @param row - Row. @param tab - Sheet. @returns Native box. */
function box(doc: ScDocument, col = 0, row = 0, tab = 0): SvxBoxItem {
  return (doc.GetPattern(new ScAddress(col, row, tab)) as ScPatternAttr).GetItem(150) as SvxBoxItem;
}
/** Creates independent actual line widths on all six requested sides. @returns Outer and inner native items. */
function frame(): [SvxBoxItem, SvxBoxInfoItem] {
  const outer = new SvxBoxItem(150),
    inner = new SvxBoxInfoItem(151);
  for (const [edge, width] of [
    [Edge.TOP, 20],
    [Edge.BOTTOM, 30],
    [Edge.LEFT, 40],
    [Edge.RIGHT, 50],
  ] as const)
    outer.SetLine(new SvxBorderLine(new Color(0x123456), width, Style.SOLID), edge);
  inner.SetLine(new SvxBorderLine(null, 60, Style.DOTTED), Inner.HORI);
  inner.SetLine(new SvxBorderLine(null, 70, Style.DASHED), Inner.VERT);
  return [outer, inner];
}
/** Reads real edge widths and absent pointers distinctly. @param item - Native box. @returns Outer widths. */
function widths(item: SvxBoxItem): (number | undefined)[] {
  return [
    item.GetTop()?.GetWidth(),
    item.GetBottom()?.GetWidth(),
    item.GetLeft()?.GetWidth(),
    item.GetRight()?.GetWidth(),
  ];
}
it("registers exact native protection/outer/inner defaults and slots with real table/distance flags", /** Actual pool metadata. @returns Nothing. */ () => {
  const doc = document();
  try {
    const pool = doc.GetPool() as ScDocumentPool,
      inner = pool.GetUserOrPoolDefaultItem(151) as SvxBoxInfoItem;
    expect(pool.GetWhichIDFromSlotID(10024)).toBe(150);
    expect(pool.GetWhichIDFromSlotID(10023)).toBe(151);
    expect(pool.GetWhichIDFromSlotID(26036)).toBe(149);
    expect(widths(box(doc))).toEqual([undefined, undefined, undefined, undefined]);
    expect([inner.IsTable(), inner.IsDist(), inner.IsMinDist()]).toEqual([true, true, false]);
    expect(inner.IsValid(Valid.ALL)).toBe(true);
  } finally {
    close(doc);
  }
});
it("uses real canonical cached transformations and source set-merge border preservation including right-distance propagation", /** Actual native cache item/set forms. @returns Nothing. */ () => {
  const doc = document(),
    pattern = new ScPatternAttr(doc.getCellAttributeHelper()),
    old = new SvxBoxItem(150);
  old.SetLine(new SvxBorderLine(null, 20), Edge.TOP);
  old.SetDistance(8, Edge.RIGHT);
  old.SetDistance(3, Edge.LEFT);
  pattern.ItemSetPut(old);
  const holder = new CellAttributeHolder(pattern, true),
    empty = new CellAttributeHolder(),
    set = new SfxItemSet(doc.GetPool() as ScDocumentPool, [[100, 151]]),
    next = new SvxBoxItem(150);
  next.SetLine(new SvxBorderLine(null, 40), Edge.LEFT);
  set.Put(next);
  const cache = new ScItemPoolCache(doc.getCellAttributeHelper(), set),
    single = new ScItemPoolCache(doc.getCellAttributeHelper(), new SvxBoxItem(150));
  try {
    expect(cache.ApplyTo(empty)).toBe(empty);
    const modified = cache.ApplyTo(holder);
    expect(cache.ApplyTo(holder)).toBe(modified);
    const value = (modified.getScPatternAttr() as ScPatternAttr).GetItem(150) as SvxBoxItem;
    expect(widths(value)).toEqual([20, undefined, 40, undefined]);
    expect(value.GetDistance(Edge.LEFT)).toBe(8);
    expect(
      widths(
        (single.ApplyTo(holder).getScPatternAttr() as ScPatternAttr).GetItem(150) as SvxBoxItem,
      ),
    ).toEqual([undefined, undefined, undefined, undefined]);
    expect(widths((holder.getScPatternAttr() as ScPatternAttr).GetItem(150) as SvxBoxItem)[0]).toBe(
      20,
    );
  } finally {
    cache.Dispose();
    single.Dispose();
    holder.Dispose();
    empty.Dispose();
    set.ClearItem();
    close(doc);
  }
});
it("applies source perimeter/interior lines to a real rectangle and preserves values and unselected cells", /** Actual column attribute runs. @returns Nothing. */ () => {
  const doc = document(),
    marks = new ScMarkData(doc.GetSheetLimits()),
    [outer, inner] = frame();
  try {
    marks.SelectOneTable(0);
    marks.SetMarkArea(new ScRange(0, 0, 0, 2, 2, 0));
    doc.SetValue(new ScAddress(1, 1, 0), 17);
    doc.ApplySelectionFrame(marks, outer, inner);
    expect(widths(box(doc, 0, 0))).toEqual([20, 60, 40, 70]);
    expect(widths(box(doc, 1, 1))).toEqual([60, 60, 70, 70]);
    expect(widths(box(doc, 2, 2))).toEqual([60, 30, 70, 50]);
    expect(widths(box(doc, 3, 3))).toEqual([undefined, undefined, undefined, undefined]);
    expect(doc.GetValue(new ScAddress(1, 1, 0))).toBe(17);
    const before = doc.GetPattern(new ScAddress(1, 1, 0));
    doc.ApplySelectionFrame(marks, outer, inner);
    expect(doc.GetPattern(new ScAddress(1, 1, 0))).toBe(before);
  } finally {
    close(doc);
  }
});
it("keeps one-cell/one-row/one-column edges,selective validity and actual RTL swaps", /** Native frame boundary branches. @returns Nothing. */ () => {
  const doc = document(),
    marks = new ScMarkData(doc.GetSheetLimits()),
    [outer, inner] = frame();
  try {
    marks.SelectOneTable(0);
    marks.SetMarkArea(new ScRange(0, 0, 0, 0, 0, 0));
    doc.ApplySelectionFrame(marks, outer, inner);
    expect(widths(box(doc))).toEqual([20, 30, 40, 50]);
    inner.SetValid(Valid.ALL, false);
    inner.SetValid(Valid.TOP);
    const update = new SvxBoxItem(150);
    update.SetLine(new SvxBorderLine(null, 90), Edge.TOP);
    doc.ApplySelectionFrame(marks, update, inner);
    expect(widths(box(doc))).toEqual([90, 30, 40, 50]);
    inner.ResetFlags();
    marks.SetMarkArea(new ScRange(2, 0, 0, 4, 0, 0));
    doc.ApplySelectionFrame(marks, outer, inner);
    expect(widths(box(doc, 3, 0))).toEqual([20, 30, 70, 70]);
    marks.SetMarkArea(new ScRange(6, 0, 0, 6, 2, 0));
    doc.ApplySelectionFrame(marks, outer, inner);
    expect(widths(box(doc, 6, 1))).toEqual([60, 60, 40, 50]);
    doc.SetLayoutRTL(0, true);
    marks.SetMarkArea(new ScRange(8, 0, 0, 8, 0, 0));
    doc.ApplySelectionFrame(marks, outer, inner);
    expect(widths(box(doc, 8, 0))).toEqual([20, 30, 50, 40]);
    expect(doc.IsLayoutRTL(8)).toBe(false);
  } finally {
    close(doc);
  }
});
it("preserves disjoint and grouped marks rather than drawing a bounding rectangle", /** Native range-list traversal. @returns Nothing. */ () => {
  const doc = document(2),
    marks = new ScMarkData(doc.GetSheetLimits()),
    [outer, inner] = frame();
  try {
    marks.SelectOneTable(0);
    marks.SelectTable(1, true);
    marks.SetMultiMarkArea(new ScRange(0, 0, 0, 0, 1, 0));
    marks.SetMultiMarkArea(new ScRange(2, 3, 0, 3, 3, 0));
    doc.ApplySelectionFrame(marks, outer, inner);
    for (const tab of [0, 1]) {
      expect(widths(box(doc, 0, 0, tab))).toEqual([20, 60, 40, 50]);
      expect(widths(box(doc, 1, 1, tab))).toEqual([undefined, undefined, undefined, undefined]);
      expect(widths(box(doc, 3, 3, tab))).toEqual([20, 30, 70, 50]);
    }
  } finally {
    close(doc);
  }
});
it("clears corresponding adjacent envelope edges only when the real removal flag is set", /** Actual mark envelopes and native inverse-edge validity. @returns Nothing. */ () => {
  const doc = document(),
    marks = new ScMarkData(doc.GetSheetLimits()),
    [outer, inner] = frame();
  try {
    marks.SelectOneTable(0);
    marks.SetMarkArea(new ScRange(0, 0, 0, 2, 2, 0));
    doc.ApplySelectionFrame(marks, outer, inner);
    marks.SetMarkArea(new ScRange(1, 1, 0, 1, 1, 0));
    const clear = new SvxBoxItem(150);
    clear.SetRemoveAdjacentCellBorder(true);
    marks.GetSelectionCover(new ScRange());
    doc.ApplySelectionFrame(marks, clear, inner);
    expect(widths(box(doc, 1, 1))).toEqual([undefined, undefined, undefined, undefined]);
    expect(box(doc, 1, 0).GetBottom()).toBeUndefined();
    expect(box(doc, 1, 2).GetTop()).toBeUndefined();
    expect(box(doc, 0, 1).GetRight()).toBeUndefined();
    expect(box(doc, 2, 1).GetLeft()).toBeUndefined();
    expect(box(doc, 0, 0).GetTop()?.GetWidth()).toBe(20);
  } finally {
    close(doc);
  }
});
it("merges actual frame lines into native validity states and preserves source allocated-column clamping", /** Source query state machine. @returns Nothing. */ () => {
  const doc = document(),
    marks = new ScMarkData(doc.GetSheetLimits()),
    [outer, inner] = frame();
  try {
    marks.SelectOneTable(0);
    marks.SetMarkArea(new ScRange(0, 0, 0, 1, 1, 0));
    doc.ApplySelectionFrame(marks, outer, inner);
    const result = new SvxBoxItem(150),
      info = new SvxBoxInfoItem(151);
    doc.GetSelectionFrame(marks, result, info);
    expect(widths(result)).toEqual([20, 30, 40, 50]);
    expect([
      info.GetHori()?.GetWidth(),
      info.GetVert()?.GetWidth(),
      info.IsHor(),
      info.IsVer(),
    ]).toEqual([60, 70, true, true]);
    marks.SetMarkArea(new ScRange(0, 0, 0, 3, 1, 0));
    doc.GetSelectionFrame(marks, result, info);
    expect(result.GetRight()?.GetWidth()).toBe(50);
    const patch = new ScPatternAttr(doc.getCellAttributeHelper()),
      changed = new SvxBoxItem(box(doc, 1, 0));
    changed.SetLine(new SvxBorderLine(null, 120), Edge.TOP);
    patch.ItemSetPut(changed);
    try {
      doc.ApplyPatternAreaTab(1, 0, 1, 0, 0, patch);
    } finally {
      patch.Dispose();
    }
    marks.SetMarkArea(new ScRange(0, 0, 0, 1, 1, 0));
    doc.GetSelectionFrame(marks, result, info);
    expect(info.IsValid(Valid.TOP)).toBe(false);
    expect(result.GetTop()).toBeUndefined();
  } finally {
    close(doc);
  }
});
it("updates only present line styles/colors and source multi-marked allocated columns", /** Actual line-style path with absence and no allocation. @returns Nothing. */ () => {
  const doc = document(),
    marks = new ScMarkData(doc.GetSheetLimits()),
    [outer, inner] = frame();
  try {
    marks.SelectOneTable(0);
    marks.SetMultiMarkArea(new ScRange(0, 0, 0, 0, 2, 0));
    doc.ApplySelectionFrame(marks, outer, inner);
    const line = new SvxBorderLine(new Color(0xff0000), 100, Style.DASHED);
    doc.ApplySelectionLineStyle(marks, line, false);
    expect(box(doc).GetTop()?.GetWidth()).toBe(100);
    expect((box(doc).GetTop()?.GetColor().toUInt32() ?? 0) & 0xffffff).toBe(0x123456);
    doc.ApplySelectionLineStyle(marks, line, true);
    expect((box(doc).GetTop()?.GetColor().toUInt32() ?? 0) & 0xffffff).toBe(0xff0000);
    doc.ApplySelectionLineStyle(marks, undefined, true);
    expect(box(doc).GetTop()?.GetWidth()).toBe(100);
    doc.ApplySelectionLineStyle(marks, undefined, false);
    expect(widths(box(doc))).toEqual([undefined, undefined, undefined, undefined]);
  } finally {
    close(doc);
  }
});
