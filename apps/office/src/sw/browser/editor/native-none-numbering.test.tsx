/** @fileoverview Checks freshly opened NONE lists through mounted Writer owners. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { SwDoc } from "../../source/core/doc/doc";
import { SwPosition } from "../../source/core/crsr/pam";
import { createWriterNumFormat } from "../../source/core/doc/number";
import { SwDocShell } from "../../source/uibase/app/docsh";
import { SwWrtShell } from "../../source/uibase/wrtsh/wrtsh1";
import { createDocument } from "../../../sfx2/source/doc/objsh";
import { writeOdtDocument } from "../../source/filter/xml/wrtxml";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Disposes actual UI owners. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
  },
);

/** Exports actual native NONE and Arabic rules before opening through the real filter service. @returns Mounted owners. */
async function fixture() {
  const doc = new SwDoc(),
    none = doc.paragraphs[0],
    arabic = doc.nodes.MakeTextNode("Arabic"),
    plain = doc.nodes.MakeTextNode("Neighbor"),
    metadata = createDocument({ id: "none-ui", suiteId: "writer", title: "NONE" });
  if (none === undefined) throw new Error("Missing NONE paragraph");
  none.SetText("No label");
  const shell = new SwWrtShell(new SwDocShell(doc, metadata));
  for (const [node, isNone] of [
    [none, true],
    [arabic, false],
  ] as const) {
    const point = new SwPosition(node, 0);
    try {
      shell.SetCursor(point);
    } finally {
      point.Dispose();
    }
    const rule = doc.GetDocumentListsManager().CreateAutomaticNumRule("numbered");
    rule.Set(
      0,
      createWriterNumFormat("numbered", "", {
        numberingType: isNone ? "none" : "arabic",
        suffix: "",
      }),
    );
    shell.SetCurNumRule(rule, false, "", true);
  }
  const bytes = writeOdtDocument(doc, metadata);
  shell.Close();
  const session = createWriterDocumentSession();
  sessions.push(session);
  await session.docShell.Open(bytes, metadata);
  const loaded = session.docShell.GetDoc(),
    first = loaded.paragraphs[0];
  if (first === undefined) throw new Error("Missing imported NONE paragraph");
  const point = new SwPosition(first, 0);
  try {
    session.view.GetWrtShell().SetCursor(point);
  } finally {
    point.Dispose();
  }
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
    loaded,
    first,
    noneEditor: screen.getByRole("textbox", { name: "Writer document text" }),
    arabicEditor: screen.getByRole("textbox", { name: "Writer paragraph 2" }),
    plainEditor: screen.getByRole("textbox", { name: "Writer paragraph 3" }),
    neighbor: plain.GetText(),
  };
}
/** Captures actual browser caret at the imported paragraph. @param editor - Editing host. @returns Nothing. */
function focus(editor: HTMLElement): void {
  editor.focus();
  const text = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT).nextNode(),
    selection = window.getSelection();
  if (text === null || selection === null) throw new Error("Missing browser caret");
  selection.setBaseAndExtent(text, 0, text, 0);
  fireEvent(document, new Event("selectionchange"));
}

it("renders imported NONE as a list with an empty marker and native inactive level commands", /** Checks actual XML/service/graph/view/UI behavior. @returns Completion. */ async () => {
  const f = await fixture();
  expect(f.noneEditor).toHaveAttribute("data-list-kind", "numbered");
  expect(f.noneEditor).toHaveAttribute("data-list-marker", "");
  expect(f.arabicEditor).toHaveAttribute("data-list-marker", "1");
  expect(f.first.IsInList()).toBe(true);
  expect(f.first.GetNumRule()?.Get(0).GetNumberingType()).toBe(5);
  focus(f.noneEditor);
  fireEvent.click(screen.getByRole("button", { name: "Format" }));
  fireEvent.mouseEnter(screen.getByRole("menuitem", { name: "Lists" }));
  expect(screen.getByRole("menuitem", { name: "Demote Outline Level" })).toBeDisabled();
  expect(screen.getByRole("menuitem", { name: "Promote Outline Level" })).toBeDisabled();
  expect(f.plainEditor).toHaveTextContent(f.neighbor);
});

it("removes and restores imported NONE through text-shell dispatch and native UndoRedo", /** Verifies native history preserves type and actual list membership. @returns Completion. */ async () => {
  const f = await fixture();
  focus(f.noneEditor);
  act(
    /** Dispatches existing text-shell removal. @returns Nothing. */ () => {
      f.session.view.Execute(WRITER_COMMAND_IDS.removeBullets);
    },
  );
  expect(f.noneEditor).toHaveAttribute("data-list-kind", "none");
  act(
    /** Restores the imported native rule. @returns Nothing. */ () => {
      expect(f.session.view.GetEditWin().Undo()).toBe(true);
    },
  );
  expect(f.noneEditor).toHaveAttribute("data-list-kind", "numbered");
  expect(f.noneEditor).toHaveAttribute("data-list-marker", "");
  expect(f.first.GetNumRule()?.Get(0).GetNumberingType()).toBe(5);
  act(
    /** Reapplies removal. @returns Nothing. */ () => {
      expect(f.session.view.GetEditWin().Redo()).toBe(true);
    },
  );
  expect(f.noneEditor).toHaveAttribute("data-list-kind", "none");
  expect(f.arabicEditor).toHaveAttribute("data-list-marker", "1");
  expect(f.plainEditor).toHaveTextContent("Neighbor");
});
