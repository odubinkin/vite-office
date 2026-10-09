/** @fileoverview Verifies a direct Writer table-import callback defaults to a single grid column. */
import { expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwXMLTableImport } from "./xmltbli";

it("imports a single-column cell when no column span is supplied", /** Checks native row cardinality and owned box width. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    const importer = new SwXMLTableImport(doc);
    importer.registerTableStyle("column", { family: "table-column", columnWidth: 1440 });
    importer.beginTable("Defaults", "");
    importer.addTableColumn("column");
    importer.beginTableRow("");
    importer.beginTableCell("");
    importer.endTableCell();
    importer.endTableRow();
    importer.endTable();
    const table = doc.GetTables()[0];
    expect(table?.GetName()).toBe("Defaults");
    const boxes = table?.GetTabLines()[0]?.GetTabBoxes();
    expect(boxes).toHaveLength(1);
    expect(boxes?.[0]?.GetFrameFormat().GetFrameSize().GetWidth()).toBe(1440);
  } finally {
    doc.Dispose();
  }
});
