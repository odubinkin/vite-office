/** @fileoverview Verifies native horizontal table print geometry through actual table and root owners. */
import { describe, expect, it } from "vitest";
import { createWriterDocument } from "../doc/doc";
import type { SwTableFormat } from "../table/swtable";
import { SwTabFrame } from "./tabfrm";
import { createSwPageFrames, SwRootFrame } from "./newfrm";
import { createDefaultWriterPageDescriptor } from "./pagedesc";
import { SwLineNumberInfo } from "../../../inc/lineinfo";

/** Creates a canonical two-column table. @param format - Authored geometry. @returns Native owners. */
function fixture(format: SwTableFormat) {
  const doc = createWriterDocument(),
    table = doc.nodes.MakeTableNode("Geometry", format);
  table.AddColumnWidth(1000);
  table.AddColumnWidth(3000);
  for (let row = 0; row < 5; row++) doc.nodes.AppendTableRow(table, 2);
  return { doc, table };
}

describe("native table print area", /** Registers independent native expected geometry. @returns Nothing. */ () => {
  const cases: readonly [string, SwTableFormat, { left: number; right: number; width: number }][] =
    [
      [
        "left wished width and authored left margin",
        { align: "left", width: 3000, marginLeft: 400, marginRight: 700 },
        { left: 400, right: 4600, width: 3000 },
      ],
      [
        "left omitted margin",
        { align: "left", width: 3000 },
        { left: 0, right: 5000, width: 3000 },
      ],
      [
        "center ignores authored LR margins",
        { align: "center", width: 3000, marginLeft: 400, marginRight: 700 },
        { left: 2500, right: 2500, width: 3000 },
      ],
      [
        "right ignores authored LR margins",
        { align: "right", width: 3000, marginLeft: 400, marginRight: 700 },
        { left: 5000, right: 0, width: 3000 },
      ],
      [
        "margins ignores wished width",
        { align: "margins", width: 3000, marginLeft: 400, marginRight: 700 },
        { left: 400, right: 700, width: 6900 },
      ],
      [
        "margins omitted LR fills upper",
        { align: "margins", width: 3000 },
        { left: 0, right: 0, width: 8000 },
      ],
      [
        "default FULL ignores wished width and LR",
        { width: 3000, marginLeft: 400, marginRight: 700 },
        { left: 0, right: 0, width: 8000 },
      ],
      [
        "left without size uses LR",
        { align: "left", marginLeft: 400, marginRight: 700 },
        { left: 400, right: 700, width: 6900 },
      ],
      [
        "center without size becomes FULL",
        { align: "center", marginLeft: 400 },
        { left: 0, right: 0, width: 8000 },
      ],
      ["right without size becomes FULL", { align: "right" }, { left: 0, right: 0, width: 8000 }],
      ["bare default FULL", {}, { left: 0, right: 0, width: 8000 }],
      [
        "negative margins remain native",
        { align: "margins", marginLeft: -100, marginRight: 200 },
        { left: -100, right: 200, width: 7900 },
      ],
      [
        "negative centered overflow",
        { align: "center", width: 10000 },
        { left: -1000, right: -1000, width: 10000 },
      ],
      [
        "negative right overflow",
        { align: "right", width: 10000 },
        { left: -2000, right: 0, width: 10000 },
      ],
      ["native column minimum", { align: "left", width: 1 }, { left: 0, right: 7954, width: 46 }],
      [
        "native maximum width",
        { align: "left", width: 70000 },
        { left: 0, right: -57535, width: 65535 },
      ],
      [
        "excessive LR resets print margins",
        { align: "margins", marginLeft: 7900, marginRight: 99 },
        { left: 0, right: 0, width: 8000 },
      ],
    ];
  for (const [name, format, expected] of cases)
    it(
      name,
      /** Checks literal twip bounds and model identity. @returns Nothing. */ () => {
        const f = fixture(format),
          before = f.table.GetFormat();
        expect(new SwTabFrame(f.table).Format(8000)).toEqual(expected);
        expect(f.table.GetFormat()).toEqual(before);
        expect(f.table.GetColumnWidths()).toEqual([1000, 3000]);
      },
    );

  it("uses native integer center spacing for odd free width", /** Checks truncation leaves the print area remainder. @returns Nothing. */ () => {
    expect(new SwTabFrame(fixture({ align: "center", width: 3000 }).table).Format(8001)).toEqual({
      left: 2500,
      right: 2500,
      width: 3001,
    });
  });
  it("formats original and repeated follow fragments against their actual page widths", /** Checks native upper ownership and original table identity. @returns Nothing. */ () => {
    const f = fixture({ align: "center", width: 3000, headerRows: 1, repeatHeaderRows: true });
    const first = {
        ...createDefaultWriterPageDescriptor("en-GB").GetValue(),
        name: "First",
        width: 6000,
        height: 1000,
        leftMargin: 500,
        rightMargin: 500,
        topMargin: 100,
        bottomMargin: 100,
      },
      follow = { ...first, name: "Follow", width: 10000, height: 1400 };
    const pages = createSwPageFrames(
      [],
      {
        initialName: "First",
        descriptors: [
          { value: first, followName: "Follow" },
          { value: follow, followName: "Follow" },
        ],
      },
      undefined,
      [
        {
          table: f.table,
          tableName: "Geometry",
          afterParagraphIndex: -1,
          rowHeights: [300, 300, 300, 300, 300],
        },
      ],
    );
    expect(
      pages.map(
        /** Reads actual page frames. @param p - Page owner. @returns Frame geometry. */ (p) =>
          p.tableFrames.map(
            /** Reads original table fragment. @param t - Frame owner. @returns Native geometry. */ (
              t,
            ) => [t.firstRow, t.lastRow, t.repeatedHeaderRows ?? 0, t.printArea],
          ),
      ),
    ).toEqual([
      [[0, 1, 0, { left: 1000, right: 1000, width: 3000 }]],
      [[2, 4, 1, { left: 3000, right: 3000, width: 3000 }]],
    ]);
    for (const page of pages)
      for (const frame of page.tableFrames) expect(frame.table).toBe(f.table);
  });
  it("retains unchanged frames and invalidates native left then right geometry", /** Checks real root geometry reconciliation without model clones. @returns Nothing. */ () => {
    const f = fixture({ align: "left", width: 3000 }),
      root = new SwRootFrame(
        /** Resolves current native document. @returns Document owner. */ () => f.doc,
      ),
      page = createDefaultWriterPageDescriptor("en-GB").GetValue(),
      info = new SwLineNumberInfo().QueryValue();
    const measurements = [{ id: "body", lines: [{ start: 0, end: 0, height: 240 }] }];
    const before = root.Format(measurements, page, undefined, info);
    root.Invalidate();
    expect(root.Format(measurements, page, undefined, info).pages[0]).toBe(before.pages[0]);
    f.table.SetFormat({ align: "left", width: 3000, marginLeft: 200 });
    root.Invalidate();
    const moved = root.Format(measurements, page, undefined, info);
    expect(moved.pages[0]).not.toBe(before.pages[0]);
    expect(moved.pages[0]?.tableFrames[0]?.printArea.left).toBe(200);
    f.table.SetFormat({ align: "left", width: 3500, marginLeft: 200 });
    root.Invalidate();
    const resized = root.Format(measurements, page, undefined, info);
    expect(resized.pages[0]).not.toBe(moved.pages[0]);
    expect(resized.pages[0]?.tableFrames[0]?.printArea.width).toBe(3500);
  });
});
