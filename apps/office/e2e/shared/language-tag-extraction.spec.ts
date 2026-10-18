/** @fileoverview Actual native extraction, shared fallback fields and font/Locale consumers execute in Chromium and a DOM-free Worker. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "./kernel-fixture";

test("uses actual LanguageTag extraction in shared fallback consumers", /** Exercises source-owned functions in two browser realms. @param fixtures - Browser. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "OfficeTagExtractionFixture", [
    {
      module: "src/i18nlangtag/source/languagetag/languagetag.extract.ts",
      names: ["simpleExtract"],
    },
    {
      module: "src/i18nlangtag/source/languagetag/languagetag.ts",
      names: ["decomposeCanonicalLanguageTag", "getFallbackStrings"],
    },
    { module: "src/unotools/source/config/fontcfg.ts", names: ["getConfiguredDefaultFont"] },
    { module: "src/unotools/inc/fontdefs.ts", names: ["DefaultFontType"] },
    {
      module: "src/i18npool/source/localedata/localedata.ts",
      names: ["getLocaleDecimalSeparator"],
    },
    { module: "src/udkapi/com/sun/star/lang/Locale.ts", names: ["Locale"] },
    { module: "src/i18nlangtag/source/isolang/isolang.tables.ts", names: ["unicode", "text"] },
  ]);
  const result = await page.evaluate(
    /** Calls genuine shared owners and executes the same function in an actual Worker. @returns Observations. */ async () => {
      const read = /** Reads extraction outputs and real consumers. @returns Values. */ () => {
        const n = Reflect.get(globalThis, "OfficeTagExtractionFixture"),
          fields = {
            language: "old",
            script: "old",
            country: "old",
            region: "old",
            variants: "old",
          },
          privateDecision = n.simpleExtract("x-comment", fields),
          extension = n.getFallbackStrings(n.decomposeCanonicalLanguageTag("es-ES-u-co-trad")),
          region = n.getFallbackStrings(n.decomposeCanonicalLanguageTag("es-419-variant")),
          privateFallback = n.getFallbackStrings(n.decomposeCanonicalLanguageTag("x-comment")),
          locale = new n.Locale(n.unicode("qlt"), n.unicode(""), n.unicode("es-419-variant")),
          font = n.text(n.getConfiguredDefaultFont(locale, n.DefaultFontType.LATIN_SPREADSHEET));
        return {
          privateDecision,
          fields,
          extension,
          region,
          privateFallback,
          decimal: n.getLocaleDecimalSeparator(locale),
          font,
        };
      };
      const script = Array.from(document.scripts).find(
        /** Finds actual source bundle. @param s - Script. @returns Match. */ (s) =>
          s.textContent?.includes(';globalThis["OfficeTagExtractionFixture"]='),
      )?.textContent;
      if (!script) throw Error("Missing actual source bundle");
      const url = URL.createObjectURL(
          new Blob(
            [script, "\npostMessage({value:(", read.toString(), ")(),dom:typeof document});"],
            { type: "text/javascript" },
          ),
        ),
        worker = new Worker(url);
      try {
        const other = await new Promise<{ value: unknown; dom: string }>(
          /** Awaits actual Worker output. @param resolve - Success. @param reject - Failure. @returns Nothing. */ (
            resolve,
            reject,
          ) => {
            worker.onmessage = /** Receives result. @param e - Message. @returns Nothing. */ (e) =>
              resolve(e.data);
            worker.onerror = /** Reports failure. @param e - Error. @returns Nothing. */ (e) =>
              reject(Error(e.message));
          },
        );
        return { main: read(), other };
      } finally {
        worker.terminate();
        URL.revokeObjectURL(url);
      }
    },
  );
  const expected = {
    privateDecision: 5,
    fields: { language: "old", script: "old", country: "old", region: "old", variants: "old" },
    extension: ["es-u-co-trad", "es-ES", "es"],
    region: ["es-variant", "es"],
    privateFallback: [],
    decimal: ",",
    font: "Liberation Sans;Albany AMT;Albany;Arial;Arimo;Nimbus Sans L;DejaVu Sans;Helvetica;Lucida;Geneva;Helmet;Arial Unicode MS;Lucida Sans Unicode;Tahoma;SansSerif",
  };
  expect(result).toEqual({ main: expected, other: { value: expected, dom: "undefined" } });
});
