/** @fileoverview Verifies actual main UI and painter use original linked native cell frames with bounded lifetimes. */
import { SwClient, SwIterator } from "../../inc/calbck";

import { Color } from "../../../tools/inc/color";
import { act, cleanup, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { WriterEditableTable } from "./WriterEditableTable";
import type { SwTableBox } from "../../source/core/table/swtable";
import { SwCellFrame, SwTabFrame } from "../../source/core/layout/tabfrm";
import { SwTabFramePainter } from "../../source/core/layout/paintfrm";
import { SwPosition } from "../../source/core/crsr/pam";
import { SwFormatVertOrient } from "../../inc/fmtornt";
import { SvxBoxItem } from "../../../editeng/source/items/frmitems";
import { SvxBorderLine } from "../../../editeng/source/items/borderline";
/** Requires an original owner. @param value - Optional model or element. @returns Owner. */
function required<T>(value: T | null | undefined): T {
  if (value === undefined || value === null) throw Error("Missing mounted cell frame");
  return value;
}
/** Checks exact surviving original model format clients. @param box - Connected original cell. @param root - Optional original layout owner for mounted content. @returns Nothing. */
function checkClients(
  box: SwTableBox,
  root?: ReturnType<ReturnType<typeof createWriterDocumentSession>["view"]["GetLayout"]>,
): void {
  const clients: unknown[] = [];
  for (const client of new SwIterator(SwClient, box.GetFrameFormat())) {
    clients.push(client);
    continue;
  }
  if (root !== undefined) {
    const frames = clients.filter(
      /** Reads exact native cell clients retained by mounted layout. @param client - Original object. @returns Whether cell. */
      (client) => client instanceof SwCellFrame,
    ) as SwCellFrame[];
    expect(frames).toHaveLength(1);
    expect(frames[0]?.getRootFrame()).toBe(root);
    expect(frames[0]?.GetTabBox()).toBe(box);
    expect(clients).toHaveLength(2);
    expect(new Set(clients)).toEqual(new Set([box, frames[0]]));
  } else expect(clients).toEqual([box]);
}
it("mounted main table renders native linked cell formats and history without box query wrappers", /** Checks actual rendering, formatting and temporary-client cleanup. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  try {
    const table = doc.nodes.MakeTableNode(
      "Mounted",
      { width: 6000, align: "left", borderModel: "collapsing" },
      doc.paragraphs[0],
    );
    table.AddColumnWidth(3000);
    table.AddColumnWidth(3000);
    const row = doc.nodes.AppendTableRow(table, 2),
      first = required(row.GetTabBoxes()[0]),
      second = required(row.GetTabBoxes()[1]),
      node = required(first.GetParagraphs()[0]);
    node.SetText("Native cell");
    for (const box of [first, second]) {
      const item = new SvxBoxItem(116);
      item.SetAllDistances(60);
      for (const edge of [0, 1, 2, 3])
        item.SetLine(new SvxBorderLine(new Color(0x112233), 30), edge);
      box.ClaimFrameFormat().SetFormatAttr(item);
    }
    const position = new SwPosition(node, 2);
    shell.SetCursor(position);
    position.Dispose();
    doc.GetUndoManager().Clear();
    const queries = [];
    for (const box of [first, second])
      for (const name of ["GetBox", "GetVertOrient", "GetFormat"] as const)
        queries.push(
          vi.spyOn(box, name).mockImplementation(
            /** Rejects model query wrappers on the real native rendering path. @returns Never. */ () => {
              throw Error("Cell model query wrapper");
            },
          ),
        );
    const native = vi.spyOn(SwCellFrame.prototype, "GetFormat"),
      mounted = render(<WriterWorkbench isActive view={session.view} />);
    expect(native).toHaveBeenCalled();
    expect(
      required(
        screen.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" }).closest(":is(td,th)"),
      ),
    ).toHaveStyle({ borderLeft: "1.5pt solid #112233", paddingLeft: "4px" });
    const before = shell.CaptureCursorState();
    act(
      /** Changes complete native cell attributes. @returns Nothing. */ () => {
        expect(doc.SetBoxAttr(shell.GetCursor(), new SwFormatVertOrient(720, 2, 7))).toBe(true);
      },
    );
    for (let cycle = 0; cycle < 3; cycle++) {
      mounted.rerender(<WriterWorkbench isActive view={session.view} />);
      expect(
        required(
          screen.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" }).closest(":is(td,th)"),
        ),
      ).toHaveStyle({ verticalAlign: "middle" });
      checkClients(first, session.view.GetLayout());
      checkClients(second, session.view.GetLayout());
      act(
        /** Reverts actual native history. @returns Nothing. */ () => {
          expect(shell.Undo()).toBe(true);
        },
      );
      expect(
        required(
          screen.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" }).closest(":is(td,th)"),
        ),
      ).toHaveStyle({ verticalAlign: "top" });
      act(
        /** Reapplies actual native history. @returns Nothing. */ () => {
          expect(shell.Redo()).toBe(true);
        },
      );
      expect(shell.CaptureCursorState()).toEqual(before);
      expect(first.GetParagraphs()[0]).toBe(node);
      expect(node.GetText()).toBe("Native cell");
      checkClients(first, session.view.GetLayout());
      checkClients(second, session.view.GetLayout());
    }
    for (const query of queries) expect(query).not.toHaveBeenCalled();
  } finally {
    cleanup();
    vi.restoreAllMocks();
    session.Close();
  }
});
it("main table projection failure releases original linked cell clients before a successful mounted render", /** Checks real JSX exception cleanup, including recursive child frames. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc();
  try {
    const table = doc.nodes.MakeTableNode("Failure", { width: 3000 }, doc.paragraphs[0]);
    table.AddColumnWidth(3000);
    const row = doc.nodes.AppendTableRow(table, 2),
      boxes = [...row.GetTabBoxes()];
    expect(
      /** Invokes actual main JSX with a missing native text projection. @returns Table element. */ () =>
        WriterEditableTable({ table, paragraphs: new Map() }),
    ).toThrow("no connected paragraph projection");
    for (const box of boxes) {
      checkClients(box);
      expect(box.GetFrameFormat().IsDisposed()).toBe(false);
    }
    render(<WriterWorkbench isActive view={session.view} />);
    expect(screen.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" })).toBeInTheDocument();
    for (const box of boxes) checkClients(box, session.view.GetLayout());
  } finally {
    cleanup();
    session.Close();
  }
});
it("native painter and box print-width measurement release registered cell frames after success and paint failure", /** Checks native borrowed item reads and finally cleanup. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc();
  try {
    const table = doc.nodes.MakeTableNode(
      "Paint",
      { width: 6000, align: "left" },
      doc.paragraphs[0],
    );
    table.AddColumnWidth(3000);
    table.AddColumnWidth(3000);
    const row = doc.nodes.AppendTableRow(table, 2),
      boxes = [...row.GetTabBoxes()],
      first = required(boxes[0]);
    const nativeTable = new SwTabFrame(table);
    try {
      expect(nativeTable.GetBoxPrintWidth(first, 9600)).toBe(3000);
    } finally {
      nativeTable.DestroyImpl();
    }
    for (const box of boxes) checkClients(box);
    const paintFrame = new SwTabFrame(table);
    try {
      new SwTabFramePainter(paintFrame).PaintLines(
        /** Reads actual copied painted lines. @param line - Native paint interval. @returns Nothing. */ (
          line,
        ) => {
          expect(line.maAttribute.GetWidth()).toBe(0);
        },
      );
    } finally {
      paintFrame.DestroyImpl();
    }
    for (const box of boxes) checkClients(box);
    const paint = vi.spyOn(SwTabFramePainter.prototype, "Insert").mockImplementation(
      /** Rejects native paint insertion to exercise original cleanup. @returns Never. */ () => {
        throw Error("Device paint failure");
      },
    );
    const failedFrame = new SwTabFrame(table);
    try {
      expect(
        /** Executes the actual painter constructor. @returns Native painter. */ () =>
          new SwTabFramePainter(failedFrame),
      ).toThrow("Device paint failure");
    } finally {
      failedFrame.DestroyImpl();
    }
    for (const box of boxes) checkClients(box);
    paint.mockRestore();
  } finally {
    vi.restoreAllMocks();
    session.Close();
  }
});
