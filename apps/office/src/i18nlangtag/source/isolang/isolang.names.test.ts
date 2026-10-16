/** @fileoverview Native name conversion/defined mapping conformance,source table order,raw IDs and independently owned Unicode records. */
import { expect, it } from "vitest";
import { MsLangId } from "../../inc/mslangid";
import data from "./locale-name-tables.json" with { type: "json" };
import main from "./locale-id-tables.json" with { type: "json" };
import { text, unicode } from "./isolang.tables";

/** Calls the actual native Unicode overload. @param language - Name. @param country - Country or selector. @param skip - Native explicit control. @returns Native raw ID. */
function convert(language: string, country: string, skip: boolean): number {
  return MsLangId.Conversion.convertIsoNamesToLanguage(unicode(language), unicode(country), skip);
}
for (const [language, country, skip, expected] of [
  ["C", "", true, 1033],
  ["POSIX", "", false, 1033],
  ["GERMAN", "", true, 1031],
  ["chinese", "", true, 2052],
  ["TCHINESE", "ignored", false, 1028],
  ["japanese", "", true, 1041],
  ["korean", "", true, 1042],
  ["sr", "LATIN", true, 2074],
  ["SR", "cYrIlLiC", false, 3098],
  ["NO", "BOK", true, 1044],
  ["no", "NyN", false, 2068],
  ["no", "BOKMAAL", true, 1044],
  ["no", "bokmal", false, 1044],
  ["no", "NYNORSK", true, 2068],
  ["az", "LATIN", false, 1068],
  ["az", "CYRILLIC", true, 2092],
  ["en", "KI", false, 2057],
  ["en", "LR", false, 1033],
  ["en", "AO", false, 2057],
  ["en", "NG", false, 43017],
  ["en", "KI", true, 1023],
  ["en", "SL", false, 1023],
  ["en", "US", false, 1033],
  ["en", "", false, 1033],
  ["en", "", true, 1023],
  ["", "US", false, 1033],
  ["", "US", true, 1023],
  ["", "german", false, 1031],
  ["", "german", true, 1023],
  ["", "", false, 1023],
  ["", "unknown", false, 1023],
  ["unknown", "US", false, 1023],
  ["german\u0000", "", true, 1023],
  ["gérman", "", false, 1023],
  ["de\ud800", "DE", false, 1023],
  ["no", "BÖK", true, 1023],
  ["en", "us\u0000", false, 1023],
] as const)
  it(`converts native names ${JSON.stringify([language, country, skip])}`, /** Checks independent source result literals. @returns Nothing. */ () => {
    expect(convert(language, country, skip)).toBe(expected);
  });
it("queries all legacy table rows while preserving prior ISO and duplicate priority", /** Verifies the complete resource projection through the actual owner. @returns Nothing. */ () => {
  expect(
    Object.values(data).map(
      /** Counts each complete source table. @param rows - Rows. @returns Count. */ (rows) =>
        rows.length,
    ),
  ).toEqual([61, 7, 4, 8]);
  for (const row of data.aImplIsoLangEngEntries) {
    if (row.mnLang === 1023) break;
    const iso = main.iso.find(
        /** Finds native first exact row. @param r - Source ISO row. @returns Match. */ (r) =>
          r.maLanguage === "en" && r.maCountry === row.maCountry,
      ),
      first = data.aImplIsoLangEngEntries.find(
        /** Finds native first English row. @param r - Source row. @returns Match. */ (r) =>
          r.maCountry === row.maCountry,
      );
    expect(convert("EN", row.maCountry.toLowerCase(), false)).toBe(iso?.mnLang ?? first?.mnLang);
  }
  for (const rows of [data.aImplIsoNoneStdLangEntries, data.aImplIsoNoneStdLangEntries2])
    for (const row of rows) {
      if (row.mnLang === 1023) break;
      for (const skip of [true, false])
        expect(convert(row.maLanguage.toUpperCase(), row.maCountry.toUpperCase(), skip)).toBe(
          row.mnLang,
        );
    }
  for (const row of data.aImplOtherEntries) {
    if (row.mnLang === 1023) break;
    expect(convert((row.mpLanguage as string).toUpperCase(), "arbitrary", true)).toBe(row.mnLang);
  }
  for (const row of main.private) {
    if (row.mnLang === 1023) break;
    expect(convert((row.mpLanguage as string).toUpperCase(), "arbitrary", true)).toBe(row.mnLang);
    expect(convert("", row.mpLanguage as string, false)).toBe(row.mnLang);
  }
});
it("returns the exact643raw defined mappings with fresh mutable Unicode owners", /** Checks source families,duplicate IDs and independent caller mutations. @returns Nothing. */ () => {
  const mappings = MsLangId.getDefinedLanguagetags(),
    snapshot = mappings.map(
      /** Reads logical result values. @param row - Actual record. @returns Snapshot. */ (row) => [
        text(row.maBcp47),
        row.mnLang,
      ],
    );
  const expected = [
    ...main.bcp.map(
      /** Projects literal source full tag. @param row - Native row. @returns Pair. */ (row) => [
        row.mpBcp47,
        row.mnLang,
      ],
    ),
    ...main.script.map(
      /** Projects literal source script tag. @param row - Native row. @returns Pair. */ (row) => [
        row.maLanguageScript + (row.maCountry ? "-" + row.maCountry : ""),
        row.mnLang,
      ],
    ),
    ...main.iso.map(
      /** Projects literal source ISO tag. @param row - Native row. @returns Pair. */ (row) => [
        row.maLanguage + (row.maCountry ? "-" + row.maCountry : ""),
        row.mnLang,
      ],
    ),
  ];
  expect(mappings).toHaveLength(643);
  expect(snapshot).toEqual(expected);
  const raw = mappings.find(
    /** Finds obsolete duplicate tag. @param row - Record. @returns Match. */ (row) =>
      text(row.maBcp47) === "ca-ES-valencia" && row.mnLang !== 2051,
  );
  expect(raw).toBeDefined();
  const first = mappings[0];
  if (!first) throw Error("Missing original first mapping");
  first.maBcp47.clear();
  first.mnLang = 0;
  expect(
    MsLangId.getDefinedLanguagetags().map(
      /** Reads fresh values after caller mutation. @param row - Record. @returns Snapshot. */ (
        row,
      ) => [text(row.maBcp47), row.mnLang],
    ),
  ).toEqual(expected);
  expect(text(mappings[1]?.maBcp47 as NonNullable<typeof first>["maBcp47"])).toBe("ca-ES-valencia");
});
it("preserves first-match priority while exporting shadowed raw aliases", /** Checks source literal first results and later reverse-ID records. @returns Nothing. */ () => {
  expect(convert("la", "VA", false)).toBe(1142);
  expect(convert("ku", "IQ", false)).toBe(1170);
  const records = MsLangId.getDefinedLanguagetags();
  expect(
    records.some(
      /** Finds retained Latin alias. @param row - Record. @returns Match. */ (row) =>
        row.mnLang === 32886 && text(row.maBcp47) === "la-VA",
    ),
  ).toBe(true);
  expect(
    records.some(
      /** Finds retained Kurdish alias. @param row - Record. @returns Match. */ (row) =>
        row.mnLang === 3622 && text(row.maBcp47) === "ku-IQ",
    ),
  ).toBe(true);
});
