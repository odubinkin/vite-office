/** @fileoverview Verifies actual numeric headline document commands, native hint publication and capped no-op contracts. */
import { expect, it, vi, type MockInstance } from "vitest";
import { SwPosition } from "../crsr/pam";
import { SwDoc } from "../doc/doc";
import { TableHeadingChange } from "../../../inc/hints";
import { SwUndoTableHeadline } from "../undo/untbl";
import { SwTabFrame } from "../layout/tabfrm";
/** Builds original native rows without a format mirror. @returns Native owners. */
function fixture() {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Headline");
  table.AddColumnWidth(3000);
  for (let index = 0; index < 3; index++) doc.nodes.AppendTableRow(table, 1);
  return { doc, table };
}
it("publishes one concrete heading hint after scalar mutation without reading table or row snapshots", /** Checks the native command and represented document revision publication boundary. @returns Nothing. */ () => {
  const { doc, table } = fixture(),
    format = table.GetFrameFormat(),
    frame = new SwTabFrame(table);
  frame.setFrameAreaSizeValid(true);
  frame.setFramePrintAreaValid(true);
  frame.setFrameAreaPositionValid(true);
  const originalNotify = format.CallSwClientNotify.bind(format),
    observedCounts: number[] = [];
  const frameNotify = vi.spyOn(format, "CallSwClientNotify").mockImplementation(
      /** Observes the concrete hint on the original frame owner after scalar storage. @param hint - Published native hint. @returns Nothing. */ (
        hint,
      ) => {
        observedCounts.push(table.GetRowsToRepeat());
        originalNotify(hint);
      },
    ),
    revision = doc.GetDocumentStateManager().GetModelRevision(),
    publish = vi.spyOn(doc, "NotifyModelChange"),
    snapshots: MockInstance[] = [vi.spyOn(table, "GetFormat"), vi.spyOn(table, "SetFormat")];
  for (const row of table.GetTabLines()) {
    snapshots.push(vi.spyOn(row, "GetFormat"), vi.spyOn(row, "SetFormat"));
    for (const box of row.GetTabBoxes())
      snapshots.push(vi.spyOn(box, "GetFormat"), vi.spyOn(box, "SetFormat"));
  }
  try {
    expect(doc.SetRowsToRepeat(table, 2)).toBe(true);
    expect(table.GetRowsToRepeat()).toBe(2);
    expect(doc.GetUndoManager().GetUndoAction()).toBeInstanceOf(SwUndoTableHeadline);
    expect(doc.GetUndoManager().GetUndoAction()?.GetComment()).toBe("Table heading");
    expect(frameNotify).toHaveBeenCalledOnce();
    expect(observedCounts).toEqual([2]);
    expect(publish).toHaveBeenCalledOnce();
    const hint = frameNotify.mock.calls[0]?.[0];
    expect(hint).toBeInstanceOf(TableHeadingChange);
    expect(publish.mock.calls[0]?.[0]).toBe(hint);
    expect(doc.GetDocumentStateManager().GetModelRevision()).toBe(revision + 1);
    for (const snapshot of snapshots) expect(snapshot).not.toHaveBeenCalled();
    expect(frame.isFrameAreaSizeValid()).toBe(true);
    expect(frame.isFramePrintAreaValid()).toBe(true);
    expect(frame.isFrameAreaPositionValid()).toBe(true);
    expect(doc.SetRowsToRepeat(table, 2)).toBe(false);
    expect(frameNotify).toHaveBeenCalledOnce();
    expect(observedCounts).toEqual([2]);
    expect(publish).toHaveBeenCalledOnce();
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  } finally {
    for (const snapshot of snapshots) snapshot.mockRestore();
    frame.DestroyImpl();
  }
});
it("compares capped old count while retaining uncapped storage on exact no-op", /** Checks source comparison rather than raw stored-count equivalence. @returns Nothing. */ () => {
  const { doc, table } = fixture();
  table.SetRowsToRepeat(9);
  const revision = doc.GetDocumentStateManager().GetModelRevision();
  expect(doc.SetRowsToRepeat(table, 3)).toBe(false);
  expect(table.GetFormat().headerRows).toBe(9);
  expect(doc.GetDocumentStateManager().GetModelRevision()).toBe(revision);
  expect(doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  expect(doc.SetRowsToRepeat(table, 9)).toBe(true);
  expect(doc.SetRowsToRepeat(table, 9)).toBe(true);
  expect(doc.GetUndoManager().GetUndoActionCount()).toBe(2);
});
it.each([
  [65538, 2],
  [65536, 0],
  [-1, 65535],
])(
  "stores actual uint16 count %s as %s with disabled undo",
  /** Checks numeric ingress without a synthetic history or snapshot. @param requested - Authored count. @param stored - Native uint16 value. @returns Nothing. */ (
    requested,
    stored,
  ) => {
    const { doc, table } = fixture();
    doc.GetUndoManager().DoUndo(false);
    expect(doc.SetRowsToRepeat(table, requested)).toBe(true);
    expect(table.GetFormat().headerRows).toBe(stored);
    expect(table.GetRowsToRepeat()).toBe(Math.min(stored, 3));
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  },
);

it("headline history leaves restart admission and original numbered cell restart unchanged", /** Checks actual document guards and independent numbering ownership. @returns Nothing. */ () => {
  const { doc, table } = fixture(),
    foreign = fixture().doc,
    node = table.GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0];
  if (node === undefined) throw Error("Missing original heading text");
  const tablePosition = new SwPosition(table.GetTableNode()),
    cellPosition = new SwPosition(node),
    foreignPosition = new SwPosition(foreign.nodes.at(0));
  try {
    expect(doc.SetNumRuleStart(tablePosition, true)).toBe(false);
    expect(doc.SetNumRuleStart(cellPosition, true)).toBe(false);
    expect(
      /** Rejects the actual foreign table's owner. @returns Admission result. */ () =>
        doc.SetNumRuleStart(foreignPosition, true),
    ).toThrow("another node array");
    const rule = doc.EnsureNumRule("HeadlineRule", "numbered");
    node.SetNumRule(rule.GetName());
    node.SetListId("HeadingList");
    expect(doc.SetNumRuleStart(cellPosition, true)).toBe(true);
    expect(doc.SetRowsToRepeat(table, 0)).toBe(true);
    expect(node.IsListRestart()).toBe(true);
    expect(node.GetNumRule()).toBe(rule);
    expect(doc.SetNumRuleStart(cellPosition, true)).toBe(false);
  } finally {
    tablePosition.Dispose();
    cellPosition.Dispose();
    foreignPosition.Dispose();
  }
});
