/** @fileoverview Checks thin native border delegation, original cursor history and caller-selected table properties. */
import {
  nativeBoxFormat,
  tableBorderItems,
  tableBoxFormatForTest,
} from "../../../test/table-box-test-helpers";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
import { ItemSetToTableParam } from "../../source/uibase/shells/tabsh";
afterEach(cleanup);
/** Requires a native owner. @param value - Optional owner. @returns Original owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing border history owner");
  return value;
}
/** Creates the actual native UI graph. @returns Original owners. */
function fixture() {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell(),
    table = doc.nodes.MakeTableNode("History", { width: 6000 }, doc.paragraphs[0]);
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  const boxes = [];
  for (let row = 0; row < 2; row++)
    for (const box of doc.nodes.AppendTableRow(table, 2).GetTabBoxes()) {
      box.SetFormat(nativeBoxFormat({ border: "1pt solid #112233", padding: 150 }));
      required(box.GetParagraphs()[0]).SetText("Cell " + boxes.length);
      boxes.push(box);
    }
  const node = required(required(boxes[3]).GetParagraphs()[0]);
  shell.FocusNode(node);
  session.view
    .GetEditWin()
    .SetSelection({ point: { nodeIndex: node.GetIndex(), contentIndex: 3 } });
  return { session, doc, shell, table, boxes, node };
}
it("thin native shell forwards its actual cursor once and renders only the current cell change through repeated UndoRedo", /** Checks real publication, nonzero history and retained native graph. @returns Nothing. */ () => {
  const f = fixture();
  try {
    render(<WriterWorkbench isActive view={f.session.view} />);
    const original = f.shell.CaptureCursorState(),
      cursor = f.shell.getShellCursor(),
      setter = vi.spyOn(f.doc, "SetTabBorders"),
      changed = screen.getByRole("textbox", { name: "Row 2 column 2 paragraph 1" }).closest("td"),
      untouched = screen.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" }).closest("td");
    act(
      /** Publishes current cell borders to the actual mounted view. @returns Nothing. */ () => {
        expect(
          f.shell.SetTabBorders(
            tableBorderItems(
              f.shell.GetDoc(),
              { border: "none", padding: 0 },
              f.shell.GetCursor(false),
            ),
          ),
        ).toBe(true);
      },
    );
    expect(setter).toHaveBeenCalledExactlyOnceWith(
      cursor,
      tableBorderItems(f.doc, { border: "none", padding: 0 }, cursor),
      original,
    );
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    expect(changed).toHaveAttribute("data-writer-border-guide", "true");
    expect(changed).toHaveStyle({ padding: "0px" });
    expect(untouched).toHaveStyle({ padding: "10px", border: "1pt solid #112233" });
    for (let cycle = 0; cycle < 3; cycle++) {
      act(
        /** Publishes native undo to the actual mounted view. @returns Nothing. */ () => {
          expect(f.shell.Undo()).toBe(true);
        },
      );
      expect(changed).toHaveStyle({ padding: "10px", border: "1pt solid #112233" });
      expect(f.shell.CaptureCursorState().point).toEqual(original.point);
      act(
        /** Publishes native redo to the actual mounted view. @returns Nothing. */ () => {
          expect(f.shell.Redo()).toBe(true);
        },
      );
      expect(changed).toHaveStyle({ padding: "0px" });
      expect(untouched).toHaveStyle({ padding: "10px" });
      expect(f.shell.CaptureCursorState().point).toEqual(original.point);
      expect(required(f.boxes[3]).GetParagraphs()[0]).toBe(f.node);
      expect(f.node.GetText()).toBe("Cell 3");
    }
  } finally {
    f.session.Close();
  }
});
for (const selected of [false, true])
  it(`native table properties caller retains explicit selected or temporary whole table scope selected=${selected}`, /** Checks the existing properties caller keeps its distinct explicit scope and original cursor history. @returns Nothing. */ () => {
    const f = fixture();
    try {
      if (selected) f.shell.SelTableRowOrCol(true);
      const before = f.shell.CaptureCursorState(),
        cursor = f.shell.getShellCursor();
      expect(
        ItemSetToTableParam(f.shell, {
          width: 6000,
          columnWidths: [3000, 3000],
          headerRows: 0,
          repeatHeaderRows: false,
          padding: 0,
          border: "none",
        }),
      ).toBe(true);
      for (const [index, box] of f.boxes.entries()) {
        expect(tableBoxFormatForTest(box.GetFormat()).border).toBe(
          !selected || index >= 2 ? "none" : "1pt solid #112233",
        );
        expect(tableBoxFormatForTest(box.GetFormat()).padding).toBe(
          !selected || index >= 2 ? 0 : 150,
        );
      }
      expect(f.shell.IsTableMode()).toBe(selected);
      expect(f.shell.getShellCursor()).toBe(cursor);
      expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
      expect(f.shell.Undo()).toBe(true);
      expect(f.shell.CaptureCursorState().point).toEqual(before.point);
      expect(f.shell.Redo()).toBe(true);
      expect(f.shell.CaptureCursorState().point).toEqual(before.point);
    } finally {
      f.session.Close();
    }
  });
