/** @fileoverview Consumed cell text-property map from xmlstyle.cxx using actual native items,UNO Any and shared XML property handlers;remaining cell properties stay unported. */
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import type { XMLFontAutoStylePool } from "../../../../xmloff/source/style/XMLFontAutoStylePool";
import { escapeXml } from "../../../../xmloff/source/text/txtparae";
import type { ScPatternAttr } from "../../../inc/patattr";
import {
  SvxWeightItem,
  SvxPostureItem,
  SvxUnderlineItem,
  SvxFontHeightItem,
} from "../../../../editeng/source/items/textitem";
import {
  MID_WEIGHT,
  MID_POSTURE,
  MID_TL_STYLE,
  MID_TL_COLOR,
  MID_TL_HASCOLOR,
} from "../../../../editeng/inc/memberids";
import { SfxItemState } from "../../../../svl/source/items/itemset";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import type { FastAttributeList } from "../../../../xmloff/source/core/xmlimp";
import { SvXMLUnitConverter } from "../../../../xmloff/source/core/xmluconv";
import { XMLFontWeightPropHdl } from "../../../../xmloff/source/style/weighhdl";
import { XMLPosturePropHdl } from "../../../../xmloff/source/style/postuhdl";
import {
  XMLUnderlineStylePropHdl,
  XMLUnderlineTypePropHdl,
  XMLUnderlineWidthPropHdl,
} from "../../../../xmloff/source/style/undlihdl";
import {
  XMLColorTransparentPropHdl,
  XMLIsTransparentPropHdl,
} from "../../../../xmloff/source/style/xmlbahdl";
/** Font-name entries from the shared paragraph-extension mapper chained by native Calc. */
const fonts = [
  [XMLToken.STYLE_FONT_NAME, "style:font-name", 100],
  [XMLToken.STYLE_FONT_NAME_ASIAN, "style:font-name-asian", 111],
  [XMLToken.STYLE_FONT_NAME_COMPLEX, "style:font-name-complex", 116],
] as const;
/** Existing native script height properties. */
const heights = [
  [XMLToken.FO_FONT_SIZE, "fo:font-size", 101],
  [XMLToken.STYLE_FONT_SIZE_ASIAN, "style:font-size-asian", 112],
  [XMLToken.STYLE_FONT_SIZE_COMPLEX, "style:font-size-complex", 117],
] as const;
/** Native property handler instances have no retained document state. */
const unitConverter = new SvXMLUnitConverter("twip"),
  weight = new XMLFontWeightPropHdl(),
  posture = new XMLPosturePropHdl();
/** Original transparent color handlers shared with Writer. */
const lineColor = new XMLColorTransparentPropHdl("font-color"),
  lineHasColor = new XMLIsTransparentPropHdl("font-color", false);
