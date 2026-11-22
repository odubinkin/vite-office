/** @fileoverview Native Calc style application and selection history over actual documents. */
import { expect, it } from "vitest";
import { ScDocShell } from "../docshell/docsh";
import { ScTabViewShell } from "./tabvwsh4";
import { ScAddress, ScRange } from "../../../inc/address";
import { ATTR_BACKGROUND, ATTR_FONT_WEIGHT } from "../../../inc/scitems";
import { ScTableProtection } from "../../core/data/tabprotection";
import { SvxBrushItem } from "../../../../editeng/inc/brushitem";
import { SvxWeightItem } from "../../../../editeng/inc/wghtitem";
import { FontWeight } from "../../../../tools/inc/fontenum";
import { Color } from "../../../../tools/inc/color";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";

it("applies a named style on the real cursor and restores selective hard formatting with Undo", /** Covers source SetStyleSheetToMarked and ScUndoSelectionStyle single-cell behavior. @returns Nothing. */ () => {
  const shell = new ScDocShell(),
    view = new ScTabViewShell(shell),
    doc = shell.GetDocument();
  const style = doc.GetStyleSheetPool()?.EnsureStandardCellStyle("Good");
  if (!style) throw new Error("Missing Calc style");
  const position = new ScAddress(0, 0);
  /** Reads the actual cell background. @returns Workbook color. */
  function color() {
    return (doc.GetPattern(position)?.GetItem(ATTR_BACKGROUND) as SvxBrushItem).GetColor();
  }
  /** Reads the actual cell font weight. @returns Native weight. */
  function weight() {
    return (doc.GetPattern(position)?.GetItem(ATTR_FONT_WEIGHT) as SvxWeightItem).GetWeight();
  }
  try {
    doc.ApplyAttr(0, 0, 0, new SvxBrushItem(new Color(0x770099), ATTR_BACKGROUND));
    doc.ApplyAttr(0, 0, 0, new SvxWeightItem(FontWeight.WEIGHT_BOLD, ATTR_FONT_WEIGHT));
    doc.SetValue(position, 10);
    expect(view.SetStyleSheetToMarked(style)).toBe(true);
    expect(doc.GetPattern(position)?.GetStyleSheet()).toBe(style);
    expect(color().IsRGBEqual(new Color(0xccffcc))).toBe(true);
    expect(weight()).toBe(FontWeight.WEIGHT_BOLD);
    expect(shell.GetUndoManager().GetUndoAction()?.GetComment()).toBe("Apply Cell Style");
    expect(shell.Undo()).toBe(true);
    expect(color().IsRGBEqual(new Color(0x770099))).toBe(true);
    expect(shell.Redo()).toBe(true);
    expect(color().IsRGBEqual(new Color(0xccffcc))).toBe(true);
    expect(doc.GetValue(position)).toBe(10);
  } finally {
    shell.Close();
  }
});

it("applies the style to selected sheets and leaves gaps, filtered rows, and protected cells alone", /** Covers marked runs, selected tabs, and source format editability. @returns Nothing. */ () => {
  const shell = new ScDocShell(),
    view = new ScTabViewShell(shell),
    doc = shell.GetDocument();
  const style = doc.GetStyleSheetPool()?.EnsureStandardCellStyle("Heading 1");
  if (!style) throw new Error("Missing Calc style");
  const marks = view.GetViewData().GetMarkData();
  /** Reads the attached style at a source coordinate. @param col - Column. @param row - Row. @param tab - Sheet. @returns Style name. */
  function name(col: number, row: number, tab: number) {
    const found = doc.GetPattern(new ScAddress(col, row, tab))?.GetStyleName();
    return found ? text(found) : null;
  }
  try {
    doc.InsertTab(1, unicode("Other"));
    marks.SelectTable(1, true);
    marks.SetMultiMarkArea(new ScRange(0, 0, 0, 0, 2, 0));
    marks.SetMultiMarkArea(new ScRange(2, 0, 0, 2, 2, 0));
    doc.SetRowFiltered(1, 1, 0, true);
    expect(view.SetStyleSheetToMarked(style)).toBe(true);
    for (const tab of [0, 1]) {
      expect(name(0, 0, tab)).toBe("Heading 1");
      expect(name(2, 2, tab)).toBe("Heading 1");
      expect(name(1, 0, tab)).not.toBe("Heading 1");
      expect(name(0, 1, tab)).not.toBe("Heading 1");
    }
    expect(shell.Undo()).toBe(true);
    expect(name(2, 2, 1)).not.toBe("Heading 1");
    expect(shell.Redo()).toBe(true);
    expect(name(2, 2, 1)).toBe("Heading 1");

    const protection = new ScTableProtection();
    protection.setProtected(true);
    doc.SetTabProtection(1, protection);
    const count = shell.GetUndoManager().GetUndoActionCount();
    expect(view.SetStyleSheetToMarked(style)).toBe(false);
    expect(shell.GetUndoManager().GetUndoActionCount()).toBe(count);
  } finally {
    shell.Close();
  }
});
