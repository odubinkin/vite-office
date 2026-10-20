/** @fileoverview Original chained contour boolean property in Calc xmlstyle.cxx/txtprmap.cxx;uses shared native XMLBoolPropHdl and actual items. */
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { SfxItemState } from "../../../../svl/inc/itemset";
import { XMLBoolPropHdl } from "../../../../xmloff/source/style/xmlbahdl";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import { SvXMLUnitConverter } from "../../../../xmloff/source/core/xmluconv";
import type { FastAttributeList } from "../../../../xmloff/source/core/xmlimp";
import { SvxContourItem } from "../../../../editeng/inc/contouritem";
import type { ScPatternAttr } from "../../../inc/patattr";
const boolean = new XMLBoolPropHdl(),
  converter = new SvXMLUnitConverter("twip");
/** Exports native explicit contour state independently of glyph painting. @param pattern - Actual pattern. @returns XML attributes. */
export function exportFontEffectProperties(pattern: ScPatternAttr): string {
  if (pattern.GetItemSet().GetItemState(107, false) !== SfxItemState.SET) return "";
  const value = new Any(),
    output: [string] = [""];
  try {
    (pattern.GetItem(107) as SvxContourItem).QueryValue(value);
    boolean.exportXML(output, value, converter);
    return ` style:text-outline="${output[0]}"`;
  } finally {
    value.dispose();
  }
}
/** Imports the actual source contour property through a genuine bool Any. @param pattern - Actual pattern. @param attributes - Native SAX attributes. @param unsupported - Import diagnostics. @returns Nothing. */
export function importFontEffectProperties(
  pattern: ScPatternAttr,
  attributes: FastAttributeList,
  unsupported: (name: string) => void,
): void {
  const source = attributes.get(XMLToken.STYLE_TEXT_OUTLINE);
  if (source === null) return;
  const value = new Any();
  try {
    if (boolean.importXML(source, value, converter)) {
      const item = (pattern.GetItem(107) as SvxContourItem).Clone();
      item.PutValue(value, 0);
      pattern.ItemSetPut(item);
    } else unsupported("invalid cell outline property");
  } finally {
    value.dispose();
  }
}
