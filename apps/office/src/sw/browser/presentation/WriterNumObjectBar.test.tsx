/** @fileoverview Native numbering object-bar context,frame state,range/history and ODT integration. */
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
import fs from "node:fs";
import { createDocument } from "../../../sfx2/source/doc/objsh";
import { SwPosition } from "../../source/core/crsr/pam";
import { readOdtDocument } from "../../source/filter/xml/swxml";
import { HoriOrientation } from "../../../offapi/com/sun/star/text/HoriOrientation";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases projections before the original sessions. @returns Nothing. */ () => {
    cleanup();
    for (const s of sessions.splice(0)) s.Close();
  },
);
/** Mounts actual model,shell,frame and production workspace. @returns Native owners. */
function mount() {
  const session = createWriterDocumentSession();
  sessions.push(session);
  render(<WriterWorkbench isActive view={session.view} />);
  return { session, shell: session.view.GetWrtShell(), doc: session.docShell.GetDoc() };
}
it("enters source numbering context with exact visible placements and boundary states,then retains history and ODT", /** Uses actual dispatch and no fake command state. @returns Completion. */ async () => {
  const { session, shell, doc } = mount();
  expect(screen.queryByRole("toolbar", { name: "Writer numbering toolbar" })).toBeNull();
  act(
    /** Activates native list context. @returns Nothing. */ () => {
      shell.Insert("Numbered");
      shell.SetParagraphListKind("numbered");
    },
  );
  const bar = screen.getByRole("toolbar", { name: "Writer numbering toolbar" }),
    ui = within(bar);
  expect(
    ui
      .getAllByRole("button")
      .map(
        /** Reads actual localized labels. @param b - Native command control. @returns Label. */ (
          b,
        ) => b.getAttribute("aria-label"),
      ),
  ).toEqual(["Demote Outline Level", "Promote Outline Level", "Add to List"]);
  const down = ui.getByRole("button", { name: "Demote Outline Level" }),
    up = ui.getByRole("button", { name: "Promote Outline Level" });
  expect(up).toBeDisabled();
  expect(down).toBeEnabled();
  expect(fireEvent.mouseDown(down, { button: 0 })).toBe(false);
  expect(fireEvent.mouseDown(down, { button: 2 })).toBe(true);
  fireEvent.click(down);
  expect(shell.GetActiveParagraph().GetAttrListLevel()).toBe(1);
  expect(up).toBeEnabled();
  act(
    /** Restores actual numbering history. @returns Nothing. */ () => {
      shell.Undo();
    },
  );
  expect(shell.GetActiveParagraph().GetAttrListLevel()).toBe(0);
  act(
    /** Reapplies actual numbering history. @returns Nothing. */ () => {
      shell.Redo();
    },
  );
  expect(shell.GetActiveParagraph().GetAttrListLevel()).toBe(1);
  for (let i = 1; i < 9; i++) fireEvent.click(down);
  expect(down).toBeDisabled();
  expect(shell.GetActiveParagraph().GetAttrListLevel()).toBe(9);
  const restored = await readOdtDocument(await session.docShell.SerializeOdt(), {
    title: "Numbering",
  });
  expect(restored.document.paragraphs[0]?.GetAttrListLevel()).toBe(9);
  expect(doc.GetUndoManager().GetUndoActionCount()).toBeGreaterThan(0);
  act(
    /** Leaves list context using the original owner. @returns Nothing. */ () => {
      shell.SetParagraphListKind("none");
    },
  );
  expect(screen.queryByRole("toolbar", { name: "Writer numbering toolbar" })).toBeNull();
});
it("gives the table object bar priority over the same numbering slot and restores list context on leaving", /** Both native shells remain active;only the top object bar owns presentation. @returns Nothing. */ () => {
  const { shell, doc } = mount();
  const body = shell.GetActiveParagraph();
  act(
    /** Creates a real numbered cell and cursor. @returns Nothing. */ () => {
      const table = doc.nodes.MakeTableNode(
        "Numbered table",
        { width: 2400, horiOrient: HoriOrientation.LEFT },
        body,
      );
      table.AddColumnWidth(2400);
      const cell = doc.nodes.AppendTableRow(table, 1).GetTabBoxes()[0]?.GetParagraphs()[0];
      if (cell === undefined) throw Error("Missing cell");
      const point = new SwPosition(cell, 0);
      try {
        shell.SetCursor(point);
      } finally {
        point.Dispose();
      }
      shell.SetParagraphListKind("numbered");
    },
  );
  expect(screen.getByRole("toolbar", { name: "Writer table toolbar" })).toBeVisible();
  expect(screen.queryByRole("toolbar", { name: "Writer numbering toolbar" })).toBeNull();
  act(
    /** Returns to native body context. @returns Nothing. */ () => {
      const point = new SwPosition(body, 0);
      try {
        shell.SetCursor(point);
      } finally {
        point.Dispose();
      }
      shell.SetParagraphListKind("bullet");
    },
  );
  expect(screen.queryByRole("toolbar", { name: "Writer table toolbar" })).toBeNull();
  expect(screen.getByRole("toolbar", { name: "Writer numbering toolbar" })).toBeVisible();
});

it("continues the original imported list through its actual toolbar and restores the separate list with Undo", /** Replays upstream tdf113213 through the production frame and IO boundary. @returns Completion. */ async () => {
  const { session, shell } = mount();
  await act(
    /** Imports the repository-owned upstream fixture. @returns Completion. */ async () => {
      await session.docShell.Open(
        new Uint8Array(fs.readFileSync("src/sw/qa/extras/uiwriter/data/tdf113213_addToList.odt")),
        createDocument({ id: "numbering-toolbar", suiteId: "writer", title: "Lists" }),
      );
    },
  );
  const doc = session.docShell.GetDoc(),
    first = doc.paragraphs[0],
    last = doc.paragraphs[5];
  if (first === undefined || last === undefined) throw Error("Missing upstream list owners");
  act(
    /** Places the actual native cursor. @returns Nothing. */ () => {
      const previous = doc.paragraphs[4];
      if (previous === undefined) throw Error("Missing original list range");
      const point = new SwPosition(last, last.Len()),
        mark = new SwPosition(previous, 0);
      try {
        shell.SetPaM(point, mark);
      } finally {
        point.Dispose();
        mark.Dispose();
      }
    },
  );
  const previous = last.GetListId(),
    add = within(screen.getByRole("toolbar", { name: "Writer numbering toolbar" })).getByRole(
      "button",
      { name: "Add to List" },
    );
  expect(add).toBeEnabled();
  fireEvent.click(add);
  expect(last.GetListId()).toBe(first.GetListId());
  expect(last.GetListLabel()).toBe("3");
  act(
    /** Undoes one original list-joining history action. @returns Nothing. */ () => {
      shell.Undo();
    },
  );
  expect(last.GetListId()).toBe(previous);
  act(
    /** Reapplies the same original history action. @returns Nothing. */ () => {
      shell.Redo();
    },
  );
  expect(last.GetListId()).toBe(first.GetListId());
});
