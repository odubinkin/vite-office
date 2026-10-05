/** @fileoverview Checks mounted Ctrl Home End selection delegates to native cursor owners. */
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
/** Checks native and DOM point identity. @param f - Fixture. @param label - Mounted paragraph label. @param node - Native text owner. @param offset - Literal offset. @returns Nothing. */
function caret(f: ReturnType<typeof fixture>, label: string, node: typeof f.body, offset: number) {
  expect(f.shell.getShellCursor().GetPoint().GetNode()).toBe(node);
  expect(f.shell.getShellCursor().GetPoint().GetContentIndex()).toBe(offset);
  const element = screen.getByLabelText(label),
    selection = window.getSelection();
  expect(element.contains(selection?.focusNode ?? null)).toBe(true);
  expect(selection?.focusOffset).toBe(offset);
}
describe("native section navigation UI", /** Registers native selection and browser intent contracts. @returns Nothing. */ () => {
  it.each(["Home", "End"] as const)(
    "%s traverses cell then table then body",
    /** Checks actual repeated Ctrl key route and DOM restore. @param key - Native direction. @returns Nothing. */ (
      key,
    ) => {
      const f = fixture(),
        tail = screen.getByLabelText("Row 1 column 2 paragraph 2");
      select(tail, 2);
      expect(fireEvent.keyDown(tail, { key, ctrlKey: true })).toBe(false);
      caret(
        f,
        key === "Home" ? "Row 1 column 2 paragraph 1" : "Row 1 column 2 paragraph 2",
        key === "Home" ? f.second : f.tail,
        key === "Home" ? 0 : 4,
      );
      const current = screen.getByLabelText(
        key === "Home" ? "Row 1 column 2 paragraph 1" : "Row 1 column 2 paragraph 2",
      );
      expect(fireEvent.keyDown(current, { key, ctrlKey: true })).toBe(false);
      if (key === "Home") {
        caret(f, "Row 1 column 1 paragraph 1", f.first, 0);
        expect(
          fireEvent.keyDown(screen.getByLabelText("Row 1 column 1 paragraph 1"), {
            key,
            ctrlKey: true,
          }),
        ).toBe(false);
      }
      const point = f.shell.getShellCursor().GetPoint();
      expect(point.GetNode()).toBe(key === "Home" ? f.body : f.after);
      expect(point.GetContentIndex()).toBe(key === "Home" ? 0 : 5);
      expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    },
  );
  it.each(["Home", "End"] as const)(
    "Shift %s retains cell mark then activates table cursor",
    /** Checks independent table endpoints through repeated DOM synchronization. @param key - Native direction. @returns Nothing. */ (
      key,
    ) => {
      const f = fixture(),
        tail = screen.getByLabelText("Row 1 column 2 paragraph 2");
      select(tail, 2);
      expect(fireEvent.keyDown(tail, { key, ctrlKey: true, shiftKey: true })).toBe(false);
      const ordinary = f.shell.getShellCursor();
      expect(ordinary.GetMark().GetNode()).toBe(f.tail);
      expect(ordinary.GetMark().GetContentIndex()).toBe(2);
      expect(window.getSelection()?.anchorOffset).toBe(2);
      const label = key === "Home" ? "Row 1 column 2 paragraph 1" : "Row 1 column 2 paragraph 2";
      expect(
        fireEvent.keyDown(screen.getByLabelText(label), { key, ctrlKey: true, shiftKey: true }),
      ).toBe(false);
      expect(f.shell.getShellCursor()).toBeInstanceOf(SwTableCursor);
      expect(f.shell.getShellCursor()).not.toBe(ordinary);
      expect(f.shell.HasBoxSelection()).toBe(true);
      expect(ordinary.HasMark()).toBe(true);
      expect(ordinary.GetMark().GetContentIndex()).toBe(0);
      expect(ordinary.GetPoint().GetContentIndex()).toBe(
        key === "Home" ? f.first.Len() : f.tail.Len(),
      );
      expect(ordinary.GetPoint().GetNode().StartOfSectionNode()).toBe(
        ordinary.GetMark().GetNode().StartOfSectionNode(),
      );
      expect(f.shell.getShellCursor().GetMark().GetNode()).toBe(key === "Home" ? f.second : f.tail);
      expect(f.shell.getShellCursor().GetMark().GetContentIndex()).toBe(key === "Home" ? 0 : 4);
      expect(
        fireEvent.keyDown(
          screen.getByLabelText(key === "Home" ? "Row 1 column 1 paragraph 1" : label),
          { key, ctrlKey: true },
        ),
      ).toBe(false);
      expect(f.shell.HasBoxSelection()).toBe(false);
      expect(f.shell.getShellCursor()).toBe(ordinary);
    },
  );
  it("accepts Meta intent and leaves visual-line,Alt,composition and unavailable selection unhandled", /** Checks translation does not guess native cursor from DOM siblings. @returns Nothing. */ () => {
    const f = fixture(),
      tail = screen.getByLabelText("Row 1 column 2 paragraph 2");
    for (const mods of [
      {},
      { ctrlKey: true, altKey: true },
      { ctrlKey: true, isComposing: true },
    ]) {
      select(tail, 2);
      expect(fireEvent.keyDown(tail, { key: "Home", ...mods })).toBe(true);
    }
    select(tail, 2);
    expect(fireEvent.keyDown(tail, { key: "Home", metaKey: true })).toBe(false);
    caret(f, "Row 1 column 2 paragraph 1", f.second, 0);
    window.getSelection()?.removeAllRanges();
    expect(fireEvent.keyDown(tail, { key: "End", ctrlKey: true })).toBe(true);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  });
  it("preserves reversed DOM marks during first cell movement and refreshes later input", /** Checks first cell selection remains actual point and mark, then native typing. @returns Nothing. */ () => {
    const f = fixture(),
      tail = screen.getByLabelText("Row 1 column 2 paragraph 2");
    select(tail, 1, 3);
    expect(fireEvent.keyDown(tail, { key: "End", ctrlKey: true, shiftKey: true })).toBe(false);
    expect(f.shell.getShellCursor().GetMark().GetContentIndex()).toBe(3);
    caret(f, "Row 1 column 2 paragraph 2", f.tail, 4);
    expect(window.getSelection()?.anchorOffset).toBe(3);
    expect(fireEvent.keyDown(tail, { key: "Home", ctrlKey: true })).toBe(false);
    act(
      /** Inserts through actual core after selection kill. @returns Nothing. */ () => {
        expect(f.shell.Insert("X")).toBe(true);
      },
    );
    expect(screen.getByLabelText("Row 1 column 2 paragraph 1")).toHaveTextContent("XSecond");
    expect(f.tail.GetText()).toBe("Tail");
  });
});

