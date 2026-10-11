/** @fileoverview Checks native frame-area ownership, scoped value writeback and source rectangle edge/empty behavior on original model clients. */
import { expect, it } from "vitest";
import { SwRect, type ReadonlySwRect } from "../../../inc/swrect";
import { Point, Size } from "../../../../tools/inc/gen";
import { SwFrameAreaDefinition } from "./frame";
import { SwDoc } from "../doc/doc";
import { SwRootFrame } from "../layout/newfrm";
import { SwTextFrame } from "../text/txtfrm";
import { SwTabFrame, SwRowFrame, SwCellFrame } from "../layout/tabfrm";
import { SwFrame } from "../layout/wsfrm";
/** Reads literal geometry in native point/size order. @param rect - Original rectangle. @returns Native four values. */
function values(rect: Pick<ReadonlySwRect, "Left" | "Top" | "Width" | "Height">) {
  return [rect.Left(), rect.Top(), rect.Width(), rect.Height()];
}
it("original rectangle constructors own independent point/size/corner values", /** Checks copies and literal inclusive corner sizes. @returns Nothing. */ () => {
  const point = new Point(10, 20),
    size = new Size(31, 43),
    rect = new SwRect(point, size),
    copy = new SwRect(rect),
    corners = new SwRect(point, new Point(40, 62));
  expect(values(rect)).toEqual([10, 20, 31, 43]);
  expect(values(copy)).toEqual([10, 20, 31, 43]);
  expect(values(corners)).toEqual([10, 20, 31, 43]);
  point.setX(90);
  size.setHeight(100);
  expect(values(rect)).toEqual([10, 20, 31, 43]);
  rect.Pos().setX(5);
  rect.Height(7);
  expect(values(copy)).toEqual([10, 20, 31, 43]);
  expect(rect.Pos(2, 3)).toBeUndefined();
  expect(rect.SSize(11, 17)).toBeUndefined();
  expect(values(rect)).toEqual([2, 3, 17, 11]);
  rect.Assign(copy);
  expect(values(rect)).toEqual([10, 20, 31, 43]);
  expect(rect.Equals(copy)).toBe(true);
  rect.Clear();
  expect(values(rect)).toEqual([0, 0, 0, 0]);
  expect(rect.Equals(copy)).toBe(false);
});
it("native rectangle edge setters preserve original inclusive far edges and void results", /** Checks independent literal source contracts. @returns Nothing. */ () => {
  const r = new SwRect(10, 20, 31, 43);
  expect([r.Right(), r.Bottom()]).toEqual([40, 62]);
  expect(r.Left(12)).toBeUndefined();
  expect(r.Top(25)).toBeUndefined();
  expect(values(r)).toEqual([12, 25, 29, 38]);
  expect([r.Right(), r.Bottom()]).toEqual([40, 62]);
  expect(r.Right(50)).toBeUndefined();
  expect(r.Bottom(70)).toBeUndefined();
  expect(values(r)).toEqual([12, 25, 39, 46]);
  expect(r.Width(4)).toBeUndefined();
  expect(r.Height(5)).toBeUndefined();
  expect(values(r)).toEqual([12, 25, 4, 5]);
  expect([r.Center().X(), r.Center().Y()]).toEqual([14, 27]);
  r.Pos(new Point(-10, -20));
  r.SSize(new Size(-5, -7));
  expect([r.Center().X(), r.Center().Y()]).toEqual([-12, -23]);
  expect(r.IsEmpty()).toBe(false);
  expect(r.HasArea()).toBe(true);
  expect(new Size(r.SSize()).IsEmpty()).toBe(true);
  r.Height(0);
  expect(r.HasArea()).toBe(false);
  r.Height(7);
  r.Width(0);
  expect(r.HasArea()).toBe(false);
});
it.each<[number, number, boolean]>([
  [10, 20, true],
  [40, 62, true],
  [9, 20, false],
  [10, 19, false],
  [41, 20, false],
  [10, 63, false],
])(
  "original point containment x=%s y=%s result=%s",
  /** Checks each source integer edge predicate. @param x - Native x. @param y - Native y. @param result - Literal source result. @returns Nothing. */ (
    x,
    y,
    result,
  ) => {
    expect(new SwRect(10, 20, 31, 43).Contains(new Point(x, y))).toBe(result);
  },
);
it.each<[number, number, number, number, boolean]>([
  [10, 20, 31, 43, true],
  [11, 21, 1, 1, true],
  [9, 20, 1, 1, false],
  [41, 20, 1, 1, false],
  [10, 20, -1, 1, false],
  [11, 20, 31, 1, false],
  [10, 19, 1, 1, false],
  [10, 63, 1, 1, false],
  [10, 20, 1, -1, false],
  [10, 21, 1, 43, false],
])(
  "original rectangle containment %s/%s/%s/%s result=%s",
  /** Checks each native rectangle containment predicate independently. @param x - Native x. @param y - Native y. @param width - Native width. @param height - Native height. @param result - Literal source result. @returns Nothing. */ (
    x,
    y,
    width,
    height,
    result,
  ) => {
    expect(new SwRect(10, 20, 31, 43).Contains(new SwRect(x, y, width, height))).toBe(result);
  },
);
it("WRITER-006 empty rectangle contains its own original point despite IsEmpty", /** Preserves the suspicious pinned source result without an invented area guard. @returns Nothing. */ () => {
  const rect = new SwRect(7, 11, 0, 0);
  expect(rect.IsEmpty()).toBe(true);
  expect(rect.HasArea()).toBe(false);
  expect([rect.Right(), rect.Bottom()]).toEqual([7, 11]);
  expect(rect.Contains(new Point(7, 11))).toBe(true);
  expect(rect.Contains(new SwRect(7, 11, 0, 0))).toBe(true);
  expect(rect.Contains(new Point(8, 11))).toBe(false);
});
it("native rectangle equality compares all four original values", /** Covers exact equality versus each differing native component. @returns Nothing. */ () => {
  const r = new SwRect(1, 2, 3, 4);
  for (const other of [
    new SwRect(2, 2, 3, 4),
    new SwRect(1, 3, 3, 4),
    new SwRect(1, 2, 4, 4),
    new SwRect(1, 2, 3, 5),
  ])
    expect(r.Equals(other)).toBe(false);
  expect(r.Equals(new SwRect(r))).toBe(true);
});
it.each([0, 1, 2, 3, 4, 5, 6, 7])(
  "original area validity owns all three flags mask=%s",
  /** Checks actual native owner flags and repeated/no-op writes. @param mask - Native validity combination. @returns Nothing. */ (
    mask,
  ) => {
    const a = new SwFrameAreaDefinition();
    expect(a.isFrameAreaDefinitionValid()).toBe(false);
    a.setFrameAreaPositionValid((mask & 1) !== 0);
    a.setFrameAreaSizeValid((mask & 2) !== 0);
    a.setFramePrintAreaValid((mask & 4) !== 0);
    a.setFrameAreaPositionValid((mask & 1) !== 0);
    a.setFrameAreaSizeValid((mask & 2) !== 0);
    a.setFramePrintAreaValid((mask & 4) !== 0);
    expect(a.isFrameAreaDefinitionValid()).toBe(mask === 7);
    expect([
      a.isFrameAreaPositionValid(),
      a.isFrameAreaSizeValid(),
      a.isFramePrintAreaValid(),
    ]).toEqual([(mask & 1) !== 0, (mask & 2) !== 0, (mask & 4) !== 0]);
    a.setFrameAreaPositionValid(false);
    a.setFrameAreaSizeValid(false);
    a.setFramePrintAreaValid(false);
    expect(a.isFrameAreaDefinitionValid()).toBe(false);
  },
);
it("native scoped frame and print writes keep const member identities and independent targets", /** Checks actual copy lifetime and print-relative coordinates. @returns Nothing. */ () => {
  const owner = new SwFrameAreaDefinition(),
    other = new SwFrameAreaDefinition(),
    area = owner.getFrameArea(),
    print = owner.getFramePrintArea(),
    point = area.Pos();
  expect(other.GetFrameId()).toBe((owner.GetFrameId() + 1) >>> 0);
  expect(area).not.toBe(print);
  expect(values(area)).toEqual([0, 0, 0, 0]);
  const access = new SwFrameAreaDefinition.FrameAreaWriteAccess(owner),
    printAccess = new SwFrameAreaDefinition.FramePrintAreaWriteAccess(owner);
  try {
    access.setSwRect(new SwRect(100, 200, 300, 400));
    printAccess.setSwRect(new SwRect(10, 20, 250, 350));
    expect(values(area)).toEqual([0, 0, 0, 0]);
    expect(values(print)).toEqual([0, 0, 0, 0]);
  } finally {
    access.Dispose();
    printAccess.Dispose();
  }
  expect(owner.getFrameArea()).toBe(area);
  expect(owner.getFramePrintArea()).toBe(print);
  expect(area.Pos()).toBe(point);
  expect(values(area)).toEqual([100, 200, 300, 400]);
  expect(values(print)).toEqual([10, 20, 250, 350]);
  expect(values(other.getFrameArea())).toEqual([0, 0, 0, 0]);
  expect(owner.isFrameAreaDefinitionValid()).toBe(false);
  new SwFrameAreaDefinition.FrameAreaWriteAccess(owner).Dispose();
  new SwFrameAreaDefinition.FramePrintAreaWriteAccess(owner).Dispose();
  expect(owner.getFrameArea()).toBe(area);
  expect(values(area)).toEqual([100, 200, 300, 400]);
});
it("scope release writes original values even when a scope exits with an exception", /** Checks source destruction timing without substituting target owners. @returns Nothing. */ () => {
  const owner = new SwFrameAreaDefinition();
  expect(
    /** Writes the actual scope-local value and exits abruptly. @returns Nothing. */ () => {
      const access = new SwFrameAreaDefinition.FrameAreaWriteAccess(owner);
      try {
        access.Pos(new Point(7, 9));
        access.SSize(new Size(11, 13));
        throw Error("scope");
      } finally {
        access.Dispose();
      }
    },
  ).toThrow("scope");
  expect(values(owner.getFrameArea())).toEqual([7, 9, 11, 13]);
});
it("all original root/text/table/row/cell frames compose independent native area owners", /** Checks actual production client identities and delegation rather than geometry stand-ins. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  if (node === undefined) throw Error("Missing body");
  node.SetText("abc");
  const root = new SwRootFrame(/** Borrows the original model. @returns Document. */ () => doc),
    text = new SwTextFrame(node, "body", 0, 3, 0, [{ start: 0, end: 3, height: 300 }], root),
    table = doc.nodes.MakeTableNode("Areas");
  doc.nodes.AppendTableRow(table, 1);
  const tab = new SwTabFrame(table),
    row = tab.Lower() as SwRowFrame,
    cell = row.Lower() as SwCellFrame;
  try {
    const original = [root, text, tab, row, cell];
    expect(row).toBeInstanceOf(SwRowFrame);
    expect(cell).toBeInstanceOf(SwCellFrame);
    expect(
      new Set(
        original.map(
          /** Reads original area identity. @param frame - Actual native frame. @returns Area owner. */ (
            frame,
          ) => frame.areaDefinition,
        ),
      ).size,
    ).toBe(5);
    expect(
      new Set(
        original.map(
          /** Reads native process identity. @param frame - Actual native frame. @returns Native ID. */ (
            frame,
          ) => frame.GetFrameId(),
        ),
      ).size,
    ).toBe(5);
    for (const frame of original) {
      expect(frame.areaDefinition).toBeInstanceOf(SwFrameAreaDefinition);
      expect(frame.getFrameArea()).toBe(frame.areaDefinition.getFrameArea());
      expect(frame.getFramePrintArea()).toBe(frame.areaDefinition.getFramePrintArea());
      expect(frame.GetFrameId()).toBe(frame.areaDefinition.GetFrameId());
      frame.setFrameAreaPositionValid(true);
      frame.setFrameAreaSizeValid(true);
      frame.setFramePrintAreaValid(true);
      expect(frame.isFrameAreaDefinitionValid()).toBe(true);
      const access = new SwFrameAreaDefinition.FrameAreaWriteAccess(frame.areaDefinition);
      try {
        access.setSwRect(new SwRect(10, 20, 30, 40));
      } finally {
        access.Dispose();
      }
      expect(values(frame.getFrameArea())).toEqual([10, 20, 30, 40]);
      expect(frame.isFrameAreaDefinitionValid()).toBe(true);
      frame.InvalidateSize();
      expect(frame.areaDefinition.isFrameAreaSizeValid()).toBe(false);
    }
    expect(text.GetRegisteredIn()).toBe(node);
    expect(tab.GetRegisteredIn()).toBe(table.GetFrameFormat());
    expect(row.GetRegisteredIn()).toBe(table.GetTabLines()[0]?.GetFrameFormat());
    expect(cell.GetRegisteredIn()).toBe(table.GetTabLines()[0]?.GetTabBoxes()[0]?.GetFrameFormat());
  } finally {
    SwFrame.DestroyFrame(text);
    SwFrame.DestroyFrame(tab);
    root.DestroyImpl();
    doc.Dispose();
  }
});
