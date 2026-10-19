/** @fileoverview ScFormatShell consumed font-height state/application over original document patterns, simple marks and attribute undo. Full native format slots,script selection,dialogs and device-dependent row layout remain unported. */
import { AdjustBlockHeight } from "./viewfun2";
import type { ScTable } from "../../../inc/table";
import { ScDocument } from "../../../inc/document";
import { ScPatternAttr } from "../../../inc/patattr";
import { ATTR_FONT_HEIGHT, ATTR_CJK_FONT_HEIGHT, ATTR_CTL_FONT_HEIGHT } from "../../../inc/scitems";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { ScUndoSelectionAttr } from "../undo/undoblk3";
import { InsertDeleteFlags } from "../../../inc/global";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { ScRange } from "../../../inc/address";
import type { ScViewData } from "../inc/viewdata";
import type { ScDocShell } from "../docshell/docsh";
/** Source format owner for the consumed simple-selection font-height command. */
export class ScFormatShell {
  /** Borrows actual current semantic view/document owners. @param viewData - View. @param shell - Shell. @returns Format owner. */
  constructor(
    private readonly viewData: ScViewData,
    private readonly shell: ScDocShell,
  ) {}
  /** Validates the shared browser point-size boundary before input or document mutation. @param points - Positive point height. @returns Nothing. */
  static ValidateFontSize(points: number): void {
    const twips = points * 20;
    if (!Number.isFinite(points) || points <= 0 || !Number.isInteger(twips) || twips > 0xffffffff)
      throw new TypeError("Calc font size must be positive and representable in twips");
  }
  /** Gets the actual simple selection or cursor rectangle over all selected sheets. @returns Independent rectangle. */
  private AttributeRange(): ScRange {
    const marks = this.viewData.GetMarkData(),
      range = marks.IsMarked()
        ? new ScRange(marks.GetMarkArea())
        : new ScRange(
            this.viewData.GetCurX(),
            this.viewData.GetCurY(),
            this.viewData.GetTabNumber(),
            this.viewData.GetCurX(),
            this.viewData.GetCurY(),
            this.viewData.GetTabNumber(),
          );
    return range;
  }
  /** Queries effective Latin height across real selected pattern runs without allocating cells. Source font-size execution writes all three scripts. @returns Uniform points or undefined for mixed selection. */
  GetFontSize(): number | undefined {
    const doc = this.shell.GetDocument(),
      range = this.AttributeRange(),
      first: [number] = [0],
      last: [number] = [0];
    let height: number | undefined;
    for (const tab of this.viewData.GetMarkData().GetSelectedTabs()) {
      const table = doc.FetchTable(tab) as ScTable;
      const end = Math.min(
        range.aEnd.Col(),
        Math.max(range.aStart.Col(), table.GetAllocatedColumnsCount()),
      );
      for (let col = range.aStart.Col(); col <= end; col++)
        for (let row = range.aStart.Row(); row <= range.aEnd.Row();) {
          const pattern = table
            .GetColumnData(col)
            .GetPatternRange(first, last, row) as ScPatternAttr;
          const value = (pattern.GetItem(ATTR_FONT_HEIGHT) as SvxFontHeightItem).GetHeight() / 20;
          if (height !== undefined && height !== value) return undefined;
          height = value;
          row = last[0] + 1;
        }
    }
    return height;
  }
  /** Applies the source SID_ATTR_CHAR_FONTHEIGHT three-script delta through actual cell attributes and shared history. @param points - Positive point height representable in native twips. @returns Whether accepted and changed. */
  SetFontSize(points: number): boolean {
    ScFormatShell.ValidateFontSize(points);
    const twips = points * 20;
    const doc = this.shell.GetDocument(),
      marks = this.viewData.GetMarkData(),
      range = this.AttributeRange(),
      undo = new ScDocument(),
      name = new OUString();
    for (let tab = 0; tab < doc.GetTableCount(); tab++) {
      doc.GetName(tab, name);
      undo.InsertTab(tab, name);
    }
    name.dispose();
    const copyRange = new ScRange(range);
    copyRange.aStart.SetTab(0);
    copyRange.aEnd.SetTab(doc.GetTableCount() - 1);
    doc.CopyToDocument(copyRange, InsertDeleteFlags.ATTRIB, false, undo, marks);
    const delta = new ScPatternAttr(doc.getCellAttributeHelper());
    for (const which of [ATTR_FONT_HEIGHT, ATTR_CJK_FONT_HEIGHT, ATTR_CTL_FONT_HEIGHT])
      delta.ItemSetPut(new SvxFontHeightItem(twips, 100, which));
    let changed = false;
    for (const tab of marks.GetSelectedTabs())
      changed =
        doc.ApplyPatternAreaTab(
          range.aStart.Col(),
          range.aStart.Row(),
          range.aEnd.Col(),
          range.aEnd.Row(),
          tab,
          delta,
        ) || changed;
    if (changed) {
      AdjustBlockHeight(doc, marks, range.aStart.Row(), range.aEnd.Row());
      this.shell
        .GetUndoManager()
        .AddUndoAction(new ScUndoSelectionAttr(this.shell, marks, range, undo, delta));
      this.shell.SetDocumentModified();
    } else undo.DisposeAttributes();
    delta.Dispose();
    return changed;
  }
}
