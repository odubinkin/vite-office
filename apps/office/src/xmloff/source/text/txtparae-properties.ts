/** @fileoverview Keeps the existing portable automatic paragraph-style identity fields together. */
import { ShadowFormat } from "../../../offapi/com/sun/star/table/ShadowFormat";
import type { ShadowLocation } from "../../../offapi/com/sun/star/table/ShadowLocation";
import { FontPitch } from "../../../tools/inc/fontenum";
import { RTL_TEXTENCODING_DONTKNOW } from "../../../sal/inc/rtl/textenc";
import { exportInlineFont, getFontFamilyFromGeneric } from "../style/fonthdl";
import { XMLShadowPropHdl } from "../style/shadwhdl";
import { exportFillProperties } from "../draw/fill-properties";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { exportWritingDirection } from "../style/prhdlfac";
import { XMLNumberWithAutoForVoidPropHdl } from "../style/xmlbahdl";
import { escapeXml, exportOdfLength, SvXMLUnitConverter } from "../core/xmluconv";
import { exportParagraphJustification } from "../style/adjushdl";
import { createOdfThemeColor, exportComplexColor } from "./XMLComplexColorContext";
import { exportParagraphAsianTypography, exportTextConstant } from "./txtprhdl";
import {
  exportParagraphHyphenation,
  exportTextCharacterProperties,
  exportTextLanguageProperties,
} from "./txtprmap";
import type {
  FontFaceNameResolver,
  OdfCharacterProperties,
  OdfParagraphProperties,
  OdfTabStop,
} from "./txtparae.types";
const paragraphBoxKeys = [
  "border",
  "borderTop",
  "borderBottom",
  "borderLeft",
  "borderRight",
  "borderLineWidth",
  "borderLineWidthTop",
  "borderLineWidthBottom",
  "borderLineWidthLeft",
  "borderLineWidthRight",
  "padding",
  "paddingTop",
  "paddingBottom",
  "paddingLeft",
  "paddingRight",
  "joinBorder",
] as const;

/** Includes native box and shadow values in automatic style equality. @param properties - Direct paragraph properties. @returns Encoded border fields when authored. */
function paragraphBoxKey(properties: OdfParagraphProperties | undefined): string | undefined {
  if (!properties) return undefined;
  const parts = Object.fromEntries(
    paragraphBoxKeys.flatMap(
      /** Retains only authored values in deterministic order. @param key - Native box field. @returns Present field. */
      (key) => (properties[key] === undefined ? [] : [[key, properties[key]]]),
    ),
  );
  const shadow = properties.paragraphShadow;
  const shadowKey = shadow && [
    shadow.Location,
    shadow.ShadowWidth,
    shadow.IsTransparent,
    shadow.Color,
  ];
  if (Object.keys(parts).length === 0 && shadowKey === undefined) return undefined;
  return encodeURIComponent(JSON.stringify({ ...parts, shadow: shadowKey }));
}

/** Restores structured box fields from an automatic style key. @param key - Encoded border payload. @returns Represented paragraph properties. */
function parseParagraphBoxKey(key: string | undefined): OdfParagraphProperties {
  if (!key) return {};
  const { shadow, ...box } = JSON.parse(decodeURIComponent(key)) as Pick<
    OdfParagraphProperties,
    (typeof paragraphBoxKeys)[number]
  > & { shadow?: [ShadowLocation, number, boolean, number] };
  const paragraphShadow: ShadowFormat | undefined =
    shadow === undefined ? undefined : new ShadowFormat(...shadow);
  return { ...box, ...(paragraphShadow === undefined ? {} : { paragraphShadow }) };
}

