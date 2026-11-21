/** @fileoverview Consumed native text character property map and handler transport from txtprmap.cxx; no browser boolean formatting model or substitute UNO provider. */
import { cppu_detail_getUnoType_FillStyle } from "../../../offapi/com/sun/star/drawing/FillStyle";
import * as CaseMap from "../../../offapi/com/sun/star/style/CaseMap";
import { XMLConstantsPropertyHandler } from "../style/XMLConstantsPropertyHandler";
import { PropertyValue } from "../../../udkapi/com/sun/star/beans/PropertyValue";
import { PropertyState } from "../../../udkapi/com/sun/star/beans/PropertyState";

import { exportTextEmphasis, importTextEmphasis } from "./txtprhdl";
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
import { Converter } from "../../../sax/source/tools/converter";
import { XMLBorderHdl, XMLBorderWidthHdl, type OdfBoxProperties } from "../style/bordrhdl";
import { cppu_detail_getUnoType_FontSlant as slantType } from "../../../offapi/com/sun/star/awt/FontSlant";
import type { FastAttributeList } from "../core/xmlimp";
import { XMLToken as T } from "../core/xmltoken";
import { SvXMLUnitConverter } from "../core/xmluconv";
import { XMLColorTransparentPropHdl, XMLIsTransparentPropHdl } from "../style/xmlbahdl";
import { XMLFontWeightPropHdl } from "../style/weighhdl";
import { XMLNamedBoolPropertyHdl } from "../style/NamedBoolPropertyHdl";
import { XMLBoolPropHdl } from "../style/xmlbahdl";
import { XMLPosturePropHdl } from "../style/postuhdl";
import { XMLKerningPropHdl } from "../style/kernihdl";
import {
  XMLUnderlineStylePropHdl,
  XMLUnderlineTypePropHdl,
  XMLUnderlineWidthPropHdl,
} from "../style/undlihdl";
import { LanguageTag } from "../../../i18nlangtag/inc/languagetag";
import { cppu_detail_getUnoType_Locale as localeType } from "../../../udkapi/com/sun/star/lang/Locale";
import { XMLCharLocale, exportCharLocale } from "../style/chrlohdl";
import type { OdfCharacterProperties } from "./txtparae.types";
import { createOdfThemeColor } from "./XMLComplexColorContext";
import { createXComplexColor } from "../../../docmodel/inc/uno/UnoComplexColor";
import { XComplexColor } from "../../../offapi/com/sun/star/util/XComplexColor";
/** Stateless original handlers and actual owning core unit. */
const textLineColor = new XMLColorTransparentPropHdl("font-color"),
  textLineHasColor = new XMLIsTransparentPropHdl("font-color", false);
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
const lineStyleHandler = new XMLUnderlineStylePropHdl(),
  lineTypeHandler = new XMLUnderlineTypePropHdl(),
  lineWidthHandler = new XMLUnderlineWidthPropHdl();
