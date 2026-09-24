/** @fileoverview Verifies source-backed and synthetic canonical Writer table round trips. */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { ZipOutputStream } from "../../../../package/source/zipapi/ZipOutputStream";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import { FastAttributeList } from "../../../../xmloff/source/core/xmlimp";
import { XMLTableStyleContext } from "../../../../xmloff/source/table/XMLTableImport";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { createWriterDocument } from "../../core/doc/doc";
import { SwTableNode } from "../../core/docnode/node";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";
import { exportStylesXml } from "./xmlexp";
import { importWriterXml } from "./xmlimp";

/** Reads an exact upstream ODT copied from the pinned LibreOffice checkout. @returns Fixture bytes. */
function upstreamTableOdt(): Uint8Array {
  return new Uint8Array(
    readFileSync(
      path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        "../../../qa/extras/odfexport/data/tdf132642_keepWithNextTable.odt",
      ),
    ),
  );
}

/** Captures order and geometry while omitting fixture-owned text from test output. @param document - Writer model. @returns Structural table projection. */
function tableShape(document: ReturnType<typeof createWriterDocument>) {
  return document.GetTables().map(
    /** Verifies the bounded table scenario. @param argument1 - Callback input. @returns Callback result. */ (
      table,
    ) => ({
      name: table.GetName(),
      format: table.GetFormat(),
      widths: [...table.GetColumnWidths()],
      softBreakRows: [...table.GetSoftPageBreakRows()],
      rows: table.GetTabLines().map(
        /** Verifies the bounded table scenario. @param argument1 - Callback input. @returns Callback result. */ (
          row,
        ) => ({
          format: row.GetFormat(),
          cells: row.GetTabBoxes().map(
            /** Verifies the bounded table scenario. @param argument1 - Callback input. @returns Callback result. */ (
              cell,
            ) => ({
              format: cell.GetFormat(),
              paragraphs: cell
                .GetParagraphs()
                .map(
                  /** Verifies the bounded table scenario. @param argument1 - Callback input. @returns Callback result. */ (
                    node,
                  ) => node.GetText(),
                ),
            }),
          ),
        }),
      ),
    }),
  );
}

