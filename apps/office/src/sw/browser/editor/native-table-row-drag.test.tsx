/** @fileoverview Verifies native row device capture before browser text drag and its cancellation lifetime. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { HoriOrientation } from "../../../offapi/com/sun/star/text/HoriOrientation";
import { BrowserWriterSelectionMapper } from "./writer-selection";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Removes browser capture before view lifetime. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
    vi.restoreAllMocks();
  },
);
/** Requires actual connected owner. @param value - Optional owner. @returns Actual owner. */
function required<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error("Missing row device owner");
  return value;
}
/** Mounts actual document rows with literal independent physical measurements. @returns Original owners. */
function fixture() {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    table = doc.nodes.MakeTableNode(
      "Rows",
      { width: 4500, horiOrient: HoriOrientation.LEFT },
      doc.paragraphs[0],
    );
  for (let c = 0; c < 3; c++) table.AddColumnWidth(1500);
  for (let r = 0; r < 3; r++)
    for (const box of doc.nodes.AppendTableRow(table, 3).GetTabBoxes())
      required(box.GetParagraphs()[0]).SetText("Text across a row border");
  render(<WriterWorkbench isActive view={session.view} />);
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
    /** Supplies independent device measurements. @param this - Actual element. @returns Physical rectangle. */
    function (this: Element): DOMRect {
      const row = this.closest("tr"),
        r = Number(row?.getAttribute("data-writer-table-row") ?? 0),
        c = this.matches("td,th") ? [...required(row).children].indexOf(this) : 0,
        x = 100 + c * 100,
        y = 100 + r * 50,
        width = this.matches("td,th") ? 100 : this.matches("table,tr") ? 300 : 0,
        height = this.matches("table") ? 150 : this.matches("td,th,tr") ? 50 : 0;
      return {
        x,
        y,
        left: x,
        right: x + width,
        top: y,
        bottom: y + height,
        width,
        height,
        toJSON: /** Serializes measurement. @returns Nothing. */ () => undefined,
      };
    },
  );
  const host = required(document.querySelector<HTMLElement>("[data-writer-editing-host]")),
    paragraph = screen.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" });
  return { session, doc, table, host, paragraph, shell: session.view.GetWrtShell() };
}
it("mounted row capture blocks browser drag/selection/click while release off-host commits one native height", /** Reproduces physical row border over editable text. @returns Nothing. */ () => {
  const subscription = vi.spyOn(BrowserWriterSelectionMapper.prototype, "Subscribe");
  const f = fixture(),
    cursor = f.shell.CaptureCursorState(),
    selection = document.getSelection(),
    range = document.createRange();
  range.selectNodeContents(f.paragraph);
  selection?.removeAllRanges();
  selection?.addRange(range);
  expect(
    fireEvent.mouseDown(f.paragraph, { button: 0, detail: 1, clientX: 150, clientY: 153 }),
  ).toBe(false);
  expect(document.querySelector("[data-writer-table-row-guide]")).toHaveStyle({
    top: "150px",
    height: "1px",
  });
  expect(document.querySelector("[data-writer-table-column-guide]")).toBeNull();
  expect(fireEvent.dragStart(f.paragraph, { dataTransfer: { setData: vi.fn() } })).toBe(false);
  fireEvent(document, new Event("selectionchange"));
  // A late selection publication must not replace the native cursor during border capture.
  required(subscription.mock.calls[0]?.[0])({
    point: { paragraphId: String(f.shell.GetActiveParagraph().GetIndex()), offset: 0 },
  });
  expect(f.shell.CaptureCursorState().point).toEqual(cursor.point);
  fireEvent.mouseMove(document, { clientX: 1000, clientY: 183 });
  expect(document.querySelector("[data-writer-table-row-guide]")).toHaveStyle({ top: "180px" });
  expect(required(f.table.GetTabLines()[0]).GetFormat().frameSize?.GetHeight()).toBeUndefined();
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  fireEvent.mouseUp(document, { clientX: 1000, clientY: 183 });
  expect(required(f.table.GetTabLines()[0]).GetFormat().frameSize?.GetHeight()).toBe(1200);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  expect(document.querySelector("[data-writer-table-row-guide]")).toBeNull();
  expect(fireEvent.click(f.paragraph)).toBe(false);
  expect(f.shell.CaptureCursorState().point).toEqual(cursor.point);
});
it.each(["Escape", "blur", "teardown"])(
  "mounted row tracking cancels via%s",
  /** Checks capture lifetime and stale release. @param termination - Native termination. @returns Nothing. */ (
    termination,
  ) => {
    const f = fixture();
    fireEvent.mouseDown(f.paragraph, { button: 0, detail: 1, clientX: 150, clientY: 150 });
    fireEvent.mouseMove(document, { clientX: 900, clientY: 180 });
    if (termination === "Escape") {
      expect(fireEvent.keyDown(f.host, { key: "x" })).toBe(false);
      expect(fireEvent.keyDown(f.host, { key: "Escape" })).toBe(false);
    } else if (termination === "blur") fireEvent.blur(window);
    else cleanup();
    fireEvent.mouseUp(document, { clientX: 900, clientY: 180 });
    expect(required(f.table.GetTabLines()[0]).GetFormat().frameSize?.GetHeight()).toBeUndefined();
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    expect(document.querySelector("[data-writer-table-row-guide]")).toBeNull();
  },
);
it("mounted Enter accepts native bottom row once while teardown removes all tracking", /** Checks source keyboard termination with no subsequent mouse history. @returns Nothing. */ () => {
  const f = fixture();
  fireEvent.mouseDown(f.paragraph, { button: 0, detail: 1, clientX: 150, clientY: 250 });
  fireEvent.mouseMove(f.host, { clientX: 300, clientY: 275 });
  expect(fireEvent.keyDown(f.host, { key: "Enter" })).toBe(false);
  fireEvent.mouseUp(f.host, { clientX: 150, clientY: 290 });
  expect(required(f.table.GetTabLines()[2]).GetFormat().frameSize?.GetHeight()).toBe(1125);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  act(
    /** Restores actual history before view shutdown. @returns Nothing. */ () => {
      f.shell.Undo();
    },
  );
  cleanup();
  expect(f.session.view.GetEditWin().MouseMove({ x: 150, y: 300 })).toBe(false);
});

