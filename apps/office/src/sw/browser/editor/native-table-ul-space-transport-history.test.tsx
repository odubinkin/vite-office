/** @fileoverview Verifies mounted transported original native table UL proportions/context survive registered native restoration and direct ItemSet application and three actual history cycles without double scaling. */
import { act, cleanup, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { SvxULSpaceItem } from "../../../editeng/inc/ulspitem";
import { encodeTableFormat, restoreTableSpacing } from "../filter/xml/writer-table-item-codec";
import { RES_UL_SPACE } from "../../inc/hintids";
import { SfxItemSet } from "../../../svl/source/items/itemset";
/** Requires an original native owner. @param value - Candidate. @returns Native owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing original UL owner");
  return value;
}
it("mounted transported native UL scaling and history preserve original graph and five fields", /** Exercises real native frame state, paint and undo/redo. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  try {
    const table = doc.nodes.MakeTableNode(
      "CompleteUL",
      { width: 3000 },
      required(doc.paragraphs[0]),
    );
    table.AddColumnWidth(3000);
    const row = doc.nodes.AppendTableRow(table, 1),
      box = required(row.GetTabBoxes()[0]),
      node = required(box.GetParagraphs()[0]),
      frame = table.GetFrameFormat();
    node.SetText("Native five-field spacing");
    shell.FocusNode(node);
    const before = new SvxULSpaceItem(RES_UL_SPACE);
    before.SetUpper(240, 50);
    before.SetLower(240, 125);
    before.SetContextValue(true);
    frame.SetFormatAttr(before);
    const transported = JSON.parse(JSON.stringify(encodeTableFormat(table)));
    frame.ResetFormatAttr(RES_UL_SPACE);
    restoreTableSpacing(frame, transported.nativeSpacing);
    expect(frame.GetULSpace()).toEqual(before);
    expect(frame.GetULSpace()).not.toBe(before);
    doc.GetUndoManager().Clear();
    render(
      <WriterWorkbench
        isActive
        view={session.view}
        fileDialogs={session.fileDialogs}
        services={session.services}
      />,
    );
    expect(screen.getByRole("table", { name: "CompleteUL" })).toHaveStyle({
      marginTop: "8px",
      marginBottom: "20px",
    });
    const after = before.Clone();
    after.SetUpperValue(300);
    after.SetLowerValue(450);
    after.SetContextValue(false);
    const input = new SfxItemSet(doc.GetAttrPool(), [[RES_UL_SPACE, RES_UL_SPACE]]);
    input.Put(after);
    const cursor = shell.GetCursor(),
      nodes = [...doc.nodes.entries()];
    act(
      /** Applies an owned original native item. @returns Nothing. */ () => {
        expect(shell.SetTableAttr(input)).toBe(true);
      },
    );
    expect(frame.GetULSpace()).toEqual(after);
    expect(frame.GetULSpace()).not.toBe(after);
    expect(screen.getByRole("table", { name: "CompleteUL" })).toHaveStyle({
      marginTop: "20px",
      marginBottom: "30px",
    });
    for (let cycle = 0; cycle < 3; cycle++) {
      act(
        /** Restores all original fields. @returns Nothing. */ () => {
          expect(shell.Undo()).toBe(true);
        },
      );
      expect(frame.GetULSpace()).toEqual(before);
      expect(screen.getByRole("table", { name: "CompleteUL" })).toHaveStyle({
        marginTop: "8px",
        marginBottom: "20px",
      });
      act(
        /** Reapplies all original fields. @returns Nothing. */ () => {
          expect(shell.Redo()).toBe(true);
        },
      );
      expect(frame.GetULSpace()).toEqual(after);
      expect([
        frame.GetULSpace().GetPropUpper(),
        frame.GetULSpace().GetPropLower(),
        frame.GetULSpace().GetContext(),
      ]).toEqual([50, 125, false]);
      expect(shell.GetCursor()).toBe(cursor);
      expect(doc.nodes.entries()).toEqual(nodes);
      expect(table.GetTabLines()[0]).toBe(row);
      expect(row.GetTabBoxes()[0]).toBe(box);
      expect(box.GetParagraphs()[0]).toBe(node);
    }
    expect(input.Get(RES_UL_SPACE)).toEqual(after);
    expect(before.GetUpper()).toBe(120);
  } finally {
    cleanup();
    session.Close();
  }
});
