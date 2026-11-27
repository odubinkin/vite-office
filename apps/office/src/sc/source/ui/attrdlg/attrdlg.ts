/** @fileoverview Format Cells' original selection snapshot and typed output exchange. */
import { SvxBorderTabPage } from "../../../../cui/source/tabpages/border";
import { SvxBorderLineStyle as Style } from "../../../../editeng/source/items/borderline";
import {
  SvxBoxItemLine as Edge,
  SvxBoxInfoItemValidFlags as Valid,
} from "../../../../editeng/source/items/frmitems";
import { SvxNumberFormatShell } from "../../../../svx/source/items/numfmtsh";
import {
  ATTR_VALUE_FORMAT,
  ATTR_BORDER,
  ATTR_BORDER_INNER,
  ATTR_MARGIN,
  ATTR_HOR_JUSTIFY,
  ATTR_HOR_JUSTIFY_METHOD,
  ATTR_VER_JUSTIFY,
  ATTR_VER_JUSTIFY_METHOD,
  ATTR_INDENT,
  ATTR_ROTATE_VALUE,
  ATTR_ROTATE_MODE,
  ATTR_STACKED,
  ATTR_LINEBREAK,
  ATTR_HYPHENATE,
  ATTR_SHRINKTOFIT,
  ATTR_WRITINGDIR,
} from "../../../inc/scitems";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { CellType } from "../../../inc/global";
import { ScAddress } from "../../../inc/address";
import { SfxUInt32Item } from "../../../../svl/source/items/intitem";
import { SvxAsianTabPage } from "../../../../cui/source/tabpages/paragrph";
import { IsAsianTypographyEnabled } from "../../../../svl/source/config/cjkoptions";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { ASIAN, COMPLEX, LATIN } from "../../../../offapi/com/sun/star/i18n/ScriptType";
import * as attr from "../../../inc/scitems";
import { SfxItemState, type SfxItemSet } from "../../../../svl/source/items/itemset";
import type { ScViewData } from "../inc/viewdata";
import { GetSelectionPattern } from "../view/viewfunc";

/** Native alignment page attributes cleared by Reset. */
export const alignmentWhich = [
  ATTR_HOR_JUSTIFY,
  ATTR_HOR_JUSTIFY_METHOD,
  ATTR_VER_JUSTIFY,
  ATTR_VER_JUSTIFY_METHOD,
  ATTR_INDENT,
  ATTR_ROTATE_VALUE,
  ATTR_ROTATE_MODE,
  ATTR_STACKED,
  ATTR_LINEBREAK,
  ATTR_HYPHENATE,
  ATTR_SHRINKTOFIT,
  ATTR_WRITINGDIR,
] as const;

/** Original Font page character items by writing system. */
export const fontGroups = [
  {
    name: "Western",
    script: LATIN,
    font: attr.ATTR_FONT,
    height: attr.ATTR_FONT_HEIGHT,
    weight: attr.ATTR_FONT_WEIGHT,
    posture: attr.ATTR_FONT_POSTURE,
    language: attr.ATTR_FONT_LANGUAGE,
  },
  {
    name: "Asian",
    script: ASIAN,
    font: attr.ATTR_CJK_FONT,
    height: attr.ATTR_CJK_FONT_HEIGHT,
    weight: attr.ATTR_CJK_FONT_WEIGHT,
    posture: attr.ATTR_CJK_FONT_POSTURE,
    language: attr.ATTR_CJK_FONT_LANGUAGE,
  },
  {
    name: "Complex",
    script: COMPLEX,
    font: attr.ATTR_CTL_FONT,
    height: attr.ATTR_CTL_FONT_HEIGHT,
    weight: attr.ATTR_CTL_FONT_WEIGHT,
    posture: attr.ATTR_CTL_FONT_POSTURE,
    language: attr.ATTR_CTL_FONT_LANGUAGE,
  },
] as const;

/** Clears all original character-name fields when the page is reset. @returns Native item IDs. */
export function fontPageItems(): number[] {
  return fontGroups.flatMap(
    /** Resolves one script's item IDs. @param group - Script item map. @returns IDs. */
    ({ font, height, weight, posture, language }) => [font, height, weight, posture, language],
  );
}

/** Original Font Effects page item range. */
export const fontEffectsWhich = [
  attr.ATTR_FONT_COLOR,
  attr.ATTR_FONT_RELIEF,
  attr.ATTR_FONT_CONTOUR,
  attr.ATTR_FONT_SHADOWED,
  attr.ATTR_FONT_OVERLINE,
  attr.ATTR_FONT_CROSSEDOUT,
  attr.ATTR_FONT_UNDERLINE,
  attr.ATTR_FONT_WORDLINE,
  attr.ATTR_FONT_EMPHASISMARK,
] as const;

/** Cell borders and their separately pooled padding and shadow items. */
export const borderWhich = [
  ATTR_BORDER,
  ATTR_BORDER_INNER,
  ATTR_MARGIN,
  attr.ATTR_SHADOW,
  attr.ATTR_BORDER_TLBR,
  attr.ATTR_BORDER_BLTR,
] as const;

