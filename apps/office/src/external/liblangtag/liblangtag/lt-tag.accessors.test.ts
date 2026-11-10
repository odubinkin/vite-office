/** @fileoverview Original liblangtag borrowed subtag/list/tag-value contracts used by LanguageTag. */
import { expect, it } from "vitest";
import {
  lt_tag_new,
  lt_tag_get_language,
  lt_tag_get_script,
  lt_tag_get_region,
  lt_tag_get_variants,
} from "./lt-tag";
import { lt_tag_parse } from "./lt-tag.parse";
import { lt_lang_get_tag } from "./lt-lang";
import { lt_script_get_tag } from "./lt-script";
import { lt_region_get_tag } from "./lt-region";
import { lt_variant_get_tag } from "./lt-variant";

it("retains null guards and absent pointers without synthesizing values", /** Checks both original getter layers and the native empty-list representation. @returns Nothing. */ () => {
  for (const getter of [
    lt_tag_get_language,
    lt_tag_get_script,
    lt_tag_get_region,
    lt_tag_get_variants,
  ]) {
    expect(getter(null)).toBeNull();
    expect(getter(lt_tag_new())).toBeNull();
  }
  for (const getter of [lt_lang_get_tag, lt_script_get_tag, lt_region_get_tag, lt_variant_get_tag])
    expect(getter(null)).toBeNull();
});

it("borrows real parsed subtag/list identities and preserves tag spelling", /** Uses actual registered owners rather than fabricated value snapshots. @returns Nothing. */ () => {
  const parsed = lt_tag_new();
  expect(lt_tag_parse(parsed, "de-Latn-DE")).toBe(true);
  expect(lt_tag_get_language(parsed)).toBe(parsed.language);
  expect(lt_tag_get_script(parsed)).toBe(parsed.script);
  expect(lt_tag_get_region(parsed)).toBe(parsed.region);
  expect(lt_tag_get_variants(parsed)).toBeNull();
  expect(lt_lang_get_tag(lt_tag_get_language(parsed))).toBe("de");
  expect(lt_script_get_tag(lt_tag_get_script(parsed))).toBe("Latn");
  expect(lt_region_get_tag(lt_tag_get_region(parsed))).toBe("DE");
  const variants = lt_tag_new();
  expect(lt_tag_parse(variants, "sl-rozaj-biske")).toBe(true);
  expect(lt_tag_get_variants(variants)).toBe(variants.variants);
  expect((lt_tag_get_variants(variants) ?? []).map(lt_variant_get_tag)).toEqual(["rozaj", "biske"]);
});
