/** @fileoverview Consumed ScFormatShell font/color/alignment operations through native script sets,merged selection patterns and attribute history;rich-edit,dialog and device layout services remain unported. */
import { SvxShadowedItem, SvxCharReliefItem } from "../../../../editeng/source/items/textitem";

import {
  SvxBoxItem,
  SvxBoxInfoItem,
  SvxBoxItemLine as Edge,
  SvxBoxInfoItemLine as Inner,
  SvxBoxInfoItemValidFlags as Valid,
} from "../../../../editeng/source/items/frmitems";
import { SvxLineItem } from "../../../../editeng/inc/lineitem";
import { SvxBorderLine, SvxBorderLineStyle } from "../../../../editeng/source/items/borderline";
import { SfxItemSet } from "../../../../svl/inc/itemset";
import type { SfxRequest } from "../../../../sfx2/source/control/request";
import type { SfxSlotState } from "../../../../sfx2/source/control/bindings";
import { SvxContourItem } from "../../../../editeng/inc/contouritem";
import { SvxCrossedOutItem } from "../../../../editeng/inc/crossedoutitem";
import { SvxHorJustifyItem, SvxVerJustifyItem } from "../../../../editeng/inc/justifyitem";
import { SvxCellHorJustify, SvxCellVerJustify } from "../../../../editeng/inc/svxenum";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { SvxBrushItem } from "../../../../editeng/inc/brushitem";
import { COL_TRANSPARENT, COL_AUTO, COL_BLACK } from "../../../../tools/inc/color";
import { SvtScriptType } from "../../../../svl/inc/languageoptions";
import {
  SvxWeightItem,
  SvxPostureItem,
  SvxUnderlineItem,
  SvxOverlineItem,
} from "../../../../editeng/source/items/textitem";
import { FontWeight, FontItalic, FontLineStyle } from "../../../../tools/inc/fontenum";
import { createAttributeToggleItem } from "../../../../sfx2/source/control/bindings";
import { GetSelectionPattern, ScViewFunc } from "./viewfunc";
import { AdjustBlockHeight } from "./viewfun2";
import { ScPatternAttr } from "../../../inc/patattr";
import { ATTR_FONT_HEIGHT } from "../../../inc/scitems";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { SvxScriptSetItem } from "../../../../editeng/inc/scriptsetitem";
import { SfxItemState } from "../../../../svl/inc/itemset";
import { ScRange } from "../../../inc/address";
import type { ScViewData } from "../inc/viewdata";
import type { ScDocShell } from "../docshell/docsh";
/** Native cell-alignment axes. */
export type CalcAlignmentAxis = "horizontal" | "vertical";
/** Consumed source character slots; browser code carries no attribute values. */
export type CalcCharacterFormat = "bold" | "italic" | "underline";
/** Consumed original color slots and cell item identities. */
export type CalcColorKind = "font" | "background";
/** Original slot identities from editids.hrc and svxids.hrc. */
export const calcColorSlots = { font: 10017, background: 10186 } as const;
/** Source format owner for the consumed simple-selection font-height command. */
export class ScFormatShell {
  /** Original GetAttrState copies actual selected diagonal items and INVALID state. @param which - Native diagonal attribute. @returns Native binding. */
  GetDiagonalState(which: 141 | 142): SfxSlotState {
    const set = this.SelectionPattern().GetItemSet();
    return set.GetItemState(which) === SfxItemState.INVALID
      ? { enabled: true, mixed: true }
      : { enabled: true, value: (set.Get(which) as SvxLineItem).Clone() };
  }
  /** Original shared line-style/color GetState reads actual frame geometry;different colors also make style mixed. @param color - Color slot versus style slot. @returns Native binding state. */
  GetFrameLineState(color: boolean): SfxSlotState {
    const [box, info] = (
      this.viewData.GetViewShell() ?? new ScViewFunc(this.viewData, this.shell)
    ).GetSelectionFrame();
    const line = new SvxBorderLine(),
      lines = [
        box.GetTop(),
        box.GetBottom(),
        box.GetLeft(),
        box.GetRight(),
        info.GetVert(),
        info.GetHori(),
      ];
    let found = false,
      colorMixed = false,
      styleMixed = false;
    for (const value of lines) {
      if (!value) continue;
      if (!found) {
        found = true;
        line.SetColor(value.GetColor());
        line.SetWidth(value.GetWidth());
        line.SetBorderLineStyle(value.GetBorderLineStyle());
      } else {
        if (!line.GetColor().equals(value.GetColor())) colorMixed = true;
        if (!line.equals(value)) styleMixed = true;
      }
    }
    if (
      [Valid.VERT, Valid.HORI, Valid.LEFT, Valid.RIGHT, Valid.TOP, Valid.BOTTOM].some(
        /** Reads original frame validity. @param flag - Native side. @returns Mixed edge. */ (
          flag,
        ) => !info.IsValid(flag),
      )
    ) {
      colorMixed = true;
      styleMixed = true;
    }
    if (color)
      return {
        enabled: true,
        value: new SvxColorItem(
          colorMixed ? COL_TRANSPARENT : found ? line.GetColor() : COL_AUTO,
          10202,
        ),
        mixed: colorMixed,
      };
    if (styleMixed) line.SetWidth(1);
    const item = new SvxLineItem(10201);
    item.SetLine(line);
    return { enabled: styleMixed || line.GetWidth() !== 0, value: item, mixed: styleMixed };
  }
  /** Original border/style/color and diagonal ExecuteAttr cases consume real typed request items. @param request - Native request after browser boundary conversion. @returns Whether a represented command was handled. */
  ExecuteBorder(request: SfxRequest): boolean {
    const handled = this.ExecuteBorderItems(request);
    if (handled && !request.IsAPI() && !request.IsDone()) request.Done();
    return handled;
  }
  /** Original argument-present ExecuteAttr branches;line-style explicitly completes even API requests. @param request - Genuine typed native arguments. @returns Handled. */
  private ExecuteBorderItems(request: SfxRequest): boolean {
    const view = this.viewData.GetViewShell();
    if (!view) return false;
    const doc = this.shell.GetDocument(),
      args = request.GetArgs(),
      slot = request.GetSlot();
    if (args.length === 0) return false;
    if (slot === 10201) {
      const item = args.find(
        /** Finds original line-style request. @param value - Native item. @returns Match. */ (
          value,
        ) => value.Which() === 10201,
      ) as SvxLineItem | undefined;
      let line = item?.GetLine()?.Clone();
      if (line) {
        const widths = [
          args.find(
            /** Finds FN_PARAM_1. @param value - Request item. @returns Match. */ (value) =>
              value.Which() === 21160,
          ),
          args.find(
            /** Finds FN_PARAM_2. @param value - Request item. @returns Match. */ (value) =>
              value.Which() === 21161,
          ),
          args.find(
            /** Finds FN_PARAM_3. @param value - Request item. @returns Match. */ (value) =>
              value.Which() === 21162,
          ),
        ];
        if (
          widths.every(
            /** Tests original three-width presence. @param value - Item. @returns Present. */ (
              value,
            ) => value !== undefined,
          )
        ) {
          const value = new SvxBorderLine();
          value.GuessLinesWidths(
            line.GetBorderLineStyle(),
            ...(widths.map(
              /** Borrows original UInt16 width item. @param value - Native width item. @returns Width. */ (
                value,
              ) =>
                (value as import("../../../../svl/source/items/intitem").SfxUInt16Item).GetValue(),
            ) as [number, number, number]),
          );
          line = value;
        }
        const current = view.GetDefaultFrameLine();
        if (current) {
          current.SetBorderLineStyle(line.GetBorderLineStyle());
          current.SetWidth(line.GetWidth());
          view.SetSelectionFrameLines(current, false);
        } else {
          view.SetDefaultFrameLine(line);
          view.GetDefaultFrameLine()?.SetColor(COL_BLACK);
          view.SetSelectionFrameLines(line, false);
        }
      } else {
        view.SetDefaultFrameLine(new SvxBorderLine(COL_BLACK, 20, SvxBorderLineStyle.SOLID));
        view.SetSelectionFrameLines(undefined, false);
      }
      request.Done();
      return true;
    }
    if (slot === 10202) {
      const color = (
          args.find(
            /** Finds actual border color. @param value - Item. @returns Match. */ (value) =>
              value.Which() === 10202,
          ) as SvxColorItem
        ).GetValue(),
        current = view.GetDefaultFrameLine();
      if (current) {
        current.SetColor(color);
        view.SetSelectionFrameLines(current, true);
      } else {
        const line = new SvxBorderLine(color, 20, SvxBorderLineStyle.SOLID);
        view.SetDefaultFrameLine(line);
        view.SetSelectionFrameLines(line, false);
      }
      return true;
    }
    if (slot === 10188 || slot === 10024) {
      const oldSet = new SfxItemSet(doc.GetPool(), [[100, 155]]),
        next = new SfxItemSet(doc.GetPool(), [[100, 155]]),
        current = view.GetDefaultFrameLine();
      try {
        const outer = args.find(
            /** Finds actual mapped outer border. @param value - Item. @returns Match. */ (value) =>
              value.Which() === 150,
          ) as SvxBoxItem | undefined,
          inner = args.find(
            /** Finds actual mapped inner border. @param value - Item. @returns Match. */ (value) =>
              value.Which() === 151,
          ) as SvxBoxInfoItem | undefined;
        if (outer) {
          const box = outer.Clone();
          for (const edge of [Edge.TOP, Edge.BOTTOM, Edge.LEFT, Edge.RIGHT]) {
            const line = box.GetLine(edge);
            if (line && line.GetOutWidth() === 0) box.SetLine(current, edge);
          }
          next.Put(box);
          request.AppendItem(box);
        }
        if (inner) {
          const info = inner.Clone();
          for (const edge of [Inner.HORI, Inner.VERT]) {
            const line = info.GetLine(edge);
            if (line && line.GetOutWidth() === 0) info.SetLine(current, edge);
          }
          next.Put(info);
          request.AppendItem(info);
        } else next.Put(new SvxBoxInfoItem(151));
        oldSet.Put(this.SelectionPattern().GetItemSet().Get(150));
        view.ApplyAttributes(next, oldSet);
        return true;
      } finally {
        next.ClearItem();
        oldSet.ClearItem();
      }
    }
    if (slot === 11013 || slot === 11014) {
      const which = slot === 11013 ? 141 : 142,
        item = args.find(
          /** Finds actual mapped diagonal border. @param value - Item. @returns Match. */ (
            value,
          ) => value.Which() === which,
        ) as SvxLineItem | undefined;
      if (!item) return false;
      const oldSet = new SfxItemSet(this.SelectionPattern().GetItemSet()),
        next = new SfxItemSet(oldSet);
      try {
        const value = new SvxLineItem(which);
        value.SetLine(item.GetLine());
        next.Put(value);
        request.AppendItem(value);
        view.ApplyAttributes(next, oldSet);
        return true;
      } finally {
        next.ClearItem();
        oldSet.ClearItem();
      }
    }
    return false;
  }
  /** Reads original uniform selected alignment;INVALID is represented by undefined. @param axis - Native axis. @returns Actual enum or mixed state. */
  GetAlignment(axis: CalcAlignmentAxis): SvxCellHorJustify | SvxCellVerJustify | undefined {
    return (
      this.SelectionItem(axis === "horizontal" ? 129 : 132) as
        SvxHorJustifyItem | SvxVerJustifyItem | undefined
    )?.GetValue();
  }
  /** Applies original ExecuteAlignment;toolbar ExecuteTextAttr toggles an equal value to Standard. @param axis - Native axis. @param value - Original enum. @param toggle - Toolbar radio-toggle path. @returns Changed. */
  SetAlignment(
    axis: CalcAlignmentAxis,
    value: SvxCellHorJustify | SvxCellVerJustify,
    toggle: boolean,
  ): boolean {
    const selected = toggle && this.GetAlignment(axis) === value ? 0 : value;
    const delta = new ScPatternAttr(this.shell.GetDocument().getCellAttributeHelper());
    delta.ItemSetPut(
      axis === "horizontal"
        ? new SvxHorJustifyItem(selected as SvxCellHorJustify, 129)
        : new SvxVerJustifyItem(selected as SvxCellVerJustify, 132),
    );
    return this.ApplySelectionPattern(delta);
  }

