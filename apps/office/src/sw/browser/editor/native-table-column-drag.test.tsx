/** @fileoverview Reproduces native mouse column capture over editable text and verifies browser cleanup. */
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
it("mounted editable-text border owns mouse down, dragstart, selectionchange and the generated click", /** Reproduces the reported competing browser text drag. @returns Nothing. */ () => {
  const f = fixture(),
    cursor = f.shell.CaptureCursorState(),
    selection = document.getSelection(),
    range = document.createRange();
  range.selectNodeContents(f.paragraph);
  selection?.removeAllRanges();
  selection?.addRange(range);
  expect(
    fireEvent.mouseDown(f.paragraph, { button: 0, detail: 1, clientX: 203, clientY: 125 }),
  ).toBe(false);
  expect(document.querySelector("[data-writer-table-column-guide]")).toHaveStyle({ left: "200px" });
  expect(fireEvent.dragStart(f.paragraph, { dataTransfer: { setData: vi.fn() } })).toBe(false);
  fireEvent(document, new Event("selectionchange"));
  expect(f.shell.CaptureCursorState().point).toEqual(cursor.point);
  fireEvent.mouseMove(document, { clientX: 233, clientY: 700 });
  expect(document.querySelector("[data-writer-table-column-guide]")).toHaveStyle({ left: "230px" });
  expect(f.table.GetColumnWidths()).toEqual([1500, 1500, 1500]);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  fireEvent.mouseUp(document, { clientX: 233, clientY: 700 });
  expect(f.table.GetColumnWidths()).toEqual([1950, 1050, 1500]);
  expect(document.querySelector("[data-writer-table-column-guide]")).toBeNull();
  expect(fireEvent.click(f.paragraph)).toBe(false);
  expect(f.shell.CaptureCursorState().point).toEqual(cursor.point);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  fireEvent.click(f.paragraph);
  fireEvent.mouseMove(document, { clientX: 250, clientY: 125 });
  expect(f.table.GetColumnWidths()).toEqual([1950, 1050, 1500]);
});
it.each(["Escape", "blur", "teardown"])(
  "mounted native column tracking cancels via %s",
  /** Checks actual cancellation listeners and stale release. @param termination - Native device lifetime. @returns Nothing. */ (
    termination,
  ) => {
    const f = fixture();
    fireEvent.mouseDown(f.paragraph, { button: 0, detail: 1, clientX: 200, clientY: 125 });
    fireEvent.mouseMove(document, { clientX: 240, clientY: 125 });
    if (termination === "Escape") {
      expect(fireEvent.keyDown(f.host, { key: "x" })).toBe(false);
      expect(fireEvent.keyDown(f.host, { key: "Escape" })).toBe(false);
    } else if (termination === "blur") fireEvent.blur(window);
    else cleanup();
    fireEvent.mouseUp(document, { clientX: 240, clientY: 125 });
    expect(f.table.GetColumnWidths()).toEqual([1500, 1500, 1500]);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    expect(document.querySelector("[data-writer-table-column-guide]")).toBeNull();
  },
);
it("mounted Enter accepts the last preview once and prioritizes capture over shortcuts", /** Checks deferred keyboard termination and clean host teardown. @returns Nothing. */ () => {
  const f = fixture();
  fireEvent.mouseDown(f.paragraph, { button: 0, detail: 1, clientX: 200, clientY: 125 });
  fireEvent.mouseMove(f.host, { clientX: 220, clientY: 125 });
  fireEvent.mouseUp(f.host, { clientX: 220, clientY: 125 });
  expect(f.table.GetColumnWidths()).toEqual([1800, 1200, 1500]);
  act(
    /** Restores unchanged test geometry before the second independent gesture. @returns Nothing. */ () => {
      f.shell.Undo();
    },
  );
  fireEvent.mouseDown(f.paragraph, { button: 0, detail: 1, clientX: 200, clientY: 125 });
  fireEvent.mouseMove(document, { clientX: 230, clientY: 125 });
  expect(fireEvent.keyDown(f.host, { key: "Enter" })).toBe(false);
  fireEvent.mouseUp(document, { clientX: 280, clientY: 125 });
  expect(f.table.GetColumnWidths()).toEqual([1950, 1050, 1500]);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  cleanup();
  expect(f.session.view.GetEditWin().MouseMove({ x: 300, y: 125 })).toBe(false);
});