/** Creates a stable key for direct paragraph deltas. @param properties - Direct paragraph properties. @returns Key. */
export function paragraphPropertiesKey(properties?: OdfParagraphProperties): string {
  return [
    properties?.firstLineIndent,
    properties?.rightMargin,
    properties?.upperSpacing,
    properties?.lowerSpacing,
    properties?.lineHeightPercent,
    properties?.lineHeightTwips,
    properties?.lineHeightAtLeastTwips,
    properties?.lineSpacingTwips,
    properties?.fontIndependentLineSpacing === undefined
      ? ""
      : Number(properties.fontIndependentLineSpacing),
    properties?.contextualSpacing === undefined ? "" : Number(properties.contextualSpacing),
    properties?.tabStopDetails === undefined
      ? undefined
      : encodeURIComponent(JSON.stringify(properties.tabStopDetails)),
    properties?.keepWithNext === undefined ? "" : Number(properties.keepWithNext),
    properties?.countLineNumbers === undefined ? "" : Number(properties.countLineNumbers),
    properties?.keepTogether === undefined ? "" : Number(properties.keepTogether),
    properties?.widows,
    properties?.orphans,
    properties?.breakBefore,
    properties?.breakAfter,
    properties?.autoTextIndent === undefined ? "" : Number(properties.autoTextIndent),
    properties?.pageStyleName === undefined
      ? ""
      : properties.pageStyleName === ""
        ? "%00"
        : encodeURIComponent(properties.pageStyleName),
    properties?.pageNumber,
    properties?.fillStyle,
    properties?.fillColor,
    properties?.fillTransparency,
    properties?.verticalAlign,
    properties?.registerModeActive === undefined ? "" : Number(properties.registerModeActive),
    properties?.hyphenation === undefined
      ? ""
      : encodeURIComponent(JSON.stringify(properties.hyphenation)),
    properties?.justification === undefined
      ? ""
      : encodeURIComponent(JSON.stringify(properties.justification)),
    properties?.writingMode,
    properties?.writingModeAutomatic === undefined ? "" : Number(properties.writingModeAutomatic),
    properties?.snapToGrid === undefined ? "" : Number(properties.snapToGrid),
    properties?.asianTypography === undefined
      ? ""
      : encodeURIComponent(JSON.stringify(properties.asianTypography)),
    properties?.lineNumberStartValue,
    paragraphBoxKey(properties),
  ]
    .map(
      /** Encodes one optional paragraph metric. @param value - Metric. @returns Stable field. */ (
        value,
      ) => value ?? "",
    )
    .join(",");
}

/** Restores paragraph properties from an internal key. @param key - Paragraph key. @returns Properties. */
export function parseParagraphPropertiesKey(key: string): OdfParagraphProperties {
  const fields = key.split(",");
  const [
    firstLineIndent,
    rightMargin,
    upperSpacing,
    lowerSpacing,
    lineHeightPercent,
    lineHeightTwips,
    lineHeightAtLeastTwips,
    lineSpacingTwips,
    fontIndependentLineSpacing,
    contextualSpacing,
    ,
    keepWithNext,
    countLineNumbers,
    keepTogether,
    widows,
    orphans,
    ,
    ,
  ] = fields.map(
    /** Decodes one optional paragraph metric. @param value - Stable field. @returns Metric. */ (
      value,
    ) => (value === "" ? undefined : Number(value)),
  );
  const tabStopsKey = fields[10] as string;
  const breakBefore = fields[16];
  const breakAfter = fields[17];
  const autoTextIndent = fields[18];
  const pageStyleName = fields[19];
  const pageNumber = fields[20];
  return {
    ...parseParagraphBoxKey(fields[33]),
    ...(fields[21] === undefined || fields[21] === "" ? {} : { fillStyle: Number(fields[21]) }),
    ...(fields[22] === undefined || fields[22] === "" ? {} : { fillColor: Number(fields[22]) }),
    ...(fields[23] === undefined || fields[23] === ""
      ? {}
      : { fillTransparency: Number(fields[23]) }),
    ...(fields[24] === undefined || fields[24] === "" ? {} : { verticalAlign: Number(fields[24]) }),
    ...(firstLineIndent === undefined ? {} : { firstLineIndent }),
    ...(rightMargin === undefined ? {} : { rightMargin }),
    ...(upperSpacing === undefined ? {} : { upperSpacing }),
    ...(lowerSpacing === undefined ? {} : { lowerSpacing }),
    ...(lineHeightPercent === undefined ? {} : { lineHeightPercent }),
    ...(lineHeightTwips === undefined ? {} : { lineHeightTwips }),
    ...(lineHeightAtLeastTwips === undefined ? {} : { lineHeightAtLeastTwips }),
    ...(lineSpacingTwips === undefined ? {} : { lineSpacingTwips }),
    ...(fontIndependentLineSpacing === undefined
      ? {}
      : { fontIndependentLineSpacing: fontIndependentLineSpacing === 1 }),
    ...(contextualSpacing === undefined ? {} : { contextualSpacing: contextualSpacing === 1 }),
    ...(tabStopsKey === ""
      ? {}
      : { tabStopDetails: JSON.parse(decodeURIComponent(tabStopsKey)) as OdfTabStop[] }),
    ...(keepWithNext === undefined ? {} : { keepWithNext: keepWithNext === 1 }),
    ...(countLineNumbers === undefined ? {} : { countLineNumbers: countLineNumbers === 1 }),
    ...(fields[32] ? { lineNumberStartValue: Number(fields[32]) } : {}),
    ...(keepTogether === undefined ? {} : { keepTogether: keepTogether === 1 }),
    ...(widows === undefined ? {} : { widows }),
    ...(orphans === undefined ? {} : { orphans }),
    ...(breakBefore === undefined || breakBefore === ""
      ? {}
      : { breakBefore: breakBefore as "auto" | "page" }),
    ...(breakAfter === undefined || breakAfter === ""
      ? {}
      : { breakAfter: breakAfter as "auto" | "page" }),
    ...(fields[26]
      ? {
          hyphenation: JSON.parse(decodeURIComponent(fields[26])) as NonNullable<
            OdfParagraphProperties["hyphenation"]
          >,
        }
      : {}),
    ...(fields[27]
      ? {
          justification: JSON.parse(decodeURIComponent(fields[27])) as NonNullable<
            OdfParagraphProperties["justification"]
          >,
        }
      : {}),
    ...(fields[28] ? { writingMode: Number(fields[28]) } : {}),
    ...(fields[29] === "0" || fields[29] === "1"
      ? { writingModeAutomatic: fields[29] === "1" }
      : {}),
    ...(fields[30] === "0" || fields[30] === "1" ? { snapToGrid: fields[30] === "1" } : {}),
    ...(fields[31]
      ? {
          asianTypography: JSON.parse(decodeURIComponent(fields[31])) as NonNullable<
            OdfParagraphProperties["asianTypography"]
          >,
        }
      : {}),
    ...(fields[25] === "0" || fields[25] === "1" ? { registerModeActive: fields[25] === "1" } : {}),
    ...(autoTextIndent === undefined || autoTextIndent === ""
      ? {}
      : { autoTextIndent: autoTextIndent === "1" }),
    ...(pageStyleName === undefined || pageStyleName === ""
      ? {}
      : { pageStyleName: pageStyleName === "%00" ? "" : decodeURIComponent(pageStyleName) }),
    ...(pageNumber === undefined || pageNumber === ""
      ? {}
      : { pageNumber: pageNumber === "auto" ? "auto" : Number(pageNumber) }),
  };
}

