/** @fileoverview Consumed cell text-property map from xmlstyle.cxx using actual native items,UNO Any and shared XML property handlers;remaining cell properties stay unported. */
import {
  cellBorderTokens,
  exportCellBorderProperties,
  importCellBorderProperties,
} from "./xmlstyle.borders";
import { ScIndentItem } from "../../../inc/attrib";
import { XMLMeasurePropHdl } from "../../../../xmloff/source/style/xmlbahdl";
import { convertTwipToMm100 } from "../../../../tools/inc/UnitConversion";
import { toTwips, Length } from "../../../../o3tl/inc/unit_conversion";
import { exportFontEffectProperties, importFontEffectProperties } from "./xmlstyle.font-effects";
import {
  exportStrikeoutProperties,
  importStrikeoutProperties,
  strikeoutPropertyTokens,
} from "./xmlstyle.strikeout";
import { SvxHorJustifyItem, SvxVerJustifyItem } from "../../../../editeng/inc/justifyitem";
import {
  CellHoriJustify as HJ,
  cppu_detail_getUnoType_CellHoriJustify as horiType,
} from "../../../../offapi/com/sun/star/table/CellHoriJustify";
import { CellVertJustify2 as VJ } from "../../../../offapi/com/sun/star/table/CellVertJustify2";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { SvxBrushItem } from "../../../../editeng/inc/brushitem";
import { Color, insertColor, extractColor } from "../../../../tools/inc/color";
import { MID_BACK_COLOR, MID_GRAPHIC_TRANSPARENT } from "../../../../editeng/inc/memberids";
import type { XMLFontAutoStylePool } from "../../../../xmloff/source/style/XMLFontAutoStylePool";
import { escapeXml } from "../../../../xmloff/source/text/txtparae";
import type { ScPatternAttr } from "../../../inc/patattr";
import {
  SvxWeightItem,
  SvxPostureItem,
  SvxTextLineItem,
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
  XMLColorAutoPropHdl,
  XMLIsAutoColorPropHdl,
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
/** Native merged font and cell-background property handlers. */
const colorAuto = new XMLColorAutoPropHdl(),
  isColorAuto = new XMLIsAutoColorPropHdl(),
  backgroundColor = new XMLColorTransparentPropHdl(),
  backgroundTransparent = new XMLIsTransparentPropHdl();
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
/** Native Calc chains the same line handlers for independent underline and overline properties. */
const lineGroups = [
  { which: 104, name: "underline", color: XMLToken.STYLE_TEXT_UNDERLINE_COLOR, properties: lines },
  {
    which: 105,
    name: "overline",
    color: XMLToken.STYLE_TEXT_OVERLINE_COLOR,
    properties: [
      [
        XMLToken.STYLE_TEXT_OVERLINE_STYLE,
        "style:text-overline-style",
        new XMLUnderlineStylePropHdl(),
      ],
      [
        XMLToken.STYLE_TEXT_OVERLINE_TYPE,
        "style:text-overline-type",
        new XMLUnderlineTypePropHdl(),
      ],
      [
        XMLToken.STYLE_TEXT_OVERLINE_WIDTH,
        "style:text-overline-width",
        new XMLUnderlineWidthPropHdl(),
      ],
    ],
  },
] as const;
/** Consumed direct item identities for native automatic-style registration. */
export const cellTextWhichIds = [
  100, 111, 116, 101, 112, 117, 102, 113, 118, 103, 114, 119, 104, 105, 106, 107, 109, 129, 132,
  148, 150, 141, 142,
] as const;
/** Emits effective native text properties as a canonical automatic-style key and XML fragment. @param pattern - Actual pattern. @param fontPool - Original shared declaration pool. @returns XML attributes. */
export function exportCellTextProperties(
  pattern: ScPatternAttr,
  fontPool: XMLFontAutoStylePool,
): string {
  let result = exportStrikeoutProperties(pattern) + exportFontEffectProperties(pattern);
  if (pattern.GetItemSet().GetItemState(109, false) === SfxItemState.SET) {
    const value = new Any(),
      output: [string] = [""];
    try {
      insertColor(value, (pattern.GetItem(109) as SvxColorItem).GetValue());
      if (colorAuto.exportXML(output, value, unitConverter)) result += ` fo:color="${output[0]}"`;
      if (isColorAuto.exportXML(output, value, unitConverter))
        result += ` style:use-window-font-color="${output[0]}"`;
    } finally {
      value.dispose();
    }
  }
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
    for (const group of lineGroups) {
      if (pattern.GetItemSet().GetItemState(group.which, false) !== SfxItemState.SET) continue;
      const line = pattern.GetItem(group.which) as SvxTextLineItem;
      line.QueryValue(value, MID_TL_STYLE);
      for (const [, name, handler] of group.properties)
        if (handler.exportXML(output, value, unitConverter)) result += ` ${name}="${output[0]}"`;
      output[0] = "";
      line.QueryValue(value, MID_TL_HASCOLOR);
      lineHasColor.exportXML(output, value, unitConverter);
      line.QueryValue(value, MID_TL_COLOR);
      lineColor.exportXML(output, value, unitConverter);
      result += ` style:text-${group.name}-color="${output[0]}"`;
    }
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
      ...lineGroups.flatMap(
        /** Collects native property tokens for both line families. @param group - Original property group. @returns Recognized SAX tokens. */ (
          group,
        ) => [
          ...group.properties.map(
            /** Selects the native line token. @param property - Mapping. @returns Token. */ ([
              token,
            ]) => token,
          ),
          group.color,
        ],
      ),
      ...strikeoutPropertyTokens,
      XMLToken.STYLE_TEXT_OUTLINE,
      XMLToken.FO_COLOR,
      XMLToken.STYLE_USE_WINDOW_FONT_COLOR,
    ],
    "Calc text properties",
  );
  importStrikeoutProperties(pattern, attributes, unsupported);
  importFontEffectProperties(pattern, attributes, unsupported);
  const fontColor = (pattern.GetItem(109) as SvxColorItem).Clone(),
    fontValue = new Any();
  let hasFontColor = false;
  try {
    // Native property merging starts without an inherited AUTO sentinel; an explicit AUTO wins every later RGB entry.
    for (const [token, source] of attributes) {
      if (token === XMLToken.FO_COLOR) {
        if (colorAuto.importXML(source, fontValue, unitConverter)) hasFontColor = true;
        else {
          const prior: [number] = [0];
          if (!fontValue.extract(prior, "sal_Int32") || prior[0] !== -1)
            unsupported("invalid cell font color");
        }
      }
      if (token === XMLToken.STYLE_USE_WINDOW_FONT_COLOR) {
        isColorAuto.importXML(source, fontValue, unitConverter);
        hasFontColor = true;
      }
    }
    const color = new Color();
    if (hasFontColor && extractColor(fontValue, color)) {
      fontColor.setColor(color);
      pattern.ItemSetPut(fontColor);
    }
  } finally {
    fontValue.dispose();
  }
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
    for (const group of lineGroups) {
      value.clear();
      const line = (pattern.GetItem(group.which) as SvxTextLineItem).Clone();
      let applied = false;
      for (const [token, source] of attributes) {
        const property = group.properties.find(
          /** Finds a native line property in actual SAX order. @param property - Mapping. @returns Whether matching. */ ([
            entry,
          ]) => entry === token,
        );
        if (property !== undefined) {
          if (property[2].importXML(source, value, unitConverter)) {
            line.PutValue(value, MID_TL_STYLE);
            applied = true;
          } else unsupported(`invalid cell ${group.name} property`);
        }
        if (token === group.color) {
          if (lineColor.importXML(source, value, unitConverter)) line.PutValue(value, MID_TL_COLOR);
          lineHasColor.importXML(source, value, unitConverter);
          line.PutValue(value, MID_TL_HASCOLOR);
          applied = true;
        }
      }
      if (applied) pattern.ItemSetPut(line);
    }
  } finally {
    value.dispose();
  }
}

