/** @fileoverview Native HTML table second-pass allocation and actual format publication. */
import { afterEach, assert, expect, it, vi } from "vitest";
import { SvxAdjust } from "../../../../editeng/inc/svxenum";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { SwNodeRange } from "../../../inc/ndindex";
import { SwStartNodeType } from "../../../inc/ndtyp";
import { SwFormatContent } from "../../../inc/fmtcntnt";
import { SwFormatHoriOrient } from "../../../inc/fmtornt";
import { SwHTMLTableLayout } from "./htmltbl";
import { SwHTMLTableLayoutColumn } from "./htmltbl.column";
import { SwHTMLTableLayoutCell, SwHTMLTableLayoutCnts } from "./htmltbl.values";
import { SwDoc } from "./doc";
import { SwTableBox, SwTableLine, type SwTable } from "../table/swtable";

/** Input tuple for one populated native column after the first pass. */
type ColumnMetrics = readonly [min: number, max: number, widthOption?: number];

/** Supplies the original numeric phase-one contract to the actual second-pass owner. */
class WidthFixture extends SwHTMLTableLayout {
  /** Constructs original grid and measured columns. @param columns - Source first-pass metrics. @param table - Actual top table or null for nested. @param width - Authored width. @param percent - Percent width flag. @param adjustment - Source alignment. @param margins - Actual left/right margins. @returns Layout. */
  constructor(
    columns: readonly ColumnMetrics[],
    table: SwTable | null,
    width = 0,
    percent = false,
    adjustment = SvxAdjust.Left,
    margins: readonly [number, number] = [0, 0],
  ) {
    super(
      table,
      1,
      columns.length,
      false,
      false,
      width,
      percent,
      0,
      0,
      0,
      adjustment,
      margins[0],
      margins[1],
      0,
      0,
      0,
    );
    for (const [index, [min, max, option]] of columns.entries()) {
      const column = new SwHTMLTableLayoutColumn(option ?? 0, option !== undefined, false);
      column.SetMinMax(min, max);
      this.SetColumn(column, index);
      this.m_nMin += min;
      this.m_nMax += max;
      this.SetCell(new SwHTMLTableLayoutCell(null, 1, 1, 0, false, false), 0, index);
    }
  }
  /** Borrows real column results. @returns Per-column absolute and relative width. */
  widths(): readonly (readonly [number, number])[] {
    return this.m_aColumns.map(
      /** Reads real column fields. @param column - Populated original column. @returns Width pair. */ (
        column,
      ) => {
        assert(column);
        return [column.GetAbsColWidth(), column.GetRelColWidth()];
      },
    );
  }
  /** Borrows phase-two results from the original fields. @returns Table width, both fillers, and remembered availability. */
  values(): readonly number[] {
    return [
      this.m_nRelTabWidth,
      this.m_nRelLeftFill,
      this.m_nRelRightFill,
      this.m_nLastResizeAbsAvail,
    ];
  }
}

const documents: SwDoc[] = [];
afterEach(
  /** Releases real document and table owners. @returns Nothing. */ () => {
    for (const doc of documents.splice(0)) doc.Dispose();
  },
);

/** Creates a real Writer table and its actual node-owned cells. @param columns - Native box count. @returns Actual table. */
function topTable(columns = 1): SwTable {
  const doc = new SwDoc();
  documents.push(doc);
  const table = doc.GetNodes().MakeTableNode("HTML");
  doc.GetNodes().AppendTableRow(table, columns);
  return table;
}

it("preserves the natural maximum and the original interpolation toward minimum", /** Exercises native maximum and intermediate width branches. @returns Nothing. */ () => {
  const layout = new WidthFixture(
    [
      [100, 300],
      [100, 500],
    ],
    topTable(2),
  );
  layout.AutoLayoutPass2(1200, 0, 0, 0, 0);
  expect(layout.widths()).toEqual([
    [300, 300],
    [500, 500],
  ]);
  expect(layout.values()).toEqual([800, 0, 0, 1200]);
  layout.AutoLayoutPass2(500, 0, 0, 0, 0);
  expect(layout.widths()).toEqual([
    [200, 200],
    [300, 300],
  ]);
});