/** Emits supported ODF paragraph-property attributes. @param properties - Direct properties. @returns Attributes. */
export function exportParagraphAttributes(properties: OdfParagraphProperties): string[] {
  const verticalAlign = exportTextConstant("paragraphVerticalAlign", properties.verticalAlign);
  return [
    ...exportFillProperties(properties),
    ...(properties.joinBorder === undefined
      ? []
      : [`style:join-border="${properties.joinBorder}"`]),
    ...(properties.paragraphShadow === undefined
      ? []
      : [`style:shadow="${new XMLShadowPropHdl().exportXML(properties.paragraphShadow)}"`]),
    ...(["Top", "Bottom", "Left", "Right"] as const).flatMap(
      /** Computes the side result. @param side - Side. @returns The computed result. */ (side) => {
        const suffix = side.toLowerCase();
        const border = properties[`border${side}`];
        const width = properties[`borderLineWidth${side}`];
        const padding = properties[`padding${side}`];
        return [
          ...(padding === undefined ? [] : [`fo:padding-${suffix}="${exportOdfLength(padding)}"`]),
          ...(border === undefined ? [] : [`fo:border-${suffix}="${escapeXml(border)}"`]),
          ...(width === undefined
            ? []
            : [`style:border-line-width-${suffix}="${escapeXml(width)}"`]),
        ];
      },
    ),
    ...(properties.firstLineIndent === undefined
      ? []
      : [`fo:text-indent="${exportOdfLength(properties.firstLineIndent)}"`]),
    ...(properties.autoTextIndent === undefined
      ? []
      : [`style:auto-text-indent="${properties.autoTextIndent}"`]),
    ...(properties.pageNumber === undefined
      ? []
      : [`style:page-number="${exportPageNumber(properties.pageNumber)}"`]),
    ...(properties.rightMargin === undefined
      ? []
      : [`fo:margin-right="${exportOdfLength(properties.rightMargin)}"`]),
    ...(properties.upperSpacing === undefined
      ? []
      : [`fo:margin-top="${exportOdfLength(properties.upperSpacing)}"`]),
    ...(properties.lowerSpacing === undefined
      ? []
      : [`fo:margin-bottom="${exportOdfLength(properties.lowerSpacing)}"`]),
    ...(properties.lineHeightPercent === undefined
      ? []
      : [`fo:line-height="${properties.lineHeightPercent}%"`]),
    ...(properties.lineHeightTwips === undefined
      ? []
      : [`fo:line-height="${exportOdfLength(properties.lineHeightTwips)}"`]),
    ...(properties.lineHeightAtLeastTwips === undefined
      ? []
      : [`style:line-height-at-least="${exportOdfLength(properties.lineHeightAtLeastTwips)}"`]),
    ...(properties.lineSpacingTwips === undefined
      ? []
      : [`style:line-spacing="${exportOdfLength(properties.lineSpacingTwips)}"`]),
    ...(properties.fontIndependentLineSpacing === undefined
      ? []
      : [`style:font-independent-line-spacing="${properties.fontIndependentLineSpacing}"`]),
    ...(properties.contextualSpacing === undefined
      ? []
      : [`style:contextual-spacing="${properties.contextualSpacing}"`]),
    ...exportParagraphHyphenation(properties.hyphenation),
    ...exportParagraphJustification(properties.justification),
    ...exportParagraphAsianTypography(properties.asianTypography),
    ...(properties.writingMode === undefined
      ? []
      : [`style:writing-mode="${exportWritingDirection(properties.writingMode)}"`]),
    ...(properties.writingModeAutomatic === undefined
      ? []
      : [`style:writing-mode-automatic="${properties.writingModeAutomatic}"`]),
    ...(properties.snapToGrid === undefined
      ? []
      : [`style:snap-to-layout-grid="${properties.snapToGrid}"`]),
    ...(properties.registerModeActive === undefined
      ? []
      : [`style:register-true="${properties.registerModeActive}"`]),
    ...(properties.keepWithNext === undefined
      ? []
      : [`fo:keep-with-next="${properties.keepWithNext ? "always" : "auto"}"`]),
    ...(properties.keepTogether === undefined
      ? []
      : [`fo:keep-together="${properties.keepTogether ? "always" : "auto"}"`]),
    ...(properties.widows === undefined ? [] : [`fo:widows="${properties.widows}"`]),
    ...(verticalAlign === undefined ? [] : [`style:vertical-align="${verticalAlign}"`]),
    ...(properties.orphans === undefined ? [] : [`fo:orphans="${properties.orphans}"`]),
    ...(properties.breakBefore === undefined
      ? []
      : [`fo:break-before="${properties.breakBefore}"`]),
    ...(properties.breakAfter === undefined ? [] : [`fo:break-after="${properties.breakAfter}"`]),
    ...(properties.countLineNumbers === undefined
      ? []
      : [`text:number-lines="${properties.countLineNumbers}"`]),
    ...(properties.lineNumberStartValue === undefined
      ? []
      : [`text:line-number="${properties.lineNumberStartValue}"`]),
  ];
}

