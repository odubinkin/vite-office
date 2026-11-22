/** @fileoverview Keeps the existing portable automatic paragraph-style identity fields together. */
import { ShadowFormat } from "../../../offapi/com/sun/star/table/ShadowFormat";
import type { ShadowLocation } from "../../../offapi/com/sun/star/table/ShadowLocation";
import type { OdfParagraphProperties, OdfTabStop } from "./txtparae";
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