/** Emits the original table-cell background property group. @param pattern - Native pattern. @returns Cell-property attributes. */
export function exportCellProperties(pattern: ScPatternAttr): string {
  let result = exportCellBorderProperties(pattern);
  const alignmentValue = new Any(),
    alignmentOutput: [string] = [""];
  try {
    if (pattern.GetItemSet().GetItemState(129, false) === SfxItemState.SET) {
      (pattern.GetItem(129) as SvxHorJustifyItem).QueryValue(alignmentValue);
      horiSource.exportXML(alignmentOutput, alignmentValue, unitConverter);
      result += ` style:text-align-source="${alignmentOutput[0]}"`;
      horiRepeat.exportXML(alignmentOutput, alignmentValue, unitConverter);
      result += ` style:repeat-content="${alignmentOutput[0]}"`;
    }
    if (pattern.GetItemSet().GetItemState(132, false) === SfxItemState.SET) {
      (pattern.GetItem(132) as SvxVerJustifyItem).QueryValue(alignmentValue);
      // Native QueryValue always supplies a mapped CellVertJustify2 signed32 value here.
      vertJustify.exportXML(alignmentOutput, alignmentValue, unitConverter);
      result += ` style:vertical-align="${alignmentOutput[0]}"`;
    }
  } finally {
    alignmentValue.dispose();
  }
  if (pattern.GetItemSet().GetItemState(148, false) !== SfxItemState.SET) return result;
  const brush = pattern.GetItem(148) as SvxBrushItem,
    value = new Any(),
    output: [string] = [""];
  try {
    brush.QueryValue(value, MID_GRAPHIC_TRANSPARENT);
    backgroundTransparent.exportXML(output, value, unitConverter);
    brush.QueryValue(value, MID_BACK_COLOR);
    backgroundColor.exportXML(output, value, unitConverter);
    return result + ` fo:background-color="${output[0]}"`;
  } finally {
    value.dispose();
  }
}
/** Imports original background and alignment properties into real items/shared Any. @param pattern - Actual item destination. @param attributes - SAX attributes. @param unsupported - Diagnostic port. @param horizontal - Style-owned merged horizontal property. @returns Nothing. */
export function importCellProperties(
  pattern: ScPatternAttr,
  attributes: FastAttributeList,
  unsupported: (name: string) => void,
  horizontal: Any,
): void {
  attributes.assertOnly(
    [
      ...cellBorderTokens,
      XMLToken.FO_BACKGROUND_COLOR,
      XMLToken.STYLE_TEXT_ALIGN_SOURCE,
      XMLToken.STYLE_REPEAT_CONTENT,
      XMLToken.STYLE_VERTICAL_ALIGN,
    ],
    "Calc cell properties",
  );
  importCellBorderProperties(pattern, attributes, unsupported);
  for (const [token, source] of attributes) {
    const handler =
      token === XMLToken.STYLE_TEXT_ALIGN_SOURCE
        ? horiSource
        : token === XMLToken.STYLE_REPEAT_CONTENT
          ? horiRepeat
          : undefined;
    if (handler && !handler.importXML(source, horizontal, unitConverter))
      unsupported("invalid cell horizontal alignment");
    if (token === XMLToken.STYLE_VERTICAL_ALIGN) {
      const value = new Any();
      try {
        if (vertJustify.importXML(source, value, unitConverter)) {
          const item = new SvxVerJustifyItem(132);
          item.PutValue(value);
          pattern.ItemSetPut(item);
        } else unsupported("invalid cell vertical alignment");
      } finally {
        value.dispose();
      }
    }
  }
  const source = attributes.get(XMLToken.FO_BACKGROUND_COLOR);
  if (source === null) return;
  const brush = (pattern.GetItem(148) as SvxBrushItem).Clone(),
    value = new Any();
  try {
    if (backgroundColor.importXML(source, value, unitConverter))
      brush.PutValue(value, MID_BACK_COLOR);
    else if (source !== "transparent") unsupported("invalid cell background color");
    backgroundTransparent.importXML(source, value, unitConverter);
    brush.PutValue(value, MID_GRAPHIC_TRANSPARENT);
    pattern.ItemSetPut(brush);
  } finally {
    value.dispose();
  }
}

