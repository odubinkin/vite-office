/** @fileoverview Checks native solitary Shift linear table border movement. */
import { afterEach, expect, it, vi } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwDocShell } from "../app/docsh";
import { SwWrtShell } from "../wrtsh/wrtsh1";
import { SwEditWin } from "./edtwin";
import { SwTabFrame } from "../../core/layout/tabfrm";
import { KEY_SHIFT, KEY_MOD1, KEY_MOD2, KEY_MOD3 } from "../../../../vcl/keycodes";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { writeOdtDocument } from "../../filter/xml/wrtxml";
import { readOdtDocument } from "../../filter/xml/swxml";
const shells: SwWrtShell[] = [];
afterEach(
  /** Releases native cursors after tracking tests. @returns Nothing. */ () => {
    for (const shell of shells.splice(0)) shell.Close();
    vi.restoreAllMocks();
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
it.each([
  { start: 200, end: 220, expected: [1800, 1500, 1200] },
  { start: 200, end: 180, expected: [1200, 1500, 1800] },
  { start: 200, end: 270, expected: [2550, 1500, 450] },
  { start: 200, end: 1000, expected: [4275, 150, 75] },
  { start: 200, end: -1000, expected: [75, 1500, 2925] },
  { start: 300, end: 320, expected: [1500, 1800, 1200] },
])(
  "solitary Shift linear border $start to $end",
  /** Checks literal source limits and translated native widths. @param profile - Expected geometry. @returns Nothing. */ (
    profile,
  ) => {
    const f = fixture(),
      cursor = f.shell.CaptureCursorState();
    expect(f.edit.MouseButtonDown({ x: profile.start, y: 125 }, 0, 1, KEY_SHIFT)).toBe(true);
    f.edit.MouseMove({ x: profile.end, y: 700 });
    expect(f.table.GetColumnWidths()).toEqual([1500, 1500, 1500]);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    f.edit.MouseButtonUp();
    expect(f.table.GetColumnWidths()).toEqual(profile.expected);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    expect(f.shell.CaptureCursorState().point).toEqual(cursor.point);
  },
);
it("linear preview derives each move from the original and retains graph through history and ODT", /** Checks no accumulated deltas and original document ownership. @returns Completion. */ async () => {
  const f = fixture(),
    rows = [...f.table.GetTabLines()],
    owner = f.node.GetNumRule(),
    cursor = f.shell.CaptureCursorState();
  expect(f.edit.MouseButtonDown({ x: 203, y: 125 }, 0, 1, KEY_SHIFT)).toBe(true);
  f.edit.MouseMove({ x: 223, y: 125 });
  expect(f.edit.GetTableColumnDragPosition()).toBe(220);
  f.edit.MouseMove({ x: 183, y: 125 });
  expect(f.edit.GetTableColumnDragPosition()).toBe(180);
  f.edit.MouseButtonUp(false, { x: 233, y: 125 });
  expect(f.table.GetColumnWidths()).toEqual([1950, 1500, 1050]);
  for (let cycle = 0; cycle < 3; cycle++) {
    expect(f.shell.Undo()).toBe(true);
    expect(f.table.GetColumnWidths()).toEqual([1500, 1500, 1500]);
    expect(f.shell.Redo()).toBe(true);
    expect(f.table.GetColumnWidths()).toEqual([1950, 1500, 1050]);
    expect(f.table.GetTabLines()[0]).toBe(rows[0]);
    expect(rows[0]?.GetTabBoxes()[0]).toBe(f.boxes[0]);
    expect(f.boxes[0]?.GetParagraphs()[0]).toBe(f.node);
    expect(f.shell.CaptureCursorState().point).toEqual(cursor.point);
  }
  expect(f.node.GetNumRule()).toBe(owner);
  expect(f.node.GetListId()).toBe("drag-list");
  expect(f.node.GetText()).toBe("Cell");
  const reopened = await readOdtDocument(writeOdtDocument(f.doc, { title: "Linear" }), {
    title: "Linear",
  });
  expect(reopened.document.GetTables()[0]?.GetColumnWidths()).toEqual([1950, 1500, 1050]);
});
it.each([
  0,
  KEY_SHIFT | KEY_MOD1,
  KEY_SHIFT | KEY_MOD2,
  KEY_SHIFT | KEY_MOD3,
  KEY_SHIFT | KEY_MOD1 | KEY_MOD2,
])(
  "exact Shift selection excludes combined mask %s",
  /** Ensures other masks cannot select solitary Shift, without claiming other native modes. @param modifier - Input mask. @returns Nothing. */ (
    modifier,
  ) => {
    const f = fixture();
    f.edit.MouseButtonDown({ x: 200, y: 125 }, 0, 1, modifier);
    f.edit.MouseButtonUp(false, { x: 220, y: 125 });
    expect(f.table.GetColumnWidths()).toEqual([1800, 1200, 1500]);
  },
);
it.each([100, 400])(
  "Shift outer margin %s retains represented ordinary margin tracking",
  /** Checks margins are not misclassified as internal borders. @param x - Original margin. @returns Nothing. */ (
    x,
  ) => {
    const f = fixture();
    f.edit.MouseButtonDown({ x, y: 125 }, 0, 1, KEY_SHIFT);
    f.edit.MouseButtonUp(false, { x: x + 20, y: 125 });
    expect(f.table.GetColumnWidths()).toEqual(x === 100 ? [1200, 1500, 1500] : [1500, 1500, 1800]);
  },
);
it("Shift is ignored by horizontal row dragging", /** Checks source row normalization and row-height ownership. @returns Nothing. */ () => {
  const f = fixture();
  expect(f.edit.MouseButtonDown({ x: 150, y: 150 }, 0, 1, KEY_SHIFT)).toBe(true);
  f.edit.MouseMove({ x: 900, y: 170 });
  expect(f.edit.GetTableRowDragPosition()).toBe(170);
  f.edit.MouseButtonUp();
  expect(f.rows[0]?.GetFrameSize().GetHeight()).toBe(1050);
  expect(f.table.GetColumnWidths()).toEqual([1500, 1500, 1500]);
});
it("hidden following separators translate but do not contribute to visible-border limits", /** Checks the source reverse loop includes hidden entries. @returns Nothing. */ () => {
  const f = fixture(),
    read = f.shell.GetMouseTabCols.bind(f.shell);
  vi.spyOn(f.shell, "GetMouseTabCols").mockImplementation(
    /** Adds a device visibility constraint to the actual native carrier. @param columns - Native output. @param point - Device hit. @returns Admission. */ (
      columns,
      point,
    ) => {
      const result = read(columns, point);
      columns.SetHidden(1, true);
      return result;
    },
  );
  f.edit.MouseButtonDown({ x: 200, y: 125 }, 0, 1, KEY_SHIFT);
  f.edit.MouseMove({ x: 220, y: 125 });
  f.edit.MouseButtonUp();
  expect(f.table.GetColumnWidths()).toEqual([1800, 1500, 1200]);
});
it("cancelled or unchanged linear tracking creates no history", /** Checks capture cleanup and unchanged acceptance. @returns Nothing. */ () => {
  const f = fixture();
  f.edit.MouseButtonDown({ x: 200, y: 125 }, 0, 1, KEY_SHIFT);
  f.edit.MouseMove({ x: 220, y: 125 });
  f.edit.MouseButtonUp(true);
  expect(f.edit.GetTableColumnDragPosition()).toBeUndefined();
  expect(f.table.GetColumnWidths()).toEqual([1500, 1500, 1500]);
  f.edit.MouseButtonDown({ x: 200, y: 125 }, 0, 1, KEY_SHIFT);
  f.edit.MouseButtonUp();
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});