/** Emits child elements of supported ODF paragraph properties. @param properties - Direct properties. @returns XML fragment. */
export function exportParagraphPropertyChildren(properties: OdfParagraphProperties): string {
  if (properties.tabStopDetails !== undefined)
    return properties.tabStopDetails.length === 0
      ? "<style:tab-stops/>"
      : `<style:tab-stops>${properties.tabStopDetails
          .map(
            /** Serializes one ODF tab. @param stop - Tab properties. @returns XML. */
            (stop) =>
              `<style:tab-stop style:position="${exportOdfLength(stop.position)}" style:type="${stop.alignment}"${stop.alignment === "char" ? ` style:char="${escapeXml(stop.decimal)}"` : ""}${stop.fill === " " ? "" : ` style:leader-style="${stop.fill === "." ? "dotted" : "solid"}" style:leader-text="${escapeXml(stop.fill)}"`}/>`,
          )
          .join("")}</style:tab-stops>`;
  return "";
}

/** Projects the represented Writer unsigned16 offset through the original signed UNO/XML property. @param offset - Offset or void sentinel. @returns Native XML lexeme. */
function exportPageNumber(offset: number | "auto"): string {
  const value = new Any(),
    output: [string] = [""];
  if (offset !== "auto") value.insert([(offset << 16) >> 16], "sal_Int16");
  new XMLNumberWithAutoForVoidPropHdl().exportXML(output, value, new SvXMLUnitConverter("twip"));
  return output[0];
}

