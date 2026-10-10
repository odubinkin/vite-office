/** @fileoverview Verifies mounted Writer observes original frame-size items and ignores stale width transport. */
import { act, cleanup, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { SwFormatFrameSize, SwFrameSize } from "../../inc/fmtfsize";
import { HoriOrientation } from "../../../offapi/com/sun/star/text/HoriOrientation";
import { SwFrameFormat } from "../../source/core/layout/atrfrm";
import { RES_FRM_SIZE } from "../../inc/hintids";
import { writeOdtDocument } from "../../source/filter/xml/wrtxml";
import { readOdtDocument } from "../../source/filter/xml/swxml";
/** Requires an original native owner. @param value - Optional owner. @returns Original owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing mounted frame item owner");
  return value;
}
it.each([false, true])(
  "mounted original frame width and history ignore stale transport inherited=%s",
  /** Checks actual workbench/native hint, original cell owners and real ODT. @param inherited - Parent-owned item path. @returns Completion. */ async (
    inherited,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell();
    try {
      const body = required(doc.paragraphs[0]),
        table = doc.nodes.MakeTableNode(
          "FrameUI",
          { width: 3000, horiOrient: HoriOrientation.LEFT },
          body,
        );
      table.AddColumnWidth(1000);
      table.AddColumnWidth(2000);
      for (let index = 0; index < 2; index++) doc.nodes.AppendTableRow(table, 2);
      const rows = [...table.GetTabLines()],
        box = required(rows[0]?.GetTabBoxes()[0]),
        node = required(box.GetParagraphs()[0]),
        format = table.GetFrameFormat();
      node.SetText("Original frame cell");
      shell.FocusNode(node);
      const cursor = shell.GetCursor();
      doc.GetUndoManager().Clear();
      let source = format;
      if (inherited) {
        source = new SwFrameFormat(doc.GetAttrPool(), "Parent");
        source.SetFormatAttr(format.GetFrameSize());
        format.GetAttrSet().ClearItem(RES_FRM_SIZE);
        format.SetDerivedFrom(source);
      }
      render(
        <WriterWorkbench
          isActive
          view={session.view}
          fileDialogs={session.fileDialogs}
          services={session.services}
        />,
      );
      const projection = table.GetFormat.bind(table),
        stale = vi.spyOn(table, "GetFormat");
      stale.mockImplementation(
        /** Deliberately keeps the obsolete transport width. @returns Stale detached width. */ () => ({
          ...projection(),
          width: 3000,
        }),
      );
      try {
        act(
          /** Publishes actual original frame width. @returns Nothing. */ () => {
            source.SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Variable, 6000));
          },
        );
        expect(format.GetFrameSize().GetWidth()).toBe(6000);
        expect(table.GetColumnWidths()).toEqual([2000, 4000]);
        expect(screen.getByRole("table", { name: "FrameUI" })).toHaveStyle({ width: "400px" });
        expect(box.GetParagraphs()[0]).toBe(node);
        expect(shell.GetCursor()).toBe(cursor);
      } finally {
        stale.mockRestore();
      }
      if (!inherited) {
        act(
          /** Records native width through the real table command. @returns Nothing. */ () => {
            expect(shell.SetTableAttr({ width: 4500 })).toBe(true);
          },
        );
        for (let cycle = 0; cycle < 3; cycle++) {
          act(
            /** Replays native direct-item restoration. @returns Nothing. */ () => {
              expect(shell.Undo()).toBe(true);
            },
          );
          expect(screen.getByRole("table", { name: "FrameUI" })).toHaveStyle({ width: "400px" });
          act(
            /** Replays original table attributes. @returns Nothing. */ () => {
              expect(shell.Redo()).toBe(true);
            },
          );
          expect(screen.getByRole("table", { name: "FrameUI" })).toHaveStyle({ width: "300px" });
          expect(table.GetTabLines()).toEqual(rows);
          expect(box.GetParagraphs()[0]).toBe(node);
          expect(node.GetText()).toBe("Original frame cell");
        }
        const reopened = await readOdtDocument(writeOdtDocument(doc, { title: "FrameUI" }), {
          title: "FrameUI",
        });
        expect(
          required(reopened.document.GetTables()[0]).GetFrameFormat().GetFrameSize().GetWidth(),
        ).toBe(4500);
      }
    } finally {
      cleanup();
      session.Close();
    }
  },
);
