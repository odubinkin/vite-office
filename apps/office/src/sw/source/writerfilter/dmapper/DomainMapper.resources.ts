/** @fileoverview Original DomainMapper underline, paragraph-border and highlight resource mappings. */
import { ParaVertAlign } from "../../../../editeng/source/items/paraitem.controls";
import { FontUnderline as U } from "../../../../offapi/com/sun/star/awt/FontUnderline";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { PropertyIds as P } from "./PropertyIds";

/** Original underline token mapping, with unknown tokens retaining NONE. */
export const underline = new Map<number, number>([
  [N.LN_Value_ST_Underline_none, U.NONE],
  [N.LN_Value_ST_Underline_words, U.SINGLE],
  [N.LN_Value_ST_Underline_single, U.SINGLE],
  [N.LN_Value_ST_Underline_double, U.DOUBLE],
  [N.LN_Value_ST_Underline_dotted, U.DOTTED],
  [N.LN_Value_ST_Underline_dash, U.DASH],
  [N.LN_Value_ST_Underline_dotDash, U.DASHDOT],
  [N.LN_Value_ST_Underline_dotDotDash, U.DASHDOTDOT],
  [N.LN_Value_ST_Underline_thick, U.BOLD],
  [N.LN_Value_ST_Underline_wave, U.WAVE],
  [N.LN_Value_ST_Underline_dottedHeavy, U.BOLDDOTTED],
  [N.LN_Value_ST_Underline_dashedHeavy, U.BOLDDASH],
  [N.LN_Value_ST_Underline_dashLong, U.LONGDASH],
  [N.LN_Value_ST_Underline_dashLongHeavy, U.BOLDLONGDASH],
  [N.LN_Value_ST_Underline_dashDotHeavy, U.BOLDDASHDOT],
  [N.LN_Value_ST_Underline_dashDotDotHeavy, U.BOLDDASHDOTDOT],
  [N.LN_Value_ST_Underline_wavyHeavy, U.BOLDWAVE],
  [N.LN_Value_ST_Underline_wavyDouble, U.DOUBLEWAVE],
]);
/** Represented paragraph border properties in the source dmapper. */
export const paragraphBorderIds = new Map<number, readonly [P, P]>([
  [N.LN_CT_PBdr_top, [P.PROP_TOP_BORDER, P.PROP_TOP_BORDER_DISTANCE]],
  [N.LN_CT_PBdr_left, [P.PROP_LEFT_BORDER, P.PROP_LEFT_BORDER_DISTANCE]],
  [N.LN_CT_PBdr_bottom, [P.PROP_BOTTOM_BORDER, P.PROP_BOTTOM_BORDER_DISTANCE]],
  [N.LN_CT_PBdr_right, [P.PROP_RIGHT_BORDER, P.PROP_RIGHT_BORDER_DISTANCE]],
]);
/** Original highlight token order is contiguous in the generated resource model. */
export const highlights = [
  0x000000, 0x0000ff, 0x00ffff, 0x00ff00, 0xff00ff, 0xff0000, 0xffff00, 0xffffff, 0x000080,
  0x008080, 0x008000, 0x800080, 0x800000, 0x808000, 0x808080, 0xc0c0c0, -1,
] as const;

const textAlignments = new Map<number, ParaVertAlign>([
  [N.LN_Value_doc_ST_TextAlignment_baseline, ParaVertAlign.Baseline],
  [N.LN_Value_doc_ST_TextAlignment_top, ParaVertAlign.Top],
  [N.LN_Value_doc_ST_TextAlignment_center, ParaVertAlign.Center],
  [N.LN_Value_doc_ST_TextAlignment_bottom, ParaVertAlign.Bottom],
]);

/** Converts an original ST_TextAlignment value to the Writer item enum. @param token - Generated value identity. @returns Alignment, with native automatic fallback. */
export function paragraphVerticalAlignment(token: number): ParaVertAlign {
  return textAlignments.get(token) ?? ParaVertAlign.Automatic;
}
