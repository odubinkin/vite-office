/** @fileoverview Verifies mounted native headline state survives unrelated table attribute history and real ODT. */
import { act, cleanup, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { SwFormatFrameSize, SwFrameSize } from "../../inc/fmtfsize";
import { HoriOrientation } from "../../../offapi/com/sun/star/text/HoriOrientation";
import { writeOdtDocument } from "../../source/filter/xml/wrtxml";
import { readOdtDocument } from "../../source/filter/xml/swxml";
/** Requires an original owner. @param value - Optional owner. @returns Native owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing mounted native table owner");
  return value;
}
it.each([0, 2])(
  "actual page/header projection and ODT keep independent count %s across attribute UndoRedo",
  /** Checks existing native shell, real document publication and mounted rows. @param count - Later independent count. @returns Completion. */ async (
    count,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell();
    try {
      const body = required(doc.paragraphs[0]);
      body.SetText("Before");
      const table = doc.nodes.MakeTableNode(
        "AttributeHeadline",
        { width: 4000, horiOrient: HoriOrientation.LEFT },
        body,
      );
      table.AddColumnWidth(4000);
      for (let index = 0; index < 8; index++)
        required(
          doc.nodes
            .AppendTableRow(table, 1, {
              frameSize: new SwFormatFrameSize(SwFrameSize.Minimum, 0, 180),
            })
            .GetTabBoxes()[0]
            ?.GetParagraphs()[0],
        ).SetText(index === 0 ? "Header" : "Body" + index);
      const rows = [...table.GetTabLines()],
        header = required(rows[0]?.GetTabBoxes()[0]?.GetParagraphs()[0]);
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
      const cursor = shell.GetCursor();
      doc.GetUndoManager().Clear();
      const mounted = render(
        <WriterWorkbench
          isActive
          view={session.view}
          fileDialogs={session.fileDialogs}
          services={session.services}
        />,
      );
      act(
        /** Authors recorded width and independent nonrecorded headline command. @returns Nothing. */ () => {
          expect(shell.SetTableAttr({ width: 4500 })).toBe(true);
          doc.GetUndoManager().DoUndo(false);
          expect(shell.SetRowsToRepeat(count)).toBe(true);
          doc.GetUndoManager().DoUndo(true);
        },
      );
      const occurrences = screen.getAllByRole("textbox", {
        name: "Row 1 column 1 paragraph 1",
      }).length;
      if (count === 0) expect(occurrences).toBe(1);
      else expect(occurrences).toBeGreaterThan(1);
      for (let cycle = 0; cycle < 3; cycle++) {
        act(
          /** Executes actual native attribute undo. @returns Nothing. */ () => {
            expect(shell.Undo()).toBe(true);
          },
        );
        expect(table.GetFormat().width).toBe(4000);
        expect(table.GetRowsToRepeat()).toBe(count);
        expect(screen.getAllByRole("textbox", { name: "Row 1 column 1 paragraph 1" })).toHaveLength(
          occurrences,
        );
        act(
          /** Executes actual native attribute redo. @returns Nothing. */ () => {
            expect(shell.Redo()).toBe(true);
          },
        );
        expect(table.GetFormat().width).toBe(4500);
        expect(table.GetRowsToRepeat()).toBe(count);
        expect(screen.getAllByRole("textbox", { name: "Row 1 column 1 paragraph 1" })).toHaveLength(
          occurrences,
        );
        expect(mounted.container.querySelectorAll('tr[data-writer-table-row="0"] th').length).toBe(
          count === 0 ? 0 : occurrences,
        );
        expect(table.GetTabLines()).toEqual(rows);
        expect(rows[0]?.GetTabBoxes()[0]?.GetParagraphs()[0]).toBe(header);
        expect(shell.GetCursor()).toBe(cursor);
      }
      const reopened = await readOdtDocument(
        writeOdtDocument(doc, { title: "AttributeHeadline" }),
        { title: "AttributeHeadline" },
      );
      expect(required(reopened.document.GetTables()[0]).GetRowsToRepeat()).toBe(count);
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
      expect(header.GetText()).toBe("Header");
    } finally {
      cleanup();
      session.Close();
    }
  },
);
