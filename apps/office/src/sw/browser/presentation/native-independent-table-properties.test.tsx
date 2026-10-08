/** @fileoverview Mounted table properties use current-row native geometry and preserve hidden constraints. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
import { SwPosition } from "../../source/core/crsr/pam";
import { SwTableRep } from "../../source/uibase/table/swtablerep";
import { HoriOrientation as H } from "../../../offapi/com/sun/star/text/HoriOrientation";
import type { SwTable } from "../../source/core/table/swtable";
import * as tableShell from "../../source/uibase/shells/tabsh";
import { SfxItemSet } from "../../../svl/source/items/itemset";
import { FN_TABLE_REP } from "../../inc/cmdid";
import { SwPtrItem } from "../../source/uibase/utlui/uiitems";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases actual mounted sessions and method spies. @returns Nothing. */ () => {
    cleanup();
    vi.restoreAllMocks();
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Requires an actual fixture owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing independent table-properties owner");
  return value;
}
/** Reads original box geometry without a first-row width adapter. @param table - Native model. @returns All row widths. */
function widths(table: SwTable): number[][] {
  return table
    .GetTabLines()
    .map(
      /** Reads a native line. @param line - Original row. @returns Widths. */ (line) =>
        line
          .GetTabBoxes()
          .map(
            /** Reads an owned frame-size item. @param box - Cell. @returns Width. */ (box) =>
              box.GetFrameSize().GetWidth(),
          ),
    );
}
/** Builds independent rows and places the actual cursor in the requested row. @param row - Native current row. @returns Actual model and shell. */
function fixture(row = 1) {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell(),
    table = doc.nodes.MakeTableNode("IndependentProperties", { width: 6000, horiOrient: H.LEFT });
  table.AddColumnWidth(1000);
  table.AddColumnWidth(5000);
  const authored = [
    [1000, 5000],
    [1000, 1000, 4000],
    [4000, 2000],
  ];
  for (const [r, values] of authored.entries()) {
    const line = doc.nodes.AppendTableRow(table, values.length);
    for (const [column, box] of line.GetTabBoxes().entries()) {
      const size = box.GetFrameSize();
      size.SetWidth(required(values[column]));
      box.SetFrameSize(size);
      required(box.GetParagraphs()[0]).SetText("r" + r + "c" + column);
    }
  }
  const lines = [...table.GetTabLines()],
    boxes = lines.flatMap(
      /** Retains original box owners. @param line - Row. @returns Boxes. */ (line) => [
        ...line.GetTabBoxes(),
      ],
    ),
    node = required(required(required(lines[row]).GetTabBoxes().at(-1)).GetParagraphs()[0]);
  doc.EnsureNumRule("Numbering", "numbered");
  node.SetNumRule("Numbering");
  node.SetListId("independent-properties-list");
  const position = new SwPosition(node, 2);
  shell.SetCursor(position);
  position.Dispose();
  doc.GetUndoManager().Clear();
  const cursor = shell.CaptureCursorState();
  render(<WriterWorkbench isActive view={session.view} />);
  return { session, doc, table, shell, node, lines, boxes, cursor };
}
/** Opens the existing properties and Columns page. @returns Nothing. */
function openColumns(): void {
  fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
  fireEvent.click(screen.getByRole("tab", { name: "Columns" }));
}
it.each([
  [0, [1.76, 8.82]],
  [1, [1.76, 1.76, 7.06]],
  [2, [7.06, 3.53]],
] as const)(
  "mounted properties row%s displays its actual native visible columns",
  /** Checks current-row ingress and unchanged original geometry. @param row - Current row. @param expected - Literal centimeters. @returns Nothing. */ (
    row,
    expected,
  ) => {
    const f = fixture(row);
    openColumns();
    for (let i = 0; i < 5; i++) {
      const field = screen.getByRole("spinbutton", { name: "Column " + (i + 1) + " width (cm)" });
      if (i < expected.length) {
        expect(field).toBeEnabled();
        expect(field).toHaveValue(expected[i]);
      } else {
        expect(field).toBeDisabled();
        expect(field).toHaveValue(null);
      }
    }
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(widths(f.table)).toEqual([
      [1000, 5000],
      [1000, 1000, 4000],
      [4000, 2000],
    ]);
    expect(f.shell.CaptureCursorState()).toEqual(f.cursor);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  },
);
it("mounted independent column acceptance passes the native owner and only changes current row through history", /** Checks real UI edit, hidden constraint, unchanged other rows and original-owner Undo/Redo. @returns Nothing. */ () => {
  const f = fixture(),
    fill = vi.spyOn(SwTableRep.prototype, "FillTabCols"),
    setter = vi.spyOn(f.shell, "SetTabCols");
  openColumns();
  fireEvent.change(screen.getByRole("spinbutton", { name: "Column 1 width (cm)" }), {
    target: { value: "2.54" },
  });
  expect(widths(f.table)).toEqual([
    [1000, 5000],
    [1000, 1000, 4000],
    [4000, 2000],
  ]);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  expect(screen.queryByRole("dialog", { name: "Table Properties" })).toBeNull();
  expect(fill).toHaveBeenCalledOnce();
  const accepted = required(fill.mock.contexts[0]) as SwTableRep;
  expect(accepted).toBeInstanceOf(SwTableRep);
  expect([accepted.GetColCount(), accepted.GetAllColCount()]).toEqual([3, 4]);
  expect(accepted.columns).toEqual([
    { nWidth: 1440, bVisible: true },
    { nWidth: 560, bVisible: true },
    { nWidth: 2000, bVisible: false },
    { nWidth: 2000, bVisible: true },
  ]);
  expect(setter).toHaveBeenCalledOnce();
  expect(setter.mock.calls[0]?.[1]).toBe(true);
  const geometry = required(setter.mock.calls[0]?.[0]);
  expect([geometry.GetEntry(0).nPos, geometry.GetEntry(1).nPos, geometry.GetEntry(2).nPos]).toEqual(
    [1440, 2000, 4000],
  );
  expect([geometry.IsHidden(0), geometry.IsHidden(1), geometry.IsHidden(2)]).toEqual([
    false,
    false,
    true,
  ]);
  expect(widths(f.table)).toEqual([
    [1000, 5000],
    [1440, 560, 4000],
    [4000, 2000],
  ]);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  for (let cycle = 0; cycle < 3; cycle++) {
    act(
      /** Reverts original native geometry. @returns Nothing. */ () => {
        expect(f.shell.Undo()).toBe(true);
      },
    );
    expect(widths(f.table)).toEqual([
      [1000, 5000],
      [1000, 1000, 4000],
      [4000, 2000],
    ]);
    act(
      /** Reapplies original native geometry. @returns Nothing. */ () => {
        expect(f.shell.Redo()).toBe(true);
      },
    );
    expect(widths(f.table)).toEqual([
      [1000, 5000],
      [1440, 560, 4000],
      [4000, 2000],
    ]);
    expect(f.table.GetTabLines()).toEqual(f.lines);
    expect(f.table.GetTabLines()[1]).toBe(f.lines[1]);
    expect(
      f.table
        .GetTabLines()
        .flatMap(
          /** Reads original boxes. @param line - Native row. @returns Boxes. */ (line) =>
            line.GetTabBoxes(),
        ),
    ).toEqual(f.boxes);
    expect(required(f.lines[1]).GetTabBoxes()[2]?.GetParagraphs()[0]).toBe(f.node);
    expect(f.node.GetText()).toBe("r1c2");
    expect(f.node.GetListId()).toBe("independent-properties-list");
    expect(f.shell.CaptureCursorState()).toEqual(f.cursor);
  }
});
it("mounted independent Cancel discards changed native intervals and no-change OK skips separator application", /** Checks canceled and untouched source change gates. @returns Nothing. */ () => {
  const f = fixture(),
    setter = vi.spyOn(f.shell, "SetTabCols");
  openColumns();
  fireEvent.change(screen.getByRole("spinbutton", { name: "Column 3 width (cm)" }), {
    target: { value: "8" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(setter).not.toHaveBeenCalled();
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  openColumns();
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  expect(setter).not.toHaveBeenCalled();
  expect(widths(f.table)).toEqual([
    [1000, 5000],
    [1000, 1000, 4000],
    [4000, 2000],
  ]);
  expect(f.shell.CaptureCursorState()).toEqual(f.cursor);
});
it("mounted native width-only acceptance scales every independent row through frame history", /** Checks native owner ingress and frame-size notification without a column-change flag. @returns Nothing. */ () => {
  const f = fixture(),
    acceptance = vi.spyOn(tableShell, "ItemSetToTableParam"),
    setter = vi.spyOn(f.shell, "SetTabCols");
  fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
  fireEvent.change(screen.getByRole("spinbutton", { name: "Table width (cm)" }), {
    target: { value: "2.54" },
  });
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  expect(acceptance).toHaveBeenCalledOnce();
  const input = required(acceptance.mock.calls[0]?.[1]);
  expect(input).toBeInstanceOf(SfxItemSet);
  if (!(input instanceof SfxItemSet)) throw new Error("Missing native changed-item input");
  const accepted = (input.Get(FN_TABLE_REP) as SwPtrItem).GetValue() as SwTableRep;
  expect(accepted).toBeInstanceOf(SwTableRep);
  expect([accepted.width, accepted.GetColCount(), accepted.GetAllColCount()]).toEqual([1440, 3, 4]);
  expect([accepted.HasWidthChanged(), accepted.HasColsChanged()]).toEqual([true, false]);
  expect(setter).not.toHaveBeenCalled();
  expect(f.table.GetFormat().width).toBe(1440);
  expect(widths(f.table)).toEqual([
    [240, 1200],
    [240, 240, 960],
    [960, 480],
  ]);
  expect(screen.getByRole("table", { name: "IndependentProperties" })).toHaveStyle({
    width: "96px",
  });
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  for (let cycle = 0; cycle < 3; cycle++) {
    act(
      /** Reverts the native frame attribute. @returns Nothing. */ () => {
        expect(f.shell.Undo()).toBe(true);
      },
    );
    expect(widths(f.table)).toEqual([
      [1000, 5000],
      [1000, 1000, 4000],
      [4000, 2000],
    ]);
    act(
      /** Reapplies the native frame attribute. @returns Nothing. */ () => {
        expect(f.shell.Redo()).toBe(true);
      },
    );
    expect(widths(f.table)).toEqual([
      [240, 1200],
      [240, 240, 960],
      [960, 480],
    ]);
    expect(f.table.GetTabLines()[1]).toBe(f.lines[1]);
    expect(required(f.lines[1]).GetTabBoxes()[2]?.GetParagraphs()[0]).toBe(f.node);
    expect(f.node.GetText()).toBe("r1c2");
    expect(f.shell.CaptureCursorState()).toEqual(f.cursor);
  }
});
