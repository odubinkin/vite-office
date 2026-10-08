/** @fileoverview Checks source union-grid ODF spans and complete native box frame sizes across codec boundaries. */
import { expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwFrameSize } from "../../../inc/fmtfsize";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { exportContentXml, exportStylesXml } from "./xmlexp";
import { importWriterXml } from "./xmlimp";
import { writeOdtDocument } from "./wrtxml";
import { readOdtDocument } from "./swxml";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";

/** Requires an actual graph owner. @param value - Optional native value. @returns Value. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing ODF independent box owner");
  return value;
}
/** Creates literal unequal independent native rows. @returns Document and original owners. */
function fixture() {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode(
      "Independent",
      { width: 4500, horiOrient: HoriOrientation.LEFT },
      required(doc.paragraphs[0]),
    );
  for (const width of [1500, 3000]) table.AddColumnWidth(width);
  doc.nodes.AppendTableRow(table, 2);
  doc.nodes.AppendTableRow(table, 2);
  const row = required(table.GetTabLines()[1]);
  for (const [index, box] of row.GetTabBoxes().entries()) {
    const size = box.GetFrameSize();
    size.SetWidth(index === 0 ? 2000 : 2500);
    box.SetFrameSize(size);
  }
  for (const [rowIndex, line] of table.GetTabLines().entries())
    for (const [column, box] of line.GetTabBoxes().entries())
      required(box.GetParagraphs()[0]).SetText(`Original ${rowIndex}:${column}`);
  return { doc, table };
}
it("ODF union grid emits literal spans and covered slots and reopens original native cells", /** Checks real package roundtrip rather than a synthetic width record. @returns Completion. */ async () => {
  const f = fixture(),
    bytes = writeOdtDocument(f.doc, { title: "Independent" }),
    content = await new ZipFile(bytes).readTextEntry("content.xml");
  expect(content.match(/<table:table-column /gu)).toHaveLength(3);
  expect(content.match(/table:number-columns-spanned="2"/gu)).toHaveLength(2);
  expect(content.match(/<table:covered-table-cell\/>/gu)).toHaveLength(2);
  const reopened = required(
    (await readOdtDocument(bytes, { title: "Independent" })).document.GetTables()[0],
  );
  expect(
    reopened
      .GetTabLines()
      .map(
        /** Reads the reopened original model box widths. @param line - Native row. @returns Widths. */ (
          line,
        ) =>
          line
            .GetTabBoxes()
            .map(
              /** Reads a native box width. @param box - Actual cell. @returns Width. */ (box) =>
                box.GetFrameSize().GetWidth(),
            ),
      ),
  ).toEqual([
    [1500, 3000],
    [2000, 2500],
  ]);
  expect(
    reopened
      .GetTabLines()
      .map(
        /** Reads reopened cell texts with no duplicate covered owners. @param line - Native row. @returns Texts. */ (
          line,
        ) =>
          line
            .GetTabBoxes()
            .map(
              /** Reads original cell text. @param box - Actual box. @returns Text. */ (box) =>
                required(box.GetParagraphs()[0]).GetText(),
            ),
      ),
  ).toEqual([
    ["Original 0:0", "Original 0:1"],
    ["Original 1:0", "Original 1:1"],
  ]);
});
it("codec keeps complete independent frame size fields and accepts prior records without box sizes", /** Checks authored fields and legacy shared-width ingress. @returns Nothing. */ () => {
  const f = fixture(),
    box = required(required(f.table.GetTabLines()[1]).GetTabBoxes()[0]),
    size = box.GetFrameSize();
  size.SetHeight(400);
  size.SetWidthSizeType(SwFrameSize.Minimum);
  size.SetHeightSizeType(SwFrameSize.Fixed);
  size.SetWidthPercent(33);
  size.SetHeightPercent(44);
  size.SetWidthPercentRelation(2);
  size.SetHeightPercentRelation(3);
  box.SetFrameSize(size);
  const record = encodeWriterDocument(f.doc),
    decoded = decodeWriterDocument(record),
    restored = required(
      required(required(decoded.GetTables()[0]).GetTabLines()[1]).GetTabBoxes()[0],
    ).GetFrameSize();
  expect([
    restored.GetWidth(),
    restored.GetHeight(),
    restored.GetWidthSizeType(),
    restored.GetHeightSizeType(),
    restored.GetWidthPercent(),
    restored.GetHeightPercent(),
    restored.GetWidthPercentRelation(),
    restored.GetHeightPercentRelation(),
  ]).toEqual([2000, 400, 2, 1, 33, 44, 2, 3]);
  const legacy = structuredClone(record);
  for (const row of required(legacy.tables)[0]?.rows ?? [])
    for (const cell of row.cells) delete (cell.format as { frameSize?: unknown }).frameSize;
  const old = required(decodeWriterDocument(legacy).GetTables()[0]);
  expect(
    old
      .GetTabLines()
      .map(
        /** Reads the legacy rows initialized from declarations. @param line - Native row. @returns Widths. */ (
          line,
        ) =>
          line
            .GetTabBoxes()
            .map(
              /** Reads initialized native box size. @param cell - Original cell. @returns Width. */ (
                cell,
              ) => cell.GetFrameSize().GetWidth(),
            ),
      ),
  ).toEqual([
    [1500, 3000],
    [1500, 3000],
  ]);
});
it.each(["missing-covered", "foreign-covered", "overflow"])(
  "ODF independent grid rejects malformed %s",
  /** Checks source span-grid cardinality without silently duplicating cells. @param kind - Malformation. @returns Nothing. */ (
    kind,
  ) => {
    const f = fixture(),
      content = exportContentXml(f.doc),
      invalid =
        kind === "missing-covered"
          ? content.replace("<table:covered-table-cell/>", "")
          : kind === "foreign-covered"
            ? content.replace("</table:table-row>", "<table:covered-table-cell/></table:table-row>")
            : content.replace(
                'table:number-columns-spanned="2"',
                'table:number-columns-spanned="4"',
              );
    expect(
      /** Imports an independently malformed span stream. @returns Import result or validation error. */ () =>
        importWriterXml(exportStylesXml(f.doc), invalid, { title: "Invalid" }),
    ).toThrow(/ODF/);
  },
);

