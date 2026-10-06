/** @fileoverview Verifies native mouse separator tracking, deferred history and unchanged cursor/list owners. */
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
  /** Releases native cursors after tracking tests. @returns Nothing. */ () => {
    for (const shell of shells.splice(0)) shell.Close();
  },
);
/** Requires an actual connected owner. @param value - Optional native owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing mouse column owner");
  return value;
}
/** Creates literal native geometry at100% device scale. @param widths - Actual column widths. @returns Shared owners and measured frames. */
function fixture(widths = [1500, 1500, 1500]) {
  const doc = new SwDoc(),
    body = required(doc.paragraphs[0]),
    table = doc.nodes.MakeTableNode(
      "Drag",
      {
        width: widths.reduce(
          /** Sums authored fixture geometry. @param sum - Total. @param width - Actual width. @returns New total. */ (
            sum,
            width,
          ) => sum + width,
          0,
        ),
        horiOrient: HoriOrientation.LEFT,
      },
      body,
    );
  for (const width of widths) table.AddColumnWidth(width);
  for (let row = 0; row < 2; row++) doc.nodes.AppendTableRow(table, widths.length);
  const rows = [...table.GetTabLines()],
    boxes = rows.flatMap(
      /** Retains actual boxes. @param row - Native row. @returns Original boxes. */ (row) =>
        row.GetTabBoxes(),
    ),
    node = required(required(boxes[0]).GetParagraphs()[0]);
  node.SetText("Cell");
  doc.EnsureNumRule("Numbering", "numbered");
  node.SetNumRule("Numbering");
  node.SetListId("drag-list");
  const shell = new SwWrtShell(
      new SwDocShell(doc, createDocument({ id: "column-drag", suiteId: "writer", title: "Drag" })),
    ),
    edit = new SwEditWin(shell);
  shells.push(shell);
  edit.SetSelection({ point: { nodeIndex: body.GetIndex(), contentIndex: 0 } });
  const total =
    widths.reduce(
      /** Sums physical fixture widths. @param sum - Total. @param width - Column. @returns Sum. */ (
        sum,
        width,
      ) => sum + width,
      0,
    ) / 15;
  const cells = boxes.map(
    /** Supplies literal device geometry over original boxes. @param box - Native box. @param index - Flat fixture index. @returns Measured cell. */ (
      box,
      index,
    ) => {
      const column = index % widths.length,
        left =
          100 +
          widths
            .slice(0, column)
            .reduce(
              /** Sums preceding fixture widths. @param sum - Total. @param width - Column. @returns Sum. */ (
                sum,
                width,
              ) => sum + width,
              0,
            ) /
            15,
        top = 100 + Math.floor(index / widths.length) * 50;
      return {
        box,
        rect: { left, right: left + required(widths[column]) / 15, top, bottom: top + 50 },
      };
    },
  );
  const frame = new SwTabFrame(table, {
    rect: { left: 100, right: 100 + total, top: 100, bottom: 200 },
    cells,
  });
  edit.SetTableMouseFrames([frame]);
  return { doc, body, table, rows, boxes, node, shell, edit, frame, cells };
}
it("native border drag preserves the outside-table cursor, list and original graph through3 undo cycles", /** Checks source position-based ingress and deferred history. @returns Completion. */ async () => {
  const f = fixture(),
    cursor = f.shell.CaptureCursorState(),
    before = [...f.table.GetColumnWidths()];
  expect(f.edit.MouseButtonDown({ x: 203, y: 125 })).toBe(true);
  expect(f.edit.GetTableColumnDragPosition()).toBe(200);
  expect(f.edit.MouseMove({ x: 223, y: 125 })).toBe(true);
  expect(f.edit.GetTableColumnDragPosition()).toBe(220);
  expect(f.table.GetColumnWidths()).toEqual(before);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  expect(f.edit.MouseButtonUp(false, { x: 233, y: 125 })).toBe(true);
  expect(f.table.GetColumnWidths()).toEqual([1950, 1050, 1500]);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  expect(f.shell.CaptureCursorState().point).toEqual(cursor.point);
  for (let cycle = 0; cycle < 3; cycle++) {
    expect(f.shell.Undo()).toBe(true);
    expect(f.table.GetColumnWidths()).toEqual(before);
    expect(f.shell.Redo()).toBe(true);
    expect(f.table.GetColumnWidths()).toEqual([1950, 1050, 1500]);
    expect(f.table.GetTabLines()[0]).toBe(f.rows[0]);
    expect(required(f.rows[0]).GetTabBoxes()[0]).toBe(f.boxes[0]);
    expect(required(f.boxes[0]).GetParagraphs()[0]).toBe(f.node);
    expect(f.shell.CaptureCursorState().point).toEqual(cursor.point);
  }
  expect(f.edit.SetSelection({ point: { nodeIndex: f.node.GetIndex(), contentIndex: 2 } })).toBe(
    true,
  );
  expect(f.edit.InsertText("X")).toBe(true);
  expect(f.node.GetText()).toBe("CeXll");
  expect(f.node.GetListId()).toBe("drag-list");
  expect(f.node.GetNumRuleName()).toBe("Numbering");
  const reopened = await readOdtDocument(writeOdtDocument(f.doc, { title: "Drag" }), {
    title: "Drag",
  });
  expect(required(reopened.document.GetTables()[0]).GetColumnWidths()).toEqual([1950, 1050, 1500]);
});
it.each([
  [200, -1000, [75, 2925, 1500]],
  [200, 1000, [2925, 75, 1500]],
  [100, 120, [1200, 1500, 1500]],
  [400, 420, [1500, 1500, 1800]],
])(
  "native separator %s clamps or resizes at %s",
  /** Checks literal native5px minima and edge policy. @param start - Device edge. @param end - End X. @param expected - Actual twips. @returns Nothing. */ (
    start,
    end,
    expected,
  ) => {
    const f = fixture();
    expect(f.edit.MouseButtonDown({ x: start, y: 125 })).toBe(true);
    f.edit.MouseMove({ x: end, y: 1000 });
    f.edit.MouseButtonUp();
    expect(f.table.GetColumnWidths()).toEqual(expected);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  },
);
it.each([true, false])(
  "native one-column outer-edge geometry cancelled=%s",
  /** Checks one-column limits and cancellation. @param cancelled - Source cancellation. @returns Nothing. */ (
    cancelled,
  ) => {
    const f = fixture([1500]);
    f.edit.MouseButtonDown({ x: 100, y: 125 });
    f.edit.MouseMove({ x: 110, y: 125 });
    f.edit.MouseButtonUp(cancelled);
    expect(f.table.GetColumnWidths()).toEqual(cancelled ? [1500] : [1350]);
    if (!cancelled) {
      f.edit.SetTableMouseFrames([
        new SwTabFrame(f.table, {
          rect: { left: 110, right: 200, top: 100, bottom: 200 },
          cells: f.cells.map(
            /** Refreshes the actual fixture frame after its accepted left-edge change. @param cell - Original measured cell. @returns Current device frame. */
            (cell) => ({ ...cell, rect: { ...cell.rect, left: 110 } }),
          ),
        }),
      ]);
    }
    f.edit.MouseButtonDown({ x: 200, y: 125 });
    f.edit.MouseMove({ x: 220, y: 125 });
    f.edit.MouseButtonUp(cancelled);
    expect(f.table.GetColumnWidths()).toEqual(cancelled ? [1500] : [1650]);
  },
);
it("native no-motion and cancelled releases leave no history and reject stale motion", /** Checks draft-only ownership. @returns Nothing. */ () => {
  const f = fixture();
  expect(f.edit.GetTableColumnDragPosition()).toBeUndefined();
  expect(f.edit.MouseButtonUp()).toBe(false);
  f.edit.MouseButtonDown({ x: 204, y: 125 });
  f.edit.MouseButtonUp(false, { x: 204, y: 125 });
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  f.edit.MouseButtonDown({ x: 200, y: 125 });
  f.edit.MouseMove({ x: 260, y: 125 });
  f.edit.MouseButtonUp(true, { x: 280, y: 125 });
  expect(f.table.GetColumnWidths()).toEqual([1500, 1500, 1500]);
  expect(f.edit.MouseMove({ x: 300, y: 125 })).toBe(false);
  expect(f.edit.GetTableColumnDragPosition()).toBeUndefined();
});
it("native guards reject row borders, table-selection mode, right/double and detached frame release", /** Checks actual admission and document ownership. @returns Nothing. */ () => {
  const f = fixture(),
    empty = new SwTabCols();
  expect(f.shell.GetMouseTabCols(empty, { x: 0, y: 0 })).toBe(false);
  expect(f.shell.SetMouseTabCols(empty, false, { x: 0, y: 0 })).toBe(false);
  expect(f.shell.GetMouseTabCols(empty, { x: 250, y: 150 })).toBe(false);
  expect(f.shell.SetMouseTabCols(empty, false, { x: 250, y: 150 })).toBe(false);
  expect(f.edit.RulerColumnDrag({ x: 0, y: 0 })).toBe(false);
  expect(f.edit.RulerColumnDrag({ x: 250, y: 150 })).toBe(false);
  expect(f.edit.MouseButtonDown({ x: 200, y: 125 }, 2)).toBe(false);
  expect(f.edit.MouseButtonDown({ x: 200, y: 125 }, 0, 2)).toBe(false);
  f.edit.SetSelection({ point: { nodeIndex: f.node.GetIndex(), contentIndex: 0 } });
  f.shell.SelectTable();
  expect(f.edit.MouseButtonDown({ x: 200, y: 125 })).toBe(false);
  f.shell.EnterStdMode();
  f.edit.MouseButtonDown({ x: 200, y: 125 });
  f.edit.MouseMove({ x: 220, y: 125 });
  f.edit.SetTableMouseFrames([]);
  expect(f.edit.MouseButtonUp()).toBe(true);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});
