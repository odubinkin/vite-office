/** @fileoverview Verifies native original format changes reach actual mounted Writer UI without row/cell generic client shims. */
import { act, cleanup, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { SwCellFrame } from "../../source/core/layout/tabfrm";
import { SwFormatVertOrient } from "../../inc/fmtornt";
import { SwFormatFrameSize, SwFrameSize } from "../../inc/fmtfsize";
import { AttrSetChangeHint } from "../../inc/hints";
import { SwPosition } from "../../source/core/crsr/pam";
/** Requires an original owner. @param value - Optional owner or element. @returns Original owner. */
function required<T>(value: T | null | undefined): T {
  if (value === undefined || value === null) throw Error("Missing native mounted format");
  return value;
}
it("direct native format item writes refresh the main UI through original document signals and preserve original frame clients", /** Checks direct native item edits and inherited/reset device updates. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc();
  try {
    const table = doc.nodes.MakeTableNode(
      "Native updates",
      { width: 6000, align: "left" },
      doc.paragraphs[0],
    );
    table.AddColumnWidth(3000);
    table.AddColumnWidth(3000);
    const row = doc.nodes.AppendTableRow(table, 2),
      first = required(row.GetTabBoxes()[0]),
      second = required(row.GetTabBoxes()[1]),
      node = required(first.GetParagraphs()[0]);
    node.SetText("Native updates");
    const original = first.GetFrameFormat(),
      frame = new SwCellFrame(first),
      notify = vi.spyOn(frame, "Notify");
    render(<WriterWorkbench isActive view={session.view} />);
    const cell = required(
      screen.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" }).closest("td"),
    );
    expect(cell).toHaveStyle({ verticalAlign: "top" });
    act(
      /** Applies a direct actual native cell format item. @returns Nothing. */ () => {
        expect(original.SetFormatAttr(new SwFormatVertOrient(720, 2, 7))).toBe(true);
      },
    );
    expect(cell).toHaveStyle({ verticalAlign: "middle" });
    expect(notify).toHaveBeenCalledOnce();
    expect(notify.mock.calls[0]?.[1]).toBeInstanceOf(AttrSetChangeHint);
    expect(frame.GetFormat()).toBe(original);
    expect(first.GetParagraphs()[0]).toBe(node);
    expect(node.GetText()).toBe("Native updates");
    expect(second.GetFrameFormat()).not.toBe(original);
    expect(
      required(screen.getByRole("textbox", { name: "Row 1 column 2 paragraph 1" }).closest("td")),
    ).toHaveStyle({ verticalAlign: "top" });
    act(
      /** Restores direct native orientation to pooled default. @returns Nothing. */ () => {
        expect(original.ResetFormatAttr(109)).toBe(true);
      },
    );
    expect(cell).toHaveStyle({ verticalAlign: "top" });
    expect(notify).toHaveBeenCalledTimes(2);
    frame.Dispose();
    expect(first.GetFrameFormat().IsDisposed()).toBe(false);
  } finally {
    cleanup();
    vi.restoreAllMocks();
    session.Close();
  }
});
it("native row item deltas drive mounted fixed height and original cell alignment through repeated real history", /** Checks main render and original graph/cursor retained. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  try {
    const table = doc.nodes.MakeTableNode("History updates", { width: 3000 }, doc.paragraphs[0]);
    table.AddColumnWidth(3000);
    const row = doc.nodes.AppendTableRow(table, 1),
      box = required(row.GetTabBoxes()[0]),
      node = required(box.GetParagraphs()[0]),
      position = new SwPosition(node, 0);
    shell.SetCursor(position);
    position.Dispose();
    node.SetText("Original history");
    const before = shell.CaptureCursorState();
    doc.GetUndoManager().Clear();
    render(<WriterWorkbench isActive view={session.view} />);
    act(
      /** Changes actual row items through native document history. @returns Nothing. */ () => {
        doc.SetRowHeight(shell.GetCursor(), new SwFormatFrameSize(SwFrameSize.Fixed, 0, 720));
      },
    );
    const cell = required(
      screen.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" }).closest("td"),
    );
    expect(required(cell.closest("tr"))).toHaveStyle({ height: "48px" });
    expect(required(cell.querySelector("[data-writer-fixed-row-content]"))).toHaveStyle({
      height: "48px",
    });
    for (let cycle = 0; cycle < 3; cycle++) {
      act(
        /** Reverts original native row history. @returns Nothing. */ () => {
          expect(shell.Undo()).toBe(true);
        },
      );
      expect(cell.querySelector("[data-writer-fixed-row-content]")).toBeNull();
      act(
        /** Restores original native row history. @returns Nothing. */ () => {
          expect(shell.Redo()).toBe(true);
        },
      );
      expect(required(cell.closest("tr"))).toHaveStyle({ height: "48px" });
      expect(box.GetParagraphs()[0]).toBe(node);
      expect(node.GetText()).toBe("Original history");
      expect(shell.CaptureCursorState()).toEqual(before);
    }
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  } finally {
    cleanup();
    session.Close();
  }
});
