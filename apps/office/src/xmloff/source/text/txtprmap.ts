/** @fileoverview Consumed native text character property map and handler transport from txtprmap.cxx; no browser boolean formatting model or substitute UNO provider. */
import { PropertyValue } from "../../../udkapi/com/sun/star/beans/PropertyValue";
import { PropertyState } from "../../../udkapi/com/sun/star/beans/PropertyState";

import { XMLEscapementPropHdl, XMLEscapementHeightPropHdl } from "../style/escphdl";

import {
  XMLCrossedOutStylePropHdl,
  XMLCrossedOutTypePropHdl,
  XMLCrossedOutWidthPropHdl,
  XMLCrossedOutTextPropHdl,
} from "../style/cdouthdl";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { UnknownPropertyException } from "../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import {
  BorderLine2,
  cppu_detail_getUnoType_BorderLine2,
} from "../../../offapi/com/sun/star/table/BorderLine2";
import { XMLBorderHdl, XMLBorderWidthHdl } from "../style/bordrhdl";
import { cppu_detail_getUnoType_FontSlant as slantType } from "../../../offapi/com/sun/star/awt/FontSlant";
import type { FastAttributeList } from "../core/xmlimp";
import { XMLToken as T } from "../core/xmltoken";
import { SvXMLUnitConverter } from "../core/xmluconv";
import { XMLColorTransparentPropHdl, XMLIsTransparentPropHdl } from "../style/xmlbahdl";
import { XMLFontWeightPropHdl } from "../style/weighhdl";
import { XMLNamedBoolPropertyHdl } from "../style/NamedBoolPropertyHdl";
import { XMLBoolPropHdl } from "../style/xmlbahdl";
import { XMLPosturePropHdl } from "../style/postuhdl";
import {
  XMLUnderlineStylePropHdl,
  XMLUnderlineTypePropHdl,
  XMLUnderlineWidthPropHdl,
} from "../style/undlihdl";
import type { OdfCharacterProperties } from "./txtparae.types";
/** Stateless original handlers and actual owning core unit. */
const underlineColor = new XMLColorTransparentPropHdl("font-color"),
  underlineHasColor = new XMLIsTransparentPropHdl("font-color", false);
const escapement = new XMLEscapementPropHdl(),
  escapementHeight = new XMLEscapementHeightPropHdl();
const weight = new XMLFontWeightPropHdl(),
  posture = new XMLPosturePropHdl(),
  converter = new SvXMLUnitConverter("twip");
/** Independent source CharWeight/CharPosture associations; floats and typed FontSlant are retained. */
const scriptProperties = [
  [T.FO_FONT_WEIGHT, "fo:font-weight", "fontWeight", weight, "float"],
  [T.STYLE_FONT_WEIGHT_ASIAN, "style:font-weight-asian", "fontWeightAsian", weight, "float"],
  [T.STYLE_FONT_WEIGHT_COMPLEX, "style:font-weight-complex", "fontWeightComplex", weight, "float"],
  [T.FO_FONT_STYLE, "fo:font-style", "fontPosture", posture, slantType],
  [T.STYLE_FONT_STYLE_ASIAN, "style:font-style-asian", "fontPostureAsian", posture, slantType],
  [
    T.STYLE_FONT_STYLE_COMPLEX,
    "style:font-style-complex",
    "fontPostureComplex",
    posture,
    slantType,
  ],
] as const;
/** Native multi-property underline mapping order. */
const lineProperties = [
  [T.STYLE_TEXT_UNDERLINE_STYLE, "style:text-underline-style", new XMLUnderlineStylePropHdl()],
  [T.STYLE_TEXT_UNDERLINE_TYPE, "style:text-underline-type", new XMLUnderlineTypePropHdl()],
  [T.STYLE_TEXT_UNDERLINE_WIDTH, "style:text-underline-width", new XMLUnderlineWidthPropHdl()],
] as const;
/** Original chained CharStrikeout style/type/width/text associations. */
const strikeoutProperties = [
  [
    T.STYLE_TEXT_LINE_THROUGH_STYLE,
    "style:text-line-through-style",
    new XMLCrossedOutStylePropHdl(),
  ],
  [T.STYLE_TEXT_LINE_THROUGH_TYPE, "style:text-line-through-type", new XMLCrossedOutTypePropHdl()],
  [
    T.STYLE_TEXT_LINE_THROUGH_WIDTH,
    "style:text-line-through-width",
    new XMLCrossedOutWidthPropHdl(),
  ],
  [T.STYLE_TEXT_LINE_THROUGH_TEXT, "style:text-line-through-text", new XMLCrossedOutTextPropHdl()],
] as const;
/** Native merged CharWordMode map and exact XML_TYPE_BOOL association. */
const wordMode = new XMLNamedBoolPropertyHdl("skip-white-space", "continuous"),
  autoKerning = new XMLBoolPropHdl();
