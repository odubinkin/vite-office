/** @fileoverview Verifies independent ODT row height types, ordered native import and source clamp limits. */
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { expect, it } from "vitest";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SwDoc } from "../../core/doc/doc";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { writeOdtDocument } from "./wrtxml";
import { readOdtDocument } from "./swxml";
import { exportContentXml, exportStylesXml } from "./xmlexp";
import { importWriterXml } from "./xmlimp";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
/** Requires imported original owner. @param value - Optional owner. @returns Actual owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing ODT frame-size owner");
  return value;
}
it("Fixed and Minimum export distinct attrs while Variable omits authored height", /** Checks native type through ordinary ODT open and export. @returns Completion. */ async () => {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Types");
  table.AddColumnWidth(3000);
  for (const type of [SwFrameSize.Variable, SwFrameSize.Fixed, SwFrameSize.Minimum])
    doc.nodes.AppendTableRow(table, 1, { frameSize: new SwFormatFrameSize(type, 0, 720) });
  const metadata = createDocument({ id: "types", suiteId: "writer", title: "Types" }),
    xml = exportContentXml(doc);
  expect(xml.match(/style:row-height=/g)).toHaveLength(1);
  expect(xml.match(/style:min-row-height=/g)).toHaveLength(1);
  const reopened = await readOdtDocument(writeOdtDocument(doc, metadata), metadata),
    rows = required(reopened.document.GetTables()[0]).GetTabLines();
  expect(
    rows.map(
      /** Reads imported type. @param row - Native owner. @returns Native mode. */ (row) =>
        row.GetFrameSize().GetHeightSizeType(),
    ),
  ).toEqual([0, 1, 2]);
  expect(
    rows.map(
      /** Reads imported extent. @param row - Native owner. @returns Twip extent. */ (row) =>
        row.GetFrameSize().GetHeight(),
    ),
  ).toEqual([0, 720, 720]);
});
it.each(["style:row-height", "style:min-row-height"])(
  "native%s clamps signed and excessive parsed height",
  /** Checks native converter bounds independent of upstream. @param attribute - Native row height attribute. @returns Nothing. */ (
    attribute,
  ) => {
    for (const [value, height] of [
      ["0pt", 1],
      ["-2pt", 1],
      ["10000pt", 65535],
      ["36pt", 720],
    ] as const) {
      const xml =
        '<office:document-content xmlns:office="' +
        ODF_NAMESPACES.office +
        '" xmlns:style="' +
        ODF_NAMESPACES.style +
        '" xmlns:table="' +
        ODF_NAMESPACES.table +
        '" xmlns:text="' +
        ODF_NAMESPACES.text +
        '"><office:automatic-styles><style:style style:name="R" style:family="table-row"><style:table-row-properties ' +
        attribute +
        '="' +
        value +
        '"/></style:style></office:automatic-styles><office:body><office:text><table:table table:name="Clamp"><table:table-column/><table:table-row table:style-name="R"><table:table-cell><text:p>native</text:p></table:table-cell></table:table-row></table:table></office:text></office:body></office:document-content>';
      const imported = importWriterXml(exportStylesXml(new SwDoc()), xml, {
          title: "Native",
        }).document,
        row = required(required(imported.GetTables()[0]).GetTabLines()[0]);
      expect(row.GetFrameSize().GetHeight()).toBe(height);
      expect(row.GetFrameSize().GetHeightSizeType()).toBe(attribute === "style:row-height" ? 1 : 2);
    }
  },
);
it.each([
  ["style:row-height", "style:min-row-height", 2, 900],
  ["style:min-row-height", "style:row-height", 1, 900],
] as const)(
  "last native row height member wins%s then%s",
  /** Checks attribute iteration semantics. @param first - First member. @param last - Last member. @param mode - Expected native mode. @param height - Expected height. @returns Nothing. */ (
    first,
    last,
    mode,
    height,
  ) => {
    const xml =
      '<office:document-content xmlns:office="' +
      ODF_NAMESPACES.office +
      '" xmlns:style="' +
      ODF_NAMESPACES.style +
      '" xmlns:table="' +
      ODF_NAMESPACES.table +
      '" xmlns:text="' +
      ODF_NAMESPACES.text +
      '"><office:automatic-styles><style:style style:name="R" style:family="table-row"><style:table-row-properties ' +
      first +
      '="30pt" ' +
      last +
      '="45pt"/></style:style></office:automatic-styles><office:body><office:text><table:table table:name="Ordered"><table:table-column/><table:table-row table:style-name="R"><table:table-cell><text:p>native</text:p></table:table-cell></table:table-row></table:table></office:text></office:body></office:document-content>';
    const row = required(
      required(
        importWriterXml(exportStylesXml(new SwDoc()), xml, {
          title: "Native",
        }).document.GetTables()[0],
      ).GetTabLines()[0],
    );
    expect(row.GetFrameSize().GetHeightSizeType()).toBe(mode);
    expect(row.GetFrameSize().GetHeight()).toBe(height);
  },
);

