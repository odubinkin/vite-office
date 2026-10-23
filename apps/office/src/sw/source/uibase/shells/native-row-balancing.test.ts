/** @fileoverview Verifies native row balancing on actual registered frame geometry, history and source two-pass layout completion. */
import { afterEach, expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SwPosition } from "../../core/crsr/pam";
import { SwRowFrame, SwTabFrame } from "../../core/layout/tabfrm";
import { writeOdtDocument } from "../../filter/xml/wrtxml";
import { readOdtDocument } from "../../filter/xml/swxml";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases native views after probes. @returns Nothing. */ () => {
    vi.restoreAllMocks();
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Requires a source owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing row balancing owner");
  return value;
}
/** Builds original row formats and real root-owned frames from independent device content heights. @param heights - Authored native heights. @param natural - Device content heights. @param type - Original size mode. @returns Original owners and current geometry port. */
function fixture(heights = [900, 300, 600], natural = [240, 240, 240], type = SwFrameSize.Fixed) {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const shell = session.view.GetWrtShell(),
    doc = shell.GetDoc(),
    table = doc.nodes.MakeTableNode("Balance", { width: 6000 });
  table.AddColumnWidth(6000);
  for (const height of heights)
    doc.nodes.AppendTableRow(table, 1, { frameSize: new SwFormatFrameSize(type, 0, height) });
  const node = required(required(table.GetTabLines()[0]).GetTabBoxes()[0]).GetParagraphs()[0],
    point = new SwPosition(required(node), 0);
  shell.SetCursor(point);
  point.Dispose();
  const root = shell.GetLayout(),
    layout = root.Format(
      [],
      doc.GetPageDesc().GetValue(),
      undefined,
      doc.GetLineNumberInfo().QueryValue(),
      0,
      [{ tableName: "Balance", rowHeights: natural }],
    );
  const frame = required(layout.tableFrames[0]),
    rows: SwRowFrame[] = [];
  for (let row = frame.Lower(); row !== undefined; row = row.GetNext())
    rows.push(row as SwRowFrame);
  doc.GetUndoManager().Clear();
  /** Reads actual authored item values. @returns Native mode/height pairs. */
  function sizes() {
    return table
      .GetTabLines()
      .map(
        /** Reads original row attributes. @param row - Actual row. @returns Pair. */ (row) => [
          row.GetFrameSize().GetHeightSizeType(),
          row.GetFrameSize().GetHeight(),
        ],
      );
  }
  return { session, view: session.view, shell, doc, table, root, frame, rows, sizes };
}
it("publishes physical and print heights on original rows while test-only state remains read-only", /** Checks source geometry rather than browser command arguments. @returns Nothing. */ () => {
  const f = fixture(),
    areas = f.rows.map(
      /** Borrows original native areas. @param row - Actual row frame. @returns Area identity. */ (
        row,
      ) => row.getFrameArea(),
    );
  expect(
    f.rows.map(
      /** Reads published physical heights. @param row - Original frame. @returns Twips. */ (row) =>
        row.getFrameArea().Height(),
    ),
  ).toEqual([900, 300, 600]);
  for (const row of f.rows)
    expect(row.getFramePrintArea().Height()).toBe(row.getFrameArea().Height());
  expect(f.view.QueryState(".uno:DistributeRows").enabled).toBe(false);
  f.shell.SelTable();
  const cursor = f.shell.CaptureCursorState(),
    revision = f.doc.GetDocumentStateManager().GetModelRevision(),
    calc = vi.spyOn(f.root, "Calc");
  expect(f.view.QueryState(".uno:DistributeRows").enabled).toBe(true);
  expect(f.view.QueryState(".uno:SetOptimalRowHeight").enabled).toBe(true);
  expect(calc).not.toHaveBeenCalled();
  expect(f.doc.GetDocumentStateManager().GetModelRevision()).toBe(revision);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  expect(f.shell.CaptureCursorState()).toEqual(cursor);
  expect(
    f.rows.map(
      /** Reads stable area owners. @param row - Original frame. @returns Area identity. */ (row) =>
        row.getFrameArea(),
    ),
  ).toEqual(areas);
});
it("distributes the maximum across every registered native frame client and preserves original row owners", /** Checks native iterator semantics across independent layouts and original history. @returns Nothing. */ () => {
  const f = fixture([900, 300, 600], [240, 240, 240], SwFrameSize.Minimum),
    extra = new SwRowFrame(required(f.table.GetTabLines()[1]));
  extra.Format(1200);
  f.shell.SelTable();
  const cursor = f.shell.CaptureCursorState();
  try {
    expect(f.view.Execute(".uno:DistributeRows")).toMatchObject({
      status: "executed",
      value: true,
    });
    expect(f.sizes()).toEqual([
      [SwFrameSize.Minimum, 1200],
      [SwFrameSize.Minimum, 1200],
      [SwFrameSize.Minimum, 1200],
    ]);
    expect(
      f.rows.map(
        /** Reads recalculated source areas. @param row - Original frame. @returns Twips. */ (
          row,
        ) => row.getFrameArea().Height(),
      ),
    ).toEqual([1200, 1200, 1200]);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    expect(f.shell.CaptureCursorState()).toEqual(cursor);
    expect(f.shell.Undo()).toBe(true);
    expect(f.sizes()).toEqual([
      [SwFrameSize.Minimum, 900],
      [SwFrameSize.Minimum, 300],
      [SwFrameSize.Minimum, 600],
    ]);
    expect(f.shell.Redo()).toBe(true);
    expect(f.sizes()[0]).toEqual([SwFrameSize.Minimum, 1200]);
    expect(f.frame.Lower()).toBe(f.rows[0]);
  } finally {
    extra.DestroyImpl();
  }
});
it.each([
  [240, 600],
  [1000, 1000],
])(
  "retains native mean then maximum ordering with natural last-row content=%i",
  /** Checks real shell layout completion between source command passes. @param naturalLast - Device content height. @param result - Expected source final height. @returns Completion. */ async (
    naturalLast,
    result,
  ) => {
    const f = fixture([900, 300, 600], [240, 240, naturalLast]);
    f.shell.SelTable();
    const before = f.shell.CaptureCursorState();
    expect(f.view.Execute(".uno:SetOptimalRowHeight")).toMatchObject({ value: true });
    expect(f.sizes()).toEqual([
      [SwFrameSize.Minimum, result],
      [SwFrameSize.Minimum, result],
      [SwFrameSize.Minimum, result],
    ]);
    expect(
      f.rows.map(
        /** Reads actual second-pass geometry. @param row - Source row frame. @returns Twips. */ (
          row,
        ) => row.getFrameArea().Height(),
      ),
    ).toEqual([result, result, result]);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(2);
    expect(f.shell.CaptureCursorState()).toEqual(before);
    expect(f.shell.Undo()).toBe(true);
    expect(f.sizes()).toEqual([
      [SwFrameSize.Minimum, 600],
      [SwFrameSize.Minimum, 600],
      [SwFrameSize.Minimum, 600],
    ]);
    expect(f.shell.Undo()).toBe(true);
    expect(f.sizes()).toEqual([
      [SwFrameSize.Fixed, 900],
      [SwFrameSize.Fixed, 300],
      [SwFrameSize.Fixed, 600],
    ]);
    expect(f.shell.Redo()).toBe(true);
    expect(f.shell.Redo()).toBe(true);
    const opened = await readOdtDocument(
      await writeOdtDocument(f.doc, f.session.docShell.GetDocumentState()),
      { title: "Balance" },
    );
    try {
      expect(
        opened.document
          .GetTables()[0]
          ?.GetTabLines()
          .map(
            /** Reads reopened native items. @param row - Imported row. @returns Height. */ (row) =>
              row.GetFrameSize().GetHeight(),
          ),
      ).toEqual([result, result, result]);
    } finally {
      opened.document.Dispose();
    }
  },
);
it("does not expand ordinary marks and rejects foreign or body cursors", /** Checks source row selection admission independently of table rings. @returns Nothing. */ () => {
  const f = fixture();
  const cursor = f.shell.getShellCursor();
  cursor.SetMark();
  cursor
    .GetMark()
    .Assign(
      required(required(required(f.table.GetTabLines()[2]).GetTabBoxes()[0]).GetParagraphs()[0]),
      0,
    );
  expect(f.shell.BalanceRowHeight(true)).toBe(false);
  expect(f.shell.BalanceRowHeight(false)).toBe(false);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  const foreign = fixture();
  expect(f.doc.BalanceRowHeight(foreign.shell.getShellCursor(), true)).toBe(false);
  const body = new SwPosition(required(f.doc.paragraphs[0]), 0);
  f.shell.SetCursor(body);
  body.Dispose();
  expect(f.shell.BalanceRowHeight(true)).toBe(false);
  expect(f.view.QueryState(".uno:SetOptimalRowHeight").enabled).toBe(false);
});
it("retains native signed-total overflow followed by unsigned size_t division", /** Checks the source64 arithmetic contract before original row attributes consume it. @returns Nothing. */ () => {
  const f = fixture([0, 0], [0, 0], SwFrameSize.Variable),
    frame = new SwTabFrame(f.table);
  try {
    let row = frame.Lower() as SwRowFrame | undefined;
    while (row) {
      row.Format(1073741824);
      row = row.GetNext() as SwRowFrame | undefined;
    }
    f.shell.SelTable();
    expect(f.doc.BalanceRowHeight(f.shell.getShellCursor(), false, true)).toBe(true);
    const expected = Number((2n ** 64n - 2147483648n) / 2n);
    expect(f.sizes()).toEqual([
      [SwFrameSize.Minimum, expected],
      [SwFrameSize.Minimum, expected],
    ]);
  } finally {
    frame.DestroyImpl();
  }
});

