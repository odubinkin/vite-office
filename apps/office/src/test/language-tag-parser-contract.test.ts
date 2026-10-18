/** @fileoverview Actual native JS observations against independently source-derived pinned parser contracts; no native parser is implemented or executed here. */
import { expect, it } from "vitest";
import fixture from "./fixtures/language-tag-parser-contract.json";
import { observeIntlLanguageTags } from "./fixtures/language-tag-intl-audit";

const observations = observeIntlLanguageTags(
  fixture.cases.map(
    /** Selects unchanged source input. @param row - Case. @returns Input. */ (row) => row.input,
  ),
);
for (const row of fixture.cases.filter(
  /** Selects source-rejected cases. @param row - Case. @returns Selection. */ (row) =>
    !row.sourceExpected.valid,
))
  it(`records native JS acceptance beyond pinned parser contract for ${row.input}`, /** Measures actual API rather than emulating the library. @returns Nothing. */ () => {
    const observed = observations.find(
      /** Finds actual measurement. @param value - Observation. @returns Match. */ (value) =>
        value.input === row.input,
    );
    expect(observed?.locale).toEqual({ value: row.input });
    expect(observed?.canonical).toEqual({ value: row.input });
    expect(row.sourceExpected.canonical).toBeNull();
  });
for (const [input, js, source] of [
  ["cmn-Hans-CN", "zh-Hans-CN", "cmn-Hans-CN"],
  ["en-x-FOO", "en-x-foo", "en-x-FOO"],
  ["en-u-ca-islamicc", "en-u-ca-islamic-civil", "en-u-ca-islamicc"],
  ["de-Latn-DE", "de-Latn-DE", "de-DE"],
] as const)
  it(`records canonical spelling difference for ${input}`, /** Checks source and measured JS independently. @returns Nothing. */ () => {
    expect(
      observations.find(
        /** Finds actual result. @param row - Observation. @returns Match. */ (row) =>
          row.input === input,
      )?.locale,
    ).toEqual({ value: js });
    expect(
      fixture.cases.find(
        /** Finds source contract. @param row - Case. @returns Match. */ (row) =>
          row.input === input,
      )?.sourceExpected,
    ).toEqual({ valid: true, canonical: source });
  });
for (const input of ["i-default", "i-klingon", "en\u0000-INVALID"])
  it(`records JS rejection of a source-supported parser input ${JSON.stringify(input)}`, /** Keeps native C-string boundary semantics separate from JS syntax validation. @returns Nothing. */ () => {
    const row = fixture.cases.find(
      /** Finds source case. @param value - Case. @returns Match. */ (value) =>
        value.input === input,
    );
    expect(row?.sourceExpected.valid).toBe(true);
    expect(
      observations.find(
        /** Finds actual result. @param value - Observation. @returns Match. */ (value) =>
          value.input === input,
      )?.locale,
    ).toEqual({ error: "RangeError" });
  });
for (const input of ["de-1901", "den-1901", "qaa"])
  it(`records matching control without claiming full parser parity for ${input}`, /** Includes the source byte-prefix behavior as-is. @returns Nothing. */ () => {
    expect(
      observations.find(
        /** Finds actual result. @param row - Observation. @returns Match. */ (row) =>
          row.input === input,
      )?.locale,
    ).toEqual({ value: input });
    expect(
      fixture.cases.find(
        /** Finds native source case. @param row - Case. @returns Match. */ (row) =>
          row.input === input,
      )?.sourceExpected,
    ).toEqual({ valid: true, canonical: input });
  });
it("pins source archives, data dates and deliberately bounded counterexamples", /** Checks the evidence contract rather than a fabricated parser implementation. @returns Nothing. */ () => {
  expect(fixture.referenceCommit).toBe("9bc445578031fecf56086729d8e4940c77e14d65");
  expect(fixture.cases).toHaveLength(17);
  expect(
    fixture.archives.map(
      /** Reads exact pins. @param archive - Source archive. @returns Hash. */ (archive) =>
        archive.sha256,
    ),
  ).toEqual([
    "a96975b79ddd8fef6d9295c083fe3f1afa1a8898a57235d4069255ade44e5cf2",
    "e74af13fd11fbcb24a5910d0f50e45d8505d86267bde2bb2d1d45aed966bc3bb",
  ]);
  expect(fixture.registryDate).toBe("2026-06-14");
  expect(fixture.shippedXmlDate).toBe("2023-10-16");
  expect(fixture.languageAliases).toContainEqual({
    type: "cmn",
    replacement: "zh",
    reason: "macrolanguage",
  });
  expect(fixture.calendarTypes).toContain("islamicc");
  expect(fixture.calendarTypes).not.toContain("foobar");
});
