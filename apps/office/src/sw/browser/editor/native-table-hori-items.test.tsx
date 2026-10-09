/** @fileoverview Verifies mounted original horizontal orientation, native dialog history and inherited native ODT export. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { SwFormatHoriOrient } from "../../inc/fmtornt";
import { RES_HORI_ORIENT } from "../../inc/hintids";
import { HoriOrientation } from "../../../offapi/com/sun/star/text/HoriOrientation";
import { SwFrameFormat } from "../../source/core/layout/atrfrm";
import { writeOdtDocument } from "../../source/filter/xml/wrtxml";
import { readOdtDocument } from "../../source/filter/xml/swxml";
/** Requires original native ownership. @param value - Possible owner. @returns Present owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing mounted horizontal owner");
  return value;
}
it.each([false, true])(
  "mounted horizontal owner, dialog, native history and ODT inherited=%s",
  /** Checks original effective dispatch despite stale detached projection. @param inherited - Parent input. @returns Completion. */ async (
    inherited,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell();
    let parent: SwFrameFormat | undefined;
    try {
      const table = doc.nodes.MakeTableNode(
          "NativeHoriUI",
          { width: 3000 },
          required(doc.paragraphs[0]),
        ),
        format = table.GetFrameFormat();
      table.AddColumnWidth(3000);
      const row = doc.nodes.AppendTableRow(table, 1),
        box = required(row.GetTabBoxes()[0]),
        node = required(box.GetParagraphs()[0]);
      node.SetText("Original horizontal cell");
      shell.FocusNode(node);
      let source = format;
      if (inherited) {
        parent = source = new SwFrameFormat(doc.GetAttrPool(), "Parent");
        format.SetDerivedFrom(parent);
        format.ResetFormatAttr(RES_HORI_ORIENT);
      }
      doc.GetUndoManager().Clear();
      render(
        <WriterWorkbench
          isActive
          view={session.view}
          fileDialogs={session.fileDialogs}
          services={session.services}
        />,
      );
      const native = table.GetFormat.bind(table),
        projection = vi.spyOn(table, "GetFormat");
      projection.mockImplementation(
        /** Keeps obsolete detached orientation. @returns Stale transport. */ () => ({
          ...native(),
          horiOrient: HoriOrientation.FULL,
          align: "margins",
        }),
      );
      const before = new SwFormatHoriOrient(41, HoriOrientation.RIGHT, 7, true);
      try {
        act(
          /** Mutates the original effective native owner. @returns Nothing. */ () => {
            source.SetFormatAttr(before);
          },
        );
        const element = screen.getByRole("table", { name: "NativeHoriUI" });
        expect(element).toHaveStyle({ width: "200px", marginRight: "0px" });
        expect(Number.parseFloat(element.style.marginLeft)).toBeGreaterThan(0);
        fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
        expect(screen.getByRole("radio", { name: "Right" })).toBeChecked();
        fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
        const reopen = await readOdtDocument(writeOdtDocument(doc, { title: "NativeHoriUI" }), {
          title: "NativeHoriUI",
        });
        expect(
          required(reopen.document.GetTables()[0]).GetFrameFormat().GetHoriOrient().GetHoriOrient(),
        ).toBe(HoriOrientation.RIGHT);
      } finally {
        projection.mockRestore();
      }
      fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
      fireEvent.click(screen.getByRole("radio", { name: "Center" }));
      fireEvent.click(screen.getByRole("button", { name: "OK" }));
      expect([
        format.GetHoriOrient().GetPos(),
        format.GetHoriOrient().GetHoriOrient(),
        format.GetHoriOrient().GetRelationOrient(),
        format.GetHoriOrient().IsPosToggle(),
      ]).toEqual([0, HoriOrientation.CENTER, 1, false]);
      for (let cycle = 0; cycle < 3; cycle++) {
        act(
          /** Restores original native direct or inherited fields. @returns Nothing. */ () => {
            expect(shell.Undo()).toBe(true);
          },
        );
        expect(format.GetHoriOrient()).toEqual(before);
        expect(format.GetAttrSet().GetItemIfSet(RES_HORI_ORIENT, false) === undefined).toBe(
          inherited,
        );
        act(
          /** Replays original native dialog items. @returns Nothing. */ () => {
            expect(shell.Redo()).toBe(true);
          },
        );
        expect(format.GetHoriOrient().GetHoriOrient()).toBe(HoriOrientation.CENTER);
        expect(table.GetTabLines()[0]).toBe(row);
        expect(box.GetParagraphs()[0]).toBe(node);
        expect(node.GetText()).toBe("Original horizontal cell");
      }
      const reopened = await readOdtDocument(writeOdtDocument(doc, { title: "NativeHoriUI" }), {
        title: "NativeHoriUI",
      });
      expect(required(reopened.document.GetTables()[0]).GetHoriOrient()).toBe(
        HoriOrientation.CENTER,
      );
    } finally {
      cleanup();
      session.Close();
      parent?.DisposeModify();
    }
  },
);