/** Shared original horizontal enum Any equality. @param left - First property. @param right - Second property. @returns Typed equality. */
function equalHori(left: Any, right: Any): boolean {
  const a: [number] = [0],
    b: [number] = [0];
  return left.extract(a, horiType) && right.extract(b, horiType) && a[0] === b[0];
}
/** Original paragraph horizontal-alignment handler,including REPEAT precedence. */
export class XmlScPropHdl_HoriJustify {
  /** Compares real enum Any values. @param left - First. @param right - Second. @returns Equality. */
  equals(left: Any, right: Any): boolean {
    return equalHori(left, right);
  }
  /** Imports native start/end/center/justify with original repeat guard. @param input - XML. @param value - Merged property. @param converter - Unused source converter. @returns Native success. */
  importXML(input: string, value: Any, converter: SvXMLUnitConverter): boolean {
    void converter;
    const current: [number] = [HJ.LEFT];
    value.extract(current, horiType);
    if (current[0] === HJ.REPEAT) return true;
    let selected: HJ;
    if (input === "start") selected = HJ.LEFT;
    else if (input === "end") selected = HJ.RIGHT;
    else if (input === "center") selected = HJ.CENTER;
    else if (input === "justify") selected = HJ.BLOCK;
    else return false;
    value.insert([selected], horiType);
    return true;
  }
  /** Exports original lexical mapping without modifying failed output. @param output - XML destination. @param value - Enum Any. @param converter - Unused source converter. @returns Success. */
  exportXML(output: [string], value: Any, converter: SvXMLUnitConverter): boolean {
    void converter;
    const current: [number] = [0];
    if (!value.extract(current, horiType)) return false;
    switch (current[0]) {
      case HJ.REPEAT:
      case HJ.LEFT:
        output[0] = "start";
        break;
      case HJ.RIGHT:
        output[0] = "end";
        break;
      case HJ.CENTER:
        output[0] = "center";
        break;
      case HJ.BLOCK:
        output[0] = "justify";
        break;
      default:
        return false;
    }
    return true;
  }
}
/** Original horizontal source property handler. */
export class XmlScPropHdl_HoriJustifySource {
  /** Original typed enum equality. @param left - First. @param right - Second. @returns Equality. */
  equals(left: Any, right: Any): boolean {
    return equalHori(left, right);
  }
  /** Fix preserves even a void Any;value-type writes Standard. @param input - XML. @param value - Merged property. @param converter - Unused source converter. @returns Success. */
  importXML(input: string, value: Any, converter: SvXMLUnitConverter): boolean {
    void converter;
    if (input === "fix") return true;
    if (input !== "value-type") return false;
    value.insert([HJ.STANDARD], horiType);
    return true;
  }
  /** Exports original value-type/fix distinction. @param output - XML. @param value - Typed enum. @param converter - Unused source converter. @returns Success. */
  exportXML(output: [string], value: Any, converter: SvXMLUnitConverter): boolean {
    void converter;
    const current: [number] = [0];
    if (!value.extract(current, horiType)) return false;
    output[0] = current[0] === HJ.STANDARD ? "value-type" : "fix";
    return true;
  }
}
/** Original horizontal repeat property handler. */
export class XmlScPropHdl_HoriJustifyRepeat {
  /** Original typed enum equality. @param left - First. @param right - Second. @returns Equality. */
  equals(left: Any, right: Any): boolean {
    return equalHori(left, right);
  }
  /** False preserves the existing Any;true sets REPEAT. @param input - XML. @param value - Merged property. @param converter - Unused converter. @returns Success. */
  importXML(input: string, value: Any, converter: SvXMLUnitConverter): boolean {
    void converter;
    if (input === "false") return true;
    if (input !== "true") return false;
    value.insert([HJ.REPEAT], horiType);
    return true;
  }
  /** Exports source repeat test. @param output - XML. @param value - Native enum. @param converter - Unused converter. @returns Success. */
  exportXML(output: [string], value: Any, converter: SvXMLUnitConverter): boolean {
    void converter;
    const current: [number] = [0];
    if (!value.extract(current, horiType)) return false;
    output[0] = current[0] === HJ.REPEAT ? "true" : "false";
    return true;
  }
}
/** Original vertical alignment property handler over signed32 Any. */
export class XmlScPropHdl_VertJustify {
  /** Original signed32 equality. @param left - First. @param right - Second. @returns Equality. */
  equals(left: Any, right: Any): boolean {
    const a: [number] = [0],
      b: [number] = [0];
    return left.extract(a, "sal_Int32") && right.extract(b, "sal_Int32") && a[0] === b[0];
  }
  /** Imports exact native XML values. @param input - XML. @param value - Destination. @param converter - Unused converter. @returns Success. */
  importXML(input: string, value: Any, converter: SvXMLUnitConverter): boolean {
    void converter;
    let selected: number;
    if (input === "automatic") selected = VJ.STANDARD;
    else if (input === "bottom") selected = VJ.BOTTOM;
    else if (input === "top") selected = VJ.TOP;
    else if (input === "middle") selected = VJ.CENTER;
    else if (input === "justify") selected = VJ.BLOCK;
    else return false;
    value.insert([selected], "sal_Int32");
    return true;
  }
  /** Exports the native lexical switch. @param output - XML. @param value - Signed32 Any. @param converter - Unused converter. @returns Success. */
  exportXML(output: [string], value: Any, converter: SvXMLUnitConverter): boolean {
    void converter;
    const current: [number] = [0];
    if (!value.extract(current, "sal_Int32")) return false;
    switch (current[0]) {
      case VJ.BOTTOM:
        output[0] = "bottom";
        break;
      case VJ.CENTER:
        output[0] = "middle";
        break;
      case VJ.STANDARD:
        output[0] = "automatic";
        break;
      case VJ.TOP:
        output[0] = "top";
        break;
      case VJ.BLOCK:
        output[0] = "justify";
        break;
      default:
        return false;
    }
    return true;
  }
}
const horiJustify = new XmlScPropHdl_HoriJustify(),
  horiSource = new XmlScPropHdl_HoriJustifySource(),
  horiRepeat = new XmlScPropHdl_HoriJustifyRepeat(),
  vertJustify = new XmlScPropHdl_VertJustify();
