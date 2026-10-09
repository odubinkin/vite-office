/** @fileoverview Verifies native table hierarchy lifetimes at actual browser rendering and mouse measurement boundaries. */
import { expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterEditableTable } from "./WriterEditableTable";
import { BrowserWriterEditWindow } from "./browser-writer-edit-window";
import { SwTabFrame, SwRowFrame, SwCellFrame } from "../../source/core/layout/tabfrm";
import { SwFormatVertOrient } from "../../inc/fmtornt";
import { SwFormatFrameSize, SwFrameSize } from "../../inc/fmtfsize";
import { SwTableLine } from "../../source/core/table/swtable";
import type { SwModify } from "../../inc/calbck";
/** Requires one native owner. @param value - Optional owner. @returns Original owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing browser table hierarchy owner");
  return value;
}
/** Reads actual registered clients. @param format - Original format. @returns Current original objects. */
function clients(format: SwModify): unknown[] {
  const result: unknown[] = [];
  format.ForAllListeners(
    /** Reads native client identity. @param client - Registered client. @returns Continue flag. */ (
      client,
    ) => {
      result.push(client);
      return false;
    },
  );
  return result;
}
it("browser table render skips empty native rows and releases the table hierarchy on rendering failure", /** Exercises the actual JSX error boundary without a test adapter. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    table = doc.nodes.MakeTableNode("Render");
  table.AddColumnWidth(3000);
  const empty = new SwTableLine(doc.MakeTableLineFormat());
  table.AddLine(empty);
  try {
    const markup = renderToStaticMarkup(
      <WriterEditableTable table={table} paragraphs={new Map()} />,
    );
    expect(markup).not.toContain("<tr");
    expect(
      clients(table.GetFrameFormat()).filter(
        /** Detects actual table frame ownership. @param value - Native client. @returns Whether frame. */ (
          value,
        ) => value instanceof SwTabFrame,
      ),
    ).toEqual([]);
    expect(clients(empty.GetFrameFormat())).toEqual([empty]);
    const row = doc.nodes.AppendTableRow(table, 1),
      box = required(row.GetTabBoxes()[0]),
      before = [
        clients(table.GetFrameFormat()),
        clients(row.GetFrameFormat()),
        clients(box.GetFrameFormat()),
      ];
    expect(
      /** Attempts rendering without the required paragraph projection. @returns Native markup. */ () =>
        renderToStaticMarkup(<WriterEditableTable table={table} paragraphs={new Map()} />),
    ).toThrow("Writer table cell has no connected paragraph projection.");
    expect([
      clients(table.GetFrameFormat()),
      clients(row.GetFrameFormat()),
      clients(box.GetFrameFormat()),
    ]).toEqual(before);
  } finally {
    session.Close();
  }
});
it("browser mouse geometry retains exactly one table hierarchy and destroys replaced or unmounted frames", /** Checks real hover, failed measurement and unsubscribe lifetimes. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    table = doc.nodes.MakeTableNode("Mouse");
  table.AddColumnWidth(3000);
  const row = doc.nodes.AppendTableRow(table, 1),
    box = required(row.GetTabBoxes()[0]);
  const root = document.createElement("article"),
    element = document.createElement("table"),
    cell = document.createElement("td");
  element.setAttribute("aria-label", table.GetName());
  cell.dataset.writerTableBox = String(box.GetStartNode().GetIndex());
  element.append(cell);
  root.append(element);
  document.body.append(root);
  vi.spyOn(element, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 200, 100));
  vi.spyOn(cell, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 200, 100));
  const controller = new BrowserWriterEditWindow(
      session.view.GetEditWin(),
      {
        document,
        getSelection: /** Reads native browser selection. @returns Current selection. */ () =>
          window.getSelection(),
      },
      /** No measured paragraph is needed for hover. @returns Absent paragraph. */ () => undefined,
    ),
    unsubscribe = controller.Subscribe(root);
  const hover = /** Sends one actual hover sample. @returns Nothing. */ () =>
    controller.HandlePointerMove({
      clientX: 999,
      clientY: 999,
      currentTarget: root,
      preventDefault: vi.fn(),
    } as unknown as React.MouseEvent<HTMLElement>);
  try {
    hover();
    const first = required(
      clients(table.GetFrameFormat()).find(
        /** Finds the retained native table. @param value - Original client. @returns Whether a table frame. */ (
          value,
        ) => value instanceof SwTabFrame,
      ),
    ) as SwTabFrame;
    expect(
      clients(row.GetFrameFormat()).filter(
        /** Finds actual physical rows. @param value - Native client. @returns Whether row. */ (
          value,
        ) => value instanceof SwRowFrame,
      ),
    ).toHaveLength(1);
    expect(
      clients(box.GetFrameFormat()).filter(
        /** Finds actual physical cells. @param value - Native client. @returns Whether cell. */ (
          value,
        ) => value instanceof SwCellFrame,
      ),
    ).toHaveLength(1);
    hover();
    expect(first.GetRegisteredIn()).toBeUndefined();
    expect(first.Lower()).toBeUndefined();
    const retained = clients(row.GetFrameFormat());
    expect(retained).toHaveLength(2);
    const secondTable = doc.nodes.MakeTableNode("Broken");
    secondTable.AddColumnWidth(3000);
    doc.nodes.AppendTableRow(secondTable, 1);
    const broken = document.createElement("table");
    broken.setAttribute("aria-label", secondTable.GetName());
    root.append(broken);
    vi.spyOn(broken, "getBoundingClientRect").mockImplementation(
      /** Rejects a later physical device measurement. @returns Never. */ () => {
        throw Error("Device geometry unavailable");
      },
    );
    expect(hover).toThrow("Device geometry unavailable");
    expect(clients(row.GetFrameFormat())).toEqual(retained);
    broken.remove();
    root.replaceChildren();
    hover();
    expect(clients(table.GetFrameFormat())).toEqual([]);
    expect(clients(row.GetFrameFormat())).toEqual([row]);
    expect(clients(box.GetFrameFormat())).toEqual([box]);
    root.append(element);
    hover();
    expect(clients(row.GetFrameFormat())).toHaveLength(2);
    unsubscribe();
    expect(clients(table.GetFrameFormat())).toEqual([]);
    expect(clients(row.GetFrameFormat())).toEqual([row]);
    expect(clients(box.GetFrameFormat())).toEqual([box]);
  } finally {
    unsubscribe();
    root.remove();
    vi.restoreAllMocks();
    session.Close();
  }
});

