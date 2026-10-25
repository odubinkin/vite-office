/** @fileoverview Checks pinned table/row/cell sibling constructor root identity without browser geometry arguments. */
import { expect, it, vi } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwRootFrame, createSwPageFrames } from "./newfrm";
import { SwTabFrame, SwRowFrame, SwCellFrame } from "./tabfrm";
import { createDefaultWriterPageDescriptor } from "../../../../test/writer-page-descriptor";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
/** Requires an actual native owner. @param value - Optional original owner. @returns Original owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing native constructor owner");
  return value;
}
/** Allocates original native model and root owners. @returns Original owners. */
function fixture() {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Native root");
  table.AddColumnWidth(3000);
  const line = doc.nodes.AppendTableRow(table, 1),
    box = required(line.GetTabBoxes()[0]);
  const root = new SwRootFrame(/** Reads the original model. @returns Document. */ () => doc);
  return { doc, table, line, box, root };
}
it("native table sibling constructor propagates original root through its linked lowers", /** Checks actual frame constructor ownership and topology. @returns Nothing. */ () => {
  const f = fixture(),
    frame = new SwTabFrame(f.table, f.root),
    row = frame.Lower() as SwRowFrame,
    cell = row.Lower() as SwCellFrame;
  try {
    expect(frame.getRootFrame()).toBe(f.root);
    expect(row.getRootFrame()).toBe(f.root);
    expect(cell.getRootFrame()).toBe(f.root);
    expect(row.GetUpper()).toBe(frame);
    expect(cell.GetUpper()).toBe(row);
    expect(frame.GetUpper()).toBeUndefined();
    expect(frame.mouseGeometry).toBeUndefined();
  } finally {
    frame.DestroyImpl();
    f.root.DestroyImpl();
  }
});
it("native independent row and cell constructors borrow the original sibling root", /** Checks source constructor contracts separately from table allocation. @returns Nothing. */ () => {
  const f = fixture(),
    row = new SwRowFrame(f.line, f.root),
    cell = new SwCellFrame(f.box, row);
  try {
    expect(row.getRootFrame()).toBe(f.root);
    expect(cell.getRootFrame()).toBe(f.root);
    expect(cell.GetUpper()).toBeUndefined();
  } finally {
    cell.DestroyImpl();
    row.DestroyImpl();
    f.root.DestroyImpl();
  }
});
it("native detached table, row and cell defaults preserve absent root and device geometry", /** Checks native nullptr sibling default without a fabricated root. @returns Nothing. */ () => {
  const f = fixture(),
    frame = new SwTabFrame(f.table),
    row = new SwRowFrame(f.line),
    cell = new SwCellFrame(f.box);
  try {
    for (const current of [frame, row, cell]) expect(current.getRootFrame()).toBeUndefined();
    expect(frame.mouseGeometry).toBeUndefined();
  } finally {
    cell.DestroyImpl();
    row.DestroyImpl();
    frame.DestroyImpl();
    f.root.DestroyImpl();
  }
});
it("native table constructors retain independent roots over the same model", /** Checks original constructor identity is not inferred from model or previous frame. @returns Nothing. */ () => {
  const f = fixture(),
    second = new SwRootFrame(/** Reads shared original model. @returns Document. */ () => f.doc),
    a = new SwTabFrame(f.table, f.root),
    b = new SwTabFrame(f.table, second);
  try {
    expect(a.getRootFrame()).toBe(f.root);
    expect(b.getRootFrame()).toBe(second);
    expect((a.Lower() as SwRowFrame).getRootFrame()).toBe(f.root);
    expect((b.Lower() as SwRowFrame).getRootFrame()).toBe(second);
  } finally {
    a.DestroyImpl();
    b.DestroyImpl();
    second.DestroyImpl();
    f.root.DestroyImpl();
  }
});
it("native page placement passes its original sibling into temporary table formatting", /** Checks actual existing paginator caller and its unchanged owned lifetime. @returns Nothing. */ () => {
  const f = fixture(),
    original = SwTabFrame.prototype.Format,
    observed: SwTabFrame[] = [];
  const spy = vi.spyOn(SwTabFrame.prototype, "Format").mockImplementation(
    /** Observes the actual formatter receiver. @param this - Original native receiver. @param width - Native available width. @returns Original print geometry. */ function (
      this: SwTabFrame,
      width: number,
    ) {
      observed.push(this);
      expect(this.getRootFrame()).toBe(f.root);
      expect(this.Lower()?.getRootFrame()).toBe(f.root);
      return original.call(this, width);
    },
  );
  try {
    const pages = createSwPageFrames(
      [],
      createDefaultWriterPageDescriptor("en-GB").GetValue(),
      undefined,
      [
        {
          table: f.table,
          tableName: f.table.GetName(),
          afterParagraphIndex: -1,
          rowHeights: [300],
        },
      ],
      f.root,
    );
    expect(pages[0]?.tableFrames[0]?.table).toBe(f.table);
    expect(observed).toHaveLength(1);
    expect(observed[0]?.IsInDtor()).toBe(true);
  } finally {
    spy.mockRestore();
    f.root.DestroyImpl();
  }
});
it("native sibling roots survive original cell format claims and accepted size notifications", /** Checks local native notification and teardown without rebuilding root identity. @returns Nothing. */ () => {
  const f = fixture(),
    frame = new SwTabFrame(f.table, f.root),
    row = frame.Lower() as SwRowFrame,
    cell = row.Lower() as SwCellFrame;
  try {
    const format = f.box.ClaimFrameFormat();
    format.SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Variable, 1500, 0));
    expect(cell.GetFormat()).toBe(format);
    expect(frame.GetBoxPrintWidth(f.box, 6000)).toBe(6000);
    expect(cell.getRootFrame()).toBe(f.root);
    expect(row.getRootFrame()).toBe(f.root);
    frame.DestroyImpl();
    expect(cell.GetRegisteredIn()).toBeUndefined();
    expect(row.GetRegisteredIn()).toBeUndefined();
  } finally {
    frame.DestroyImpl();
    f.root.DestroyImpl();
  }
});
