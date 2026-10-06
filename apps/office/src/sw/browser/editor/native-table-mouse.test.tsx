/** @fileoverview Checks mounted native table edge mouse selection and document capture cleanup. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { BrowserWriterEditWindow } from "./browser-writer-edit-window";
import { SwTableCursor } from "../../source/core/crsr/swcrsr";
/** Requires a real fixture owner. @param value - Optional connected owner. @returns Actual owner. */
function required<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) throw new Error("Missing real mouse fixture owner");
  return value;
}
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Tears down platform capture before closing native views. @returns Nothing. */
  () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
    vi.restoreAllMocks();
  },
);
/** Installs literal physical frame measurements over actual mounted cells. @returns Nothing. */
function measure(): void {
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
    /** Supplies browser device geometry only. @param this - Mounted device element. @returns Physical frame rectangle. */
    function (this: Element): DOMRect {
      const row = this.closest("tr"),
        r = Number(row?.getAttribute("data-writer-table-row") ?? 0),
        c = this.matches("td,th") ? [...required(row).children].indexOf(this) : 0;
      const x = 100 + c * 100,
        y = 100 + r * 50,
        width = this.matches("td,th") ? 100 : this.matches("table,tr") ? 300 : 0,
        height = this.matches("table") ? 150 : this.matches("td,th,tr") ? 50 : 0;
      return {
        x,
        y,
        left: x,
        top: y,
        right: x + width,
        bottom: y + height,
        width,
        height,
        toJSON:
          /** Preserves the rectangle serialization interface. @returns Nothing. */
          () => undefined,
      };
    },
  );
}
/** Mounts a real3x3 native Writer grid. @returns Actual model and DOM owners. */
function fixture() {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    table = doc.nodes.MakeTableNode("Mouse", { width: 4500 }, doc.paragraphs[0]);
  for (let c = 0; c < 3; c++) table.AddColumnWidth(1500);
  for (let r = 0; r < 3; r++) doc.nodes.AppendTableRow(table, 3);
  const boxes = table.GetTabLines().flatMap(
    /** Reads actual canonical boxes. @param row - Native row. @returns Original cells. */
    (row) => row.GetTabBoxes(),
  );
  render(<WriterWorkbench isActive view={session.view} />);
  measure();
  const host = required(document.querySelector<HTMLElement>("[data-writer-editing-host]"));
  return {
    session,
    doc,
    table,
    boxes,
    host,
    shell: session.view.GetWrtShell(),
    display: screen.getByRole("table", { name: "Mouse" }),
  };
}
/** Reads original box selection indices. @param f - Mounted fixture. @returns Literal selected indices. */
function selected(f: ReturnType<typeof fixture>): number[] {
  return (f.shell.getShellCursor() as SwTableCursor).GetSelectedBoxes().map(
    /** Reads actual cursor identity. @param box - Selected box. @returns Original index. */
    (box) => f.boxes.indexOf(box),
  );
}

it.each([
  [93, 125, [0, 1, 2]],
  [250, 93, [1, 4, 7]],
  [93, 93, [0, 1, 2, 3, 4, 5, 6, 7, 8]],
])(
  "mounted source edge %s,%s paints actual selected boxes",
  /** Checks real native mouse ownership and no synthetic row widget. @param x - Device x. @param y - Device y. @param indices - Literal selected owners. @returns Nothing. */
  (x, y, indices) => {
    const f = fixture();
    expect(fireEvent.mouseDown(f.host, { button: 0, detail: 1, clientX: x, clientY: y })).toBe(
      false,
    );
    expect(selected(f)).toEqual(indices);
    expect(f.display.querySelectorAll('[data-writer-editor-selected="true"]')).toHaveLength(
      indices.length,
    );
    expect(screen.queryByRole("button", { name: "Select row 1 in Mouse" })).toBeNull();
    fireEvent.mouseMove(f.host, { clientX: 93, clientY: 225 });
    fireEvent.mouseUp(f.host);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  },
);

