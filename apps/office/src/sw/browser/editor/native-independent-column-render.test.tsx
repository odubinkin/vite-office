/** @fileoverview Checks mounted independent native box widths, actual Ctrl+Shift tracking and union-grid device spans. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { HoriOrientation } from "../../../offapi/com/sun/star/text/HoriOrientation";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases actual platform capture and native view owners. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
    vi.restoreAllMocks();
  },
);
/** Requires an original native/DOM owner. @param value - Optional owner. @returns Actual value. */
function required<T>(value: T | undefined | null): T {
  if (value === undefined || value === null)
    throw new Error("Missing independent browser table owner");
  return value;
}
/** Mounts independent literal box geometry with actual native measured-cell owners. @returns Original owners. */
function fixture() {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    table = doc.nodes.MakeTableNode(
      "Independent",
      { width: 4500, horiOrient: HoriOrientation.LEFT },
      required(doc.paragraphs[0]),
    );
  for (const width of [1500, 3000]) table.AddColumnWidth(width);
  doc.nodes.AppendTableRow(table, 2);
  doc.nodes.AppendTableRow(table, 2);
  const second = required(table.GetTabLines()[1]);
  for (const [index, box] of second.GetTabBoxes().entries()) {
    const size = box.GetFrameSize();
    size.SetWidth(index === 0 ? 2000 : 2500);
    box.SetFrameSize(size);
  }
  for (const line of table.GetTabLines())
    for (const box of line.GetTabBoxes()) required(box.GetParagraphs()[0]).SetText("Original text");
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(
    /** Measures actual native box widths without supplying shared columns. @param this - Mounted original element. @returns Device rectangle. */ function (
      this: Element,
    ): DOMRect {
      const row = this.closest("tr"),
        rowIndex = Number(row?.getAttribute("data-writer-table-row") ?? 0),
        isCell = this.matches("td,th"),
        column = isCell ? [...required(row).children].indexOf(this) : 0,
        boxes = required(table.GetTabLines()[rowIndex]).GetTabBoxes();
      let left = 100;
      if (isCell)
        for (let index = 0; index < column; index++)
          left += required(boxes[index]).GetFrameSize().GetWidth() / 15;
      const top = 100 + rowIndex * 50,
        width = isCell
          ? required(boxes[column]).GetFrameSize().GetWidth() / 15
          : this.matches("table,tr")
            ? 300
            : 0,
        height = this.matches("table") ? 100 : this.matches("td,th,tr") ? 50 : 0;
      return {
        x: left,
        y: top,
        left,
        right: left + width,
        top,
        bottom: top + height,
        width,
        height,
        toJSON: /** Returns no serialized device state. @returns Nothing. */ () => undefined,
      };
    },
  );
  render(<WriterWorkbench isActive view={session.view} />);
  return {
    session,
    doc,
    table,
    second,
    shell: session.view.GetWrtShell(),
    paragraph: screen.getByRole("textbox", { name: "Row 2 column 1 paragraph 1" }),
  };
}
it("mounted device grid spans preserve independent original cell owners", /** Checks native geometry reaches actual cell DOM without duplicate text boxes. @returns Nothing. */ () => {
  const f = fixture(),
    cells = [...document.querySelectorAll<HTMLTableCellElement>("[data-writer-table] :is(td,th)")];
  expect(
    cells.map(
      /** Reads source union-grid spans. @param cell - Original mounted cell. @returns Span. */ (
        cell,
      ) => cell.colSpan,
    ),
  ).toEqual([1, 2, 2, 1]);
  expect(screen.getAllByRole("textbox", { name: /Row \d column \d paragraph 1/u })).toHaveLength(4);
  expect(f.second.GetTabBoxes()).toHaveLength(2);
  expect(
    [...document.querySelectorAll<HTMLTableColElement>("[data-writer-table] col")].map(
      /** Reads physical device grid shares. @param column - Mounted column. @returns CSS share. */ (
        column,
      ) => column.style.width,
    ),
  ).toEqual(["33.333333333333336%", "11.11111111111111%", "55.55555555555556%"]);
});
it("actual Ctrl+Shift drag changes only the second native line through release and history", /** Checks mounted physical capture and native current-line document ownership. @returns Nothing. */ () => {
  const f = fixture(),
    originalBoxes = [...f.second.GetTabBoxes()],
    oldCursor = f.shell.CaptureCursorState();
  expect(
    fireEvent.mouseDown(f.paragraph, {
      button: 0,
      detail: 1,
      clientX: 100 + 2000 / 15,
      clientY: 175,
      ctrlKey: true,
      shiftKey: true,
    }),
  ).toBe(false);
  expect(fireEvent.dragStart(f.paragraph, { dataTransfer: { setData: vi.fn() } })).toBe(false);
  fireEvent.mouseMove(document, { clientX: 100 + 2300 / 15, clientY: 800 });
  expect(
    f.second
      .GetTabBoxes()
      .map(
        /** Reads unchanged native preview owners. @param box - Original box. @returns Width. */ (
          box,
        ) => box.GetFrameSize().GetWidth(),
      ),
  ).toEqual([2000, 2500]);
  fireEvent.mouseUp(document, { clientX: 100 + 2300 / 15, clientY: 800 });
  expect(f.table.GetColumnWidths()).toEqual([1500, 3000]);
  expect(
    f.second
      .GetTabBoxes()
      .map(
        /** Reads native accepted current-line widths. @param box - Original box. @returns Width. */ (
          box,
        ) => box.GetFrameSize().GetWidth(),
      ),
  ).toEqual([2300, 2200]);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  expect(f.second.GetTabBoxes()[0]).toBe(originalBoxes[0]);
  expect(f.shell.CaptureCursorState().point).toEqual(oldCursor.point);
  for (let cycle = 0; cycle < 2; cycle++) {
    act(
      /** Restores actual original box-size attributes. @returns Nothing. */ () => {
        expect(f.shell.Undo()).toBe(true);
      },
    );
    expect(
      f.second
        .GetTabBoxes()
        .map(
          /** Reads restored native widths. @param box - Original box. @returns Width. */ (box) =>
            box.GetFrameSize().GetWidth(),
        ),
    ).toEqual([2000, 2500]);
    act(
      /** Reapplies actual independent native attributes. @returns Nothing. */ () => {
        expect(f.shell.Redo()).toBe(true);
      },
    );
    expect(
      f.second
        .GetTabBoxes()
        .map(
          /** Reads reapplied native widths. @param box - Original box. @returns Width. */ (box) =>
            box.GetFrameSize().GetWidth(),
        ),
    ).toEqual([2300, 2200]);
  }
  expect(f.table.GetColumnWidths()).toEqual([1500, 3000]);
});

