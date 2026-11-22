/** @fileoverview Consumed native text character property map and handler transport from txtprmap.cxx; no browser boolean formatting model or substitute UNO provider. */
import { cppu_detail_getUnoType_FillStyle } from "../../../offapi/com/sun/star/drawing/FillStyle";
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
import { XMLBoolPropHdl, XMLNBoolPropHdl, XMLPercentPropHdl } from "../style/xmlbahdl";
import { XMLCaseMapPropHdl, XMLCaseMapVariantHdl } from "../style/csmaphdl";
import { XMLShadowedPropHdl } from "../style/shdwdhdl";
import { XMLConstantsPropertyHandler } from "../style/XMLConstantsPropertyHandler";
import { FontRelief } from "../../../offapi/com/sun/star/text/FontRelief";
import { XMLPosturePropHdl } from "../style/postuhdl";
import { XMLKerningPropHdl } from "../style/kernihdl";
import {
  XMLUnderlineStylePropHdl,
  XMLUnderlineTypePropHdl,
  XMLUnderlineWidthPropHdl,
} from "../style/undlihdl";
import { LanguageTag } from "../../../i18nlangtag/inc/languagetag";
import { text as nativeText } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { cppu_detail_getUnoType_Locale as localeType } from "../../../udkapi/com/sun/star/lang/Locale";
import { XMLCharLocale, exportCharLocale } from "../style/chrlohdl";
import type { OdfCharacterProperties } from "./txtparae.types";
import { createOdfThemeColor } from "./XMLComplexColorContext";
import { createXComplexColor } from "../../../docmodel/inc/uno/UnoComplexColor";
import { paragraphHyphenationMap } from "./txtprmap.hyphenation";
import { XComplexColor } from "../../../offapi/com/sun/star/util/XComplexColor";
import { escapeXml } from "./txtparae";
import {
  XMLTextCombineCharPropHdl,
  XMLTextEmphasizePropHdl,
  XMLTextRotationAnglePropHdl,
} from "./txtprhdl";
/** Stateless original handlers and actual owning core unit. */
const decorationColor = new XMLColorTransparentPropHdl("font-color"),
  decorationHasColor = new XMLIsTransparentPropHdl("font-color", false);
const escapement = new XMLEscapementPropHdl(),
  escapementHeight = new XMLEscapementHeightPropHdl();
const weight = new XMLFontWeightPropHdl(),
  posture = new XMLPosturePropHdl(),
  converter = new SvXMLUnitConverter("twip");