it("inherits one document editing host for table paragraphs and restores a whole cell range", /** Checks the removed nested editing-host adapter and actual native endpoints. @returns Nothing. */ () => {
  const f = fixture(),
    second = screen.getByLabelText("Row 1 column 2 paragraph 1"),
    tail = screen.getByLabelText("Row 1 column 2 paragraph 2"),
    root = second.closest("[data-writer-editing-host]");
  expect(root).toHaveAttribute("contenteditable", "true");
  expect(second).not.toHaveAttribute("contenteditable");
  expect(tail).not.toHaveAttribute("contenteditable");
  expect(second.closest("[data-writer-table]")).not.toHaveAttribute("contenteditable");
  expect(second.closest("[contenteditable]")).toBe(root);
  expect(tail.closest("[contenteditable]")).toBe(root);
  select(tail, 4);
  expect(fireEvent.keyDown(tail, { key: "Home", ctrlKey: true, shiftKey: true })).toBe(false);
  caret(f, "Row 1 column 2 paragraph 1", f.second, 0);
  expect(window.getSelection()?.toString()).toContain("Second");
  expect(window.getSelection()?.toString()).toContain("Tail");
  expect(f.shell.getShellCursor().GetMark().GetNode()).toBe(f.tail);
  expect(f.shell.getShellCursor().GetMark().GetContentIndex()).toBe(4);
});
