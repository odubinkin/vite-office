/** @fileoverview Verifies main table rendering paints its already-owned original native hierarchy. */
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { WriterEditableTable } from "./WriterEditableTable";
import { SwTabFramePainter } from "../../source/core/layout/paintfrm";
import { SwRowFrame, SwCellFrame } from "../../source/core/layout/tabfrm";
import type { SwModify } from "../../inc/calbck";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases original view and native model ownership. @returns Nothing. */ () => {
    cleanup();
    vi.restoreAllMocks();
    for (const s of sessions.splice(0)) s.Close();
  },
);
/** Reads actual registered clients. @param format - Native owner. @returns Clients. */
function clients(format: SwModify) {
  const values: unknown[] = [];
  format.ForAllListeners(
    /** Visits each original client. @param client - Native registration. @returns Continue. */ (
      client,
    ) => {
      values.push(client);
      return false;
    },
  );
  return values;
}
/** Creates an actual native collapsing table under the production view. @returns Original session and table. */
function fixture() {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    table = doc.nodes.MakeTableNode("Original paint", { width: 6000, borderModel: "collapsing" });
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  const row = doc.nodes.AppendTableRow(table, 2);
  for (const box of row.GetTabBoxes()) box.GetParagraphs()[0]?.SetText("Borrow");
  return { session, table, row };
}
it("mounted native table paint sees exactly one existing row and cell hierarchy", /** Checks original live registrations during real interval insertion and final release. @returns Nothing. */ () => {
  const f = fixture(),
    insert = SwTabFramePainter.prototype.Insert;
  let observed = 0;
  vi.spyOn(SwTabFramePainter.prototype, "Insert").mockImplementation(
    /** Observes original painter ingress without replacing its algorithm. @param this - Original borrowed painter. @param line - Actual interval. @param horizontal - Source family. @returns Nothing. */ function (
      this: SwTabFramePainter,
      line,
      horizontal,
    ) {
      expect(
        clients(f.row.GetFrameFormat()).filter(
          /** Keeps actual native row frames. @param client - Registered owner. @returns Whether row frame. */ (
            client,
          ) => client instanceof SwRowFrame,
        ),
      ).toHaveLength(1);
      for (const box of f.row.GetTabBoxes())
        expect(
          clients(box.GetFrameFormat()).filter(
            /** Keeps original physical cell frames. @param client - Registered owner. @returns Whether native cell. */ (
              client,
            ) => client instanceof SwCellFrame,
          ),
        ).toHaveLength(1);
      observed++;
      insert.call(this, line, horizontal);
    },
  );
  render(<WriterWorkbench isActive view={f.session.view} />);
  expect(screen.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" })).toHaveTextContent(
    "Borrow",
  );
  expect(observed).toBeGreaterThan(0);
  expect(clients(f.row.GetFrameFormat())).toEqual([f.row]);
  for (const box of f.row.GetTabBoxes()) expect(clients(box.GetFrameFormat())).toEqual([box]);
});
it("missing native paragraph projection releases the sole renderer-owned hierarchy", /** Checks successful painter construction followed by JSX failure does not leak or duplicate clients. @returns Nothing. */ () => {
  const f = fixture();
  expect(
    /** Invokes actual renderer with a missing device projection. @returns Table. */ () =>
      WriterEditableTable({ table: f.table, paragraphs: new Map() }),
  ).toThrow("no connected paragraph projection");
  expect(clients(f.row.GetFrameFormat())).toEqual([f.row]);
  for (const box of f.row.GetTabBoxes()) expect(clients(box.GetFrameFormat())).toEqual([box]);
});
it("native painter insertion failure releases only the renderer-owned graph", /** Checks real native ownership when border construction fails. @returns Nothing. */ () => {
  const f = fixture();
  vi.spyOn(SwTabFramePainter.prototype, "Insert").mockImplementation(
    /** Rejects actual border insertion. @returns Never. */ () => {
      throw Error("Border device unavailable");
    },
  );
  expect(
    /** Invokes the production renderer's native finally path. @returns Table. */ () =>
      WriterEditableTable({ table: f.table, paragraphs: new Map() }),
  ).toThrow("Border device unavailable");
  expect(clients(f.row.GetFrameFormat())).toEqual([f.row]);
  for (const box of f.row.GetTabBoxes()) expect(clients(box.GetFrameFormat())).toEqual([box]);
});
