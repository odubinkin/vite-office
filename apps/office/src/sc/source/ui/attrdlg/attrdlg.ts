/** @fileoverview Format Cells' original selection snapshot and typed output exchange. */
import { SvxNumberFormatShell } from "../../../../svx/source/items/numfmtsh";
import {
  ATTR_VALUE_FORMAT,
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
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
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

export const FID_CELL_FORMAT = 26285;
export const FORMAT_CELL_DIALOG = ".uno:FormatCellDialog";

/** Original admitted Format Cells pages in native order. */
export const cellFormatPages = [
  ["numbers", "Numbers"],
  ["alignment", "Alignment"],
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
  readonly output: SfxItemSet;

  /** Captures the native selection format and original numeric preview sample. @param view - Actual view data. @returns Dialog input. */
  constructor(view: ScViewData) {
    const document = view.GetDocument();
    this.formatter = document.GetFormatTable();
    const pattern = GetSelectionPattern(view);
    this.items = pattern.GetItemSet().Clone();
    this.output = this.items.Clone(false);
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

  /** Releases the dialog snapshot items. @returns Nothing. */
  Dispose(): void {
    this.numbers.Dispose();
    this.output.Dispose();
    this.items.Dispose();
  }
}
