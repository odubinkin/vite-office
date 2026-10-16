/** @fileoverview Original Unicode-extension QA slices and complete private callback transitions. */
import { expect, it } from "vitest";
import { UnicodeExtensionData, precheckUnicodeExtension } from "./lt-ext-ldml-u";
import { lookupRegistry } from "../liblangtag/lt-registry";
import { getCldrKeywords, type CldrBcp47Group } from "../liblangtag/lt-xml.cldr";
import { TagScanner } from "../liblangtag/lt-tag.scanner";
import type { DiagnosticSlot } from "../liblangtag/lt-error";

/** Feeds real scanner tokens to the actual module callback, without a substitute general parser. @param payload - Extension payload without u singleton. @returns Data and first diagnostic. */
function parsePayload(payload: string) {
  const data = new UnicodeExtensionData(),
    scanner = new TagScanner(new TextEncoder().encode(payload)),
    output = { token: null as string | null, length: 0 },
    error: DiagnosticSlot = { error: null };
  while (!scanner.isEof()) {
    if (!scanner.getToken(output, error)) return { data, diagnostic: error.error };
    if (output.token !== "-") {
      const diagnostic = data.parseTag(output.token as string);
      if (diagnostic) return { data, diagnostic };
    }
  }
  return { data, diagnostic: null };
}

for (const [payload, accepted, output] of [
  ["tz", true, "tz"],
  ["vt-0061", true, "vt-0061"],
  ["vt-0061-0065", true, "vt-0061-0065"],
  ["vt-A0", false, "a0-vt"],
  ["vt-CODEPOINTS", false, "vt"],
  ["vt-U060C", false, "vt"],
  ["vt-110000", false, "vt"],
  ["vt-10D40C", true, "vt-10d40c"],
] as const)
  it(`replays native Unicode-extension QA slice ${payload}`, /** These are module slices of check-tag.c; no enclosing grammar or native executable is claimed. @returns Nothing. */ () => {
    const { data, diagnostic } = parsePayload(payload);
    expect(diagnostic === null).toBe(accepted);
    expect(data.getTag()).toBe(output.toLowerCase());
  });

for (const [payload, expected] of [
  ["", ""],
  ["Zebra-APPLE-apple-foo-ca-GREGORY", "APPLE-apple-foo-Zebra-ca-gregory"],
  ["nu-latn-ca-islamicc", "ca-islamicc-nu-latn"],
  ["ca-gregory-ca-buddhist", "ca-buddhist-ca-gregory"],
  ["foo-foo", "foo-foo"],
  ["CA", "ca"],
  ["m0-ungegn", "m0-ungegn"],
  ["vt-D800", "vt-d800"],
  ["vt-0000-10ffff", "vt-0000-10ffff"],
] as const)
  it(`preserves source successful output ${payload}`, /** Attributes retain spelling and duplicates; keyword containers sort/fold without modern aliases. @returns Nothing. */ () => {
    const { data, diagnostic } = parsePayload(payload);
    expect(diagnostic).toBeNull();
    expect(data.getSingleton()).toBe("u");
    expect(data.getTag()).toBe(expected);
    expect(data.getTag()).toBe(expected);
    expect(data.validateTag()).toBe(true);
  });

for (const [tokens, message] of [
  [["a"], "Invalid syntax: expected to see an attribute or a key, but `a'"],
  [["abcdefghi"], "Invalid syntax: expected to see an attribute or a key, but `abcdefghi'"],
  [["foo", "a"], "Invalid syntax: expected to see a key, but `a'"],
  [["foo", "abcdefghi"], "Invalid syntax: expected to see a key, but `abcdefghi'"],
  [["ca", "a"], "Invalid syntax: expected to see a type or a key, but `a'"],
  [["ca", "abcdefghi"], "Invalid syntax: expected to see a type or a key, but `abcdefghi'"],
  [["zz"], "Invalid key for -u- extension: zz"],
  [["CA", "gregory"], "Unknown -u- extension type: gregory"],
  [["ca", "foobar"], "Unknown -u- extension type: foobar"],
  [["vt", "zzz0"], "Unknown -u- extension type: zzz0"],
  [["vt", "0061\n"], "Unknown -u- extension type: 0061\n"],
  [["vt", "fff"], "Unknown -u- extension type: fff"],
  [["vt", "0ffffff"], "Unknown -u- extension type: 0ffffff"],
  [["rg", "uszzzz"], "Unknown -u- extension type: uszzzz"],
] as const)
  it(`retains callback diagnostics ${tokens.join("-")}`, /** Calls the real callback boundary for all original state/error branches. @returns Nothing. */ () => {
    const data = new UnicodeExtensionData();
    let diagnostic = null;
    for (const token of tokens) diagnostic = data.parseTag(token);
    expect(diagnostic).toEqual({ code: 4, message });
    expect(data.validateTag()).toBe(true);
  });

it("uses every registered short alphanumeric type and key without alias substitution", /** Iterates complete pinned data; only scanner-producible length3..8 literal type names are fed to the type callback. @returns Nothing. */ () => {
  let types = 0;
  for (let group = 1; group <= 7; group++)
    for (const key of getCldrKeywords(group as CldrBcp47Group)) {
      const bare = new UnicodeExtensionData();
      expect(bare.parseTag(key.attributes.name)).toBeNull();
      for (const type of key.types) {
        if (!/^[A-Za-z0-9]{3,8}$/.test(type.name)) continue;
        const data = new UnicodeExtensionData();
        expect(data.parseTag(key.attributes.name)).toBeNull();
        expect(data.parseTag(type.name.toUpperCase())).toBeNull();
        expect(data.getTag()).toBe(key.attributes.name + "-" + type.name.toLowerCase());
        types++;
      }
    }
  expect(types).toBeGreaterThan(900);
});

it("retains native in-place getter sorting and callback state after errors", /** Getter order affects the later last-container lookup exactly as source; unknown keys are appended before failure. @returns Nothing. */ () => {
  const data = new UnicodeExtensionData();
  expect(data.parseTag("nu")).toBeNull();
  expect(data.parseTag("latn")).toBeNull();
  expect(data.parseTag("ca")).toBeNull();
  expect(data.getTag()).toBe("ca-nu-latn");
  expect(data.parseTag("buddhist")?.message).toBe("Unknown -u- extension type: buddhist");
  expect(data.parseTag("zz")?.message).toBe("Invalid key for -u- extension: zz");
  expect(data.getTag()).toBe("ca-nu-latn-zz");
  expect(data.parseTag("ca")).toBeNull();
  expect(data.parseTag("gregory")).toBeNull();
  expect(data.validateTag()).toBe(true);
});

it("preserves precheck precedence over actual registered parent values", /** Native rejects grandfathered before extlang and permits ordinary parents. @returns Nothing. */ () => {
  const grandfathered = lookupRegistry("grandfathered", "i-default"),
    extlang = lookupRegistry("extlang", "cmn");
  expect(grandfathered).not.toBeNull();
  expect(extlang).not.toBeNull();
  expect(precheckUnicodeExtension(grandfathered, extlang)).toEqual({
    code: 4,
    message: "Grandfathered tags aren't allowed to have LDML.",
  });
  expect(precheckUnicodeExtension(null, extlang)).toEqual({
    code: 4,
    message: "Extlang tags aren't allowed to have LDML.",
  });
  expect(precheckUnicodeExtension(null, null)).toBeNull();
});
