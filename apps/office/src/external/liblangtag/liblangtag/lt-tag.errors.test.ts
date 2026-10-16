/** @fileoverview Normal parser errors and original extension-container transitions. */
import { expect, it } from "vitest";
import { lt_tag_new, lt_tag_truncate, lt_tag_clear } from "./lt-tag";
import { lt_tag_parse, lt_tag_parse_with_extra_token } from "./lt-tag.parse";
import { lt_tag_canonicalize, lt_tag_canonicalize_in_extlang_form } from "./lt-tag.canonicalize";
import { ExtensionData } from "./lt-extension";
import type { DiagnosticSlot } from "./lt-error";

for (const input of [
  "",
  "--",
  "en--US",
  "en-",
  "abcd",
  "abcde",
  "abcdefghi",
  "zh-aao",
  "a",
  "en-a-foo-a-bar",
  "en-a-abcdefghi",
  "en-fonipa-fonipa",
  "en-a-foo-abcdefghi",
  "x-abcdefghi",
  "en-u-zz",
  "en-t-zz",
  "en-abc",
  "en-1234",
  "en-999",
  "en-123456789",
  "en-123",
  "en-1ab",
  "en-1",
  "en-a-*",
]) {
  it(`rejects original malformed normal tag ${JSON.stringify(input)}`, /** Each case targets real scanner/state/registry or callback failure, without modifying private data. @returns Nothing. */ () => {
    const tag = lt_tag_new(),
      error: DiagnosticSlot = { error: null };
    expect(lt_tag_parse(tag, input, error)).toBe(false);
    expect(error.error?.code).toBe(4);
  });
}

it("preserves optional diagnostics, empty failures and incremental invalid-state behavior", /** Original successful calls leave existing caller diagnostics untouched. @returns Nothing. */ () => {
  const tag = lt_tag_new(),
    error: DiagnosticSlot = { error: { code: 3, message: "seed" } },
    before = error.error;
  expect(lt_tag_truncate(tag)).toBe(false);
  expect(lt_tag_canonicalize(tag)).toBeNull();
  expect(lt_tag_parse(tag, "en", error)).toBe(true);
  expect(error.error).toBe(before);
  expect(lt_tag_parse(tag, "en-a-foo")).toBe(true);
  expect(lt_tag_parse_with_extra_token(tag, "bar", error)).toBe(false);
  expect(error.error?.message).toContain("Unable to parse tag:");
  lt_tag_clear(tag);
  expect(lt_tag_parse_with_extra_token(tag, "bar", error)).toBe(false);
  expect(error.error?.message).toContain("(null)");
  expect(lt_tag_canonicalize_in_extlang_form(lt_tag_new())).toBeNull();
  expect(lt_tag_parse(tag, "en-u-ca-a-foo")).toBe(true);
  expect(lt_tag_canonicalize(tag)).toBe("en-a-foo-u-ca");
});

it("preserves container defaults,cancellation,truncation and payload comparison", /** Actual parsed parent fields and real callbacks cover copied/native cache behavior. @returns Nothing. */ () => {
  const parent = lt_tag_new(),
    a = new ExtensionData(),
    b = new ExtensionData();
  expect(lt_tag_parse(parent, "en")).toBe(true);
  expect(a.validateState()).toBe(true);
  expect(a.truncate()).toBe(false);
  a.cancelTag();
  expect(a.equals(a)).toBe(true);
  expect(a.equals(null)).toBe(false);
  expect(a.equals(b)).toBe(true);
  expect(a.addSingleton("a", parent)).toBeNull();
  expect(a.addTag("Foo")).toBeNull();
  expect(a.addTag("Bar")).toBeNull();
  expect(a.validateState()).toBe(true);
  expect(a.equals(b)).toBe(false);
  expect(b.equals(a)).toBe(false);
  expect(a.getCanonicalizedTag()).toBe("a-Foo-Bar");
  a.cancelTag();
  expect(a.getTag()).toBe("");
  expect(a.isEmpty()).toBe(true);
  expect(a.addSingleton("A", parent)).toBeNull();
  expect(a.addTag("Foo")).toBeNull();
  a.cancelTag();
  expect(a.getTag()).toBe("A-Foo");
  expect(a.validateState()).toBe(true);
  expect(b.addSingleton("b", parent)).toBeNull();
  expect(b.truncate()).toBe(true);
  expect(b.validateState()).toBe(false);
  b.cancelTag();
  expect(b.getCanonicalizedTag()).toBe("");
});
