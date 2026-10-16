/** @fileoverview Actual normal tag lifecycle, asymmetric comparison and native cache/aliasing contracts. */
import { expect, it } from "vitest";
import {
  TagState as S,
  TagFilter as F,
  lt_tag_new,
  lt_tag_clear,
  lt_tag_copy,
  lt_tag_truncate,
  lt_tag_get_string,
  lt_tag_get_string_with_filter,
  lt_tag_compare,
} from "./lt-tag";
import { lt_tag_parse, lt_tag_parse_with_extra_token } from "./lt-tag.parse";
import { lt_tag_canonicalize, lt_tag_canonicalize_in_extlang_form } from "./lt-tag.canonicalize";
import type { DiagnosticSlot } from "./lt-error";

/** Creates a genuinely parsed native owner. @param text - Normal input. @returns Actual owner. */
function parsed(text: string) {
  const tag = lt_tag_new();
  expect(lt_tag_parse(tag, text)).toBe(true);
  return tag;
}

it("preserves original constructor defaults, clear and incremental NONE precondition", /** Clear intentionally retains state/filter while public parse resets state. @returns Nothing. */ () => {
  const tag = lt_tag_new(),
    error: DiagnosticSlot = { error: null };
  expect(tag).toEqual({
    wildcardMap: 0,
    state: 0,
    tagStringFilter: 0,
    tagString: null,
    language: null,
    extlang: null,
    script: null,
    region: null,
    variants: [],
    extension: null,
    privateuse: "",
    grandfathered: null,
  });
  expect(lt_tag_get_string(tag)).toBeNull();
  expect(lt_tag_parse_with_extra_token(tag, "en", error)).toBe(false);
  expect(error.error).toBeNull();
  expect(lt_tag_canonicalize(tag, error)).toBeNull();
  expect(error.error).toEqual({ code: 5, message: "No tag to convert." });
  expect(lt_tag_parse(tag, "en")).toBe(true);
  expect(lt_tag_parse_with_extra_token(tag, "US")).toBe(true);
  expect(lt_tag_get_string(tag)).toBe("en-US");
  lt_tag_clear(tag);
  expect(tag.state).toBe(S.PRE_VARIANT);
  expect(tag.tagStringFilter).toBe(F.ALL);
  expect(lt_tag_get_string(tag)).toBeNull();
  expect(lt_tag_parse(tag, "de")).toBe(true);
  expect(tag.state).toBe(S.PRE_EXTLANG);
});

it("preserves every native filtered field, null cache and cached ALL values", /** Uses actual registered fields including extlang and variant without redundant zh aliases. @returns Nothing. */ () => {
  const tag = parsed("ar-aao-Latn-DZ-fonipa-a-Foo-x-Case"),
    filters = [
      [F.LANGUAGE, "ar"],
      [F.EXTLANG, "aao"],
      [F.SCRIPT, "Latn"],
      [F.REGION, "DZ"],
      [F.VARIANT, "fonipa"],
      [F.EXTENSION, "a-Foo"],
      [F.PRIVATEUSE, "x-Case"],
      [F.GRANDFATHERED, null],
      [F.NONE, null],
    ] as const;
  for (const [filter, value] of filters)
    expect(lt_tag_get_string_with_filter(tag, filter)).toBe(value);
  expect(lt_tag_get_string(tag)).toBe("ar-aao-Latn-DZ-fonipa-a-Foo-x-Case");
  expect(lt_tag_get_string(tag)).toBe("ar-aao-Latn-DZ-fonipa-a-Foo-x-Case");
  const grandfathered = parsed("I-KLINGON");
  expect(lt_tag_get_string(grandfathered)).toBe("i-klingon");
  expect(lt_tag_get_string_with_filter(grandfathered, F.LANGUAGE)).toBeNull();
  expect(lt_tag_get_string_with_filter(grandfathered, F.GRANDFATHERED)).toBe("i-klingon");
  const privateTag = parsed("X-Case");
  expect(lt_tag_get_string(privateTag)).toBe("X-Case");
  expect(lt_tag_get_string_with_filter(privateTag, F.LANGUAGE)).toBeNull();
  expect(lt_tag_get_string_with_filter(privateTag, F.PRIVATEUSE)).toBe("X-Case");
});

