/** @fileoverview Paragraph hyphenation property rows from the native text and paragraph XML maps. */
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import * as KeepType from "../../../offapi/com/sun/star/text/ParagraphHyphenationKeepType";
import type { FastAttributeList } from "../core/xmlimp";
import { XMLToken as T } from "../core/xmltoken";
import { SvXMLUnitConverter } from "../core/xmluconv";
import { XMLNamedBoolPropertyHdl } from "../style/NamedBoolPropertyHdl";
import { XMLConstantsPropertyHandler } from "../style/XMLConstantsPropertyHandler";
import {
  XMLBoolPropHdl,
  XMLNumberNonePropHdl,
  XMLNumberWithoutZeroPropHdl,
} from "../style/xmlbahdl";

const converter = new SvXMLUnitConverter("twip");
const bool = new XMLBoolPropHdl();
const numberNone = new XMLNumberNonePropHdl(2);
const nonzero = new XMLNumberWithoutZeroPropHdl(2);
const keep = new XMLNamedBoolPropertyHdl("page", "auto");
const keepType = new XMLConstantsPropertyHandler(
  [
    ["always", KeepType.ALWAYS],
    ["auto", KeepType.AUTO],
    ["column", KeepType.COLUMN],
    ["page", KeepType.PAGE],
    ["spread", KeepType.SPREAD],
  ],
  null,
);

/** Original property name, token, export name, UNO type and group. */
export const paragraphHyphenationMap = [
  ["ParaIsHyphenation", T.FO_HYPHENATE, "fo:hyphenate", "bool", bool, "text"],
  [
    "ParaHyphenationMaxLeadingChars",
    T.FO_HYPHENATION_REMAIN_CHAR_COUNT,
    "fo:hyphenation-remain-char-count",
    "sal_Int16",
    nonzero,
    "text",
  ],
  [
    "ParaHyphenationMaxTrailingChars",
    T.FO_HYPHENATION_PUSH_CHAR_COUNT,
    "fo:hyphenation-push-char-count",
    "sal_Int16",
    nonzero,
    "text",
  ],
  [
    "ParaHyphenationMaxHyphens",
    T.FO_HYPHENATION_LADDER_COUNT,
    "fo:hyphenation-ladder-count",
    "sal_Int16",
    numberNone,
    "paragraph",
  ],
  [
    "ParaHyphenationNoCaps",
    T.LOEXT_HYPHENATION_NO_CAPS,
    "loext:hyphenation-no-caps",
    "bool",
    bool,
    "text",
  ],
  [
    "ParaHyphenationNoLastWord",
    T.LOEXT_HYPHENATION_NO_LAST_WORD,
    "loext:hyphenation-no-last-word",
    "bool",
    bool,
    "text",
  ],
  [
    "ParaHyphenationMinWordLength",
    T.LOEXT_HYPHENATION_WORD_CHAR_COUNT,
    "loext:hyphenation-word-char-count",
    "sal_Int16",
    numberNone,
    "text",
  ],
  [
    "ParaHyphenationZone",
    T.LOEXT_HYPHENATION_ZONE,
    "loext:hyphenation-zone",
    "sal_Int16",
    numberNone,
    "text",
  ],
  [
    "ParaHyphenationZoneAlways",
    T.LOEXT_HYPHENATION_ZONE_ALWAYS,
    "loext:hyphenation-zone-always",
    "sal_Int16",
    numberNone,
    "text",
  ],
  [
    "ParaHyphenationZoneColumn",
    T.LOEXT_HYPHENATION_ZONE_COLUMN,
    "loext:hyphenation-zone-column",
    "sal_Int16",
    numberNone,
    "text",
  ],
  [
    "ParaHyphenationZonePage",
    T.LOEXT_HYPHENATION_ZONE_PAGE,
    "loext:hyphenation-zone-page",
    "sal_Int16",
    numberNone,
    "text",
  ],
  [
    "ParaHyphenationZoneSpread",
    T.LOEXT_HYPHENATION_ZONE_SPREAD,
    "loext:hyphenation-zone-spread",
    "sal_Int16",
    numberNone,
    "text",
  ],
  [
    "ParaHyphenationCompoundMinLeadingChars",
    T.LOEXT_HYPHENATION_COMPOUND_REMAIN_CHAR_COUNT,
    "loext:hyphenation-compound-remain-char-count",
    "sal_Int16",
    numberNone,
    "text",
  ],
  [
    "ParaHyphenationCompoundMinTrailingChars",
    T.LOEXT_HYPHENATION_COMPOUND_PUSH_CHAR_COUNT,
    "loext:hyphenation-compound-push-char-count",
    "sal_Int16",
    numberNone,
    "text",
  ],
  ["ParaHyphenationKeep", T.FO_HYPHENATION_KEEP, "fo:hyphenation-keep", "bool", keep, "paragraph"],
  [
    "ParaHyphenationKeepType",
    T.LOEXT_HYPHENATION_KEEP_TYPE,
    "loext:hyphenation-keep-type",
    "sal_Int16",
    keepType,
    "paragraph",
  ],
  [
    "ParaHyphenationKeepLine",
    T.LOEXT_HYPHENATION_KEEP_LINE,
    "loext:hyphenation-keep-line",
    "bool",
    bool,
    "paragraph",
  ],
] as const;

/** UNO properties shared by the two ODF style groups. */
export type OdfHyphenationProperties = Partial<
  Record<(typeof paragraphHyphenationMap)[number][0], number | boolean>
>;
/** Style property group from the original paragraph property map. */
type HyphenationGroup = "text" | "paragraph";

/** Returns known text-group attribute tokens at the paragraph style boundary. @param group - Native group. @returns Tokens. */
export function hyphenationPropertyTokens(group: HyphenationGroup): readonly T[] {
  const tokens: T[] = [];
  for (const [, token, , , , propertyGroup] of paragraphHyphenationMap)
    if (propertyGroup === group) tokens.push(token);
  return tokens;
}

/** Imports successfully converted properties for one style group. @param attributes - XML attributes. @param group - Native group. @returns UNO property values. */
export function importHyphenationProperties(
  attributes: FastAttributeList,
  group: HyphenationGroup,
): OdfHyphenationProperties | undefined {
  const result: OdfHyphenationProperties = {};
  const value = new Any();
  try {
    for (const [key, token, , type, handler, propertyGroup] of paragraphHyphenationMap) {
      if (propertyGroup !== group) continue;
      const input = attributes.get(token);
      if (input === null || !handler.importXML(input, value, converter)) continue;
      const scalar: [boolean | number] = [0];
      if (value.extract(scalar, type)) result[key] = scalar[0];
    }
    return Object.keys(result).length ? result : undefined;
  } finally {
    value.dispose();
  }
}

/** Serializes represented members into their original ODF group. @param properties - Native UNO values. @param group - Native group. @returns Qualified XML attributes. */
export function exportHyphenationProperties(
  properties: OdfHyphenationProperties | undefined,
  group: HyphenationGroup,
): string[] {
  if (properties === undefined) return [];
  const attributes: string[] = [];
  const value = new Any();
  const output: [string] = [""];
  try {
    for (const [key, , name, type, handler, propertyGroup] of paragraphHyphenationMap) {
      if (propertyGroup !== group || properties[key] === undefined) continue;
      value.insert([properties[key]], type);
      output[0] = "";
      if (handler.exportXML(output, value, converter)) attributes.push(`${name}="${output[0]}"`);
    }
    return attributes;
  } finally {
    value.dispose();
  }
}
