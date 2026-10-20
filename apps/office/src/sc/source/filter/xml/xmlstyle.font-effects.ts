/** @fileoverview Original Calc chained contour/shadow/relief text property handlers;actual native items and shared Any/handlers own values. */
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { SfxItemState } from "../../../../svl/inc/itemset";
import { XMLBoolPropHdl } from "../../../../xmloff/source/style/xmlbahdl";
import { XMLShadowedPropHdl } from "../../../../xmloff/source/style/shdwdhdl";
import { XMLConstantsPropertyHandler } from "../../../../xmloff/source/style/XMLConstantsPropertyHandler";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import { SvXMLUnitConverter } from "../../../../xmloff/source/core/xmluconv";
import type { FastAttributeList } from "../../../../xmloff/source/core/xmlimp";
import { SvxContourItem } from "../../../../editeng/inc/contouritem";
import { SvxShadowedItem, SvxCharReliefItem } from "../../../../editeng/source/items/textitem";
import type { ScPatternAttr } from "../../../inc/patattr";
const converter = new SvXMLUnitConverter("twip");
/** Source txtprmap/txtprhdl chained handlers and original item identities. */
const properties = [
  [XMLToken.STYLE_TEXT_OUTLINE, "style:text-outline", 107, new XMLBoolPropHdl()],
  [XMLToken.FO_TEXT_SHADOW, "fo:text-shadow", 108, new XMLShadowedPropHdl()],
  [
    XMLToken.STYLE_FONT_RELIEF,
    "style:font-relief",
    124,
    new XMLConstantsPropertyHandler(
      [
        ["none", 0],
        ["engraved", 2],
        ["embossed", 1],
      ],
      null,
    ),
  ],
] as const;
/** Exports original explicit item states including authored false/none. @param pattern - Actual native pattern. @returns XML attributes. */
export function exportFontEffectProperties(pattern: ScPatternAttr): string {
  let result = "";
  const value = new Any(),
    output: [string] = [""];
  try {
    for (const [, name, which, handler] of properties) {
      if (pattern.GetItemSet().GetItemState(which, false) !== SfxItemState.SET) continue;
      (pattern.GetItem(which) as SvxContourItem | SvxShadowedItem | SvxCharReliefItem).QueryValue(
        value,
      );
      if (handler.exportXML(output, value, converter)) result += ` ${name}="${output[0]}"`;
    }
    return result;
  } finally {
    value.dispose();
  }
}
/** Imports original handlers without browser-normalizing lexical values. @param pattern - Actual pattern. @param attributes - Actual SAX properties. @param unsupported - Diagnostic sink. @returns Nothing. */
export function importFontEffectProperties(
  pattern: ScPatternAttr,
  attributes: FastAttributeList,
  unsupported: (name: string) => void,
): void {
  const value = new Any();
  try {
    for (const [token, , which, handler] of properties) {
      const source = attributes.get(token);
      if (source === null) continue;
      if (handler.importXML(source, value, converter)) {
        const item = (
          pattern.GetItem(which) as SvxContourItem | SvxShadowedItem | SvxCharReliefItem
        ).Clone();
        item.PutValue(value, 0);
        pattern.ItemSetPut(item);
      } else
        unsupported(
          which === 107 ? "invalid cell outline property" : "invalid cell relief property",
        );
    }
  } finally {
    value.dispose();
  }
}
