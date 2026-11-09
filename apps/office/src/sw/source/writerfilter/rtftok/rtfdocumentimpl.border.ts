/** @fileoverview RTF border value dispatch and native mapper metric conversion from pinned rtftok and BorderHandler. */
import { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import { SvxBorderLine } from "../../../../editeng/source/items/borderline";
import { BorderLine2 } from "../../../../offapi/com/sun/star/table/BorderLine2";
import { convert, Length } from "../../../../o3tl/inc/unit_conversion";
import { MakeBorderLine, convertTwipToMm100_Limited } from "../dmapper/ConversionHelper";
import { COL_BLACK, type Color } from "../../../../tools/inc/color";

import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { getLastAttributes, putNestedSprm } from "./rtfdocumentimpl.properties";
import { RTFConflictPolicy, RTFSprms } from "./rtfsprm";
import { RTFValue } from "./rtfvalue";

/** BorderHandler's source defaults, populated by group-scoped RTF controls. */
export interface RtfParagraphBorder {
  type: number;
  width: number;
  colorIndex: number;
  distance: number;
}

/** Exact represented border-style controls; brdrth intentionally has no dispatch case upstream. */
export const RTF_BORDER_STYLES: Readonly<Record<string, number>> = {
  brdrs: N.LN_Value_ST_Border_single,
  brdrhair: N.LN_Value_ST_Border_single,
  brdrdot: N.LN_Value_ST_Border_dotted,
  brdrdash: N.LN_Value_ST_Border_dashed,
  brdrdb: N.LN_Value_ST_Border_double,
  brdrtnthsg: N.LN_Value_ST_Border_thinThickSmallGap,
  brdrtnthmg: N.LN_Value_ST_Border_thinThickMediumGap,
  brdrtnthlg: N.LN_Value_ST_Border_thinThickLargeGap,
  brdrthtnsg: N.LN_Value_ST_Border_thickThinSmallGap,
  brdrthtnmg: N.LN_Value_ST_Border_thickThinMediumGap,
  brdrthtnlg: N.LN_Value_ST_Border_thickThinLargeGap,
  brdremboss: N.LN_Value_ST_Border_threeDEmboss,
  brdrengrave: N.LN_Value_ST_Border_threeDEngrave,
  brdroutset: N.LN_Value_ST_Border_outset,
  brdrinset: N.LN_Value_ST_Border_inset,
  brdrdashsm: N.LN_Value_ST_Border_dashSmallGap,
  brdrdashd: N.LN_Value_ST_Border_dotDash,
  brdrdashdd: N.LN_Value_ST_Border_dotDotDash,
  brdrnone: N.LN_Value_ST_Border_none,
};

const cellBorders = new Map<string, number>([
  ["clbrdrt", N.LN_CT_TcBorders_top],
  ["clbrdrl", N.LN_CT_TcBorders_left],
  ["clbrdrb", N.LN_CT_TcBorders_bottom],
  ["clbrdrr", N.LN_CT_TcBorders_right],
]);

/** Converts the original RTF twip width to the dmapper eighth-point resource value. @param width - Native signed twip width. @returns Source border size. */
function borderWidth(width: number): number {
  return width === 2 ? 1 : width > 1 ? Math.trunc(((width * 2) | 0) / 5) : width;
}

/** Opens an ordered native border modifier on the actual cell definition. @param cell - Current cell property owner. @param side - Original cell edge token. @param policy - Source collision policy. @returns Nothing. */
function putCellBorder(cell: RTFSprms, side: number, policy: RTFConflictPolicy): void {
  const attributes = new RTFSprms();
  try {
    putNestedSprm(cell, N.LN_CT_TcPrBase_tcBorders, side, new RTFValue(attributes), policy);
  } finally {
    attributes.dispose();
  }
}

/** Emits the original CLBRDR edge and appends it in source order. @param cell - Current cell property owner. @param name - Native RTF control. @returns Whether this was a cell-border flag. */
export function DispatchCellBorder(cell: RTFSprms, name: string): boolean {
  const side = cellBorders.get(name);
  if (side === undefined) return false;
  putCellBorder(cell, side, RTFConflictPolicy.Append);
  return true;
}

/** Writes an original attribute to the last cell-border modifier. @param cell - Current cell property owner. @param name - Native border control. @param value - RTF value or zero. @param colors - Original RTF palette. @returns Nothing. */
export function DispatchCellBorderValue(
  cell: RTFSprms,
  name: string,
  value: number,
  colors: readonly Readonly<Color>[],
): void {
  const attributes = getLastAttributes(cell, N.LN_CT_TcPrBase_tcBorders);
  if (Object.hasOwn(RTF_BORDER_STYLES, name))
    attributes.set(N.LN_CT_Border_val, new RTFValue(RTF_BORDER_STYLES[name] as number));
  else if (name === "brdrw") attributes.set(N.LN_CT_Border_sz, new RTFValue(borderWidth(value)));
  else if (name === "brdrcf")
    attributes.set(
      N.LN_CT_Border_color,
      new RTFValue((colors[value >>> 0] ?? COL_BLACK).toInt32()),
    );
  else if (name === "brsp")
    attributes.set(N.LN_CT_Border_space, new RTFValue(Math.trunc(value / 20)));
}

/** Writes the native zero-width border properties of the grid-after cell. @param cell - Original filler cell definition. @returns Nothing. */
export function ClearCellBorders(cell: RTFSprms): void {
  for (const side of [
    N.LN_CT_TcBorders_bottom,
    N.LN_CT_TcBorders_top,
    N.LN_CT_TcBorders_left,
    N.LN_CT_TcBorders_right,
  ]) {
    putCellBorder(cell, side, RTFConflictPolicy.Overwrite);
    const attributes = getLastAttributes(cell, N.LN_CT_TcPrBase_tcBorders);
    attributes.set(N.LN_CT_Border_val, new RTFValue(N.LN_Value_ST_Border_none));
    attributes.set(N.LN_CT_Border_sz, new RTFValue(0));
  }
}

/** Creates the source BorderHandler defaults before explicit attributes. @returns New parsed border. */
export function createRtfBorder(): RtfParagraphBorder {
  return { type: N.LN_Value_ST_Border_none, width: 15, colorIndex: -1, distance: 0 };
}

/** Resolves a registered border value; unknown flags leave prior state intact. @param border - Current parsed border. @param name - Control name. @param parameter - Optional numeric value. @returns Whether handled. */
export function dispatchRtfBorder(
  border: RtfParagraphBorder,
  name: string,
  parameter: number | undefined,
): boolean {
  const value = parameter ?? 0;
  if (Object.hasOwn(RTF_BORDER_STYLES, name)) border.type = RTF_BORDER_STYLES[name] as number;
  else if (name === "brdrw") {
    // rtftok twips -> OOXML eighth-points -> BorderHandler integral twips.
    const eighthPoints = borderWidth(value);
    border.width = Math.trunc((eighthPoints * 5) / 2);
  } else if (name === "brdrcf") border.colorIndex = value;
  else if (name === "brsp") border.distance = Math.trunc(value / 20) * 20;
  else return false;
  return true;
}

/** Materializes the same BorderLine2 metric boundary as ConversionHelper::MakeBorderLine and UNO. @param border - Parsed border. @param colors - RTF color table. @returns Native line or no border. */
export function createRtfBorderLine(
  border: Readonly<RtfParagraphBorder>,
  colors: readonly Readonly<Color>[],
): SvxBorderLine | undefined {
  const color = colors[border.colorIndex >>> 0] ?? COL_BLACK;
  const value = new BorderLine2();
  MakeBorderLine(border.width, border.type, color.toInt32(), value, true);
  const line = new SvxBorderLine();
  return SvxBoxItem.LineToSvxLine(value, line, true, "BorderLine2") ? line : undefined;
}

/** Applies the mapper's point distance and native UNO metric conversion. @param border - Parsed border. @returns Native twip distance. */
export function getRtfBorderDistance(border: Readonly<RtfParagraphBorder>): number {
  return Number(
    convert(BigInt(convertTwipToMm100_Limited(border.distance)), Length.mm100, Length.twip),
  );
}