it("native row sizes cross structured clone and JSON with all eight fields and original row flags", /** Checks actual Worker and storage primitives with native reconstruction. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Transport");
  table.AddColumnWidth(3000);
  const item = new SwFormatFrameSize(SwFrameSize.Fixed, 2100, 600);
  item.SetWidthSizeType(SwFrameSize.Minimum);
  item.SetWidthPercent(45);
  item.SetHeightPercent(255);
  item.SetWidthPercentRelation(2);
  item.SetHeightPercentRelation(3);
  doc.nodes.AppendTableRow(table, 1, { frameSize: item, keepTogether: true });
  doc.nodes.AppendTableRow(table, 1);
  doc.nodes.AppendTableRow(table, 1, { frameSize: new SwFormatFrameSize() });
  for (const record of [
    structuredClone(encodeWriterDocument(doc)),
    JSON.parse(JSON.stringify(encodeWriterDocument(doc))),
  ]) {
    const reopened = decodeWriterDocument(record),
      rows = required(reopened.GetTables()[0]).GetTabLines();
    expect(required(rows[0]).GetFrameSize().equals(item)).toBe(true);
    expect(required(rows[0]).GetFormat().keepTogether).toBe(true);
    expect(required(rows[1]).GetFrameSize().equals(new SwFormatFrameSize())).toBe(true);
    expect(required(rows[2]).GetFrameSize().GetHeightSizeType()).toBe(SwFrameSize.Variable);
  }
  const legacy = JSON.parse(JSON.stringify(encodeWriterDocument(doc)));
  legacy.tables[0].rows[0].format = { minHeight: 720, keepTogether: true };
  const row = required(required(decodeWriterDocument(legacy).GetTables()[0]).GetTabLines()[0]);
  expect(row.GetFrameSize().GetHeight()).toBe(720);
  expect(row.GetFrameSize().GetHeightSizeType()).toBe(SwFrameSize.Minimum);
  expect(row.GetFormat()).not.toHaveProperty("minHeight");
});
it("invalid complete native frame boundary fails before reconstructing an item", /** Checks malformed transport fields without upstream dependencies. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Malformed");
  table.AddColumnWidth(3000);
  doc.nodes.AppendTableRow(table, 1, {
    frameSize: new SwFormatFrameSize(SwFrameSize.Fixed, 0, 600),
  });
  for (const value of [
    null,
    { width: "bad" },
    {
      width: 0,
      height: 600,
      widthType: 3,
      heightType: 1,
      widthPercent: 0,
      heightPercent: 0,
      widthPercentRelation: 0,
      heightPercentRelation: 0,
    },
    {
      width: 0,
      height: 600,
      widthType: 1,
      heightType: 3,
      widthPercent: 0,
      heightPercent: 0,
      widthPercentRelation: 0,
      heightPercentRelation: 0,
    },
    {
      width: 0,
      height: Infinity,
      widthType: 1,
      heightType: 1,
      widthPercent: 0,
      heightPercent: 0,
      widthPercentRelation: 0,
      heightPercentRelation: 0,
    },
  ]) {
    const record = JSON.parse(JSON.stringify(encodeWriterDocument(doc)));
    record.tables[0].rows[0].format.frameSize = value;
    expect(
      /** Decodes malformed native boundary state. @returns Native document or error. */ () =>
        decodeWriterDocument(record),
    ).toThrow("Stored Writer frame size is invalid.");
  }
});