const kerning = new XMLKerningPropHdl();
const kerningConverter = new SvXMLUnitConverter("mm100");
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
/** Separate native properties that share the text-line handlers. */
const decorations = [
  {
    name: "underline",
    tokens: [
      T.STYLE_TEXT_UNDERLINE_STYLE,
      T.STYLE_TEXT_UNDERLINE_TYPE,
      T.STYLE_TEXT_UNDERLINE_WIDTH,
    ],
    colorToken: T.STYLE_TEXT_UNDERLINE_COLOR,
    style: "underlineStyle",
    color: "underlineColor",
    hasColor: "underlineHasColor",
  },
  {
    name: "overline",
    tokens: [T.STYLE_TEXT_OVERLINE_STYLE, T.STYLE_TEXT_OVERLINE_TYPE, T.STYLE_TEXT_OVERLINE_WIDTH],
    colorToken: T.STYLE_TEXT_OVERLINE_COLOR,
    style: "overlineStyle",
    color: "overlineColor",
    hasColor: "overlineHasColor",
  },
] as const;
const lineProperties = [
  ["style", new XMLUnderlineStylePropHdl()],
  ["type", new XMLUnderlineTypePropHdl()],
  ["width", new XMLUnderlineWidthPropHdl()],
] as const;
const effects = [
  [T.STYLE_TEXT_OUTLINE, "style:text-outline", "contoured", new XMLBoolPropHdl(), "bool"],
  [T.FO_TEXT_SHADOW, "fo:text-shadow", "shadowed", new XMLShadowedPropHdl(), "bool"],
  [
    T.STYLE_FONT_RELIEF,
    "style:font-relief",
    "relief",
    new XMLConstantsPropertyHandler(
      [
        ["none", FontRelief.NONE],
        ["engraved", FontRelief.ENGRAVED],
        ["embossed", FontRelief.EMBOSSED],
      ],
      null,
    ),
    "sal_Int16",
  ],
  [
    T.STYLE_TEXT_ROTATION_ANGLE,
    "style:text-rotation-angle",
    "rotation",
    new XMLTextRotationAnglePropHdl(),
    "sal_Int16",
  ],
  [
    T.STYLE_TEXT_EMPHASIZE,
    "style:text-emphasize",
    "emphasis",
    new XMLTextEmphasizePropHdl(),
    "sal_Int16",
  ],
  [T.STYLE_TEXT_SCALE, "style:text-scale", "scaleWidth", new XMLPercentPropHdl(2), "sal_Int16"],
  [T.FO_FONT_VARIANT, "fo:font-variant", "caseMap", new XMLCaseMapVariantHdl(), "sal_Int16"],
  [T.FO_TEXT_TRANSFORM, "fo:text-transform", "caseMap", new XMLCaseMapPropHdl(), "sal_uInt16"],
] as const;
const combineChar = new XMLTextCombineCharPropHdl();
const combineCharacters = [
  [T.STYLE_TEXT_COMBINE_START_CHAR, "style:text-combine-start-char", "combinePrefix"],
  [T.STYLE_TEXT_COMBINE_END_CHAR, "style:text-combine-end-char", "combineSuffix"],
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
  [T.STYLE_TEXT_BLINKING, "style:text-blinking", "flashing", new XMLBoolPropHdl()],
  [T.TEXT_DISPLAY, "text:display", "hidden", new XMLNamedBoolPropertyHdl("none", "true")],
  [T.FO_HYPHENATE, "fo:hyphenate", "noHyphenation", new XMLNBoolPropHdl()],
  [
    T.STYLE_TEXT_ROTATION_SCALE,
    "style:text-rotation-scale",
    "rotationFitsLine",
    new XMLNamedBoolPropertyHdl("fixed", "line-height"),
  ],
  [
    T.STYLE_TEXT_COMBINE,
    "style:text-combine",
    "combineLines",
    new XMLNamedBoolPropertyHdl("lines", "none"),
  ],
] as const;
/** Source merged CharLocale mappings for the three independent script families. */
const languageProperties = [
  [
    "",
    [
      [T.STYLE_RFC_LANGUAGE_TAG, "style:rfc-language-tag", "tag"],
      [T.FO_LANGUAGE, "fo:language", "language"],
      [T.FO_SCRIPT, "fo:script", "script"],
      [T.FO_COUNTRY, "fo:country", "country"],
    ],
  ],
  [
    "Asian",
    [
      [T.STYLE_RFC_LANGUAGE_TAG_ASIAN, "style:rfc-language-tag-asian", "tag"],
      [T.STYLE_LANGUAGE_ASIAN, "style:language-asian", "language"],
      [T.STYLE_SCRIPT_ASIAN, "style:script-asian", "script"],
      [T.STYLE_COUNTRY_ASIAN, "style:country-asian", "country"],
    ],
  ],
  [
    "Complex",
    [
      [T.STYLE_RFC_LANGUAGE_TAG_COMPLEX, "style:rfc-language-tag-complex", "tag"],
      [T.STYLE_LANGUAGE_COMPLEX, "style:language-complex", "language"],
      [T.STYLE_SCRIPT_COMPLEX, "style:script-complex", "script"],
      [T.STYLE_COUNTRY_COMPLEX, "style:country-complex", "country"],
    ],
  ],
] as const;
/** Original lexical inputs for the complete western, CJK and CTL locale members. */
export const textLanguagePropertyTokens = languageProperties.flatMap(
  /** Selects the script's native XML locale tokens. @param association - Source map row. @returns Locale tokens. */
  ([, properties]) =>
    properties.map(
      /** Selects the XML token. @param attribute - Native locale attribute. @returns Token. */
      ([token]) => token,
    ),
);
/** Tokens consumed by this bounded source property map. */
export const textCharacterPropertyTokens = [
  ...scriptProperties.map(
    /** Selects a native property token. @param entry - Mapping. @returns Token. */ ([token]) =>
      token,
  ),
  ...decorations.flatMap(
    /** Retains a decoration's native XML input tokens. @param entry - Decoration. @returns Tokens. */
    (entry) => [...entry.tokens, entry.colorToken],
  ),
  ...effects.map(
    /** Selects a native effect token. @param entry - Mapping. @returns Token. */ ([token]) =>
      token,
  ),
  T.STYLE_TEXT_COMBINE_START_CHAR,
  T.STYLE_TEXT_COMBINE_END_CHAR,
  ...strikeoutProperties.map(
    /** Reads the original decoration token. @param entry - Mapping. @returns Token. */
    ([token]) => token,
  ),
  T.STYLE_TEXT_POSITION,
  T.FO_LETTER_SPACING,
  ...boolProperties.map(
    /** Reads original bool property tokens. @param entry - Entry. @returns Token. */ ([token]) =>
      token,
  ),
  ...textLanguagePropertyTokens,
];
/** Collects all attributes of each native script locale in XML order. @param properties - Native text properties. @returns Qualified attribute/value pairs. */
export function exportTextLanguageProperties(
  properties: OdfCharacterProperties,
): readonly (readonly [string, string])[] {
  const result: [string, string][] = [];
  for (const [suffix, attributes] of languageProperties) {
    const language = properties[`language${suffix}`];
    if (language === undefined) continue;
    const parts = exportCharLocale(language);
    for (const [, name, field] of attributes) {
      const value = parts[field];
      if (value !== undefined) result.push([name, value]);
    }
  }
  return result;
}

