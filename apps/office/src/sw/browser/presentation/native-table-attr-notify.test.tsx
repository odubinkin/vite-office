/** @fileoverview Verifies mounted Writer tables retain original native attribute clients through command history. */
import { act, cleanup, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
import { SwPosition } from "../../source/core/crsr/pam";
import { SwTabFrame } from "../../source/core/layout/tabfrm";
/** Requires an original owner. @param value - Optional owner. @returns Actual owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing mounted table delta owner");
  return value;
}
it("mounted table mode follows actual native properties history and retains the original editable nodes", /** Checks native owned item updates and three undo/redo cycles. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  let frame: SwTabFrame | undefined;
  try {
    const table = doc.nodes.MakeTableNode(
      "MountedDelta",
      { width: 3000 },
      required(doc.paragraphs[0]),
    );
    table.AddColumnWidth(3000);
    const line = doc.nodes.AppendTableRow(table, 1),
      box = required(line.GetTabBoxes()[0]),
      node = required(box.GetParagraphs()[0]);
    node.SetText("Original mounted native delta");
    const pos = new SwPosition(node, 4);
    shell.SetCursor(pos);
    pos.Dispose();
    const cursor = shell.CaptureCursorState(),
      owner = table.GetFrameFormat();
    frame = new SwTabFrame(table);
    doc.GetUndoManager().Clear();
    render(<WriterWorkbench isActive view={session.view} />);
    expect(screen.getByRole("table", { name: "MountedDelta" })).toHaveStyle({
      borderCollapse: "separate",
    });
    act(
      /** Applies the actual native command. @returns Nothing. */ () => {
        expect(shell.SetTableAttr({ borderModel: "collapsing" })).toBe(true);
      },
    );
    expect(screen.getByRole("table", { name: "MountedDelta" })).toHaveStyle({
      borderCollapse: "collapse",
    });
    for (let cycle = 0; cycle < 3; cycle++) {
      act(
        /** Reverts the original native item. @returns Nothing. */ () => {
          expect(shell.Undo()).toBe(true);
        },
      );
      expect(screen.getByRole("table", { name: "MountedDelta" })).toHaveStyle({
        borderCollapse: "separate",
      });
      expect(frame.IsCollapsingBorders()).toBe(false);
      act(
        /** Restores the original native item. @returns Nothing. */ () => {
          expect(shell.Redo()).toBe(true);
        },
      );
      expect(screen.getByRole("table", { name: "MountedDelta" })).toHaveStyle({
        borderCollapse: "collapse",
      });
      expect(frame.IsCollapsingBorders()).toBe(true);
      expect(screen.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" })).toHaveTextContent(
        "Original mounted native delta",
      );
      expect(table.GetFrameFormat()).toBe(owner);
      expect(frame.GetFormat()).toBe(owner);
      expect(table.GetTabLines()[0]).toBe(line);
      expect(box.GetParagraphs()[0]).toBe(node);
      expect(shell.CaptureCursorState()).toEqual(cursor);
    }
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  } finally {
    cleanup();
    frame?.DestroyImpl();
    session.Close();
  }
});
