/** @fileoverview Audits actual Node Intl against source-anchored LanguageTag QA; matching samples never imply full parity. */
import { describe, expect, it } from "vitest";
import fixture from "./fixtures/language-tag-intl-audit.json";
import { observeIntlLanguageTags } from "./fixtures/language-tag-intl-audit";

describe("LanguageTag native JS suitability audit", /** Declares independent suitability scenarios. @returns Nothing. */ () => {
  const observations = observeIntlLanguageTags(
    fixture.cases.map(
      /** Selects a fixture input or matching observation. @param row - Case or observed value. @returns Input or match. */ (
        row,
      ) => row.input,
    ),
  );
  it("retains all 29 unmodified pinned source inputs", /** Checks exact audit scope. @returns Nothing. */ () => {
    expect(fixture.referenceCommit).toBe("9bc445578031fecf56086729d8e4940c77e14d65");
    expect(
      new Set(
        fixture.cases.map(
          /** Selects a fixture input or matching observation. @param row - Case or observed value. @returns Input or match. */ (
            row,
          ) => row.input,
        ),
      ).size,
    ).toBe(29);
    expect(
      observations.map(
        /** Selects a fixture input or matching observation. @param row - Case or observed value. @returns Input or match. */ (
          row,
        ) => row.input,
      ),
    ).toEqual(
      fixture.cases.map(
        /** Selects a fixture input or matching observation. @param row - Case or observed value. @returns Input or match. */ (
          row,
        ) => row.input,
      ),
    );
  });
  for (const input of [
    "de-Latn-DE",
    "bs-Latn-BA",
    "sr-Latn-CS",
    "ca-XV",
    "zh-Hans-CN",
    "zh-Hant-TW",
  ])
    it(`disproves direct canonicalization for ${input}`, /** Checks actual successful output against an independent native expectation. @returns Nothing. */ () => {
      const expected = fixture.cases.find(
          /** Selects a fixture input or matching observation. @param row - Case or observed value. @returns Input or match. */ (
            row,
          ) => row.input === input,
        ),
        observed = observations.find(
          /** Selects a fixture input or matching observation. @param row - Case or observed value. @returns Input or match. */ (
            row,
          ) => row.input === input,
        );
      expect(expected).toBeDefined();
      expect(observed?.locale).toHaveProperty("value");
      expect(observed?.locale).not.toEqual({ value: expected?.upstream });
      expect(observed?.canonical).not.toEqual({ value: expected?.upstream });
    });
  for (const input of ["i-klingon", "en-GB-oed", "es-ES_tradnl", "x-comment", "x-foobar", "*", "C"])
    it(`records rejection of source-supported ${input}`, /** Keeps invalid-in-JS distinct from invalid-in-upstream. @returns Nothing. */ () => {
      expect(
        observations.find(
          /** Selects a fixture input or matching observation. @param row - Case or observed value. @returns Input or match. */ (
            row,
          ) => row.input === input,
        ),
      ).toEqual({
        input,
        locale: { error: "RangeError" },
        canonical: { error: "RangeError" },
        minimized: { error: "RangeError" },
      });
    });
  it("does not use minimize as default-script canonicalization", /** Preserves source country information. @returns Nothing. */ () => {
    expect(
      observations.find(
        /** Selects a fixture input or matching observation. @param row - Case or observed value. @returns Input or match. */ (
          row,
        ) => row.input === "de-DE",
      )?.minimized,
    ).toEqual({ value: "de" });
    expect(
      fixture.cases.find(
        /** Selects a fixture input or matching observation. @param row - Case or observed value. @returns Input or match. */ (
          row,
        ) => row.input === "de-DE",
      )?.upstream,
    ).toBe("de-DE");
    expect(
      observations.find(
        /** Selects a fixture input or matching observation. @param row - Case or observed value. @returns Input or match. */ (
          row,
        ) => row.input === "sr-Latn-RS",
      )?.minimized,
    ).toEqual({
      value: "sr-Latn",
    });
  });
  it("records matching common, variant and extension cases without claiming general parity", /** Checks positive controls. @returns Nothing. */ () => {
    for (const input of [
      "de-DE",
      "sr-RS",
      "sr-Latn-RS",
      "sh-RS",
      "ca-ES-valencia",
      "de-1901",
      "es-ES-u-co-trad",
      "es-419",
      "qtz",
      "qty",
    ]) {
      const expected = fixture.cases.find(
        /** Selects a fixture input or matching observation. @param row - Case or observed value. @returns Input or match. */ (
          row,
        ) => row.input === input,
      )?.upstream;
      expect(
        observations.find(
          /** Selects a fixture input or matching observation. @param row - Case or observed value. @returns Input or match. */ (
            row,
          ) => row.input === input,
        )?.locale,
      ).toEqual({ value: expected });
      expect(
        observations.find(
          /** Selects a fixture input or matching observation. @param row - Case or observed value. @returns Input or match. */ (
            row,
          ) => row.input === input,
        )?.canonical,
      ).toEqual({
        value: expected,
      });
    }
  });
});