it("browser mouse frame admission skips unknown, empty and detached samples and preserves previous geometry", /** Checks native frame admission and the previous measured rectangle. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    table = doc.nodes.MakeTableNode("Admission");
  table.AddColumnWidth(3000);
  const row = doc.nodes.AppendTableRow(table, 1),
    box = required(row.GetTabBoxes()[0]);
  const root = document.createElement("article"),
    previous = document.createElement("p");
  document.body.append(previous, root);
  const previousRect = new DOMRect(10, 20, 30, 40);
  vi.spyOn(previous, "getBoundingClientRect").mockReturnValue(previousRect);
  const controller = new BrowserWriterEditWindow(
    session.view.GetEditWin(),
    {
      document,
      getSelection: /** Reads native browser selection. @returns Current selection. */ () =>
        window.getSelection(),
    },
    /** No measured paragraph is needed for hover. @returns Absent paragraph. */ () => undefined,
  );
  const hover = /** Sends one actual hover sample. @returns Nothing. */ () =>
    controller.HandlePointerMove({
      currentTarget: root,
      clientX: 999,
      clientY: 999,
      preventDefault: vi.fn(),
    } as unknown as React.MouseEvent<HTMLElement>);
  hover();
  const unsubscribe = controller.Subscribe(root);
  try {
    const unknown = document.createElement("table");
    unknown.setAttribute("aria-label", "Missing");
    root.append(unknown);
    hover();
    expect(clients(table.GetFrameFormat())).toEqual([]);
    unknown.remove();
    const element = document.createElement("table");
    element.setAttribute("aria-label", table.GetName());
    root.append(element);
    hover();
    expect(clients(table.GetFrameFormat())).toEqual([]);
    vi.spyOn(element, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 200, 100));
    hover();
    expect(clients(table.GetFrameFormat())).toEqual([]);
    const cell = document.createElement("td");
    cell.dataset.writerTableBox = "-1";
    element.append(cell);
    hover();
    expect(clients(table.GetFrameFormat())).toEqual([]);
    cell.dataset.writerTableBox = String(box.GetStartNode().GetIndex());
    vi.spyOn(cell, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 200, 100));
    hover();
    const frame = required(
      clients(table.GetFrameFormat()).find(
        /** Finds the owned native table frame. @param value - Registered client. @returns Whether native table. */ (
          value,
        ) => value instanceof SwTabFrame,
      ),
    ) as SwTabFrame;
    expect(frame.mouseGeometry?.previous).toBe(previousRect);
    expect(frame.mouseGeometry?.cells[0]?.box).toBe(box);
    expect(clients(row.GetFrameFormat())).toHaveLength(2);
  } finally {
    unsubscribe();
    root.remove();
    previous.remove();
    vi.restoreAllMocks();
    session.Close();
  }
});

it("native owned table rendering preserves centered cells and zero-width column admission", /** Checks original frame formatting for natural and fixed rows. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    table = doc.nodes.MakeTableNode("Centered", { width: 0 }, doc.paragraphs[0]);
  table.AddColumnWidth(0);
  for (const type of [SwFrameSize.Minimum, SwFrameSize.Fixed]) {
    const row = doc.nodes.AppendTableRow(table, 1, {
        frameSize: new SwFormatFrameSize(type, 0, 600),
      }),
      box = required(row.GetTabBoxes()[0]);
    box.SetFormat({ vertOrient: new SwFormatVertOrient(0, 2, 0) });
    required(box.GetParagraphs()[0]).SetText("Centered " + type);
  }
  try {
    const paragraphs = new Map(
      session.viewStore
        .GetSnapshot()
        .textNodes.map(
          /** Indexes actual frozen projections. @param paragraph - Original projection. @returns Native lookup entry. */ (
            paragraph,
          ) => [paragraph.nodeIndex, paragraph],
        ),
    );
    const markup = renderToStaticMarkup(
      <WriterEditableTable table={table} paragraphs={paragraphs} />,
    );
    expect(markup).toContain("width:100%");
    expect(markup).toContain("vertical-align:middle");
    expect(markup).toContain("justify-content:safe center");
    for (const row of table.GetTabLines()) {
      expect(clients(row.GetFrameFormat())).toEqual([row]);
      for (const box of row.GetTabBoxes()) expect(clients(box.GetFrameFormat())).toEqual([box]);
    }
    expect(clients(table.GetFrameFormat())).toEqual([]);
  } finally {
    session.Close();
  }
});
