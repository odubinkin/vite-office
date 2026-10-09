/** @fileoverview Verifies native collapsing-border item ownership and original table/row/cell invalidation. */
import { expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwFrame, SwLayoutFrame } from "./wsfrm";
import { SwTabFrame, SwRowFrame, SwCellFrame } from "./tabfrm";
import type { SwFrameFormat } from "./atrfrm";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import { RES_BOX, RES_COLLAPSING_BORDERS } from "../../../inc/hintids";
import { LegacyModifyHint } from "../../../inc/calbck";
import { SwTable } from "../table/swtable";
/** Requires an original frame. @param value - Optional owner. @returns Original owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing native border owner");
  return value;
}
/** Represents a registered non-layout lower frame. */
class Leaf extends SwFrame {
  /** Registers an original frame. @param format - Native owner. @returns Nothing. */
  public constructor(format: SwFrameFormat) {
    super(format);
  }
}
/** Represents an original intermediate layout. */
class Layout extends SwLayoutFrame {
  /** Registers an original layout. @param format - Native owner. @returns Nothing. */
  public constructor(format: SwFrameFormat) {
    super(format);
  }
}
/** Reads original hierarchy without a model mirror. @param frame - Original owner. @returns Original frames. */
function frames(frame: SwFrame): SwFrame[] {
  const result = [frame];
  if (frame instanceof SwLayoutFrame)
    for (let lower = frame.Lower(); lower; lower = lower.GetNext()) result.push(...frames(lower));
  return result;
}
/** Supplies independent geometry validity. @param frame - Original frame. @returns Nothing. */
function ready(frame: SwFrame): void {
  for (const original of frames(frame)) {
    original.setFrameAreaSizeValid(true);
    original.setFramePrintAreaValid(true);
    original.setFrameAreaPositionValid(true);
    original.ResetCompletePaint();
  }
}
/** Reads observable native geometry. @param frame - Original frame. @returns Size, print, position and paint. */
function state(frame: SwFrame): boolean[] {
  return [
    frame.isFrameAreaSizeValid(),
    frame.isFramePrintAreaValid(),
    frame.isFrameAreaPositionValid(),
    frame.IsCompletePaint(),
  ];
}
/** Constructs actual three-row linked table frames. @param collapsing - Native initial mode. @returns Original owners. */
function fixture(collapsing = true) {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("NativeBorders", {
      borderModel: collapsing ? "collapsing" : "separating",
    });
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  for (let index = 0; index < 3; index++) doc.nodes.AppendTableRow(table, 2);
  const frame = new SwTabFrame(table),
    rows: SwRowFrame[] = [];
  for (let row = frame.Lower(); row; row = row.GetNext()) rows.push(row as SwRowFrame);
  return { doc, table, frame, rows };
}
it("default native table construction and borrowed deltas retain pool and Which contracts", /** Checks omitted geometry and native empty/old-only deltas without changing model items. @returns Nothing. */ () => {
  const f = fixture(false);
  const original = new SwTable(f.table.GetTableNode(), "DefaultNativeGeometry");
  expect(original.GetFormat()).toEqual({ headerRows: 1, repeatHeaderRows: true });
  expect(
    (original.GetFrameFormat().GetAttrSet().Get(RES_COLLAPSING_BORDERS) as SfxBoolItem).GetValue(),
  ).toBe(false);
  try {
    ready(f.frame);
    f.table.GetFrameFormat().CallSwClientNotify(new LegacyModifyHint(undefined, undefined));
    for (const frame of frames(f.frame)) expect(state(frame)).toEqual([true, true, true, false]);
    f.table
      .GetFrameFormat()
      .CallSwClientNotify(new LegacyModifyHint(new SvxBoxItem(RES_BOX), undefined));
    expect(state(f.frame)).toEqual([true, true, true, false]);
    for (const row of f.rows)
      for (const frame of frames(row)) expect(state(frame)).toEqual([true, true, true, false]);
    expect(f.frame.IsCollapsingBorders()).toBe(false);
    expect(original.GetFrameFormat()).not.toBe(f.table.GetFrameFormat());
  } finally {
    f.frame.DestroyImpl();
  }
});
it("native border bool owns explicit construction, direct changes, inheritance and boundary reset", /** Checks original native items and literal false pool default. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Ownership"),
    frame = new SwTabFrame(table),
    format = table.GetFrameFormat();
  try {
    expect(frame.IsCollapsingBorders()).toBe(false);
    expect(table.GetFormat().borderModel).toBeUndefined();
    expect(format.GetAttrSet().GetItemIfSet(RES_COLLAPSING_BORDERS, false)).toBeUndefined();
    table.SetFormat({ width: 6000, borderModel: "collapsing" });
    expect(frame.IsCollapsingBorders()).toBe(true);
    expect(table.GetFormat()).toEqual({
      width: 6000,
      borderModel: "collapsing",
      headerRows: 1,
      repeatHeaderRows: true,
    });
    format.SetFormatAttr(new SfxBoolItem(RES_COLLAPSING_BORDERS, false));
    expect(table.GetFormat().borderModel).toBe("separating");
    expect(frame.IsCollapsingBorders()).toBe(false);
    const parent = doc.GetDfltFrameFormat();
    parent.SetFormatAttr(new SfxBoolItem(RES_COLLAPSING_BORDERS, true));
    format.SetDerivedFrom(parent);
    format.ResetFormatAttr(RES_COLLAPSING_BORDERS);
    expect(frame.IsCollapsingBorders()).toBe(true);
    expect(table.GetFormat().borderModel).toBeUndefined();
    table.SetFormat({ width: 5000, borderModel: "separating" });
    expect(frame.IsCollapsingBorders()).toBe(false);
    table.SetFormat({ width: 4000 });
    expect(frame.IsCollapsingBorders()).toBe(true);
    expect(table.GetFormat()).toEqual({ width: 4000, headerRows: 1, repeatHeaderRows: true });
    parent.ResetFormatAttr(RES_COLLAPSING_BORDERS);
    expect(frame.IsCollapsingBorders()).toBe(false);
    for (const model of ["collapsing", "separating"] as const) {
      const original = doc.nodes.MakeTableNode(model, { borderModel: model });
      expect(original.GetFormat().borderModel).toBe(model);
      expect(
        (
          original.GetFrameFormat().GetAttrSet().Get(RES_COLLAPSING_BORDERS) as SfxBoolItem
        ).GetValue(),
      ).toBe(model === "collapsing");
    }
  } finally {
    frame.DestroyImpl();
  }
});
it("native mode changes recursively invalidate original table geometry and paint while retaining positions", /** Checks borrowed native table deltas and layout/non-layout lowers. @returns Nothing. */ () => {
  const f = fixture(false),
    row = required(f.rows[0]),
    cell = required(row.Lower()) as SwCellFrame,
    leaf = new Leaf(cell.GetFormat());
  leaf.InsertBehind(cell);
  try {
    ready(f.frame);
    f.table.GetFrameFormat().SetFormatAttr(new SfxBoolItem(RES_COLLAPSING_BORDERS, true));
    for (const frame of frames(f.frame)) expect(state(frame)).toEqual([false, false, true, true]);
    ready(f.frame);
    const borrowed = new SfxBoolItem(RES_COLLAPSING_BORDERS, false);
    f.table.GetFrameFormat().CallSwClientNotify(new LegacyModifyHint(undefined, borrowed));
    for (const frame of frames(f.frame)) expect(state(frame)).toEqual([false, false, true, true]);
    expect(f.frame.IsCollapsingBorders()).toBe(true);
    expect(leaf.GetUpper()).toBe(cell);
  } finally {
    f.frame.DestroyImpl();
  }
});
it("native box changes invalidate current and next row lowers and the final-row table print area", /** Checks original sibling reactions without invalidating unrelated rows. @returns Nothing. */ () => {
  const f = fixture(),
    first = required(f.rows[0]),
    next = required(f.rows[1]),
    last = required(f.rows[2]),
    cell = required(first.Lower()) as SwCellFrame;
  try {
    ready(f.frame);
    const box = new SvxBoxItem(RES_BOX);
    box.SetAllDistances(90);
    cell.GetTabBox().ClaimFrameFormat().SetFormatAttr(box);
    for (const row of [first, next])
      for (const frame of frames(row)) expect(state(frame)).toEqual([false, false, true, true]);
    for (const frame of frames(last)) expect(state(frame)).toEqual([true, true, true, false]);
    expect(state(f.frame)).toEqual([true, true, true, false]);
    ready(f.frame);
    const lastCell = required(last.Lower()) as SwCellFrame;
    lastCell.GetTabBox().ClaimFrameFormat().SetFormatAttr(box);
    expect(state(f.frame)).toEqual([true, false, true, false]);
    for (const frame of frames(last)) expect(state(frame)).toEqual([false, false, true, true]);
    for (const frame of frames(first)) expect(state(frame)).toEqual([true, true, true, false]);
    expect(lastCell.FindTabFrame()).toBe(f.frame);
  } finally {
    f.frame.DestroyImpl();
  }
});
it("native cell format replacement reformats only the collapsing containing row", /** Checks exact replacement ownership and separating layout behavior. @returns Nothing. */ () => {
  for (const collapsing of [true, false]) {
    const f = fixture(collapsing),
      row = required(f.rows[0]),
      cell = required(row.Lower()) as SwCellFrame,
      replacement = f.doc.MakeTableBoxFormat();
    try {
      ready(f.frame);
      cell.GetTabBox().ChgFrameFormat(replacement);
      expect(cell.GetFormat()).toBe(replacement);
      expect(state(cell)).toEqual([false, false, true, true]);
      expect(state(row)).toEqual([!collapsing, !collapsing, true, false]);
      expect(state(required(f.rows[1]))).toEqual([true, true, true, false]);
      expect(state(f.frame)).toEqual([true, true, true, false]);
      expect(cell.GetUpper()).toBe(row);
    } finally {
      f.frame.DestroyImpl();
    }
  }
});
it("legacy native box invalidation follows intermediate original layouts and admits detached or separating cells", /** Checks native ancestor traversal and stable absent-table boundary. @returns Nothing. */ () => {
  const f = fixture(),
    row = required(f.rows[0]),
    cell = required(row.Lower()) as SwCellFrame,
    wrapper = new Layout(f.doc.MakeTableLineFormat());
  cell.RemoveFromLayout();
  wrapper.InsertBehind(row);
  cell.InsertBehind(wrapper);
  try {
    ready(f.frame);
    cell.GetFormat().CallSwClientNotify(new LegacyModifyHint(undefined, new SvxBoxItem(RES_BOX)));
    expect(state(row)).toEqual([false, false, true, true]);
    expect(state(wrapper)).toEqual([false, false, true, true]);
    expect(state(required(f.rows[1]))).toEqual([false, false, true, true]);
    cell.RemoveFromLayout();
    ready(f.frame);
    ready(cell);
    cell.GetFormat().CallSwClientNotify(new LegacyModifyHint(undefined, new SvxBoxItem(RES_BOX)));
    expect(state(row)).toEqual([true, true, true, false]);
    expect(state(cell)).toEqual([false, false, true, true]);
    cell.InsertBehind(wrapper);
    f.table.GetFrameFormat().SetFormatAttr(new SfxBoolItem(RES_COLLAPSING_BORDERS, false));
    ready(f.frame);
    cell.GetFormat().CallSwClientNotify(new LegacyModifyHint(undefined, new SvxBoxItem(RES_BOX)));
    expect(state(row)).toEqual([true, true, true, false]);
    expect(state(required(f.rows[1]))).toEqual([true, true, true, false]);
  } finally {
    f.frame.DestroyImpl();
  }
});
