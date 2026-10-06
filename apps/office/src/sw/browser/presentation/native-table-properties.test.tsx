/** @fileoverview Verifies the actual React workbench delegates accepted table properties to native owners and history. */
import { selectMountedTableRow } from "../../../../test-support/table-mouse-dom";
import { render, cleanup, screen, fireEvent, act } from "@testing-library/react";
import { afterEach, it, expect, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases mounted canonical views. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Builds and mounts actual table owners. @returns Connected model and view. */
function fixture() {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    table = doc.nodes.MakeTableNode("Grid", {
      width: 6000,
      align: "left",
      headerRows: 1,
      repeatHeaderRows: true,
    });
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  doc.nodes.AppendTableRow(table, 2, {}, [
    { border: "none", padding: 50 },
    { border: "none", padding: 50 },
  ]);
  doc.nodes.AppendTableRow(table, 2, {}, [
    { border: "none", padding: 50 },
    { border: "none", padding: 50 },
  ]);
  const first = table.GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0];
  if (first === undefined) throw new Error("Missing mounted table owner");
  first.SetText("First");
  render(<WriterWorkbench isActive view={session.view} />);
  return { session, doc, table, first, shell: session.view.GetWrtShell() };
}
it("accepts native properties as one history action and retains real selected cell owners", /** Checks actual UI application and repeated history. @returns Nothing. */ () => {
  const f = fixture(),
    setter = vi.spyOn(f.shell, "SetTableAttr");
  selectMountedTableRow("Grid", 1);
  fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
  fireEvent.change(screen.getByRole("spinbutton", { name: "Table width (cm)" }), {
    target: { value: "8" },
  });
  fireEvent.click(screen.getByRole("tab", { name: "Borders" }));
  fireEvent.change(screen.getByRole("spinbutton", { name: "Cell padding (cm)" }), {
    target: { value: "0.2" },
  });
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  expect(setter).toHaveBeenCalledWith({
    width: 4535,
    horiOrient: 3,
    marginLeft: 0,
    marginRight:
      f.doc.GetPageDesc().GetValue().width -
      f.doc.GetPageDesc().GetValue().leftMargin -
      f.doc.GetPageDesc().GetValue().rightMargin -
      4535,
    marginTop: 0,
    marginBottom: 0,
    align: undefined,
  });
  expect(f.table.GetFormat().width).toBe(4535);
  expect(f.table.GetTabLines()[0]?.GetTabBoxes()[0]?.GetFormat().padding).toBe(113);
  expect(f.table.GetTabLines()[1]?.GetTabBoxes()[0]?.GetFormat().padding).toBe(50);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  for (let cycle = 0; cycle < 2; cycle++) {
    act(
      /** Reverts native table properties. @returns Nothing. */ () => {
        expect(f.shell.Undo()).toBe(true);
      },
    );
    expect(f.table.GetFormat().width).toBe(6000);
    expect(f.table.GetTabLines()[0]?.GetTabBoxes()[0]?.GetFormat().padding).toBe(50);
    expect(f.shell.HasBoxSelection()).toBe(true);
    act(
      /** Reapplies native table properties. @returns Nothing. */ () => {
        expect(f.shell.Redo()).toBe(true);
      },
    );
    expect(f.table.GetFormat().width).toBe(4535);
    expect(f.table.GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0]).toBe(f.first);
    expect(screen.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" })).toHaveTextContent(
      "First",
    );
  }
});
it("cancels property drafts without native mutation or history", /** Checks canceled real dialog. @returns Nothing. */ () => {
  const f = fixture(),
    setter = vi.spyOn(f.shell, "SetTableAttr");
  selectMountedTableRow("Grid", 1);
  fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
  fireEvent.change(screen.getByRole("spinbutton", { name: "Table width (cm)" }), {
    target: { value: "8" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(setter).not.toHaveBeenCalled();
  expect(f.table.GetFormat().width).toBe(6000);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});