it("mounted device rows retain table ownership when the page wrapper measurement is unavailable", /** Checks optional page-origin ingress during a browser wrapper lifetime change. @returns Nothing. */ () => {
  const f = fixture();
  required(document.querySelector("[data-writer-page]")).removeAttribute("data-writer-page");
  fireEvent.mouseDown(f.paragraph, { button: 0, detail: 1, clientX: 150, clientY: 200 });
  fireEvent.mouseMove(document, { clientX: 350, clientY: 220 });
  fireEvent.mouseUp(document, { clientX: 350, clientY: 220 });
  expect(required(f.table.GetTabLines()[1]).GetFormat().frameSize?.GetHeight()).toBe(1050);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
});

it("mounted native border GrabFocus leaves toolbar focus and retains the original editing PaM", /** Checks source document focus before ruler capture while protecting selection. @returns Nothing. */ () => {
  const f = fixture(),
    cursor = f.shell.CaptureCursorState(),
    button = document.createElement("button");
  document.body.append(button);
  button.focus();
  expect(document.activeElement).toBe(button);
  fireEvent.mouseDown(f.paragraph, { button: 2, detail: 1, clientX: 150, clientY: 150 });
  expect(document.activeElement).toBe(button);
  fireEvent.mouseDown(f.paragraph, { button: 0, detail: 1, clientX: 150, clientY: 150 });
  expect(document.activeElement).toBe(f.host);
  expect(f.shell.CaptureCursorState().point).toEqual(cursor.point);
  fireEvent.mouseMove(document, { clientX: 300, clientY: 175 });
  fireEvent.keyDown(f.host, { key: "Enter" });
  expect(required(f.table.GetTabLines()[0]).GetFormat().frameSize?.GetHeight()).toBe(1125);
  expect(f.shell.CaptureCursorState().point).toEqual(cursor.point);
  button.remove();
  fireEvent.mouseDown(f.paragraph, { button: 0, detail: 1, clientX: 95, clientY: 125 });
  expect(document.querySelector("[data-writer-table-row-guide]")).toBeNull();
  fireEvent.mouseUp(document, { clientX: 95, clientY: 125 });
});
