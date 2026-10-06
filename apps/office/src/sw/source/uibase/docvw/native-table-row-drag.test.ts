/** @fileoverview Verifies row-border capture over the native document, shell, cursor and attribute history. */
import { afterEach, expect, it, vi } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwDocShell } from "../app/docsh";
import { SwWrtShell } from "../wrtsh/wrtsh1";
import { SwEditWin } from "./edtwin";
import { SwTabFrame } from "../../core/layout/tabfrm";
import { SwTabCols } from "../../core/bastyp/tabcol";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { writeOdtDocument } from "../../filter/xml/wrtxml";
import { readOdtDocument } from "../../filter/xml/swxml";
const shells: SwWrtShell[] = [];
afterEach(
  /** Releases retained native cursor owners. @returns Nothing. */ () => {
    for (const shell of shells.splice(0)) shell.Close();
    vi.restoreAllMocks();
  },
);
/** Requires a native owner. @param value - Optional owner. @returns Actual owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native row owner");
  return value;
}
/** Builds independent literal native print geometry. @param count - Actual row count. @returns Native graph. */
function geometryFixture(count = 3) {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode(
      "Rows",
      { width: 3000, horiOrient: HoriOrientation.LEFT },
      doc.paragraphs[0],
    );
  table.AddColumnWidth(1500);
  table.AddColumnWidth(1500);
  for (let r = 0; r < count; r++) doc.nodes.AppendTableRow(table, 2);
  const lines = [...table.GetTabLines()],
    start = required(required(lines[0]).GetTabBoxes()[0]);
  const cells = lines.flatMap(
    /** Measures original row boxes. @param line - Original row. @param r - Row index. @returns Physical boxes. */
    (line, r) =>
      line.GetTabBoxes().map(
        /** Supplies independent device coordinates. @param box - Original box. @param c - Column. @returns Physical cell. */
        (box, c) => ({
          box,
          rect: {
            left: 100 + c * 100,
            right: 200 + c * 100,
            top: 100 + r * 50,
            bottom: 150 + r * 50,
          },
        }),
      ),
  );
  const geometry = {
      rect: { left: 100, right: 300, top: 100, bottom: 100 + count * 50 },
      cells,
      pageTop: 20,
      hasFollowFlowLine: false,
    },
    frame = new SwTabFrame(table, geometry);
  return { doc, table, lines, start, cells, geometry, frame };
}

