/** @fileoverview Checks independent native uint16 headline ownership and explicit transport boundaries. */
import { expect, it } from "vitest";
import { createWriterDocument } from "../doc/doc";
import { SwTabFrame, SwRowFrame, SwCellFrame } from "../layout/tabfrm";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { writeOdtDocument } from "../../filter/xml/wrtxml";
import { readOdtDocument } from "../../filter/xml/swxml";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
/** Requires an original native owner. @param value - Optional owner. @returns Original owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing native headline counter owner");
  return value;
}
it("default member survives an empty table, original rows and complete geometry replacement", /** Checks source default independently of actual line count and frame items. @returns Nothing. */ () => {
  const doc = createWriterDocument(),
    table = doc.nodes.MakeTableNode("NativeDefault");
  expect(table.GetRowsToRepeat()).toBe(0);
  expect(table.GetFormat()).toEqual({ headerRows: 1, repeatHeaderRows: true });
  const row = doc.nodes.AppendTableRow(table, 1),
    box = required(row.GetTabBoxes()[0]),
    node = required(box.GetParagraphs()[0]);
  expect(table.GetRowsToRepeat()).toBe(1);
  const frame = new SwTabFrame(table),
    physicalRow = frame.Lower() as SwRowFrame,
    physicalCell = physicalRow.Lower() as SwCellFrame,
    format = table.GetFrameFormat();
  try {
    table.SetRowsToRepeat(7);
    table.SetFormat({ width: 4000 });
    expect(table.GetFormat()).toEqual({ width: 4000, headerRows: 7, repeatHeaderRows: true });
    expect(table.GetRowsToRepeat()).toBe(1);
    for (let index = 0; index < 7; index++) doc.nodes.AppendTableRow(table, 1);
    expect(table.GetRowsToRepeat()).toBe(7);
    table.SetFormat({});
    expect(table.GetRowsToRepeat()).toBe(7);
    expect(table.GetFrameFormat()).toBe(format);
    expect(table.GetTableNode().GetTable()).toBe(table);
    expect(table.GetTabLines()[0]).toBe(row);
    expect(row.GetTabBoxes()[0]).toBe(box);
    expect(box.GetParagraphs()[0]).toBe(node);
    expect(physicalRow.GetTabLine()).toBe(row);
    expect(physicalCell.GetTabBox()).toBe(box);
    expect(physicalCell.GetFormat()).toBe(box.GetFrameFormat());
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  } finally {
    frame.DestroyImpl();
  }
});
it.each([
  [65538, 2],
  [-1, 65535],
  [65536, 0],
  [0, 0],
] as const)(
  "native assignment stores uint16 %s as %s before rows exist",
  /** Checks uncapped assignment and later native getter. @param authored - Input integer. @param stored - Native uint16. @returns Nothing. */ (
    authored,
    stored,
  ) => {
    const doc = createWriterDocument(),
      table = doc.nodes.MakeTableNode("Unsigned");
    table.SetRowsToRepeat(authored);
    expect(table.GetRowsToRepeat()).toBe(0);
    expect(table.GetFormat()).toEqual({ headerRows: stored, repeatHeaderRows: stored !== 0 });
    for (let index = 0; index < 3; index++) doc.nodes.AppendTableRow(table, 1);
    expect(table.GetRowsToRepeat()).toBe(Math.min(3, stored));
  },
);
it.each([
  [{ headerRows: 2 }, 2],
  [{ headerRows: 9, repeatHeaderRows: false }, 0],
  [{ repeatHeaderRows: true }, 1],
  [{ repeatHeaderRows: false }, 0],
  [{ headerRows: 0, repeatHeaderRows: true }, 0],
  [{ headerRows: 65538, repeatHeaderRows: true }, 2],
] as const)(
  "explicit construction ingress %j owns count %s",
  /** Checks the admitted transport boundary and detached projection. @param input - Construction values. @param count - Native member. @returns Nothing. */ (
    input,
    count,
  ) => {
    const doc = createWriterDocument(),
      table = doc.nodes.MakeTableNode("Ingress", input);
    for (let index = 0; index < 3; index++) doc.nodes.AppendTableRow(table, 1);
    expect(table.GetRowsToRepeat()).toBe(count);
    const projection = { ...table.GetFormat() };
    projection.headerRows = 45;
    projection.repeatHeaderRows = true;
    expect(table.GetRowsToRepeat()).toBe(count);
    table.SetFormat({ width: 6000, repeatHeaderRows: true });
    expect(table.GetRowsToRepeat()).toBe(count);
    table.SetFormat({ width: 4000, headerRows: 2 });
    expect(table.GetRowsToRepeat()).toBe(2);
  },
);
it.each([0, 1, 9])(
  "explicit model snapshot retains stored count %s while ODT writes actual repeated rows",
  /** Checks real transport and packages without reference dependency. @param count - Stored member. @returns Completion. */ async (
    count,
  ) => {
    const doc = createWriterDocument(),
      table = doc.nodes.MakeTableNode("Transport", { width: 3000 });
    table.AddColumnWidth(3000);
    for (let index = 0; index < 3; index++)
      required(doc.nodes.AppendTableRow(table, 1).GetTabBoxes()[0]?.GetParagraphs()[0]).SetText(
        "Owner" + index,
      );
    table.SetRowsToRepeat(count);
    const record = encodeWriterDocument(doc),
      decoded = decodeWriterDocument(record),
      copied = required(decoded.GetTables()[0]);
    expect(copied).not.toBe(table);
    expect(copied.GetFormat().headerRows).toBe(count);
    expect(copied.GetRowsToRepeat()).toBe(Math.min(count, 3));
    const metadata = { title: "Native headline counter" },
      bytes = writeOdtDocument(doc, metadata),
      xml = await new ZipFile(bytes).readTextEntry("content.xml");
    expect(xml.includes("<table:table-header-rows>")).toBe(count !== 0);
    const opened = await readOdtDocument(bytes, metadata),
      reopened = required(opened.document.GetTables()[0]);
    expect(reopened.GetRowsToRepeat()).toBe(Math.min(count, 3));
    expect(reopened.GetFormat().headerRows).toBe(Math.min(count, 3));
    expect(table.GetFormat().headerRows).toBe(count);
    expect(table.GetTabLines()).toHaveLength(3);
    expect(reopened.GetTabLines()).toHaveLength(3);
  },
);