/** Original underline and overline maps share handlers but merge their values independently. */
const lineProperties = {
  underline: [
    [T.STYLE_TEXT_UNDERLINE_STYLE, "style:text-underline-style", lineStyleHandler],
    [T.STYLE_TEXT_UNDERLINE_TYPE, "style:text-underline-type", lineTypeHandler],
    [T.STYLE_TEXT_UNDERLINE_WIDTH, "style:text-underline-width", lineWidthHandler],
  ],
  overline: [
    [T.STYLE_TEXT_OVERLINE_STYLE, "style:text-overline-style", lineStyleHandler],
    [T.STYLE_TEXT_OVERLINE_TYPE, "style:text-overline-type", lineTypeHandler],
    [T.STYLE_TEXT_OVERLINE_WIDTH, "style:text-overline-width", lineWidthHandler],
  ],
} as const;
const lineColorTokens = {
  underline: T.STYLE_TEXT_UNDERLINE_COLOR,
  overline: T.STYLE_TEXT_OVERLINE_COLOR,
} as const;
const textLines = ["underline", "overline"] as const;
/** Native CharCaseMap property split between the case transformation and font variant. */
const caseMapProperties = [
  [
    T.FO_FONT_VARIANT,
    "fo:font-variant",
    new XMLConstantsPropertyHandler(
      [
        ["normal", CaseMap.NONE],
        ["small-caps", CaseMap.SMALLCAPS],
      ],
      null,
    ),
  ],
  [
    T.FO_TEXT_TRANSFORM,
    "fo:text-transform",
    new XMLConstantsPropertyHandler(
      [
        ["none", CaseMap.NONE],
        ["uppercase", CaseMap.UPPERCASE],
        ["lowercase", CaseMap.LOWERCASE],
        ["capitalize", CaseMap.TITLE],
      ],
      null,
    ),
  ],
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
const characterBoxFields = [
  ["border", "border", T.LOEXT_BORDER, T.FO_BORDER],
  ["padding", "padding", T.LOEXT_PADDING, T.FO_PADDING],
  ["borderLineWidth", "border-line-width", T.LOEXT_BORDER_LINE_WIDTH, T.STYLE_BORDER_LINE_WIDTH],
  ["borderTop", "border-top", T.LOEXT_BORDER_TOP, T.FO_BORDER_TOP],
  ["paddingTop", "padding-top", T.LOEXT_PADDING_TOP, T.FO_PADDING_TOP],
  [
    "borderLineWidthTop",
    "border-line-width-top",
    T.LOEXT_BORDER_LINE_WIDTH_TOP,
    T.STYLE_BORDER_LINE_WIDTH_TOP,
  ],
  ["borderBottom", "border-bottom", T.LOEXT_BORDER_BOTTOM, T.FO_BORDER_BOTTOM],
  ["paddingBottom", "padding-bottom", T.LOEXT_PADDING_BOTTOM, T.FO_PADDING_BOTTOM],
  [
    "borderLineWidthBottom",
    "border-line-width-bottom",
    T.LOEXT_BORDER_LINE_WIDTH_BOTTOM,
    T.STYLE_BORDER_LINE_WIDTH_BOTTOM,
  ],
  ["borderLeft", "border-left", T.LOEXT_BORDER_LEFT, T.FO_BORDER_LEFT],
  ["paddingLeft", "padding-left", T.LOEXT_PADDING_LEFT, T.FO_PADDING_LEFT],
  [
    "borderLineWidthLeft",
    "border-line-width-left",
    T.LOEXT_BORDER_LINE_WIDTH_LEFT,
    T.STYLE_BORDER_LINE_WIDTH_LEFT,
  ],
  ["borderRight", "border-right", T.LOEXT_BORDER_RIGHT, T.FO_BORDER_RIGHT],
  ["paddingRight", "padding-right", T.LOEXT_PADDING_RIGHT, T.FO_PADDING_RIGHT],
  [
    "borderLineWidthRight",
    "border-line-width-right",
    T.LOEXT_BORDER_LINE_WIDTH_RIGHT,
    T.STYLE_BORDER_LINE_WIDTH_RIGHT,
  ],
] as const;

/** Tokens consumed by this bounded source property map. */
export const textCharacterPropertyTokens = [
  ...scriptProperties.map(
    /** Selects a native property token. @param entry - Mapping. @returns Token. */ ([token]) =>
      token,
  ),
  ...lineProperties.underline.map(
    /** Selects a native property token. @param entry - Mapping. @returns Token. */ ([token]) =>
      token,
  ),
  ...strikeoutProperties.map(
    /** Reads the original decoration token. @param entry - Mapping. @returns Token. */
    ([token]) => token,
  ),
  ...lineProperties.overline.map(
    /** Selects an overline token. @param entry - Mapping. @returns Token. */ ([token]) => token,
  ),
  ...Object.values(lineColorTokens),
  T.STYLE_TEXT_POSITION,
  T.STYLE_TEXT_EMPHASIZE,
  T.FO_FONT_VARIANT,
  T.FO_TEXT_TRANSFORM,
  T.FO_LETTER_SPACING,
  ...boolProperties.map(
    /** Reads original bool property tokens. @param entry - Entry. @returns Token. */ ([token]) =>
      token,
  ),
  ...languageProperties.flatMap(
    /** Collects each source locale attribute token. @param family - Script mapping. @returns Tokens. */ ([
      ,
      properties,
    ]) =>
      properties.map(
        /** Selects the original token. @param entry - Attribute mapping. @returns Token. */ ([
          token,
        ]) => token,
      ),
  ),
  ...characterBoxFields.flatMap(
    /** Admits the native extended and legacy text attributes. @param field - Original map row. @returns Both original tokens. */
    ([, , extended, legacy]) => [extended, legacy],
  ),
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

/** Emits original handler output from native UNO scalar values. @param properties - Filter handoff. @returns Attribute fragment. */
export function exportTextCharacterProperties(properties: OdfCharacterProperties): string {
  const value = new Any(),
    output: [string] = [""];
  let result = "";
  try {
    for (const [key, name] of characterBoxFields) {
      const field = properties.characterBox?.[key];
      if (field !== undefined)
        result += ` loext:${name}="${typeof field === "number" ? Converter.convertMeasureToXML(field, "twip") : field}"`;
    }
    if (properties.kerning !== undefined) {
      value.insert([properties.kerning], "sal_Int16");
      if (kerning.exportXML(output, value, kerningConverter))
        result += ` fo:letter-spacing="${output[0]}"`;
    }
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
    if (properties.caseMap !== undefined) {
      value.insert([properties.caseMap], "sal_Int16");
      for (const [, name, handler] of caseMapProperties)
        if (handler.exportXML(output, value, converter)) result += ` ${name}="${output[0]}"`;
    }
    if (properties.emphasis !== undefined)
      result += ` style:text-emphasize="${exportTextEmphasis(properties.emphasis)}"`;
    if (properties.strikeout !== undefined) {
      value.insert([properties.strikeout], "sal_Int16");
      for (const [, name, handler] of strikeoutProperties)
        if (handler.exportXML(output, value, converter)) result += ` ${name}="${output[0]}"`;
    }
    for (const line of textLines) {
      const style = properties[`${line}Style`];
      if (style !== undefined) {
        value.insert([style], "sal_Int16");
        for (const [, name, handler] of lineProperties[line])
          if (handler.exportXML(output, value, converter)) result += ` ${name}="${output[0]}"`;
      }
      // The native ContextFilter guards underline colors only.
      if (line === "underline" && (style === undefined || style === 0)) continue;
      const hasColor = properties[`${line}HasColor`];
      const color = properties[`${line}Color`];
      output[0] = "";
      if (hasColor !== undefined) {
        value.insert([hasColor], "bool");
        textLineHasColor.exportXML(output, value, converter);
      }
      if (color !== undefined) {
        value.insert([color], "sal_Int32");
        textLineColor.exportXML(output, value, converter);
      }
      if (output[0] !== "") result += ` style:text-${line}-color="${output[0]}"`;
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
  const result: Record<string, number | boolean | OdfBoxProperties> = {},
    value = new Any(),
    lineValues = { underline: new Any(), overline: new Any() },
    crossedOut = new Any();
  try {
    const characterBox: Record<string, string | number> = {};
    for (const [key, , extended, legacy] of characterBoxFields) {
      const raw = attributes.get(extended) ?? attributes.get(legacy);
      if (raw === null) continue;
      const value = key.startsWith("padding") ? Converter.convertMeasure(raw, "twip") : raw;
      if (value !== null) characterBox[key] = value;
    }
    if (Object.keys(characterBox).length) result.characterBox = characterBox;
    for (const [token, text] of attributes) {
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
      const caseMap = caseMapProperties.find(
        /** Resolves one of the native case attributes. @param property - Map entry. @returns Token match. */
        ([item]) => item === token,
      );
      if (caseMap !== undefined) {
        if (caseMap[2].importXML(text, value, converter)) {
          const scalar: [number] = [0];
          value.extract(scalar, "sal_Int16");
          result.caseMap = scalar[0];
        }
        continue;
      }
      if (token === T.STYLE_TEXT_EMPHASIZE) {
        const emphasis = importTextEmphasis(text);
        if (emphasis !== undefined) result.emphasis = emphasis;
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
      for (const line of textLines) {
        const property = lineProperties[line].find(
          /** Finds a native line attribute. @param entry - Mapping. @returns Token equality. */
          ([item]) => item === token,
        );
        const merged = lineValues[line];
        if (property !== undefined && property[2].importXML(text, merged, converter)) {
          const scalar: [number] = [0];
          merged.extract(scalar, "sal_Int16");
          result[`${line}Style`] = scalar[0];
        }
        if (token === lineColorTokens[line]) {
          const color: [number] = [0];
          const hasColor: [boolean] = [false];
          if (textLineColor.importXML(text, value, converter)) {
            value.extract(color, "sal_Int32");
            result[`${line}Color`] = color[0];
          }
          textLineHasColor.importXML(text, value, converter);
          value.extract(hasColor, "bool");
          result[`${line}HasColor`] = hasColor[0];
        }
      }
    }
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
    lineValues.underline.dispose();
    lineValues.overline.dispose();
    crossedOut.dispose();
  }
}

const hyphenationProperties = [
  ["hyphen", T.FO_HYPHENATE, "fo:hyphenate", "ParaIsHyphenation", "bool"],
  [
    "minLead",
    T.FO_HYPHENATION_REMAIN_CHAR_COUNT,
    "fo:hyphenation-remain-char-count",
    "ParaHyphenationMaxLeadingChars",
    "nonzero",
  ],
  [
    "minTrail",
    T.FO_HYPHENATION_PUSH_CHAR_COUNT,
    "fo:hyphenation-push-char-count",
    "ParaHyphenationMaxTrailingChars",
    "nonzero",
  ],
  [
    "maxHyphens",
    T.FO_HYPHENATION_LADDER_COUNT,
    "fo:hyphenation-ladder-count",
    "ParaHyphenationMaxHyphens",
    "number",
  ],
  [
    "noCaps",
    T.LOEXT_HYPHENATION_NO_CAPS,
    "loext:hyphenation-no-caps",
    "ParaHyphenationNoCaps",
    "bool",
  ],
  [
    "noLastWord",
    T.LOEXT_HYPHENATION_NO_LAST_WORD,
    "loext:hyphenation-no-last-word",
    "ParaHyphenationNoLastWord",
    "bool",
  ],
  [
    "minWordLength",
    T.LOEXT_HYPHENATION_WORD_CHAR_COUNT,
    "loext:hyphenation-word-char-count",
    "ParaHyphenationMinWordLength",
    "number",
  ],
  ["zone", T.LOEXT_HYPHENATION_ZONE, "loext:hyphenation-zone", "ParaHyphenationZone", "number"],
  [
    "paragraphEndZone",
    T.LOEXT_HYPHENATION_ZONE_ALWAYS,
    "loext:hyphenation-zone-always",
    "ParaHyphenationZoneAlways",
    "number",
  ],
  [
    "columnEndZone",
    T.LOEXT_HYPHENATION_ZONE_COLUMN,
    "loext:hyphenation-zone-column",
    "ParaHyphenationZoneColumn",
    "number",
  ],
  [
    "pageEndZone",
    T.LOEXT_HYPHENATION_ZONE_PAGE,
    "loext:hyphenation-zone-page",
    "ParaHyphenationZonePage",
    "number",
  ],
  [
    "spreadEndZone",
    T.LOEXT_HYPHENATION_ZONE_SPREAD,
    "loext:hyphenation-zone-spread",
    "ParaHyphenationZoneSpread",
    "number",
  ],
  ["keep", T.FO_HYPHENATION_KEEP, "fo:hyphenation-keep", "ParaHyphenationKeep", "keep"],
  [
    "keepType",
    T.LOEXT_HYPHENATION_KEEP_TYPE,
    "loext:hyphenation-keep-type",
    "ParaHyphenationKeepType",
    "keepType",
  ],
  [
    "compoundMinLead",
    T.LOEXT_HYPHENATION_COMPOUND_REMAIN_CHAR_COUNT,
    "loext:hyphenation-compound-remain-char-count",
    "ParaHyphenationCompoundMinLeadingChars",
    "number",
  ],
  [
    "compoundMinTrail",
    T.LOEXT_HYPHENATION_COMPOUND_PUSH_CHAR_COUNT,
    "loext:hyphenation-compound-push-char-count",
    "ParaHyphenationCompoundMinTrailingChars",
    "number",
  ],
  [
    "keepLine",
    T.LOEXT_HYPHENATION_KEEP_LINE,
    "loext:hyphenation-keep-line",
    "ParaHyphenationKeepLine",
    "bool",
  ],
] as const;

/** ODF paragraph members whose scalar types follow the XML property entries. */
export type OdfParagraphHyphenation = Readonly<{
  [Row in (typeof hyphenationProperties)[number] as Row[0]]?: Row[4] extends "bool" | "keep"
    ? boolean
    : number;
}>;

const hyphenationKeepTypes = ["auto", "spread", "page", "column", "always"] as const;

/** Imports the original text paragraph hyphenation XML attributes. @param attributes - Native paragraph properties. @returns Present member values. */
export function importParagraphHyphenation(
  attributes: FastAttributeList,
): OdfParagraphHyphenation | undefined {
  const values: [keyof OdfParagraphHyphenation, number | boolean][] = [];
  for (const [key, token, , , kind] of hyphenationProperties) {
    const raw = attributes.get(token);
    if (raw === null) continue;
    if (kind === "bool") {
      const boolean: [boolean] = [false];
      if (Converter.convertBool(boolean, raw)) values.push([key, boolean[0]]);
    } else if (kind === "keep") {
      if (raw === "page" || raw === "auto") values.push([key, raw === "page"]);
    } else if (kind === "keepType") {
      const index = hyphenationKeepTypes.findIndex(
        /** Resolves the native token. @param token - XML spelling. @returns Whether it matches. */
        (token) => token === raw,
      );
      if (index >= 0) values.push([key, index]);
    } else {
      const number: [number] = [0];
      if ((kind === "number" && raw === "none") || Converter.convertNumber(number, raw))
        values.push([key, (number[0] << 16) >> 16]);
    }
  }
  return values.length === 0 ? undefined : Object.fromEntries(values);
}

/** Exports the original ODF hyphenation attribute forms. @param settings - Direct paragraph item. @returns XML attributes. */
export function exportParagraphHyphenation(settings?: OdfParagraphHyphenation): string[] {
  if (settings === undefined) return [];
  const attributes: string[] = [];
  for (const [key, , name, , kind] of hyphenationProperties) {
    const value = settings[key];
    if (value === undefined || (kind === "nonzero" && value === 0)) continue;
    let lexical: string | undefined;
    if (kind === "keep") lexical = value ? "page" : "auto";
    else if (kind === "keepType") lexical = hyphenationKeepTypes[Number(value)];
    else if (kind === "number")
      lexical = value === 0 ? "none" : String((Number(value) << 16) >> 16);
    else lexical = String(value);
    if (lexical !== undefined) attributes.push(`${name}="${lexical}"`);
  }
  return attributes;
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
      ["emphasis", "CharEmphasis", "sal_Int16"],
      ["caseMap", "CharCaseMap", "sal_Int16"],
      ["escapement", "CharEscapement", "sal_Int16"],
      ["escapementHeight", "CharEscapementHeight", "sal_Int8"],
      ["underlineStyle", "CharUnderline", "sal_Int16"],
      ["underlineColor", "CharUnderlineColor", "sal_Int32"],
      ["underlineHasColor", "CharUnderlineHasColor", "bool"],
      ["overlineStyle", "CharOverline", "sal_Int16"],
      ["overlineColor", "CharOverlineColor", "sal_Int32"],
      ["overlineHasColor", "CharOverlineHasColor", "bool"],
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
      ["registerModeActive", "ParaRegisterModeActive"],
    ] as const)
      if (paragraph[key] !== undefined) add(name, paragraph[key], "bool");
    if (paragraph.hyphenation !== undefined) {
      for (const [key, , , name] of hyphenationProperties) {
        const value = paragraph.hyphenation[key];
        if (value !== undefined)
          add(name, value, typeof value === "boolean" ? "bool" : "sal_Int16");
      }
    }
    if (paragraph.verticalAlign !== undefined)
      add("ParaVertAlignment", paragraph.verticalAlign, "sal_Int16");
    if (paragraph.keepTogether !== undefined) add("ParaSplit", !paragraph.keepTogether, "bool");
    if (paragraph.joinBorder !== undefined)
      add("ParaIsConnectBorder", paragraph.joinBorder, "bool");
    if (character.characterBox) {
      const box = character.characterBox;
      for (const side of ["Top", "Bottom", "Left", "Right"] as const) {
        const distance = box[`padding${side}`] ?? box.padding;
        if (distance !== undefined) add(`Char${side}BorderDistance`, mm(distance), "sal_Int32");
        const rawBorder = box[`border${side}`] ?? box.border;
        if (rawBorder === undefined) continue;
        const target = { value: new BorderLine2() };
        if (!new XMLBorderHdl().importXML(rawBorder, target)) continue;
        const rawWidth = box[`borderLineWidth${side}`] ?? box.borderLineWidth;
        if (rawWidth !== undefined) new XMLBorderWidthHdl().importXML(rawWidth, target);
        add(`Char${side}Border`, target.value, cppu_detail_getUnoType_BorderLine2);
      }
    }
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