/** Adds the actual native shell and an outside-table cursor. @param count - Original rows. @returns Shared graph and capture. */
function fixture(count = 3) {
  const f = geometryFixture(count),
    body = required(f.doc.paragraphs[0]),
    node = required(f.start.GetParagraphs()[0]);
  node.SetText("Cell");
  f.doc.EnsureNumRule("Numbering", "numbered");
  node.SetNumRule("Numbering");
  node.SetListId("row-list");
  const shell = new SwWrtShell(
      new SwDocShell(f.doc, createDocument({ id: "rows", suiteId: "writer", title: "Rows" })),
    ),
    edit = new SwEditWin(shell);
  shells.push(shell);
  edit.SetTableMouseFrames([f.frame]);
  edit.SetSelection({ point: { nodeIndex: body.GetIndex(), contentIndex: 0 } });
  return { ...f, shell, edit, node, body };
}
it("native row drag shifts following borders and preserves cursor/list/box graph through3UndoRedo and ODT", /** Checks source default tracking and actual attribute history. @returns Completion. */ async () => {
  const f = fixture(),
    cursor = f.shell.CaptureCursorState(),
    boxes = f.lines.map(
      /** Retains each row's actual box. @param line - Original row. @returns Actual first box. */ (
        line,
      ) => line.GetTabBoxes()[0],
    );
  expect(f.edit.MouseButtonDown({ x: 150, y: 153 })).toBe(true);
  expect(f.edit.GetTableRowDragPosition()).toBe(150);
  expect(f.edit.GetTableColumnDragPosition()).toBeUndefined();
  expect(f.edit.MouseMove({ x: 1000, y: 173 })).toBe(true);
  expect(f.edit.GetTableBorderDragPosition()).toEqual({ axis: "row", position: 170 });
  expect(
    f.lines.map(
      /** Reads retained row formats. @param line - Original row. @returns Minimum. */ (line) =>
        line.GetFormat().minHeight,
    ),
  ).toEqual([undefined, undefined, undefined]);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  f.edit.MouseButtonUp(false, { x: 0, y: 183 });
  expect(required(f.lines[0]).GetFormat().minHeight).toBe(1200);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  expect(f.shell.CaptureCursorState().point).toEqual(cursor.point);
  for (let cycle = 0; cycle < 3; cycle++) {
    expect(f.shell.Undo()).toBe(true);
    expect(required(f.lines[0]).GetFormat().minHeight).toBeUndefined();
    expect(f.shell.Redo()).toBe(true);
    expect(required(f.lines[0]).GetFormat().minHeight).toBe(1200);
    for (let r = 0; r < 3; r++) {
      expect(f.table.GetTabLines()[r]).toBe(f.lines[r]);
      expect(required(f.lines[r]).GetTabBoxes()[0]).toBe(boxes[r]);
    }
    expect(f.start.GetParagraphs()[0]).toBe(f.node);
    expect(f.shell.CaptureCursorState().point).toEqual(cursor.point);
  }
  f.edit.SetSelection({ point: { nodeIndex: f.node.GetIndex(), contentIndex: 2 } });
  f.edit.InsertText("X");
  expect(f.node.GetText()).toBe("CeXll");
  expect(f.node.GetListId()).toBe("row-list");
  expect(f.node.GetNumRuleName()).toBe("Numbering");
  const reopened = await readOdtDocument(writeOdtDocument(f.doc, { title: "Rows" }), {
    title: "Rows",
  });
  expect(
    required(required(reopened.document.GetTables()[0]).GetTabLines()[0]).GetFormat().minHeight,
  ).toBe(1200);
});
it.each([
  [150, -1000, 75, 0],
  [150, 170, 1050, 0],
  [200, 185, 525, 1],
  [250, 275, 1125, 2],
])(
  "native row boundary%s to%s obeys source minimum and following-row policy",
  /** Checks literal twip results. @param from - Initial Y. @param to - Final Y. @param height - Expected height. @param row - Actual line. @returns Nothing. */
  (from, to, height, row) => {
    const f = fixture();
    expect(f.edit.MouseButtonDown({ x: 150, y: from })).toBe(true);
    f.edit.MouseMove({ x: 1000, y: to });
    f.edit.MouseButtonUp();
    expect(required(f.lines[row]).GetFormat().minHeight).toBe(height);
  },
);
it.each([true, false])(
  "native single row bottom cancelled=%s",
  /** Checks zero-separator source carrier. @param cancel - Cancellation. @returns Nothing. */ (
    cancel,
  ) => {
    const f = fixture(1);
    expect(f.edit.MouseButtonDown({ x: 150, y: 150 })).toBe(true);
    f.edit.MouseMove({ x: 0, y: 175 });
    f.edit.MouseButtonUp(cancel);
    expect(required(f.lines[0]).GetFormat().minHeight).toBe(cancel ? undefined : 1125);
  },
);
it("native current-cell row ingress retains actual cursor and no-cell guards", /** Checks all native current and mouse ingress routes. @returns Nothing. */ () => {
  const f = fixture(),
    rows = new SwTabCols();
  expect(f.shell.GetTabRows(rows)).toBe(false);
  expect(f.shell.SetTabRows(rows, false)).toBe(false);
  f.edit.SetSelection({ point: { nodeIndex: f.node.GetIndex(), contentIndex: 1 } });
  expect(f.shell.GetTabRows(rows)).toBe(true);
  for (let i = 0; i < rows.Count(); i++) rows.GetEntry(i).nPos += 150;
  rows.SetRight(2400);
  expect(f.shell.SetTabRows(rows, false)).toBe(true);
  expect(f.shell.CaptureCursorState().point.offset).toBe(1);
  expect(f.shell.GetMouseTabRows(rows, { x: 0, y: 0 })).toBe(false);
  expect(f.shell.SetMouseTabRows(rows, false, { x: 0, y: 0 })).toBe(false);
  expect(f.shell.GetMouseTabRows(rows, { x: 200, y: 125 })).toBe(false);
  expect(f.shell.SetMouseTabRows(rows, false, { x: 200, y: 125 })).toBe(false);
});
it("native row capture rejects top/column/right/double/table-mode/follow/detached and tiny no-op", /** Checks source admission and cancellation cleanup. @returns Nothing. */ () => {
  const f = fixture(),
    read = f.shell.GetMouseTabRows.bind(f.shell);
  expect(f.edit.GetTableRowDragPosition()).toBeUndefined();
  expect(f.edit.RulerRowDrag({ x: 0, y: 0 })).toBe(false);
  expect(f.edit.RulerRowDrag({ x: 200, y: 125 })).toBe(false);
  expect(f.edit.RulerRowDrag({ x: 150, y: 100 })).toBe(false);
  expect(f.edit.MouseButtonDown({ x: 150, y: 150 }, 2)).toBe(false);
  expect(f.edit.MouseButtonDown({ x: 150, y: 150 }, 0, 2)).toBe(false);
  f.edit.SetSelection({ point: { nodeIndex: f.node.GetIndex(), contentIndex: 0 } });
  f.shell.SelectTable();
  expect(f.edit.MouseButtonDown({ x: 150, y: 150 })).toBe(false);
  f.shell.EnterStdMode();
  f.geometry.hasFollowFlowLine = true;
  expect(f.edit.RulerRowDrag({ x: 150, y: 250 })).toBe(false);
  f.geometry.hasFollowFlowLine = false;
  vi.spyOn(f.shell, "GetMouseTabRows").mockImplementation(
    /** Tests the actual carrier protocol hidden separator. @param rows - Actual carrier. @param point - Real hit. @returns Admission. */ (
      rows,
      point,
    ) => {
      const ok = read(rows, point);
      rows.SetHidden(0, true);
      return ok;
    },
  );
  expect(f.edit.RulerRowDrag({ x: 150, y: 150 })).toBe(false);
  vi.restoreAllMocks();
  vi.spyOn(f.shell, "GetMouseTabRows").mockReturnValue(false);
  expect(f.edit.RulerRowDrag({ x: 150, y: 150 })).toBe(false);
  vi.restoreAllMocks();
  f.edit.MouseButtonDown({ x: 150, y: 150 });
  f.edit.MouseButtonUp(false, { x: 150, y: 151 });
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  f.edit.MouseButtonDown({ x: 150, y: 150 });
  f.edit.MouseButtonUp();
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  f.edit.MouseButtonDown({ x: 150, y: 150 });
  f.edit.MouseMove({ x: 150, y: 180 });
  f.edit.MouseButtonUp(true, { x: 150, y: 190 });
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  f.edit.MouseButtonDown({ x: 150, y: 150 });
  f.edit.MouseMove({ x: 150, y: 170 });
  f.edit.SetTableMouseFrames([]);
  expect(f.edit.MouseButtonUp()).toBe(true);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});

it("native current-row queries reject a retained table frame whose device geometry is unavailable", /** Checks device frame lifetime without a cursor move or height draft. @returns Nothing. */ () => {
  const f = fixture(),
    rows = new SwTabCols();
  f.edit.SetSelection({ point: { nodeIndex: f.node.GetIndex(), contentIndex: 1 } });
  const cursor = f.shell.CaptureCursorState();
  f.edit.SetTableMouseFrames([new SwTabFrame(f.table)]);
  expect(f.shell.GetTabRows(rows)).toBe(false);
  expect(f.shell.SetTabRows(rows, false)).toBe(false);
  expect(f.shell.CaptureCursorState().point).toEqual(cursor.point);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});