/** Actual source weight/posture property-to-item associations. */
const characters = [
  [XMLToken.FO_FONT_WEIGHT, "fo:font-weight", 102, weight, MID_WEIGHT],
  [XMLToken.STYLE_FONT_WEIGHT_ASIAN, "style:font-weight-asian", 113, weight, MID_WEIGHT],
  [XMLToken.STYLE_FONT_WEIGHT_COMPLEX, "style:font-weight-complex", 118, weight, MID_WEIGHT],
  [XMLToken.FO_FONT_STYLE, "fo:font-style", 103, posture, MID_POSTURE],
  [XMLToken.STYLE_FONT_STYLE_ASIAN, "style:font-style-asian", 114, posture, MID_POSTURE],
  [XMLToken.STYLE_FONT_STYLE_COMPLEX, "style:font-style-complex", 119, posture, MID_POSTURE],
] as const;
/** Source multi-property underline handlers,retaining their merge rules. */
const lines = [
  [
    XMLToken.STYLE_TEXT_UNDERLINE_STYLE,
    "style:text-underline-style",
    new XMLUnderlineStylePropHdl(),
  ],
  [XMLToken.STYLE_TEXT_UNDERLINE_TYPE, "style:text-underline-type", new XMLUnderlineTypePropHdl()],
  [
    XMLToken.STYLE_TEXT_UNDERLINE_WIDTH,
    "style:text-underline-width",
    new XMLUnderlineWidthPropHdl(),
  ],
] as const;
/** Consumed direct item identities for native automatic-style registration. */
export const cellTextWhichIds = [
  100, 111, 116, 101, 112, 117, 102, 113, 118, 103, 114, 119, 104,
] as const;
/** Emits effective native text properties as a canonical automatic-style key and XML fragment. @param pattern - Actual pattern. @param fontPool - Original shared declaration pool. @returns XML attributes. */
export function exportCellTextProperties(
  pattern: ScPatternAttr,
  fontPool: XMLFontAutoStylePool,
): string {
  let result = "";
  for (const [, name, which] of fonts) {
    if (pattern.GetItemSet().GetItemState(which, false) !== SfxItemState.SET) continue;
    const item = pattern.GetItem(which) as SvxFontItem;
    const values = [
      item.GetFamilyName(),
      item.GetStyleName(),
      item.GetFamily(),
      item.GetPitch(),
      item.GetCharSet(),
    ] as const;
    fontPool.Add(...values);
    result += ` ${name}="${escapeXml(fontPool.Find(...values))}"`;
  }
  for (const [, name, which] of heights)
    if (pattern.GetItemSet().GetItemState(which, false) === SfxItemState.SET)
      result += ` ${name}="${(pattern.GetItem(which) as SvxFontHeightItem).GetHeight() / 20}pt"`;
  const value = new Any(),
    output: [string] = [""];
  try {
    for (const [, name, which, handler, member] of characters) {
      if (pattern.GetItemSet().GetItemState(which, false) !== SfxItemState.SET) continue;
      (pattern.GetItem(which) as SvxWeightItem | SvxPostureItem).QueryValue(value, member);
      if (handler.exportXML(output, value, unitConverter)) result += ` ${name}="${output[0]}"`;
    }
    if (pattern.GetItemSet().GetItemState(104, false) !== SfxItemState.SET) return result;
    const line = pattern.GetItem(104) as SvxUnderlineItem;
    line.QueryValue(value, MID_TL_STYLE);
    for (const [, name, handler] of lines)
      if (handler.exportXML(output, value, unitConverter)) result += ` ${name}="${output[0]}"`;
    output[0] = "";
    line.QueryValue(value, MID_TL_HASCOLOR);
    lineHasColor.exportXML(output, value, unitConverter);
    line.QueryValue(value, MID_TL_COLOR);
    lineColor.exportXML(output, value, unitConverter);
    result += ` style:text-underline-color="${output[0]}"`;
    return result;
  } finally {
    value.dispose();
  }
}
/** Imports directly into real items,with independent script values and source underline multi-property merge. @param pattern - Actual destination. @param attributes - Shared SAX attributes. @param unsupported - Actual importer diagnostic callback. @param findFont - Shared declaration lookup. @returns Nothing. */
export function importCellTextProperties(
  pattern: ScPatternAttr,
  attributes: FastAttributeList,
  unsupported: (name: string) => void,
  findFont: (name: string) => SvxFontItem | undefined,
): void {
  attributes.assertOnly(
    [
      ...fonts.map(
        /** Selects the source font-reference token. @param entry - Mapping. @returns Token. */ ([
          token,
        ]) => token,
      ),
      ...heights.map(
        /** Selects original height token. @param pair - Property. @returns Token. */
        ([token]) => token,
      ),
      ...characters.map(
        /** Selects original character token. @param pair - Property. @returns Token. */
        ([token]) => token,
      ),
      ...lines.map(
        /** Selects original line token. @param pair - Property. @returns Token. */
        ([token]) => token,
      ),
      XMLToken.STYLE_TEXT_UNDERLINE_COLOR,
    ],
    "Calc text properties",
  );
  for (const [token, , which] of fonts) {
    const name = attributes.get(token);
    if (name === null) continue;
    const declared = findFont(name);
    if (!declared) {
      unsupported("missing font declaration");
      continue;
    }
    const item = new SvxFontItem(declared);
    item.SetWhich(which);
    pattern.ItemSetPut(item);
  }
  const converter = new SvXMLUnitConverter("twip");
  for (const [token, , which] of heights) {
    const source = attributes.get(token);
    if (source === null) continue;
    const height = converter.convertMeasureToCore(source, 0, 0xffffffff);
    if (height === null || height <= 0) unsupported("relative or invalid cell font height");
    else pattern.ItemSetPut(new SvxFontHeightItem(height, 100, which));
  }
  const value = new Any();
  try {
    for (const [token, , which, handler, member] of characters) {
      const source = attributes.get(token);
      if (source === null) continue;
      if (!handler.importXML(source, value, unitConverter)) {
        unsupported("invalid cell character property");
        continue;
      }
      const item = (pattern.GetItem(which) as SvxWeightItem | SvxPostureItem).Clone();
      item.PutValue(value, member);
      pattern.ItemSetPut(item);
    }
    value.clear();
    const line = new SvxUnderlineItem(pattern.GetItem(104) as SvxUnderlineItem);
    let applied = false;
    for (const [token, source] of attributes) {
      const property = lines.find(
        /** Finds an original line property in actual SAX order. @param entry - Mapping. @returns Token equality. */ ([
          entry,
        ]) => entry === token,
      );
      if (property !== undefined) {
        if (property[2].importXML(source, value, unitConverter)) {
          line.PutValue(value, MID_TL_STYLE);
          applied = true;
        } else unsupported("invalid cell underline property");
      }
      if (token === XMLToken.STYLE_TEXT_UNDERLINE_COLOR) {
        if (lineColor.importXML(source, value, unitConverter)) line.PutValue(value, MID_TL_COLOR);
        lineHasColor.importXML(source, value, unitConverter);
        line.PutValue(value, MID_TL_HASCOLOR);
        applied = true;
      }
    }
    if (applied) pattern.ItemSetPut(line);
  } finally {
    value.dispose();
  }
}
