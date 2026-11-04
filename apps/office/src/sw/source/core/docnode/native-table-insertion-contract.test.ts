/** @fileoverview Native SwDoc InsertTable required orientation, column-position vector, table model, source attributes and one recorded undo payload. */
import { assert, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwPosition } from "../crsr/pam";
import { HoriOrientation as H } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { RES_FRAMEDIR, RES_PAGEDESC, RES_BREAK, RES_PARATR_ADJUST } from "../../../inc/hintids";
import { SvxFrameDirectionItem } from "../../../../editeng/inc/frmdiritem";
import { SvxFrameDirection as D } from "../../../../editeng/inc/frmdir";
import { SvxAdjustItem } from "../../../../editeng/inc/adjustitem";
import { SvxAdjust as A } from "../../../../editeng/inc/svxenum";
import { SwFormatPageDesc } from "../attr/fmtpdsc";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import { SvxBreak as B } from "../../../../editeng/inc/svxenum";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh1";
import { SwDocShell } from "../../uibase/app/docsh";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
const options = { mnInsMode: 0, mnRowsToRepeat: 0 };
it.each([H.LEFT, H.RIGHT, H.CENTER, H.FULL, H.NONE])(
  "honors the original required fifth orientation argument %s",
  /** A name no longer occupies the native orientation slot. @param orient - Original orientation. @returns Nothing. */ (
    orient,
  ) => {
    const doc = new SwDoc(),
      node = doc.paragraphs[0];
    assert(node);
    const p = new SwPosition(node);
    const table = doc.InsertTable(options, p, 1, 2, orient, null, null, false, true, "NativeName");
    expect(table.GetFrameFormat().GetHoriOrient().GetHoriOrient()).toBe(orient);
    expect(table.GetName()).toBe("NativeName");
    expect(table.IsNewModel()).toBe(true);
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    p.Dispose();
    doc.Dispose();
  },
);
it.each([
  [H.LEFT, [100, 300, 600], 500, [200, 300], 0, 0],
  [H.NONE, [100, 300, 600, 1000], 500, [200, 300], 100, 400],
  [H.LEFT, [100, 300], 65534, [32767, 32767], 0, 0],
  [H.NONE, [100, 300, 600], 65534, [32767, 32767], 0, 0],
] as const)(
  "uses native column positions/count admission for orientation %s vector %s",
  /** NONE has one extra frame-width endpoint; wrong counts are ignored, not normalized into another vector. @param orient - Original orientation. @param positions - Native positions. @param width - Native table width. @param widths - Cell widths. @param left - Native left margin. @param right - Native right margin. @returns Nothing. */ (
    orient,
    positions,
    width,
    widths,
    left,
    right,
  ) => {
    const doc = new SwDoc(),
      node = doc.paragraphs[0];
    assert(node);
    const p = new SwPosition(node),
      table = doc.InsertTable(options, p, 2, 2, orient, null, positions);
    expect(table.GetFrameFormat().GetFrameSize().GetWidth()).toBe(width);
    expect(table.GetColumnWidths()).toEqual(widths);
    expect(table.GetFrameFormat().GetLRSpace().ResolveLeft()).toBe(left);
    expect(table.GetFrameFormat().GetLRSpace().ResolveRight()).toBe(right);
    for (const line of table.GetTabLines())
      expect(
        line
          .GetTabBoxes()
          .map(
            /** Reads actual cell sizes. @param box - Native box. @returns Width. */ (box) =>
              box.GetFrameSize().GetWidth(),
          ),
      ).toEqual(widths);
    p.Dispose();
    doc.Dispose();
  },
);
it.each([false, true])(
  "propagates source paragraph adjustment only when calledFromShell=%s",
  /** Native filter insertion does not copy the source paragraph's alignment into every cell. @param fromShell - Original native flag. @returns Nothing. */ (
    fromShell,
  ) => {
    const doc = new SwDoc(),
      node = doc.paragraphs[0];
    assert(node);
    node.SetAttr(new SvxAdjustItem(A.Right, RES_PARATR_ADJUST));
    const p = new SwPosition(node),
      table = doc.InsertTable(options, p, 1, 1, H.LEFT, null, null, fromShell);
    const first = table.GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0];
    assert(first);
    expect((first.GetAttr(RES_PARATR_ADJUST) as SvxAdjustItem).GetAdjust()).toBe(
      fromShell
        ? A.Right
        : doc.GetTextFormatColl("table-contents").GetAttrSet().GetAdjust().GetAdjust(),
    );
    p.Dispose();
    doc.Dispose();
  },
);
it("copies frame direction and transfers direct page attributes through native undo/redo", /** Original page attributes return to the source paragraph when the inserted section is undone. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  const ds = new SwDocShell(
      doc,
      createDocument({ id: "insertion", suiteId: "writer", title: "Insertion" }),
    ),
    shell = new SwWrtShell(ds);
  node.SetAttr(new SvxFrameDirectionItem(D.Horizontal_RL_TB, RES_FRAMEDIR));
  node.SetAttr(new SwFormatPageDesc("Standard", 3));
  node.SetAttr(new SfxInt16Item(RES_BREAK, B.PageBefore));
  const p = new SwPosition(node),
    table = doc.InsertTable(
      options,
      p,
      1,
      2,
      H.CENTER,
      null,
      [100, 300, 600],
      false,
      false,
      "Native",
    );
  expect(table.IsNewModel()).toBe(false);
  expect(table.GetFrameFormat().GetAttrSet().GetItemIfSet(RES_FRAMEDIR, false)).toEqual(
    node.GetAttr(RES_FRAMEDIR),
  );
  expect(
    (table.GetFrameFormat().GetAttrSet().Get(RES_PAGEDESC) as SwFormatPageDesc).GetNumOffset(),
  ).toBe(3);
  expect(node.GetpSwAttrSet()?.GetItemIfSet(RES_PAGEDESC, false)).toBeUndefined();
  expect(node.GetpSwAttrSet()?.GetItemIfSet(RES_BREAK, false)).toBeUndefined();
  expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  table.GetFrameFormat().SetFormatAttr(new SwFormatPageDesc("Standard", 7));
  expect(shell.Undo()).toBe(true);
  expect(doc.GetTables()).toHaveLength(0);
  expect((node.GetAttr(RES_PAGEDESC) as SwFormatPageDesc).GetNumOffset()).toBe(7);
  expect((node.GetAttr(RES_BREAK) as SfxInt16Item).GetValue()).toBe(B.PageBefore);
  expect(shell.Redo()).toBe(true);
  const restored = doc.GetTables()[0];
  assert(restored);
  expect(restored.GetName()).toBe("Native");
  expect(restored.IsNewModel()).toBe(true);
  expect(
    (restored.GetFrameFormat().GetAttrSet().Get(RES_PAGEDESC) as SwFormatPageDesc).GetNumOffset(),
  ).toBe(7);
  expect(restored.GetColumnWidths()).toEqual([200, 300]);
  expect(restored.GetFrameFormat().GetHoriOrient().GetHoriOrient()).toBe(H.CENTER);
  expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  p.Dispose();
  shell.Close();
  ds.Close();
});

it("keeps initial shell adjustment distinct from redo defaults and corrects other view and UNO cursors before deletion", /** Exercises the actual initial-operation bridge, native section correction target and reconstructed default model. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  const ds = new SwDocShell(
      doc,
      createDocument({ id: "views", suiteId: "writer", title: "Views" }),
    ),
    shell = new SwWrtShell(ds),
    other = new SwWrtShell(ds);
  node.SetAttr(new SvxAdjustItem(A.Right, RES_PARATR_ADJUST));
  const table = shell.InsertTable(options, 1, 1, "Initial"),
    cell = table?.GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0];
  assert(table && cell);
  expect((cell.GetAttr(RES_PARATR_ADJUST) as SvxAdjustItem).GetAdjust()).toBe(A.Right);
  const p = new SwPosition(cell),
    held = doc.CreateUnoCursor(p),
    uno = held.get();
  assert(uno);
  other.SetCursor(p);
  other.Push();
  p.Dispose();
  table.GetFrameFormat().SetFormatName("Changed");
  expect(shell.Undo()).toBe(true);
  expect(shell.GetCursor().GetPoint().GetNode()).toBe(node);
  expect(other.GetCursor().GetPoint().GetNode()).toBe(doc.GetNodes().GetEndOfPostIts());
  expect(other.GetStackCursor()?.GetPoint().GetNode()).toBe(doc.GetNodes().GetEndOfPostIts());
  expect(uno.GetPoint().GetNode()).toBe(doc.GetNodes().GetEndOfPostIts());
  expect(shell.Redo()).toBe(true);
  const restored = doc.GetTables()[0],
    restoredCell = restored?.GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0];
  assert(restored && restoredCell);
  expect(restored.GetName()).toBe("Changed");
  expect((restoredCell.GetAttr(RES_PARATR_ADJUST) as SvxAdjustItem).GetAdjust()).toBe(
    doc.GetTextFormatColl("table-contents").GetAttrSet().GetAdjust().GetAdjust(),
  );
  held.reset();
  other.Close();
  shell.Close();
  ds.Close();
});
