/** @fileoverview Checks actual mounted native list context and current-point menu state. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { SwPosition } from "../../source/core/crsr/pam";
import { createWriterNumFormat } from "../../source/core/doc/number";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Closes real session and DOM owners. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Builds actual list paragraphs with distinct native levels. @param none - No-label rule context. @returns Mounted owners. */
function fixture(none = false) {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    first = doc.paragraphs[0],
    second = doc.nodes.MakeTextNode("Second"),
    shell = session.view.GetWrtShell();
  if (first === undefined) throw new Error("Missing list DOM owner");
  first.SetText("First");
  for (const [node, level] of [
    [first, 4],
    [second, 9],
  ] as const) {
    const point = new SwPosition(node, 0);
    try {
      shell.SetCursor(point);
    } finally {
      point.Dispose();
    }
    shell.SetParagraphListKind("numbered");
    node.SetAttrListLevel(level);
  }
  const point = new SwPosition(first, 0);
  try {
    shell.SetCursor(point);
  } finally {
    point.Dispose();
  }
  if (none) {
    const rule = doc.GetDocumentListsManager().CreateAutomaticNumRule("numbered");
    rule.Set(4, createWriterNumFormat("numbered", "", { numberingType: "none" }));
    shell.SetCurNumRule(rule, false, "", true);
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
  const editors = [
      screen.getByRole("textbox", { name: "Writer document text" }),
      screen.getByRole("textbox", { name: "Writer paragraph 2" }),
    ],
    firstEditor = editors[0],
    secondEditor = editors[1];
  if (firstEditor === undefined || secondEditor === undefined)
    throw new Error("Missing context editing host");
  return { session, doc, shell, first, second, firstEditor, secondEditor };
}
/** Opens actual native Lists menu. @returns Nothing. */
function menu(): void {
  fireEvent.click(screen.getByRole("button", { name: "Format" }));
  fireEvent.mouseEnter(screen.getByRole("menuitem", { name: "Lists" }));
}
/** Assigns actual cross-paragraph browser selection and dispatches real selection capture. @param f - Mounted owners. @param boundary - Whether point targets boundary paragraph. @returns Nothing. */
function select(f: ReturnType<typeof fixture>, boundary: boolean): void {
  const point = boundary ? f.secondEditor : f.firstEditor,
    anchor = boundary ? f.firstEditor : f.secondEditor;
  point.focus();
  const focusText = document.createTreeWalker(point, NodeFilter.SHOW_TEXT).nextNode(),
    anchorText = document.createTreeWalker(anchor, NodeFilter.SHOW_TEXT).nextNode(),
    selection = window.getSelection();
  if (focusText === null || anchorText === null || selection === null)
    throw new Error("Missing native DOM range");
  selection.setBaseAndExtent(anchorText, 1, focusText, 1);
  fireEvent(document, new Event("selectionchange"));
}
describe("native list context UI", /** Registers mounted source-owned behavior. @returns Nothing. */ () => {
  it("dispatches actual level menus through list context and preserves text with native history", /** Checks execution and native text-shell UndoRedo survive context ownership. @returns Nothing. */ () => {
    const f = fixture();
    menu();
    expect(screen.getByRole("menuitem", { name: "Demote Outline Level" })).toBeEnabled();
    fireEvent.click(screen.getByRole("menuitem", { name: "Demote Outline Level" }));
    expect(f.firstEditor).toHaveAttribute("data-list-level", "5");
    expect(f.firstEditor).toHaveTextContent("First");
    act(
      /** Undoes through the actual edit-window history owner. @returns Nothing. */ () => {
        expect(f.session.view.GetEditWin().Undo()).toBe(true);
      },
    );
    expect(f.firstEditor).toHaveAttribute("data-list-level", "4");
    act(
      /** Redoes through the same owner. @returns Nothing. */ () => {
        expect(f.session.view.GetEditWin().Redo()).toBe(true);
      },
    );
    expect(f.firstEditor).toHaveAttribute("data-list-level", "5");
    expect(f.secondEditor).toHaveAttribute("data-list-level", "9");
  });
  it.each([false, true])(
    "uses captured DOM point rather than all-range availability boundary=%s",
    /** Checks browser selection direction drives native menu state. @param boundary - Point at maximum-level paragraph. @returns Nothing. */ (
      boundary,
    ) => {
      const f = fixture();
      select(f, boundary);
      expect(f.shell.GetNumLevel()).toBe(boundary ? 9 : 4);
      expect(f.shell.GetCursor().HasMark()).toBe(true);
      expect(f.shell.CanNumUpDown(true)).toBe(false);
      menu();
      const demote = screen.getByRole("menuitem", { name: "Demote Outline Level" });
      if (boundary) expect(demote).toBeDisabled();
      else {
        expect(demote).toBeEnabled();
        fireEvent.click(demote);
        expect(f.firstEditor).toHaveAttribute("data-list-level", "4");
        expect(f.secondEditor).toHaveAttribute("data-list-level", "9");
        expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
      }
    },
  );
  it("keeps no-label numbering outside native list shell context", /** Checks real NONE format suppresses level commands while text commands remain available. @returns Nothing. */ () => {
    const f = fixture(true);
    expect(f.first.IsInList()).toBe(true);
    expect(f.session.view.QueryCommand(WRITER_COMMAND_IDS.demote)).toBeUndefined();
    menu();
    expect(screen.getByRole("menuitem", { name: "Demote Outline Level" })).toBeDisabled();
    expect(screen.getByRole("menuitem", { name: "Promote Outline Level" })).toBeDisabled();
    expect(f.session.view.QueryCommand(WRITER_COMMAND_IDS.orderedList)).toBeDefined();
  });
  it("restores native list shell after text-shell removal and UndoRedo", /** Checks mounted command context follows actual native history. @returns Nothing. */ () => {
    const f = fixture();
    act(
      /** Removes numbering through actual frame dispatch. @returns Nothing. */ () => {
        f.session.view.Execute(WRITER_COMMAND_IDS.removeBullets);
      },
    );
    expect(f.firstEditor).toHaveAttribute("data-list-kind", "none");
    expect(f.session.view.QueryCommand(WRITER_COMMAND_IDS.demote)).toBeUndefined();
    act(
      /** Restores actual rule and context. @returns Nothing. */ () => {
        f.session.view.GetEditWin().Undo();
      },
    );
    expect(f.firstEditor).toHaveAttribute("data-list-level", "4");
    expect(f.session.view.QueryState(WRITER_COMMAND_IDS.demote).enabled).toBe(true);
    act(
      /** Reapplies native removal. @returns Nothing. */ () => {
        f.session.view.GetEditWin().Redo();
      },
    );
    expect(f.session.view.QueryCommand(WRITER_COMMAND_IDS.demote)).toBeUndefined();
    expect(f.firstEditor).toHaveTextContent("First");
  });
});
