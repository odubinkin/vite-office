/** @fileoverview Verifies original SwTableWidthDlg draft, visible-column bounds, live Apply and document history/ODT. */
import { afterEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { SwPosition } from "../../core/crsr/pam";
import { SwTableWidthDlg } from "./colwd";
import { SwTableFUNC } from "../../uibase/table/tablemgr";
import { writeOdtDocument } from "../../filter/xml/wrtxml";
import { readOdtDocument } from "../../filter/xml/swxml";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Closes original native owners. @returns Nothing. */ () => {
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Creates original independent column geometry and cursor position. @param current - Initial column. @param widths - Native widths. @returns Actual owners. */
function fixture(current = 0, widths = [1000, 2000, 3000]) {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const shell = session.view.GetWrtShell(),
    doc = shell.GetDoc(),
    table = doc.nodes.MakeTableNode("Column dialog", {
      horiOrient: HoriOrientation.LEFT,
      width: widths.reduce(
        /** Adds authored widths. @param sum - Previous width. @param width - Current width. @returns Total. */ (
          sum,
          width,
        ) => sum + width,
        0,
      ),
    });
  for (const width of widths) table.AddColumnWidth(width);
  doc.nodes.AppendTableRow(table, widths.length);
  const node = table.GetTabLines()[0]?.GetTabBoxes()[current]?.GetParagraphs()[0];
  if (!node) throw new Error("Missing column dialog fixture cell");
  const position = new SwPosition(node, 0);
  shell.SetCursor(position);
  position.Dispose();
  doc.GetUndoManager().Clear();
  return { session, shell, doc, table };
}
it.each([
  [0, 1, 1000, 2977],
  [1, 2, 2000, 5954],
  [2, 3, 3000, 4977],
])(
  "initializes the actual visible column=%i",
  /** Checks original selector and construction-time geometry without model mutation. @param current - Native current column. @param column - One-based selection. @param width - Twips. @param maximum - Native maximum. @returns Nothing. */ (
    current,
    column,
    width,
    maximum,
  ) => {
    const f = fixture(current),
      before = f.shell.CaptureCursorState(),
      draft = new SwTableWidthDlg(f.shell);
    expect([draft.columnCount, draft.column, draft.width, draft.minimum, draft.maximum]).toEqual([
      3,
      column,
      width,
      23,
      maximum,
    ]);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    expect(f.shell.CaptureCursorState()).toEqual(before);
    draft.SetWidth(900);
    expect(f.table.GetColumnWidths()).toEqual([1000, 2000, 3000]);
    draft.LoseFocusHdl(2);
    expect(draft.width).toBe(2000);
    expect(draft.maximum).toBe(5954);
    draft.SetWidth(0);
    expect(draft.width).toBe(23);
    draft.SetWidth(100000);
    expect(draft.width).toBe(5954);
    draft.LoseFocusHdl(99);
    expect(draft.column).toBe(3);
    draft.LoseFocusHdl(0);
    expect(draft.column).toBe(1);
  },
);
it("reinitializes separators at Apply while retaining the original numeric draft and cursor", /** Checks actual concurrent geometry change and history without an authored table snapshot. @returns Completion. */ async () => {
  const f = fixture(),
    draft = new SwTableWidthDlg(f.shell),
    cursor = f.shell.CaptureCursorState();
  draft.LoseFocusHdl(2);
  draft.SetWidth(2500);
  const live = new SwTableFUNC(f.shell);
  live.InitTabCols();
  live.SetColWidth(0, 1200);
  expect(f.table.GetColumnWidths()).toEqual([1200, 1800, 3000]);
  f.doc.GetUndoManager().Clear();
  expect(draft.Apply()).toBe(true);
  expect(f.table.GetColumnWidths()).toEqual([1200, 2500, 2300]);
  expect(f.shell.CaptureCursorState()).toEqual(cursor);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  expect(f.shell.Undo()).toBe(true);
  expect(f.table.GetColumnWidths()).toEqual([1200, 1800, 3000]);
  expect(f.shell.Redo()).toBe(true);
  expect(f.table.GetColumnWidths()).toEqual([1200, 2500, 2300]);
  const opened = await readOdtDocument(
    await writeOdtDocument(f.doc, f.session.docShell.GetDocumentState()),
    { title: "Column dialog" },
  );
  try {
    expect(opened.document.GetTables()[0]?.GetColumnWidths()).toEqual([1200, 2500, 2300]);
  } finally {
    opened.document.Dispose();
  }
});
it("locks the source single-column field to its reported native width", /** Checks identical native lower and upper bounds. @returns Nothing. */ () => {
  const f = fixture(0, [6000]),
    draft = new SwTableWidthDlg(f.shell);
  expect([draft.columnCount, draft.column, draft.minimum, draft.maximum, draft.width]).toEqual([
    1, 1, 6000, 6000, 6000,
  ]);
  draft.SetWidth(3000);
  expect(draft.width).toBe(6000);
  draft.SetWidth(9000);
  expect(draft.width).toBe(6000);
  expect(draft.Apply()).toBe(true);
  expect(f.table.GetColumnWidths()).toEqual([6000]);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
});
it("preserves a large native uint16 accepted width inside the actual geometry bound", /** Checks source narrowing at the actual Apply boundary on wide geometry. @returns Nothing. */ () => {
  const f = fixture(0, [40000, 40000]),
    draft = new SwTableWidthDlg(f.shell);
  draft.SetWidth(65000);
  expect(draft.width).toBe(65000);
  expect(draft.Apply()).toBe(true);
  expect(f.table.GetColumnWidths()).toEqual([65000, 535]);
});

it.each([
  [1, 1400, [1400, 1600, 3000]],
  [3, 4500, [1000, 500, 4500]],
] as const)(
  "applies native edge-column sizing through real separators column=%i",
  /** Checks both directional edge adjustments on actual table owners. @param column - One-based selection. @param width - Accepted twips. @param expected - Native intervals. @returns Nothing. */ (
    column,
    width,
    expected,
  ) => {
    const f = fixture(),
      draft = new SwTableWidthDlg(f.shell);
    draft.LoseFocusHdl(column);
    draft.SetWidth(width);
    expect(draft.Apply()).toBe(true);
    expect(f.table.GetColumnWidths()).toEqual(expected);
    expect(f.shell.Undo()).toBe(true);
    expect(f.table.GetColumnWidths()).toEqual([1000, 2000, 3000]);
    expect(f.shell.Redo()).toBe(true);
    expect(f.table.GetColumnWidths()).toEqual(expected);
  },
);
