/** @fileoverview Checks mounted table pointer hits use actual native caret and row owners. */
import { selectMountedTableRow } from "../../../../test-support/table-mouse-dom";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { SwPosition } from "../../source/core/crsr/pam";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Closes views and geometry seams. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
    Reflect.deleteProperty(document, "caretRangeFromPoint");
    Reflect.deleteProperty(document, "elementFromPoint");
  },
);

/** Mounts actual connected table nodes and injected browser geometry. @param empty - Empty target. @param list - Native numbered target. @returns Native and DOM owners. */
function fixture(empty = false, list = false) {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    body = doc.paragraphs[0],
    table = doc.nodes.MakeTableNode("Pointer", { width: 4000 }, body);
  table.AddColumnWidth(2000);
  table.AddColumnWidth(2000);
  const boxes = doc.nodes.AppendTableRow(table, 2).GetTabBoxes(),
    first = boxes[0]?.GetParagraphs()[0],
    target = boxes[1]?.GetParagraphs()[0];
  if (first === undefined || target === undefined || body === undefined)
    throw new Error("Missing native pointer fixture");
  body.SetText("Body");
  first.SetText("Keep");
  target.SetText(empty ? "" : "Cell");
  if (list) {
    const point = new SwPosition(target, 0);
    try {
      session.view.GetWrtShell().SetCursor(point);
    } finally {
      point.Dispose();
    }
    session.view.GetWrtShell().SetParagraphListKind("numbered");
  }
  doc.GetUndoManager().Clear();
  let hit: Element | null = null,
    caret: Range | null = null;
  Object.defineProperty(document, "elementFromPoint", {
    configurable: true,
    value: /** Supplies the actual hovered cell. @returns Cell. */ () => hit,
  });
  Object.defineProperty(document, "caretRangeFromPoint", {
    configurable: true,
    value: /** Supplies actual DOM caret geometry. @returns Range. */ () => caret,
  });
  render(
    <WriterWorkbench
      isActive
      view={session.view}
      fileDialogs={session.fileDialogs}
      services={session.services}
    />,
  );
  const editor = screen.getByLabelText("Row 1 column 2 paragraph 1"),
    cell = editor.closest("[data-writer-table-box]");
  if (cell === null) throw new Error("Missing projected cell");
  hit = cell;
  caret = document.createRange();
  const text = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT).nextNode();
  caret.setStart(text ?? editor, empty ? 0 : 2);
  caret.collapse(true);
  return {
    session,
    doc,
    body,
    first,
    target,
    editor,
    cell,
    tableElement: screen.getByRole("table", { name: "Pointer" }),
  };
}
/** Dispatches one complete actual browser cell gesture. @param element - Cell or marker. @returns Nothing. */
function click(element: Element): void {
  fireEvent.mouseDown(element, { button: 0, clientX: 5, clientY: 10 });
  fireEvent.mouseUp(element, { button: 0, clientX: 5, clientY: 10 });
  fireEvent.click(element);
}
/** Types through the root-owned cancelable native input event. @param editor - Actual paragraph. @returns Nothing. */
function type(editor: HTMLElement): void {
  const event = new InputEvent("beforeinput", {
    bubbles: true,
    cancelable: true,
    inputType: "insertText",
    data: "X",
  });
  act(
    /** Delivers actual root input. @returns Nothing. */ () => {
      editor.dispatchEvent(event);
    },
  );
  expect(event.defaultPrevented).toBe(true);
}

it.each([false, true])(
  "cell padding clears row selection and types through native caret empty=%s",
  /** Checks actual native point and history after a padded hit. @param empty - Empty target. @returns Nothing. */ (
    empty,
  ) => {
    const f = fixture(empty);
    selectMountedTableRow("Pointer", 1);
    expect(f.session.view.GetWrtShell().HasBoxSelection()).toBe(true);
    click(f.cell);
    expect(f.session.view.GetWrtShell().HasBoxSelection()).toBe(false);
    expect(f.session.view.GetWrtShell().getShellCursor().GetPoint().GetNode()).toBe(f.target);
    expect(f.tableElement.querySelectorAll('[data-writer-editor-selected="true"]')).toHaveLength(0);
    type(f.editor);
    expect(f.target.GetText()).toBe(empty ? "X" : "CeXll");
    expect(f.first.GetText()).toBe("Keep");
    expect(f.body.GetText()).toBe("Body");
    act(
      /** Undoes actual native input. @returns Nothing. */ () => {
        expect(f.session.view.GetEditWin().Undo()).toBe(true);
      },
    );
    expect(f.target.GetText()).toBe(empty ? "" : "Cell");
  },
);

it("list marker click inside a cell never becomes row selection", /** Checks list presentation follows the existing text pointer owner. @returns Nothing. */ () => {
  const f = fixture(false, true),
    marker = f.cell.querySelector("[data-writer-list-marker]");
  if (marker === null) throw new Error("Missing native list marker");
  click(marker);
  expect(f.session.view.GetWrtShell().HasBoxSelection()).toBe(false);
  expect(f.session.view.GetWrtShell().getShellCursor().GetPoint().GetNode()).toBe(f.target);
  expect(f.target.IsInList()).toBe(true);
  type(f.editor);
  expect(f.target.GetText()).toBe("CeXll");
  expect(f.editor).toHaveAttribute("data-list-kind", "numbered");
  expect(f.first.GetText()).toBe("Keep");
});

it("explicit row gutter retains native boxes while cell and row surfaces never infer a row operation", /** Checks accessible row gesture remains outside text flow. @returns Nothing. */ () => {
  const f = fixture();
  expect(screen.queryByRole("button", { name: "Select row 1 in Pointer" })).toBeNull();
  expect(selectMountedTableRow("Pointer", 1)).toBe(true);
  expect(f.session.view.GetWrtShell().HasBoxSelection()).toBe(true);
  expect(f.tableElement.querySelectorAll('[data-writer-editor-selected="true"]')).toHaveLength(2);
  click(f.cell);
  const row = f.cell.closest("tr");
  if (row === null) throw new Error("Missing row");
  fireEvent.click(row);
  expect(f.session.view.GetWrtShell().HasBoxSelection()).toBe(false);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});
