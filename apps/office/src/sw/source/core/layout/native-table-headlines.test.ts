/** @fileoverview Checks native original-row repeated headline ownership and measured follow-page budgets. */
import { describe, expect, it } from "vitest";
import { createWriterDocument } from "../doc/doc";
import { createDefaultWriterPageDescriptor } from "./pagedesc";
import { createSwPageFrames, SwRootFrame, type SwPageFrame } from "./newfrm";
import { SwLineNumberInfo } from "../../../inc/lineinfo";
import type { SwTableFormat } from "../table/swtable";

const page = {
  ...createDefaultWriterPageDescriptor("en-GB").GetValue(),
  height: 1000,
  topMargin: 100,
  bottomMargin: 100,
};
/** Creates actual native rows with independent device heights. @param heights - Measured heights. @param format - Authored table values. @returns Native owners and formatter input. */
function fixture(
  heights: readonly number[],
  format: SwTableFormat = { headerRows: 1, repeatHeaderRows: true },
) {
  const doc = createWriterDocument(),
    table = doc.nodes.MakeTableNode("Headlines", format);
  table.AddColumnWidth(4000);
  for (let row = 0; row < heights.length; row++)
    doc.nodes
      .AppendTableRow(table, 1)
      .GetTabBoxes()[0]
      ?.GetParagraphs()[0]
      ?.SetText("Row" + row);
  return {
    doc,
    table,
    input: { table, tableName: "Headlines", afterParagraphIndex: -1, rowHeights: heights },
  };
}
/** Reads literal page row ranges without deriving expected flow. @param pages - Actual pages. @returns Ranges. */
function ranges(pages: readonly SwPageFrame[]) {
  return pages.map(
    /** Reads a physical table fragment. @param current - Page. @returns Literal source range and repeated count. */
    (current) =>
      current.tableFrames.map(
        /** Reads a fragment. @param frame - Actual frame. @returns Coordinates. */
        (frame) => [frame.firstRow, frame.lastRow, frame.repeatedHeaderRows ?? 0],
      ),
  );
}
describe("native repeated table headlines", /** Registers source-shaped page ownership cases. @returns Nothing. */ () => {
  it("moves an all-headline group from occupied content without requiring a body row", /** Checks native complete header ownership and finite flow. @returns Nothing. */ () => {
    const f = fixture([200, 200], { headerRows: 2, repeatHeaderRows: true });
    const result = createSwPageFrames(
      [
        {
          id: "before",
          lines: [{ start: 0, end: 1, height: 500 }],
          style: "body-text",
          upperSpacing: 0,
          lowerSpacing: 0,
          contextualSpacing: false,
        },
      ],
      page,
      undefined,
      [{ ...f.input, afterParagraphIndex: 0 }],
    );
    expect(ranges(result)).toEqual([[], [[0, 1, 0]]]);
    expect(f.table.GetRowsToRepeat()).toBe(2);
  });
  it("moves an ordinary oversized first row without inventing repeated header space", /** Checks first-row movement before its own frame exists. @returns Nothing. */ () => {
    const f = fixture([900, 300], {});
    const result = createSwPageFrames(
      [
        {
          id: "before",
          lines: [{ start: 0, end: 1, height: 300 }],
          style: "body-text",
          upperSpacing: 0,
          lowerSpacing: 0,
          contextualSpacing: false,
        },
      ],
      page,
      undefined,
      [{ ...f.input, afterParagraphIndex: 0 }],
    );
    expect(ranges(result)).toEqual([[], [[0, 0, 0]], [[1, 1, 0]]]);
    expect(f.table.GetRowsToRepeat()).toBe(0);
  });
  it.each<SwTableFormat>([
    {},
    { headerRows: 2 },
    { headerRows: 2, repeatHeaderRows: false },
    { headerRows: 0, repeatHeaderRows: true },
  ])(
    "keeps native zero/default/disabled repeat count %j",
    /** Checks independent authored flags. @param format - Format. @returns Nothing. */ (
      format,
    ) => {
      const f = fixture([200, 300, 300], format);
      expect(f.table.GetRowsToRepeat()).toBe(0);
      expect(ranges(createSwPageFrames([], page, undefined, [f.input]))).toEqual([[[0, 2, 0]]]);
    },
  );
  it("caps native unsigned count by actual rows while preserving the stored count", /** Checks actual typed count and format ownership. @returns Nothing. */ () => {
    const f = fixture([200, 300, 300]);
    expect(f.table.GetRowsToRepeat()).toBe(1);
    f.table.SetRowsToRepeat(65538);
    expect(f.table.GetRowsToRepeat()).toBe(2);
    expect(f.table.GetFormat().headerRows).toBe(2);
    f.table.SetRowsToRepeat(65535);
    expect(f.table.GetRowsToRepeat()).toBe(3);
    expect(f.table.GetFormat().headerRows).toBe(65535);
    f.table.SetRowsToRepeat(0);
    expect(f.table.GetRowsToRepeat()).toBe(0);
    expect(f.table.GetFormat().repeatHeaderRows).toBe(false);
    const empty = fixture([], { repeatHeaderRows: true });
    expect(empty.table.GetRowsToRepeat()).toBe(0);
  });
  it("reserves measured original headline height on each follow and for subsequent text", /** Checks fixed independent page arithmetic and source owners. @returns Nothing. */ () => {
    const f = fixture([200, 300, 300, 300, 300]),
      rows = [...f.table.GetTabLines()],
      nodes = f.doc.nodes.entries().length;
    const result = createSwPageFrames(
      [
        {
          id: "after",
          lines: [{ start: 0, end: 5, height: 100 }],
          style: "body-text",
          upperSpacing: 0,
          lowerSpacing: 0,
          contextualSpacing: false,
        },
      ],
      page,
      undefined,
      [f.input],
    );
    expect(ranges(result)).toEqual([[[0, 2, 0]], [[3, 4, 1]], []]);
    expect(result[2]?.textFrames[0]?.nodeId).toBe("after");
    expect(f.table.GetTabLines()).toEqual(rows);
    expect(f.doc.nodes.entries()).toHaveLength(nodes);
    expect(result[1]?.tableFrames[0]?.table).toBe(f.table);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  });
  it("moves the headline group and first body row together off an occupied page", /** Checks native no header-only master behavior. @returns Nothing. */ () => {
    const f = fixture([200, 300, 300, 300]);
    const result = createSwPageFrames(
      [
        {
          id: "before",
          lines: [{ start: 0, end: 6, height: 500 }],
          style: "body-text",
          upperSpacing: 0,
          lowerSpacing: 0,
          contextualSpacing: false,
        },
      ],
      page,
      undefined,
      [{ ...f.input, afterParagraphIndex: 0 }],
    );
    expect(ranges(result)).toEqual([[], [[0, 2, 0]], [[3, 3, 1]]]);
    expect(result[0]?.textFrames[0]?.nodeId).toBe("before");
  });
  it("keeps the first nonsplittable body row with headlines even when oversized", /** Checks finite source first-body overflow policy. @returns Nothing. */ () => {
    const f = fixture([200, 900, 300]);
    expect(ranges(createSwPageFrames([], page, undefined, [f.input]))).toEqual([
      [[0, 1, 0]],
      [[2, 2, 1]],
    ]);
    expect(f.table.GetRowsToRepeat()).toBe(1);
  });
  it("disables ordinary oversized headline repetition in the native model", /** Checks native loop prevention before whole-row flow. @returns Nothing. */ () => {
    const f = fixture([600, 400, 300], { headerRows: 2, repeatHeaderRows: true });
    expect(ranges(createSwPageFrames([], page, undefined, [f.input]))).toEqual([
      [[0, 0, 0]],
      [[1, 2, 0]],
    ]);
    expect(f.table.GetRowsToRepeat()).toBe(0);
    expect(f.table.GetFormat().headerRows).toBe(0);
  });
  it("repeats all original headline rows and handles an all-headline table without a false follow", /** Checks actual two-row group and absent body. @returns Nothing. */ () => {
    const f = fixture([100, 100, 300, 300, 300], { headerRows: 2, repeatHeaderRows: true });
    expect(ranges(createSwPageFrames([], page, undefined, [f.input]))).toEqual([
      [[0, 3, 0]],
      [[4, 4, 2]],
    ]);
    const all = fixture([200, 200], { headerRows: 9, repeatHeaderRows: true });
    expect(ranges(createSwPageFrames([], page, undefined, [all.input]))).toEqual([[[0, 1, 0]]]);
  });
  it("disables oversized headlines when the follow descriptor is shorter", /** Checks source no-loop fallback on distinct page styles. @returns Nothing. */ () => {
    const f = fixture([500, 300, 300]),
      short = { ...page, name: "Short", height: 600 };
    expect(
      ranges(
        createSwPageFrames(
          [],
          {
            initialName: page.name,
            descriptors: [
              { value: page, followName: "Short" },
              { value: short, followName: "Short" },
            ],
          },
          undefined,
          [f.input],
        ),
      ),
    ).toEqual([[[0, 1, 0]], [[2, 2, 0]]]);
    expect(f.table.GetRowsToRepeat()).toBe(0);
    const moved = fixture([500, 300, 300]);
    const result = createSwPageFrames(
      [
        {
          id: "before",
          lines: [{ start: 0, end: 1, height: 500 }],
          style: "body-text",
          upperSpacing: 0,
          lowerSpacing: 0,
          contextualSpacing: false,
        },
      ],
      {
        initialName: page.name,
        descriptors: [
          { value: page, followName: "Short" },
          { value: short, followName: "Short" },
        ],
      },
      undefined,
      [{ ...moved.input, afterParagraphIndex: 0 }],
    );
    expect(ranges(result)).toEqual([[], [[0, 0, 0]], [[1, 1, 0]], [[2, 2, 0]]]);
    expect(moved.table.GetRowsToRepeat()).toBe(0);
  });
  it("rebuilds repeated frame values after native count changes while retaining unchanged frames", /** Checks existing root invalidation and frame identity. @returns Nothing. */ () => {
    const f = fixture([300, 300, 300, 300]),
      root = new SwRootFrame(
        /** Resolves the same actual document. @returns Native doc. */ () => f.doc,
      ),
      measurements = [{ tableName: "Headlines", rowHeights: [300, 300, 300, 300] }],
      info = new SwLineNumberInfo().QueryValue();
    const text = [{ id: "body", lines: [{ start: 0, end: 0, height: 0 }] }];
    const original = root.Format(text, page, undefined, info, 0, measurements);
    expect(ranges(original.pages)).toEqual([[[0, 1, 0]], [[2, 2, 1]], [[3, 3, 1]]]);
    expect(root.Format(text, page, undefined, info, 0, measurements)).toBe(original);
    f.table.SetRowsToRepeat(0);
    root.Invalidate();
    const changed = root.Format(text, page, undefined, info, 0, measurements);
    expect(ranges(changed.pages)).toEqual([[[0, 1, 0]], [[2, 3, 0]]]);
    expect(changed.pages[0]).toBe(original.pages[0]);
    expect(changed.pages[1]).not.toBe(original.pages[1]);
  });
});
