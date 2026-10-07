/** @fileoverview Verifies native document border ownership and point/mark union scope over original cells. */
import {
  nativeBoxFormat,
  tableBorderItems,
  tableBoxFormatForTest,
} from "../../../../test/table-box-test-helpers";
import { expect, it, vi } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwPosition } from "../crsr/pam";
import { SwCursor, SwTableCursor } from "../crsr/swcrsr";
import { SwFormatVertOrient } from "../../../inc/fmtornt";

/** Requires an actual native owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing border owner");
  return value;
}
/** Builds independent cell formats in a flat native table. @returns Original owners. */
function fixture() {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Union");
  for (let column = 0; column < 3; column++) table.AddColumnWidth(2000);
  const boxes = [];
  for (let row = 0; row < 3; row++)
    for (const box of doc.nodes.AppendTableRow(table, 3).GetTabBoxes()) {
      box.SetFormat(
        nativeBoxFormat({
          border: "1pt solid #112233",
          padding: 80 + boxes.length,
          vertOrient: new SwFormatVertOrient(720, 3, 7),
        }),
      );
      required(box.GetParagraphs()[0]).SetText("Original " + boxes.length);
      boxes.push(box);
    }
  const nodes = boxes.map(
    /** Reads original cell text. @param box - Native box. @returns Original node. */
    (box) => required(box.GetParagraphs()[0]),
  );
  return { doc, table, boxes, nodes };
}
it("ordinary direct border application affects only the current cell and records one same-value history action", /** Checks document-owned admission, preserved independent attributes and source history policy. @returns Nothing. */ () => {
  const f = fixture(),
    node = required(f.nodes[4]),
    cursor = new SwCursor(new SwPosition(node, 2)),
    revision = f.doc.GetDocumentStateManager().GetModelRevision();
  expect(f.doc.SetTabBorders(cursor, tableBorderItems(f.doc, { border: "none" }, cursor))).toBe(
    true,
  );
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  expect(f.doc.GetDocumentStateManager().GetModelRevision()).toBe(revision + 1);
  for (const [index, box] of f.boxes.entries()) {
    expect(tableBoxFormatForTest(box.GetFormat()).border).toBe(
      index === 4 ? "none" : "1pt solid #112233",
    );
    expect(tableBoxFormatForTest(box.GetFormat()).padding).toBe(80 + index);
    expect(box.GetVertOrient()).toEqual(new SwFormatVertOrient(720, 3, 7));
  }
  expect(f.doc.SetTabBorders(cursor, tableBorderItems(f.doc, { border: "none" }, cursor))).toBe(
    true,
  );
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(2);
  expect(cursor.GetPoint().GetNode()).toBe(node);
  expect(cursor.GetPoint().GetContentIndex()).toBe(2);
  expect(cursor.HasMark()).toBe(false);
  cursor.Dispose();
});
for (const reverse of [false, true])
  for (const tableCursor of [false, true])
    it(`native point/mark rectangle ignores ordinary rings and unrelated selected-box lists reverse=${reverse} table=${tableCursor}`, /** Checks endpoint union, including intermediate boxes and reversed range. @returns Nothing. */ () => {
      const f = fixture(),
        point = required(f.nodes[reverse ? 8 : 4]),
        mark = required(f.nodes[reverse ? 4 : 8]),
        cursor = tableCursor
          ? new SwTableCursor(new SwPosition(point, 2))
          : new SwCursor(new SwPosition(point, 2)),
        ring = new SwCursor(new SwPosition(required(f.nodes[0]), 1), undefined, cursor);
      cursor.SetMark();
      cursor.GetMark().Assign(mark, 3);
      if (cursor instanceof SwTableCursor) cursor.ActualizeSelection([required(f.boxes[0])]);
      expect(f.doc.SetTabBorders(cursor, tableBorderItems(f.doc, { padding: 0 }, cursor))).toBe(
        true,
      );
      for (const [index, box] of f.boxes.entries()) {
        expect(tableBoxFormatForTest(box.GetFormat()).padding).toBe(
          [4, 5, 7, 8].includes(index) ? 0 : 80 + index,
        );
        expect(tableBoxFormatForTest(box.GetFormat()).border).toBe("1pt solid #112233");
        expect(box.GetParagraphs()[0]).toBe(f.nodes[index]);
      }
      expect(cursor.GetPoint().GetNode()).toBe(point);
      expect(cursor.GetMark().GetNode()).toBe(mark);
      ring.Dispose();
      cursor.Dispose();
    });
it("rejects non-content, body, foreign and disconnected document inputs without notification or history", /** Checks connected native document and table admission. @returns Nothing. */ () => {
  const f = fixture(),
    body = new SwCursor(new SwPosition(required(f.doc.paragraphs[0]))),
    nonContent = new SwCursor(new SwPosition(f.table.GetTableNode())),
    cursor = new SwCursor(new SwPosition(required(f.nodes[0]))),
    foreign = new SwDoc(),
    before = f.doc.GetDocumentStateManager().GetModelRevision();
  expect(f.doc.SetTabBorders(body, tableBorderItems(f.doc, { border: "none" }, body))).toBe(false);
  expect(
    f.doc.SetTabBorders(nonContent, tableBorderItems(f.doc, { border: "none" }, nonContent)),
  ).toBe(false);
  expect(foreign.SetTabBorders(cursor, tableBorderItems(foreign, { border: "none" }, cursor))).toBe(
    false,
  );
  const connected = vi.spyOn(f.doc, "GetTables").mockReturnValue([]);
  expect(f.doc.SetTabBorders(cursor, tableBorderItems(f.doc, { border: "none" }, cursor))).toBe(
    false,
  );
  connected.mockRestore();
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  expect(f.doc.GetDocumentStateManager().GetModelRevision()).toBe(before);
  body.Dispose();
  nonContent.Dispose();
  cursor.Dispose();
});
it("rejects body and cross-table marks and disconnected point or mark cells", /** Checks both endpoint admissions before constructing a selection union. @returns Nothing. */ () => {
  const f = fixture(),
    cursor = new SwCursor(new SwPosition(required(f.nodes[0]))),
    other = f.doc.nodes.MakeTableNode("Other");
  other.AddColumnWidth(2000);
  const otherBox = required(f.doc.nodes.AppendTableRow(other, 1).GetTabBoxes()[0]);
  cursor.SetMark();
  cursor.GetMark().Assign(required(f.doc.paragraphs[0]), 0);
  expect(f.doc.SetTabBorders(cursor, tableBorderItems(f.doc, { border: "none" }, cursor))).toBe(
    false,
  );
  cursor.GetMark().Assign(required(otherBox.GetParagraphs()[0]), 0);
  expect(f.doc.SetTabBorders(cursor, tableBorderItems(f.doc, { border: "none" }, cursor))).toBe(
    false,
  );
  cursor.GetMark().Assign(required(f.nodes[8]), 1);
  const last = required(f.table.GetTabLines()[2]),
    missing = required(f.boxes[8]);
  last.RemoveBox(missing);
  expect(f.doc.SetTabBorders(cursor, tableBorderItems(f.doc, { border: "none" }, cursor))).toBe(
    false,
  );
  last.AddBox(missing);
  required(f.table.GetTabLines()[0]).RemoveBox(required(f.boxes[0]));
  expect(f.doc.SetTabBorders(cursor, tableBorderItems(f.doc, { border: "none" }, cursor))).toBe(
    false,
  );
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  expect(tableBoxFormatForTest(required(f.boxes[4]).GetFormat()).border).toBe("1pt solid #112233");
  cursor.Dispose();
});
