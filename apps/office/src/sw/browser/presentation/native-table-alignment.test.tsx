/** @fileoverview Mounted native alignment, geometry and history acceptance without upstream invocation. */
import { it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
import { SwTabFrame } from "../../source/core/layout/tabfrm";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases actual mounted sessions. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
  },
);
for (const [label, orient, width, left, right] of [
  ["Automatic", 6, 8000, 0, 0],
  ["Left", 3, 3000, 0, 5000],
  ["From left", 7, 3000, 300, 4700],
  ["Right", 1, 3000, 5000, 0],
  ["Center", 2, 3000, 2500, 2500],
  ["Manual", 0, 7100, 300, 600],
] as const)
  it(`applies native ${label} through actual UI and attribute history`, /** Checks original graph and repeated history. @returns Nothing. */ () => {
    const session = createWriterDocumentSession();
    sessions.push(session);
    const doc = session.docShell.GetDoc(),
      desc = doc.GetPageDesc();
    desc.SetValue({ ...desc.GetValue(), width: 9200, leftMargin: 600, rightMargin: 600 });
    const table = doc.nodes.MakeTableNode("Geometry", {
      width: 3000,
      align: "left",
      headerRows: 0,
      repeatHeaderRows: false,
    });
    table.AddColumnWidth(1000);
    table.AddColumnWidth(2000);
    const first = doc.nodes.AppendTableRow(table, 2).GetTabBoxes()[0]?.GetParagraphs()[0];
    if (first === undefined) throw new Error("Missing native cell");
    first.SetText("Original");
    const original = table.GetFormat();
    render(<WriterWorkbench isActive view={session.view} />);
    fireEvent.click(screen.getByRole("button", { name: "Select row 1 in Geometry" }));
    fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
    fireEvent.click(screen.getByRole("radio", { name: new RegExp(`^${label}$`) }));
    if (label === "From left" || label === "Manual")
      fireEvent.change(screen.getByRole("spinbutton", { name: "Left (cm)" }), {
        target: { value: "0.53" },
      });
    if (label === "Manual")
      fireEvent.change(screen.getByRole("spinbutton", { name: "Right (cm)" }), {
        target: { value: "1.058333" },
      });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Above (cm)" }), {
      target: { value: "0.2" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Below (cm)" }), {
      target: { value: "0.3" },
    });
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(table.GetFormat()).toMatchObject({
      horiOrient: orient,
      width,
      marginLeft: left,
      marginRight: right,
      marginTop: 113,
      marginBottom: 170,
    });
    expect(new SwTabFrame(table).Format(8000)).toEqual({ width, left, right });
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    for (let cycle = 0; cycle < 2; cycle++) {
      act(
        /** Reverts actual native attributes. @returns Nothing. */ () => {
          expect(session.view.GetWrtShell().Undo()).toBe(true);
        },
      );
      expect(table.GetFormat()).toEqual(original);
      act(
        /** Reapplies actual native attributes. @returns Nothing. */ () => {
          expect(session.view.GetWrtShell().Redo()).toBe(true);
        },
      );
      expect(new SwTabFrame(table).Format(8000)).toEqual({ width, left, right });
      expect(table.GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0]).toBe(first);
      expect(screen.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" })).toHaveTextContent(
        "Original",
      );
    }
  });
