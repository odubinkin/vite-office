/** @fileoverview Verifies mounted Writer direct native format updates without a generic document attribute device bridge. */
import { act, cleanup, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { SwFormatVertOrient } from "../../inc/fmtornt";
import { SwFormatFrameSize, SwFrameSize } from "../../inc/fmtfsize";
import { SvxFontHeightItem } from "../../../editeng/source/items/textitem";
import { RES_CHRATR_FONTSIZE } from "../../inc/hintids";
import { SwPosition } from "../../source/core/crsr/pam";

/** Requires an actual original owner or DOM element. @param value - Optional value. @returns Original value. */
function required<T>(value: T | null | undefined): T {
  if (value === undefined || value === null) throw Error("Missing mounted native notifier target");
  return value;
}

it("mounted native notifier updates original row height cell alignment and inherited fonts without document device signals", /** Checks actual main DOM under direct native mutations and resets. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc();
  try {
    const table = doc.nodes.MakeTableNode("Direct notifier", { width: 6000 }, doc.paragraphs[0]);
    table.AddColumnWidth(3000);
    table.AddColumnWidth(3000);
    const row = doc.nodes.AppendTableRow(table, 2),
      first = required(row.GetTabBoxes()[0]),
      second = required(row.GetTabBoxes()[1]);
    const node = required(first.GetParagraphs()[0]);
    node.SetText("Original direct native text");
    render(<WriterWorkbench isActive view={session.view} />);
    const editable = screen.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" });
    const cell = required(editable.closest<HTMLTableCellElement>("td,th")),
      sibling = required(
        screen
          .getByRole("textbox", { name: "Row 1 column 2 paragraph 1" })
          .closest<HTMLTableCellElement>("td,th"),
      );
    const format = first.GetFrameFormat(),
      rowFormat = row.GetFrameFormat();
    const cursor = session.view.GetWrtShell().CaptureCursorState(),
      revision = doc.GetDocumentStateManager().GetModelRevision();
    const signal = vi.spyOn(doc.GetDocumentStateManager(), "CallSwClientNotify");
    expect(cell).toHaveStyle({ verticalAlign: "top" });
    act(
      /** Writes original native item values without editing document text. @returns Nothing. */ () => {
        format.SetFormatAttr(new SwFormatVertOrient(0, 2, 0));
        rowFormat.SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Fixed, 0, 720));
        doc.GetDfltTextFormatColl().SetFormatAttr(new SvxFontHeightItem(360, RES_CHRATR_FONTSIZE));
      },
    );
    expect(cell).toHaveStyle({ verticalAlign: "middle" });
    expect(sibling).toHaveStyle({ verticalAlign: "top" });
    expect(required(cell.closest("tr"))).toHaveStyle({ height: "48px" });
    expect(required(cell.querySelector("[data-writer-fixed-row-content]"))).toHaveStyle({
      height: "48px",
    });
    expect(screen.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" })).toHaveStyle({
      fontSize: "18pt",
    });
    expect(signal).not.toHaveBeenCalled();
    expect(doc.GetDocumentStateManager().GetModelRevision()).toBe(revision);
    expect(first.GetFrameFormat()).toBe(format);
    expect(row.GetFrameFormat()).toBe(rowFormat);
    expect(second.GetFrameFormat()).not.toBe(format);
    expect(first.GetParagraphs()[0]).toBe(node);
    expect(node.GetText()).toBe("Original direct native text");
    expect(session.view.GetWrtShell().CaptureCursorState()).toEqual(cursor);
    act(
      /** Restores actual native defaults and inherited font values. @returns Nothing. */ () => {
        format.ResetFormatAttr(109);
        rowFormat.ResetFormatAttr(90);
        doc.GetDfltTextFormatColl().ResetFormatAttr(RES_CHRATR_FONTSIZE);
      },
    );
    expect(cell).toHaveStyle({ verticalAlign: "top" });
    expect(cell.querySelector("[data-writer-fixed-row-content]")).toBeNull();
    expect(signal).not.toHaveBeenCalled();
  } finally {
    cleanup();
    vi.restoreAllMocks();
    session.Close();
  }
});

it("mounted native notifier follows shared claims and actual repeated Undo Redo without retaining deleted formats", /** Checks shared source identities and current table DOM across native history. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  try {
    const table = doc.nodes.MakeTableNode("History notifier", { width: 6000 }, doc.paragraphs[0]);
    table.AddColumnWidth(3000);
    table.AddColumnWidth(3000);
    const row = doc.nodes.AppendTableRow(table, 2),
      first = required(row.GetTabBoxes()[0]),
      second = required(row.GetTabBoxes()[1]);
    const shared = first.GetFrameFormat();
    second.ChgFrameFormat(shared);
    const node = required(first.GetParagraphs()[0]);
    node.SetText("Native shared history");
    const position = new SwPosition(node, 3);
    shell.SetCursor(position);
    position.Dispose();
    const cursor = shell.CaptureCursorState();
    doc.GetUndoManager().Clear();
    render(<WriterWorkbench isActive view={session.view} />);
    const cell = required(
      screen
        .getByRole("textbox", { name: "Row 1 column 1 paragraph 1" })
        .closest<HTMLTableCellElement>("td,th"),
    );
    const sibling = required(
      screen
        .getByRole("textbox", { name: "Row 1 column 2 paragraph 1" })
        .closest<HTMLTableCellElement>("td,th"),
    );
    act(
      /** Applies actual document-owned native shared-format history. @returns Nothing. */ () => {
        expect(doc.SetBoxAttr(shell.GetCursor(), new SwFormatVertOrient(0, 2, 0))).toBe(true);
      },
    );
    expect(cell).toHaveStyle({ verticalAlign: "middle" });
    expect(sibling).toHaveStyle({ verticalAlign: "top" });
    for (let cycle = 0; cycle < 3; cycle++) {
      act(
        /** Reverts original native format history. @returns Nothing. */ () => {
          expect(shell.Undo()).toBe(true);
        },
      );
      expect(cell).toHaveStyle({ verticalAlign: "top" });
      act(
        /** Restores original native format history. @returns Nothing. */ () => {
          expect(shell.Redo()).toBe(true);
        },
      );
      expect(cell).toHaveStyle({ verticalAlign: "middle" });
      expect(sibling).toHaveStyle({ verticalAlign: "top" });
      expect(first.GetParagraphs()[0]).toBe(node);
      expect(shell.CaptureCursorState()).toEqual(cursor);
    }
    const current = first.GetFrameFormat();
    expect(current.GetNotifier().HasListeners()).toBe(true);
    doc.GetUndoManager().Clear();
    doc.nodes.MakeTextNode("Following native table paragraph");
    act(
      /** Deletes original row/cell owners through native table deletion. @returns Nothing. */ () => {
        doc.nodes.DeleteTable(table.GetTableNode());
      },
    );
    expect(screen.queryByRole("textbox", { name: "Row 1 column 1 paragraph 1" })).toBeNull();
    expect(current.IsDisposed()).toBe(true);
    expect(current.GetNotifier().HasListeners()).toBe(false);
    expect(shared.IsDisposed()).toBe(true);
  } finally {
    cleanup();
    session.Close();
  }
});
