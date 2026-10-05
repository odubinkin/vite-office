/** @fileoverview Checks mounted empty-list Enter reaches native edit-window ownership for cells. */
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases real views and DOM owners. @returns Nothing. */ () => {
    cleanup();
    for (const s of sessions.splice(0)) s.Close();
  },
);
/** Mounts a real nested cell list. @param kind - Native marker family. @returns Real document and DOM owners. */
function fixture(kind: "bullet" | "numbered") {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell(),
    table = doc.nodes.MakeTableNode("Table1", {});
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  const row = doc.nodes.AppendTableRow(table, 2),
    box = row.GetTabBoxes()[0],
    first = box?.GetParagraphs()[0];
  if (box === undefined || first === undefined) throw new Error("Missing cell");
  shell.FocusNode(first);
  shell.SetParagraphListKind(kind);
  first.SetAttrListLevel(3);
  session.docShell.GetUndoManager().Clear();
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
    shell,
    box,
    first,
    cell: screen.getByLabelText("Row 1 column 1 paragraph 1"),
  };
}
/** Selects the empty editable host and dispatches a native beforeinput intent. @param element - Editable paragraph. @param inputType - Platform intent. @param data - Optional inserted text. @returns Cancelable event. */
function input(element: HTMLElement, inputType: string, data: string | null = null) {
  const selection = window.getSelection();
  if (selection === null) throw new Error("Missing selection");
  selection.setBaseAndExtent(element, 0, element, 0);
  const event = new InputEvent("beforeinput", { bubbles: true, cancelable: true, inputType, data });
  act(
    /** Dispatches through the common browser edit-window owner. @returns Nothing. */ () => {
      element.dispatchEvent(event);
    },
  );
  return event;
}
describe("native cell list Enter UI", /** Registers browser intent contracts. @returns Nothing. */ () => {
  it.each(["bullet", "numbered"] as const)(
    "ends an empty %s cell list without adding a DOM paragraph",
    /** Checks actual nodes,projection,history and followup text. @param kind - Native list family. @returns Nothing. */ (
      kind,
    ) => {
      const f = fixture(kind);
      expect(f.cell).toHaveAttribute("data-list-kind", kind);
      expect(f.cell).toHaveAttribute("data-list-level", "3");
      expect(input(f.cell, "insertParagraph").defaultPrevented).toBe(true);
      expect(f.box.GetParagraphs()).toEqual([f.first]);
      expect(screen.queryByLabelText("Row 1 column 1 paragraph 2")).toBeNull();
      expect(f.cell).toHaveAttribute("data-list-kind", "none");
      expect(f.cell).toHaveAttribute("data-list-level", "0");
      expect(screen.getByLabelText("Row 1 column 2 paragraph 1")).toHaveAttribute(
        "data-list-kind",
        "none",
      );
      expect(input(f.cell, "historyUndo").defaultPrevented).toBe(true);
      expect(f.cell).toHaveAttribute("data-list-kind", kind);
      expect(f.cell).toHaveAttribute("data-list-level", "3");
      input(f.cell, "historyRedo");
      expect(f.cell).toHaveAttribute("data-list-kind", "none");
      expect(f.box.GetParagraphs()).toHaveLength(1);
      input(f.cell, "insertText", "After");
      expect(f.cell).toHaveTextContent("After");
      expect(f.first.GetText()).toBe("After");
      expect(f.doc.paragraphs[0]?.GetText()).toBe("");
    },
  );
});