export const FID_CELL_FORMAT = 26285;
export const FORMAT_CELL_DIALOG = ".uno:FormatCellDialog";

/** Original admitted Format Cells pages in native order. */
export const cellFormatPages = [
  ["numbers", "Numbers"],
  ["font", "Font"],
  ["fonteffects", "Font Effects"],
  ["alignment", "Alignment"],
  ...(IsAsianTypographyEnabled() ? ([["asiantypography", "Asian Typography"]] as const) : []),
  ["borders", "Borders"],
  ["background", "Background"],
  ["cellprotection", "Cell Protection"],
] as const;

/** Locale and picture requested by the Numbers tab. */
export interface NumberFormatChange {
  readonly language: number;
  readonly code: string;
}

/** Original output item set and the staged number-format selection. */
export interface ScAttrDlgResult {
  readonly items: SfxItemSet;
  readonly format?: NumberFormatChange;
}

/** Retains the actual selection and cursor sample for the lifetime of the original dialog. */
export class ScAttrDlg {
  readonly items: SfxItemSet;
  readonly sample: number | string | undefined;
  readonly formatter;
  readonly numbers: SvxNumberFormatShell;
  readonly borders: SvxBorderTabPage;
  readonly asianTypography: SvxAsianTabPage;
  readonly output: SfxItemSet;

  /** Captures the native selection format and original numeric preview sample. @param view - Actual view data. @returns Dialog input. */
  constructor(view: ScViewData) {
    const document = view.GetDocument();
    this.formatter = document.GetFormatTable();
    const pattern = GetSelectionPattern(view);
    this.items = pattern.GetItemSet().Clone();
    const frame = view.GetViewShell()?.GetSelectionFrame();
    if (frame) {
      const [outer, inner] = frame;
      if (document.IsLayoutRTL(view.CurrentTabForData())) {
        const original = outer.Clone();
        const left = inner.IsValid(Valid.LEFT),
          right = inner.IsValid(Valid.RIGHT);
        if (left) outer.SetLine(original.GetLeft(), Edge.RIGHT);
        if (right) outer.SetLine(original.GetRight(), Edge.LEFT);
        inner.SetValid(Valid.LEFT, right);
        inner.SetValid(Valid.RIGHT, left);
        original.Dispose();
      }
      this.items.Put(outer, true);
      this.items.Put(inner, true);
    }
    this.borders = new SvxBorderTabPage(this.items, ATTR_BORDER, undefined, ATTR_BORDER_INNER, {
      marginWhich: ATTR_MARGIN,
      defaultWidth: 75,
      diagonalWhich: [attr.ATTR_BORDER_TLBR, attr.ATTR_BORDER_BLTR],
      removeAdjacent: true,
      styles: [
        Style.SOLID,
        Style.DOTTED,
        Style.DASHED,
        Style.FINE_DASHED,
        Style.DASH_DOT,
        Style.DASH_DOT_DOT,
        Style.DOUBLE_THIN,
      ],
    });

    this.output = this.items.Clone(false);
    this.asianTypography = new SvxAsianTabPage(this.items, this.output);
    if (pattern.HasValidNumberFormat())
      this.items.Put(
        new SfxUInt32Item(ATTR_VALUE_FORMAT, pattern.GetNumberFormat(this.formatter)),
        true,
      );
    else this.items.InvalidateItem(ATTR_VALUE_FORMAT);
    const cursor = new ScAddress(view.GetCurX(), view.GetCurY(), view.CurrentTabForData());
    const cell = document.GetRefCellValue(cursor);
    if (cell.getType() === CellType.CELLTYPE_VALUE) this.sample = cell.getDouble();
    else if (cell.getType() === CellType.CELLTYPE_STRING) {
      const shared = cell.getSharedString();
      this.sample = shared ? text(shared.getString()) : "";
    } else {
      const formula = cell.getFormula();
      this.sample = formula?.IsValue() ? formula.GetValue() : undefined;
    }
    this.numbers = new SvxNumberFormatShell(this.formatter, this.sample);
  }

  /** Reads the pending or original item while preserving mixed state. @param which - Native item ID. @returns Effective item or mixed. */
  GetItem<T extends SfxPoolItem>(which: number): T | undefined {
    return (this.output.GetItemIfSet(which, false) ??
      (this.items.GetItemState(which) >= SfxItemState.DEFAULT
        ? this.items.Get(which)
        : undefined)) as T | undefined;
  }

  /** Borrows the original pool default for a deliberate mixed-state edit. @param which - Native item ID. @returns Pool default. */
  GetDefaultItem<T extends SfxPoolItem>(which: number): T {
    return this.items.GetPool().GetUserOrPoolDefaultItem(which) as T;
  }

  /** Releases the dialog snapshot items. @returns Nothing. */
  Dispose(): void {
    this.numbers.Dispose();
    this.borders.Dispose();
    this.output.Dispose();
    this.items.Dispose();
  }
}
