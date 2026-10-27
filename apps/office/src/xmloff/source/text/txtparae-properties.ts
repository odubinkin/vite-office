/** @fileoverview Keeps the existing portable automatic paragraph-style identity fields together. */
import type { OdfParagraphProperties, OdfTabStop } from "./txtparae";
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
    ...(fields[21] === undefined || fields[21] === "" ? {} : { fillStyle: Number(fields[21]) }),
    ...(fields[22] === undefined || fields[22] === "" ? {} : { fillColor: Number(fields[22]) }),
    ...(fields[23] === undefined || fields[23] === ""
      ? {}
      : { fillTransparency: Number(fields[23]) }),
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
    ...(keepTogether === undefined ? {} : { keepTogether: keepTogether === 1 }),
    ...(widows === undefined ? {} : { widows }),
    ...(orphans === undefined ? {} : { orphans }),
    ...(breakBefore === undefined || breakBefore === ""
      ? {}
      : { breakBefore: breakBefore as "auto" | "page" }),
    ...(breakAfter === undefined || breakAfter === ""
      ? {}
      : { breakAfter: breakAfter as "auto" | "page" }),
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
