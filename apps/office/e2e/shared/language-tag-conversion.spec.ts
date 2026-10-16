/** @fileoverview Actual native private LanguageTag conversion state and configured-font reuse execute in Chromium and a DOM-free Worker. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "./kernel-fixture";

test("uses actual private LanguageTag conversion state and font tags", /** Exercises source-owned functions in two browser realms. @param fixtures - Browser. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "OfficeLanguageConversionFixture", [
    {
      module: "src/i18nlangtag/source/languagetag/languagetag.conversion.ts",
      names: ["Decision", "getBcp47", "convertLangToLocale", "convertToBcp47"],
    },
    { module: "src/i18nlangtag/inc/mslangid.ts", names: ["MsLangId"] },
    { module: "src/udkapi/com/sun/star/lang/Locale.ts", names: ["Locale"] },
    { module: "src/sal/inc/rtl/ustring.ts", names: ["OUString"] },
    { module: "src/i18nlangtag/source/isolang/isolang.tables.ts", names: ["unicode", "text"] },
    { module: "src/unotools/source/config/fontcfg.ts", names: ["getConfiguredDefaultFont"] },
    { module: "src/unotools/inc/fontdefs.ts", names: ["DefaultFontType"] },
  ]);
  const result = await page.evaluate(
    /** Calls genuine shared owners and executes the same function in an actual Worker. @returns Observations. */ async () => {
      const read =
        /** Calls actual private method group over actual native field owners. @returns Values. */ () => {
          const n = Reflect.get(globalThis, "OfficeLanguageConversionFixture"),
            state =
              /** Creates private numeric-constructor field snapshot without a fake public class. @param id - Native ID. @returns Native conversion fields. */ (
                id: number,
              ) => ({
                maLocale: new n.Locale(),
                maBcp47: new n.OUString(),
                mnLangID: id,
                mbSystemLocale: id === 0,
                mbInitializedBcp47: false,
                mbInitializedLocale: false,
                mbInitializedLangID: id !== 0,
                meIsIsoLocale: n.Decision.DECISION_DONTKNOW,
              });
          n.MsLangId.LanguageTagAccess.setConfiguredSystemLanguage(1031);
          try {
            const value = state(0),
              borrowedLocale = value.maLocale,
              borrowedTag = n.getBcp47(value);
            n.MsLangId.LanguageTagAccess.setConfiguredSystemLanguage(1041);
            n.convertLangToLocale(value);
            const script = state(9242),
              scriptTag = n.text(n.getBcp47(script)),
              input = new n.Locale(n.unicode(""), n.unicode("US"), n.unicode("vendor"));
            return {
              system: [
                value.mnLangID,
                value.mbSystemLocale,
                value.mbInitializedLangID,
                value.mbInitializedLocale,
                value.mbInitializedBcp47,
                n.text(n.getBcp47(value)),
                value.maLocale === borrowedLocale,
                borrowedTag === value.maBcp47,
              ],
              script: [scriptTag, script.meIsIsoLocale],
              rawEmpty: n.text(n.convertToBcp47(input)),
              font: n.text(n.getConfiguredDefaultFont(input, n.DefaultFontType.LATIN_SPREADSHEET)),
            };
          } finally {
            n.MsLangId.LanguageTagAccess.setConfiguredSystemLanguage(0);
          }
        };
      const script = Array.from(document.scripts).find(
        /** Finds actual source bundle. @param s - Script. @returns Match. */ (s) =>
          s.textContent?.includes(';globalThis["OfficeLanguageConversionFixture"]='),
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
    system: [1031, true, true, true, true, "de-DE", true, true],
    script: ["sr-Latn-RS", 1],
    rawEmpty: "",
    font: "Liberation Sans;Albany AMT;Albany;Arial;Arimo;Nimbus Sans L;DejaVu Sans;Helvetica;Lucida;Geneva;Helmet;Arial Unicode MS;Lucida Sans Unicode;Tahoma;SansSerif",
  };
  expect(result).toEqual({ main: expected, other: { value: expected, dom: "undefined" } });
});
