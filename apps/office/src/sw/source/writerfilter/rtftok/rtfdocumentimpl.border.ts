/** @fileoverview RTF border value dispatch and native mapper metric conversion from pinned rtftok and BorderHandler. */
import { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import {
  ConvertBorderWidthFromWord,
  SvxBorderLine,
} from "../../../../editeng/source/items/borderline";
import { BorderLine2 } from "../../../../offapi/com/sun/star/table/BorderLine2";
import { BorderLineStyle } from "../../../../offapi/com/sun/star/table/BorderLineStyle";
import { convert, Length } from "../../../../o3tl/inc/unit_conversion";
import { convertTwipToMm100_Limited } from "../dmapper/ConversionHelper";

/** BorderHandler's source defaults, populated by group-scoped RTF controls. */
export interface RtfCellBorder {
  style: BorderLineStyle;
  width: number;
  colorIndex: number;
  distance: number;
}

/** Exact represented border-style controls; brdrth intentionally has no dispatch case upstream. */
export const RTF_BORDER_STYLES: Readonly<Record<string, BorderLineStyle>> = {
  brdrs: BorderLineStyle.SOLID,
  brdrhair: BorderLineStyle.SOLID,
  brdrdot: BorderLineStyle.DOTTED,
  brdrdash: BorderLineStyle.DASHED,
  brdrdb: BorderLineStyle.DOUBLE,
  brdrtnthsg: BorderLineStyle.THINTHICK_SMALLGAP,
  brdrtnthmg: BorderLineStyle.THINTHICK_MEDIUMGAP,
  brdrtnthlg: BorderLineStyle.THINTHICK_LARGEGAP,
  brdrthtnsg: BorderLineStyle.THICKTHIN_SMALLGAP,
  brdrthtnmg: BorderLineStyle.THICKTHIN_MEDIUMGAP,
  brdrthtnlg: BorderLineStyle.THICKTHIN_LARGEGAP,
  brdremboss: BorderLineStyle.EMBOSSED,
  brdrengrave: BorderLineStyle.ENGRAVED,
  brdroutset: BorderLineStyle.OUTSET,
  brdrinset: BorderLineStyle.INSET,
  brdrdashsm: BorderLineStyle.FINE_DASHED,
  brdrdashd: BorderLineStyle.DASH_DOT,
  brdrdashdd: BorderLineStyle.DASH_DOT_DOT,
  brdrnone: BorderLineStyle.NONE,
};

/** Creates the source BorderHandler defaults before explicit attributes. @returns New parsed border. */
export function createRtfBorder(): RtfCellBorder {
  return { style: BorderLineStyle.NONE, width: 15, colorIndex: 0, distance: 0 };
}

/** Resolves a registered border value; unknown flags leave prior state intact. @param border - Current parsed border. @param name - Control name. @param parameter - Optional numeric value. @returns Whether handled. */
export function dispatchRtfBorder(
  border: RtfCellBorder,
  name: string,
  parameter: number | undefined,
): boolean {
  const value = parameter ?? 0;
  if (Object.hasOwn(RTF_BORDER_STYLES, name))
    border.style = RTF_BORDER_STYLES[name] as BorderLineStyle;
  else if (name === "brdrw") {
    // rtftok twips -> OOXML eighth-points -> BorderHandler integral twips.
    const eighthPoints = value === 2 ? 1 : value > 1 ? Math.trunc((value * 2) / 5) : value;
    border.width = Math.trunc((eighthPoints * 5) / 2);
  } else if (name === "brdrcf") border.colorIndex = value;
  else if (name === "brsp") border.distance = Math.trunc(value / 20) * 20;
  else return false;
  return true;
}

/** Materializes the same BorderLine2 metric boundary as ConversionHelper::MakeBorderLine and UNO. @param border - Parsed border. @param colors - RTF color table. @returns Native line or no border. */
export function createRtfBorderLine(
  border: Readonly<RtfCellBorder>,
  colors: readonly string[],
): SvxBorderLine | undefined {
  const text = colors[border.colorIndex] ?? "#000000";
  const color = /^#[0-9a-f]{6}$/i.test(text) ? Number.parseInt(text.slice(1), 16) : 0;
  const width =
    border.style === BorderLineStyle.NONE
      ? 0
      : ConvertBorderWidthFromWord(border.style, border.width);
  const value = new BorderLine2(color, 0, 0, 0, border.style, convertTwipToMm100_Limited(width));
  const line = new SvxBorderLine();
  return SvxBoxItem.LineToSvxLine(value, line, true, "BorderLine2") ? line : undefined;
}

/** Applies the mapper's point distance and native UNO metric conversion. @param border - Parsed border. @returns Native twip distance. */
export function getRtfBorderDistance(border: Readonly<RtfCellBorder>): number {
  return Number(
    convert(BigInt(convertTwipToMm100_Limited(border.distance)), Length.mm100, Length.twip),
  );
}