/** Emits original handler output from native UNO scalar values. @param properties - Filter handoff. @param paragraphStyle - Whether to use the paragraph map. @returns Attribute fragment. */
export function exportTextCharacterProperties(
  properties: OdfCharacterProperties,
  paragraphStyle = false,
): string {
  const value = new Any(),
    output: [string] = [""];
  let result = "";
  try {
    if (properties.kerning !== undefined) {
      value.insert([properties.kerning], "sal_Int16");
      if (kerning.exportXML(output, value, kerningConverter))
        result += ` fo:letter-spacing="${output[0]}"`;
    }
    for (const [token, name, key, handler] of boolProperties) {
      if (paragraphStyle && token === T.FO_HYPHENATE) continue;
      if (properties[key] !== undefined) {
        value.insert([properties[key]], "bool");
        if (handler.exportXML(output, value, converter)) result += ` ${name}="${output[0]}"`;
      }
    }
    for (const [, name, key] of combineCharacters) {
      const scalar = properties[key];
      if (scalar === undefined) continue;
      const string = xmlTextString(scalar);
      try {
        value.insert(string.getDataAddress(), "OUString");
        output[0] = "";
        if (combineChar.exportXML(output, value)) {
          const attribute = escapeXml(output[0])
            .replaceAll("\t", "&#9;")
            .replaceAll("\n", "&#10;")
            .replaceAll("\r", "&#13;");
          result += ` ${name}="${attribute}"`;
        }
      } finally {
        string.dispose();
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
    for (const [, name, key, handler, type] of effects) {
      const scalar = properties[key];
      if (scalar === undefined) continue;
      value.insert([scalar], type);
      output[0] = "";
      if (handler.exportXML(output, value, converter) && output[0] !== "")
        result += ` ${name}="${output[0]}"`;
    }
    for (const { name, style, color, hasColor } of decorations) {
      const lineStyle = properties[style];
      if (lineStyle !== undefined) {
        value.insert([lineStyle], "sal_Int16");
        for (const [attribute, handler] of lineProperties)
          if (handler.exportXML(output, value, converter))
            result += ` style:text-${name}-${attribute}="${output[0]}"`;
      }
      // ContextFilter suppresses underline color unless it has a visible underline state.
      if (name === "underline" && (lineStyle === undefined || lineStyle === 0)) continue;
      output[0] = "";
      if (properties[hasColor] !== undefined) {
        value.insert([properties[hasColor]], "bool");
        decorationHasColor.exportXML(output, value, converter);
      }
      if (properties[color] !== undefined) {
        value.insert([properties[color]], "sal_Int32");
        decorationColor.exportXML(output, value, converter);
      }
      if (output[0] !== "") result += ` style:text-${name}-color="${output[0]}"`;
    }
    return result;
  } finally {
    value.dispose();
  }
}
/** Imports native scalar properties in SAX order. @param attributes - Original source order. @param options - Active map and generator compatibility. @returns Successful property conversions. */
export function importTextCharacterProperties(
  attributes: FastAttributeList,
  options: { readonly paragraphStyle?: boolean; readonly isOOo2x?: boolean } = {},
): Partial<OdfCharacterProperties> {
  const result: Record<string, number | boolean | string> = {},
    value = new Any(),
    crossedOut = new Any();
  try {
    for (const [token, text] of attributes) {
      const bracket = combineCharacters.find(
        /** Selects the source bracket member. @param entry - Mapping. @returns Token match. */ ([
          item,
        ]) => item === token,
      );
      if (bracket) {
        combineChar.importXML(text, value);
        const scalar = new OUString();
        try {
          if (value.extract(scalar, "OUString")) result[bracket[2]] = nativeText(scalar);
        } finally {
          scalar.dispose();
        }
        continue;
      }
      if (token === T.FO_LETTER_SPACING) {
        if (kerning.importXML(text, value, kerningConverter)) {
          const scalar: [number] = [0];
          value.extract(scalar, "sal_Int16");
          result.kerning = scalar[0];
        }
        continue;
      }
      const boolean = boolProperties.find(
        /** Reads the original bool mapping. @param entry - Entry. @returns Match. */ ([item]) =>
          item === token,
      );
      if (boolean !== undefined) {
        if (options.paragraphStyle && token === T.FO_HYPHENATE) continue;
        if (boolean[3].importXML(text, value, converter)) {
          const scalar: [boolean] = [false];
          value.extract(scalar, "bool");
          result[boolean[2]] = token === T.TEXT_DISPLAY && options.isOOo2x ? !scalar[0] : scalar[0];
        }
        continue;
      }
      const effect = effects.find(
        /** Resolves a native effect mapping. @param entry - Mapping. @returns Match. */
        ([item]) => item === token,
      );
      if (effect !== undefined) {
        const [, , key, handler, type] = effect;
        if (handler.importXML(text, value, converter)) {
          const scalar: [number | boolean] = [0];
          value.extract(scalar, type);
          result[key] = scalar[0];
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
    }
    for (const decoration of decorations) importDecoration(attributes, decoration, value, result);
    for (const [suffix, properties] of languageProperties) {
      let locale: XMLCharLocale | undefined;
      for (const [token, value] of attributes) {
        const attribute = properties.find(
          /** Finds the source locale member. @param entry - Native property mapping. @returns Match. */ ([
            source,
          ]) => source === token,
        );
        if (attribute) {
          locale ??= new XMLCharLocale();
          locale.importXML(attribute[2], value);
        }
      }
      if (locale) result[`language${suffix}`] = locale.getLanguageType();
    }
    return result as Partial<OdfCharacterProperties>;
  } finally {
    value.dispose();
    crossedOut.dispose();
  }
}

/** Merges one text-line decoration's style, type and width in SAX order. @param attributes - Source attributes. @param decoration - Property mapping. @param value - Shared temporary Any for color. @param result - Parsed properties. @returns Nothing. */
function importDecoration(
  attributes: FastAttributeList,
  decoration: (typeof decorations)[number],
  value: Any,
  result: Record<string, number | boolean | string>,
): void {
  const line = new Any();
  try {
    for (const [token, text] of attributes) {
      const part =
        lineProperties[
          decoration.tokens.findIndex(
            /** Identifies the line style, type or width. @param item - Native token. @returns Match. */
            (item) => item === token,
          )
        ];
      if (part?.[1].importXML(text, line, converter)) {
        const scalar: [number] = [0];
        line.extract(scalar, "sal_Int16");
        result[decoration.style] = scalar[0];
      }
      if (token === decoration.colorToken) {
        const color: [number] = [0];
        const hasColor: [boolean] = [false];
        if (decorationColor.importXML(text, value, converter)) {
          value.extract(color, "sal_Int32");
          result[decoration.color] = color[0];
        }
        decorationHasColor.importXML(text, value, converter);
        value.extract(hasColor, "bool");
        result[decoration.hasColor] = hasColor[0];
      }
    }
  } finally {
    line.dispose();
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
/** Applies parsed XML properties as native API values. @param target - Property owner. @param character - Character deltas. @param paragraph - Paragraph deltas. @param alignment - Optional alignment. @param leftMargin - Text-left margin in twips. @param autoFamily - Automatic style family. @param autoProperty - Destination property for the interned character style. @returns Nothing. */
export function applyTextImportProperties(
  target: XMLPropertySet,
  character: Partial<OdfCharacterProperties> = {},
  paragraph: XMLParagraphImportProperties = {},
  alignment?: OdfParagraphAlignment,
  leftMargin?: number,
  autoFamily?: XMLAutoStyleFamily,
  autoProperty: "CharAutoStyleName" | "ListAutoFormat" = "CharAutoStyleName",
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
    if (paragraph.fillStyle !== undefined)
      add("FillStyle", paragraph.fillStyle, cppu_detail_getUnoType_FillStyle);
    if (paragraph.fillColor !== undefined) add("FillColor", paragraph.fillColor, "sal_Int32");
    if (paragraph.fillTransparency !== undefined)
      add("FillTransparence", paragraph.fillTransparency, "sal_Int16");
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
      const language = character[`language${suffix}`];
      if (language !== undefined) {
        const locale = LanguageTag.convertToLocale(language, false);
        try {
          names.push(xmlTextString(`CharLocale${suffix}`));
          values.push(new Any(locale, localeType));
        } finally {
          locale.dispose();
        }
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
      ["highlight", "CharBackColor"],
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
    if (character.highlight !== undefined)
      add("CharBackTransparent", character.highlight === "transparent", "bool");
    for (const [key, name, type] of [
      ["textTransparency", "CharTransparence", "sal_Int16"],
      ["strikeout", "CharStrikeout", "sal_Int16"],
      ["escapement", "CharEscapement", "sal_Int16"],
      ["escapementHeight", "CharEscapementHeight", "sal_Int8"],
      ["underlineStyle", "CharUnderline", "sal_Int16"],
      ["underlineColor", "CharUnderlineColor", "sal_Int32"],
      ["underlineHasColor", "CharUnderlineHasColor", "bool"],
      ["overlineStyle", "CharOverline", "sal_Int16"],
      ["overlineColor", "CharOverlineColor", "sal_Int32"],
      ["overlineHasColor", "CharOverlineHasColor", "bool"],
      ["contoured", "CharContoured", "bool"],
      ["shadowed", "CharShadowed", "bool"],
      ["relief", "CharRelief", "sal_Int16"],
      ["rotation", "CharRotation", "sal_Int16"],
      ["rotationFitsLine", "CharRotationIsFitToLine", "bool"],
      ["emphasis", "CharEmphasis", "sal_Int16"],
      ["caseMap", "CharCaseMap", "sal_Int16"],
      ["flashing", "CharFlash", "bool"],
      ["hidden", "CharHidden", "bool"],
      ["noHyphenation", "CharNoHyphenation", "bool"],
      ["combineLines", "CharCombineIsOn", "bool"],
      ["combinePrefix", "CharCombinePrefix", "OUString"],
      ["combineSuffix", "CharCombineSuffix", "OUString"],
      ["scaleWidth", "CharScaleWidth", "sal_Int16"],
      ["wordMode", "CharWordMode", "bool"],
      ["autoKerning", "CharAutoKerning", "bool"],
      ["kerning", "CharKerning", "sal_Int16"],
    ] as const)
      if (character[key] !== undefined) add(name, character[key], type);
    if (character.themeColor) {
      const reference = createXComplexColor(createOdfThemeColor(character.themeColor));
      try {
        names.push(xmlTextString("CharComplexColor"));
        values.push(new Any([reference.get()], XComplexColor.static_type));
      } finally {
        reference.dispose();
      }
    }
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
    if (paragraph.lineNumberStart !== undefined)
      add("ParaLineNumberStartValue", paragraph.lineNumberStart, "sal_Int32");
    if (paragraph.verticalAlign !== undefined)
      add("ParaVertAlignment", paragraph.verticalAlign, "sal_Int16");
    for (const [name, , , type] of paragraphHyphenationMap) {
      const value = paragraph.hyphenation?.[name];
      if (value !== undefined) add(name, value, type);
    }
    if (paragraph.keepTogether !== undefined) add("ParaSplit", !paragraph.keepTogether, "bool");
    if (paragraph.joinBorder !== undefined)
      add("ParaIsConnectBorder", paragraph.joinBorder, "bool");
    for (const side of ["Top", "Bottom", "Left", "Right"] as const) {
      const rawBorder = paragraph[`border${side}`];
      const rawWidth = paragraph[`borderLineWidth${side}`];
      if (rawBorder === undefined) continue;
      const target = { value: new BorderLine2() };
      if (!new XMLBorderHdl().importXML(rawBorder, target))
        throw new Error(`Unsupported ODF paragraph border: ${rawBorder}`);
      if (rawWidth !== undefined && !new XMLBorderWidthHdl().importXML(rawWidth, target))
        throw new Error(`Unsupported ODF paragraph border widths: ${rawWidth}`);
      add(`${side}Border`, target.value, cppu_detail_getUnoType_BorderLine2);
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
      const destination = autoProperty === "CharAutoStyleName" ? key : xmlTextString(autoProperty);
      try {
        const style = autoFamily.insertStyle(properties),
          value = style.getPropertyValue(key);
        try {
          target.setPropertyValue(destination, value);
        } finally {
          value.dispose();
        }
      } finally {
        if (destination !== key) destination.dispose();
        key.dispose();
        for (const property of properties) {
          property.Name.dispose();
          property.Value.dispose();
        }
      }
    } else if (names.length) {
      if (target.setPropertyValues) {
        try {
          target.setPropertyValues(names, values);
          return;
        } catch (error) {
          if (!(error instanceof Exception)) throw error;
          error.dispose();
        }
      }
      // FillPropertySet uses single properties when XMultiPropertySet is absent or fails.
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
  } finally {
    for (const name of names) name.dispose();
    for (const value of values) value.dispose();
  }
}