it("ODF fuzzy20 column equivalence exports the native shared grid without extra covered owners", /** Checks source tolerance normalization through a real package stream. @returns Completion. */ async () => {
  const f = fixture(),
    row = required(f.table.GetTabLines()[1]);
  for (const [index, box] of row.GetTabBoxes().entries()) {
    const size = box.GetFrameSize();
    size.SetWidth(index === 0 ? 1520 : 2980);
    box.SetFrameSize(size);
  }
  const bytes = writeOdtDocument(f.doc, { title: "Fuzzy" }),
    content = await new ZipFile(bytes).readTextEntry("content.xml");
  expect(content.match(/<table:table-column /gu)).toHaveLength(2);
  expect(content).not.toContain("table:number-columns-spanned");
  expect(content).not.toContain("table:covered-table-cell");
  const reopened = required(
    (await readOdtDocument(bytes, { title: "Fuzzy" })).document.GetTables()[0],
  );
  expect(
    reopened.GetTabLines().map(
      /** Reads source-normalized actual cell widths. @param line - Native row. @returns Widths. */
      (line) =>
        line.GetTabBoxes().map(
          /** Reads imported native geometry. @param box - Original cell. @returns Width. */
          (box) => box.GetFrameSize().GetWidth(),
        ),
    ),
  ).toEqual([
    [1500, 3000],
    [1500, 3000],
  ]);
  expect(
    reopened.GetTabLines().map(
      /** Retains actual cell text under native fuzzy normalization. @param line - Imported row. @returns Texts. */
      (line) =>
        line.GetTabBoxes().map(
          /** Reads original cell text. @param box - Original cell. @returns Text. */
          (box) => required(box.GetParagraphs()[0]).GetText(),
        ),
    ),
  ).toEqual([
    ["Original 0:0", "Original 0:1"],
    ["Original 1:0", "Original 1:1"],
  ]);
});
