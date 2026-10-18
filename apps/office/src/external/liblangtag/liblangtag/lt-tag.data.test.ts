/** @fileoverview Complete pinned-data invariants supporting the normal parser's source-equivalent specializations. */
import { expect, it } from "vitest";
import registry from "../data/language-subtag-registry.json";
import { cldrLanguageAliases } from "./lt-xml.cldr";
import { lt_tag_new } from "./lt-tag";
import { lt_tag_parse } from "./lt-tag.parse";
import { lookupRegistry } from "./lt-registry";

it("proves complete registered key/extlang invariants without synthetic trie aliases", /** Every immutable actual registered normal key maps to its own stored spelling; all extlangs have a prefix/preferred value. @returns Nothing. */ () => {
  for (const row of registry.language)
    if (row.tag !== "*") {
      expect(lookupRegistry("language", row.tag.toUpperCase())?.tag).toBe(row.tag);
      expect(row.tag.length >= 2 && row.tag.length <= 3).toBe(true);
    }
  for (const row of registry.extlang)
    if (row.tag && row.tag !== "*") {
      expect(row.prefixes).toHaveLength(1);
      expect(row.prefixes[0]).not.toBe("");
      expect(row.preferredTag).toBe(row.tag);
    }
});

it("proves all alias targets are valid normal tags and no reachable non-grandfathered alias is an identity", /** These are full static-data properties; they do not fabricate a successful parser backend. @returns Nothing. */ () => {
  for (const row of cldrLanguageAliases) {
    const tag = lt_tag_new();
    expect(lt_tag_parse(tag, row.replacement.replaceAll("_", "-"))).toBe(true);
    expect(tag.grandfathered).toBeNull();
    if (
      row.reason !== "macrolanguage" &&
      /^[a-z]{2,3}(?:_[A-Z][a-z]{3})?(?:_(?:[A-Z]{2}|[0-9]{3}))?$/.test(row.type)
    )
      expect(row.type.split("_")[0]).not.toBe(row.replacement.split("_")[0]);
  }
  for (const row of registry.grandfathered) {
    const alias = cldrLanguageAliases.find(
      /** Selects the source exact grandfathered alias. @param a - Row. @returns Match. */ (a) =>
        a.type.replaceAll("_", "-") === row.tag && a.reason !== "macrolanguage",
    );
    expect(alias).toBeDefined();
  }
});

it("proves all redundant preferred targets fit the source subtraction/replacement fields", /** No pinned preferred redundant record has variants/extensions/private use or conflicting added fields. @returns Nothing. */ () => {
  let count = 0;
  for (const row of registry.redundant)
    if (row.preferredTag) {
      const remove = lt_tag_new(),
        replacement = lt_tag_new();
      expect(lt_tag_parse(remove, row.tag)).toBe(true);
      expect(lt_tag_parse(replacement, row.preferredTag)).toBe(true);
      for (const tag of [remove, replacement]) {
        expect(tag.variants).toEqual([]);
        expect(tag.extension).toBeNull();
        expect(tag.privateuse).toBe("");
      }
      for (const key of ["language", "extlang", "script", "region"] as const)
        if (replacement[key]) expect(remove[key]).not.toBeNull();
      count++;
    }
  expect(count).toBe(25);
});