it("leaves fixed maxima intact when expanding only columns with relative options", /** Mixed native options reserve fixed width and give the remainder to proportional columns. @returns Nothing. */ () => {
  const layout = new WidthFixture(
    [
      [50, 100],
      [100, 200, 40],
      [120, 300, 60],
    ],
    topTable(3),
    900,
  );
  layout.AutoLayoutPass2(1000, 0, 0, 0, 0);
  expect(layout.widths()).toEqual([
    [100, 100],
    [320, 320],
    [480, 480],
  ]);
});

it("retains the source maximum-branch rounding remainder", /** An all-fixed maximum distribution truncates each column independently. @returns Nothing. */ () => {
  const layout = new WidthFixture(
    [
      [70, 100],
      [70, 100],
      [70, 100],
    ],
    topTable(3),
    302,
  );
  layout.AutoLayoutPass2(1000, 0, 0, 0, 0);
  expect(layout.widths()).toEqual([
    [100, 100],
    [100, 100],
    [100, 100],
  ]);
  expect(layout.values()).toEqual([302, 0, 0, 1000]);
});

it("uses proportional shrink and native content minima under nested width constraints", /** Both constrained-minimum branches operate on the original columns. @returns Nothing. */ () => {
  const layout = new WidthFixture(
    [
      [100, 160],
      [300, 410],
    ],
    null,
  );
  layout.AutoLayoutPass2(40, 200, 0, 0, 0);
  expect(layout.widths()).toEqual([
    [10, 50],
    [30, 150],
  ]);
  layout.AutoLayoutPass2(100, 500, 0, 0, 0);
  expect(layout.widths()).toEqual([
    [34, 121],
    [66, 379],
  ]);
});

it("preserves original absolute width cap and native division-by-zero guard", /** Uses the original max table width and rejects a populated zero-maximum grid. @returns Nothing. */ () => {
  const capped = new WidthFixture(
    [
      [40000, 50000],
      [40000, 60000],
    ],
    topTable(2),
  );
  capped.AutoLayoutPass2(10000, 0, 0, 0, 0);
  expect(capped.widths()).toEqual([
    [31767, 31767],
    [31767, 31767],
  ]);
  const empty = new WidthFixture([[0, 0]], topTable());
  expect(
    /** Calls the real width pass. @returns Nothing. */ () =>
      empty.AutoLayoutPass2(100, 0, 0, 0, 0),
  ).toThrow("division by zero");
});

it("keeps centered nested fillers on the initial pass and absorbs them on width publication", /** The original width counter switches later passes from filler owners to outer columns. @returns Nothing. */ () => {
  const layout = new WidthFixture(
    [
      [80, 120],
      [100, 200],
    ],
    null,
    400,
    false,
    SvxAdjust.Center,
  );
  layout.AutoLayoutPass2(1000, 500, 10, 20, 30);
  expect(layout.values()).toEqual([200, 147, 153, 1000]);
  layout.SetWidths(true, 1000, 500, 10, 20, 30);
  expect(layout.values()).toEqual([200, 0, 0, 1000]);
  expect(layout.widths()).toEqual([
    [445, 222],
    [555, 278],
  ]);
  expect(layout.GetInhCellSpace(0, 1)).toBe(25);
  expect(layout.GetInhCellSpace(1, 1)).toBe(35);
});

it("publishes one shared span and preserves percent width only above the native minimum", /** Actual pooled box/table formats observe source width allocation and shared-content visitation. @returns Nothing. */ () => {
  const table = topTable();
  const format = table.GetFrameFormat();
  format.SetFormatAttr(new SwFormatHoriOrient(0, HoriOrientation.LEFT));
  const box = table.GetTabLines()[0]?.GetTabBoxes()[0];
  assert(box);
  const layout = new WidthFixture(
    [
      [100, 250],
      [100, 350],
    ],
    table,
    50,
    true,
    SvxAdjust.Left,
    [20, 20],
  );
  const contents = new SwHTMLTableLayoutCnts(box.GetSttNd(), null, false, null);
  contents.SetTableBox(box);
  layout.SetCell(new SwHTMLTableLayoutCell(contents, 1, 2, 0, false, false), 0, 0);
  layout.SetCell(new SwHTMLTableLayoutCell(contents, 1, 1, 0, false, false), 0, 1);
  const setBox = vi.spyOn(box.GetFrameFormat(), "SetFormatAttr");
  layout.SetWidths(true, 440);
  expect(setBox).toHaveBeenCalledTimes(1);
  expect(box.GetFrameSize().GetWidth()).toBe(200);
  expect(format.GetFrameSize().GetWidth()).toBe(200);
  expect(format.GetFrameSize().GetWidthPercent()).toBe(0);
  layout.SetWidths(true, 640);
  expect(setBox).toHaveBeenCalledTimes(2);
  expect(box.GetFrameSize().GetWidth()).toBe(32767);
  expect(format.GetFrameSize().GetWidthPercent()).toBe(50);
  format.SetFormatAttr(new SwFormatHoriOrient(0, HoriOrientation.FULL));
  layout.SetWidths();
  expect(format.GetFrameSize().GetWidthPercent()).toBe(0);
});

