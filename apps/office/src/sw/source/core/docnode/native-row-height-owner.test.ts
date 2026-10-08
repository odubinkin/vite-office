/** @fileoverview Verifies represented minimum-row-height document ownership without upstream dependencies. */
import {
  nativeRowFormatForTest,
  rowKeepTogetherForTest,
} from "../../../../test/table-row-test-helpers";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { expect, it, vi } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwCursor, SwTableCursor } from "../crsr/swcrsr";
import { SwPosition } from "../crsr/pam";
/** Requires an original owner. @param value - Possible owner. @returns Original owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing row height owner");
  return value;
}
/** Authors differing original row attributes and a current middle-row cursor. @returns Original graph. */
function fixture() {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Height", { layoutSplit: false });
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  for (const minHeight of [undefined, 400, 0])
    doc.nodes.AppendTableRow(
      table,
      2,
      nativeRowFormatForTest({
        frameSize:
          minHeight === undefined
            ? undefined
            : new SwFormatFrameSize(SwFrameSize.Minimum, 0, minHeight),
        keepTogether: true,
      }),
    );
  const rows = [...table.GetTabLines()],
    node = required(required(required(rows[1]).GetTabBoxes()[0]).GetParagraphs()[0]);
  node.SetText("middle");
  const position = new SwPosition(node, 2),
    cursor = new SwCursor(position);
  position.Dispose();
  return { doc, table, rows, node, cursor };
}
it("document minimum height ignores ordinary mark and ring and records same-value history", /** Checks actual native current scope and document notification ownership. @returns Nothing. */ () => {
  const f = fixture(),
    ring = f.cursor.Create(f.cursor),
    notify = vi.spyOn(f.doc, "NotifyModelChange");
  f.cursor.SetMark();
  f.cursor
    .GetMark()
    .Assign(required(required(required(f.rows[2]).GetTabBoxes()[1]).GetParagraphs()[0]), 0);
  ring
    .GetPoint()
    .Assign(required(required(required(f.rows[0]).GetTabBoxes()[0]).GetParagraphs()[0]), 0);
  const point = f.cursor.GetPoint(),
    mark = f.cursor.GetMark(),
    count = f.doc.GetUndoManager().GetUndoActionCount(),
    revision = f.doc.GetDocumentStateManager().GetModelRevision();
  expect(SwDoc.GetRowHeight(f.cursor)?.GetHeight()).toBe(400);
  expect(f.doc.SetRowHeight(f.cursor, new SwFormatFrameSize(SwFrameSize.Minimum, 0, 720))).toBe(
    true,
  );
  expect(
    f.rows.map(
      /** Reads original row heights. @param row - Native row. @returns Stored height. */ (row) =>
        row.GetFormat().frameSize?.GetHeight(),
    ),
  ).toEqual([undefined, 720, 0]);
  expect(f.doc.SetRowHeight(f.cursor, new SwFormatFrameSize(SwFrameSize.Minimum, 0, 720))).toBe(
    true,
  );
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(count + 2);
  expect(f.doc.GetDocumentStateManager().GetModelRevision()).toBe(revision + 2);
  expect(notify).toHaveBeenCalledTimes(2);
  expect(
    f.rows.map(
      /** Reads unrelated row items. @param row - Native row. @returns Stored flag. */ (row) =>
        rowKeepTogetherForTest(row.GetFormat()),
    ),
  ).toEqual([true, true, true]);
  expect(f.table.GetFormat().layoutSplit).toBe(false);
  expect(f.cursor.GetPoint()).toBe(point);
  expect(f.cursor.GetMark()).toBe(mark);
  expect(point.GetNode()).toBe(f.node);
  expect(point.GetContentIndex()).toBe(2);
  ring.Dispose();
  f.cursor.Dispose();
});
it("document minimum-height getter retains zero defaults and mixed or empty no-item", /** Checks native selected rows collected once and independent row flags. @returns Nothing. */ () => {
  const f = fixture(),
    selected = new SwTableCursor(f.cursor.GetPoint());
  selected.InsertBox(required(required(f.rows[0]).GetTabBoxes()[0]));
  selected.InsertBox(required(required(f.rows[0]).GetTabBoxes()[1]));
  selected.InsertBox(required(required(f.rows[2]).GetTabBoxes()[0]));
  expect(SwDoc.GetRowHeight(selected)).toBeUndefined();
  expect(f.doc.SetRowHeight(selected, new SwFormatFrameSize(SwFrameSize.Minimum, 0, 900))).toBe(
    true,
  );
  expect(
    f.rows.map(
      /** Reads actual selected heights. @param row - Native row. @returns Height. */ (row) =>
        row.GetFormat().frameSize?.GetHeight(),
    ),
  ).toEqual([900, 400, 900]);
  expect(SwDoc.GetRowHeight(selected)?.GetHeight()).toBe(900);
  selected.InsertBox(required(required(f.rows[1]).GetTabBoxes()[0]));
  expect(SwDoc.GetRowHeight(selected)).toBeUndefined();
  expect(f.doc.SetRowHeight(selected, new SwFormatFrameSize(SwFrameSize.Minimum, 0, 500))).toBe(
    true,
  );
  expect(SwDoc.GetRowHeight(selected)?.GetHeight()).toBe(500);
  selected.ActualizeSelection([]);
  expect(SwDoc.GetRowHeight(selected)).toBeUndefined();
  const count = f.doc.GetUndoManager().GetUndoActionCount();
  expect(f.doc.SetRowHeight(selected, new SwFormatFrameSize(SwFrameSize.Minimum, 0, 200))).toBe(
    false,
  );
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(count);
  selected.Dispose();
  f.cursor.Dispose();
});
it("document minimum height refuses foreign, removed, outside and disconnected owners before history", /** Checks admission against actual document graph. @returns Nothing. */ () => {
  const f = fixture(),
    foreign = fixture(),
    count = f.doc.GetUndoManager().GetUndoActionCount();
  expect(
    f.doc.SetRowHeight(foreign.cursor, new SwFormatFrameSize(SwFrameSize.Minimum, 0, 700)),
  ).toBe(false);
  const row = required(f.rows[1]);
  f.table.RemoveLine(row);
  expect(f.doc.SetRowHeight(f.cursor, new SwFormatFrameSize(SwFrameSize.Minimum, 0, 700))).toBe(
    false,
  );
  expect(SwDoc.GetRowHeight(f.cursor)).toBeUndefined();
  f.table.AddLine(row);
  f.cursor.GetPoint().Assign(required(f.doc.paragraphs[0]), 0);
  expect(SwDoc.GetRowHeight(f.cursor)).toBeUndefined();
  expect(f.doc.SetRowHeight(f.cursor, new SwFormatFrameSize(SwFrameSize.Minimum, 0, 700))).toBe(
    false,
  );
  f.doc.nodes.MakeTextNode("Following");
  f.doc.nodes.DeleteTable(f.table.GetTableNode());
  const position = new SwPosition(f.node, 0),
    disconnected = new SwCursor(position);
  position.Dispose();
  expect(f.doc.SetRowHeight(disconnected, new SwFormatFrameSize(SwFrameSize.Minimum, 0, 700))).toBe(
    false,
  );
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(count);
  disconnected.Dispose();
  f.cursor.Dispose();
  foreign.cursor.Dispose();
});
