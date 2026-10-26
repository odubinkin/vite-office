/** @fileoverview Source resource-backed key/type aliases, counted versus C-string boundaries, special-type input views and release invariant conversion. */
import { expect, it } from "vitest";
import * as K from "./uloc_keytype";
import * as F from "./uloc.keytype";
import { u_UCharsToChars } from "./uinvchar";
it("uses real legacy/BCP keys and canonical type aliases", /** Neither host Intl nor invented key tables participate. @returns Nothing. */ () => {
  expect(K.ulocimp_toBcpKey("CALENDAR")).toEqual({ value: "ca", inputAlias: false });
  expect(K.ulocimp_toLegacyKey("ca")).toEqual({ value: "calendar", inputAlias: false });
  expect(K.ulocimp_toLegacyType("CA", "gregory")).toEqual({
    value: "gregorian",
    inputAlias: false,
  });
  expect(K.ulocimp_toBcpType("calendar", "gregorian")).toEqual({
    value: "gregory",
    inputAlias: false,
  });
  expect(K.ulocimp_toLegacyType("tz", "usnyc")).toEqual({
    value: "America/New_York",
    inputAlias: false,
  });
  expect(K.ulocimp_toBcpType("timezone", "US/Eastern")).toEqual({
    value: "usnyc",
    inputAlias: false,
  });
});
it("retains counted NUL identity separately from public C facades", /** Internal hash equality compares length and every unit. @returns Nothing. */ () => {
  expect(K.ulocimp_toLegacyKey("ca\0tail")).toBeNull();
  expect(F.uloc_toLegacyKey("ca\0tail")).toBe("calendar");
  expect(K.ulocimp_toLegacyType("ca", "gregory\0tail")).toBeNull();
  expect(F.uloc_toLegacyType("ca", "gregory\0tail")).toBe("gregorian");
  expect(F.uloc_toLegacyKey(null)).toBeNull();
  expect(F.uloc_toLegacyKey("")).toBeNull();
  expect(F.ulocimp_toLegacyKeyWithFallback("")).toEqual({ value: "", inputAlias: true });
});
it("preserves special-type grammar and original input alias case", /** CODEPOINTS has a lexical width check rather than scalar range validation. @returns Nothing. */ () => {
  expect(K.ulocimp_toLegacyType("vt", "FFFFFF")).toEqual({ value: "FFFFFF", inputAlias: true });
  expect(K.ulocimp_toBcpType("kr", "Latn-Grek")).toEqual({ value: "Latn-Grek", inputAlias: true });
  expect(K.ulocimp_toLegacyType("rg", "GBzzzz")).toEqual({ value: "GBzzzz", inputAlias: true });
  expect(K.ulocimp_toLegacyType("rg", "419zzzz")).toBeNull();
  expect(K.ulocimp_toLegacyType("vt", "123")).toBeNull();
});
it("preserves distinct fallback grammars and the source plus omission", /** No extra normalization or validation error is added. @returns Nothing. */ () => {
  expect(F.ulocimp_toBcpKeyWithFallback("ZZ")).toEqual({ value: "ZZ", inputAlias: true });
  expect(F.ulocimp_toLegacyTypeWithFallback("zz", "A/B_c-d")).toEqual({
    value: "A/B_c-d",
    inputAlias: true,
  });
  expect(F.ulocimp_toLegacyTypeWithFallback("zz", "a+b")).toBeNull();
  expect(F.ulocimp_toBcpTypeWithFallback("zz", "ab")).toBeNull();
  expect(F.ulocimp_toBcpTypeWithFallback("zz", "abc-def")).toEqual({
    value: "abc-def",
    inputAlias: true,
  });
});
it("performs counted invariant conversion with original release NUL substitution", /** Native debug assertions are outside this release-path observation. @returns Nothing. */ () => {
  const bytes = new Uint8Array(5).fill(77);
  u_UCharsToChars("A\0é+", bytes, 4);
  expect([...bytes]).toEqual([65, 0, 0, 43, 77]);
});
