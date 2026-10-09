/** @fileoverview Verifies native overlap splitting and tie arbitration without upstream runtime access. */
import { expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SvxBorderLine } from "../../../../editeng/source/items/borderline";
import { Style } from "../../../../svx/source/dialog/framelink";
import { OverlapType, SwLineEntry, SwTabFramePainter } from "./paintfrm";
/** Creates an independently owned source entry. @param start - Interval start. @param end - Interval end. @param color - Original color. @param width - Native width. @returns Entry. */
function entry(start: number, end: number, color = 1, width = 20): SwLineEntry {
  return new SwLineEntry(4, start, end, false, new Style(new SvxBorderLine(color, width)));
}
it("paints all four outer boundaries of an original single cell", /** Checks the constructor's original row and cell traversal through the paint boundary. @returns Nothing. */ () => {
  const doc = new SwDoc();
  const table = doc.nodes.MakeTableNode("Single cell", { width: 3000 });
  table.AddColumnWidth(3000);
  doc.nodes.AppendTableRow(table, 1);
  const lines: (boolean | number)[][] = [];
  new SwTabFramePainter(table).PaintLines(
    /** Captures original grid coordinates and outer-boundary flags. @param line - Painted border. @param horizontal - Border family. @returns Nothing. */ (
      line,
      horizontal,
    ) => {
      lines.push([horizontal, line.mnKey, line.mnStartPos, line.mnEndPos, line.mbOuter]);
    },
  );
  expect(lines).toEqual([
    [false, 0, 0, 1, true],
    [false, 1, 0, 1, true],
    [true, 0, 0, 1, true],
    [true, 1, 0, 1, true],
  ]);
});
it("omits a zero-length first border and retains a later visible interval", /** Checks empty border admission independently of populated table geometry. @returns Nothing. */ () => {
  const painter = new SwTabFramePainter(new SwDoc().nodes.MakeTableNode("Empty borders"));
  painter.Insert(entry(3, 3), true);
  const lines: number[][] = [];
  painter.PaintLines(
    /** Captures visible intervals. @param line - Painted border. @returns Nothing. */ (line) => {
      lines.push([line.mnStartPos, line.mnEndPos]);
    },
  );
  expect(lines).toEqual([]);
  painter.Insert(entry(3, 6), true);
  painter.PaintLines(
    /** Captures the later visible border. @param line - Painted border. @returns Nothing. */ (
      line,
    ) => {
      lines.push([line.mnStartPos, line.mnEndPos]);
    },
  );
  expect(lines).toEqual([[3, 6]]);
});
it("native line overlap classification matches every source illustrated arrangement and touching ends", /** Checks source enum cases directly. @returns Nothing. */ () => {
  const cases = [
    [0, 10, 5, 15, 1],
    [0, 10, 0, 15, 1],
    [5, 10, 0, 15, 1],
    [0, 15, 5, 10, 2],
    [0, 10, 5, 8, 2],
    [0, 10, 0, 10, 2],
    [0, 15, 0, 10, 2],
    [5, 15, 0, 15, 3],
    [5, 10, 0, 10, 3],
    [0, 10, 10, 20, 0],
    [10, 20, 0, 10, 0],
  ];
  for (const [a, b, c, d, expected] of cases)
    expect(entry(a as number, b as number).Overlaps(entry(c as number, d as number))).toBe(
      expected,
    );
  expect(OverlapType.OVERLAP3).toBe(3);
});
it.each([false, true])(
  "native line splitting preserves ordered coverage and new-style ties horizontal=%s",
  /** Checks all native split/restart/final-insertion paths. @param horizontal - Native family. @returns Nothing. */ (
    horizontal,
  ) => {
    const table = new SwDoc().nodes.MakeTableNode("Intervals"),
      painter = new SwTabFramePainter(table);
    painter.Insert(entry(0, 10), horizontal);
    painter.Insert(entry(15, 20), horizontal);
    painter.Insert(entry(5, 18, 2, 40), horizontal);
    painter.Insert(entry(2, 7, 3, 10), horizontal);
    painter.Insert(entry(10, 15, 4, 40), horizontal);
    painter.Insert(entry(-2, 2, 5, 20), horizontal);
    painter.Insert(entry(30, 30, 9), horizontal);
    const lines: number[][] = [];
    painter.PaintLines(
      /** Observes independent native output. @param line - Resolved interval. @param family - Native family. @returns Nothing. */
      (line, family) => {
        expect(family).toBe(horizontal);
        lines.push([line.mnStartPos, line.mnEndPos, line.maAttribute.GetColorPrim()]);
        line.mnEndPos = -100;
        line.maAttribute.SetWordTableCell(true);
      },
    );
    expect(lines).toEqual([
      [-2, 0, 5],
      [0, 2, 5],
      [2, 5, 1],
      [5, 7, 2],
      [7, 10, 2],
      [10, 15, 4],
      [15, 18, 2],
      [18, 20, 1],
    ]);
    const second: number[][] = [];
    painter.PaintLines(
      /** Re-observes retained native state after prior device mutation. @param line - Original interval copy. @returns Nothing. */
      (line) => second.push([line.mnStartPos, line.mnEndPos, line.maAttribute.GetColorPrim()]),
    );
    expect(second).toEqual(lines);
  },
);