/** Emits native face references and permitted inline members of each script. @param properties - Actual font values. @param fontFaceName - Optional font-face pool. @param includeInlineFont - Named-style compatibility flag. @returns XML attributes. */
function exportCharacterFonts(
  properties: Partial<OdfCharacterProperties>,
  fontFaceName?: FontFaceNameResolver,
  includeInlineFont = false,
): string {
  let result = "";
  for (const [script, suffix] of [
    ["", ""],
    ["Asian", "-asian"],
    ["Complex", "-complex"],
  ] as const) {
    const family = properties[`fontFamily${script}`];
    if (family === undefined) continue;
    const generic = properties[`fontFamilyGeneric${script}`];
    const style = properties[`fontStyleName${script}`];
    const pitch = properties[`fontPitch${script}`];
    const encoding = properties[`fontCharSet${script}`];
    if (fontFaceName) {
      result += ` style:font-name${suffix}="${escapeXml(fontFaceName(family, generic, style, pitch, encoding))}"`;
    }
    if (includeInlineFont || !fontFaceName)
      for (const [name, value] of exportInlineFont(
        {
          familyName: family,
          styleName: style ?? "",
          family: getFontFamilyFromGeneric(generic),
          pitch: pitch ?? FontPitch.PITCH_DONTKNOW,
          charSet: encoding ?? RTL_TEXTENCODING_DONTKNOW,
        },
        suffix,
      ))
        result += ` ${name}="${escapeXml(value)}"`;
  }
  return result;
}

/** Emits supported ODF text-property attributes. @param properties - Direct properties. @param fontFaceName - Optional family-to-face resolver. @param paragraphStyle - Whether the properties belong to a paragraph style. @param includeInlineFont - Whether to include inline font attributes alongside face references. @returns Attribute fragment. */
export function exportCharacterAttributes(
  properties: Partial<OdfCharacterProperties>,
  fontFaceName?: FontFaceNameResolver,
  paragraphStyle = false,
  includeInlineFont = false,
): string {
  assertOdfColor(properties.color, "auto", "font color");
  assertOdfColor(properties.highlight, "transparent", "highlight color");
  return [
    properties.color === undefined
      ? ""
      : properties.color === "auto"
        ? ' style:use-window-font-color="true"'
        : ` fo:color="${escapeXml(properties.color)}"`,
    properties.textTransparency === undefined
      ? ""
      : ` loext:opacity="${100 - properties.textTransparency}%"`,
    exportCharacterFonts(properties, fontFaceName, includeInlineFont),
    properties.fontSizeTwips === undefined
      ? ""
      : ` fo:font-size="${properties.fontSizeTwips / 20}pt"`,
    properties.highlight === undefined
      ? ""
      : ` fo:background-color="${escapeXml(properties.highlight)}"`,
    properties.fontSizeTwipsAsian === undefined
      ? ""
      : ` style:font-size-asian="${properties.fontSizeTwipsAsian / 20}pt"`,
    properties.fontSizeTwipsComplex === undefined
      ? ""
      : ` style:font-size-complex="${properties.fontSizeTwipsComplex / 20}pt"`,
    ...exportTextLanguageProperties(properties).map(
      /** Escapes a locale attribute through the text property serializer. @param attribute - Qualified name and value. @returns XML attribute. */ ([
        name,
        value,
      ]) => ` ${name}="${escapeXml(value)}"`,
    ),
    exportTextCharacterProperties(properties, paragraphStyle),
  ].join("");
}

/** Writes the original text property group, with its element-valued character color when present. @param properties - Native direct properties. @param fontFaceName - Font face resolver. @param paragraph - Paragraph properties carrying optional hyphenation settings. @param includeInlineFont - Whether to include inline font attributes alongside face references. @returns Complete text-properties element. */
export function exportCharacterPropertyElement(
  properties: Partial<OdfCharacterProperties>,
  fontFaceName?: FontFaceNameResolver,
  paragraph?: OdfParagraphProperties,
  includeInlineFont = false,
): string {
  const hyphenation = exportParagraphHyphenation(paragraph?.hyphenation, "text");
  const attributes =
    exportCharacterAttributes(
      properties,
      fontFaceName,
      paragraph !== undefined,
      includeInlineFont,
    ) + (hyphenation.length ? ` ${hyphenation.join(" ")}` : "");
  const child = properties.themeColor
    ? exportComplexColor(createOdfThemeColor(properties.themeColor), "char-complex-color")
    : "";
  return child
    ? `<style:text-properties${attributes}>${child}</style:text-properties>`
    : `<style:text-properties${attributes}/>`;
}

/** Rejects character colors outside the bounded upstream color mapping. @param value - Color value. @param special - Allowed Writer special value. @param label - Diagnostic label. @returns Nothing. */
function assertOdfColor(
  value: string | undefined,
  special: "auto" | "transparent",
  label: string,
): void {
  if (value !== undefined && !/^#[0-9a-f]{6}$/iu.test(value) && value !== special)
    throw new Error(`Unsupported ODF ${label}: ${value}`);
}
