/** @fileoverview Checks browser tables consume native horizontal print areas without replacing model owners. */
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { WriterEditableTable } from "./WriterEditableTable";
import { WriterViewProjection } from "../presentation/writer-view-projection";
import type { SwTableFormat } from "../../source/core/table/swtable";
import { SwPaM, SwPosition } from "../../source/core/crsr/pam";
import { createDocument } from "../../../sfx2/source/doc/objsh";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases actual DOM and native owners. @returns Nothing. */ () => {
    cleanup();
    for (const s of sessions.splice(0)) s.Close();
  },
);
/** Builds an original two-column native table. @param format - Authored values. @returns Native owners. */
function fixture(format: SwTableFormat) {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell(),
    body = doc.paragraphs[0];
  if (body === undefined) throw new Error("Missing body");
  body.SetText("Before");
  const table = doc.nodes.MakeTableNode("Geometry", format, body);
  table.AddColumnWidth(1000);
  table.AddColumnWidth(3000);
  for (let row = 0; row < 5; row++)
    for (const [col, box] of doc.nodes
      .AppendTableRow(table, 2, { minHeight: 300 })
      .GetTabBoxes()
      .entries())
      box.GetParagraphs()[0]?.SetText(`Cell${row}-${col}`);
  shell.SetPageDescriptor({
    ...doc.GetPageDesc().GetValue(),
    width: 6000,
    height: 1000,
    leftMargin: 500,
    rightMargin: 500,
    topMargin: 100,
    bottomMargin: 100,
  });
  shell.FocusNode(body);
  doc.GetUndoManager().Clear();
  return { session, doc, shell, table, body };
}
describe("browser native table print area", /** Registers direct native geometry consumption. @returns Nothing. */ () => {
  for (const [align, left, right, width] of [
    ["left", 20, 1700 / 15, 200],
    ["center", 1000 / 15, 1000 / 15, 200],
    ["right", 2000 / 15, 0, 200],
    ["margins", 20, 40, 4100 / 15],
  ] as const)
    it(`renders ${align} on original and repeated header fragments`, /** Checks all visible fragments consume native twip bounds. @returns Nothing. */ () => {
      const f = fixture({
        align,
        width: 3000,
        marginLeft: 300,
        marginRight: 600,
        headerRows: 1,
        repeatHeaderRows: true,
      });
      render(
        <WriterWorkbench
          isActive
          view={f.session.view}
          fileDialogs={f.session.fileDialogs}
          services={f.session.services}
        />,
      );
      const tables = screen.getAllByRole("table", { name: "Geometry" });
      expect(tables.length).toBeGreaterThan(1);
      for (const table of tables) {
        expect(table).toHaveStyle({
          marginLeft: `${left}px`,
          marginRight: `${right}px`,
          width: `${width}px`,
        });
        expect(
          [...table.querySelectorAll("col")].map(
            /** Reads actual column style. @param col - Mounted column. @returns Proportion. */ (
              col,
            ) => col.style.width,
          ),
        ).toEqual(["25%", "75%"]);
      }
      const headers = screen.getAllByRole("textbox", { name: "Row 1 column 1 paragraph 1" });
      expect(headers).toHaveLength(tables.length);
      const selected = headers[1];
      if (selected === undefined) throw new Error("Missing follow header");
      const text = document.createTreeWalker(selected, NodeFilter.SHOW_TEXT).nextNode();
      if (text === null) throw new Error("Missing actual text");
      act(
        /** Executes native view action. @returns Operation result. */ () => {
          window.getSelection()?.setBaseAndExtent(text, 7, text, 7);
          document.dispatchEvent(new Event("selectionchange"));
        },
      );
      act(
        /** Executes native view action. @returns Operation result. */ () =>
          selected.dispatchEvent(
            new InputEvent("beforeinput", {
              bubbles: true,
              cancelable: true,
              inputType: "insertText",
              data: "X",
            }),
          ),
      );
      for (const header of screen.getAllByRole("textbox", { name: "Row 1 column 1 paragraph 1" }))
        expect(header).toHaveTextContent("Cell0-0X");
      act(/** Executes native view action. @returns Operation result. */ () => f.shell.Undo());
      expect(f.table.GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0]?.GetText()).toBe(
        "Cell0-0",
      );
      act(/** Executes native view action. @returns Operation result. */ () => f.shell.Redo());
      expect(f.table.GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0]?.GetText()).toBe(
        "Cell0-0X",
      );
      expect(f.table.GetTabLines()[0]?.GetTabBoxes()[1]?.GetParagraphs()[0]?.GetText()).toBe(
        "Cell0-1",
      );
      expect(f.body.GetText()).toBe("Before");
    });
  it("uses equal columns when native declared reference widths are zero", /** Checks an admitted unsized column graph. @returns Nothing. */ () => {
    const f = fixture({ align: "margins" });
    f.table.SetColumnWidth(0, 1);
    f.table.SetColumnWidth(1, 1);
    const zero = f.doc.nodes.MakeTableNode("Zero");
    zero.AddColumnWidth(0);
    zero.AddColumnWidth(0);
    f.doc.nodes.AppendTableRow(zero, 2);
    const point = new SwPosition(f.body, 0),
      cursor = new SwPaM(point);
    point.Dispose();
    const projection = new WriterViewProjection().Project(
      f.doc,
      f.body,
      cursor,
      createDocument({ id: "geometry", suiteId: "writer", title: "Geometry" }),
    );
    cursor.Dispose();
    render(
      <WriterEditableTable
        table={zero}
        availableWidth={5000}
        paragraphs={
          new Map(
            projection.textNodes.map(
              /** Indexes actual text projections. @param node - Native projection. @returns Coordinate and projection. */ (
                node,
              ) => [node.nodeIndex, node],
            ),
          )
        }
        onSelectRow={vi.fn()}
      />,
    );
    const table = screen.getByRole("table", { name: "Zero" });
    expect(table).toHaveStyle({ width: `${5000 / 15}px` });
    expect(
      [...table.querySelectorAll("col")].map(
        /** Reads actual column style. @param col - Mounted column. @returns Proportion. */ (col) =>
          col.style.width,
      ),
    ).toEqual(["50%", "50%"]);
  });
});
