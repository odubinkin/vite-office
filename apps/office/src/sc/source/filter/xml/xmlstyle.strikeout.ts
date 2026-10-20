/** @fileoverview Original chained Calc strikeout text-property mapping from xmlstyle.cxx/txtprmap.cxx,split from the existing large style owner. */
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { MID_CROSS_OUT } from "../../../../editeng/inc/memberids";
import { SvxCrossedOutItem } from "../../../../editeng/inc/crossedoutitem";
import { SfxItemState } from "../../../../svl/inc/itemset";
import {
  XMLCrossedOutTypePropHdl,
  XMLCrossedOutStylePropHdl,
  XMLCrossedOutWidthPropHdl,
  XMLCrossedOutTextPropHdl,
} from "../../../../xmloff/source/style/cdouthdl";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import { SvXMLUnitConverter } from "../../../../xmloff/source/core/xmluconv";
import type { FastAttributeList } from "../../../../xmloff/source/core/xmlimp";
import { escapeXml } from "../../../../xmloff/source/text/txtparae";
import type { ScPatternAttr } from "../../../inc/patattr";
const converter = new SvXMLUnitConverter("twip");
/** Original chained style/type/width/text property order. */
const properties = [
  [
    XMLToken.STYLE_TEXT_LINE_THROUGH_STYLE,
    "style:text-line-through-style",
    new XMLCrossedOutStylePropHdl(),
  ],
  [
    XMLToken.STYLE_TEXT_LINE_THROUGH_TYPE,
    "style:text-line-through-type",
    new XMLCrossedOutTypePropHdl(),
  ],
  [
    XMLToken.STYLE_TEXT_LINE_THROUGH_WIDTH,
    "style:text-line-through-width",
    new XMLCrossedOutWidthPropHdl(),
  ],
  [
    XMLToken.STYLE_TEXT_LINE_THROUGH_TEXT,
    "style:text-line-through-text",
    new XMLCrossedOutTextPropHdl(),
  ],
] as const;
/** Recognized source tokens forwarded to the actual SAX property owner. */
export const strikeoutPropertyTokens = properties.map(
  /** Selects the native property token. @param property - Mapping. @returns Token. */ ([token]) =>
    token,
);
/** Exports the actual cell strikeout enum through its native Any projection. @param pattern - Actual cell pattern. @returns XML property attributes. */
export function exportStrikeoutProperties(pattern: ScPatternAttr): string {
  if (pattern.GetItemSet().GetItemState(106, false) !== SfxItemState.SET) return "";
  const value = new Any(),
    output: [string] = [""];
  let result = "";
  try {
    (pattern.GetItem(106) as SvxCrossedOutItem).QueryValue(value, MID_CROSS_OUT);
    for (const [, name, handler] of properties)
      if (handler.exportXML(output, value, converter))
        result += ` ${name}="${escapeXml(output[0])}"`;
    return result;
  } finally {
    value.dispose();
  }
}
/** Merges native strikeout properties in actual SAX order without copying unrelated line state. @param pattern - Actual pattern. @param attributes - Actual SAX attributes. @param unsupported - Import diagnostic sink. @returns Nothing. */
export function importStrikeoutProperties(
  pattern: ScPatternAttr,
  attributes: FastAttributeList,
  unsupported: (name: string) => void,
): void {
  const value = new Any(),
    item = (pattern.GetItem(106) as SvxCrossedOutItem).Clone();
  let applied = false;
  try {
    for (const [token, source] of attributes) {
      const property = properties.find(
        /** Finds the original property handler. @param property - Mapping. @returns Token equality. */ ([
          entry,
        ]) => entry === token,
      );
      if (property !== undefined) {
        if (property[2].importXML(source, value, converter)) {
          item.PutValue(value, MID_CROSS_OUT);
          applied = true;
        } else unsupported("invalid cell strikeout property");
      }
    }
    if (applied) pattern.ItemSetPut(item);
  } finally {
    value.dispose();
  }
}