  /** Gets actual uniform font-color or source background-color state. @param kind - Source slot kind. @returns Native state or mixed. */
  GetColor(kind: CalcColorKind): SvxColorItem | undefined {
    const item = this.SelectionItem(kind === "font" ? 109 : 148);
    if (item === undefined) return undefined;
    if (kind === "font") return (item as SvxColorItem).Clone();
    return new SvxColorItem((item as SvxBrushItem).GetColor(), calcColorSlots.background);
  }
  /** Applies the source argument or recent-color branch,retaining unrelated brush metadata. @param kind - Source slot kind. @param color - Optional original toolbox item. @returns Changed. */
  SetColor(kind: CalcColorKind, color?: SvxColorItem): boolean {
    const which = kind === "font" ? 109 : 148,
      doc = this.shell.GetDocument(),
      old = this.SelectionItem(which) ?? doc.GetPool().GetUserOrPoolDefaultItem(which),
      item = (old as SvxColorItem | SvxBrushItem).Clone();
    if (color === undefined) {
      const recent = this.shell.GetRecentColor(calcColorSlots[kind]);
      try {
        const value = recent?.getComplexColor().getFinalColor() ?? COL_TRANSPARENT;
        if (kind === "font") (item as SvxColorItem).setColor(value);
        else (item as SvxBrushItem).SetColor(value);
      } finally {
        recent?.Dispose();
      }
    } else if (kind === "font") {
      const replacement = color.Clone();
      replacement.SetWhich(109);
      const delta = new ScPatternAttr(doc.getCellAttributeHelper());
      delta.ItemSetPut(replacement);
      return this.ApplySelectionPattern(delta, false);
    } else {
      (item as SvxBrushItem).SetColor(color.GetValue());
      (item as SvxBrushItem).setComplexColor(color.getComplexColor());
    }
    const delta = new ScPatternAttr(doc.getCellAttributeHelper());
    delta.ItemSetPut(item);
    return this.ApplySelectionPattern(delta, false);
  }
  /** Reads the original script-set value from the native merged selection pattern. @param script - Source flags. @returns Uniform family or mixed. */
  GetFontFamily(script: SvtScriptType): string | undefined {
    return (
      SvxScriptSetItem.GetItemOfScript(10007, this.SelectionPattern().GetItemSet(), script) as
        SvxFontItem | undefined
    )?.GetFamilyName();
  }
  /** Copies the complete toolbox item through the original shared script-set owner. @param font - Source item. @param script - Selection flags. @returns Changed. */
  SetFontFamily(font: SvxFontItem, script: SvtScriptType): boolean {
    const set = new SvxScriptSetItem(10007, this.shell.GetDocument().GetPool());
    set.PutItemForScriptType(script, font);
    const delta = new ScPatternAttr(this.shell.GetDocument().getCellAttributeHelper());
    delta.GetItemSetWritable().PutSet(set.GetItemSet(), false);
    return this.ApplySelectionPattern(delta);
  }
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
      range = marks.IsMultiMarked()
        ? new ScRange(marks.GetMultiMarkArea())
        : marks.IsMarked()
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
  /** Queries native uniform height for the actual selected scripts;explicit font-size execution still writes all three. @param script - Actual selected script flags. @returns Uniform points or undefined for mixed selection. */
  GetFontSize(script: SvtScriptType): number | undefined {
    const item = SvxScriptSetItem.GetItemOfScript(
      10015,
      this.SelectionPattern().GetItemSet(),
      script,
    ) as SvxFontHeightItem | undefined;
    return item === undefined ? undefined : item.GetHeight() / 20;
  }
  /** Queries original view selection-pattern ownership, including whole-sheet data-area clipping. @returns Native borrowed pattern. */
  private SelectionPattern(): ScPatternAttr {
    return GetSelectionPattern(this.viewData);
  }
  /** Native SID_GROW_FONT_SIZE/SID_SHRINK_FONT_SIZE body retains unsigned growth and signed shrink conversion before source limits. @param grow - Original grow slot selection. @param script - Actual selection-script mask. @returns Whether document changed. */
  ChangeFontSize(grow: boolean, script: SvtScriptType): boolean {
    const set = new SvxScriptSetItem(10015, this.shell.GetDocument().GetPool());
    set.GetItemSet().PutSet(this.SelectionPattern().GetItemSet(), false);
    const current = set.GetItemOfScript(script) as SvxFontHeightItem | undefined;
    if (current === undefined) return false;
    const size = current.Clone();
    size.SetHeight(
      grow
        ? Math.min((size.GetHeight() + 40) >>> 0, 19998)
        : Math.max((size.GetHeight() - 40) | 0, 40),
    );
    set.PutItemForScriptType(script, size);
    const delta = new ScPatternAttr(this.shell.GetDocument().getCellAttributeHelper());
    delta.GetItemSetWritable().PutSet(set.GetItemSet(), false);
    return this.ApplySelectionPattern(delta);
  }
  /** Preserves the existing browser point boundary while delegating to the complete native item. @param points - Browser point height. @returns Changed. */
  SetFontSize(points: number): boolean {
    ScFormatShell.ValidateFontSize(points);
    return this.SetFontHeight(new SvxFontHeightItem(points * 20, 100, ATTR_FONT_HEIGHT));
  }
  /** Native explicit FontHeight applies all three scripts and preserves the complete height/property/unit payload. @param height - Complete source item. @returns Changed. */
  SetFontHeight(height: SvxFontHeightItem): boolean {
    const set = new SvxScriptSetItem(10015, this.shell.GetDocument().GetPool());
    set.PutItemForScriptType(
      SvtScriptType.LATIN | SvtScriptType.ASIAN | SvtScriptType.COMPLEX,
      height,
    );
    const delta = new ScPatternAttr(this.shell.GetDocument().getCellAttributeHelper());
    delta.GetItemSetWritable().PutSet(set.GetItemSet(), false);
    return this.ApplySelectionPattern(delta);
  }
  /** Reads one native merged item state without flattening marked spans to a rectangle. @param which - Actual Which identity. @returns Borrowed value or mixed. */
  private SelectionItem(which: number): SfxPoolItem | undefined {
    const set = this.SelectionPattern().GetItemSet(),
      state = set.GetItemState(which, false);
    return state === SfxItemState.SET || state === SfxItemState.DEFAULT
      ? set.Get(which)
      : undefined;
  }
  /** Reads source Latin attribute state used by the current plain-cell toolbar; script-aware rich input remains unported. @param format - Character slot. @returns Boolean state or mixed. */
  GetCharacterState(format: CalcCharacterFormat): boolean | undefined {
    const item = this.SelectionItem(format === "bold" ? 102 : format === "italic" ? 103 : 104);
    if (!item) return undefined;
    if (format === "bold") return (item as SvxWeightItem).GetBoolValue();
    if (format === "italic")
      return (item as SvxPostureItem).GetPosture() !== FontItalic.ITALIC_NONE;
    return (item as SvxUnderlineItem).GetLineStyle() !== FontLineStyle.LINESTYLE_NONE;
  }
  /** Reads the source overline bool projection from the native selected item. @returns Active state or mixed. */
  GetOverlineState(): boolean | undefined {
    return (this.SelectionItem(105) as SvxOverlineItem | undefined)?.GetBoolValue();
  }
  /** Applies the original complete overline item or bound toggle. @param value - Native optional request. @returns Whether changed. */
  SetOverline(value?: SvxOverlineItem): boolean {
    return this.ApplyToggleAttr(105, SvxOverlineItem.CreateDefault, value);
  }
  /** Reads the original strikeout boolean interface from merged native selection state. @returns Active or mixed. */
  GetStrikeoutState(): boolean | undefined {
    return (this.SelectionItem(106) as SvxCrossedOutItem | undefined)?.GetBoolValue();
  }
  /** Applies original Strikeout ExecuteAttr with the shared bound-toggle preparation. @param value - Native complete request. @returns Whether changed. */
  SetStrikeout(value?: SvxCrossedOutItem): boolean {
    return this.ApplyToggleAttr(106, SvxCrossedOutItem.CreateDefault, value);
  }
  /** Reads the actual native contour boolean or mixed selection state. @returns Outline state. */
  GetOutlineState(): boolean | undefined {
    return (this.SelectionItem(107) as SvxContourItem | undefined)?.GetValue();
  }
  /** Applies original contour ExecuteAttr through shared native bound-toggle preparation. @param value - Optional complete native request. @returns Whether changed. */
  SetOutlineFont(value?: SvxContourItem): boolean {
    return this.ApplyToggleAttr(107, SvxContourItem.CreateDefault, value);
  }
  /** Original merged shadow bool/default state. @returns Shadow or mixed. */
  GetShadowState(): boolean | undefined {
    return (this.SelectionItem(108) as SvxShadowedItem | undefined)?.GetValue();
  }
  /** Original complete shadow item or generic bound toggle. @param value - Optional request. @returns Admitted success. */
  SetShadowed(value?: SvxShadowedItem): boolean {
    return this.ApplyToggleAttr(108, SvxShadowedItem.CreateDefault, value);
  }
  /** Original relief item state retains all enum values. @returns Relief or mixed. */
  GetReliefState(): number | undefined {
    return (this.SelectionItem(124) as SvxCharReliefItem | undefined)?.GetValue();
  }
  /** Original parameterized relief ExecuteAttr case. @param value - Complete native item. @returns Admitted success. */
  SetCharacterRelief(value: SvxCharReliefItem): boolean {
    const delta = new ScPatternAttr(this.shell.GetDocument().getCellAttributeHelper()),
      copy = value.Clone();
    copy.SetWhich(124);
    delta.ItemSetPut(copy);
    return this.ApplySelectionPattern(delta);
  }
  /** Shared consumed ExecuteAttr cases receive a concrete native toggleable item. @param which - Known mapped attribute. @param factory - Concrete native factory. @param value - Optional complete request. @returns Whether changed. */
  private ApplyToggleAttr(which: number, factory: () => SfxPoolItem, value?: SfxPoolItem): boolean {
    const item =
      value ??
      (createAttributeToggleItem(
        this.SelectionPattern().GetItemSet(),
        which,
        factory,
      ) as SfxPoolItem);
    const delta = new ScPatternAttr(this.shell.GetDocument().getCellAttributeHelper()),
      copy = item.Clone() as SfxPoolItem;
    copy.SetWhich(which);
    delta.ItemSetPut(copy);
    return this.ApplySelectionPattern(delta);
  }
  /** Reads the native underline item across the current selection. @returns Exact style or mixed. */
  GetUnderlineStyle(): FontLineStyle | undefined {
    return (this.SelectionItem(104) as SvxUnderlineItem | undefined)?.GetLineStyle();
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
    if (format === "bold" || format === "italic") {
      const slot = format === "bold" ? 10009 : 10008,
        scripts = SvtScriptType.LATIN | SvtScriptType.ASIAN | SvtScriptType.COMPLEX,
        old = SvxScriptSetItem.GetItemOfScript(slot, this.SelectionPattern().GetItemSet(), scripts),
        set = new SvxScriptSetItem(slot, doc.GetPool());
      if (format === "bold") {
        const value =
          enabled ?? !(old && (old as SvxWeightItem).GetWeight() === FontWeight.WEIGHT_BOLD);
        set.PutItemForScriptType(
          scripts,
          new SvxWeightItem(value ? FontWeight.WEIGHT_BOLD : FontWeight.WEIGHT_NORMAL, 102),
        );
      } else {
        const value =
          enabled ?? !(old && (old as SvxPostureItem).GetPosture() === FontItalic.ITALIC_NORMAL);
        set.PutItemForScriptType(
          scripts,
          new SvxPostureItem(value ? FontItalic.ITALIC_NORMAL : FontItalic.ITALIC_NONE, 103),
        );
      }
      delta.GetItemSetWritable().PutSet(set.GetItemSet(), false);
    } else {
      const item = new SvxUnderlineItem(
        (this.SelectionItem(104) ??
          doc.GetPool().GetUserOrPoolDefaultItem(104)) as SvxUnderlineItem,
      );
      const value = enabled ?? item.GetLineStyle() === FontLineStyle.LINESTYLE_NONE;
      item.SetLineStyle(value ? FontLineStyle.LINESTYLE_SINGLE : FontLineStyle.LINESTYLE_NONE);
      delta.ItemSetPut(item);
    }
    return this.ApplySelectionPattern(delta);
  }
  /** Delegates owned format deltas to the original view owner,then performs the caller's height adjustment. @param delta - Owned native pattern. @param adjustBlockHeight - Original ApplyAttr flag. @returns Native operation result. */
  private ApplySelectionPattern(delta: ScPatternAttr, adjustBlockHeight = true): boolean {
    try {
      const result = (
        this.viewData.GetViewShell() ?? new ScViewFunc(this.viewData, this.shell)
      ).ApplySelectionPattern(delta);
      if (adjustBlockHeight) {
        const range = this.AttributeRange();
        AdjustBlockHeight(
          this.shell.GetDocument(),
          this.viewData.GetMarkData(),
          range.aStart.Row(),
          range.aEnd.Row(),
        );
      }
      return result;
    } finally {
      delta.Dispose();
    }
  }
}
