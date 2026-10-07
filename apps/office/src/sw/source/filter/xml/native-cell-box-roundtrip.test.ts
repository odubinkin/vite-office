/** @fileoverview Verifies independent native box ODF properties and complete primitive process/storage rehydration. */
import { expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import { SvxBorderLine } from "../../../../editeng/source/items/borderline";
import { RES_BOX } from "../../../inc/hintids";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import {
  XMLBorderHdl,
  XMLBorderWidthHdl,
  importBoxProperties,
  exportBoxProperties,
  exportBorderShorthand,
} from "../../../../xmloff/source/style/bordrhdl";
import { writeOdtDocument } from "./wrtxml";
import { readOdtDocument } from "./swxml";
import { exportTableBlocks } from "../../../../xmloff/source/table/XMLTableExport";

it("retains native border export fallbacks and rejects malformed legacy storage and XML measures", /** Checks filter and transport ingress contracts rather than kernel CSS aliases. @returns Nothing. */ () => {
  const f = fixture();
  try {
    for (const patch of [{ padding: "bad" }, { border: 4 }]) {
      const record = JSON.parse(JSON.stringify(encodeWriterDocument(f.doc)));
      record.tables[0].rows[0].cells[0].format = patch;
      expect(
        /** Rejects malformed scalar storage at ingress. @returns Attempted document. */ () =>
          decodeWriterDocument(record),
      ).toThrow("Stored Writer legacy box is invalid.");
    }
    const empty = SvxBoxItem.SvxLineToLine(undefined),
      handler = new XMLBorderHdl();
    expect(handler.importXML("bad solid", { value: empty })).toBe(false);
    expect(handler.exportXML({ ...empty, LineWidth: 35, LineStyle: 32767 })).toBe(
      "0.99pt solid #000000",
    );
    expect(handler.exportXML({ ...empty, LineWidth: 35, LineStyle: 18 })).toBe(
      "0.99pt solid #000000",
    );
    expect(new XMLBorderWidthHdl().exportXML({ ...empty, LineStyle: 3 })).toBeUndefined();
    expect(
      /** Rejects an invalid authored border token. @returns Attempted box. */ () =>
        importBoxProperties({ borderTop: "bad" }, RES_BOX),
    ).toThrow("Unsupported ODF cell border");
    expect(
      /** Rejects an invalid compound-width declaration. @returns Attempted box. */ () =>
        importBoxProperties({ border: "1pt double", borderLineWidth: "bad" }, RES_BOX),
    ).toThrow("Unsupported ODF border widths");
    const value = exportTableBlocks(
      [
        {
          kind: "table",
          table: {
            name: "Neutral",
            format: {},
            columnWidths: [3000],
            softPageBreakRows: [],
            rows: [
              {
                format: {},
                cells: [
                  {
                    paragraphs: [],
                    format: {
                      padding: 20,
                      border: "1pt double #112233",
                      borderLineWidth: "0.035cm 0.035cm 0.035cm",
                      borderLineWidthTop: "0.035cm 0.035cm 0.035cm",
                      borderLineWidthBottom: "0.035cm 0.035cm 0.035cm",
                      borderLineWidthLeft: "0.035cm 0.035cm 0.035cm",
                      borderLineWidthRight: "0.035cm 0.035cm 0.035cm",
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
      /** Supplies the empty neutral paragraph sequence. @returns Empty XML. */ () => "",
      /** Keeps native export uncancelled. @returns False. */ () => false,
    );
    expect(value.automaticStyles).toContain('fo:padding="');
    expect(value.automaticStyles).toContain('fo:border="1pt double #112233"');
    expect(value.automaticStyles).toContain('style:border-line-width="0.035cm 0.035cm 0.035cm"');
    for (const side of ["top", "bottom", "left", "right"])
      expect(value.automaticStyles).toContain(
        `style:border-line-width-${side}="0.035cm 0.035cm 0.035cm"`,
      );
  } finally {
    f.doc.Dispose();
  }
});

/** Requires a native owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing box roundtrip owner");
  return value;
}
/** Builds authored native edges using public setters alone. @returns Original graph. */
function fixture() {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("IndependentBox");
  table.AddColumnWidth(4000);
  const item = new SvxBoxItem(RES_BOX);
  for (const [edge, style] of [0, 2, 3, 11].entries()) {
    const line = new SvxBorderLine(0x112233 + edge, (edge + 1) * 20);
    line.SetBorderLineStyle(style);
    item.SetLine(line, edge);
    item.SetDistance(20 + edge * 10, edge);
  }
  const box = required(doc.nodes.AppendTableRow(table, 1, {}, [{ box: item }]).GetTabBoxes()[0]);
  required(box.GetParagraphs()[0]).SetText("Independent native edges");
  return { doc, box, item };
}
it("ODT reopens four independently authored lines and distances with original text ownership", /** Checks native data survives actual ZIP/XML boundaries. @returns Completion. */ async () => {
  const f = fixture(),
    result = await readOdtDocument(writeOdtDocument(f.doc, { title: "Box" }), { title: "Box" });
  try {
    const box = required(result.document.GetTables()[0]?.GetTabLines()[0]?.GetTabBoxes()[0]);
    expect(box.GetBox()).toEqual(f.item);
    expect(box.GetParagraphs()[0]?.GetText()).toBe("Independent native edges");
    expect(box.GetFormat()).not.toHaveProperty("padding");
    expect(box.GetFormat()).not.toHaveProperty("border");
    expect(box.GetParagraphs()[0]).not.toBe(f.box.GetParagraphs()[0]);
  } finally {
    f.doc.Dispose();
    result.document.Dispose();
  }
});
it("structured transport retains signed distances, custom double ratios, scale, mirror and removal flag", /** Checks primitive copies restore owned native objects without prototype transport. @returns Nothing. */ () => {
  const f = fixture(),
    custom = new SvxBorderLine(0x778899);
  custom.GuessLinesWidths(3, 7, 13, 19);
  custom.ScaleMetrics(1.5);
  custom.SetMirrorWidths();
  f.item.SetLine(custom, 0);
  f.item.SetDistance(-99, 2);
  f.item.SetRemoveAdjCellBorder(true);
  f.box.SetFormat({ box: f.item });
  const record = structuredClone(encodeWriterDocument(f.doc)),
    doc = decodeWriterDocument(record);
  try {
    const item = required(doc.GetTables()[0]?.GetTabLines()[0]?.GetTabBoxes()[0]).GetBox();
    expect(item.QueryValue()).toEqual(f.item.QueryValue());
    expect(item.GetTop()?.toJSON()).toEqual(custom.toJSON());
    expect(item.GetDistance(2, true)).toBe(-99);
    expect(item.GetDistance(2)).toBe(0);
    expect(item.GetRemoveAdjCellBorder()).toBe(true);
    expect(item.GetTop()).toBeInstanceOf(SvxBorderLine);
    expect(item.GetTop()).not.toBe(f.item.GetTop());
    item.GetTop()?.SetWidth(999);
    expect(f.item.GetTop()?.GetWidth()).toBe(39);
    const primitive = record.tables?.[0]?.rows[0]?.cells[0]?.format.box;
    expect(primitive).not.toBeInstanceOf(SvxBoxItem);
    expect(primitive?.lines[0]).not.toBeInstanceOf(SvxBorderLine);
  } finally {
    f.doc.Dispose();
    doc.Dispose();
  }
});
it("legacy scalar storage is converted once at ingress and subsequent records contain native primitives", /** Checks removed kernel scalar contracts stay absent. @returns Nothing. */ () => {
  const f = fixture(),
    record = JSON.parse(JSON.stringify(encodeWriterDocument(f.doc)));
  record.tables[0].rows[0].cells[0].format = { padding: 44, border: "1pt solid #112233" };
  const doc = decodeWriterDocument(record);
  try {
    const box = required(doc.GetTables()[0]?.GetTabLines()[0]?.GetTabBoxes()[0]);
    for (const edge of [0, 1, 2, 3]) {
      expect(box.GetBox().GetDistance(edge)).toBe(44);
      expect(box.GetBox().GetLine(edge)?.GetColor()).toBe(0x112233);
      expect(box.GetBox().GetLine(edge)?.GetWidth()).toBe(20);
    }
    const encoded = encodeWriterDocument(doc).tables?.[0]?.rows[0]?.cells[0]?.format;
    expect(encoded).not.toHaveProperty("padding");
    expect(encoded).not.toHaveProperty("border");
    expect(encoded).toHaveProperty("box");
  } finally {
    f.doc.Dispose();
    doc.Dispose();
  }
});
it.each([
  null,
  { which: -1 },
  { which: 32768 },
  { which: 0.5 },
  { lines: [] },
  { distances: [] },
  { removeAdjacent: 0 },
])(
  "rejects malformed native box record %j",
  /** Checks untrusted primitive box structure. @param patch - Invalid fields. @returns Nothing. */ (
    patch,
  ) => {
    const f = fixture(),
      record = JSON.parse(JSON.stringify(encodeWriterDocument(f.doc))),
      format = record.tables[0].rows[0].cells[0].format;
    format.box = patch === null ? null : { ...format.box, ...patch };
    expect(
      /** Decodes malformed storage. @returns Native graph or schema error. */ () =>
        decodeWriterDocument(record),
    ).toThrow("Stored Writer native box is invalid.");
    f.doc.Dispose();
  },
);
it.each([-32769, 32768, 0.5, "invalid"])(
  "rejects malformed signed distance %j",
  /** Checks primitive signed16 boundaries. @param distance - Invalid scalar. @returns Nothing. */ (
    distance,
  ) => {
    const f = fixture(),
      record = JSON.parse(JSON.stringify(encodeWriterDocument(f.doc)));
    record.tables[0].rows[0].cells[0].format.box.distances[0] = distance;
    expect(
      /** Decodes malformed distance. @returns Native graph or schema error. */ () =>
        decodeWriterDocument(record),
    ).toThrow("Stored Writer box distance is invalid.");
    f.doc.Dispose();
  },
);
it.each([
  null,
  { color: -1 },
  { color: 0x100000000 },
  { color: 0.5 },
  { width: 0.5 },
  { style: -1 },
  { style: 18 },
  { style: 0.5 },
  { scale: "invalid" },
  { scale: Infinity },
  { mirror: 1 },
  { useLeftTop: 1 },
  { implementation: [] },
  { implementation: [8, 1, 0, 0] },
  { implementation: [-1, 1, 0, 0] },
  { implementation: [0.5, 1, 0, 0] },
  { implementation: [1, "invalid", 0, 0] },
])(
  "rejects malformed native line record %j",
  /** Checks complete untrusted line fields. @param patch - Invalid fields. @returns Nothing. */ (
    patch,
  ) => {
    const f = fixture(),
      record = JSON.parse(JSON.stringify(encodeWriterDocument(f.doc))),
      box = record.tables[0].rows[0].cells[0].format.box;
    box.lines[0] = patch === null ? null : { ...box.lines[0], ...patch };
    if (patch === null) box.lines[0] = "invalid";
    expect(
      /** Decodes malformed line. @returns Native graph or schema error. */ () =>
        decodeWriterDocument(record),
    ).toThrow("Stored Writer native border line is invalid.");
    f.doc.Dispose();
  },
);
it("filter shorthand applies per-edge overrides, source style tokens and native compound widths", /** Checks actual handler admission independently of model fixture adapters. @returns Nothing. */ () => {
  const item = required(
    importBoxProperties(
      {
        padding: 10,
        paddingRight: 40,
        border: "1pt solid #112233",
        borderTop: "2pt dashed #223344",
        borderBottom: "none",
      },
      113,
    ),
  );
  expect(
    [0, 1, 2, 3].map(
      /** Reads overridden distances. @param edge - Side. @returns Twips. */ (edge) =>
        item.GetDistance(edge),
    ),
  ).toEqual([10, 10, 10, 40]);
  expect(item.GetTop()?.GetWidth()).toBe(40);
  expect(item.GetTop()?.GetBorderLineStyle()).toBe(2);
  expect(item.GetBottom()).toBeUndefined();
  expect(exportBoxProperties(undefined)).toEqual({});
  expect(importBoxProperties({}, 113)).toBeUndefined();
  expect(exportBorderShorthand(undefined)).toBe("none");
  expect(exportBorderShorthand(item.GetTop())).toBe("2pt dashed #223344");
  const handler = new XMLBorderHdl(),
    compound = new XMLBorderWidthHdl();
  for (const style of [
    "none",
    "hidden",
    "solid",
    "dotted",
    "dashed",
    "double",
    "double-thin",
    "groove",
    "ridge",
    "inset",
    "outset",
    "fine-dashed",
    "dash-dot",
    "dash-dot-dot",
  ]) {
    const target = { value: SvxBoxItem.SvxLineToLine(undefined, true) };
    expect(handler.importXML(`1pt ${style} #112233`, target)).toBe(true);
    expect(handler.exportXML(target.value)).toContain(style === "hidden" ? "none" : style);
  }
  for (const invalid of [
    "1pt #112233",
    "solid",
    "1pt solid nonsense",
    "1pt solid solid",
    "1pt 2pt solid",
  ])
    expect(handler.importXML(invalid, { value: SvxBoxItem.SvxLineToLine(undefined) })).toBe(false);
  for (const named of ["thin", "middle", "thick"])
    expect(
      handler.importXML(`${named} solid`, { value: SvxBoxItem.SvxLineToLine(undefined) }),
    ).toBe(true);
  const target = { value: SvxBoxItem.SvxLineToLine(new SvxBorderLine(0, 60, 3), true) };
  expect(compound.importXML("0.035cm 0.035cm 0.035cm", target)).toBe(true);
  expect(compound.exportXML(target.value)).toBe("0.035cm 0.035cm 0.035cm");
  expect(compound.importXML("1pt 2pt", target)).toBe(false);
  expect(compound.importXML("bad 1pt 1pt", target)).toBe(false);
  expect(compound.exportXML(SvxBoxItem.SvxLineToLine(undefined))).toBeUndefined();
});
