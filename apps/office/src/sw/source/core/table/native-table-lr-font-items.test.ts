/** @fileoverview Verifies original native table ItemSet and actual undo/redo retain independent typed LR measures, units and complete context. */
import { expect, it } from "vitest";
import {
  SvxIndentValue,
  SvxFontUnitMetrics,
  SvxLRSpaceItem,
} from "../../../../editeng/inc/lrspitem";
import { MeasureUnit as U } from "../../../../offapi/com/sun/star/util/MeasureUnit";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { RES_LR_SPACE } from "../../../inc/hintids";
/** Requires an original table owner. @param value - Candidate. @returns Original owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing native LR owner");
  return value;
}
it("original table typed LR units survive complete ItemSet and three actual history cycles", /** Retains native graph/cursor/item ownership without scalar reconstruction. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  try {
    const table = doc.nodes.MakeTableNode("TypedLR", { width: 3000 }),
      frame = table.GetFrameFormat();
    table.AddColumnWidth(3000);
    const row = doc.nodes.AppendTableRow(table, 1),
      box = required(row.GetTabBoxes()[0]),
      node = required(box.GetParagraphs()[0]);
    node.SetText("Native typed indentation");
    shell.FocusNode(node);
    const before = new SvxLRSpaceItem(
      SvxIndentValue.twips(120),
      new SvxIndentValue(1.25, U.FONT_EM),
      new SvxIndentValue(0.5, U.FONT_CJK_ADVANCE),
      RES_LR_SPACE,
    );
    before.PutValue(50, 6);
    before.PutValue(75, 7);
    before.SetPropTextFirstLineOffset(125);
    before.SetAutoFirst(true);
    before.SetGutterMargin(41);
    before.SetRightGutterMargin(73);
    before.SetExplicitZeroMarginValLeft(true);
    before.SetExplicitZeroMarginValRight(true);
    frame.SetFormatAttr(before);
    doc.GetUndoManager().Clear();
    const cursor = shell.GetCursor(),
      nodes = [...doc.nodes.entries()],
      after = before.Clone();
    after.SetRight(new SvxIndentValue(2.5, U.FONT_CJK_ADVANCE), 50);
    after.SetTextFirstLineOffset(new SvxIndentValue(1.25, U.FONT_EM), 80);
    const input = new SfxItemSet(doc.GetAttrPool(), [[RES_LR_SPACE, RES_LR_SPACE]]);
    input.Put(after);
    expect(shell.SetTableAttr(input)).toBe(true);
    expect(frame.GetLRSpace().equals(after)).toBe(true);
    expect(frame.GetLRSpace()).not.toBe(after);
    expect(frame.GetLRSpace().GetRight()).not.toBe(after.GetRight());
    for (let cycle = 0; cycle < 3; cycle++) {
      expect(shell.Undo()).toBe(true);
      expect(frame.GetLRSpace()).toEqual(before);
      expect(frame.GetLRSpace().QueryValue(15)).toEqual({ First: 1.25, Second: U.FONT_EM });
      expect(shell.Redo()).toBe(true);
      expect(frame.GetLRSpace()).toEqual(after);
      expect(frame.GetLRSpace().QueryValue(15)).toEqual({
        First: 1.25,
        Second: U.FONT_CJK_ADVANCE,
      });
      expect(frame.GetLRSpace().ResolveRight(new SvxFontUnitMetrics(100, 200))).toBe(250);
      expect(shell.GetCursor()).toBe(cursor);
      expect(doc.nodes.entries()).toEqual(nodes);
      expect(table.GetTabLines()[0]).toBe(row);
      expect(row.GetTabBoxes()[0]).toBe(box);
      expect(box.GetParagraphs()[0]).toBe(node);
    }
    expect(input.Get(RES_LR_SPACE)).toEqual(after);
    expect(before.GetRight().m_dValue).toBe(1.25);
  } finally {
    session.Close();
  }
});
