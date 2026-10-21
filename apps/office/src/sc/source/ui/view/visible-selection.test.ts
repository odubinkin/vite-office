/** @fileoverview Source visible-axis selection over real marks,segmented geometry and actual formatting/ODS consumers. */
import { assert, expect, it } from "vitest";
import { createCalcSession } from "../../../browser/composition/calc-module";
import { ScAddress, ScRange } from "../../../inc/address";
import { ATTR_FONT_WEIGHT } from "../../../inc/scitems";
import { ScMarkData } from "../../../inc/markdata";
import { ScInputMode } from "../../../inc/global";
import type { ScPatternAttr } from "../../../inc/patattr";
import { SvxWeightItem } from "../../../../editeng/source/items/textitem";
import { FontWeight } from "../../../../tools/inc/fontenum";
import { readOdsDocument, writeOdsDocument } from "../../filter/xml/xmlwrap";
/** Native selected region and current normal cursor. @returns Session. */
function session() {
  const s = createCalcSession();
  s.controller.Select(0, 0);
  s.controller.viewData.GetMarkData().SetMarkArea(new ScRange(0, 0, 0, 5, 5, 0));
  return s;
}
for (const rows of [true, false]) {
  const command = rows ? ".uno:SelectVisibleRows" : ".uno:SelectVisibleColumns";
  it(`subtracts original hidden runs from ${command} without changing cursor,sheets or document history`, /** Checks middle spans,disjoint marks and native slot identity. @returns Nothing. */ () => {
    const s = session(),
      c = s.controller,
      doc = c.shell.GetDocument(),
      marks = c.viewData.GetMarkData();
    try {
      if (rows) doc.SetRowHidden(2, 3, 0, true);
      else doc.SetColHidden(2, 3, 0, true);
      const before = [
        c.shell.GetContentGeneration(),
        c.shell.IsModified(),
        c.shell.GetUndoManager().GetUndoActionCount(),
      ];
      expect(s.frame.GetDispatcher().QueryDispatch(command)?.slot.slotId).toBe(
        rows ? 26678 : 26679,
      );
      s.frame.GetDispatcher().Execute(command);
      for (let col = 0; col <= 5; col++)
        for (let row = 0; row <= 5; row++)
          expect(marks.IsCellMarked(col, row)).toBe(
            (rows ? row : col) < 2 || (rows ? row : col) > 3,
          );
      expect(marks.IsMultiMarked()).toBe(true);
      expect(c.Address()).toBe("A1");
      expect([...marks]).toEqual([0]);
      expect([
        c.shell.GetContentGeneration(),
        c.shell.IsModified(),
        c.shell.GetUndoManager().GetUndoActionCount(),
      ]).toEqual(before);
      s.frame.GetDispatcher().Execute(command);
      expect(marks.IsCellMarked(0, 0)).toBe(true);
      expect(marks.IsCellMarked(2, 2)).toBe(false);
    } finally {
      s.Close();
    }
  });
  it(`retains source group-wide hidden subtraction for ${command} and resets a fully hidden mark`, /** Preserves common marks even when hiding differs by selected sheet. @returns Nothing. */ () => {
    const s = session(),
      c = s.controller,
      doc = c.shell.GetDocument(),
      marks = c.viewData.GetMarkData();
    try {
      c.InsertSheet();
      c.SelectTab(0);
      c.SelectAllTables();
      marks.SetMarkArea(new ScRange(0, 0, 0, 5, 5, 0));
      if (rows) {
        doc.SetRowHidden(1, 1, 0, true);
        doc.SetRowHidden(4, 4, 1, true);
      } else {
        doc.SetColHidden(1, 1, 0, true);
        doc.SetColHidden(4, 4, 1, true);
      }
      s.frame.GetDispatcher().Execute(command);
      for (let pos = 0; pos <= 5; pos++)
        expect(marks.IsCellMarked(rows ? 0 : pos, rows ? pos : 0)).toBe(pos !== 1 && pos !== 4);
      expect([...marks]).toEqual([0, 1]);
      if (rows) doc.SetRowHidden(0, 5, 0, true);
      else doc.SetColHidden(0, 5, 0, true);
      s.frame.GetDispatcher().Execute(command);
      expect(marks.IsMarked()).toBe(false);
      expect(marks.IsMultiMarked()).toBe(false);
      expect([...marks]).toEqual([0, 1]);
    } finally {
      s.Close();
    }
  });
  it(`keeps unmarked,visible,single-rectangle and hidden-tail source behavior for ${command}`, /** Uses retained native multi bounds without adding cursor marks or endpoint clipping. @returns Nothing. */ () => {
    const s = session(),
      c = s.controller,
      doc = c.shell.GetDocument(),
      marks = c.viewData.GetMarkData();
    try {
      s.frame.GetDispatcher().Execute(command);
      expect(marks.IsMarked()).toBe(true);
      expect(marks.IsMultiMarked()).toBe(false);
      marks.SetMarkArea(new ScRange(0, 0, 0, 2, 2, 0));
      if (rows) doc.SetRowHidden(1, 8, 0, true);
      else doc.SetColHidden(1, 8, 0, true);
      s.frame.GetDispatcher().Execute(command);
      expect(marks.GetMarkArea()).toEqual(
        rows ? new ScRange(0, 0, 0, 2, 0, 0) : new ScRange(0, 0, 0, 0, 2, 0),
      );
      expect(rows ? marks.GetMultiMarkArea().aEnd.Row() : marks.GetMultiMarkArea().aEnd.Col()).toBe(
        8,
      );
      const retained = new ScMarkData(marks);
      marks.ResetMark();
      c.Select(4, 7);
      s.frame.GetDispatcher().Execute(command);
      expect(marks.IsMarked()).toBe(false);
      expect(marks.IsMultiMarked()).toBe(false);
      expect(c.Address()).toBe("E8");
      marks.assign(retained);
      if (rows) doc.SetRowHidden(0, 0, 0, true);
      else doc.SetColHidden(0, 0, 0, true);
      s.frame.GetDispatcher().Execute(command);
      expect(marks.IsMarked()).toBe(false);
      expect(marks.IsMultiMarked()).toBe(false);
    } finally {
      s.Close();
    }
  });
  it(`reduces a leading hidden run to the original simple visible rectangle for ${command}`, /** Native MarkToSimple retains only the remaining contiguous run. @returns Nothing. */ () => {
    const s = session(),
      c = s.controller,
      doc = c.shell.GetDocument(),
      marks = c.viewData.GetMarkData();
    try {
      if (rows) doc.SetRowHidden(0, 1, 0, true);
      else doc.SetColHidden(0, 1, 0, true);
      s.frame.GetDispatcher().Execute(command);
      expect(marks.IsMarked()).toBe(true);
      expect(marks.IsMultiMarked()).toBe(false);
      expect(marks.GetMarkArea()).toEqual(
        rows ? new ScRange(0, 2, 0, 5, 5, 0) : new ScRange(2, 0, 0, 5, 5, 0),
      );
    } finally {
      s.Close();
    }
  });
  it(`admits pending input before ${command} and leaves failed drafts untouched`, /** Exercises actual controller admission rather than a mock dispatcher. @returns Nothing. */ () => {
    const s = session(),
      c = s.controller,
      d = s.frame.GetDispatcher(),
      marks = c.viewData.GetMarkData();
    try {
      const original = new ScMarkData(marks);
      c.StartInput(ScInputMode.SC_INPUT_TOP, "=SUM(A1)");
      expect(d.Execute(command)).toMatchObject({ status: "executed", value: false });
      expect(marks.GetMarkArea()).toEqual(original.GetMarkArea());
      c.Cancel();
      c.StartInput(ScInputMode.SC_INPUT_TOP, "42");
      expect(d.Execute(command)).toMatchObject({ status: "executed", value: true });
      expect(c.shell.GetDocument().GetValue(new ScAddress(0, 0, 0))).toBe(42);
    } finally {
      s.Close();
    }
  });
}
it("formats only actual visible selection runs and restores them through native undo and ODS", /** Uses genuine pattern history,typed font values and package roundtrip. @returns Completion. */ async () => {
  const s = session(),
    c = s.controller,
    doc = c.shell.GetDocument(),
    d = s.frame.GetDispatcher();
  const weight =
    /** Reads original Latin weight. @param owner - Actual document. @param row - Cell row. @returns Native weight. */
    (owner: typeof doc, row: number) =>
      (
        (owner.GetPattern(new ScAddress(0, row, 0)) as ScPatternAttr).GetItem(
          ATTR_FONT_WEIGHT,
        ) as SvxWeightItem
      ).GetWeight();
  try {
    doc.SetRowHidden(2, 3, 0, true);
    d.Execute(".uno:SelectVisibleRows");
    d.Execute(".uno:Bold");
    for (let row = 0; row <= 5; row++)
      expect(weight(doc, row)).toBe(
        row === 2 || row === 3 ? FontWeight.WEIGHT_NORMAL : FontWeight.WEIGHT_BOLD,
      );
    const marks = new ScMarkData(c.viewData.GetMarkData());
    c.Undo();
    expect(weight(doc, 0)).toBe(FontWeight.WEIGHT_NORMAL);
    c.Redo();
    expect(c.viewData.GetMarkData().IsCellMarked(0, 2)).toBe(false);
    expect(c.viewData.GetMarkData().GetMarkedRanges()).toEqual(marks.GetMarkedRanges());
    const loaded = await readOdsDocument(writeOdsDocument(doc));
    assert(loaded.FetchTable(0));
    for (let row = 0; row <= 5; row++)
      expect(weight(loaded, row)).toBe(
        row === 2 || row === 3 ? FontWeight.WEIGHT_NORMAL : FontWeight.WEIGHT_BOLD,
      );
    loaded.DisposeAttributes();
  } finally {
    s.Close();
  }
});

