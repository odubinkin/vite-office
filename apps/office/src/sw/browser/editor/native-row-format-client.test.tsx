/** @fileoverview Verifies actual UI and measurement row frame clients have bounded native lifetimes. */
import { act, cleanup, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { SwPosition } from "../../source/core/crsr/pam";
import { SwRowFrame } from "../../source/core/layout/tabfrm";
import { SwFormatFrameSize, SwFrameSize } from "../../inc/fmtfsize";
import { WriterEditableTable } from "./WriterEditableTable";
import { SwRootFrame } from "../../source/core/layout/newfrm";
import { SwLineNumberInfo } from "../../inc/lineinfo";
import { createDefaultWriterPageDescriptor } from "../../source/core/layout/pagedesc";
/** Requires an original model or DOM owner. @param value - Optional owner. @returns Actual owner. */
function required<T>(value: T | null | undefined): T {
  if (value === undefined || value === null) throw new Error("Missing mounted row client owner");
  return value;
}
it("repeated mounted render and native row history leave no temporary frame registrations", /** Checks native original owners, literal rendered geometry and repeated lifecycle cleanup. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  try {
    const table = doc.nodes.MakeTableNode(
      "Mounted",
      { width: 3000, align: "left" },
      doc.paragraphs[0],
    );
    table.AddColumnWidth(3000);
    const row = doc.nodes.AppendTableRow(table, 1, {
        frameSize: new SwFormatFrameSize(SwFrameSize.Minimum, 0, 600),
      }),
      box = required(row.GetTabBoxes()[0]),
      node = required(box.GetParagraphs()[0]);
    node.SetText("Original native client");
    const position = new SwPosition(node, 2);
    shell.SetCursor(position);
    position.Dispose();
    doc.GetUndoManager().Clear();
    const mounted = render(<WriterWorkbench isActive view={session.view} />);
    for (let cycle = 0; cycle < 4; cycle++) {
      mounted.rerender(<WriterWorkbench isActive view={session.view} />);
      const clients: unknown[] = [];
      row.GetFrameFormat().ForAllListeners(
        /** Lists actual native listeners after JSX construction. @param client - Registered listener. @returns Continue flag. */ (
          client,
        ) => {
          clients.push(client);
          return false;
        },
      );
      expect(
        clients.filter(
          /** Detects leaked physical layout clients. @param client - Native listener. @returns Whether frame. */ (
            client,
          ) => client instanceof SwRowFrame,
        ),
      ).toEqual([]);
      expect(clients).toContain(row);
    }
    act(
      /** Applies complete native row height to the original model. @returns Nothing. */ () => {
        expect(shell.SetRowHeight(new SwFormatFrameSize(SwFrameSize.Fixed, 0, 900))).toBe(true);
      },
    );
    const textbox = screen.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" }),
      clip = required(textbox.closest("[data-writer-fixed-row-content]"));
    expect(clip).toHaveStyle({ height: "60px", overflow: "hidden" });
    for (let cycle = 0; cycle < 3; cycle++) {
      act(
        /** Reverts actual native frame-owner history. @returns Nothing. */ () => {
          expect(shell.Undo()).toBe(true);
        },
      );
      expect(
        screen
          .getByRole("textbox", { name: "Row 1 column 1 paragraph 1" })
          .closest("[data-writer-fixed-row-content]"),
      ).toBeNull();
      act(
        /** Reapplies actual native frame-owner history. @returns Nothing. */ () => {
          expect(shell.Redo()).toBe(true);
        },
      );
      expect(
        required(
          screen
            .getByRole("textbox", { name: "Row 1 column 1 paragraph 1" })
            .closest("[data-writer-fixed-row-content]"),
        ),
      ).toHaveStyle({ height: "60px" });
      const clients: unknown[] = [];
      row.GetFrameFormat().ForAllListeners(
        /** Lists current native frame registrations. @param client - Actual listener. @returns Continue flag. */ (
          client,
        ) => {
          clients.push(client);
          return false;
        },
      );
      expect(clients).toEqual([row]);
      expect(table.GetTabLines()[0]).toBe(row);
      expect(box.GetParagraphs()[0]).toBe(node);
      expect(node.GetText()).toBe("Original native client");
    }
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  } finally {
    cleanup();
    session.Close();
  }
});
it("native table measurement destroys each temporary row frame while retaining its canonical row owner", /** Checks actual SwRootFrame formatting rather than a mirrored geometry helper. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc();
  try {
    const table = doc.nodes.MakeTableNode("Measured", {}, required(doc.paragraphs[0]));
    table.AddColumnWidth(3000);
    for (let index = 0; index < 3; index++)
      doc.nodes.AppendTableRow(table, 1, {
        frameSize: new SwFormatFrameSize(SwFrameSize.Minimum, 0, 600),
      });
    const rows = [...table.GetTabLines()],
      layout = new SwRootFrame(/** Reads actual native document. @returns Document. */ () => doc),
      page = createDefaultWriterPageDescriptor("en-US").GetValue();
    for (let cycle = 0; cycle < 4; cycle++) {
      layout.Invalidate();
      const measurements = [
        {
          id: String(required(doc.paragraphs[0]).GetIndex()),
          lines: [{ start: 0, end: 0, height: 240 }],
        },
      ];
      const result = layout.Format(
        measurements,
        page,
        undefined,
        new SwLineNumberInfo().QueryValue(),
        0,
        [{ tableName: "Measured", rowHeights: [600 + cycle, 700, 800] }],
      );
      expect(
        result.pages.flatMap(
          /** Collects actual formatted table fragments. @param frame - Physical page. @returns Native fragments. */ (
            frame,
          ) => frame.tableFrames,
        ),
      ).not.toHaveLength(0);
      for (const row of rows) {
        const clients: unknown[] = [];
        row.GetFrameFormat().ForAllListeners(
          /** Lists actual listeners after measurement. @param client - Native client. @returns Continue flag. */ (
            client,
          ) => {
            clients.push(client);
            return false;
          },
        );
        expect(clients).toEqual([row]);
        expect(row.GetFrameFormat().IsDisposed()).toBe(false);
      }
    }
  } finally {
    session.Close();
  }
});

it("render failure releases native temporary row clients before preserving the original model", /** Checks exception lifetime cleanup against the actual main table component. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc();
  try {
    const table = doc.nodes.MakeTableNode("Failure", { width: 3000 }, required(doc.paragraphs[0]));
    table.AddColumnWidth(3000);
    const row = doc.nodes.AppendTableRow(table, 1),
      format = row.GetFrameFormat();
    expect(
      /** Invokes actual JSX construction with a missing native projection. @returns Table element. */ () =>
        WriterEditableTable({ table, paragraphs: new Map() }),
    ).toThrow("no connected paragraph projection");
    const clients: unknown[] = [];
    format.ForAllListeners(
      /** Reads actual surviving native clients after failure. @param client - Listener. @returns Continue flag. */ (
        client,
      ) => {
        clients.push(client);
        return false;
      },
    );
    expect(clients).toEqual([row]);
    expect(format.IsDisposed()).toBe(false);
    expect(table.GetTabLines()).toEqual([row]);
    render(<WriterWorkbench isActive view={session.view} />);
    expect(screen.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" })).toBeInTheDocument();
  } finally {
    cleanup();
    session.Close();
  }
});
