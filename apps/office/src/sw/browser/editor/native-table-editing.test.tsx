/** @fileoverview Checks table DOM intents reach the actual Writer cursor/input/history instead of post-DOM text diffs. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases actual views and DOM listeners. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Mounts real table cells through the existing workbench. @returns Editing owners. */
function fixture() {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc();
  const table = doc.nodes.MakeTableNode("Table1", {});
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  const row = doc.nodes.AppendTableRow(table, 2),
    box = row.GetTabBoxes()[0];
  if (box === undefined) throw new Error("Missing cell");
  const node = box.GetParagraphs()[0];
  if (node === undefined) throw new Error("Missing paragraph");
  node.SetText("abcd");
  render(
    <WriterWorkbench
      isActive
      view={session.view}
      fileDialogs={session.fileDialogs}
      services={session.services}
    />,
  );
  return { session, doc, box, node, shell: session.view.GetWrtShell() };
}
/** Sets actual DOM endpoints within the rendered cell. @param element - Editable paragraph. @param point - Moving offset. @param mark - Optional anchor offset. @returns Nothing. */
function select(element: HTMLElement, point: number, mark = point) {
  const endpoint =
    /** Resolves an actual UTF-16 DOM endpoint through display portions. @param offset - Native content offset. @returns DOM text endpoint. */ (
      offset: number,
    ): [Node, number] => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      let remaining = offset;
      for (let text = walker.nextNode(); text !== null; text = walker.nextNode()) {
        const length = text.textContent?.length ?? 0;
        if (remaining <= length) return [text, remaining];
        remaining -= length;
      }
      throw new Error("Missing DOM endpoint");
    };
  const selection = window.getSelection();
  if (selection === null) throw new Error("Missing selection");
  const [anchor, anchorOffset] = endpoint(mark),
    [focus, focusOffset] = endpoint(point);
  selection.setBaseAndExtent(anchor, anchorOffset, focus, focusOffset);
}
/** Dispatches the common cancelable input intent. @param element - Cell paragraph. @param inputType - Browser intent. @param data - Optional text. @returns Dispatched event. */
function input(element: HTMLElement, inputType: string, data: string | null = null) {
  const event = new InputEvent("beforeinput", { bubbles: true, cancelable: true, inputType, data });
  act(
    /** Delivers the browser intent through the mounted root. @returns Nothing. */ () => {
      element.dispatchEvent(event);
    },
  );
  return event;
}
describe("native table DOM editing", /** Registers actual mounted editing contracts. @returns Nothing. */ () => {
  it("cancels native mutation and restores selected insertion plus Undo/Redo caret", /** Checks root-owned input, actual PaM and rendered value. @returns Nothing. */ () => {
    const owner = fixture(),
      cell = screen.getByLabelText("Row 1 column 1 paragraph 1");
    select(cell, 3, 1);
    expect(input(cell, "insertText", "XY").defaultPrevented).toBe(true);
    expect(owner.node.GetText()).toBe("aXYd");
    expect(cell).toHaveTextContent("aXYd");
    expect(owner.shell.GetCursor().GetPoint().GetNode()).toBe(owner.node);
    expect(input(cell, "historyUndo").defaultPrevented).toBe(true);
    expect(owner.node.GetText()).toBe("abcd");
    expect(cell).toHaveTextContent("abcd");
    expect(owner.shell.GetCursor().GetMark().GetContentIndex()).toBe(1);
    expect(input(cell, "historyRedo").defaultPrevented).toBe(true);
    expect(cell).toHaveTextContent("aXYd");
    expect(owner.doc.paragraphs[0]?.GetText()).toBe("");
  });
  it("renders cell splits and merges from canonical section history", /** Checks Enter and boundary deletion through the shared editor. @returns Nothing. */ () => {
    const owner = fixture(),
      cell = screen.getByLabelText("Row 1 column 1 paragraph 1");
    select(cell, 2);
    input(cell, "insertParagraph");
    expect(owner.box.GetParagraphs()).toHaveLength(2);
    expect(screen.getByLabelText("Row 1 column 1 paragraph 1")).toHaveTextContent("ab");
    const tail = screen.getByLabelText("Row 1 column 1 paragraph 2");
    expect(tail).toHaveTextContent("cd");
    select(tail, 0);
    input(tail, "deleteContentBackward");
    expect(owner.box.GetParagraphs()).toHaveLength(1);
    expect(cell).toHaveTextContent("abcd");
    input(cell, "historyUndo");
    expect(screen.getByLabelText("Row 1 column 1 paragraph 2")).toHaveTextContent("cd");
  });
  it("routes composition and formatting from cell events to the shell", /** Checks transient input and formatting retain native owners. @returns Nothing. */ () => {
    const owner = fixture(),
      cell = screen.getByLabelText("Row 1 column 1 paragraph 1");
    select(cell, 2);
    fireEvent.compositionStart(cell);
    fireEvent.compositionUpdate(cell, { data: "中" });
    expect(owner.node.GetText()).toBe("abcd");
    fireEvent.compositionEnd(cell, { data: "中" });
    expect(cell).toHaveTextContent("ab中cd");
    select(cell, 2, 0);
    input(cell, "formatBold");
    expect(cell.querySelector("strong")).toHaveTextContent("ab");
    input(cell, "historyUndo");
    expect(cell.querySelector("strong")).toBeNull();
  });
  it("does not commit arbitrary post-input DOM text as a second document model", /** Checks obsolete DOM mutation no longer owns edits. @returns Nothing. */ () => {
    const owner = fixture(),
      cell = screen.getByLabelText("Row 1 column 1 paragraph 1");
    cell.textContent = "foreign";
    fireEvent.input(cell);
    expect(owner.node.GetText()).toBe("abcd");
    expect(owner.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  });
});
