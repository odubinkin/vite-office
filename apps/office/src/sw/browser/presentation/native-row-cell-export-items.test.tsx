/** @fileoverview Verifies mounted native row/cell formatting and XML contracts through original attribute history and ODT reopening. */
import { act, cleanup, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
import { SwFormatFrameSize, SwFrameSize } from "../../inc/fmtfsize";
import { VertOrientation as V } from "../../../offapi/com/sun/star/text/VertOrientation";
import { exportContentXml } from "../../source/filter/xml/xmlexp";
import { writeOdtDocument } from "../../source/filter/xml/wrtxml";
import { readOdtDocument } from "../../source/filter/xml/swxml";
/** Requires an original model owner. @param value - Candidate. @returns Concrete value. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing mounted XML owner");
  return value;
}
it("mounted row height and cell NONE retain original owners across export and native history", /** Checks native commands, painted geometry and current-source ODT values. @returns Completion. */ async () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  try {
    const table = doc.nodes.MakeTableNode(
      "MountedRowBox",
      { width: 3000 },
      required(doc.paragraphs[0]),
    );
    table.AddColumnWidth(3000);
    const row = doc.nodes.AppendTableRow(table, 1),
      box = required(row.GetTabBoxes()[0]),
      node = required(box.GetParagraphs()[0]);
    node.SetText("Original row and box");
    shell.FocusNode(node);
    const cursor = shell.CaptureCursorState();
    doc.GetUndoManager().Clear();
    render(<WriterWorkbench isActive view={session.view} />);
    act(
      /** Applies native row height. @returns Nothing. */ () => {
        expect(shell.SetRowHeight(new SwFormatFrameSize(SwFrameSize.Fixed, 0, 720))).toBe(true);
      },
    );
    act(
      /** Applies explicit native NONE. @returns Nothing. */ () => {
        expect(shell.SetBoxAlign(V.NONE)).toBe(true);
      },
    );
    for (let cycle = 0; cycle < 2; cycle++) {
      const rowProjection = vi.spyOn(row, "GetFormat"),
        boxProjection = vi.spyOn(box, "GetFormat");
      try {
        const xml = exportContentXml(doc);
        expect(xml).toContain('style:row-height="1.27cm"');
        expect(xml).toContain('style:vertical-align=""');
        const reopened = required(
          (
            await readOdtDocument(writeOdtDocument(doc, { title: "Mounted" }), { title: "Mounted" })
          ).document.GetTables()[0],
        );
        expect(required(reopened.GetTabLines()[0]).GetFrameSize().GetHeight()).toBe(720);
        expect(
          required(required(reopened.GetTabLines()[0]).GetTabBoxes()[0])
            .GetVertOrient()
            .GetVertOrient(),
        ).toBe(V.NONE);
        expect(rowProjection).not.toHaveBeenCalled();
        expect(boxProjection).not.toHaveBeenCalled();
      } finally {
        rowProjection.mockRestore();
        boxProjection.mockRestore();
      }
      const rendered = screen.getByRole("table", { name: "MountedRowBox" });
      expect(rendered.querySelector("tr")).toHaveStyle({ height: "48px" });
      act(
        /** Restores original absence and height. @returns Nothing. */ () => {
          expect(shell.Undo()).toBe(true);
          expect(shell.Undo()).toBe(true);
        },
      );
      expect(exportContentXml(doc)).not.toContain('style:row-height="1.27cm"');
      act(
        /** Replays both original commands. @returns Nothing. */ () => {
          expect(shell.Redo()).toBe(true);
          expect(shell.Redo()).toBe(true);
        },
      );
      expect(table.GetTabLines()[0]).toBe(row);
      expect(row.GetTabBoxes()[0]).toBe(box);
      expect(box.GetParagraphs()[0]).toBe(node);
      expect(shell.CaptureCursorState()).toEqual(cursor);
      expect(screen.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" })).toHaveTextContent(
        "Original row and box",
      );
    }
  } finally {
    cleanup();
    vi.restoreAllMocks();
    session.Close();
  }
});