const boolProperties = [
  [T.STYLE_TEXT_UNDERLINE_MODE, "style:text-underline-mode", "wordMode", wordMode],
  [T.STYLE_TEXT_OVERLINE_MODE, "style:text-overline-mode", "wordMode", wordMode],
  [T.STYLE_TEXT_LINE_THROUGH_MODE, "style:text-line-through-mode", "wordMode", wordMode],
  [T.STYLE_LETTER_KERNING, "style:letter-kerning", "autoKerning", autoKerning],
] as const;
/** Tokens consumed by this bounded source property map. */
export const textCharacterPropertyTokens = [
  ...scriptProperties.map(
    /** Selects a native property token. @param entry - Mapping. @returns Token. */ ([token]) =>
      token,
  ),
  ...lineProperties.map(
    /** Selects a native property token. @param entry - Mapping. @returns Token. */ ([token]) =>
      token,
  ),
  ...strikeoutProperties.map(
    /** Reads the original decoration token. @param entry - Mapping. @returns Token. */
    ([token]) => token,
  ),
  T.STYLE_TEXT_UNDERLINE_COLOR,
  T.STYLE_TEXT_POSITION,
  ...boolProperties.map(
    /** Reads original bool property tokens. @param entry - Entry. @returns Token. */ ([token]) =>
      token,
  ),
];
/** Emits original handler output from native UNO scalar values. @param properties - Filter handoff. @returns Attribute fragment. */
export function exportTextCharacterProperties(properties: OdfCharacterProperties): string {
  const value = new Any(),
    output: [string] = [""];
  let result = "";
  try {
    for (const [, name, key, handler] of boolProperties) {
      if (properties[key] !== undefined) {
        value.insert([properties[key]], "bool");
        handler.exportXML(output, value, converter);
        result += ` ${name}="${output[0]}"`;
      }
    }
    for (const [, name, key, handler, type] of scriptProperties) {
      const scalar = properties[key];
      if (scalar === undefined) continue;
      value.insert([scalar], type);
      if (handler.exportXML(output, value, converter)) result += ` ${name}="${output[0]}"`;
    }
    if (properties.escapement !== undefined || properties.escapementHeight !== undefined) {
      output[0] = "";
      if (properties.escapement !== undefined) {
        value.insert([properties.escapement], "sal_Int16");
        escapement.exportXML(output, value, converter);
      }
      if (properties.escapementHeight !== undefined) {
        value.insert([(properties.escapementHeight << 24) >> 24], "sal_Int8");
        escapementHeight.exportXML(output, value, converter);
      }
      // At least one native signed scalar was inserted above; both original handlers necessarily emit numeric text.
      result += ` style:text-position="${output[0]}"`;
    }
    if (properties.strikeout !== undefined) {
      value.insert([properties.strikeout], "sal_Int16");
      for (const [, name, handler] of strikeoutProperties)
        if (handler.exportXML(output, value, converter)) result += ` ${name}="${output[0]}"`;
    }
    if (properties.underlineStyle !== undefined) {
      value.insert([properties.underlineStyle], "sal_Int16");
      for (const [, name, handler] of lineProperties)
        if (handler.exportXML(output, value, converter)) result += ` ${name}="${output[0]}"`;
    }
    // XMLTextExportPropertySetMapper::ContextFilter suppresses color without a visible line.
    if (properties.underlineStyle !== undefined && properties.underlineStyle !== 0) {
      output[0] = "";
      if (properties.underlineHasColor !== undefined) {
        value.insert([properties.underlineHasColor], "bool");
        underlineHasColor.exportXML(output, value, converter);
      }
      if (properties.underlineColor !== undefined) {
        value.insert([properties.underlineColor], "sal_Int32");
        underlineColor.exportXML(output, value, converter);
      }
      if (output[0] !== "") result += ` style:text-underline-color="${output[0]}"`;
    }
    return result;
  } finally {
    value.dispose();
  }
}
/** Imports native scalar properties, merging underline attributes in actual SAX order. @param attributes - Original source order. @returns Successful property conversions. */
export function importTextCharacterProperties(
  attributes: FastAttributeList,
): Partial<OdfCharacterProperties> {
  const result: Record<string, number | boolean> = {},
    value = new Any(),
    line = new Any(),
    crossedOut = new Any();
  try {
    for (const [token, text] of attributes) {
      const boolean = boolProperties.find(
        /** Reads the original bool mapping. @param entry - Entry. @returns Match. */ ([item]) =>
          item === token,
      );
      if (boolean !== undefined) {
        if (boolean[3].importXML(text, value, converter)) {
          const scalar: [boolean] = [false];
          value.extract(scalar, "bool");
          result[boolean[2]] = scalar[0];
        }
        continue;
      }
      const script = scriptProperties.find(
        /** Finds one source property entry. @param entry - Mapping. @returns Token equality. */ ([
          item,
        ]) => item === token,
      );
      if (script !== undefined) {
        const [, , key, handler, type] = script;
        if (handler.importXML(text, value, converter)) {
          const scalar: [number] = [0];
          value.extract(scalar, type);
          result[key] = scalar[0];
        }
        continue;
      }
      if (token === T.STYLE_TEXT_POSITION) {
        const scalar: [number] = [0];
        if (escapement.importXML(text, value, converter)) {
          value.extract(scalar, "sal_Int16");
          result.escapement = scalar[0];
        }
        if (escapementHeight.importXML(text, value, converter)) {
          value.extract(scalar, "sal_Int8");
          result.escapementHeight = scalar[0];
        }
      }
      const strikeout = strikeoutProperties.find(
        /** Resolves one chained strikeout property. @param entry - Mapping. @returns Match. */
        ([item]) => item === token,
      );
      if (strikeout !== undefined && strikeout[2].importXML(text, crossedOut, converter)) {
        const scalar: [number] = [0];
        crossedOut.extract(scalar, "sal_Int16");
        result.strikeout = scalar[0];
      }
      const underline = lineProperties.find(
        /** Finds a line property. @param entry - Mapping. @returns Token equality. */ ([item]) =>
          item === token,
      );
      if (underline !== undefined && underline[2].importXML(text, line, converter)) {
        const scalar: [number] = [0];
        line.extract(scalar, "sal_Int16");
        result.underlineStyle = scalar[0];
      }
      if (token === T.STYLE_TEXT_UNDERLINE_COLOR) {
        const color: [number] = [0],
          hasColor: [boolean] = [false];
        if (underlineColor.importXML(text, value, converter)) {
          value.extract(color, "sal_Int32");
          result.underlineColor = color[0];
        }
        underlineHasColor.importXML(text, value, converter);
        value.extract(hasColor, "bool");
        result.underlineHasColor = hasColor[0];
      }
    }
    return result as Partial<OdfCharacterProperties>;
  } finally {
    value.dispose();
    line.dispose();
    crossedOut.dispose();
  }
}

