/** @fileoverview Verifies mounted selected-row deletion through native browser intents and history. */
import { render, cleanup, screen, fireEvent, act, within } from "@testing-library/react";
import { afterEach, it, expect } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Verifies native selected text deletion.  @returns Operation result. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Requires a connected owner. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing mounted delete owner");
  return value;
}
/** Creates mounted actual multi-paragraph table text. @returns Native owners. */
function fixture() {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    table = doc.nodes.MakeTableNode("Grid");
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  const row = doc.nodes.AppendTableRow(table, 2),
    other = doc.nodes.AppendTableRow(table, 2),
    first = required(required(row.GetTabBoxes()[0]).GetParagraphs()[0]),
    second = required(required(row.GetTabBoxes()[1]).GetParagraphs()[0]),
    keep = required(required(other.GetTabBoxes()[0]).GetParagraphs()[0]);
  first.SetText("First");
  second.SetText("Second");
  keep.SetText("Keep");
  const tail = doc.nodes.AppendTableCellParagraph(required(row.GetTabBoxes()[0]));
  tail.SetText("Tail");
  render(<WriterWorkbench isActive view={session.view} />);
  return { doc, table, first, second, tail, keep, shell: session.view.GetWrtShell() };
}
/** Dispatches one canceled native mutation intent. @param element - Actual paragraph. @param inputType - Browser intent. @param data - Inserted text. @returns Event. */
function input(element: HTMLElement, inputType: string, data: string | null = null) {
  const event = new InputEvent("beforeinput", { bubbles: true, cancelable: true, inputType, data });
  act(
    /** Verifies native selected text deletion.  @returns Operation result. */ () => {
      element.dispatchEvent(event);
    },
  );
  return event;
}
it.each(["Delete", "Backspace"] as const)(
  "mounted %s deletes selected row cells and reconstructs one Undo boundary",
  /** Verifies native selected text deletion. @param key - Current owner. @returns Operation result. */ (
    key,
  ) => {
    const f = fixture();
    fireEvent.click(screen.getByRole("button", { name: "Select row 1 in Grid" }));
    const table = screen.getByRole("table", { name: "Grid" }),
      first = within(table).getByLabelText("Row 1 column 1 paragraph 1");
    expect(table.querySelectorAll('[data-writer-editor-selected="true"]')).toHaveLength(2);
    if (key === "Backspace") expect(fireEvent.keyDown(first, { key })).toBe(false);
    else expect(input(first, "deleteContentForward").defaultPrevented).toBe(true);
    expect(f.first.GetText()).toBe("");
    expect(f.second.GetText()).toBe("");
    expect(f.keep.GetText()).toBe("Keep");
    expect(table.querySelectorAll('[data-writer-editor-selected="true"]')).toHaveLength(0);
    expect(within(table).queryByLabelText("Row 1 column 1 paragraph 2")).toBeNull();
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    expect(f.shell.HasBoxSelection()).toBe(false);
    act(
      /** Verifies native selected text deletion.  @returns Operation result. */ () => {
        expect(f.shell.Undo()).toBe(true);
      },
    );
    expect(within(table).getByLabelText("Row 1 column 1 paragraph 2")).toHaveTextContent("Tail");
    expect(f.first.GetText()).toBe("First");
    expect(f.second.GetText()).toBe("Second");
    expect(table.querySelectorAll('[data-writer-editor-selected="true"]')).toHaveLength(2);
    act(
      /** Verifies native selected text deletion.  @returns Operation result. */ () => {
        expect(f.shell.Redo()).toBe(true);
      },
    );
    expect(table.querySelectorAll('[data-writer-editor-selected="true"]')).toHaveLength(0);
    expect(
      input(within(table).getByLabelText("Row 1 column 1 paragraph 1"), "insertText", "New")
        .defaultPrevented,
    ).toBe(true);
    expect(f.first.GetText()).toBe("New");
    expect(f.second.GetText()).toBe("");
    expect(f.keep.GetText()).toBe("Keep");
  },
);
