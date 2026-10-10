/** @fileoverview Verifies mounted last-row height presentation and the original native table frame invalidation path. */
import { act, cleanup, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { SwPosition } from "../../source/core/crsr/pam";
import { SwTabFrame, SwRowFrame } from "../../source/core/layout/tabfrm";
import { SwFormatFrameSize, SwFrameSize } from "../../inc/fmtfsize";
/** Requires an original model or DOM owner. @param value - Optional owner. @returns Actual owner. */
function required<T>(value: T | null | undefined): T {
  if (value === undefined || value === null) throw Error("Missing mounted last-row owner");
  return value;
}
it("mounted last-row commands update fixed clipping and invalidate the original table without leaking render frames", /** Checks native commands, original linked clients and three mounted history cycles. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  let frame: SwTabFrame | undefined;
  try {
    const table = doc.nodes.MakeTableNode(
      "LastMounted",
      { width: 3000, align: "left" },
      required(doc.paragraphs[0]),
    );
    table.AddColumnWidth(3000);
    const first = doc.nodes.AppendTableRow(table, 1),
      last = doc.nodes.AppendTableRow(table, 1, {
        frameSize: new SwFormatFrameSize(SwFrameSize.Minimum, 0, 600),
      }),
      box = required(last.GetTabBoxes()[0]),
      node = required(box.GetParagraphs()[0]);
    node.SetText("Mounted original last row");
    const position = new SwPosition(node, 3);
    shell.SetCursor(position);
    position.Dispose();
    const cursor = shell.CaptureCursorState();
    frame = new SwTabFrame(table);
    const firstFrame = required(frame.Lower()) as SwRowFrame,
      lastFrame = required(firstFrame.GetNext()) as SwRowFrame;
    doc.GetUndoManager().Clear();
    render(<WriterWorkbench isActive view={session.view} />);
    frame.setFrameAreaPositionValid(true);
    act(
      /** Applies actual native last-row height. @returns Nothing. */ () => {
        expect(shell.SetRowHeight(new SwFormatFrameSize(SwFrameSize.Fixed, 0, 900))).toBe(true);
      },
    );
    expect(frame.isFrameAreaPositionValid()).toBe(false);
    expect(
      required(
        screen
          .getByRole("textbox", { name: "Row 2 column 1 paragraph 1" })
          .closest("[data-writer-fixed-row-content]"),
      ),
    ).toHaveStyle({ height: "60px", overflow: "hidden" });
    expect(
      screen
        .getByRole("textbox", { name: "Row 1 column 1 paragraph 1" })
        .closest("[data-writer-fixed-row-content]"),
    ).toBeNull();
    for (let cycle = 0; cycle < 3; cycle++) {
      act(
        /** Reverts original native row height. @returns Nothing. */ () => {
          expect(shell.Undo()).toBe(true);
        },
      );
      expect(
        screen
          .getByRole("textbox", { name: "Row 2 column 1 paragraph 1" })
          .closest("[data-writer-fixed-row-content]"),
      ).toBeNull();
      act(
        /** Restores original native row height. @returns Nothing. */ () => {
          expect(shell.Redo()).toBe(true);
        },
      );
      expect(
        required(
          screen
            .getByRole("textbox", { name: "Row 2 column 1 paragraph 1" })
            .closest("[data-writer-fixed-row-content]"),
        ),
      ).toHaveStyle({ height: "60px" });
      expect(lastFrame.FindTabFrame()).toBe(frame);
      expect(lastFrame.GetFormat()).toBe(last.GetFrameFormat());
      expect(firstFrame.GetFormat()).toBe(first.GetFrameFormat());
      expect(table.GetTabLines()).toEqual([first, last]);
      expect(box.GetParagraphs()[0]).toBe(node);
      expect(node.GetText()).toBe("Mounted original last row");
      expect(shell.CaptureCursorState()).toEqual(cursor);
      const clients: unknown[] = [];
      last.GetFrameFormat().ForAllListeners(
        /** Reads original registrations after render. @param client - Native listener. @returns Continue flag. */ (
          client,
        ) => {
          clients.push(client);
          return false;
        },
      );
      expect(clients).toHaveLength(2);
      expect(clients).toContain(last);
      expect(clients).toContain(lastFrame);
    }
    frame.DestroyImpl();
    const clients: unknown[] = [];
    last.GetFrameFormat().ForAllListeners(
      /** Reads survivors after native layout teardown. @param client - Native listener. @returns Continue flag. */ (
        client,
      ) => {
        clients.push(client);
        return false;
      },
    );
    expect(clients).toEqual([last]);
  } finally {
    cleanup();
    frame?.DestroyImpl();
    session.Close();
  }
});
