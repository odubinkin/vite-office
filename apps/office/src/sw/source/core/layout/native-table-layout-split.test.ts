/** @fileoverview Verifies native table layout split and whole-master page movement through original row owners. */
import { expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import type { SwTableFormat } from "../table/swtable";
import { createDefaultWriterPageDescriptor } from "./pagedesc";
import { createSwPageFrames, type SwPageFrame } from "./newfrm";
import { SwTabFrame } from "./tabfrm";
const page = {
  ...createDefaultWriterPageDescriptor("en-GB").GetValue(),
  width: 6000,
  leftMargin: 100,
  rightMargin: 100,
  height: 1000,
  topMargin: 100,
  bottomMargin: 100,
};
/** Creates actual table owners and measured row input. @param format - Authored attributes. @param heights - Device rows. @returns Canonical owners and input. */
function fixture(format: SwTableFormat = {}, heights: readonly number[] = [200, 200, 200]) {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Split", format);
  table.AddColumnWidth(4000);
  for (const [r] of heights.entries())
    doc.nodes
      .AppendTableRow(table, 1)
      .GetTabBoxes()[0]
      ?.GetParagraphs()[0]
      ?.SetText("Row" + r);
  return {
    doc,
    table,
    input: { table, tableName: "Split", afterParagraphIndex: 0, rowHeights: heights },
  };
}
/** Reads independent physical row ranges. @param pages - Actual frames. @returns Literal row ranges. */
function ranges(pages: readonly SwPageFrame[]) {
  return pages.map(
    /** Reads one actual page. @param p - Page. @returns Row ranges. */ (p) =>
      p.tableFrames.map(
        /** Reads original rows. @param f - Table frame. @returns Inclusive original range. */ (
          f,
        ) => [f.firstRow, f.lastRow, f.repeatedHeaderRows ?? 0],
      ),
  );
}
/** Supplies one independent predecessor measurement. @param height - Physical text height. @returns Body input. */
function before(height = 400) {
  return [
    {
      id: "before",
      lines: [{ start: 0, end: 6, height }],
      style: "body-text" as const,
      upperSpacing: 0,
      lowerSpacing: 0,
      contextualSpacing: false,
    },
  ];
}
it.each([{}, { layoutSplit: true }])(
  "native allowed/default table split uses remaining page budget %j",
  /** Checks source true default. @param format - Existing item. @returns Nothing. */ (format) => {
    const f = fixture(format);
    expect(new SwTabFrame(f.table).IsLayoutSplitAllowed()).toBe(true);
    expect(ranges(createSwPageFrames(before(), page, undefined, [f.input]))).toEqual([
      [[0, 1, 0]],
      [[2, 2, 0]],
    ]);
  },
);
it("native disabled split moves the whole table without changing original graph or history", /** Checks full-master movement and inherited source ownership. @returns Nothing. */ () => {
  const f = fixture({ layoutSplit: false }),
    rows = [...f.table.GetTabLines()],
    nodes = f.doc.nodes.entries().length;
  const result = createSwPageFrames(before(), page, undefined, [f.input]);
  expect(ranges(result)).toEqual([[], [[0, 2, 0]]]);
  expect(result[0]?.textFrames[0]?.nodeId).toBe("before");
  expect(result[1]?.tableFrames[0]?.table).toBe(f.table);
  expect(f.table.GetFormat().layoutSplit).toBe(false);
  expect(f.table.GetTabLines()).toEqual(rows);
  expect(f.doc.nodes.entries()).toHaveLength(nodes);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});
it("native disabled split respects exact fit and upper spacing separately from following spacing", /** Checks independent source frame budgets. @returns Nothing. */ () => {
  const f = fixture({ layoutSplit: false, marginBottom: 700 });
  expect(ranges(createSwPageFrames(before(200), page, undefined, [f.input]))).toEqual([
    [[0, 2, 0]],
  ]);
  f.table.SetFormat({ ...f.table.GetFormat(), marginTop: 100 });
  expect(ranges(createSwPageFrames(before(200), page, undefined, [f.input]))).toEqual([
    [],
    [[0, 2, 0]],
  ]);
  const frame = new SwTabFrame(f.table);
  expect(frame.IsLayoutSplitAllowed()).toBe(false);
  f.table.SetFormat({ ...f.table.GetFormat(), layoutSplit: true });
  expect(frame.IsLayoutSplitAllowed()).toBe(true);
});
it.each([false, true])(
  "native oversized no-predecessor escape stays finite occupied=%s",
  /** Checks no artificial blank pages or flag mutation. @param occupied - Existing body. @returns Nothing. */ (
    occupied,
  ) => {
    const f = fixture({ layoutSplit: false }, [500, 500, 500]);
    const result = createSwPageFrames(occupied ? before() : [], page, undefined, [
      { ...f.input, afterParagraphIndex: occupied ? 0 : -1 },
    ]);
    expect(ranges(result)).toEqual(
      occupied
        ? [[], [[0, 0, 0]], [[1, 1, 0]], [[2, 2, 0]]]
        : [[[0, 0, 0]], [[1, 1, 0]], [[2, 2, 0]]],
    );
    expect(f.table.GetFormat().layoutSplit).toBe(false);
  },
);
it("native whole master uses the follow descriptor and preserves original headlines", /** Checks different physical page geometry and no false repeated copy. @returns Nothing. */ () => {
  const f = fixture({ layoutSplit: false, headerRows: 1, repeatHeaderRows: true }),
    short = { ...page, height: 600 },
    large = { ...page, name: "Large", height: 1200, width: 8000 };
  const result = createSwPageFrames(
    before(300),
    {
      initialName: short.name,
      descriptors: [
        { value: short, followName: "Large" },
        { value: large, followName: "Large" },
      ],
    },
    undefined,
    [f.input],
  );
  expect(ranges(result)).toEqual([[], [[0, 2, 0]]]);
  expect(result[1]?.tableFrames[0]?.printArea.width).toBe(7800);
  expect(f.table.GetRowsToRepeat()).toBe(1);
});
it("native empty table never creates a phantom follow page", /** Checks absent row owners. @returns Nothing. */ () => {
  const f = fixture({ layoutSplit: false, marginTop: 900 }, []);
  expect(ranges(createSwPageFrames(before(), page, undefined, [f.input]))).toEqual([[]]);
});