/** Exports the original paragraph-property group. @param pattern - Actual native pattern. @returns XML attributes. */
export function exportCellParagraphProperties(pattern: ScPatternAttr): string {
  const indentValue = new Any(),
    indentOutput: [string] = [""],
    measure = new XMLMeasurePropHdl(2),
    metric = new SvXMLUnitConverter("mm100");
  let indent = "";
  try {
    if (pattern.GetItemSet().GetItemState(131, false) === SfxItemState.SET) {
      const hmm = Number(
        convertTwipToMm100(BigInt((pattern.GetItem(131) as ScIndentItem).GetValue())),
      );
      indentValue.insert([((hmm + 32768) & 0xffff) - 32768], "sal_Int16");
      if (measure.exportXML(indentOutput, indentValue, metric))
        indent = ` fo:margin-left="${indentOutput[0]}"`;
    }
  } finally {
    indentValue.dispose();
  }
  if (pattern.GetItemSet().GetItemState(129, false) !== SfxItemState.SET) return indent;
  const value = new Any(),
    output: [string] = [""];
  try {
    (pattern.GetItem(129) as SvxHorJustifyItem).QueryValue(value);
    return (
      indent +
      (horiJustify.exportXML(output, value, unitConverter) ? ` fo:text-align="${output[0]}"` : "")
    );
  } finally {
    value.dispose();
  }
}
/** Imports the native paragraph side of the merged horizontal property. @param pattern - Native destination pattern. @param attributes - Actual SAX attributes. @param horizontal - Style-owned shared merged Any. @param unsupported - Import diagnostic. @returns Nothing. */
export function importCellParagraphProperties(
  pattern: ScPatternAttr,
  attributes: FastAttributeList,
  horizontal: Any,
  unsupported: (name: string) => void,
): void {
  attributes.assertOnly(
    [XMLToken.FO_TEXT_ALIGN, XMLToken.FO_MARGIN_LEFT],
    "Calc paragraph properties",
  );
  const indent = attributes.get(XMLToken.FO_MARGIN_LEFT);
  if (indent !== null) {
    const value = new Any(),
      number: [number] = [0];
    try {
      if (
        new XMLMeasurePropHdl(2).importXML(indent, value, new SvXMLUnitConverter("mm100")) &&
        value.extract(number, "sal_Int16")
      )
        pattern.ItemSetPut(
          new ScIndentItem(Number(toTwips(BigInt(number[0]), Length.mm100)) & 0xffff),
        );
      else unsupported("invalid cell indentation");
    } finally {
      value.dispose();
    }
  }
  const source = attributes.get(XMLToken.FO_TEXT_ALIGN);
  if (source !== null && !horiJustify.importXML(source, horizontal, unitConverter))
    unsupported("invalid cell paragraph alignment");
}