describe("Writer canonical ODF tables", /** Verifies the bounded table scenario.  @returns Callback result. */ () => {
  it("imports and structurally reopens upstream tdf132642_keepWithNextTable.odt", /** Verifies the bounded table scenario.  @returns Callback result. */ async () => {
    const metadata = { title: "Upstream Writer table" };
    const imported = await readOdtDocument(upstreamTableOdt(), metadata, undefined, {
      onDiagnostic: /** Verifies the bounded table scenario.  @returns Callback result. */ () =>
        undefined,
    });
    const original = tableShape(imported.document);
    expect(original).toHaveLength(1);
    expect(original[0]?.rows).toHaveLength(2);
    expect(
      original[0]?.rows.map(
        /** Verifies the bounded table scenario. @param argument1 - Callback input. @returns Callback result. */ (
          row,
        ) => row.cells.length,
      ),
    ).toEqual([1, 1]);
    expect(original[0]?.widths).toEqual([9638]);
    expect(original[0]?.rows[0]?.cells[0]?.format.padding).toBe(55);
    expect(
      imported.document.nodes
        .getBodyContent()
        .some(
          /** Verifies the bounded table scenario. @param argument1 - Callback input. @returns Callback result. */ (
            node,
          ) => node.GetNodeType() === "start",
        ),
    ).toBe(true);
    const reopened = await readOdtDocument(writeOdtDocument(imported.document, metadata), metadata);
    expect(tableShape(reopened.document)).toEqual(original);
  });

  it("keeps cell paragraphs, page hints, and body order through Worker and ODT transfer", /** Verifies the bounded table scenario.  @returns Callback result. */ async () => {
    const document = createWriterDocument();
    const before = document.paragraphs[0];
    if (before === undefined) throw new Error("Writer test paragraph is missing.");
    before.SetText("before");
    const table = document.nodes.MakeTableNode(
      "Table1",
      {
        width: 6000,
        align: "left",
        marginLeft: 50,
        marginTop: 60,
        marginBottom: 70,
        borderModel: "collapsing",
      },
      before,
    );
    table.AddColumnWidth(2000);
    table.AddColumnWidth(4000);
    const first = document.nodes.AppendTableRow(table, 2, { minHeight: 500, keepTogether: false }, [
      { padding: 100, border: "none", verticalAlign: "top" },
      { padding: 120, border: "1pt solid #000000", verticalAlign: "middle" },
    ]);
    first.GetTabBoxes()[0]?.GetParagraphs()[0]?.SetText("one");
    first.GetTabBoxes()[1]?.GetParagraphs()[0]?.SetText("two");
    table.AddSoftPageBreak();
    const second = document.nodes.AppendTableRow(table, 2, { keepTogether: true });
    const cell = second.GetTabBoxes()[0];
    const cellParagraph = cell?.GetParagraphs()[0];
    if (cell === undefined || cellParagraph === undefined)
      throw new Error("Writer test cell is missing.");
    cellParagraph.SetText("three");
    document.GetIDocumentMarkAccess().AddSoftPageBreak(cellParagraph, 2);
    document.GetIDocumentMarkAccess().MakeMark(cellParagraph, 1, "CellBookmark");
    document.nodes.AppendTableCellParagraph(cell).SetText("four");
    table.AddSoftPageBreak();
    document.nodes.MakeTextNode("after");
    const shape = tableShape(document);
    const encoded = decodeWriterDocument(encodeWriterDocument(document));
    expect(tableShape(encoded)).toEqual(shape);
    expect(encoded.GetIDocumentMarkAccess().GetSoftPageBreaks()).toHaveLength(1);
    expect(encoded.GetIDocumentMarkAccess().FindMark("CellBookmark")?.GetPosition().GetNode()).toBe(
      encoded.GetTables()[0]?.GetTabLines()[1]?.GetTabBoxes()[0]?.GetParagraphs()[0],
    );
    const metadata = { title: "Table roundtrip" };
    const reopened = await readOdtDocument(writeOdtDocument(encoded, metadata), metadata);
    expect(tableShape(reopened.document)).toEqual(shape);
    expect(
      reopened.document.paragraphs.map(
        /** Verifies the bounded table scenario. @param argument1 - Callback input. @returns Callback result. */ (
          node,
        ) => node.GetText(),
      ),
    ).toEqual(["before", "after"]);
    expect(reopened.document.GetIDocumentMarkAccess().GetSoftPageBreaks()).toHaveLength(1);
    expect(
      reopened.document.GetIDocumentMarkAccess().FindMark("CellBookmark")?.GetPosition().GetNode(),
    ).toBe(
      reopened.document.GetTables()[0]?.GetTabLines()[1]?.GetTabBoxes()[0]?.GetParagraphs()[0],
    );
    expect(
      reopened.document.nodes
        .getBodyContent()
        .map(
          /** Verifies the bounded table scenario. @param argument1 - Callback input. @returns Callback result. */ (
            node,
          ) => node.GetNodeType(),
        ),
    ).toEqual(["text", "start", "text"]);
  });

  it("rejects malformed table geometry instead of silently inventing a width", /** Verifies the bounded table scenario.  @returns Callback result. */ async () => {
    const original = upstreamTableOdt();
    const input = new ZipFile(original);
    const output = new ZipOutputStream();
    for (const name of input.getEntryNames()) {
      const bytes =
        name === "content.xml"
          ? new TextEncoder().encode(
              (await input.readTextEntry(name)).replace(
                'style:width="17cm"',
                'style:width="invalid"',
              ),
            )
          : await input.readEntry(name);
      output.putNextEntry(name, bytes);
    }
    await expect(
      readOdtDocument(output.finish(), { title: "Invalid table" }, undefined, {
        onDiagnostic: /** Verifies the bounded table scenario.  @returns Callback result. */ () =>
          undefined,
      }),
    ).rejects.toThrow("Unsupported ODF table width");
  });

  it("validates table style values and cell cardinality at the SAX boundary", /** Verifies the bounded table scenario.  @returns Callback result. */ () => {
    const namespaces = `xmlns:office="${ODF_NAMESPACES.office}" xmlns:style="${ODF_NAMESPACES.style}" xmlns:table="${ODF_NAMESPACES.table}" xmlns:text="${ODF_NAMESPACES.text}" xmlns:fo="${ODF_NAMESPACES.fo}"`;
    const namedStyles = exportStylesXml(createWriterDocument());
    const source =
      /** Verifies the bounded table scenario. @param argument1 - Callback input. @param argument2 - Callback input. @param argument3 - Callback input. @returns Callback result. */ (
        definitions: string,
        children = "<table:table-column/><table:table-row><table:table-cell><text:p>A</text:p></table:table-cell></table:table-row>",
        tableStyle = "S",
      ): string =>
        `<office:document-content ${namespaces} office:version="1.3"><office:automatic-styles>${definitions}</office:automatic-styles><office:body><office:text><text:p/><table:table table:name="Table1" table:style-name="${tableStyle}">${children}</table:table></office:text></office:body></office:document-content>`;
    const style =
      /** Verifies the bounded table scenario. @param argument1 - Callback input. @param argument2 - Callback input. @param argument3 - Callback input. @returns Callback result. */ (
        family: string,
        properties: string,
        name = "S",
      ): string =>
        `<style:style style:name="${name}" style:family="${family}">${properties}</style:style>`;
    const open =
      /** Verifies the bounded table scenario. @param argument1 - Callback input. @param argument2 - Callback input. @param argument3 - Callback input. @returns Callback result. */ (
        definitions: string,
        children?: string,
        tableStyle?: string,
      ): ReturnType<typeof importWriterXml> =>
        importWriterXml(
          namedStyles,
          source(definitions, children, tableStyle),
          { title: "Table validation" },
          undefined,
          {
            onDiagnostic:
              /** Verifies the bounded table scenario.  @returns Callback result. */ () =>
                undefined,
          },
        );
    const tableProps =
      /** Verifies the bounded table scenario. @param argument1 - Callback input. @returns Callback result. */ (
        attrs: string,
      ): string => style("table", `<style:table-properties ${attrs}/>`);
    for (const align of ["left", "center", "right", "margins"])
      expect(
        open(tableProps(`table:align="${align}"`))
          .document.GetTables()[0]
          ?.GetFormat().align,
      ).toBe(align);
    expect(
      /** Verifies the bounded table scenario.  @returns Callback result. */ () =>
        open(tableProps('table:align="unknown"')),
    ).toThrow("Unsupported ODF table alignment");
    expect(
      /** Verifies the bounded table scenario.  @returns Callback result. */ () =>
        open(tableProps('table:border-model="unknown"')),
    ).toThrow("Unsupported ODF table border model");
    expect(
      /** Verifies the bounded table scenario.  @returns Callback result. */ () =>
        open(tableProps('style:width="bad"')),
    ).toThrow("Unsupported ODF table width");
    expect(
      /** Verifies the bounded table scenario.  @returns Callback result. */ () =>
        open(style("table", "<style:table-properties/><style:table-properties/>")),
    ).toThrow("Duplicate ODF table style properties");
    expect(
      /** Verifies the bounded table scenario.  @returns Callback result. */ () =>
        open(`${tableProps('style:width="1cm"')}${tableProps('style:width="2cm"')}`),
    ).toThrow("Duplicate ODF table style");
    expect(
      /** Verifies the bounded table scenario.  @returns Callback result. */ () =>
        open(style("table-row", '<style:table-row-properties fo:keep-together="bad"/>', "R")),
    ).toThrow("Unsupported ODF table row keep-together");
    expect(
      /** Verifies the bounded table scenario.  @returns Callback result. */ () =>
        open(style("table-cell", '<style:table-cell-properties style:vertical-align="bad"/>', "C")),
    ).toThrow("Unsupported ODF cell vertical alignment");
    expect(
      /** Verifies the bounded table scenario.  @returns Callback result. */ () =>
        open(
          tableProps('style:width="1cm"'),
          "<table:table-row><table:table-cell><text:p/></table:table-cell></table:table-row>",
        ),
    ).toThrow("ODF table has no declared columns");
    expect(
      /** Verifies the bounded table scenario.  @returns Callback result. */ () =>
        open(
          tableProps('style:width="1cm"'),
          '<table:table-column table:number-columns-repeated="0"/>',
        ),
    ).toThrow("Unsupported ODF table repeat count");
    expect(
      /** Verifies the bounded table scenario.  @returns Callback result. */ () =>
        open(
          tableProps('style:width="1cm"'),
          "<table:table-column/><table:table-row><table:table-cell/><table:table-cell/></table:table-row>",
        ),
    ).toThrow("more cells than declared columns");
    expect(
      /** Verifies the bounded table scenario.  @returns Callback result. */ () =>
        open(tableProps('style:width="1cm"'), "<table:table-column/><table:table-row/>"),
    ).toThrow("cell count differs");
    expect(
      /** Verifies the bounded table scenario.  @returns Callback result. */ () =>
        open(
          tableProps('style:width="1cm"'),
          '<table:table-column/><table:table-row table:style-name="S"><table:table-cell/></table:table-row>',
        ),
    ).toThrow("wrong family");
    expect(
      open(
        tableProps('style:width="1cm"'),
        '<table:table-column table:style-name="Missing"/><table:table-row table:style-name="Missing"><table:table-cell table:style-name="Missing"><text:p/></table:table-cell></table:table-row>',
      )
        .document.GetTables()[0]
        ?.GetTabLines(),
    ).toHaveLength(1);
    expect(
      /** Verifies the bounded table scenario.  @returns Callback result. */ () =>
        open(tableProps('style:width="1cm"'), "<table:table-column/><text:p/>"),
    ).toThrow("Unsupported ODF XML element");
    expect(
      /** Verifies the bounded table scenario.  @returns Callback result. */ () =>
        open(
          tableProps('style:width="1cm"'),
          "<table:table-column/><table:table-row><text:p/></table:table-row>",
        ),
    ).toThrow("Unsupported ODF XML element");
    expect(
      /** Verifies the bounded table scenario.  @returns Callback result. */ () =>
        open(
          tableProps('style:width="1cm"'),
          "<table:table-column/><table:table-row><table:table-cell><table:table-row/></table:table-cell></table:table-row>",
        ),
    ).toThrow("Unsupported ODF XML element");
    const invalidFamily = new FastAttributeList([
      {
        name: "style:name",
        local: "name",
        prefix: "style",
        uri: ODF_NAMESPACES.style,
        value: "Bad",
      },
      {
        name: "style:family",
        local: "family",
        prefix: "style",
        uri: ODF_NAMESPACES.style,
        value: "invalid",
      },
    ]);
    expect(
      /** Verifies the bounded table scenario.  @returns Callback result. */ () =>
        new XMLTableStyleContext(
          {
            registerTableStyle:
              /** Verifies the bounded table scenario.  @returns Callback result. */ () =>
                undefined,
          },
          invalidFamily,
        ),
    ).toThrow("Unsupported ODF table style family");
    expect(
      importWriterXml(
        namedStyles,
        source("", undefined, "S").replace(' table:style-name="S"', ""),
        { title: "No table style" },
      ).document.GetTables(),
    ).toHaveLength(1);
  });

  it("rejects inconsistent Worker body ordering and table-cell sections", /** Verifies the bounded table scenario.  @returns Callback result. */ () => {
    const document = createWriterDocument();
    const first = document.paragraphs[0];
    if (first === undefined) throw new Error("Writer test paragraph is missing.");
    const table = document.nodes.MakeTableNode("Table1", {}, first);
    table.AddColumnWidth(1200);
    document.nodes.AppendTableRow(table, 1);
    const record = encodeWriterDocument(document);
    expect(
      /** Verifies the bounded table scenario.  @returns Callback result. */ () =>
        decodeWriterDocument({ ...record, bodyOrder: ["text", "text"] }),
    ).toThrow("body order is invalid");
    expect(
      /** Verifies the bounded table scenario.  @returns Callback result. */ () =>
        decodeWriterDocument({ ...record, bodyOrder: ["text", "table", "table"] }),
    ).toThrow("table order is invalid");
    expect(
      /** Verifies the bounded table scenario.  @returns Callback result. */ () =>
        decodeWriterDocument({ ...record, bodyOrder: ["text"] }),
    ).toThrow("body order is invalid");
    expect(
      /** Verifies the bounded table scenario.  @returns Callback result. */ () =>
        decodeWriterDocument({
          ...record,
          tables: [
            {
              ...record.tables?.[0],
              rows: [{ format: {}, cells: [{ format: {}, paragraphs: [] }] }],
            },
          ],
        }),
    ).toThrow("table cell is invalid");
    const legacy = { ...encodeWriterDocument(createWriterDocument()) };
    delete legacy.bodyOrder;
    delete legacy.tables;
    expect(decodeWriterDocument(legacy).paragraphs).toHaveLength(1);
  });

  it("keeps table and cell sections owned by their original SwNodes array", /** Verifies the bounded table scenario.  @returns Callback result. */ () => {
    const first = createWriterDocument();
    const second = createWriterDocument();
    const foreignParagraph = second.paragraphs[0];
    if (foreignParagraph === undefined) throw new Error("Writer test paragraph is missing.");
    expect(
      /** Verifies the bounded table scenario.  @returns Callback result. */ () =>
        first.nodes.MakeTableNode("Invalid", {}, foreignParagraph),
    ).toThrow("needs a body paragraph");
    const table = first.nodes.MakeTableNode("Table1");
    expect(table.GetTableNode().GetTable()).toBe(table);
    expect(
      /** Verifies the bounded table scenario.  @returns Callback result. */ () =>
        first.nodes.AppendTableRow(table, 0),
    ).toThrow("at least one cell");
    expect(
      /** Verifies the bounded table scenario.  @returns Callback result. */ () =>
        second.nodes.AppendTableRow(table, 1),
    ).toThrow("another document");
    table.AddColumnWidth(1200);
    expect(
      /** Verifies the bounded table scenario.  @returns Callback result. */ () =>
        table.SetColumnWidth(1, 1200),
    ).toThrow("column width is invalid");
    const box = first.nodes.AppendTableRow(table, 1).GetTabBoxes()[0];
    if (box === undefined) throw new Error("Writer test cell is missing.");
    expect(
      /** Verifies the bounded table scenario.  @returns Callback result. */ () =>
        second.nodes.AppendTableCellParagraph(box),
    ).toThrow("another document");
    const unbound = new SwTableNode(
      first.nodes,
      first.nodes.GetEndOfContent().StartOfSectionNode(),
    );
    expect(
      /** Verifies the bounded table scenario.  @returns Callback result. */ () =>
        unbound.GetTable(),
    ).toThrow("has no table");
  });

  it("exports omitted table geometry and zero-width column declarations deterministically", /** Verifies the bounded table scenario.  @returns Callback result. */ async () => {
    const document = createWriterDocument();
    const table = document.nodes.MakeTableNode("Unspecified");
    table.AddColumnWidth(0);
    document.nodes.AppendTableRow(table, 1);
    const metadata = { title: "Unspecified table" };
    const xml = await new ZipFile(writeOdtDocument(document, metadata)).readTextEntry(
      "content.xml",
    );
    expect(xml).toContain("<style:table-properties/>");
    expect(xml).toContain("<style:table-column-properties/>");
    const reopened = await readOdtDocument(writeOdtDocument(document, metadata), metadata);
    expect(reopened.document.GetTables()[0]?.GetColumnWidths()).toEqual([0]);
  });
});
