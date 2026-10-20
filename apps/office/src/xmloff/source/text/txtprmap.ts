/** @fileoverview Consumed native text character property map and handler transport from txtprmap.cxx; no browser boolean formatting model or substitute UNO provider. */
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { cppu_detail_getUnoType_FontSlant as slantType } from "../../../offapi/com/sun/star/awt/FontSlant";
import type { FastAttributeList } from "../core/xmlimp";
import { XMLToken as T } from "../core/xmltoken";
import { SvXMLUnitConverter } from "../core/xmluconv";
import { XMLColorTransparentPropHdl, XMLIsTransparentPropHdl } from "../style/xmlbahdl";
import { XMLFontWeightPropHdl } from "../style/weighhdl";
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
  T.STYLE_TEXT_UNDERLINE_COLOR,
];
/** Emits original handler output from native UNO scalar values. @param properties - Filter handoff. @returns Attribute fragment. */
export function exportTextCharacterProperties(properties: OdfCharacterProperties): string {
  const value = new Any(),
    output: [string] = [""];
  let result = "";
  try {
    for (const [, name, key, handler, type] of scriptProperties) {
      const scalar = properties[key];
      if (scalar === undefined) continue;
      value.insert([scalar], type);
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
    line = new Any();
  try {
    for (const [token, text] of attributes) {
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
  }
}
