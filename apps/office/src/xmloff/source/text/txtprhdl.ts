/** @fileoverview Consumed Writer text-frame orientation, wrap and character emphasis handlers from native txtprhdl.cxx. */
import { RubyAdjust } from "../../../offapi/com/sun/star/text/RubyAdjust";
import * as RubyPosition from "../../../offapi/com/sun/star/text/RubyPosition";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { Converter } from "../../../sax/source/tools/converter";
import { FontEmphasis } from "../../../offapi/com/sun/star/text/FontEmphasis";
import { HoriOrientation as H } from "../../../offapi/com/sun/star/text/HoriOrientation";
import { VertOrientation as V } from "../../../offapi/com/sun/star/text/VertOrientation";
import { RelOrientation as R } from "../../../offapi/com/sun/star/text/RelOrientation";
import { WrapInfluenceOnPosition as I } from "../../../offapi/com/sun/star/text/WrapInfluenceOnPosition";
import { WrapTextMode as W } from "../../../offapi/com/sun/star/text/WrapTextMode";
import { XMLConstantsPropertyHandler } from "../style/XMLConstantsPropertyHandler";
import { SvXMLUnitConverter } from "../core/xmluconv";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import * as CaseMap from "../../../offapi/com/sun/star/style/CaseMap";
import { XMLBoolPropHdl, XMLNBoolPropHdl } from "../style/xmlbahdl";
import { XMLNamedBoolPropertyHdl } from "../style/NamedBoolPropertyHdl";
import { XMLShadowedPropHdl } from "../style/shdwdhdl";
import { SvXMLImportContext, type FastAttributeList } from "../core/xmlimp";
import { XMLToken as T } from "../core/xmltoken";

