/** @fileoverview Checks actual Writer render and borrowed native table painter lifetime over the owning root. */
import { SwClient, SwIterator } from "../../inc/calbck";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { WriterEditableTable } from "./WriterEditableTable";
import { SwTabFrame, SwRowFrame, SwCellFrame } from "../../source/core/layout/tabfrm";
import type { SwModify } from "../../inc/calbck";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases UI before original document owners. @returns Nothing. */ () => {
    cleanup();
    for (const s of sessions.splice(0)) s.Close();
  },
);
/** Reads original native clients. @param owner - Actual format. @returns Original objects. */
function clients(owner: SwModify): unknown[] {
  const out: unknown[] = [];
  for (const client of new SwIterator(SwClient, owner)) {
    out.push(client);
    continue;
  }
  return out;
}
/** Allocates native document with a represented collapsing-border table. @returns Actual owners. */
function fixture() {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    table = doc.nodes.MakeTableNode(
      "Shared actual master",
      { width: 3000, borderModel: "collapsing" },
      doc.paragraphs[0],
    );
  table.AddColumnWidth(3000);
  const row = doc.nodes.AppendTableRow(table, 1);
  row.GetTabBoxes()[0]?.GetParagraphs()[0]?.SetText("Original master content");
  return { session, table, row };
}
it("actual visible and shadow Writer table paint borrow one root-owned hierarchy across rerender and unmount", /** Checks original registered objects survive only until their owning root closes. @returns Nothing. */ () => {
  const f = fixture(),
    view = <WriterWorkbench isActive view={f.session.view} viewStore={f.session.viewStore} />;
  const mounted = render(view);
  const frames = clients(f.table.GetFrameFormat()).filter(
    /** Reads actual native master clients. @param client - Registered object. @returns Whether table frame. */ (
      client,
    ) => client instanceof SwTabFrame,
  ) as SwTabFrame[];
  expect(frames).toHaveLength(1);
  const frame = frames[0] as SwTabFrame,
    row = frame.Lower() as SwRowFrame,
    cell = row.Lower() as SwCellFrame;
  expect(frame.getRootFrame()).toBe(f.session.view.GetLayout());
  expect(clients(f.row.GetFrameFormat())).toEqual([f.row, row]);
  expect(screen.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" })).toHaveTextContent(
    "Original master content",
  );
  mounted.rerender(view);
  expect(
    clients(f.table.GetFrameFormat()).filter(
      /** Keeps actual table clients. @param client - Original object. @returns Whether master. */ (
        client,
      ) => client instanceof SwTabFrame,
    ),
  ).toEqual([frame]);
  mounted.unmount();
  expect(frame.IsInDtor()).toBe(false);
  expect(cell.GetRegisteredIn()).toBeDefined();
  f.session.Close();
  expect(frame.IsInDtor()).toBe(true);
  expect(cell.GetRegisteredIn()).toBeUndefined();
});
it("borrowed renderer JSX failure never destroys its original root-owned hierarchy", /** Checks actual painter followed by required projection failure retains ownership. @returns Nothing. */ () => {
  const f = fixture();
  render(<WriterWorkbench isActive view={f.session.view} />);
  const frame = clients(f.table.GetFrameFormat()).find(
    /** Resolves actual root master. @param client - Original object. @returns Whether master. */ (
      client,
    ) => client instanceof SwTabFrame,
  ) as SwTabFrame;
  const row = frame.Lower();
  expect(
    /** Calls actual renderer with borrowed original frame and missing device text. @returns Table JSX. */ () =>
      WriterEditableTable({ table: f.table, nativeFrame: frame, paragraphs: new Map() }),
  ).toThrow("no connected paragraph projection");
  expect(frame.IsInDtor()).toBe(false);
  expect(frame.Lower()).toBe(row);
  expect(clients(f.row.GetFrameFormat())).toEqual([f.row, row]);
});
