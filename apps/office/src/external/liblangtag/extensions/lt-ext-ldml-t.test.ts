/** @fileoverview Native transform callback states connected to the actual general parser. */
import { expect, it } from "vitest";
import { TransformExtensionData } from "./lt-ext-ldml-t";
import { lt_tag_new } from "../liblangtag/lt-tag";
import { lt_tag_parse } from "../liblangtag/lt-tag.parse";
import { lt_tag_canonicalize } from "../liblangtag/lt-tag.canonicalize";
import { getCldrKeywords } from "../liblangtag/lt-xml.cldr";
import type { TagDiagnostic } from "../liblangtag/lt-error";

for (const [input, expected] of [
  ["en-t-de", "en-t-de"],
  ["en-t-de-Latn", "en-t-de-Latn"],
  ["en-t-de-DE", "en-t-de-DE"],
  ["en-t-de-Latn-DE", "en-t-de-Latn-DE"],
  ["en-t-de-1901", "en-t-de-1901"],
  ["en-t-de-DE-1901", "en-t-de-DE-1901"],
  ["en-t-de-Latn-1901", "en-t-de-Latn-1901"],
  ["en-t-sl-rozaj-biske", "en-t-sl-rozaj-biske"],
  ["en-t-de-m0-UNGEGN", "en-t-de-m0-ungegn"],
  ["en-t-m0-UNGEGN", "en-t-m0-ungegn"],
  ["en-t-m0-ungegn-x0-Private", "en-t-m0-ungegn-x0-private"],
  ["en-t-x0-Private-123", "en-t-x0-private-123"],
  ["en-t-m0", "en-t-m0"],
  ["en-t-X0-Private", "en-t-x0-private"],
  ["en-t-sh", "en-t-sh"],
] as const)
  it(`preserves native transform grammar/output ${input}`, /** Expected vectors are source-derived, not native execution. @returns Nothing. */ () => {
    const tag = lt_tag_new();
    expect(lt_tag_parse(tag, input)).toBe(true);
    expect(lt_tag_canonicalize(tag)).toBe(expected);
  });

for (const [tokens, message] of [
  [["zz"], "Unknown ISO 639 code: zz"],
  [["x-foo"], "No such language subtag: x-foo"],
  [["zh", "cmn"], "Extlang tag isn't allowed: cmn"],
  [["de", "Abcd"], "Invalid tag: Abcd, last token = 'Abcd', state = 3, parsed count = 1"],
  [["de", "Latn", "Abcd"], "Invalid tag: Abcd, last token = 'Abcd', state = 7, parsed count = 1"],
  [["de", "DE", "bogus"], "Invalid tag: bogus, last token = 'bogus', state = 9, parsed count = 1"],
  [["de", "a-foo"], "Extension tag isn't allowed"],
  [["de", "x-foo"], "PrivateUse tag isn't allowed"],
  [["m0", "ab"], "Invalid syntax: expected to see an field value, but `ab'"],
  [["m0", "abcdefghi"], "Invalid syntax: expected to see an field value, but `abcdefghi'"],
  [["m0", "bogus"], "Unknown -t- extension type: bogus"],
  [["M0", "ungegn"], "Unknown -t- extension type: ungegn"],
  [["x0", "a_b"], "subtag for -t-x0- has to be 3-8 alphanum characters but: a_b"],
  [["de", "m0", "ungegn", "x0"], "Invalid syntax: expected to see an field value, but `x0'"],
] as const)
  it(`preserves native transform callback diagnostic ${tokens.join("-")}`, /** Direct callback calls include source defensive checks beyond the outer scanner's token domain. @returns Nothing. */ () => {
    const data = new TransformExtensionData();
    let error: TagDiagnostic | null = null;
    for (const token of tokens) error = data.parseTag(token);
    expect(error).toEqual({ code: 4, message });
    expect(data.validateTag()).toBe(true);
  });

it("preserves callback defaults and every scanner-compatible registered transform type", /** Uses the real merged pinned source data; no substitute nested tag parser. @returns Nothing. */ () => {
  const empty = new TransformExtensionData();
  expect(empty.getSingleton()).toBe("t");
  expect(empty.getTag()).toBe("");
  expect(empty.validateTag()).toBe(true);
  for (const key of getCldrKeywords(6))
    for (const type of key.types) {
      if (!/^[A-Za-z0-9]{3,8}$/.test(type.name)) continue;
      const data = new TransformExtensionData();
      expect(data.parseTag(key.attributes.name)).toBeNull();
      expect(data.parseTag(type.name.toUpperCase())).toBeNull();
      expect(data.getTag()).toBe(key.attributes.name + "-" + type.name.toLowerCase());
    }
  const data = new TransformExtensionData();
  for (const token of ["m0", "ungegn", "bgn"]) expect(data.parseTag(token)).toBeNull();
  expect(data.getTag()).toBe("m0-ungegn-bgn");
});
