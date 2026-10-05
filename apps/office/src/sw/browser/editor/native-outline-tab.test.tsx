/** @fileoverview Checks native heading Tab style/caret/history behavior through the mounted Writer session. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { SwPosition } from "../../source/core/crsr/pam";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases real session and DOM ownership. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Builds an actual mounted heading and independent table. @param level - Heading style. @returns Owners. */
function fixture(level = 2) {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    body = doc.paragraphs[0];
  if (body === undefined) throw new Error("Missing outline body");
  body.SetText("Heading");
  body.ChgFormatColl(doc.GetTextFormatColl(`heading-${level}`));
  const table = doc.nodes.MakeTableNode("Outline", {}, body);
  table.AddColumnWidth(2400);
  const row = doc.nodes.AppendTableRow(table, 1),
    cell = row.GetTabBoxes()[0]?.GetParagraphs()[0];
  if (cell === undefined) throw new Error("Missing outline neighbor");
  cell.SetText("Neighbor");
  const point = new SwPosition(body, 0);
  try {
    session.view.GetWrtShell().SetCursor(point);
  } finally {
    point.Dispose();
  }
  doc.GetUndoManager().Clear();
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
    table,
    editor: screen.getByRole("textbox", { name: "Writer document text" }),
  };
}
/** Assigns real collapsed DOM selection. @param editor - Editing host. @param offset - Text offset. @returns Nothing. */
function select(editor: HTMLElement, offset = 0): void {
  const text = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT).nextNode(),
    selection = window.getSelection();
  if (text === null || selection === null) throw new Error("Missing heading selection");
  editor.focus();
  selection.setBaseAndExtent(text, offset, text, offset);
}
describe("native outline Tab UI", /** Registers mounted actual outline behavior. @returns Nothing. */ () => {
  it("gives an actual numbering rule priority over the assigned heading style", /** Checks native list-before-outline key priority on the same node. @returns Nothing. */ () => {
    const f = fixture();
    act(
      /** Applies the actual list through the native shell. @returns Nothing. */ () => {
        f.session.view.GetWrtShell().SetParagraphListKind("numbered");
        f.body.SetAttrListLevel(2);
        f.doc.GetUndoManager().Clear();
      },
    );
    select(f.editor);
    expect(fireEvent.keyDown(f.editor, { key: "Tab" })).toBe(false);
    expect(f.editor).toHaveAttribute("data-list-level", "3");
    expect(f.editor).toHaveAttribute("data-style", "heading-2");
    expect(fireEvent.keyDown(f.editor, { key: "Tab", shiftKey: true })).toBe(false);
    expect(f.editor).toHaveAttribute("data-list-level", "2");
    expect(f.editor).toHaveAttribute("data-style", "heading-2");
  });
  it("changes assigned heading styles and retains caret with native UndoRedo", /** Checks actual style assignment instead of literal Tab or browser focus escape. @returns Nothing. */ () => {
    const f = fixture();
    select(f.editor);
    expect(fireEvent.keyDown(f.editor, { key: "Tab" })).toBe(false);
    expect(f.editor).toHaveAttribute("data-style", "heading-3");
    expect(f.editor.textContent).toBe("Heading");
    expect(f.session.view.GetWrtShell().GetCursor().GetPoint().GetContentIndex()).toBe(0);
    expect(f.editor.contains(window.getSelection()?.focusNode ?? null)).toBe(true);
    expect(fireEvent.keyDown(f.editor, { key: "Tab", shiftKey: true })).toBe(false);
    expect(f.editor).toHaveAttribute("data-style", "heading-2");
    act(
      /** Undoes real native outline promotion. @returns Nothing. */ () => {
        expect(f.session.view.GetEditWin().Undo()).toBe(true);
      },
    );
    expect(f.editor).toHaveAttribute("data-style", "heading-3");
    act(
      /** Redoes real native outline promotion. @returns Nothing. */ () => {
        expect(f.session.view.GetEditWin().Redo()).toBe(true);
      },
    );
    expect(f.editor).toHaveAttribute("data-style", "heading-2");
    expect(screen.getByLabelText("Row 1 column 1 paragraph 1")).toHaveTextContent("Neighbor");
    expect(f.table.GetTabLines()).toHaveLength(1);
  });
  it.each([
    [1, true, "Heading"],
    [10, false, "\tHeading"],
  ] as const)(
    "keeps native heading boundary %s shift=%s",
    /** Checks native top End and bottom InsTab behaviors. @param level - Assigned boundary. @param shift - Direction. @param text - Literal result. @returns Nothing. */ (
      level,
      shift,
      text,
    ) => {
      const f = fixture(level);
      select(f.editor);
      expect(fireEvent.keyDown(f.editor, { key: "Tab", shiftKey: shift })).toBe(false);
      expect(f.editor).toHaveAttribute("data-style", `heading-${level}`);
      expect(f.editor.textContent).toBe(text);
    },
  );
  it("inserts ordinary Tab inside a heading without changing its outline style", /** Checks exact paragraph-start priority. @returns Nothing. */ () => {
    const f = fixture();
    select(f.editor, 3);
    expect(fireEvent.keyDown(f.editor, { key: "Tab" })).toBe(false);
    expect(f.editor.textContent).toBe("Hea\tding");
    expect(f.editor).toHaveAttribute("data-style", "heading-2");
  });
});