it("retains the 64-bit integral delta when nested relative width falls below the absolute baseline", /** The original sal_uLong subtraction is unsigned. @returns Nothing. */ () => {
  const layout = new WidthFixture(
    [
      [100, 160],
      [300, 410],
    ],
    null,
  );
  layout.AutoLayoutPass2(100, 10, 0, 0, 0);
  expect(layout.widths()).toEqual([
    [34, 62959],
    [66, 2587],
  ]);
});

it("recurses through an actual inner layout and updates its real anonymous container box", /** Uses a real nested core box and the native contents/layout association. @returns Nothing. */ () => {
  const table = topTable();
  const row = table.GetTabLines()[0];
  assert(row);
  const contentBox = row.GetTabBoxes()[0];
  assert(contentBox);
  row.RemoveBox(contentBox);
  const doc = table.GetTableNode().GetDoc(),
    container = new SwTableBox(doc.MakeTableBoxFormat(), 1, row),
    childRow = new SwTableLine(doc.MakeTableLineFormat(), 1, container);
  container.AddLine(childRow);
  childRow.AddBox(contentBox);
  row.AddBox(container);

  const inner = new WidthFixture([[120, 300]], null),
    outer = new WidthFixture([[200, 700]], table),
    content = new SwHTMLTableLayoutCnts(contentBox.GetSttNd(), null, false, null);
  content.SetTableBox(contentBox);
  inner.SetCell(new SwHTMLTableLayoutCell(content, 1, 1, 0, false, false), 0, 0);
  outer.SetCell(
    new SwHTMLTableLayoutCell(
      new SwHTMLTableLayoutCnts(null, inner, false, null),
      1,
      1,
      0,
      false,
      false,
    ),
    0,
    0,
  );
  outer.SetWidths(true, 700);
  expect(inner.values()).toEqual([300, 0, 0, 700]);
  expect(contentBox.GetFrameSize().GetWidth()).toBe(700);
  expect(container.GetFrameSize().GetWidth()).toBe(700);
  expect(table.GetFrameFormat().GetFrameSize().GetWidth()).toBe(700);
});

it("resizes an actual enclosing fly using the minimum when the table has percent width", /** Resolves the original fly via the actual enclosed table and borrowed content index. @returns Nothing. */ () => {
  const table = topTable(),
    node = table.GetTableNode(),
    doc = node.GetDoc(),
    nodes = doc.GetNodes(),
    range = new SwNodeRange(node, nodes.GetEndOfContent());
  nodes.SectionDown(range, SwStartNodeType.SwFlyStartNode);
  const section = range.aStart.GetNode();
  range.Dispose();
  assert(section.IsStartNode());
  const fly = doc.MakeFlyFrameFormat("HTML frame", doc.GetDfltFrameFormat()),
    content = new SwFormatContent(section);
  try {
    fly.SetFormatAttr(content);
  } finally {
    content.Dispose();
  }
  expect(node.GetFlyFormat()).toBe(fly);

  const layout = new WidthFixture([[150, 400]], table, 50, true);
  layout.SetMayBeInFlyFrame(true);
  layout.SetWidths(true, 800);
  expect(fly.GetFrameSize().GetWidth()).toBe(150);
  expect(fly.GetFrameSize().GetWidthPercent()).toBe(50);
  expect(fly.GetFrameSize().GetHeight()).toBe(23);
});
