/** @fileoverview Calc output decisions for wrapping and orientation before positioning cell text. */
import { CellType } from "../../../inc/global";
import { COL_BLACK, COL_GREEN, COL_LIGHTBLUE, type Color } from "../../../../tools/inc/color";
import type { ScAddress } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import type { ScPatternAttr } from "../../../inc/patattr";
import {
  ATTR_HOR_JUSTIFY,
  ATTR_HYPHENATE,
  ATTR_LINEBREAK,
  ATTR_ROTATE_MODE,
  ATTR_ROTATE_VALUE,
  ATTR_SHRINKTOFIT,
  ATTR_VERTICAL_ASIAN,
  ATTR_VER_JUSTIFY,
} from "../../../inc/scitems";
import type { ScRotateValueItem } from "../../../inc/attrib";
import type { SvxHorJustifyItem, SvxVerJustifyItem } from "../../../../editeng/inc/justifyitem";
import {
  SvxCellHorJustify,
  SvxCellOrientation,
  SvxCellVerJustify,
} from "../../../../editeng/inc/svxenum";
import type { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvNumFormatType } from "../../../../svl/inc/zforlist";
import { SvxRotateMode, type SvxRotateModeItem } from "../../../../svx/inc/rotmodit";

/** Cell text state admitted by the ordinary and rotated output paths. */
export interface ScCellTextLayout {
  readonly horizontal: SvxCellHorJustify;
  readonly vertical: SvxCellVerJustify;
  readonly orientation: SvxCellOrientation;
  readonly asianVertical: boolean;
  readonly lineBreak: boolean;
  readonly repeat: boolean;
  readonly shrink: boolean;
  readonly numeric: boolean;
  readonly hyphenate: boolean;
  /** Counterclockwise hundredths of a degree for the general rotation path. */
  readonly rotation: number;
  readonly reference: SvxRotateMode;
}

/** Reads the native paint options from one effective cell pattern. @param doc - Active Calc document. @param pos - Visible cell address. @param pattern - Resolved cell pattern. @param conditional - Conditional item overrides. @returns Native cell output choices. */
export function getCellTextLayout(
  doc: ScDocument,
  pos: ScAddress,
  pattern: ScPatternAttr,
  conditional?: SfxItemSet,
): ScCellTextLayout {
  let horizontal = (pattern.GetItem(ATTR_HOR_JUSTIFY, conditional) as SvxHorJustifyItem).GetValue();
  const wrap = (pattern.GetItem(ATTR_LINEBREAK, conditional) as SfxBoolItem).GetValue();
  const filled = horizontal === SvxCellHorJustify.Repeat;
  if (filled && wrap) horizontal = SvxCellHorJustify.Standard;
  const orientation = filled
    ? SvxCellOrientation.Standard
    : pattern.GetCellOrientation(conditional);
  const asianVertical =
    orientation === SvxCellOrientation.Stacked &&
    (pattern.GetItem(ATTR_VERTICAL_ASIAN, conditional) as SfxBoolItem).GetValue();
  let vertical = (pattern.GetItem(ATTR_VER_JUSTIFY, conditional) as SvxVerJustifyItem).GetValue();
  if (asianVertical) {
    if (horizontal === SvxCellHorJustify.Standard) horizontal = SvxCellHorJustify.Right;
    if (vertical === SvxCellVerJustify.Standard) vertical = SvxCellVerJustify.Top;
  }
  let rotation = 0;
  let reference = SvxRotateMode.SVX_ROTATE_MODE_STANDARD;
  if (!filled && orientation === SvxCellOrientation.Standard) {
    const raw = (pattern.GetItem(ATTR_ROTATE_VALUE, conditional) as ScRotateValueItem).GetValue();
    if (raw !== 0) {
      rotation = ((raw % 36000) + 36000) % 36000;
      reference = (pattern.GetItem(ATTR_ROTATE_MODE, conditional) as SvxRotateModeItem).GetValue();
      // DrawRotated limits the skew close to horizontal and uses inside-cell rotation there.
      if (rotation < 50 || rotation > 35950 || Math.abs(rotation - 18000) < 50) {
        const limit =
          rotation < 50 ? 50 : rotation > 35950 ? 35950 : rotation > 18000 ? 18050 : 17950;
        rotation = limit;
        reference = SvxRotateMode.SVX_ROTATE_MODE_STANDARD;
      }
      if (doc.IsLayoutRTL(pos.Tab())) rotation = 36000 - rotation;
    }
  }

  let lineBreak = wrap || horizontal === SvxCellHorJustify.Block;
  const shrinkToFit = (pattern.GetItem(ATTR_SHRINKTOFIT, conditional) as SfxBoolItem).GetValue();
  const ordinary = rotation === 0 && orientation === SvxCellOrientation.Standard;
  const cell = (lineBreak && ordinary) || shrinkToFit ? doc.GetRefCellValue(pos) : undefined;
  const numeric = cell?.getFormula()?.IsRunning() === true || cell?.hasNumeric() === true;
  // DrawStrings suppresses wrapping only for number results in the NUMBER category.
  if (lineBreak && ordinary && numeric) {
    const formatter = doc.GetFormatTable();
    const key = doc.GetNumberFormat(pos.Col(), pos.Row(), pos.Tab());
    if (formatter.GetType(key) === SvNumFormatType.NUMBER) lineBreak = false;
  }
  const hyphenate =
    lineBreak && (pattern.GetItem(ATTR_HYPHENATE, conditional) as SfxBoolItem).GetValue();
  const repeat = filled && !lineBreak;
  const shrink = !lineBreak && !repeat && shrinkToFit;
  return {
    horizontal,
    vertical,
    orientation,
    asianVertical,
    lineBreak,
    repeat,
    shrink,
    numeric,
    hyphenate,
    rotation,
    reference,
  };
}

/** Counts the whole copies admitted by the native output rectangle. @param available - Content extent after margins. @param advance - Measured text advance. @returns Native repeat count, with one original copy for clipped or empty text. */
export function getCellTextRepeatCount(available: number, advance: number): number {
  return available > 0 && advance > 0 ? Math.max(1, Math.trunc(available / advance)) : 1;
}

/** Computes the native integer scale and repeats measurements at up to seven ten-percent reductions. @param available - Content extent after margins. @param advance - Unscaled text extent. @param measure - Measures the text again at the requested percent. @returns Applied scale and whether the reduced text fits. */
export function getCellTextShrinkScale(
  available: number,
  advance: number,
  measure: (percent: number) => number,
): { percent: number; fits: boolean } {
  if (available <= 0 || advance <= available) return { percent: 100, fits: advance <= available };
  let percent = Math.trunc((available * 100) / advance);
  let measured = measure(percent);
  for (let retry = 0; measured > available && retry < 7; retry++) {
    percent = Math.trunc((percent * 9) / 10);
    measured = measure(percent);
  }
  return { percent, fits: measured <= available };
}

/** Applies the pinned ColorConfig light defaults to the native cell kinds. @param type - Stored cell kind. @returns The syntax color, if applicable. */
export function setSyntaxColor(type: CellType): Readonly<Color> | undefined {
  switch (type) {
    case CellType.CELLTYPE_VALUE:
      return COL_LIGHTBLUE;
    case CellType.CELLTYPE_STRING:
    case CellType.CELLTYPE_EDIT:
      return COL_BLACK;
    case CellType.CELLTYPE_FORMULA:
      return COL_GREEN;
    default:
      return undefined;
  }
}
