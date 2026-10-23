/** @fileoverview Verifies source column-width command, modal units, cancellation, native history and document ownership. */
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { SwModule } from "../../source/uibase/app/swmodule";
import { FieldUnit } from "../../../tools/inc/fldunit";
import { WriterWorkbench } from "./writer-view";
import { SwPosition } from "../../source/core/crsr/pam";
import { HoriOrientation } from "../../../offapi/com/sun/star/text/HoriOrientation";
import { SwDoc } from "../../source/core/doc/doc";
import { createDocument } from "../../../sfx2/source/doc/objsh";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Removes mounted subscribers before native frames. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Mounts the actual sizing command with explicit module units. @param unit - Native configuration. @returns Original owners. */
function fixture(unit = FieldUnit.CM) {
  const session = createWriterDocumentSession(
    undefined,
    undefined,
    new SwModule({ "Other/MeasureUnit": unit }),
  );
  sessions.push(session);
  const shell = session.view.GetWrtShell(),
    doc = shell.GetDoc(),
    table = doc.nodes.MakeTableNode("Width UI", { width: 6000, horiOrient: HoriOrientation.LEFT });
  for (const width of [1000, 2000, 3000]) table.AddColumnWidth(width);
  doc.nodes.AppendTableRow(table, 3);
  const node = table.GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0];
  if (!node) throw new Error("Missing sizing UI node");
  const point = new SwPosition(node, 0);
  shell.SetCursor(point);
  point.Dispose();
  doc.GetUndoManager().Clear();
  render(<WriterWorkbench isActive view={session.view} />);
  return { session, shell, doc, table };
}
/** Opens an original table sizing command through the real menu. @param label - Native menu label. @returns Mounted dialog queries. */
function open(label = "Column Width…") {
  fireEvent.click(screen.getByRole("menuitem", { name: "Table" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Size" }));
  fireEvent.click(screen.getByRole("menuitem", { name: label }));
  return within(
    screen.getByRole("dialog", { name: label === "Column Width…" ? "Column Width" : "Row Height" }),
  );
}
it.each([FieldUnit.CM, FieldUnit.INCH])(
  "uses module units and updates native width on acceptance unit=%i",
  /** Checks real command draft state and selected numeric column. @param unit - Native unit. @returns Nothing. */ (
    unit,
  ) => {
    const f = fixture(unit),
      cursor = f.shell.CaptureCursorState(),
      dialog = open(),
      column = dialog.getByRole("spinbutton", { name: "Column" }),
      width = dialog.getByRole("spinbutton", { name: "Width" });
    expect(column).toHaveValue(1);
    expect(column).toHaveFocus();
    expect(column).toHaveAttribute("max", "3");
    expect(width).toHaveValue(unit === FieldUnit.CM ? "1.76 cm" : "0.69″");
    fireEvent.change(column, { target: { value: "" } });
    expect(f.table.GetColumnWidths()).toEqual([1000, 2000, 3000]);
    fireEvent.change(column, { target: { value: "2" } });
    expect(width).toHaveValue(unit === FieldUnit.CM ? "3.53 cm" : "1.39″");
    fireEvent.change(width, { target: { value: "1 in" } });
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    fireEvent.click(dialog.getByRole("button", { name: "Help" }));
    expect(dialog.getByRole("note")).toHaveTextContent("column number");
    fireEvent.keyDown(column, { key: "ArrowRight" });
    expect(screen.getByRole("dialog", { name: "Column Width" })).toBeInTheDocument();
    fireEvent.click(dialog.getByRole("button", { name: "OK" }));
    expect(f.table.GetColumnWidths()).toEqual([1000, 1440, 3560]);
    expect(f.shell.CaptureCursorState()).toEqual(cursor);
    expect(screen.queryByRole("dialog", { name: "Column Width" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(f.table.GetColumnWidths()).toEqual([1000, 2000, 3000]);
    fireEvent.click(screen.getByRole("button", { name: "Redo" }));
    expect(f.table.GetColumnWidths()).toEqual([1000, 1440, 3560]);
  },
);
it.each(["Cancel", "Escape", "Close"])(
  "discards the original draft via %s",
  /** Checks all original cancellation ports without model/history mutation. @param mode - Modal cancellation. @returns Nothing. */ (
    mode,
  ) => {
    const f = fixture(),
      dialog = open(),
      width = dialog.getByRole("spinbutton", { name: "Width" });
    fireEvent.change(width, { target: { value: "2 cm" } });
    if (mode === "Escape") fireEvent.keyDown(width, { key: "Escape" });
    else fireEvent.click(dialog.getByRole("button", { name: mode }));
    expect(screen.queryByRole("dialog", { name: "Column Width" })).not.toBeInTheDocument();
    expect(f.table.GetColumnWidths()).toEqual([1000, 2000, 3000]);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  },
);
it.each(["Column Width…", "Row Height…"])(
  "invalidates document-bound sizing drafts after replacement command=%s",
  /** Checks both current sizing families share original document ownership. @param label - Native sizing command. @returns Nothing. */ (
    label,
  ) => {
    const f = fixture();
    open(label);
    const replacement = new SwDoc();
    act(
      /** Replaces the document behind the existing frame. @returns Nothing. */ () =>
        f.session.docShell.ReplaceDocument(
          replacement,
          createDocument({ id: "replacement-sizing", suiteId: "writer", title: "Replacement" }),
          { kind: "untitled", name: "Replacement" },
        ),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(replacement.GetUndoManager().GetUndoActionCount()).toBe(0);
  },
);

it("rejects acceptance if the owning document is replaced during native submit propagation", /** Checks the live document guard independently of React's next render. @returns Nothing. */ () => {
  const f = fixture(),
    dialog = open(),
    form = dialog.getByRole("button", { name: "OK" }).closest("form");
  if (!form) throw new Error("Missing native sizing form");
  const replacement = new SwDoc();
  form.addEventListener(
    "submit",
    /** Replaces the actual owner before delegated acceptance. @returns Nothing. */ () => {
      f.session.docShell.ReplaceDocument(
        replacement,
        createDocument({ id: "racing-sizing", suiteId: "writer", title: "Replacement" }),
        { kind: "untitled", name: "Replacement" },
      );
    },
    { once: true },
  );
  fireEvent.submit(form);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(replacement.GetUndoManager().GetUndoActionCount()).toBe(0);
});
