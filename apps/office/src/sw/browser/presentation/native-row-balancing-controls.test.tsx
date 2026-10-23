/** @fileoverview Verifies original row-sizing menu/sidebar controls over real table selections and history. */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
import { SwPosition } from "../../source/core/crsr/pam";
import { SwFormatFrameSize, SwFrameSize } from "../../inc/fmtfsize";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Closes native frame subscriptions after unmount. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Mounts original fixed rows. @returns Original document/shell/table. */
function fixture() {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const shell = session.view.GetWrtShell(),
    doc = shell.GetDoc(),
    table = doc.nodes.MakeTableNode("Row UI", { width: 6000 });
  table.AddColumnWidth(6000);
  for (const height of [900, 300, 600])
    doc.nodes.AppendTableRow(table, 1, {
      frameSize: new SwFormatFrameSize(SwFrameSize.Fixed, 0, height),
    });
  const node = table.GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0];
  if (!node) throw new Error("Missing row control owner");
  const position = new SwPosition(node, 0);
  shell.SetCursor(position);
  position.Dispose();
  doc.GetUndoManager().Clear();
  render(<WriterWorkbench isActive view={session.view} />);
  return { session, shell, doc, table };
}
it.each([false, true])(
  "connects the complete source row-sizing group optimize=%s",
  /** Checks original admission, table selection and exact history steps. @param optimize - Source command. @returns Nothing. */ (
    optimize,
  ) => {
    const f = fixture(),
      group = within(screen.getByRole("group", { name: "Row sizing" })),
      command = group.getByRole("button", {
        name: optimize ? "Optimal Row Height" : "Distribute Rows Evenly",
      });
    expect(
      group
        .getAllByRole("button")
        .map(
          /** Reads actual source order. @param button - Native command control. @returns Label. */ (
            button,
          ) => button.getAttribute("aria-label"),
        ),
    ).toEqual(["Minimal Row Height", "Optimal Row Height", "Distribute Rows Evenly"]);
    expect(command).toBeDisabled();
    fireEvent.click(
      within(screen.getByRole("toolbar", { name: "Writer table toolbar" })).getByRole("button", {
        name: "Select Table",
      }),
    );
    expect(command).toBeEnabled();
    const cursor = f.shell.CaptureCursorState();
    fireEvent.click(command);
    const height = optimize ? 600 : 900;
    expect(
      f.table
        .GetTabLines()
        .map(
          /** Reads actual native items. @param row - Original row. @returns Pair. */ (row) => [
            row.GetFrameSize().GetHeightSizeType(),
            row.GetFrameSize().GetHeight(),
          ],
        ),
    ).toEqual([
      [SwFrameSize.Minimum, height],
      [SwFrameSize.Minimum, height],
      [SwFrameSize.Minimum, height],
    ]);
    expect(f.shell.CaptureCursorState()).toEqual(cursor);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(optimize ? 2 : 1);
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    if (optimize) fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(
      f.table
        .GetTabLines()
        .map(
          /** Reads restored fixed items. @param row - Original row. @returns Height. */ (row) =>
            row.GetFrameSize().GetHeight(),
        ),
    ).toEqual([900, 300, 600]);
  },
);
it.each(["Optimal Row Height", "Distribute Rows Evenly"])(
  "executes the source Table Size menu command %s",
  /** Checks generated placement and native command state. @param label - Original resource. @returns Nothing. */ (
    label,
  ) => {
    const f = fixture();
    fireEvent.click(
      within(screen.getByRole("toolbar", { name: "Writer table toolbar" })).getByRole("button", {
        name: "Select Table",
      }),
    );
    fireEvent.click(screen.getByRole("menuitem", { name: "Table" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Size" }));
    fireEvent.click(screen.getByRole("menuitem", { name: label }));
    expect(f.table.GetTabLines()[0]?.GetFrameSize().GetHeightSizeType()).toBe(SwFrameSize.Minimum);
  },
);
