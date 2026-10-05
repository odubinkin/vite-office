/** @fileoverview Verifies mounted native row formatting covers first and last cell text and retains history. */
import { render, cleanup, screen, fireEvent, act, within } from "@testing-library/react";
import { afterEach, it, expect } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Checks actual table selection behavior.  @returns Operation result. */ () => {
    cleanup();
    for (const s of sessions.splice(0)) s.Close();
  },
);
/** Requires a connected owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing mounted ring owner");
  return value;
}
/** Builds mounted actual table text. @returns Canonical view. */
function fixture() {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    table = doc.nodes.MakeTableNode("Grid");
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  const row = doc.nodes.AppendTableRow(table, 2);
  doc.nodes.AppendTableRow(table, 2);
  const first = required(required(row.GetTabBoxes()[0]).GetParagraphs()[0]),
    second = required(required(row.GetTabBoxes()[1]).GetParagraphs()[0]);
  first.SetText("First");
  second.SetText("Second");
  const tail = doc.nodes.AppendTableCellParagraph(required(row.GetTabBoxes()[0]));
  tail.SetText("Tail");
  render(<WriterWorkbench isActive view={session.view} />);
  return { session, doc, table, first, second, tail, shell: session.view.GetWrtShell() };
}
it.each(["Bold", "Italic"] as const)(
  "mounted %s uses complete per-cell ranges and preserves painted rows through history",
  /** Checks actual table selection behavior. @param name - Current owner. @returns Operation result. */ (
    name,
  ) => {
    const f = fixture();
    fireEvent.click(screen.getByRole("button", { name: "Select row 1 in Grid" }));
    const table = screen.getByRole("table", { name: "Grid" });
    expect(table.querySelectorAll('[data-writer-editor-selected="true"]')).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name }));
    for (const node of [f.first, f.tail, f.second])
      expect(node.GetTextRangeFormatState(0, node.Len(), name === "Bold" ? "bold" : "italic")).toBe(
        "on",
      );
    expect(screen.getByRole("button", { name })).toHaveAttribute("aria-pressed", "true");
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    act(
      /** Checks actual table selection behavior.  @returns Operation result. */ () => {
        expect(f.shell.Undo()).toBe(true);
      },
    );
    expect(screen.getByRole("button", { name })).toHaveAttribute("aria-pressed", "false");
    expect(table.querySelectorAll('[data-writer-editor-selected="true"]')).toHaveLength(2);
    act(
      /** Checks actual table selection behavior.  @returns Operation result. */ () => {
        expect(f.shell.Redo()).toBe(true);
      },
    );
    expect(screen.getByRole("button", { name })).toHaveAttribute("aria-pressed", "true");
    expect(f.shell.HasBoxSelection()).toBe(true);
    expect([...f.shell.GetCursor().GetRingContainer()]).toHaveLength(2);
    expect(within(table).getByLabelText("Row 1 column 1 paragraph 1")).toHaveTextContent("First");
  },
);