it("captures row drag outside the React root and shrinks/reverses native selection" /** Checks native document capture rather than component row state. @returns Nothing. */, () => {
  const f = fixture();
  fireEvent.mouseDown(f.host, { button: 0, detail: 1, clientX: 93, clientY: 225 });
  fireEvent.mouseMove(document, { clientX: 700, clientY: 125 });
  expect(selected(f)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  fireEvent.mouseMove(document, { clientX: 700, clientY: 175 });
  expect(selected(f)).toEqual([3, 4, 5, 6, 7, 8]);
  fireEvent.mouseUp(document);
  const before = f.shell.getShellCursor();
  fireEvent.mouseMove(document, { clientX: 93, clientY: 125 });
  expect(f.shell.getShellCursor()).toBe(before);
});

it("uses native row, column and corner pointer kinds and rejects right/double click admission" /** Checks hover classification and mouse admission without changing history. @returns Nothing. */, () => {
  const f = fixture();
  for (const [x, y, cursor] of [
    [93, 125, "e-resize"],
    [250, 93, "s-resize"],
    [93, 93, "se-resize"],
    [250, 125, ""],
  ] as const) {
    fireEvent.mouseMove(f.host, { clientX: x, clientY: y });
    expect(f.host.style.cursor).toBe(cursor);
  }
  fireEvent.mouseDown(f.host, { button: 2, detail: 1, clientX: 93, clientY: 125 });
  expect(f.shell.HasBoxSelection()).toBe(false);
  fireEvent.mouseDown(f.host, { button: 0, detail: 2, clientX: 93, clientY: 125 });
  expect(f.shell.HasBoxSelection()).toBe(false);
  fireEvent.mouseDown(f.host, { button: 0, detail: 0, clientX: 93, clientY: 125 });
  expect(selected(f)).toEqual([0, 1, 2]);
  fireEvent.blur(window);
  expect(f.session.view.GetEditWin().MouseMove({ x: 93, y: 225 })).toBe(false);
});

it("rejects zero-sized, unowned and stale cell measurements and removes capture on teardown" /** Checks browser device ownership cleanup without runtime row adapters. @returns Nothing. */, () => {
  const f = fixture(),
    foreign = document.createElement("table");
  foreign.setAttribute("aria-label", "Unknown");
  f.host.append(foreign);
  const cell = document.createElement("td");
  cell.dataset.writerTableBox = "999999";
  required(f.display.querySelector("tr")).append(cell);
  fireEvent.mouseMove(f.host, { clientX: 250, clientY: 125 });
  expect(f.shell.HasBoxSelection()).toBe(false);
  vi.spyOn(f.display, "getBoundingClientRect").mockReturnValue({
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
    toJSON:
      /** Supplies collapsed device layout. @returns Nothing. */
      () => undefined,
  });
  fireEvent.mouseDown(f.host, { button: 0, clientX: 93, clientY: 125 });
  expect(f.shell.HasBoxSelection()).toBe(false);
  vi.mocked(f.display.getBoundingClientRect).mockRestore();
  cleanup();
  expect(f.session.view.GetEditWin().MouseMove({ x: 93, y: 225 })).toBe(false);
  const controller = new BrowserWriterEditWindow(
    f.session.view.GetEditWin(),
    {
      document,
      getSelection:
        /** Reads native DOM selection. @returns Platform selection. */
        () => document.getSelection(),
    },
    /** Detached platform resolver never fabricates a paragraph. @returns Undefined. */
    () => undefined,
  );
  const element = document.createElement("article");
  act(
    /** Sends genuine pointer hover to a detached platform controller. @returns Nothing. */
    () =>
      controller.HandlePointerMove({
        currentTarget: element,
        clientX: 93,
        clientY: 125,
        preventDefault: vi.fn(),
      } as never),
  );
  expect(element.style.cursor).toBe("");
});

it("uses native cell-frame print edges when collapsed HTML borders offset the outer table bounds" /** Checks the real Chromium geometry fault independently with unequal outer/cell rectangles and transient detached measurements. @returns Nothing. */, () => {
  const f = fixture(),
    cells = [...f.display.querySelectorAll<HTMLElement>("[data-writer-table-box]")];
  for (const cell of cells) {
    const rect = cell.getBoundingClientRect();
    cell.getBoundingClientRect =
      /** Returns independently measured collapsed-border geometry. @returns Device bounds. */
      () => ({
        ...rect,
        x: rect.x + 1.5,
        y: rect.y + 1.5,
        left: rect.left + 1.5,
        right: rect.right + 1.5,
        top: rect.top + 1.5,
        bottom: rect.bottom + 1.5,
      });
  }
  expect(fireEvent.mouseDown(f.host, { button: 0, detail: 1, clientX: 93, clientY: 125 })).toBe(
    false,
  );
  expect(selected(f)).toEqual([0, 1, 2]);
  fireEvent.mouseUp(f.host);
  const indices = cells.map(
    /** Saves actual mounted section identifiers. @param cell - Device cell. @returns Original identifier. */
    (cell) => cell.dataset.writerTableBox,
  );
  for (const cell of cells) cell.dataset.writerTableBox = "999999";
  fireEvent.mouseMove(f.host, { clientX: 93, clientY: 125 });
  expect(f.host.style.cursor).toBe("");
  for (const [index, cell] of cells.entries()) cell.dataset.writerTableBox = indices[index];
  fireEvent.mouseDown(f.host, { button: 0, detail: 1, clientX: 250, clientY: 93 });
  expect(selected(f)).toEqual([1, 4, 7]);
  cleanup();
  expect(f.session.view.GetEditWin().MouseMove({ x: 93, y: 225 })).toBe(false);
});

it("a detached mouse frame refresh cannot resurrect native table capture after its view subscription closes" /** Checks a late platform event after border-frame teardown keeps native cursor ownership and releases capture. @returns Nothing. */, () => {
  const f = fixture(),
    controller = new BrowserWriterEditWindow(
      f.session.view.GetEditWin(),
      {
        document,
        getSelection:
          /** Reads actual selection from the platform. @returns DOM selection. */
          () => document.getSelection(),
      },
      /** This device-only border view has no text caret resolver. @returns Undefined. */
      () => undefined,
    );
  const unsubscribe = controller.Subscribe(f.host);
  act(
    /** Starts a real native table frame capture through the platform owner. @returns Nothing. */
    () =>
      controller.HandlePointerDown({
        button: 0,
        detail: 1,
        clientX: 93,
        clientY: 125,
        preventDefault: vi.fn(),
      } as never),
  );
  expect(selected(f)).toEqual([0, 1, 2]);
  const cursor = f.shell.getShellCursor();
  unsubscribe();
  controller.HandlePointerMove({
    currentTarget: f.host,
    clientX: 93,
    clientY: 225,
    preventDefault: vi.fn(),
  } as never);
  expect(f.host.style.cursor).toBe("");
  expect(f.shell.getShellCursor()).toBe(cursor);
  expect(f.session.view.GetEditWin().MouseMove({ x: 93, y: 225 })).toBe(false);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});
