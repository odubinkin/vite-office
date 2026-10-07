/** @fileoverview Verifies ODT numeric alignment and complete primitive box-item boundaries without upstream access. */
import { expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwFormatVertOrient } from "../../../inc/fmtornt";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { writeOdtDocument } from "./wrtxml";
import { readOdtDocument } from "./swxml";
/** Creates native item owners. @returns Native graph. */
function fixture() {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Orient");
  for (let c = 0; c < 4; c++) table.AddColumnWidth(1500);
  doc.nodes.AppendTableRow(table, 4, {}, [
    {},
    { vertOrient: new SwFormatVertOrient(0, 0) },
    { vertOrient: new SwFormatVertOrient(720, 2, 7) },
    { vertOrient: new SwFormatVertOrient(-720, 3, 9) },
  ]);
  return doc;
}
it("ODT maps native NONE/CENTER/BOTTOM and omits absent attributes", /** Checks independent reopened native literals. @returns Completion. */ async () => {
  const doc = fixture(),
    reopened = await readOdtDocument(writeOdtDocument(doc, { title: "Orientation" }), {
      title: "Orientation",
    }),
    boxes = reopened.document.GetTables()[0]?.GetTabLines()[0]?.GetTabBoxes();
  expect(
    boxes?.map(
      /** Reads literal orientation. @param box - Native cell. @returns Native ID. */ (box) =>
        box.GetVertOrient().GetVertOrient(),
    ),
  ).toEqual([0, 0, 2, 3]);
  expect(boxes?.[0]?.GetFormat().vertOrient).toBeUndefined();
});
it("codec transports all three native fields independently and accepts old scalar only at storage ingress", /** Checks structured process copies and legacy graph ingress. @returns Nothing. */ () => {
  const doc = fixture(),
    record = structuredClone(encodeWriterDocument(doc)),
    reopened = decodeWriterDocument(record),
    boxes = reopened.GetTables()[0]?.GetTabLines()[0]?.GetTabBoxes();
  expect(boxes?.[2]?.GetVertOrient()).toEqual(new SwFormatVertOrient(720, 2, 7));
  expect(boxes?.[3]?.GetVertOrient()).toEqual(new SwFormatVertOrient(-720, 3, 9));
  const legacy = JSON.parse(JSON.stringify(record));
  for (const [index, align] of ["top", "middle", "bottom"].entries())
    legacy.tables[0].rows[0].cells[index].format = { verticalAlign: align, padding: 44 };
  const restored = decodeWriterDocument(legacy).GetTables()[0]?.GetTabLines()[0]?.GetTabBoxes();
  expect(
    restored
      ?.slice(0, 3)
      .map(
        /** Reads legacy effective native values. @param box - Original cell. @returns Native orientation. */ (
          box,
        ) => box.GetVertOrient().GetVertOrient(),
      ),
  ).toEqual([0, 2, 3]);
  expect(restored?.[0]?.GetFormat()).not.toHaveProperty("verticalAlign");
});
it.each([
  null,
  { position: 0, orientation: "bad", relation: 1 },
  { position: 0, orientation: 2, relation: Infinity },
])(
  "rejects malformed native primitive box orientation %j",
  /** Checks guarded graph fields. @param value - Invalid primitive item. @returns Nothing. */ (
    value,
  ) => {
    const record = JSON.parse(JSON.stringify(encodeWriterDocument(fixture())));
    record.tables[0].rows[0].cells[0].format.vertOrient = value;
    expect(
      /** Decodes the malformed boundary item. @returns Native graph or schema failure. */ () =>
        decodeWriterDocument(record),
    ).toThrow("Stored Writer box orientation is invalid.");
  },
);

it("primitive native integer fields reject fractional and out-of-range values while preserving valid complete and legacy records", /** Checks native signed boundaries and untouched complete public values. @returns Nothing. */ () => {
  for (const invalid of [
    { position: 0.5, orientation: 2, relation: 1 },
    { position: 0, orientation: 2.5, relation: 1 },
    { position: 0, orientation: -32769, relation: 1 },
    { position: 0, orientation: 32768, relation: 1 },
    { position: 0, orientation: 2, relation: 1.5 },
    { position: 0, orientation: 2, relation: -32769 },
    { position: 0, orientation: 2, relation: 32768 },
  ]) {
    const record = JSON.parse(JSON.stringify(encodeWriterDocument(fixture())));
    record.tables[0].rows[0].cells[0].format.vertOrient = invalid;
    expect(
      /** Decodes a malformed native integer. @returns Native graph or failure. */ () =>
        decodeWriterDocument(record),
    ).toThrow("Stored Writer box orientation is invalid.");
  }
  const record = structuredClone(encodeWriterDocument(fixture())),
    doc = decodeWriterDocument(record);
  expect(doc.GetTables()[0]?.GetTabLines()[0]?.GetTabBoxes()[2]?.GetVertOrient()).toEqual(
    new SwFormatVertOrient(720, 2, 7),
  );
  const legacy = JSON.parse(JSON.stringify(record));
  legacy.tables[0].rows[0].cells[0].format = { verticalAlign: "bottom" };
  expect(
    decodeWriterDocument(legacy)
      .GetTables()[0]
      ?.GetTabLines()[0]
      ?.GetTabBoxes()[0]
      ?.GetVertOrient()
      .GetVertOrient(),
  ).toBe(3);
});