/** Native CharCaseMap property split between the case transformation and font variant. */
export const textCaseMapProperties = [
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

/** Native two-line bracket handler, using one UTF-16 character unit. */
export class XMLTextCombineCharPropHdl {
  /** Imports the first UTF-16 unit or the empty string. @param input - Source string. @param value - UNO property. @returns True. */
  importXML(input: string, value: Any): boolean {
    const string = unicode(input.slice(0, 1));
    try {
      value.insert(string.getDataAddress(), "OUString");
    } finally {
      string.dispose();
    }
    return true;
  }

  /** Writes a bracket only when the extracted string has one UTF-16 unit. @param output - XML output. @param value - UNO property. @returns Whether to emit the attribute. */
  exportXML(output: [string], value: Any): boolean {
    const string = new OUString();
    try {
      if (value.extract(string, "OUString")) output[0] = text(string);
      return output[0].length === 1;
    } finally {
      string.dispose();
    }
  }
}

const pXML_HoriPos_Enum = [
  ["from-left", H.NONE],
  ["from-inside", H.NONE],
  ["left", H.LEFT],
  ["inside", H.LEFT],
  ["center", H.CENTER],
  ["right", H.RIGHT],
  ["outside", H.RIGHT],
] as const;
const pXML_HoriPosMirrored_Enum = [
  ["from-inside", H.NONE],
  ["inside", H.LEFT],
  ["center", H.CENTER],
  ["outside", H.RIGHT],
] as const;
const pXML_HoriRel_Enum = [
  ["paragraph", R.FRAME],
  ["paragraph-content", R.PRINT_AREA],
  ["page", R.PAGE_FRAME],
  ["page-content", R.PAGE_PRINT_AREA],
  ["paragraph-start-margin", R.FRAME_LEFT],
  ["paragraph-end-margin", R.FRAME_RIGHT],
  ["page-start-margin", R.PAGE_LEFT],
  ["page-end-margin", R.PAGE_RIGHT],
  ["char", R.CHAR],
  ["frame", R.FRAME],
  ["frame-content", R.PRINT_AREA],
  ["frame-start-margin", R.FRAME_LEFT],
  ["frame-end-margin", R.FRAME_RIGHT],
] as const;
const pXML_VertPosAtChar_Enum = [
  ["from-top", V.NONE],
  ["top", V.TOP],
  ["top", V.CHAR_TOP],
  ["top", V.LINE_TOP],
  ["middle", V.CENTER],
  ["middle", V.CHAR_CENTER],
  ["middle", V.LINE_CENTER],
  ["bottom", V.BOTTOM],
  ["below", V.CHAR_BOTTOM],
  ["bottom", V.LINE_BOTTOM],
] as const;
const pXML_VertRel_Enum = [
  ["paragraph", R.FRAME],
  ["paragraph-content", R.PRINT_AREA],
  ["char", R.CHAR],
  ["page", R.PAGE_FRAME],
  ["page-content", R.PAGE_PRINT_AREA],
  ["page-content-top", R.PAGE_PRINT_AREA_TOP],
  ["page-content-bottom", R.PAGE_PRINT_AREA_BOTTOM],
  ["frame", R.FRAME],
  ["frame-content", R.PRINT_AREA],
  ["line", R.TEXT_LINE],
] as const;
const pXML_Wrap_Enum = [
  ["none", W.NONE],
  ["run-through", W.THROUGH],
  ["parallel", W.PARALLEL],
  ["dynamic", W.DYNAMIC],
  ["left", W.LEFT],
  ["right", W.RIGHT],
] as const;
const pXML_WrapInfluenceOnPosition_Enum = [
  ["once-successive", I.ONCE_SUCCESSIVE],
  ["once-concurrent", I.ONCE_CONCURRENT],
  ["iterative", I.ITERATIVE],
] as const;
// com.sun.star.text.ParagraphVertAlign values used by the native text enum handler.
const pXML_ParaVerticalAlign_Enum = [
  ["top", 2],
  ["middle", 3],
  ["bottom", 4],
  ["baseline", 1],
  ["auto", 0],
] as const;

const converter = new SvXMLUnitConverter("twip");
const handlers = {
  paragraphVerticalAlign: new XMLConstantsPropertyHandler(pXML_ParaVerticalAlign_Enum, null),
  horizontal: new XMLConstantsPropertyHandler(pXML_HoriPos_Enum, null),
  horizontalMirrored: new XMLConstantsPropertyHandler(pXML_HoriPosMirrored_Enum, null),
  horizontalRelation: new XMLConstantsPropertyHandler(pXML_HoriRel_Enum, null),
  vertical: new XMLConstantsPropertyHandler(pXML_VertPosAtChar_Enum, null),
  verticalRelation: new XMLConstantsPropertyHandler(pXML_VertRel_Enum, null),
  wrap: new XMLConstantsPropertyHandler(pXML_Wrap_Enum, null),
  wrapInfluence: new XMLConstantsPropertyHandler(pXML_WrapInfluenceOnPosition_Enum, null),
};

/** Reads the original text enum token via the shared constant property handler. @param property - Native property map. @param token - Optional authored XML. @returns Mapped value or absence. */
export function importTextConstant(
  property: keyof typeof handlers,
  token: string | null,
): number | undefined {
  if (token === null) return undefined;
  const value = new Any();
  try {
    const output: [number] = [0];
    return handlers[property].importXML(token, value, converter) &&
      value.extract(output, "sal_Int16")
      ? output[0]
      : undefined;
  } finally {
    value.dispose();
  }
}

/** Writes the first original XML token for the native enum value. @param property - Native property map. @param value - Native numeric property. @returns Canonical token or absence. */
export function exportTextConstant(
  property: keyof typeof handlers,
  value: number | undefined,
): string | undefined {
  if (value === undefined) return undefined;
  const any = new Any([value], "sal_Int32");
  try {
    const result: [string] = [""];
    return handlers[property].exportXML(result, any, converter) && result[0]
      ? result[0]
      : undefined;
  } finally {
    any.dispose();
  }
}

const textEmphasisTypes: ReadonlyMap<string, number> = new Map([
  ["none", FontEmphasis.NONE],
  ["dot", FontEmphasis.DOT_ABOVE],
  ["circle", FontEmphasis.CIRCLE_ABOVE],
  ["disc", FontEmphasis.DISK_ABOVE],
  ["accent", FontEmphasis.ACCENT_ABOVE],
]);

/** Reads the two unordered tokens accepted by XMLTextEmphasizePropHdl_Impl. @param value - ODF attribute. @returns UNO short on success. */
export function importTextEmphasis(value: string): number | undefined {
  let type: number | undefined;
  let position: string | undefined;
  for (const token of value.split(" ")) {
    if (position === undefined && (token === "above" || token === "below")) {
      position = token;
      continue;
    }
    if (type !== undefined) return undefined;
    type = textEmphasisTypes.get(token);
    if (type === undefined) return undefined;
  }
  if (type === undefined || type === FontEmphasis.NONE) return FontEmphasis.NONE;
  return position === "below" ? type + 10 : type;
}

/** Emits the original type and position, including the converter's default token. @param value - UNO short. @returns ODF lexical value. */
export function exportTextEmphasis(value: number): string {
  const below = value > 10;
  const type = below ? value - 10 : value;
  for (const [token, wire] of textEmphasisTypes)
    if (wire === type)
      return type === FontEmphasis.NONE ? token : `${token} ${below ? "below" : "above"}`;
  return below ? "dot below" : "dot above";
}

/** Adapts the pinned emphasis conversion to UNO-backed Calc text properties. */
export class XMLTextEmphasizePropHdl {
  /** Converts a source attribute into a UNO short. @param input - XML value. @param value - UNO result. @returns Whether conversion succeeded. */
  importXML(input: string, value: Any): boolean {
    const emphasis = importTextEmphasis(input);
    if (emphasis === undefined) return false;
    value.insert([emphasis], "sal_Int16");
    return true;
  }

  /** Emits an original emphasis token. @param output - XML destination. @param value - UNO short. @returns Whether a short was extracted. */
  exportXML(output: [string], value: Any): boolean {
    const emphasis: [number] = [0];
    if (!value.extract(emphasis, "sal_Int16")) return false;
    output[0] = exportTextEmphasis(emphasis[0]);
    return true;
  }
}

/** Original XMLTextRotationAnglePropHdl_Impl normalizes XML degrees to the three native text orientations. */
export class XMLTextRotationAnglePropHdl {
  /** Parses degrees, normalizes the revolution and chooses the native orientation. @param input - ODF degrees. @param value - Native tenths of a degree. @returns Whether parsing succeeded. */
  importXML(input: string, value: Any): boolean {
    const parsed: [number] = [0];
    if (!Converter.convertNumber(parsed, input)) return false;
    const angle = ((parsed[0] % 360) + 360) % 360;
    const orientation = angle < 45 || angle > 315 ? 0 : angle < 180 ? 900 : 2700;
    value.insert([orientation], "sal_Int16");
    return true;
  }

  /** Writes the native tenths as whole XML degrees. @param output - Existing attribute. @param value - Native short. @returns Whether a short was extracted. */
  exportXML(output: [string], value: Any): boolean {
    const angle: [number] = [0];
    if (!value.extract(angle, "sal_Int16")) return false;
    output[0] = String(Math.trunc(angle[0] / 10));
    return true;
  }
}

/** Native merged CharWordMode map and exact XML_TYPE_BOOL association. */
const wordMode = new XMLNamedBoolPropertyHdl("skip-white-space", "continuous"),
  bool = new XMLBoolPropHdl();
export const textBooleanProperties = [
  [T.STYLE_TEXT_UNDERLINE_MODE, "style:text-underline-mode", "wordMode", wordMode],
  [T.STYLE_TEXT_OVERLINE_MODE, "style:text-overline-mode", "wordMode", wordMode],
  [T.STYLE_TEXT_LINE_THROUGH_MODE, "style:text-line-through-mode", "wordMode", wordMode],
  [T.STYLE_LETTER_KERNING, "style:letter-kerning", "autoKerning", bool],
  [T.STYLE_TEXT_OUTLINE, "style:text-outline", "outline", bool],
  [T.FO_HYPHENATE, "fo:hyphenate", "noHyphenation", new XMLNBoolPropHdl()],
  [
    T.LOEXT_FONT_OPTICAL_SIZING,
    "loext:font-optical-sizing",
    "opticalSizing",
    new XMLNamedBoolPropertyHdl("auto", "none"),
  ],
  [T.FO_TEXT_SHADOW, "fo:text-shadow", "shadow", new XMLShadowedPropHdl()],
  [
    T.STYLE_TEXT_ROTATION_SCALE,
    "style:text-rotation-scale",
    "rotationFitToLine",
    new XMLNamedBoolPropertyHdl("fixed", "line-height"),
  ],
  [T.STYLE_TEXT_BLINKING, "style:text-blinking", "flashing", bool],
  [T.TEXT_DISPLAY, "text:display", "hidden", new XMLNamedBoolPropertyHdl("none", "true")],
  [
    T.STYLE_TEXT_COMBINE,
    "style:text-combine",
    "combineLines",
    new XMLNamedBoolPropertyHdl("lines", "none"),
  ],
] as const;

/** Original named boolean mappings for the three Asian paragraph settings. */
export const paragraphAsianTypographyProperties = [
  [
    "scriptSpace",
    T.STYLE_TEXT_AUTOSPACE,
    "style:text-autospace",
    "ParaIsCharacterDistance",
    new XMLNamedBoolPropertyHdl("ideograph-alpha", "none"),
  ],
  [
    "hangingPunctuation",
    T.STYLE_PUNCTUATION_WRAP,
    "style:punctuation-wrap",
    "ParaIsHangingPunctuation",
    new XMLNamedBoolPropertyHdl("hanging", "simple"),
  ],
  [
    "forbiddenRules",
    T.STYLE_LINE_BREAK,
    "style:line-break",
    "ParaIsForbiddenRules",
    new XMLNamedBoolPropertyHdl("strict", "normal"),
  ],
] as const;

/** Decoded native Asian paragraph items. */
export type OdfAsianTypography = Partial<
  Record<(typeof paragraphAsianTypographyProperties)[number][0], boolean>
>;

/** Converts only successfully parsed native named booleans. @param attributes - Direct XML attributes. @returns Present mapped properties. */
export function importParagraphAsianTypography(
  attributes: FastAttributeList,
): OdfAsianTypography | undefined {
  const settings: OdfAsianTypography = {};
  const converter = new SvXMLUnitConverter("twip");
  const value = new Any();
  try {
    for (const [key, token, , , handler] of paragraphAsianTypographyProperties) {
      const text = attributes.get(token);
      if (text === null || !handler.importXML(text, value, converter)) continue;
      const active: [boolean] = [false];
      if (value.extract(active, "bool")) settings[key] = active[0];
    }
  } finally {
    value.dispose();
  }
  return Object.keys(settings).length === 0 ? undefined : settings;
}

/** Serializes the original lexical tokens for explicitly authored paragraph values. @param settings - Direct typed properties. @returns Present XML attributes. */
export function exportParagraphAsianTypography(settings?: OdfAsianTypography): string[] {
  if (settings === undefined) return [];
  const attributes: string[] = [];
  const converter = new SvXMLUnitConverter("twip");
  for (const [key, , attribute, , handler] of paragraphAsianTypographyProperties) {
    const active = settings[key];
    if (active === undefined) continue;
    const value = new Any([active], "bool");
    try {
      const token: [string] = [""];
      handler.exportXML(token, value, converter);
      attributes.push(`${attribute}="${token[0]}"`);
    } finally {
      value.dispose();
    }
  }
  return attributes;
}

const rubyAlignments = [
  "left",
  "center",
  "right",
  "distribute-letter",
  "distribute-space",
] as const;
const rubyPositions = ["above", "below", "inter-character"] as const;

/** The native ruby style values independently of its displayed reading. */
export interface XMLRubyStyle {
  readonly adjust?: RubyAdjust;
  readonly above?: boolean;
  readonly position?: number;
}

/** Imports a ruby-family automatic style. */
export class XMLRubyStyleContext extends SvXMLImportContext {
  private style: XMLRubyStyle = {};

  /** Retains the original ruby style name until its property child completes. @param name - ODF style name. @param register - Receiver for the original style. @returns Context. */
  constructor(
    private readonly name: string,
    private readonly register: (name: string, style: XMLRubyStyle) => void,
  ) {
    super();
  }

  /** Captures the original alignment, legacy bool and extended position. @param element - Property token. @param attributes - Source attributes. @returns Inert property child. */
  override createFastChildContext(
    element: T,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element !== T.STYLE_RUBY_PROPERTIES) return null;
    const alignment = attributes.get(T.STYLE_RUBY_ALIGN);
    const legacy = attributes.get(T.STYLE_RUBY_POSITION);
    const extended = attributes.get(T.LOEXT_RUBY_POSITION);
    const adjust = rubyAlignments.findIndex(
      /** Matches the original ruby alignment mapping. @param name - Native ODF spelling. @returns Match. */ (
        name,
      ) => name === alignment,
    );
    const position = rubyPositions.findIndex(
      /** Matches the original three-value ruby position. @param name - Native ODF spelling. @returns Match. */ (
        name,
      ) => name === extended,
    );
    this.style = {
      ...(adjust < 0 ? {} : { adjust }),
      ...(legacy === "above" || legacy === "below" ? { above: legacy === "above" } : {}),
      ...(position < 0 ? {} : { position }),
    };
    return new SvXMLImportContext();
  }

  /** Publishes the native ruby style. @returns Nothing. */
  override endFastElement(): void {
    if (this.name) this.register(this.name, this.style);
  }
}

/** Emits one native automatic ruby style for the ODF package. @param name - Generated style name. @param adjustment - Native ruby alignment. @param position - Native reading position. @returns Style XML. */
export function exportRubyStyle(name: string, adjustment: RubyAdjust, position: number): string {
  const align = rubyAlignments[Number(adjustment)] ?? "left";
  const legacy = position === RubyPosition.ABOVE ? "above" : "below";
  const extended = rubyPositions[position] ?? "above";
  return `<style:style style:name="${name}" style:family="ruby"><style:ruby-properties style:ruby-align="${align}" style:ruby-position="${legacy}" loext:ruby-position="${extended}"/></style:style>`;
}
