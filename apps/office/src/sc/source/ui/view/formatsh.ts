/** @fileoverview ScFormatShell consumed font-height state/application over original document patterns, simple marks and attribute undo. Full native format slots,script selection,dialogs and device-dependent row layout remain unported. */
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import {
  SvxWeightItem,
  SvxPostureItem,
  SvxUnderlineItem,
} from "../../../../editeng/source/items/textitem";
import { FontWeight, FontItalic, FontLineStyle } from "../../../../tools/inc/fontenum";
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
/** Consumed source character slots; browser code carries no attribute values. */
export type CalcCharacterFormat = "bold" | "italic" | "underline";
/** Native three-script Which identities for weight/posture and source shared underline. */
const formatIds = { bold: [102, 113, 118], italic: [103, 114, 119], underline: [104] } as const;
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
    const item = this.SelectionItem([ATTR_FONT_HEIGHT]) as SvxFontHeightItem | undefined;
    return item === undefined ? undefined : item.GetHeight() / 20;
  }
  /** Applies the source SID_ATTR_CHAR_FONTHEIGHT three-script delta through actual cell attributes and shared history. @param points - Positive point height representable in native twips. @returns Whether accepted and changed. */
  SetFontSize(points: number): boolean {
    ScFormatShell.ValidateFontSize(points);
    const delta = new ScPatternAttr(this.shell.GetDocument().getCellAttributeHelper());
    for (const which of [ATTR_FONT_HEIGHT, ATTR_CJK_FONT_HEIGHT, ATTR_CTL_FONT_HEIGHT])
      delta.ItemSetPut(new SvxFontHeightItem(points * 20, 100, which));
    return this.ApplySelectionPattern(delta);
  }
  /** Reads actual effective item equality across selected pattern runs and requested scripts. @param ids - Native Which identities. @returns Uniform borrowed item or mixed state. */
  private SelectionItem(ids: readonly number[]): SfxPoolItem | undefined {
    const doc = this.shell.GetDocument(),
      range = this.AttributeRange(),
      first: [number] = [0],
      last: [number] = [0];
    let selected: SfxPoolItem | undefined;
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
          for (const which of ids) {
            const item = pattern.GetItem(which);
            if (selected && !selected.equals(item)) return undefined;
            selected = item;
          }
          row = last[0] + 1;
        }
    }
    return selected;
  }
  /** Reads source Latin attribute state used by the current plain-cell toolbar; script-aware rich input remains unported. @param format - Character slot. @returns Boolean state or mixed. */
  GetCharacterState(format: CalcCharacterFormat): boolean | undefined {
    const item = this.SelectionItem([formatIds[format][0]]);
    if (!item) return undefined;
    if (format === "bold") return (item as SvxWeightItem).GetBoolValue();
    if (format === "italic")
      return (item as SvxPostureItem).GetPosture() !== FontItalic.ITALIC_NONE;
    return (item as SvxUnderlineItem).GetLineStyle() !== FontLineStyle.LINESTYLE_NONE;
  }
  /** Reads the native underline item across the current selection. @returns Exact style or mixed. */
  GetUnderlineStyle(): FontLineStyle | undefined {
    return (this.SelectionItem([104]) as SvxUnderlineItem | undefined)?.GetLineStyle();
  }
  /** Executes SID_ULINE_VAL_SINGLE/DOUBLE using a fresh native item as upstream does. @param style - Requested line. @returns Whether changed. */
  SetUnderlineStyle(
    style: FontLineStyle.LINESTYLE_SINGLE | FontLineStyle.LINESTYLE_DOUBLE,
  ): boolean {
    const delta = new ScPatternAttr(this.shell.GetDocument().getCellAttributeHelper());
    delta.ItemSetPut(
      new SvxUnderlineItem(
        (this.GetUnderlineStyle() ??
          (
            this.shell.GetDocument().GetPool().GetUserOrPoolDefaultItem(104) as SvxUnderlineItem
          ).GetLineStyle()) === style
          ? FontLineStyle.LINESTYLE_NONE
          : style,
        104,
      ),
    );
    return this.ApplySelectionPattern(delta);
  }
  /** Executes source whole-cell toggles; weight/posture compare all scripts,underline copies its actual color. @param format - Native character operation. @param enabled - Explicit boolean or native no-argument toggle. @returns Whether changed. */
  SetCharacterFormat(format: CalcCharacterFormat, enabled?: boolean): boolean {
    const doc = this.shell.GetDocument(),
      delta = new ScPatternAttr(doc.getCellAttributeHelper());
    const ids = formatIds[format],
      old = this.SelectionItem(ids);
    if (format === "bold") {
      const value =
        enabled ?? !(old && (old as SvxWeightItem).GetWeight() === FontWeight.WEIGHT_BOLD);
      for (const which of ids)
        delta.ItemSetPut(
          new SvxWeightItem(value ? FontWeight.WEIGHT_BOLD : FontWeight.WEIGHT_NORMAL, which),
        );
    } else if (format === "italic") {
      const value =
        enabled ?? !(old && (old as SvxPostureItem).GetPosture() === FontItalic.ITALIC_NORMAL);
      for (const which of ids)
        delta.ItemSetPut(
          new SvxPostureItem(value ? FontItalic.ITALIC_NORMAL : FontItalic.ITALIC_NONE, which),
        );
    } else {
      const item = new SvxUnderlineItem(
        (old ?? doc.GetPool().GetUserOrPoolDefaultItem(104)) as SvxUnderlineItem,
      );
      const value = enabled ?? item.GetLineStyle() === FontLineStyle.LINESTYLE_NONE;
      item.SetLineStyle(value ? FontLineStyle.LINESTYLE_SINGLE : FontLineStyle.LINESTYLE_NONE);
      delta.ItemSetPut(item);
    }
    return this.ApplySelectionPattern(delta);
  }
  /** Shared native ApplySelectionPattern responsibility with original attribute snapshot/history ownership. @param delta - Owned native pattern. @returns Whether changed. */
  private ApplySelectionPattern(delta: ScPatternAttr): boolean {
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
