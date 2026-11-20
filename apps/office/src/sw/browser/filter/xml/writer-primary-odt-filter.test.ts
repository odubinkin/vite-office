/** @fileoverview Tests primary Writer storage of DOCX table styles across the normal ODF filter. */
import { assert, expect, it } from "vitest";
import { SwDoc } from "../../../source/core/doc/doc";
import { SwXTextDocument } from "../../../source/uibase/uno/unotxdoc";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { DocxExport } from "../../../source/filter/ww8/docxexport";
import { SwTableNode } from "../../../source/core/docnode/node";
import { OdtFilterError } from "../../../source/filter/xml/odt-filter-service";
import {
  encodeCellInterop,
  restoreCellInterop,
  restoreTableInterop,
  restoreTableStyles,
} from "./writer-table-interop-codec";
import { WriterPrimaryOdtFilterService } from "./writer-primary-odt-filter";

const style = {
  name: "HeadingStyle",
  value: [
    { name: "styleId", value: "HeadingStyle" },
    { name: "name", value: "Heading Style" },
    {
      name: "tblStylePr",
      value: [
        { name: "type", value: "firstRow" },
        { name: "trPr", value: [{ name: "tblHeader", value: true }] },
      ],
    },
  ],
};
const heading = [
  { name: "TableStyleName", value: "HeadingStyle" },
  { name: "TableStyleLook", value: [{ name: "val", value: 0x4a0 }] },
];

it("restores table style bindings by native name across primary XML, including nested tables", /** Runs import and export through the inline browser fallback used by the worker. @returns Completion. */ async () => {
  const document = new SwDoc();
  const model = new SwXTextDocument(document);
  const filter = new WriterPrimaryOdtFilterService();
  const input = { document, title: "Tables" };
  const table = document.nodes.MakeTableNode("Outer");
  const cell = document.nodes.AppendTableRow(table, 1).GetTabBoxes()[0];
  assert(cell);
  const nested = document.nodes.MakeTableNodeBefore(
    cell.GetStartNode().EndOfSectionNode(),
    "Nested",
    {},
  );
  const nestedCell = document.nodes.AppendTableRow(nested, 1).GetTabBoxes()[0];
  assert(nestedCell);
  const shading = [
    { name: "val", value: "clear" },
    { name: "fill", value: "auto" },
    { name: "originalColor", value: "auto" },
  ];
  restoreCellInterop(nestedCell.ClaimFrameFormat(), shading);
  document.nodes.AppendTableRow(table, 1);
  table.SetRowsToRepeat(1);
  nested.SetRowsToRepeat(0);
  restoreTableStyles(model, [style]);
  restoreTableInterop(table.GetFrameFormat(), heading);
  restoreTableInterop(nested.GetFrameFormat(), heading);
  model.dispose();
  try {
    const content = await filter.ExportXml(input);
    expect(content).toHaveProperty("wordTableStyles", {
      styles: [style],
      cells: [["Nested", 0, 0, shading]],
      tables: [
        ["Outer", heading],
        ["Nested", heading],
      ],
    });
    const restored = await filter.Import(structuredClone(content), input);
    try {
      expect(restored.document.GetTables()[0]?.GetRowsToRepeat()).toBe(1);
      const section = restored.document
        .GetNodes()
        .entries()
        .find(
          /** Resolves the native second table. @param node - Document node. @returns Whether it owns the nested table. */
          (node) => node instanceof SwTableNode && node.GetTable().GetName() === "Nested",
        );
      assert(section instanceof SwTableNode);
      const nestedBox = section.GetTable().GetTabLines()[0]?.GetTabBoxes()[0];
      assert(nestedBox);
      expect(encodeCellInterop(nestedBox.GetFrameFormat())).toEqual(shading);
      const zip = await DocumentArchive.open(await DocxExport.WriteDocument(restored.document));
      expect(await zip.readTextEntry("word/styles.xml")).toContain(
        '<w:style w:type="table" w:styleId="HeadingStyle">',
      );
      const xml = await zip.readTextEntry("word/document.xml");
      expect(xml.match(/<w:tblStyle w:val="HeadingStyle"\/>/gu)).toHaveLength(2);
      expect(xml).toContain('<w:tblHeader w:val="false"/>');
    } finally {
      restored.document.Dispose();
    }
    const portable = await filter.Import(await filter.Export(input), input);
    try {
      expect(portable.document.GetTables()[0]?.GetRowsToRepeat()).toBe(1);
      expect(await filter.ExportXml(portable)).not.toHaveProperty("wordTableStyles");
    } finally {
      portable.document.Dispose();
    }
  } finally {
    filter.Close();
    document.Dispose();
  }
});

it("accepts old primary packages and rejects malformed associated records", /** Verifies browser metadata validation and the absence of a schema migration. @returns Completion. */ async () => {
  const document = new SwDoc();
  const filter = new WriterPrimaryOdtFilterService();
  const input = { document, title: "Earlier copy" };
  const table = document.nodes.MakeTableNode("Table");
  document.nodes.AppendTableRow(table, 1);
  try {
    const old = await filter.ExportXml(input);
    expect(old).not.toHaveProperty("wordTableStyles");
    const restored = await filter.Import(old, input);
    expect(restored.document.FindTableFormatByName("Table")).toBeDefined();
    restored.document.Dispose();

    for (const wordTableStyles of [
      null,
      {},
      { tables: "Table" },
      { tables: [null] },
      { tables: [[1, heading]] },
      { tables: [["Table"]] },
      {
        tables: [
          ["Table", heading],
          ["Table", heading],
        ],
      },
      { styles: {}, tables: [] },
      { tables: [["Table", ["invalid"]]] },
      { tables: [], cells: null },
      { tables: [], cells: [["Table", -1, 0, []]] },
      { tables: [], cells: [["Table", 0, 1.5, []]] },
      { tables: [], cells: [["Table", 0, 0, [{ name: "fill", value: true }]]] },
    ]) {
      const content = { ...old, wordTableStyles };
      await expect(filter.Import(content, input)).rejects.toMatchObject({
        category: "format",
      });
    }

    const withDeletedTable = { ...old, wordTableStyles: { tables: [["Deleted", heading]] } };
    const copy = await filter.Import(withDeletedTable, input);
    try {
      expect(await filter.ExportXml(copy)).not.toHaveProperty("wordTableStyles");
    } finally {
      copy.document.Dispose();
    }
  } finally {
    filter.Close();
    document.Dispose();
  }
});

it("rejects a primary export when the saved generation became stale or cancelled", /** Covers live fallback checks between raw XML and metadata capture. @returns Completion. */ async () => {
  const document = new SwDoc();
  const input = { document, title: "Stale" };
  const filter = new WriterPrimaryOdtFilterService();
  try {
    const inflight = filter.ExportXml(input, {
      isCurrent: /** Rejects the invalidated document generation. @returns Whether current. */ () =>
        false,
    });
    await expect(inflight).rejects.toEqual(
      new OdtFilterError("stale", "ODT export result is stale."),
    );
    const controller = new AbortController();
    const pending = filter.ExportXml(input, { signal: controller.signal });
    controller.abort();
    await expect(pending).rejects.toMatchObject({ category: "cancelled" });
  } finally {
    filter.Close();
    document.Dispose();
  }
});