it("uses actual hidden flags for visible-row selection while filtered formatting uses its separate working marks", /** Preserves source separation between RowHidden and RowFiltered queries. @returns Nothing. */ () => {
  const s = session(),
    c = s.controller,
    doc = c.shell.GetDocument(),
    marks = c.viewData.GetMarkData(),
    d = s.frame.GetDispatcher();
  try {
    doc.SetRowFiltered(1, 1, 0, true);
    doc.SetRowHidden(2, 2, 0, true);
    d.Execute(".uno:SelectVisibleRows");
    expect(marks.IsCellMarked(0, 1)).toBe(true);
    expect(marks.IsCellMarked(0, 2)).toBe(false);
    d.Execute(".uno:Bold");
    expect(marks.IsCellMarked(0, 1)).toBe(true);
    expect(
      (
        (doc.GetPattern(new ScAddress(0, 1, 0)) as ScPatternAttr).GetItem(
          ATTR_FONT_WEIGHT,
        ) as SvxWeightItem
      ).GetWeight(),
    ).toBe(FontWeight.WEIGHT_NORMAL);
    expect(
      (
        (doc.GetPattern(new ScAddress(0, 0, 0)) as ScPatternAttr).GetItem(
          ATTR_FONT_WEIGHT,
        ) as SvxWeightItem
      ).GetWeight(),
    ).toBe(FontWeight.WEIGHT_BOLD);
    expect(doc.RowHidden(1, 0)).toBe(false);
    expect(doc.RowFiltered(1, 0)).toBe(true);
  } finally {
    s.Close();
  }
});
