/** @fileoverview Verifies native headline commands publish mounted page changes and original scalar history through real table properties. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { SwFormatFrameSize, SwFrameSize } from "../../inc/fmtfsize";
import { writeOdtDocument } from "../../source/filter/xml/wrtxml";
import { readOdtDocument } from "../../source/filter/xml/swxml";
/** Requires an original owner. @param value - Optional owner. @returns Native owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing UI headline owner");
  return value;
}
it("actual Table Properties changes physical repeated headers and ODT while preserving original owners across history", /** Checks mounted multi-page publication through native document command. @returns Completion. */ async () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  try {
    const body = required(doc.paragraphs[0]);
    body.SetText("Before");
    const table = doc.nodes.MakeTableNode("NativeCommand", { width: 4000 }, body);
    table.AddColumnWidth(4000);
    for (let index = 0; index < 4; index++)
      required(
        doc.nodes
          .AppendTableRow(table, 1, {
            frameSize: new SwFormatFrameSize(SwFrameSize.Minimum, 0, 300),
          })
          .GetTabBoxes()[0]
          ?.GetParagraphs()[0],
      ).SetText(index === 0 ? "Header" : "Body" + index);
    const rows = [...table.GetTabLines()],
      header = required(rows[0]?.GetTabBoxes()[0]?.GetParagraphs()[0]),
      cursor = shell.GetCursor();
    shell.SetPageDescriptor({
      ...doc.GetPageDesc().GetValue(),
      height: 1000,
      topMargin: 100,
      bottomMargin: 100,
      width: 6000,
      leftMargin: 100,
      rightMargin: 100,
    });
    shell.FocusNode(header);
    doc.GetUndoManager().Clear();
    const mounted = render(
      <WriterWorkbench
        isActive
        view={session.view}
        fileDialogs={session.fileDialogs}
        services={session.services}
      />,
    );
    expect(screen.getAllByRole("textbox", { name: "Row 1 column 1 paragraph 1" })).toHaveLength(3);
    fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
    fireEvent.click(screen.getByRole("tab", { name: "Text Flow" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Repeat header" }));
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(table.GetRowsToRepeat()).toBe(0);
    expect(screen.getAllByRole("textbox", { name: "Row 1 column 1 paragraph 1" })).toHaveLength(1);
    for (let cycle = 0; cycle < 3; cycle++) {
      act(
        /** Executes actual native undo. @returns Nothing. */ () => {
          expect(shell.Undo()).toBe(true);
        },
      );
      expect(table.GetRowsToRepeat()).toBe(1);
      expect(screen.getAllByRole("textbox", { name: "Row 1 column 1 paragraph 1" })).toHaveLength(
        3,
      );
      act(
        /** Executes actual native redo. @returns Nothing. */ () => {
          expect(shell.Redo()).toBe(true);
        },
      );
      expect(table.GetRowsToRepeat()).toBe(0);
      expect(
        mounted.container.querySelectorAll('[data-writer-repeated-headline="true"]'),
      ).toHaveLength(0);
      expect(table.GetTabLines()).toEqual(rows);
      expect(shell.GetCursor()).toBe(cursor);
      expect(rows[0]?.GetTabBoxes()[0]?.GetParagraphs()[0]).toBe(header);
    }
    const reopened = await readOdtDocument(writeOdtDocument(doc, { title: "NativeCommand" }), {
      title: "NativeCommand",
    });
    expect(required(reopened.document.GetTables()[0]).GetRowsToRepeat()).toBe(0);
    expect(table.GetTabLines()).toHaveLength(4);
  } finally {
    cleanup();
    session.Close();
  }
});
