/** @fileoverview Maps native paragraph hyphenation properties for ODF import and export. */
import { Converter } from "../../../sax/source/tools/converter";
import type { FastAttributeList } from "../core/xmlimp";
import { XMLToken as T } from "../core/xmltoken";

/** Native paragraph property names, tokens and scalar types for ODF hyphenation. */
export const hyphenationProperties = [
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

/** Native paragraph hyphenation syntax used in text and paragraph property elements. */
export const paragraphHyphenationTokens = hyphenationProperties.map(
  /** Selects the attribute token from the property row. @param row - Native property mapping. @returns The ODF token. */
  ([, token]) => token,
);

const hyphenationTextFields = new Set([
  "hyphen",
  "minLead",
  "minTrail",
  "noCaps",
  "noLastWord",
  "minWordLength",
  "zone",
  "paragraphEndZone",
  "columnEndZone",
  "pageEndZone",
  "spreadEndZone",
  "compoundMinLead",
  "compoundMinTrail",
]);
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

/** Exports the original ODF hyphenation attribute forms. @param settings - Direct paragraph item. @param group - ODF property element to write. @returns XML attributes. */
export function exportParagraphHyphenation(
  settings?: OdfParagraphHyphenation,
  group: "paragraph" | "text" = "paragraph",
): string[] {
  if (settings === undefined) return [];
  const attributes: string[] = [];
  for (const [key, , name, , kind] of hyphenationProperties) {
    if ((group === "text") !== hyphenationTextFields.has(key)) continue;
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
