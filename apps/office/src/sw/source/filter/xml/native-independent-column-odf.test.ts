/** @fileoverview Checks source union-grid ODF spans and complete native box frame sizes across codec boundaries. */
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import { SwDoc } from "../../core/doc/doc";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import type { SwTable } from "../../core/table/swtable";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
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

/** Reads the original signed span on each native box. @param table - Actual table. @returns Row-major model span values. */
function signedSpans(table: SwTable): number[][] {
  const spans: number[][] = [];
  for (const row of table.GetTabLines()) {
    const values: number[] = [];
    for (const box of row.GetTabBoxes()) values.push(box.getRowSpan());
    spans.push(values);
  }
  return spans;
}

it("keeps vertical Writer spans through ODT, the worker codec and clipped source spans", /** The package carries the original positive master and reconstructs covered native boxes. @returns Completion. */ async () => {
  const doc = new SwDoc();
  const restored: SwDoc[] = [];
  try {
    const table = doc.nodes.MakeTableNode("Vertical spans", { width: 3600 });
    for (let row = 0; row < 3; ++row) {
      const boxes = doc.nodes.AppendTableRow(table, 2).GetTabBoxes();
      for (const box of boxes)
        box.SetFrameSize(new SwFormatFrameSize(SwFrameSize.Variable, 1800, 0));
      const first = required(boxes[0]);
      first.setRowSpan(row === 0 ? 3 : row - 3);
      required(required(boxes[1]).GetParagraphs()[0]).SetText(String(row));
    }
    const spans = [
      [3, 1],
      [-2, 1],
      [-1, 1],
    ];
    const encoded = encodeWriterDocument(doc);
    const decoded = decodeWriterDocument(structuredClone(encoded));
    restored.push(decoded);
    expect(signedSpans(required(decoded.GetTables()[0]))).toEqual(spans);
    const bytes = await writeOdtDocument(doc, { title: "Vertical spans" });
    const content = await (await DocumentArchive.open(bytes)).readTextEntry("content.xml");
    expect(content).toContain('table:number-rows-spanned="3"');
    expect(content.match(/<table:covered-table-cell\/>/gu)).toHaveLength(2);
    const reopened = (await readOdtDocument(bytes, { title: "Vertical spans" })).document;
    restored.push(reopened);
    expect(signedSpans(required(reopened.GetTables()[0]))).toEqual(spans);
    const { document: clipped } = importWriterXml(
      exportStylesXml(doc),
      content
        .replace('table:number-rows-spanned="3"', 'table:number-rows-spanned="4"')
        .replaceAll("<table:covered-table-cell/>", ""),
      { title: "Clipped vertical spans" },
    );
    restored.push(clipped);
    const clippedTable = required(clipped.GetTables()[0]);
    expect(signedSpans(clippedTable)).toEqual(spans);
    expect(clippedTable.GetTabLines()[2]?.GetTabBoxes()[1]?.GetParagraphs()[0]?.GetText()).toBe(
      "2",
    );
  } finally {
    for (const copy of restored) copy.Dispose();
    doc.Dispose();
  }
});
it("ODF union grid emits literal spans and covered slots and reopens original native cells", /** Checks real package roundtrip rather than a synthetic width record. @returns Completion. */ async () => {
  const f = fixture(),
    bytes = await writeOdtDocument(f.doc, { title: "Independent" }),
    content = await (await DocumentArchive.open(bytes)).readTextEntry("content.xml");
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
it("builds spanning boxes without an explicit covered-cell marker", /** Tests Writer's native omission of redundant covered cells. @returns Nothing. */ () => {
  const f = fixture(),
    content = exportContentXml(f.doc).replace("<table:covered-table-cell/>", ""),
    imported = importWriterXml(exportStylesXml(f.doc), content, {
      title: "Implicit cover",
    }).document;
  expect(required(imported.GetTables()[0]).GetTabLines()[0]?.GetTabBoxes()).toHaveLength(2);
});
it("clips column spans at grid edges and preceding vertical reservations", /** Replays admitted cells over a three-column native grid. @returns Nothing. */ () => {
  const namespaces = Object.entries(ODF_NAMESPACES)
    .map(
      /** Supplies the actual SAX namespaces. @param pair - Namespace binding. @returns XML declaration. */ ([
        prefix,
        uri,
      ]) => `xmlns:${prefix}="${uri}"`,
    )
    .join(" ");
  const content = `<office:document-content ${namespaces} office:version="1.3"><office:body><office:text>
    <table:table table:name="Clipped"><table:table-column table:number-columns-repeated="3"/>
    <table:table-row>
      <table:table-cell><text:p>Left</text:p></table:table-cell>
      <table:table-cell table:number-rows-spanned="2"><text:p>Master</text:p></table:table-cell>
      <table:table-cell/><table:covered-table-cell/>
    </table:table-row>
    <table:table-row>
      <table:table-cell table:number-columns-spanned="3"><text:p>Before reservation</text:p></table:table-cell>
      <table:covered-table-cell/>
      <table:table-cell table:number-columns-spanned="4" table:number-columns-repeated="2"><text:p>At edge</text:p></table:table-cell>
    </table:table-row>
    </table:table></office:text></office:body></office:document-content>`;
  const imported = importWriterXml(undefined, content, { title: "Clipped" }).document;
  try {
    const table = required(imported.GetTables()[0]);
    expect(table.GetColumnWidths()).toEqual([23, 23, 23]);
    expect(signedSpans(table)).toEqual([
      [1, 2, 1],
      [1, -1, 1],
    ]);
    const row = required(table.GetTabLines()[1]);
    expect(row.GetTabBoxes()[0]?.GetParagraphs()[0]?.GetText()).toBe("Before reservation");
    expect(row.GetTabBoxes()[2]?.GetParagraphs()[0]?.GetText()).toBe("At edge");
    const exported = exportContentXml(imported);
    expect(exported).toContain('table:number-columns-repeated="3"');
    expect(exported).not.toContain("table:number-columns-spanned");
  } finally {
    imported.Dispose();
  }
});

it("advances the compatibility cursor only for styled covered cells", /** Verifies Writer's separate marker cursor with two vertically reserved slots. @returns Nothing. */ () => {
  const content = `<office:document-content xmlns:office="${ODF_NAMESPACES.office}" xmlns:table="${ODF_NAMESPACES.table}" xmlns:style="${ODF_NAMESPACES.style}" xmlns:fo="${ODF_NAMESPACES.fo}">
  <office:automatic-styles><style:style style:name="Border" style:family="table-cell"><style:table-cell-properties fo:border-right="1pt solid #000000"/></style:style></office:automatic-styles>
  <office:body><office:text><table:table table:name="Cursor">
    <table:table-column table:number-columns-repeated="2"/>
    <table:table-row><table:table-cell table:number-rows-spanned="2"/><table:table-cell table:number-rows-spanned="2"/></table:table-row>
    <table:table-row><table:covered-table-cell/><table:covered-table-cell table:style-name="Border"/></table:table-row>
  </table:table></office:text></office:body></office:document-content>`;
  const settingsXml = `<office:document-settings xmlns:office="${ODF_NAMESPACES.office}" xmlns:config="${ODF_NAMESPACES.config}" xmlns:ooo="${ODF_NAMESPACES.ooo}"><office:settings><config:config-item-set config:name="ooo:configuration-settings"><config:config-item config:name="TableRowKeep" config:type="boolean">true</config:config-item></config:config-item-set></office:settings></office:document-settings>`;
  const document = importWriterXml(undefined, content, { title: "Marker cursor" }, undefined, {
    settingsXml,
  }).document;
  try {
    const row = required(document.GetTables()[0]?.GetTabLines()[1]);
    const first = required(row.GetTabBoxes()[0]);
    const second = required(row.GetTabBoxes()[1]);
    expect(first.GetFrameFormat().GetBox().GetRight()).toBeTruthy();
    expect(second.GetFrameFormat().GetBox().GetRight()).toBeUndefined();
  } finally {
    document.Dispose();
  }
});

it("replays LibreOffice testVerticallyMergedCellBorder on the original ODT", /** Checks both direct border owners and the native covered style name through worker and package export. @returns Completion. */ async () => {
  const bytes = readFileSync(
    "../../vendor/libreoffice-reference/sw/qa/extras/odfimport/data/vmerge-cell-border.odt",
  );
  const metadata = { title: "Vertically merged cell borders" };
  const document = (await readOdtDocument(new Uint8Array(bytes), metadata)).document;
  const record = structuredClone(encodeWriterDocument(document));
  const worker = decodeWriterDocument(record);
  const legacyRecord = structuredClone(record);
  Reflect.deleteProperty(legacyRecord.documentSettings, "TABLE_ROW_KEEP");
  const legacy = decodeWriterDocument(legacyRecord);
  let reopened: SwDoc | undefined;
  try {
    expect(legacy.GetDocumentSettingManager().get("TABLE_ROW_KEEP")).toBe(false);
    const output = await writeOdtDocument(worker, metadata);
    const stream = await (await DocumentArchive.open(output)).readTextEntry("content.xml");
    expect(stream).toContain('<table:covered-table-cell table:style-name="Table1.A2"/>');
    reopened = (await readOdtDocument(output, metadata)).document;
    for (const candidate of [document, worker, reopened]) {
      expect(candidate.GetDocumentSettingManager().get("TABLE_ROW_KEEP")).toBe(true);
      const table = required(candidate.GetTables()[0]);
      const upper = required(table.GetTabLines()[0]?.GetTabBoxes()[0]);
      const lower = required(table.GetTabLines()[1]?.GetTabBoxes()[0]);
      expect(upper.GetFrameFormat().GetBox().GetRight()).toBeTruthy();
      expect(lower.GetFrameFormat().GetBox().GetRight()).toBeUndefined();
      expect(signedSpans(table)).toEqual([[2], [-1]]);
    }
    const withoutSetting = importWriterXml(
      undefined,
      await (await DocumentArchive.open(new Uint8Array(bytes))).readTextEntry("content.xml"),
      metadata,
    ).document;
    try {
      const covered = required(withoutSetting.GetTables()[0]?.GetTabLines()[1]?.GetTabBoxes()[0]);
      expect(covered.GetFrameFormat().GetBox().GetRight()).toBeTruthy();
    } finally {
      withoutSetting.Dispose();
    }
  } finally {
    reopened?.Dispose();
    legacy.Dispose();
    worker.Dispose();
    document.Dispose();
  }
});

it("ODF fuzzy20 column equivalence exports the native shared grid without extra covered owners", /** Checks source tolerance normalization through a real package stream. @returns Completion. */ async () => {
  const f = fixture(),
    row = required(f.table.GetTabLines()[1]);
  for (const [index, box] of row.GetTabBoxes().entries()) {
    const size = box.GetFrameSize();
    size.SetWidth(index === 0 ? 1520 : 2980);
    box.SetFrameSize(size);
  }
  const bytes = await writeOdtDocument(f.doc, { title: "Fuzzy" }),
    content = await (await DocumentArchive.open(bytes)).readTextEntry("content.xml");
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
