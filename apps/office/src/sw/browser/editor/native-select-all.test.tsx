/** @fileoverview Checks mounted Select All shares native context and DOM endpoints. */
import { cleanup, fireEvent, render, screen, act } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { SwTableCursor } from "../../source/core/crsr/swcrsr";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases real view and DOM owners. @returns Nothing. */ () => {
    cleanup();
    vi.restoreAllMocks();
    for (const s of sessions.splice(0)) s.Close();
  },
);
/** Requires a real fixture member. @param value - Optional owner. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing navigation owner");
  return value;
}
/** Builds actual mounted multi-paragraph cells. @returns Native view owners. */
function fixture() {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    body = required(doc.paragraphs[0]);
  body.SetText("Before");
  const table = doc.nodes.MakeTableNode("Table1", {}, body);
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  const row = doc.nodes.AppendTableRow(table, 2),
    first = required(required(row.GetTabBoxes()[0]).GetParagraphs()[0]),
    second = required(required(row.GetTabBoxes()[1]).GetParagraphs()[0]);
  first.SetText("First");
  second.SetText("Second");
  const tail = doc.nodes.AppendTableCellParagraph(required(row.GetTabBoxes()[1]));
  tail.SetText("Tail");
  const after = doc.nodes.MakeTextNode("After");
  render(
    <WriterWorkbench
      isActive
      view={session.view}
      fileDialogs={session.fileDialogs}
      services={session.services}
    />,
  );
  return {
    session,
    doc,
    body,
    after,
    first,
    second,
    tail,
    table,
    shell: session.view.GetWrtShell(),
  };
}
/** Selects canonical text endpoints in native DOM. @param element - Mounted paragraph. @param point - Moving content offset. @param mark - Fixed offset. @returns Nothing. */
function select(element: HTMLElement, point: number, mark = point) {
  const text = element.firstChild,
    selection = window.getSelection();
  if (text === null || selection === null) throw new Error("Missing DOM selection");
  selection.setBaseAndExtent(text, mark, text, point);
}

describe("native contextual Select All UI", /** Registers actual DOM and shell selection transitions. @returns Nothing. */ () => {
  it.each(["ctrlKey", "metaKey"] as const)(
    "%s synchronizes cell text then selects table and surrounding text",
    /** Checks actual input and repeated DOM restoration without a click counter. @param modifier - Platform intent. @returns Nothing. */ (
      modifier,
    ) => {
      const f = fixture(),
        tail = screen.getByLabelText("Row 1 column 2 paragraph 2");
      select(tail, 2, 1);
      const ordinary = f.shell.getShellCursor(),
        event = { key: "a", [modifier]: true };
      expect(fireEvent.keyDown(tail, event)).toBe(false);
      expect(f.shell.HasBoxSelection()).toBe(false);
      expect(f.shell.getShellCursor().GetPoint().GetNode()).toBe(f.tail);
      expect(f.shell.getShellCursor().GetMark().GetNode()).toBe(f.second);
      expect(window.getSelection()?.toString()).toContain("Second");
      expect(window.getSelection()?.toString()).toContain("Tail");
      expect(window.getSelection()?.toString()).not.toContain("First");
      expect(window.getSelection()?.toString()).not.toContain("Before");
      expect(fireEvent.keyDown(tail, event)).toBe(false);
      expect(f.shell.getShellCursor()).toBeInstanceOf(SwTableCursor);
      expect(f.shell.HasWholeTabSelection()).toBe(true);
      expect(f.shell.GetTableSel()).toHaveLength(2);
      expect(window.getSelection()?.toString()).toContain("First");
      expect(fireEvent.keyDown(tail, event)).toBe(false);
      expect(f.shell.getShellCursor()).toBe(ordinary);
      expect(f.shell.HasBoxSelection()).toBe(false);
      expect(f.shell.getShellCursor().GetPoint().GetNode()).toBe(f.after);
      expect(f.shell.getShellCursor().GetMark().GetNode()).toBe(f.body);
      expect(window.getSelection()?.toString()).toContain("Before");
      expect(window.getSelection()?.toString()).toContain("After");
      expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
      expect(f.table.GetTabLines()).toHaveLength(1);
    },
  );
  it("uses an already full reversed DOM cell range without prior key presses", /** Checks source range state rather than UI history. @returns Nothing. */ () => {
    const f = fixture(),
      first = screen.getByLabelText("Row 1 column 2 paragraph 1"),
      last = screen.getByLabelText("Row 1 column 2 paragraph 2");
    window
      .getSelection()
      ?.setBaseAndExtent(last.firstChild as Node, 4, first.firstChild as Node, 0);
    fireEvent.keyDown(first, { key: "a", ctrlKey: true });
    expect(f.shell.HasWholeTabSelection()).toBe(true);
    expect(f.shell.GetTableSel()).toHaveLength(2);
  });
  it("edits selected cell contents through native history and preserves neighboring text", /** Checks direct edit-window command and follow-up insert/undo/redo. @returns Nothing. */ () => {
    const f = fixture(),
      tail = screen.getByLabelText("Row 1 column 2 paragraph 2");
    select(tail, 2);
    fireEvent.keyDown(tail, { key: "a", ctrlKey: true });
    act(
      /** Inserts through actual shell selection. @returns Nothing. */ () => {
        expect(f.shell.Insert("Replacement")).toBe(true);
      },
    );
    expect(f.second.GetText()).toBe("Replacement");
    expect(f.first.GetText()).toBe("First");
    expect(f.body.GetText()).toBe("Before");
    expect(f.after.GetText()).toBe("After");
    act(
      /** Replays native document history. @returns Nothing. */ () => {
        f.shell.Undo();
      },
    );
    expect(f.second.GetText()).toBe("Second");
    expect(f.tail.GetText()).toBe("Tail");
    act(
      /** Replays selected native cell replacement. @returns Nothing. */ () => {
        f.shell.Redo();
      },
    );
    expect(f.second.GetText()).toBe("Replacement");
    expect(f.first.GetText()).toBe("First");
  });
  it("keeps the native selection command usable when DOM selection is temporarily unavailable", /** Checks persistent owner fallback for the existing browser command contract. @returns Nothing. */ () => {
    const f = fixture();
    window.getSelection()?.removeAllRanges();
    fireEvent.keyDown(screen.getByLabelText("Writer document text"), { key: "a", ctrlKey: true });
    expect(f.shell.getShellCursor().GetPoint().GetNode()).toBe(f.after);
    expect(f.shell.getShellCursor().GetMark().GetNode()).toBe(f.body);
  });
});
