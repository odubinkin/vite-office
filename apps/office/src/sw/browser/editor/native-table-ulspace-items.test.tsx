/** @fileoverview Verifies mounted Writer consumes original native table spacing, native property history and ODT. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { SvxULSpaceItem } from "../../../editeng/source/items/frmitems";
import { RES_UL_SPACE } from "../../inc/hintids";
import { SwFrameFormat } from "../../source/core/layout/atrfrm";
import { writeOdtDocument } from "../../source/filter/xml/wrtxml";
import { readOdtDocument } from "../../source/filter/xml/swxml";
/** Requires the original owner. @param value - Possible native owner. @returns Native owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing original mounted UL owner");
  return value;
}
it.each([false, true])(
  "mounted original spacing ignores stale scalar transport inherited=%s",
  /** Checks original dispatch, dialog fields, three native cycles and real ODT. @param inherited - Parent-owned input. @returns Completion. */ async (
    inherited,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell();
    let parent: SwFrameFormat | undefined;
    try {
      const table = doc.nodes.MakeTableNode(
        "SpacingUI",
        { width: 3000 },
        required(doc.paragraphs[0]),
      );
      table.AddColumnWidth(3000);
      const row = doc.nodes.AppendTableRow(table, 1),
        box = required(row.GetTabBoxes()[0]),
        node = required(box.GetParagraphs()[0]),
        format = table.GetFrameFormat();
      node.SetText("Original native spacing cell");
      shell.FocusNode(node);
      doc.GetUndoManager().Clear();
      let source = format;
      if (inherited) {
        parent = source = new SwFrameFormat(doc.GetAttrPool(), "Parent");
        format.SetDerivedFrom(parent);
      }
      render(
        <WriterWorkbench
          isActive
          view={session.view}
          fileDialogs={session.fileDialogs}
          services={session.services}
        />,
      );
      const native = table.GetFormat.bind(table),
        stale = vi.spyOn(table, "GetFormat");
      stale.mockImplementation(
        /** Keeps obsolete detached spacing values. @returns Stale projection. */ () => ({
          ...native(),
          marginTop: 0,
          marginBottom: 0,
        }),
      );
      try {
        act(
          /** Applies the original native frame item. @returns Nothing. */ () => {
            source.SetFormatAttr(new SvxULSpaceItem(150, 300, RES_UL_SPACE));
          },
        );
        expect(screen.getByRole("table", { name: "SpacingUI" })).toHaveStyle({
          marginTop: "10px",
          marginBottom: "20px",
        });
        fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
        expect(screen.getByRole("spinbutton", { name: "Above (cm)" })).toHaveValue(0.26);
        expect(screen.getByRole("spinbutton", { name: "Below (cm)" })).toHaveValue(0.53);
        fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
      } finally {
        stale.mockRestore();
      }
      fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
      fireEvent.change(screen.getByRole("spinbutton", { name: "Above (cm)" }), {
        target: { value: "1" },
      });
      fireEvent.click(screen.getByRole("button", { name: "OK" }));
      expect(format.GetULSpace().GetUpper()).toBe(567);
      expect(format.GetULSpace().GetLower()).toBe(300);
      for (let cycle = 0; cycle < 3; cycle++) {
        act(
          /** Restores original direct or inherited native item. @returns Nothing. */ () => {
            expect(shell.Undo()).toBe(true);
          },
        );
        expect(screen.getByRole("table", { name: "SpacingUI" })).toHaveStyle({
          marginTop: "10px",
          marginBottom: "20px",
        });
        act(
          /** Replays the actual native item set. @returns Nothing. */ () => {
            expect(shell.Redo()).toBe(true);
          },
        );
        expect(format.GetULSpace().GetUpper()).toBe(567);
        expect(table.GetTabLines()[0]).toBe(row);
        expect(box.GetParagraphs()[0]).toBe(node);
        expect(node.GetText()).toBe("Original native spacing cell");
      }
      const reopened = await readOdtDocument(writeOdtDocument(doc, { title: "SpacingUI" }), {
        title: "SpacingUI",
      });
      expect(
        required(reopened.document.GetTables()[0]).GetFrameFormat().GetULSpace().QueryValue(),
      ).toEqual([567, 300]);
    } finally {
      cleanup();
      session.Close();
      parent?.DisposeModify();
    }
  },
);
