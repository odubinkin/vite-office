/** @fileoverview Native normal tag alias/redundant/preferred canonicalization responsibilities.
 * Copyright (C) 2011–2015 Akira TAGOH. SPDX-License-Identifier: MPL-2.0
 */
import { ErrorCode, setDiagnostic, type DiagnosticSlot } from "./lt-error";
import { lookupRegistry } from "./lt-registry";
import { cldrLanguageAliases } from "./lt-xml.cldr";
import { lt_strcasecmp } from "./lt-utils";
import {
  TagFilter as F,
  lt_tag_new,
  lt_tag_copy,
  lt_tag_truncate,
  lt_tag_get_string,
  lt_tag_get_string_with_filter,
  type Tag,
} from "./lt-tag";
import { lt_tag_parse } from "./lt-tag.parse";

/** Applies the first source alias under original four-filter precedence. @param tag - Actual owner. @returns Native replacement owner or null. */
function canonicalizeAlias(tag: Tag): Tag | null {
  for (let retry = 4; retry > 0; retry--) {
    const filter =
        F.LANGUAGE |
        F.GRANDFATHERED |
        (retry === 4 || retry === 2 ? F.SCRIPT : 0) |
        (retry === 4 || retry === 3 ? F.REGION : 0),
      value = lt_tag_get_string_with_filter(tag, filter),
      alias = cldrLanguageAliases.find(
        /** Preserves exact XPath equality and excludes macro-language normalization. @param row - Source alias. @returns Match. */
        (row) => row.type.replaceAll("_", "-") === value && row.reason !== "macrolanguage",
      );
    if (!alias) continue;
    const result = lt_tag_new();
    // Every pinned alias replacement parses successfully; the full table invariant is tested.
    lt_tag_parse(result, alias.replacement.replaceAll("_", "-"));
    if ((retry === 1 || retry === 3) && tag.script) result.script = tag.script;
    if ((retry === 1 || retry === 2) && tag.region) result.region = tag.region;
    result.variants.push(...tag.variants);
    if (tag.extension) result.extension = tag.extension;
    if (tag.privateuse) result.privateuse += tag.privateuse;
    // Reachable non-grandfathered aliases change the primary language; native compare is always false.
    return result;
  }
  return null;
}

/** Preserves redundant subtraction/replacement, including the always-present private-use owner. @param tag - Mutable native owner. @param remove - Parsed redundant value. @param replacement - Parsed preferred value. @returns Nothing. */
function replaceRedundant(tag: Tag, remove: Tag, replacement: Tag): void {
  for (const key of ["language", "extlang", "script", "region"] as const) {
    if (remove[key]) tag[key] = null;
  }
  // All25 pinned preferred redundant records have no variant/extension/private components.
  // Both source helpers test the privateuse pointer, which exists even for an empty value.
  tag.privateuse = "";
  for (const key of ["language", "extlang", "script", "region"] as const) {
    if (replacement[key]) {
      // Every preferred field is present in the removed record; source conflict assertions cannot fire.
      tag[key] = replacement[key];
    }
  }
  tag.privateuse = replacement.privateuse;
}

/** Executes original canonicalization with normal or extlang-form language output. @param original - Actual native owner; source may mutate caches and redundant fields. @param extlangForm - Original mode. @param error - Optional output. @returns Canonical value or null on native error. */
function canonicalize(original: Tag, extlangForm: boolean, error?: DiagnosticSlot): string | null {
  const err: DiagnosticSlot = { error: null },
    alias = canonicalizeAlias(original),
    tag = alias ?? original;
  let value = "";
  // All26 pinned grandfathered tags have a valid non-grandfathered CLDR replacement.
  {
    const copy = lt_tag_copy(tag);
    for (;;) {
      const text = lt_tag_get_string(copy);
      if (!text) break;
      const redundant = lookupRegistry("redundant", text);
      if (redundant) {
        if (redundant.preferredTag) {
          const remove = lt_tag_new(),
            replacement = lt_tag_new();
          // All pinned redundant source/preferred records parse successfully (full data test).
          lt_tag_parse(remove, redundant.tag);
          lt_tag_parse(replacement, redundant.preferredTag);
          replaceRedundant(tag, remove, replacement);
        }
        break;
      }
      // A nonempty normal field owner always has a truncatable component.
      lt_tag_truncate(copy);
    }
    if (tag.language) {
      const language = tag.language.preferredTag ?? tag.language.tag;
      if (extlangForm) {
        const extlang = lookupRegistry("extlang", language);
        if (extlang) value += (extlang.prefixes[0] as string) + "-";
      }
      value += language;
      if (tag.extlang) value = tag.extlang.preferredTag as string;
      if (
        tag.script &&
        (!tag.language.suppressScript ||
          lt_strcasecmp(tag.language.suppressScript, tag.script.tag) !== 0)
      )
        value += "-" + tag.script.tag;
      if (tag.region) value += "-" + (tag.region.preferredTag ?? tag.region.tag);
      const length = value.length;
      for (const variant of tag.variants) {
        const better = variant.preferredTag ?? variant.tag;
        if (lt_strcasecmp(variant.tag, better) !== 0) value = value.slice(0, length);
        value += "-" + better;
      }
      if (tag.extension) value += "-" + tag.extension.getCanonicalizedTag();
    }
    if (tag.privateuse) value += (value ? "-" : "") + tag.privateuse;
    if (!value) setDiagnostic(err, "No tag to convert.", ErrorCode.LT_ERR_NO_TAG);
  }
  if (err.error) {
    if (error) error.error = err.error;
    return null;
  }
  return value;
}

/** Canonicalizes the normal source form. @param tag - Actual owner. @param error - Optional diagnostic. @returns Canonical value or null. */
export function lt_tag_canonicalize(tag: Tag, error?: DiagnosticSlot): string | null {
  return canonicalize(tag, false, error);
}

/** Canonicalizes the original extlang form. @param tag - Actual owner. @param error - Optional diagnostic. @returns Canonical value or null. */
export function lt_tag_canonicalize_in_extlang_form(
  tag: Tag,
  error?: DiagnosticSlot,
): string | null {
  return canonicalize(tag, true, error);
}
