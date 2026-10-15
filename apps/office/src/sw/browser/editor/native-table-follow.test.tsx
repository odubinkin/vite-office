/** @fileoverview Checks original table follow construction and native row transfer beside actual layout-owned Writer rendering. */
import { SwClient, SwIterator } from "../../inc/calbck";

import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { WriterEditableTable } from "./WriterEditableTable";
import { SwTabFrame, SwRowFrame } from "../../source/core/layout/tabfrm";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [],
  follows: SwTabFrame[] = [];
afterEach(
  /** Ends explicit follows before owning document roots. @returns Nothing. */ () => {
    cleanup();
    for (const f of follows.splice(0)) f.DestroyImpl();
    for (const s of sessions.splice(0)) s.Close();
  },
);
/** Presents native original model and reads its actual registered root master. @returns Original owners. */
function fixture() {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    table = doc.nodes.MakeTableNode(
      "Actual native follow",
      { width: 3000, borderModel: "collapsing" },
      doc.paragraphs[0],
    );
  table.AddColumnWidth(3000);
  const row = doc.nodes.AppendTableRow(table, 1);
  row.GetTabBoxes()[0]?.GetParagraphs()[0]?.SetText("Original transferred row");
  render(<WriterWorkbench isActive view={session.view} />);
  let master: SwTabFrame | undefined;
  for (const c of new SwIterator(SwClient, table.GetFrameFormat())) {
    if (c instanceof SwTabFrame) master = c;
    continue;
  }
  if (master === undefined) throw Error("Missing actual layout master");
  const next = new SwTabFrame(master);
  follows.push(next);
  const paragraphs = new Map(
    session.viewStore
      .GetSnapshot()
      .textNodes.map(
        /** Borrows original native text display. @param p - Current original node projection. @returns Native coordinate and display. */ (
          p,
        ) => [p.nodeIndex, p],
      ),
  );
  return { session, table, row, master, next, paragraphs };
}
it("actual table follow construction leaves original UI and master lower identity intact", /** Checks native follow is an empty original layout object, not another renderer graph. @returns Nothing. */ () => {
  const f = fixture(),
    lower = f.master.Lower();
  expect(f.next.FindMaster(true)).toBe(f.master);
  expect(f.next.getRootFrame()).toBe(f.session.view.GetLayout());
  expect(f.next.Lower()).toBeUndefined();
  expect(
    renderToStaticMarkup(
      <WriterEditableTable table={f.table} nativeFrame={f.next} paragraphs={f.paragraphs} />,
    ),
  ).not.toContain("<tr");
  expect(f.master.Lower()).toBe(lower);
  expect(f.next.IsInDtor()).toBe(false);
});
it("borrowed follow paint uses an original transferred row without allocating a mirrored hierarchy", /** Checks actual native RemoveFromLayout/InsertBehind and original painter/renderer lifetime. @returns Nothing. */ () => {
  const f = fixture(),
    row = f.master.Lower() as SwRowFrame;
  row.RemoveFromLayout();
  row.InsertBehind(f.next);
  const html = renderToStaticMarkup(
    <WriterEditableTable table={f.table} nativeFrame={f.next} paragraphs={f.paragraphs} />,
  );
  expect(html).toContain("Original transferred row");
  expect(row.GetUpper()).toBe(f.next);
  expect(row.GetTabLine()).toBe(f.row);
  expect(row.getRootFrame()).toBe(f.session.view.GetLayout());
  expect(f.next.FindMaster()).toBe(f.master);
  expect(f.next.IsInDtor()).toBe(false);
  f.next.DestroyImpl();
  expect(f.master.HasFollow()).toBe(false);
  expect(row.GetRegisteredIn()).toBeUndefined();
  expect(f.master.IsInDtor()).toBe(false);
});