it("native mouse ingress rejects per-row and missing cell content before history", /** Checks bounded position ingress with actual native frames. @returns Nothing. */ () => {
  const f = fixture(),
    cols = new SwTabCols();
  expect(f.shell.GetMouseTabCols(cols, { x: 200, y: 125 })).toBe(true);
  expect(f.shell.SetMouseTabCols(cols, true, { x: 200, y: 125 })).toBe(false);
  vi.spyOn(required(f.boxes[0]), "GetParagraphs").mockReturnValue([]);
  expect(f.shell.SetMouseTabCols(cols, false, { x: 200, y: 125 })).toBe(false);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});
it("native ruler rejects a measured separator inconsistent with the current flat print geometry", /** Checks transient browser layout mismatches without choosing an unrelated separator. @returns Nothing. */ () => {
  const f = fixture();
  required(f.cells[0]).rect.right = 180;
  required(f.cells[1]).rect.left = 180;
  expect(f.edit.RulerColumnDrag({ x: 180, y: 125 })).toBe(false);
  expect(f.edit.GetTableColumnDragPosition()).toBeUndefined();
});

it("native tracking rejects hidden and disconnected carrier ingress without history", /** Checks a hidden separator contract without claiming a hidden row graph. @returns Nothing. */ () => {
  const f = fixture(),
    read = f.shell.GetMouseTabCols.bind(f.shell);
  vi.spyOn(f.shell, "GetMouseTabCols").mockImplementation(
    /** Simulates a carrier flag declared by native SwTabCols at the existing protocol boundary. @param cols - Actual carrier. @param point - Actual hit. @returns Admission. */
    (cols, point) => {
      const admitted = read(cols, point);
      for (let i = 0; i < cols.Count(); i++) cols.SetHidden(i, true);
      return admitted;
    },
  );
  expect(f.edit.RulerColumnDrag({ x: 200, y: 125 })).toBe(false);
  vi.restoreAllMocks();
  vi.spyOn(f.shell, "GetMouseTabCols").mockReturnValue(false);
  expect(f.edit.RulerColumnDrag({ x: 200, y: 125 })).toBe(false);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});
