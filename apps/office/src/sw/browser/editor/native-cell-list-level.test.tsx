/** @fileoverview Verifies cell list-level commands use the actual native selection,bindings and delta history. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import { SwPosition } from "../../source/core/crsr/pam";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases model and DOM owners. @returns Nothing. */ () => {
    cleanup();
    for (const s of sessions.splice(0)) s.Close();
  },
);
/** Creates the real cell list context and workbench. @returns Native and DOM owners. */
function fixture() {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell(),
    table = doc.nodes.MakeTableNode("Table1", {});
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  const row = doc.nodes.AppendTableRow(table, 2),
    first = row.GetTabBoxes()[0]?.GetParagraphs()[0],
    second = row.GetTabBoxes()[1]?.GetParagraphs()[0];
  if (first === undefined || second === undefined) throw new Error("Missing cells");
  first.SetText("First");
  second.SetText("Second");
  shell.FocusNode(first);
  shell.SetParagraphListKind("numbered");
  shell.FocusNode(second);
  shell.SetParagraphListKind("numbered");
  shell.FocusNode(first);
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
    first,
    second,
    cell: screen.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" }),
  };
}
describe("native cell list level UI", /** Registers mounted actual-owner contracts. @returns Nothing. */ () => {
  it("enables and renders demote,promote and indent on the actual cell with Undo/Redo", /** Checks dispatch bindings share the core operation. @returns Nothing. */ () => {
    const owner = fixture(),
      toolbar = screen.getByRole("toolbar", { name: "Writer formatting toolbar" });
    expect(screen.getByRole("button", { name: "Decrease" })).toBeDisabled();
    expect(owner.cell).toHaveAttribute("data-list-level", "0");
    fireEvent.click(screen.getByRole("button", { name: "Format" }));
    fireEvent.mouseEnter(screen.getByRole("menuitem", { name: "Lists" }));
    const demote = screen.getByRole("menuitem", { name: "Demote Outline Level" });
    expect(demote).toBeEnabled();
    fireEvent.click(demote);
    expect(owner.cell).toHaveAttribute("data-list-level", "1");
    expect(owner.cell.parentElement?.style.marginInlineStart).toBe("36pt");
    expect(owner.first.GetActualListLevel()).toBe(1);
    expect(owner.second.GetActualListLevel()).toBe(0);
    expect(toolbar).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Decrease" }));
    expect(owner.cell).toHaveAttribute("data-list-level", "0");
    act(
      /** Reverses native indent. @returns Nothing. */ () => {
        owner.shell.Undo();
      },
    );
    expect(owner.cell).toHaveAttribute("data-list-level", "1");
    act(
      /** Reapplies native indent. @returns Nothing. */ () => {
        owner.shell.Redo();
      },
    );
    expect(owner.cell).toHaveAttribute("data-list-level", "0");
    expect(owner.doc.paragraphs[0]?.GetListKind()).toBe("none");
  });
  it("disables range commands at one cell limit and reenables them after native model invalidation", /** Checks all-range eligibility updates through bindings. @returns Nothing. */ () => {
    const owner = fixture();
    const point = new SwPosition(owner.second, 0),
      mark = new SwPosition(owner.first, 0);
    act(
      /** Sets the real multi-cell PaM. @returns Nothing. */ () => {
        owner.shell.SetPaM(point, mark);
        owner.second.SetAttrListLevel(9);
      },
    );
    point.Dispose();
    mark.Dispose();
    const dispatcher = owner.session.view.GetViewFrame().GetDispatcher();
    expect(dispatcher.QueryState(WRITER_COMMAND_IDS.demote).enabled).toBe(false);
    act(
      /** Removes the native boundary and dispatches the same range. @returns Nothing. */ () => {
        owner.second.SetAttrListLevel(8);
      },
    );
    expect(dispatcher.QueryState(WRITER_COMMAND_IDS.demote).enabled).toBe(true);
    act(
      /** Executes one native range request. @returns Nothing. */ () => {
        dispatcher.Execute(WRITER_COMMAND_IDS.demote);
      },
    );
    expect([owner.first.GetAttrListLevel(), owner.second.GetAttrListLevel()]).toEqual([1, 9]);
    expect(owner.cell).toHaveAttribute("data-list-level", "1");
    expect(screen.getByRole("textbox", { name: "Row 1 column 2 paragraph 1" })).toHaveAttribute(
      "data-list-level",
      "9",
    );
    act(
      /** Reverts both nodes in one step. @returns Nothing. */ () => {
        owner.shell.Undo();
      },
    );
    expect([owner.first.GetAttrListLevel(), owner.second.GetAttrListLevel()]).toEqual([0, 8]);
  });
});
