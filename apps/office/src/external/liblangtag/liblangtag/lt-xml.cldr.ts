/** @fileoverview Immutable functional CLDR data from liblangtag lt-xml.c loading/merge responsibilities.
 * Copyright (C) 2011–2015 Akira TAGOH. SPDX-License-Identifier: MPL-2.0
 */
import data from "../data/cldr-parsing.json" with { type: "json" };

/** Native BCP47 document positions from lt_xml_cldr_t. */
export type CldrBcp47Group = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** Non-description XML attributes, retaining exact case and source order. */
export interface CldrAttributes {
  readonly [name: string]: string | undefined;
  readonly name: string;
}

/** One source keyword element, including its ordered type elements. */
export interface CldrKeyword {
  readonly attributes: CldrAttributes;
  readonly types: readonly CldrAttributes[];
}

/** Functional source documents; the transform group uses native append-only merge order. */
const groups = data.groups.map(
  /** Freezes one native document's keyword sequence. @param group - Raw keyword data. @returns Immutable document values. */
  (group) =>
    Object.freeze(
      group.map(
        /** Preserves source key/type attribute records. @param key - Native key. @returns Immutable key. */
        (key) =>
          Object.freeze({
            attributes: Object.freeze(key.attributes),
            types: Object.freeze(
              key.types.map(
                /** Freezes original type attributes. @param type - Raw type. @returns Immutable attributes. */
                (type) => Object.freeze(type),
              ),
            ),
          }),
      ),
    ),
);

/** Ordered unfiltered languageAlias values for the pending native canonicalizer. */
export const cldrLanguageAliases = Object.freeze(
  data.languageAliases.map(
    /** Freezes one unfiltered native alias. @param alias - Source alias. @returns Immutable attributes. */
    (alias) => Object.freeze(alias),
  ),
);

/** Borrows one native CLDR keyword group. @param group - Valid source BCP47 document position. @returns Immutable ordered keys, not an XML DOM/service. */
export function getCldrKeywords(group: CldrBcp47Group): readonly CldrKeyword[] {
  return groups[group - 1] as readonly CldrKeyword[];
}
