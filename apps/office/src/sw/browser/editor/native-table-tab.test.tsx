/** @fileoverview Verifies real mounted table Tab uses SwEditWin/native sections instead of browser focus traversal. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type React from "react";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { BrowserWriterEditWindow } from "./browser-writer-edit-window";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases actual DOM and view owners. @returns Nothing. */ () => {
    cleanup();
    vi.restoreAllMocks();
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Builds a mounted multi-row table. @returns Real table and view owners. */
/** Requires an actual fixture owner. @param value - Optional member. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing table DOM owner");
  return value;
}
/** Builds a mounted multi-row table. @returns Real table and view owners. */
function fixture() {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    table = doc.nodes.MakeTableNode("Table1", {});
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  const rows = [doc.nodes.AppendTableRow(table, 2), doc.nodes.AppendTableRow(table, 2)],
    cells = rows.flatMap(
      /** Reads real section text owners. @param row - Table line. @returns First text per box. */ (
        row,
      ) =>
        row
          .GetTabBoxes()
          .map(
            /** Reads first native paragraph. @param box - Native box. @returns Text node. */ (
              box,
            ) => required(box.GetParagraphs()[0]),
          ),
    );
  cells.forEach(
    /** Sets fixed test content. @param node - Actual cell. @param index - Literal ordinal. @returns Nothing. */ (
      node,
      index,
    ) => node.SetText("Cell" + index),
  );
  const extra = doc.nodes.AppendTableCellParagraph(required(required(rows[0]).GetTabBoxes()[1]));
  extra.SetText("Tail");
  render(
    <WriterWorkbench
      isActive
      view={session.view}
      fileDialogs={session.fileDialogs}
      services={session.services}
    />,
  );
  return { session, doc, table, cells, extra, shell: session.view.GetWrtShell() };
}
/** Selects actual DOM text offsets and preserves direction. @param element - Editable paragraph. @param point - Moving offset. @param mark - Fixed offset. @returns Nothing. */
function select(element: HTMLElement, point = 0, mark = point) {
  const text = element.firstChild;
  if (text === null) throw new Error("Missing DOM text");
  const selection = window.getSelection();
  if (selection === null) throw new Error("Missing selection");
  selection.setBaseAndExtent(text, mark, text, point);
}
/** Checks restored DOM and native caret. @param f - Fixture. @param ordinal - Native cell index. @param label - Literal mounted paragraph name. @returns Nothing. */
function caret(f: ReturnType<typeof fixture>, ordinal: number, label: string) {
  expect(f.shell.GetCursor().GetPoint().GetNode()).toBe(f.cells[ordinal]);
  expect(f.shell.GetCursor().GetPoint().GetContentIndex()).toBe(0);
  const element = screen.getByLabelText(label),
    selection = window.getSelection();
  expect(element.contains(selection?.focusNode ?? null)).toBe(true);
  expect(selection?.focusOffset).toBe(0);
}
describe("native table Tab UI", /** Registers actual mounted cell traversal contracts. @returns Nothing. */ () => {
  it("moves to first paragraphs across rows and keeps Tab inside table boundaries", /** Checks native cursor and DOM restoration after both directions. @returns Nothing. */ () => {
    const f = fixture(),
      first = screen.getByLabelText("Row 1 column 1 paragraph 1");
    select(first, 3);
    expect(fireEvent.keyDown(first, { key: "Tab" })).toBe(false);
    caret(f, 1, "Row 1 column 2 paragraph 1");
    const tail = screen.getByLabelText("Row 1 column 2 paragraph 2");
    select(tail, 2);
    expect(fireEvent.keyDown(tail, { key: "Tab" })).toBe(false);
    caret(f, 2, "Row 2 column 1 paragraph 1");
    const third = screen.getByLabelText("Row 2 column 1 paragraph 1");
    expect(fireEvent.keyDown(third, { key: "Tab", shiftKey: true })).toBe(false);
    caret(f, 1, "Row 1 column 2 paragraph 1");
    const second = screen.getByLabelText("Row 1 column 2 paragraph 1");
    expect(fireEvent.keyDown(second, { key: "Tab", shiftKey: true })).toBe(false);
    caret(f, 0, "Row 1 column 1 paragraph 1");
    expect(fireEvent.keyDown(first, { key: "Tab", shiftKey: true })).toBe(false);
    caret(f, 0, "Row 1 column 1 paragraph 1");
    expect(f.table.GetTabLines()).toHaveLength(2);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  });
  it("renders appended empty cells and restores native row/cursor with UndoRedo", /** Checks append and DOM updates share Writer history. @returns Nothing. */ () => {
    const f = fixture(),
      last = screen.getByLabelText("Row 2 column 2 paragraph 1");
    select(last, 3);
    expect(fireEvent.keyDown(last, { key: "Tab" })).toBe(false);
    const fresh = screen.getByLabelText("Row 3 column 1 paragraph 1"),
      row = required(f.table.GetTabLines()[2]),
      node = required(required(row.GetTabBoxes()[0]).GetParagraphs()[0]);
    expect(fresh).toHaveTextContent("");
    expect(f.shell.GetCursor().GetPoint().GetNode()).toBe(node);
    expect(fresh.contains(window.getSelection()?.focusNode ?? null)).toBe(true);
    act(
      /** Undoes native appended row. @returns Nothing. */ () => {
        expect(f.shell.Undo()).toBe(true);
      },
    );
    expect(screen.queryByLabelText("Row 3 column 1 paragraph 1")).toBeNull();
    expect(f.shell.GetCursor().GetPoint().GetNode()).toBe(f.cells[3]);
    expect(f.shell.GetCursor().GetPoint().GetContentIndex()).toBe(3);
    act(
      /** Reconnects actual appended row owners. @returns Nothing. */ () => {
        expect(f.shell.Redo()).toBe(true);
      },
    );
    expect(f.table.GetTabLines()[2]).toBe(row);
    expect(f.shell.GetCursor().GetPoint().GetNode()).toBe(node);
    expect(screen.getByLabelText("Row 3 column 1 paragraph 1")).toHaveTextContent("");
    expect(f.doc.paragraphs[0]?.GetText()).toBe("");
    expect(last).toHaveTextContent("Cell3");
  });
  it.each([false, true])(
    "retains marked last-cell selection without appending reverse=%s",
    /** Checks native marked boundary and direction. @param reverse - Point before anchor. @returns Nothing. */ (
      reverse,
    ) => {
      const f = fixture(),
        last = screen.getByLabelText("Row 2 column 2 paragraph 1");
      select(last, reverse ? 1 : 4, reverse ? 4 : 1);
      expect(fireEvent.keyDown(last, { key: "Tab" })).toBe(false);
      expect(f.table.GetTabLines()).toHaveLength(2);
      expect(f.shell.GetCursor().GetPoint().GetContentIndex()).toBe(reverse ? 1 : 4);
      expect(f.shell.GetCursor().GetMark().GetContentIndex()).toBe(reverse ? 4 : 1);
      expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    },
  );
  it("keeps list-start priority in the core edit window", /** Checks numbering changes rather than cell navigation. @returns Nothing. */ () => {
    const f = fixture(),
      node = required(f.cells[3]);
    act(
      /** Assigns the real cell rule. @returns Nothing. */ () => {
        f.shell.FocusNode(node);
        f.shell.SetParagraphListKind("numbered");
        node.SetAttrListLevel(2);
        f.doc.GetUndoManager().Clear();
      },
    );
    const cell = screen.getByLabelText("Row 2 column 2 paragraph 1");
    const selection = window.getSelection();
    selection?.setBaseAndExtent(cell, 0, cell, 0);
    expect(fireEvent.keyDown(cell, { key: "Tab" })).toBe(false);
    expect(node.GetActualListLevel()).toBe(3);
    expect(f.shell.GetCursor().GetPoint().GetNode()).toBe(node);
    expect(f.table.GetTabLines()).toHaveLength(2);
    expect(fireEvent.keyDown(cell, { key: "Tab", shiftKey: true })).toBe(false);
    expect(node.GetActualListLevel()).toBe(2);
  });
  it("handles body Tab while preserving modified,composing and unavailable DOM boundaries", /** Checks event translation owns ordinary body and cell Tab while retaining platform boundaries. @returns Nothing. */ () => {
    const f = fixture(),
      cell = screen.getByLabelText("Row 1 column 1 paragraph 1");
    for (const modifiers of [
      { ctrlKey: true },
      { metaKey: true },
      { altKey: true },
      { isComposing: true },
    ]) {
      select(cell, 2);
      expect(fireEvent.keyDown(cell, { key: "Tab", ...modifiers })).toBe(true);
    }
    const body = screen.getByRole("textbox", { name: "Writer document text" });
    window.getSelection()?.setBaseAndExtent(body, 0, body, 0);
    expect(fireEvent.keyDown(body, { key: "Tab" })).toBe(false);
    expect(body.textContent).toBe("\t");
    window.getSelection()?.removeAllRanges();
    expect(fireEvent.keyDown(cell, { key: "Tab" })).toBe(true);
    expect(f.table.GetTabLines()).toHaveLength(2);
    const adapter = new BrowserWriterEditWindow(
        f.session.view.GetEditWin(),
        {
          document,
          getSelection: /** Supplies unavailable platform selection. @returns No selection. */ () =>
            null,
        },
        /** Resolves no current projection. @returns No paragraph. */ () => undefined,
      ),
      preventDefault = vi.fn();
    adapter.HandleKeyDown({
      key: "Tab",
      ctrlKey: false,
      metaKey: false,
      altKey: false,
      shiftKey: false,
      nativeEvent: { isComposing: false },
      preventDefault,
    } as unknown as React.KeyboardEvent<HTMLElement>);
    expect(preventDefault).not.toHaveBeenCalled();
  });
});
