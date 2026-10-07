/** @fileoverview Checks mounted modifier ingress and native table linear tracking. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { HoriOrientation } from "../../../offapi/com/sun/star/text/HoriOrientation";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Removes device capture before native view lifetime. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
    vi.restoreAllMocks();
  },
);
/** Requires an original native or DOM owner. @param value - Optional owner. @returns Actual owner. */
function required<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error("Missing mounted column owner");
  return value;
}
/** Mounts an actual native grid with literal device measurements. @returns Original shared owners. */
function fixture() {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    table = doc.nodes.MakeTableNode(
      "Drag",
      { width: 4500, horiOrient: HoriOrientation.LEFT },
      doc.paragraphs[0],
    );
  for (let c = 0; c < 3; c++) table.AddColumnWidth(1500);
  for (let r = 0; r < 2; r++)
    for (const box of doc.nodes.AppendTableRow(table, 3).GetTabBoxes())
      required(box.GetParagraphs()[0]).SetText("Text across a border");
  render(<WriterWorkbench isActive view={session.view} />);
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
    /** Supplies independent literal device frames. @param this - Original mounted element. @returns Measured rectangle. */ function (
      this: Element,
    ): DOMRect {
      const row = this.closest("tr"),
        r = Number(row?.getAttribute("data-writer-table-row") ?? 0),
        c = this.matches("td,th") ? [...required(row).children].indexOf(this) : 0,
        x = 100 + c * 100,
        y = 100 + r * 50,
        width = this.matches("td,th") ? 100 : this.matches("table,tr") ? 300 : 0,
        height = this.matches("table") ? 100 : this.matches("td,th,tr") ? 50 : 0;
      return {
        x,
        y,
        left: x,
        right: x + width,
        top: y,
        bottom: y + height,
        width,
        height,
        toJSON: /** Serializes the measured rectangle. @returns Nothing. */ () => undefined,
      };
    },
  );
  const host = required(document.querySelector<HTMLElement>("[data-writer-editing-host]")),
    paragraph = screen.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" });
  return { session, doc, table, host, paragraph, shell: session.view.GetWrtShell() };
}
for (let mask = 0; mask < 16; mask++)
  it(
    "mounted Shift modifier mask " + mask,
    /** Checks browser ingress and solitary Shift semantics. @returns Nothing. */ () => {
      const f = fixture();
      expect(
        fireEvent.mouseDown(f.paragraph, {
          button: 0,
          detail: 1,
          clientX: 200,
          clientY: 125,
          shiftKey: Boolean(mask & 1),
          ctrlKey: Boolean(mask & 2),
          altKey: Boolean(mask & 4),
          metaKey: Boolean(mask & 8),
        }),
      ).toBe(false);
      fireEvent.mouseMove(document, { clientX: 220, clientY: 700 });
      expect(f.table.GetColumnWidths()).toEqual([1500, 1500, 1500]);
      fireEvent.mouseUp(document, { clientX: 220, clientY: 700 });
      expect(f.table.GetColumnWidths()).toEqual(
        mask === 1 ? [1800, 1500, 1200] : [1800, 1200, 1500],
      );
      expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    },
  );
it("mounted Shift owns selection, dragstart, cancellation and Enter acceptance", /** Checks capture lifetime and native history after resizing. @returns Nothing. */ () => {
  const f = fixture(),
    cursor = f.shell.CaptureCursorState();
  fireEvent.mouseDown(f.paragraph, {
    button: 0,
    detail: 1,
    clientX: 200,
    clientY: 125,
    shiftKey: true,
  });
  expect(fireEvent.dragStart(f.paragraph, { dataTransfer: { setData: vi.fn() } })).toBe(false);
  fireEvent.mouseMove(document, { clientX: 220, clientY: 700 });
  expect(document.querySelector("[data-writer-table-column-guide]")).toHaveStyle({ left: "220px" });
  fireEvent(document, new Event("selectionchange"));
  expect(f.shell.CaptureCursorState().point).toEqual(cursor.point);
  fireEvent.keyDown(f.host, { key: "Escape" });
  fireEvent.mouseUp(document);
  expect(f.table.GetColumnWidths()).toEqual([1500, 1500, 1500]);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  fireEvent.mouseDown(f.paragraph, {
    button: 0,
    detail: 1,
    clientX: 200,
    clientY: 125,
    shiftKey: true,
  });
  fireEvent.mouseMove(document, { clientX: 230, clientY: 125 });
  fireEvent.keyDown(f.host, { key: "Enter" });
  fireEvent.mouseUp(document);
  expect(f.table.GetColumnWidths()).toEqual([1950, 1500, 1050]);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  for (let cycle = 0; cycle < 3; cycle++) {
    act(
      /** Restores original width graph. @returns Nothing. */ () => {
        expect(f.shell.Undo()).toBe(true);
      },
    );
    expect(f.table.GetColumnWidths()).toEqual([1500, 1500, 1500]);
    act(
      /** Restores linear geometry. @returns Nothing. */ () => {
        expect(f.shell.Redo()).toBe(true);
      },
    );
    expect(f.table.GetColumnWidths()).toEqual([1950, 1500, 1050]);
  }
  expect(f.shell.CaptureCursorState().point).toEqual(cursor.point);
});