it("applies source balancing with undo disabled without inventing history", /** Checks original undo-manager admission independently of source mutations. @returns Nothing. */ () => {
  const f = fixture();
  f.shell.SelTable();
  f.doc.GetUndoManager().DoUndo(false);
  expect(f.shell.BalanceRowHeight(false)).toBe(true);
  expect(f.sizes()).toEqual([
    [SwFrameSize.Minimum, 900],
    [SwFrameSize.Minimum, 900],
    [SwFrameSize.Minimum, 900],
  ]);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});

it("completes an ordinary row-height action before immediate balancing reads its geometry", /** Checks native SetRowHeight EndAllAction ordering without a browser render. @returns Nothing. */ () => {
  const f = fixture();
  f.shell.SelTable();
  expect(f.shell.SetRowHeight(new SwFormatFrameSize(SwFrameSize.Fixed, 0, 1200))).toBe(true);
  expect(
    f.rows.map(
      /** Reads original areas at the completed action boundary. @param row - Native row frame. @returns Twips. */ (
        row,
      ) => row.getFrameArea().Height(),
    ),
  ).toEqual([1200, 1200, 1200]);
  expect(f.shell.BalanceRowHeight(false)).toBe(true);
  expect(f.sizes()).toEqual([
    [SwFrameSize.Minimum, 1200],
    [SwFrameSize.Minimum, 1200],
    [SwFrameSize.Minimum, 1200],
  ]);
});
