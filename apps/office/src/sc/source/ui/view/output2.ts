/** @fileoverview Calc output decisions for wrapping and orientation before positioning cell text. */
import type { ScAddress } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import type { ScPatternAttr } from "../../../inc/patattr";
import {
  ATTR_HOR_JUSTIFY,
  ATTR_HYPHENATE,
  ATTR_LINEBREAK,
  ATTR_ROTATE_MODE,
  ATTR_ROTATE_VALUE,
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
  const repeat = horizontal === SvxCellHorJustify.Repeat;
  if (repeat && wrap) horizontal = SvxCellHorJustify.Standard;
  const orientation = repeat
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
  if (!repeat && orientation === SvxCellOrientation.Standard) {
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
  // DrawStrings suppresses wrapping only for number results in the NUMBER category.
  if (lineBreak && rotation === 0 && orientation === SvxCellOrientation.Standard) {
    const cell = doc.GetRefCellValue(pos);
    if (cell.getFormula()?.IsRunning() || cell.hasNumeric()) {
      const formatter = doc.GetFormatTable();
      const key = doc.GetNumberFormat(pos.Col(), pos.Row(), pos.Tab());
      if (formatter.GetType(key) === SvNumFormatType.NUMBER) lineBreak = false;
    }
  }
  const hyphenate =
    lineBreak && (pattern.GetItem(ATTR_HYPHENATE, conditional) as SfxBoolItem).GetValue();
  return {
    horizontal,
    vertical,
    orientation,
    asianVertical,
    lineBreak,
    hyphenate,
    rotation,
    reference,
  };
}