it("mounted native fuzzy20 union avoids thin duplicate columns and retains actual box owners", /** Checks source fuzzy geometry reaches the mounted table device. @returns Nothing. */ () => {
  const f = fixture(),
    owners = [...f.second.GetTabBoxes()];
  act(
    /** Authors native widths and invalidates the original table. @returns Nothing. */ () => {
      for (const [index, box] of owners.entries()) {
        const size = box.GetFrameSize();
        size.SetWidth(index === 0 ? 1520 : 2980);
        box.SetFrameSize(size);
      }
      f.doc.NotifyModelChange({
        kind: "node-content-changed",
        nodeIndex: f.table.GetTableNode().GetIndex(),
      });
    },
  );
  const cells = [
    ...document.querySelectorAll<HTMLTableCellElement>("[data-writer-table] :is(td,th)"),
  ];
  expect(
    cells.map(
      /** Reads actual source spans. @param cell - Mounted original cell. @returns Span. */
      (cell) => cell.colSpan,
    ),
  ).toEqual([1, 1, 1, 1]);
  expect(document.querySelectorAll("[data-writer-table] col")).toHaveLength(2);
  expect(f.second.GetTabBoxes()).toEqual(owners);
  expect(
    owners.map(
      /** Reads actual model dimensions independent of exported fuzzy positions. @param box - Original cell. @returns Width. */
      (box) => box.GetFrameSize().GetWidth(),
    ),
  ).toEqual([1520, 2980]);
  expect(screen.getAllByRole("textbox", { name: /Row \d column \d paragraph 1/u })).toHaveLength(4);
});
