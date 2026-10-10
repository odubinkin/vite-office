/** @fileoverview Checks native zero-margin admission through mounted React command dispatch without upstream. */
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
import { SwPosition } from "../../source/core/crsr/pam";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
it.each([false, true])(
  "keeps ordinary native decrease enabled and history-owned in body/cell %s",
  /** Verifies actual rendered state, command dispatch, range cursor and native undo. @param cell - Select a real native cell. @returns Nothing. */ (
    cell,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell(),
      body = shell.GetActiveParagraph(),
      table = doc.nodes.MakeTableNode("ReactAdmission", {}, body),
      boxes = doc.nodes.AppendTableRow(table, 1).GetTabBoxes(),
      target = cell ? boxes[0]?.GetParagraphs()[0] : body;
    table.AddColumnWidth(3000);
    if (target === undefined) throw Error("Missing native target");
    try {
      target.SetText("NativeAdmissionProof");
      const point = new SwPosition(target, 0);
      shell.SetCursor(point);
      point.Dispose();
      render(<WriterWorkbench isActive view={session.view} />);
      const toolbar = within(screen.getByRole("toolbar", { name: "Writer formatting toolbar" })),
        decrease = toolbar.getByRole("button", { name: /^Decrease$/ });
      expect(session.view.QueryState(WRITER_COMMAND_IDS.decreaseIndent).enabled).toBe(true);
      expect(decrease).not.toBeDisabled();
      const initial = doc.GetUndoManager().GetUndoActionCount();
      fireEvent.click(decrease);
      expect(target.GetParagraphTextLeftMargin()).toBe(0);
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(initial + 1);
      expect(shell.getShellCursor().GetPoint().GetNode()).toBe(target);
      act(
        /** Restores native no-op formatting/history. @returns Nothing. */ () => {
          expect(shell.Undo()).toBe(true);
        },
      );
      expect(target.GetParagraphTextLeftMargin()).toBe(0);
      expect(target.GetpSwAttrSet()).toBeUndefined();
      act(
        /** Reexecutes the recorded command. @returns Nothing. */ () => {
          expect(shell.Redo()).toBe(true);
        },
      );
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(initial + 1);
      fireEvent.click(toolbar.getByRole("button", { name: /^Increase$/ }));
      expect(target.GetParagraphTextLeftMargin()).toBe(1134);
      fireEvent.click(decrease);
      expect(target.GetParagraphTextLeftMargin()).toBe(0);
      expect(target.GetText()).toBe("NativeAdmissionProof");
      act(
        /** Switches actual context to a native first-level list. @returns Nothing. */ () => {
          expect(shell.SetParagraphListKind("bullet")).toBe(true);
        },
      );
      expect(session.view.QueryState(WRITER_COMMAND_IDS.decreaseIndent).enabled).toBe(false);
      expect(decrease).toBeDisabled();
    } finally {
      cleanup();
      session.Close();
    }
  },
);
