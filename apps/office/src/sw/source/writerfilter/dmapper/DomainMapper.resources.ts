/** @fileoverview Original DomainMapper underline, paragraph-border and highlight resource mappings. */
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import type { DomainMapper_Impl } from "./DomainMapper_Impl";
import { StyleType } from "./StyleSheetTable";
import { CellColorHandler } from "./CellColorHandler";
import { GrabBagType, type PropertyMap } from "./PropertyMap";
import { resolveReturnedReference, type Sprm } from "../inc/dmapper/resourcemodel";
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

/** Resolves Word run shading through the original character color handler. @param modifier - Native shading resource. @param context - Current property map. @returns Nothing. */
export function ResolveCharacterShading(modifier: Sprm, context: PropertyMap | null): void {
  if (!context) return;
  const reference = modifier.getProps();
  if (!reference) return;
  const handler = new CellColorHandler();
  handler.setOutputFormat(CellColorHandler.Character);
  try {
    resolveReturnedReference(reference, handler);
    const properties = handler.getProperties();
    const marker = new Any([true], "bool");
    try {
      context.InsertProps(properties);
      context.Insert(P.PROP_CHAR_SHADING_MARKER, marker, true, GrabBagType.CHAR_GRAB_BAG);
    } finally {
      marker.dispose();
      properties.dispose();
    }
  } finally {
    handler.dispose();
  }
}

/** Resolves the original direct highlight color and Word character-style exclusion. @param value - Native resource value. @param context - Current property map. @param mapper - Import context owner. @returns Nothing. */
export function ResolveCharacterHighlight(
  value: number,
  context: PropertyMap | null,
  mapper: DomainMapper_Impl,
): void {
  if (
    !context ||
    (mapper.IsStyleSheetImport() &&
      mapper.GetStyleSheetTable().GetCurrentEntry()?.m_nStyleTypeCode === StyleType.Character)
  )
    return;
  const color = mapper.IsRTFImport()
    ? value
    : highlights[value - N.LN_Value_ST_HighlightColor_black];
  if (color === undefined) return;
  const property = new Any([color], "sal_Int32");
  try {
    context.Insert(P.PROP_CHAR_HIGHLIGHT, property);
  } finally {
    property.dispose();
  }
}
