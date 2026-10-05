/** @fileoverview Checks mounted ordinary paragraph Tab delegates to native list/text owners without focus escape. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { createWriterNumFormat } from "../../source/core/doc/number";
import { SwPosition } from "../../source/core/crsr/pam";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases DOM and actual native view owners. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Requires an actual owner. @param value - Optional member. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing paragraph Tab DOM owner");
  return value;
}
/** Builds a mounted actual body, optional real list and independent table. @param kind - Optional list family. @param sameIndent - Equal NUMBER_NONE levels. @returns Actual owners and DOM. */
function fixture(kind?: "bullet" | "numbered", sameIndent = false) {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    body = required(doc.paragraphs[0]),
    shell = session.view.GetWrtShell();
  body.SetText("body");
  const point = new SwPosition(body, 0);
  try {
    shell.SetCursor(point);
  } finally {
    point.Dispose();
  }
  if (kind !== undefined) {
    shell.SetParagraphListKind(kind);
    body.SetAttrListLevel(2);
    if (sameIndent) {
      const rule = required(body.GetNumRule());
      for (const level of [2, 3])
        rule.Set(level, createWriterNumFormat(kind, "", { numberingType: "none", indentAt: 120 }));
    }
  }
  const table = doc.nodes.MakeTableNode("Tab", {}, body),
    row = doc.nodes.AppendTableRow(table, 2);
  required(required(row.GetTabBoxes()[0]).GetParagraphs()[0]).SetText("cell");
  required(required(row.GetTabBoxes()[1]).GetParagraphs()[0]).SetText("neighbor");
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
    shell,
    table,
    editor: screen.getByRole("textbox", { name: "Writer document text" }),
  };
}
/** Assigns actual DOM selection offsets without model injection. @param editor - Editing host. @param point - Moving offset. @param mark - Fixed offset. @returns Nothing. */
function select(editor: HTMLElement, point: number, mark = point): void {
  const text = editor.firstChild,
    selection = window.getSelection();
  if (text === null || selection === null) throw new Error("Missing real body selection");
  editor.focus();
  selection.setBaseAndExtent(text, mark, text, point);
}
/** Checks actual collapsed caret and native selection. @param f - Owners. @param offset - Literal UTF-16 offset. @returns Nothing. */
function caret(f: ReturnType<typeof fixture>, offset: number): void {
  expect(f.shell.GetCursor().GetPoint().GetNode()).toBe(f.body);
  expect(f.shell.GetCursor().GetPoint().GetContentIndex()).toBe(offset);
  const selection = window.getSelection();
  expect(f.editor.contains(selection?.focusNode ?? null)).toBe(true);
  expect(selection?.focusOffset).toBe(offset);
}
describe("native ordinary paragraph Tab UI", /** Registers actual mounted behavior. @returns Nothing. */ () => {
  it.each(["numbered", "bullet"] as const)(
    "renders body %s Tab level changes with native UndoRedo",
    /** Checks DOM levels, caret and actual native history. @param kind - List family. @returns Nothing. */ (
      kind,
    ) => {
      const f = fixture(kind);
      select(f.editor, 0);
      expect(fireEvent.keyDown(f.editor, { key: "Tab" })).toBe(false);
      expect(f.editor).toHaveAttribute("data-list-level", "3");
      caret(f, 0);
      expect(fireEvent.keyDown(f.editor, { key: "Tab", shiftKey: true })).toBe(false);
      expect(f.editor).toHaveAttribute("data-list-level", "2");
      caret(f, 0);
      act(
        /** Undoes native promotion through the session owner. @returns Nothing. */ () => {
          f.session.view.GetEditWin().Undo();
        },
      );
      expect(f.editor).toHaveAttribute("data-list-level", "3");
      act(
        /** Redoes native promotion. @returns Nothing. */ () => {
          f.session.view.GetEditWin().Redo();
        },
      );
      expect(f.editor).toHaveAttribute("data-list-level", "2");
      expect(f.editor.textContent).toBe("body");
      expect(screen.getByLabelText("Row 1 column 1 paragraph 1")).toHaveTextContent("cell");
      expect(f.table.GetTabLines()).toHaveLength(1);
    },
  );
  it.each([false, true])(
    "inserts literal Tab into selected body text reverse=%s",
    /** Checks real DOM replacement and history. @param reverse - Selection direction. @returns Nothing. */ (
      reverse,
    ) => {
      const f = fixture();
      select(f.editor, reverse ? 1 : 3, reverse ? 3 : 1);
      expect(fireEvent.keyDown(f.editor, { key: "Tab" })).toBe(false);
      expect(f.editor.textContent).toBe("b\ty");
      caret(f, 2);
      act(
        /** Undoes actual text insertion. @returns Nothing. */ () => {
          f.session.view.GetEditWin().Undo();
        },
      );
      expect(f.editor.textContent).toBe("body");
      act(
        /** Redoes actual text insertion. @returns Nothing. */ () => {
          f.session.view.GetEditWin().Redo();
        },
      );
      expect(f.editor.textContent).toBe("b\ty");
    },
  );
  it("consumes plain ShiftTab and retains DOM selection without history", /** Checks native End behavior keeps document editing ownership. @returns Nothing. */ () => {
    const f = fixture();
    select(f.editor, 3, 1);
    expect(fireEvent.keyDown(f.editor, { key: "Tab", shiftKey: true })).toBe(false);
    expect(f.editor.textContent).toBe("body");
    expect(window.getSelection()?.toString()).toBe("od");
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  });
  it("inserts Tab for identical NONE levels then promotes on ShiftTab", /** Checks native helper chooses text only in demotion direction. @returns Nothing. */ () => {
    const f = fixture("numbered", true);
    select(f.editor, 0);
    expect(fireEvent.keyDown(f.editor, { key: "Tab" })).toBe(false);
    expect(f.editor.textContent).toBe("\tbody");
    expect(f.editor).toHaveAttribute("data-list-level", "2");
    caret(f, 1);
    select(f.editor, 0);
    expect(fireEvent.keyDown(f.editor, { key: "Tab", shiftKey: true })).toBe(false);
    expect(f.editor).toHaveAttribute("data-list-level", "1");
    expect(f.editor.textContent).toBe("\tbody");
  });
});
