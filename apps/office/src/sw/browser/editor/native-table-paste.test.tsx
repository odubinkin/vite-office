/** @fileoverview Checks actual mounted table paste intents retain native cell selection. */
import { render, cleanup, screen, fireEvent, act, within } from "@testing-library/react";
import { it, expect, afterEach } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Exercises native clipboard ownership and history. @returns Test result. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Requires a native owner. @param value - Owner. @returns Defined owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing mounted paste owner");
  return value;
}
it.each(["plain", "inline-html"])(
  "mounted %s paste appends to every selected row cell in one native Undo",
  /** Exercises native clipboard ownership and history. @param kind - Native test input. @returns Test result. */ (
    kind,
  ) => {
    const session = createWriterDocumentSession();
    sessions.push(session);
    const doc = session.docShell.GetDoc(),
      table = doc.nodes.MakeTableNode("Grid");
    table.AddColumnWidth(3000);
    table.AddColumnWidth(3000);
    const row = doc.nodes.AppendTableRow(table, 2),
      other = doc.nodes.AppendTableRow(table, 2);
    const first = required(required(row.GetTabBoxes()[0]).GetParagraphs()[0]),
      second = required(required(row.GetTabBoxes()[1]).GetParagraphs()[0]),
      keep = required(required(other.GetTabBoxes()[0]).GetParagraphs()[0]);
    first.SetText("First");
    second.SetText("Second");
    keep.SetText("Keep");
    const tail = doc.nodes.AppendTableCellParagraph(required(row.GetTabBoxes()[0]));
    tail.SetText("Tail");
    render(<WriterWorkbench isActive view={session.view} />);
    fireEvent.click(screen.getByRole("button", { name: "Select row 1 in Grid" }));
    const element = screen.getByRole("table", { name: "Grid" }),
      target = within(element).getByLabelText("Row 1 column 1 paragraph 1");
    expect(
      fireEvent.paste(target, {
        clipboardData: {
          getData:
            /** Exercises native clipboard ownership and history. @param type - Native test input. @returns Test result. */ (
              type: string,
            ) => (type === "text/plain" ? "X" : kind === "inline-html" ? "<strong>X</strong>" : ""),
        },
      }),
    ).toBe(false);
    expect(first.GetText()).toBe("First");
    expect(tail.GetText()).toBe("TailX");
    expect(second.GetText()).toBe("SecondX");
    expect(keep.GetText()).toBe("Keep");
    expect(within(element).getByLabelText("Row 1 column 1 paragraph 2")).toHaveTextContent("TailX");
    expect(element.querySelectorAll('[data-writer-editor-selected="true"]')).toHaveLength(2);
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    act(
      /** Exercises native clipboard ownership and history. @returns Test result. */ () => {
        expect(session.view.GetWrtShell().Undo()).toBe(true);
      },
    );
    expect(tail.GetText()).toBe("Tail");
    expect(second.GetText()).toBe("Second");
    expect(element.querySelectorAll('[data-writer-editor-selected="true"]')).toHaveLength(2);
    act(
      /** Exercises native clipboard ownership and history. @returns Test result. */ () => {
        expect(session.view.GetWrtShell().Redo()).toBe(true);
      },
    );
    expect(tail.GetText()).toBe("TailX");
    expect(second.GetText()).toBe("SecondX");
    expect(element.querySelectorAll('[data-writer-editor-selected="true"]')).toHaveLength(2);
  },
);
