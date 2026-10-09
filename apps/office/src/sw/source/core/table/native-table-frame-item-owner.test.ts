/** @fileoverview Verifies original SwTable frame-item ownership, native client reactions and deletion lifetime. */
import { expect, it, vi } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwFrameFormat } from "../layout/atrfrm";
import { SwTabFrame, SwCellFrame } from "../layout/tabfrm";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { LegacyModifyHint } from "../../../inc/calbck";
import {
  AttrSetChangeHint,
  SwAttrSetChg,
  ObjectDyingHint,
  TableHeadingChange,
} from "../../../inc/hints";
import { SwAttrSet } from "../attr/swatrset";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { RES_COLLAPSING_BORDERS, RES_FRM_SIZE } from "../../../inc/hintids";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { SwTabCols } from "../bastyp/tabcol";
/** Builds original native independent rows. @param rows - Reference widths. @returns Native owners. */
function fixture(
  rows: readonly (readonly number[])[] = [
    [1000, 5000],
    [1000, 1000, 4000],
  ],
) {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("FrameItems", {
      width: 6000,
      horiOrient: HoriOrientation.LEFT,
    });
  for (const width of rows[0] ?? []) table.AddColumnWidth(width);
  for (const values of rows) {
    const line = doc.nodes.AppendTableRow(table, values.length);
    for (const [index, box] of line.GetTabBoxes().entries()) {
      const size = box.GetFrameSize();
      size.SetWidth(values[index] ?? 0);
      box.SetFrameSize(size);
    }
  }
  return { doc, table, format: table.GetFrameFormat() };
}
/** Reads actual native box items. @param f - Original fixture. @returns Independent row widths. */
function widths(f: ReturnType<typeof fixture>): number[][] {
  return f.table
    .GetTabLines()
    .map(
      /** Reads original line boxes. @param line - Native line. @returns Widths. */ (line) =>
        line
          .GetTabBoxes()
          .map(
            /** Reads effective frame size. @param box - Original cell. @returns Width. */ (box) =>
              box.GetFrameSize().GetWidth(),
          ),
    );
}
it("original frame item owns width and scales original independent boxes once", /** Checks source ownership, borrowed items and scalar-free ingress. @returns Nothing. */ () => {
  const f = fixture(),
    rows = [...f.table.GetTabLines()],
    boxes = rows.flatMap(
      /** Keeps original cell identities. @param line - Native line. @returns Cells. */ (line) =>
        line.GetTabBoxes(),
    ),
    old = f.format.GetFrameSize(),
    item = new SwFormatFrameSize(SwFrameSize.Fixed, 1440, 777);
  item.SetWidthPercent(75);
  item.SetHeightPercent(65);
  expect(f.table.GetRegisteredIn()).toBe(f.format);
  expect(f.format.HasWriterListeners()).toBe(true);
  const adjust = vi.spyOn(f.table, "AdjustWidths");
  try {
    f.format.SetFormatAttr(item);
    expect(adjust).toHaveBeenCalledExactlyOnceWith(6000, 1440);
    expect(widths(f)).toEqual([
      [240, 1200],
      [240, 240, 960],
    ]);
    expect(f.table.GetFormat().width).toBe(1440);
    expect(f.format.GetFrameSize()).toEqual(item);
    expect(old.GetWidth()).toBe(6000);
    expect(item.GetWidth()).toBe(1440);
    expect(f.table.GetTabLines()).toEqual(rows);
    expect(
      rows.flatMap(
        /** Reads actual retained cells. @param row - Native line. @returns Original cells. */ (
          row,
        ) => row.GetTabBoxes(),
      ),
    ).toEqual(boxes);
    for (const box of boxes) {
      expect(box.GetFrameSize().GetHeight()).toBe(0);
      expect(box.GetFrameSize().GetHeightSizeType()).toBe(SwFrameSize.Variable);
    }
  } finally {
    adjust.mockRestore();
    f.table.Dispose();
  }
});
it.each(["legacy", "batched", "inherited"])(
  "native %s size delivery reaches the original table",
  /** Checks genuine native dispatch and effective parent ownership. @param mode - Delivery path. @returns Nothing. */ (
    mode,
  ) => {
    const f = fixture(),
      old = f.format.GetFrameSize(),
      item = new SwFormatFrameSize(SwFrameSize.Variable, 3000);
    const adjust = vi.spyOn(f.table, "AdjustWidths");
    try {
      if (mode === "legacy") {
        f.format.LockModify();
        f.format.SetFormatAttr(item);
        f.format.UnlockModify();
        f.format.CallSwClientNotify(new LegacyModifyHint(old, item));
      } else if (mode === "batched")
        f.format.RunNotificationTransaction(
          /** Publishes a native frame delta through the existing notification boundary. @returns Nothing. */ () => {
            f.format.SetFormatAttr(item);
          },
        );
      else {
        const parent = new SwFrameFormat(f.doc.GetAttrPool(), "Parent");
        parent.SetFormatAttr(old);
        f.format.GetAttrSet().ClearItem(RES_FRM_SIZE);
        f.format.SetDerivedFrom(parent);
        parent.SetFormatAttr(item);
        expect(f.table.GetFormat().width).toBeUndefined();
        expect(f.format.GetFrameSize().GetWidth()).toBe(3000);
        const frame = new SwTabFrame(f.table);
        try {
          expect(frame.Format(8000).width).toBe(3000);
        } finally {
          frame.DestroyImpl();
        }
      }
      expect(adjust).toHaveBeenCalledExactlyOnceWith(6000, 3000);
      expect(widths(f)).toEqual([
        [500, 2500],
        [500, 500, 2000],
      ]);
      expect(old.GetWidth()).toBe(6000);
      expect(item.GetWidth()).toBe(3000);
    } finally {
      adjust.mockRestore();
      f.table.Dispose();
    }
  },
);
it("native size guard ignores missing, unrelated and locked deltas, then reacts after unlock", /** Checks native hint admission without altering borrowed delta sets. @returns Nothing. */ () => {
  const f = fixture(),
    oldSet = new SwAttrSet(f.doc.GetAttrPool(), [[RES_FRM_SIZE, RES_COLLAPSING_BORDERS]]),
    nextSet = new SwAttrSet(f.doc.GetAttrPool(), [[RES_FRM_SIZE, RES_COLLAPSING_BORDERS]]);
  oldSet.Put(new SwFormatFrameSize(SwFrameSize.Variable, 6000));
  nextSet.Put(new SfxBoolItem(RES_COLLAPSING_BORDERS, true));
  const old = new SwAttrSetChg(f.format.GetAttrSet(), oldSet),
    next = new SwAttrSetChg(f.format.GetAttrSet(), nextSet),
    adjust = vi.spyOn(f.table, "AdjustWidths");
  try {
    f.format.CallSwClientNotify(new AttrSetChangeHint(undefined, next));
    f.format.CallSwClientNotify(new AttrSetChangeHint(old, undefined));
    f.format.CallSwClientNotify(new AttrSetChangeHint(old, next));
    f.format.CallSwClientNotify(new LegacyModifyHint(new SwFormatFrameSize(), undefined));
    f.format.CallSwClientNotify(new LegacyModifyHint(undefined, new SwFormatFrameSize()));
    f.format.CallSwClientNotify(
      new LegacyModifyHint(new SfxBoolItem(RES_COLLAPSING_BORDERS, false), new SwFormatFrameSize()),
    );
    f.format.CallSwClientNotify(new TableHeadingChange());
    f.table.LockModify();
    f.format.SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Variable, 3000));
    f.table.UnlockModify();
    expect(adjust).not.toHaveBeenCalled();
    expect(widths(f)).toEqual([
      [1000, 5000],
      [1000, 1000, 4000],
    ]);
    f.format.SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Variable, 1500));
    expect(adjust).toHaveBeenCalledExactlyOnceWith(3000, 1500);
    expect(widths(f)).toEqual([
      [500, 2500],
      [500, 500, 2000],
    ]);
    expect(oldSet.Count()).toBe(1);
    expect(nextSet.Count()).toBe(1);
  } finally {
    adjust.mockRestore();
    f.table.Dispose();
  }
});
it("native separator edge update suppresses general scaling and resets only width percent", /** Checks actual column command and complete native size preservation. @returns Nothing. */ () => {
  const f = fixture([
      [1000, 5000],
      [1000, 5000],
    ]),
    size = new SwFormatFrameSize(SwFrameSize.Fixed, 6000, 777);
  size.SetWidthPercent(75);
  size.SetHeightPercent(65);
  f.format.SetFormatAttr(size);
  const previous = new SwTabCols();
  previous.SetRight(6000);
  previous.SetRightMax(10000);
  const start = f.table.GetTabLines()[0]?.GetTabBoxes()[0];
  if (start === undefined) throw Error("Missing original separator box");
  expect(f.table.GetTabCols(previous, start)).toBe(true);
  const next = new SwTabCols(previous);
  next.SetRight(8000);
  next.GetEntry(0).nPos = 1333;
  const adjust = vi.spyOn(f.table, "AdjustWidths");
  try {
    expect(f.table.SetTabCols(next, previous, start, false)).toBe(true);
    expect(adjust).not.toHaveBeenCalled();
    expect(widths(f)).toEqual([
      [1333, 6667],
      [1333, 6667],
    ]);
    expect(f.format.GetFrameSize().GetWidth()).toBe(8000);
    expect(f.format.GetFrameSize().GetWidthPercent()).toBe(0);
    expect(f.format.GetFrameSize().GetHeight()).toBe(777);
    expect(f.format.GetFrameSize().GetHeightPercent()).toBe(65);
    f.format.SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Variable, 4000));
    expect(adjust).toHaveBeenCalledExactlyOnceWith(8000, 4000);
  } finally {
    adjust.mockRestore();
    f.table.Dispose();
  }
});
it("original table client follows matching native death and ignores foreign owners", /** Checks source registration through original frame death and root detachment. @returns Nothing. */ () => {
  const f = fixture(),
    parent = new SwFrameFormat(f.doc.GetAttrPool(), "Parent"),
    foreign = new SwFrameFormat(f.doc.GetAttrPool(), "Foreign");
  f.format.SetDerivedFrom(parent);
  f.format.CallSwClientNotify(new ObjectDyingHint(foreign));
  expect(f.table.GetRegisteredIn()).toBe(f.format);
  f.format.DisposeModify();
  expect(f.table.GetRegisteredIn()).toBe(parent);
  expect(f.table.GetFrameFormat()).toBe(parent);
  parent.DisposeModify();
  expect(f.table.GetRegisteredIn()).toBeUndefined();
  f.table.Dispose();
  foreign.DisposeModify();
});
it.each([false, true])(
  "actual table deletion releases native client and frames present=%s",
  /** Checks connected table section destruction and final frame lifetime. @param framed - Whether physical native frame exists. @returns Nothing. */ (
    framed,
  ) => {
    const f = fixture(),
      frame = framed ? new SwTabFrame(f.table) : undefined;
    f.doc.nodes.MakeTextNode("Following");
    f.doc.nodes.DeleteTable(f.table.GetTableNode());
    expect(f.table.GetRegisteredIn()).toBeUndefined();
    expect(f.format.HasWriterListeners()).toBe(false);
    expect(f.format.IsDisposed()).toBe(true);
    if (frame !== undefined) expect(frame.GetRegisteredIn()).toBeUndefined();
  },
);

it("native table deletion destroys an original detached physical cell", /** Checks model deletion releases a physical client without a layout parent. @returns Nothing. */ () => {
  const f = fixture(),
    box = f.table.GetTabLines()[0]?.GetTabBoxes()[0];
  if (box === undefined) throw Error("Missing detached native box");
  const cell = new SwCellFrame(box),
    format = box.GetFrameFormat();
  expect(cell.GetUpper()).toBeUndefined();
  f.doc.nodes.MakeTextNode("Following");
  f.doc.nodes.DeleteTable(f.table.GetTableNode());
  expect(cell.GetRegisteredIn()).toBeUndefined();
  expect(format.HasWriterListeners()).toBe(false);
});
