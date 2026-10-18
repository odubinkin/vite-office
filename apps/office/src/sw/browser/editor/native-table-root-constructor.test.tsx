/** @fileoverview Checks actual browser mouse table frame allocation borrows the original native Writer root. */
import { SwClient, SwIterator } from "../../inc/calbck";

import { expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { BrowserWriterEditWindow } from "./browser-writer-edit-window";
import { SwTabFrame, SwRowFrame, SwCellFrame } from "../../source/core/layout/tabfrm";
/** Requires an actual native owner. @param value - Optional original owner. @returns Original owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing native constructor owner");
  return value;
}
it.each([false, true])(
  "native mouse frame borrows actual view root across geometry reuse moved=%s",
  /** Checks native allocation, measured device property and original lower/format lifetime. @param moved - Whether geometry moves before reuse. @returns Nothing. */ (
    moved,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      table = doc.nodes.MakeTableNode("Native mouse root");
    table.AddColumnWidth(3000);
    const line = doc.nodes.AppendTableRow(table, 1),
      box = required(line.GetTabBoxes()[0]),
      root = document.createElement("article"),
      element = document.createElement("table"),
      cell = document.createElement("td");
    element.setAttribute("aria-label", table.GetName());
    cell.dataset.writerTableBox = String(box.GetStartNode().GetIndex());
    element.append(cell);
    root.append(element);
    document.body.append(root);
    let left = 0;
    vi.spyOn(element, "getBoundingClientRect").mockImplementation(
      /** Measures only actual DOM device geometry. @returns Native browser rectangle. */ () =>
        new DOMRect(left, 0, 200, 100),
    );
    vi.spyOn(cell, "getBoundingClientRect").mockImplementation(
      /** Measures original cell element. @returns Native browser rectangle. */ () =>
        new DOMRect(left, 0, 200, 100),
    );
    const controller = new BrowserWriterEditWindow(
        session.view.GetEditWin(),
        {
          document,
          getSelection: /** Reads browser owner. @returns Selection. */ () => window.getSelection(),
        },
        /** No text measurement is needed for table hover. @returns Undefined. */ () => undefined,
      ),
      unsubscribe = controller.Subscribe(root);
    const history = doc.GetUndoManager().GetUndoActionCount();
    /** Sends one original browser pointer sample. @returns Nothing. */ function hover() {
      controller.HandlePointerMove({
        clientX: 999,
        clientY: 999,
        currentTarget: root,
        preventDefault: vi.fn(),
      } as unknown as React.MouseEvent<HTMLElement>);
    }
    /** Reads actual original registered native frame. @returns Original frame. */ function native() {
      let result: SwTabFrame | undefined;
      for (const client of new SwIterator(SwClient, table.GetFrameFormat())) {
        if (client instanceof SwTabFrame) result = client;
        continue;
      }
      return required(result);
    }
    try {
      hover();
      const frame = native(),
        row = frame.Lower() as SwRowFrame,
        nativeCell = row.Lower() as SwCellFrame;
      expect(frame.getRootFrame()).toBe(session.view.GetWrtShell().GetLayout());
      expect(row.getRootFrame()).toBe(frame.getRootFrame());
      expect(nativeCell.getRootFrame()).toBe(frame.getRootFrame());
      expect(frame.mouseGeometry?.rect.left).toBe(0);
      if (moved) left = 25;
      hover();
      expect(native()).toBe(frame);
      expect(frame.mouseGeometry?.rect.left).toBe(left);
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(history);
      unsubscribe();
      expect(frame.IsInDtor()).toBe(true);
      expect(nativeCell.GetRegisteredIn()).toBeUndefined();
      expect(row.GetRegisteredIn()).toBeUndefined();
    } finally {
      unsubscribe();
      root.remove();
      session.Close();
    }
  },
);