it("truncates original component order without resetting parser state or extension cache", /** The native container truncate removes callback entries but keeps its original cache. @returns Nothing. */ () => {
  const tag = parsed("ar-aao-Latn-DZ-fonipa-a-Foo-b-Bar-x-Case"),
    state = tag.state;
  for (const value of [
    "ar-aao-Latn-DZ-fonipa-a-Foo-b-Bar",
    "ar-aao-Latn-DZ-fonipa-a-Foo-b-Bar",
    "ar-aao-Latn-DZ-fonipa",
    "ar-aao-Latn-DZ",
    "ar-aao-Latn",
    "ar-aao",
    "ar",
    null,
  ]) {
    expect(lt_tag_truncate(tag)).toBe(true);
    expect(lt_tag_get_string(tag)).toBe(value);
    expect(tag.state).toBe(state);
  }
  const error: DiagnosticSlot = { error: null };
  expect(lt_tag_truncate(tag, error)).toBe(false);
  expect(error.error).toEqual({ code: 5, message: "No tags to be truncated." });
  expect(lt_tag_truncate(parsed("i-default"), error)).toBe(false);
  expect(error.error).toEqual({ code: 5, message: "Grandfathered subtag can't be truncated." });
});

it("copies native fields/lists independently and shares actual extension callback data", /** This is observable logical sharing under JS GC, not a reference-count engine. @returns Nothing. */ () => {
  const original = parsed("en-u-ca-gregory"),
    copy = lt_tag_copy(original);
  expect(copy.tagString).toBeNull();
  expect(copy.tagStringFilter).toBe(0);
  expect(copy.variants).not.toBe(original.variants);
  expect(copy.extension).not.toBe(original.extension);
  expect(copy.extension?.addTag("buddhist")).toBeNull();
  expect(original.extension?.getTag()).toBe("u-ca-gregory");
  expect(copy.extension?.getTag()).toBe("u-ca-gregory-buddhist");
  expect(original.extension?.getCanonicalizedTag()).toBe("u-ca-gregory-buddhist");
  expect(lt_tag_truncate(copy)).toBe(true);
  expect(original.extension?.isEmpty()).toBe(false);
});

it("preserves native normal-tag asymmetric comparison and private ASCII comparison", /** The second argument's absent optional fields do not constrain the first. @returns Nothing. */ () => {
  const full = parsed("ar-aao-Latn-DZ-fonipa-a-foo-x-Case"),
    short = parsed("ar");
  expect(lt_tag_compare(full, full)).toBe(true);
  expect(lt_tag_compare(full, short)).toBe(true);
  expect(lt_tag_compare(short, full)).toBe(false);
  expect(lt_tag_compare(parsed("x-Case"), parsed("x-case"))).toBe(true);
  expect(lt_tag_compare(parsed("x-Other"), parsed("x-case"))).toBe(false);
  expect(lt_tag_compare(parsed("de"), parsed("en"))).toBe(false);
  expect(lt_tag_compare(parsed("i-default"), parsed("i-default"))).toBe(false);
  expect(lt_tag_compare(parsed("en-a-foo"), parsed("en-a-foo"))).toBe(true);
  expect(lt_tag_compare(parsed("en-a-foo"), parsed("en-a-bar"))).toBe(false);
});

it("preserves alias suffixes,extlang-form misses and private-only canonical values", /** Independent source-derived normal cases. @returns Nothing. */ () => {
  expect(lt_tag_canonicalize(parsed("sh-Arab-AQ-a-Foo-x-Bar"))).toBe("sr-Arab-AQ-a-Foo-x-Bar");
  expect(lt_tag_canonicalize(parsed("sh-AQ"))).toBe("sr-Latn-AQ");
  expect(lt_tag_canonicalize(parsed("sgn-Latn-BR"))).toBe("bzs-Latn");
  expect(lt_tag_canonicalize(parsed("x-FOO"))).toBe("x-FOO");
  expect(lt_tag_canonicalize_in_extlang_form(parsed("en-US"))).toBe("en-US");
  expect(lt_tag_canonicalize(parsed("zh-cmn-x-FOO"))).toBe("cmn");
  expect(lt_tag_canonicalize(parsed("x-*"))).toBe("x-*");
  const variants = parsed("sl-rozaj-biske");
  expect(lt_tag_get_string(variants)).toBe("sl-rozaj-sl-rozaj-biske");
  expect(lt_tag_canonicalize(variants)).toBe("sl-rozaj-biske");
});