/** Original import property map output targets the shared XPropertySet contract. */
import type { XMLAutoStyleFamily, XMLPropertySet } from "../../inc/txtimp";
import type { XMLParagraphImportProperties } from "./txtparai";
import type { OdfParagraphAlignment } from "./txtparae";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { convertTwipToMm100 } from "../../../tools/inc/UnitConversion";
import { getFontFamilyFromGeneric } from "../style/fonthdl";
import {
  LineSpacing,
  cppu_detail_getUnoType_LineSpacing as lineType,
} from "../../../offapi/com/sun/star/style/LineSpacing";
import { cppu_detail_getUnoType_BreakType as breakType } from "../../../offapi/com/sun/star/style/BreakType";
import { cppu_detail_getUnoType_TabStop as stopType } from "../../../offapi/com/sun/star/style/TabStop";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { UnoTypeArgument } from "../../../cppu/inc/unotype";
/** Native UTF16 string construction at the parser/API boundary. @param value - Parsed XML text. @returns Owned string. */
export function xmlTextString(value: string): OUString {
  const units = new Uint16Array(value.length);
  for (let i = 0; i < value.length; i++) units[i] = value.charCodeAt(i);
  return new OUString(units, units.length);
}
/** Projects native member offsets used by Sequence<TabStop>. */
interface TabStopAddress {
  get(offset: number): [number];
}
/** Original generated compound stride, consumed through the existing CPPU sequence owner. */
const ImportTabStops = Sequence.specialize<TabStopAddress>(stopType, 12);
/** Applies parsed XML properties as native API values, leaving canonical item construction to Writer. @param target - Actual property owner. @param character - Character deltas. @param paragraph - Paragraph deltas. @param alignment - Optional paragraph alignment. @param leftMargin - Optional text-left margin in twips. @returns Nothing.  @param autoFamily - Native operation input. */
export function applyTextImportProperties(
  target: XMLPropertySet,
  character: Partial<OdfCharacterProperties> = {},
  paragraph: XMLParagraphImportProperties = {},
  alignment?: OdfParagraphAlignment,
  leftMargin?: number,
  autoFamily?: XMLAutoStyleFamily,
): void {
  const names: OUString[] = [],
    values: Any[] = [];
  /** Appends one original typed property value. @param name - Native name. @param value - Parsed scalar. @param type - Native declared type. @returns Nothing. */
  function add(name: string, value: unknown, type: UnoTypeArgument): void {
    names.push(xmlTextString(name));
    if (type === "OUString") {
      const string = xmlTextString(value as string);
      try {
        values.push(new Any(string.getDataAddress(), type));
      } finally {
        string.dispose();
      }
    } else if (type === cppu_detail_getUnoType_BorderLine2) values.push(new Any(value, type));
    else values.push(new Any([value], type));
  }
  /** Converts parsed twips to original API MM100 with integer native rounding. @param value - Twips. @returns MM100. */
  function mm(value: number): number {
    return Number(convertTwipToMm100(BigInt(value)));
  }
  try {
    for (const suffix of ["", "Asian", "Complex"] as const) {
      const family = character[`fontFamily${suffix}`];
      if (family !== undefined) {
        add(`CharFontName${suffix}`, family, "OUString");
        add(
          `CharFontFamily${suffix}`,
          getFontFamilyFromGeneric(character[`fontFamilyGeneric${suffix}`]),
          "sal_Int16",
        );
        add(`CharFontStyleName${suffix}`, character[`fontStyleName${suffix}`] ?? "", "OUString");
        add(`CharFontPitch${suffix}`, character[`fontPitch${suffix}`] ?? 0, "sal_Int16");
        add(`CharFontCharSet${suffix}`, character[`fontCharSet${suffix}`] ?? 0, "sal_Int16");
      }
      const height = character[`fontSizeTwips${suffix}`];
      if (height !== undefined) add(`CharHeight${suffix}`, height / 20, "float");
      const weight = character[`fontWeight${suffix}`],
        posture = character[`fontPosture${suffix}`];
      if (weight !== undefined) add(`CharWeight${suffix}`, weight, "float");
      if (posture !== undefined) add(`CharPosture${suffix}`, posture, slantType);
    }
    for (const [key, name] of [
      ["color", "CharColor"],
      ["highlight", "CharHighlight"],
    ] as const) {
      const value = character[key];
      if (value !== undefined)
        add(
          name,
          value === "auto" || value === "automatic" || value === "transparent"
            ? -1
            : parseInt(value.replace("#", ""), 16),
          "sal_Int32",
        );
    }
    for (const [key, name, type] of [
      ["strikeout", "CharStrikeout", "sal_Int16"],
      ["escapement", "CharEscapement", "sal_Int16"],
      ["escapementHeight", "CharEscapementHeight", "sal_Int8"],
      ["underlineStyle", "CharUnderline", "sal_Int16"],
      ["underlineColor", "CharUnderlineColor", "sal_Int32"],
      ["underlineHasColor", "CharUnderlineHasColor", "bool"],
      ["wordMode", "CharWordMode", "bool"],
      ["autoKerning", "CharAutoKerning", "bool"],
    ] as const)
      if (character[key] !== undefined) add(name, character[key], type);
    if (alignment !== undefined)
      add(
        "ParaAdjust",
        alignment === "center" ? 3 : alignment === "right" ? 6 : alignment === "justify" ? 2 : 5,
        "sal_Int16",
      );
    if (leftMargin !== undefined) add("ParaLeftMargin", mm(leftMargin), "sal_Int32");
    for (const [key, name] of [
      ["firstLineIndent", "ParaFirstLineIndent"],
      ["rightMargin", "ParaRightMargin"],
      ["upperSpacing", "ParaTopMargin"],
      ["lowerSpacing", "ParaBottomMargin"],
    ] as const)
      if (paragraph[key] !== undefined) add(name, mm(paragraph[key]), "sal_Int32");
    for (const [key, name] of [
      ["autoTextIndent", "ParaIsAutoFirstLineIndent"],
      ["contextualSpacing", "ParaContextMargin"],
      ["countLineNumbers", "ParaLineNumberCount"],
      ["keepWithNext", "ParaKeepTogether"],
    ] as const)
      if (paragraph[key] !== undefined) add(name, paragraph[key], "bool");
    if (paragraph.keepTogether !== undefined) add("ParaSplit", !paragraph.keepTogether, "bool");
    if (paragraph.joinBorder !== undefined) add("ParaConnectBorder", paragraph.joinBorder, "bool");
    for (const side of ["Top", "Bottom", "Left", "Right"] as const) {
      const rawBorder = paragraph[`border${side}`];
      const rawWidth = paragraph[`borderLineWidth${side}`];
      if (rawBorder === undefined) continue;
      const target = { value: new BorderLine2() };
      if (!new XMLBorderHdl().importXML(rawBorder, target))
        throw new Error(`Unsupported ODF paragraph border: ${rawBorder}`);
      if (rawWidth !== undefined && !new XMLBorderWidthHdl().importXML(rawWidth, target))
        throw new Error(`Unsupported ODF paragraph border widths: ${rawWidth}`);
      add(`Para${side}Border`, target.value, cppu_detail_getUnoType_BorderLine2);
    }
    for (const [key, name] of [
      ["orphans", "ParaOrphans"],
      ["widows", "ParaWidows"],
    ] as const)
      if (paragraph[key] !== undefined) add(name, (paragraph[key] << 24) >> 24, "sal_Int8");
    if (paragraph.pageStyleName !== undefined)
      add("PageDescName", paragraph.pageStyleName, "OUString");
    if (paragraph.pageNumber !== undefined) {
      names.push(xmlTextString("PageNumberOffset"));
      values.push(
        paragraph.pageNumber === "auto"
          ? new Any()
          : new Any([(paragraph.pageNumber << 16) >> 16], "sal_Int16"),
      );
    }
    if (paragraph.breakBefore !== undefined || paragraph.breakAfter !== undefined)
      add(
        "BreakType",
        paragraph.breakBefore === "page" && paragraph.breakAfter === "page"
          ? 6
          : paragraph.breakBefore === "page"
            ? 4
            : paragraph.breakAfter === "page"
              ? 5
              : 0,
        breakType,
      );
    const line =
      paragraph.lineHeightTwips ??
      paragraph.lineHeightAtLeastTwips ??
      paragraph.lineSpacingTwips ??
      paragraph.lineHeightPercent;
    if (line !== undefined) {
      const mode =
        paragraph.lineHeightTwips !== undefined
          ? 3
          : paragraph.lineHeightAtLeastTwips !== undefined
            ? 1
            : paragraph.lineSpacingTwips !== undefined
              ? 2
              : 0;
      names.push(xmlTextString("ParaLineSpacing"));
      values.push(new Any(new LineSpacing(mode, mode === 0 ? line : mm(line)), lineType));
    }
    if (paragraph.tabStopDetails !== undefined) {
      const sequence = new ImportTabStops(paragraph.tabStopDetails.length);
      try {
        for (const [index, stop] of paragraph.tabStopDetails.entries()) {
          const value = sequence.operatorIndex(index);
          value.get(0)[0] = stop.position;
          value.get(4)[0] =
            stop.alignment === "right"
              ? 2
              : stop.alignment === "center"
                ? 1
                : stop.alignment === "char"
                  ? 3
                  : stop.alignment === "default"
                    ? 4
                    : 0;
          value.get(8)[0] = stop.decimal.charCodeAt(0);
          value.get(10)[0] = stop.fill.charCodeAt(0);
        }
        names.push(xmlTextString("ParaTabStops"));
        values.push(new Any(sequence.getAddress(), ["Sequence", stopType]));
      } finally {
        sequence.dispose();
      }
    }
    if (names.length && autoFamily) {
      const properties = names.map(
        /** Applies this source-owned operation. @param name - Native input. @param index - Native input. @returns Native result. */ (
          name,
          index,
        ) => new PropertyValue(name, -1, values[index] as Any, PropertyState.DIRECT_VALUE),
      );
      const key = xmlTextString("CharAutoStyleName");
      try {
        const style = autoFamily.insertStyle(properties),
          value = style.getPropertyValue(key);
        try {
          target.setPropertyValue(key, value);
        } finally {
          value.dispose();
        }
      } finally {
        key.dispose();
        for (const property of properties) {
          property.Name.dispose();
          property.Value.dispose();
        }
      }
    } else if (names.length) {
      try {
        target.setPropertyValues(names, values);
      } catch (error) {
        if (!(error instanceof Exception)) throw error;
        error.dispose();
        // Native FillPropertySet retries individual properties after the multi-set fails.
        for (let i = 0; i < names.length; i++) {
          try {
            target.setPropertyValue(names[i] as OUString, values[i] as Any);
          } catch (failure) {
            if (
              !(failure instanceof IllegalArgumentException) &&
              !(failure instanceof UnknownPropertyException)
            )
              throw failure;
            failure.dispose();
          }
        }
      }
    }
  } finally {
    for (const name of names) name.dispose();
    for (const value of values) value.dispose();
  }
}
