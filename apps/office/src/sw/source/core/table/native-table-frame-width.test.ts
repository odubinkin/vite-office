/** @fileoverview Verifies native frame-size reactions and document-owned column normalization with literal local fixtures. */
import { afterEach, expect, it, vi } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwTabCols } from "../bastyp/tabcol";
import { SetSwTabCols } from "../docnode/ndtbl";
import { HoriOrientation as H } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { createWriterCollapsedCursorState } from "../undo/undobj";
import type { SwTable } from "./swtable";

afterEach(/** Releases admission spies. @returns Nothing. */ () => vi.restoreAllMocks());
/** Requires a connected fixture owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing frame-width fixture owner");
  return value;
}
/** Builds native independent box widths. @param rows - Literal sizes. @param width - Optional frame width. @returns Original owners. */
function fixture(
  rows: readonly (readonly number[])[] = [
    [1000, 5000],
    [1000, 1000, 4000],
    [4000, 2000],
  ],
  width: number | undefined = 6000,
) {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Frame", { width, horiOrient: H.LEFT });
  for (const value of required(rows[0])) table.AddColumnWidth(value);
  for (const values of rows) {
    const line = doc.nodes.AppendTableRow(table, values.length);
    for (const [index, box] of line.GetTabBoxes().entries()) {
      const size = box.GetFrameSize();
      size.SetWidth(required(values[index]));
      box.SetFrameSize(size);
    }
  }
  const lines = [...table.GetTabLines()],
    boxes = lines.flatMap(
      /** Captures original boxes. @param line - Row. @returns Boxes. */ (line) => [
        ...line.GetTabBoxes(),
      ],
    );
  const start = required(boxes[0]),
    node = required(start.GetParagraphs()[0]);
  doc.GetUndoManager().Clear();
  return { doc, table, lines, boxes, start, node };
}
/** Reads all canonical widths. @param table - Native owner. @returns Independent row sizes. */
function widths(table: SwTable): number[][] {
  return table
    .GetTabLines()
    .map(
      /** Reads one line. @param line - Original row. @returns Sizes. */ (line) =>
        line
          .GetTabBoxes()
          .map(
            /** Reads the native frame item. @param box - Original box. @returns Width. */ (box) =>
              box.GetFrameSize().GetWidth(),
          ),
    );
}
/** Constructs a literal print frame and asks the native model for separators. @param f - Connected fixture. @param width - Print width. @returns Geometry. */
function geometry(f: ReturnType<typeof fixture>, width: number): SwTabCols {
  const result = new SwTabCols();
  result.SetLeft(0);
  result.SetRight(width);
  result.SetRightMax(10000);
  expect(f.table.GetTabCols(result, f.start)).toBe(true);
  return result;
}
it("frame-size replacement scales every independent original line once", /** Checks owned geometry without a shell adapter. @returns Nothing. */ () => {
  const f = fixture();
  f.table.SetFormat({ ...f.table.GetFormat(), width: 1440 });
  expect(widths(f.table)).toEqual([
    [240, 1200],
    [240, 240, 960],
    [960, 480],
  ]);
  expect(f.table.GetTabLines()).toEqual(f.lines);
  expect(
    f.table
      .GetTabLines()
      .flatMap(
        /** Reads original boxes. @param line - Row. @returns Boxes. */ (line) =>
          line.GetTabBoxes(),
      ),
  ).toEqual(f.boxes);
  f.table.SetFormat({ ...f.table.GetFormat(), width: 1440, marginTop: 300 });
  expect(widths(f.table)).toEqual([
    [240, 1200],
    [240, 240, 960],
    [960, 480],
  ]);
  expect(f.table.GetFormat().marginTop).toBe(300);
});
it("frame-size replacement preserves unrepresented widths until both frame sizes exist", /** Checks absent old and new frame attributes. @returns Nothing. */ () => {
  const f = fixture();
  f.table.SetFormat({ horiOrient: H.LEFT });
  expect(widths(f.table)).toEqual([
    [1000, 5000],
    [1000, 1000, 4000],
    [4000, 2000],
  ]);
  f.table.SetFormat({ width: 3000, horiOrient: H.LEFT });
  expect(widths(f.table)).toEqual([
    [1000, 5000],
    [1000, 1000, 4000],
    [4000, 2000],
  ]);
  f.table.SetFormat({ width: 1500, horiOrient: H.LEFT });
  expect(widths(f.table)).toEqual([
    [500, 2500],
    [500, 500, 2000],
    [2000, 1000],
  ]);
});
it.each([
  [
    7,
    10,
    [
      [1, 2, 4],
      [3, 4],
    ],
    [
      [1, 3, 6],
      [4, 6],
    ],
  ],
  [
    0,
    3,
    [
      [1, 2, 4],
      [3, 4],
    ],
    [
      [3, 6, 12],
      [9, 12],
    ],
  ],
] as const)(
  "frame notification retains cumulative integer arithmetic old%s new%s",
  /** Checks literal cumulative rounding and native release zero-divisor fallback. @param oldWidth - Old frame width. @param nextWidth - New frame width. @param rows - Initial sizes. @param expected - Literal sizes. @returns Nothing. */ (
    oldWidth,
    nextWidth,
    rows,
    expected,
  ) => {
    const f = fixture(rows, oldWidth);
    f.table.SetFormat({ ...f.table.GetFormat(), width: nextWidth });
    expect(widths(f.table)).toEqual(expected);
  },
);
it("document column normalization delegates one frame reaction and retains single-line geometry", /** Checks the former double-scaling path with independent rows. @returns Nothing. */ () => {
  const f = fixture(),
    previous = geometry(f, 3000),
    next = new SwTabCols(previous);
  next.GetEntry(0).nPos = 750;
  const adjust = vi.spyOn(f.table, "AdjustWidths");
  expect(SetSwTabCols(f.doc, f.table, next, previous, f.start, true)).toBe(true);
  expect(adjust).toHaveBeenCalledExactlyOnceWith(6000, 3000);
  expect(widths(f.table)).toEqual([
    [750, 2250],
    [500, 500, 2000],
    [2000, 1000],
  ]);
  expect(f.table.GetFormat().width).toBe(3000);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  expect(f.table.GetTabLines()).toEqual(f.lines);
});
it("implicit frame normalization sums canonical boxes and accepts an explicit cursor", /** Checks the unrepresented frame fallback and unchanged-width branch. @returns Nothing. */ () => {
  const f = fixture([[1000, 2000]]);
  f.table.SetFormat({ horiOrient: H.LEFT });
  const previous = geometry(f, 3000),
    next = new SwTabCols(previous);
  next.GetEntry(0).nPos = 1200;
  const cursor = createWriterCollapsedCursorState(f.node, 0, f.node.GetCharacterItemsAt(0));
  expect(SetSwTabCols(f.doc, f.table, next, previous, f.start, false, cursor)).toBe(true);
  expect(widths(f.table)).toEqual([[1200, 1800]]);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
});
it("document normalization rejects foreign or detached paragraph owners before mutation", /** Checks admission without reading any external fixture. @returns Nothing. */ () => {
  const f = fixture(),
    foreign = fixture(),
    previous = geometry(f, 6000),
    next = new SwTabCols(previous);
  expect(SetSwTabCols(f.doc, foreign.table, next, previous, foreign.start, false)).toBe(false);
  expect(SetSwTabCols(f.doc, f.table, next, previous, foreign.start, false)).toBe(false);
  const paragraphs = vi.spyOn(f.start, "GetParagraphs");
  paragraphs.mockReturnValue([]);
  expect(SetSwTabCols(f.doc, f.table, next, previous, f.start, false)).toBe(false);
  paragraphs.mockReturnValue([foreign.node]);
  expect(SetSwTabCols(f.doc, f.table, next, previous, f.start, false)).toBe(false);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  expect(widths(f.table)).toEqual([
    [1000, 5000],
    [1000, 1000, 4000],
    [4000, 2000],
  ]);
});
