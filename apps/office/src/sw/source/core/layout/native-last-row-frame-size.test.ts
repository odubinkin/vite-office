/** @fileoverview Verifies original containing-table invalidation from native last-row size and split notifications. */
import { expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwFrame, SwLayoutFrame } from "./wsfrm";
import { SwTabFrame, SwRowFrame, SwCellFrame } from "./tabfrm";
import type { SwFrameFormat } from "./atrfrm";
import type { SwTable } from "../table/swtable";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SwFormatRowSplit } from "../../../inc/fmtrowsplt";
import { LegacyModifyHint } from "../../../inc/calbck";
import { SwFormatChangeHint } from "../../../inc/hints";
/** Requires an original frame. @param value - Optional owner. @returns Original owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing original last-row frame");
  return value;
}
/** Represents an original non-table layout ancestor. */
class Layout extends SwLayoutFrame {
  /** Registers an original layout. @param format - Original owner. @returns Nothing. */
  public constructor(format: SwFrameFormat) {
    super(format);
  }
}
/** Records native table invalidation before row attribute dispatch. */
class Table extends SwTabFrame {
  public readonly states: boolean[][] = [];
  /** Registers the actual table hierarchy. @param table - Original model. @returns Nothing. */
  public constructor(table: SwTable) {
    super(table);
  }
  /** Reads original row validity at native page dispatch. @returns Nothing. */
  protected override InvalidatePage(): void {
    const row = required(required(this.Lower()).GetNext());
    this.states.push([row.isFrameAreaSizeValid(), row.isFramePrintAreaValid()]);
  }
}
/** Creates original two-row table frames. @returns Actual owners. */
function fixture() {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("LastRow");
  table.AddColumnWidth(3000);
  doc.nodes.AppendTableRow(table, 1);
  doc.nodes.AppendTableRow(table, 1);
  const frame = new Table(table),
    first = required(frame.Lower()) as SwRowFrame,
    last = required(first.GetNext()) as SwRowFrame;
  return { doc, table, frame, first, last };
}
/** Sets independent native geometry validity. @param frame - Original frame. @returns Nothing. */
function ready(frame: SwFrame): void {
  frame.setFrameAreaPositionValid(true);
  frame.setFrameAreaSizeValid(true);
  frame.setFramePrintAreaValid(true);
  frame.ResetCompletePaint();
}
it("default base preparation retains original table and row geometry validity", /** Checks native Clear default before any size change. @returns Nothing. */ () => {
  const f = fixture();
  try {
    ready(f.frame);
    ready(f.last);
    expect(f.last.Prepare()).toBe(false);
    expect(f.frame.isFrameAreaPositionValid()).toBe(true);
    expect(f.last.isFrameAreaDefinitionValid()).toBe(true);
    expect(f.last.IsCompletePaint()).toBe(false);
    expect(f.frame.states).toEqual([]);
    expect(f.last.FindTabFrame()).toBe(f.frame);
  } finally {
    f.frame.DestroyImpl();
  }
});
it("nearest original table lookup follows live upper links through nested rows and cells", /** Checks original identity without a geometry or model map. @returns Nothing. */ () => {
  const f = fixture(),
    outer = new Layout(f.doc.MakeTableLineFormat()),
    cell = required(f.last.Lower()) as SwCellFrame;
  try {
    expect(f.frame.FindTabFrame()).toBeUndefined();
    expect(f.last.FindTabFrame()).toBe(f.frame);
    expect(cell.FindTabFrame()).toBe(f.frame);
    f.frame.InsertBehind(outer);
    expect(f.frame.FindTabFrame()).toBe(f.frame);
    const innerTable = f.doc.nodes.MakeTableNode("Inner");
    innerTable.AddColumnWidth(1500);
    f.doc.nodes.AppendTableRow(innerTable, 1);
    const inner = new SwTabFrame(innerTable);
    inner.InsertBehind(cell);
    expect(required(inner.Lower()).FindTabFrame()).toBe(inner);
    expect(inner.FindTabFrame()).toBe(inner);
    expect(cell.FindTabFrame()).toBe(f.frame);
    inner.RemoveFromLayout();
    inner.DestroyImpl();
    f.last.RemoveFromLayout();
    expect(f.last.FindTabFrame()).toBeUndefined();
    expect(cell.FindTabFrame()).toBeUndefined();
    f.last.InsertBehind(f.frame, f.first);
    expect(cell.FindTabFrame()).toBe(f.frame);
  } finally {
    f.frame.RemoveFromLayout();
    f.frame.DestroyImpl();
    outer.DestroyImpl();
  }
});
it("table lookup rejects non-table chains and destruction-marked original frames", /** Checks native self and ancestor destructor guards. @returns Nothing. */ () => {
  const f = fixture(),
    parent = new Layout(f.doc.MakeTableLineFormat()),
    child = new Layout(f.doc.MakeTableLineFormat());
  child.InsertBehind(parent);
  try {
    expect(parent.IsInDtor()).toBe(false);
    expect(child.FindTabFrame()).toBeUndefined();
    SwFrame.prototype.DestroyImpl.call(child);
    expect(child.IsInDtor()).toBe(true);
    expect(child.FindTabFrame()).toBeUndefined();
    expect(f.frame.IsInDtor()).toBe(false);
    SwFrame.prototype.DestroyImpl.call(f.frame);
    expect(f.frame.IsInDtor()).toBe(true);
    expect(f.last.FindTabFrame()).toBeUndefined();
    expect(required(f.last.Lower()).FindTabFrame()).toBeUndefined();
  } finally {
    parent.DestroyImpl();
    f.frame.DestroyImpl();
  }
});
it("last-row size invalidates the original table position before forwarding the row item", /** Checks real format deltas and native ordering versus non-last sibling invalidation. @returns Nothing. */ () => {
  const f = fixture();
  try {
    ready(f.frame);
    ready(f.first);
    ready(f.last);
    f.first
      .GetTabLine()
      .ClaimFrameFormat()
      .SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Fixed, 0, 600));
    expect(f.frame.isFrameAreaPositionValid()).toBe(true);
    expect(f.frame.states).toEqual([]);
    expect(f.first.isFrameAreaSizeValid()).toBe(false);
    expect(f.last.isFrameAreaPositionValid()).toBe(false);
    ready(f.last);
    f.last
      .GetTabLine()
      .ClaimFrameFormat()
      .SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Fixed, 0, 900));
    expect(f.frame.isFrameAreaPositionValid()).toBe(false);
    expect(f.frame.states).toEqual([[true, true]]);
    expect(f.last.isFrameAreaPositionValid()).toBe(true);
    expect(f.last.isFrameAreaSizeValid()).toBe(false);
    expect(f.last.isFramePrintAreaValid()).toBe(false);
    expect(f.last.Format(1200)).toBe(900);
    expect(f.frame.GetTable()).toBe(f.table);
    expect(f.last.GetUpper()).toBe(f.frame);
  } finally {
    f.frame.DestroyImpl();
  }
});
it("last-row split and borrowed legacy size notify the same table while general format hints stay filtered", /** Checks native item and filter contracts on original owners. @returns Nothing. */ () => {
  const f = fixture();
  try {
    ready(f.frame);
    ready(f.last);
    const format = f.last.GetTabLine().ClaimFrameFormat();
    format.SetFormatAttr(new SwFormatRowSplit(false));
    expect(f.frame.isFrameAreaPositionValid()).toBe(false);
    expect(f.frame.states).toEqual([[true, true]]);
    expect(f.last.isFrameAreaSizeValid()).toBe(true);
    expect(f.last.isFramePrintAreaValid()).toBe(true);
    ready(f.frame);
    format.CallSwClientNotify(new SwFormatChangeHint(format, format));
    expect(f.frame.isFrameAreaPositionValid()).toBe(true);
    format.CallSwClientNotify(
      new LegacyModifyHint(undefined, new SwFormatFrameSize(SwFrameSize.Minimum, 0, 720)),
    );
    expect(f.frame.isFrameAreaPositionValid()).toBe(false);
    expect(f.frame.states).toEqual([
      [true, true],
      [true, true],
    ]);
    expect(f.last.isFrameAreaSizeValid()).toBe(false);
    ready(f.frame);
    f.last.RemoveFromLayout();
    format.SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Fixed, 0, 1200));
    expect(f.frame.isFrameAreaPositionValid()).toBe(true);
    f.last.InsertBehind(f.frame, f.first);
  } finally {
    f.frame.DestroyImpl();
  }
});
