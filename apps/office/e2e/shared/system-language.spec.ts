/** @fileoverview Actual system/configured language state and existing Calc/text defaults execute in Chromium and a DOM-free Worker. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "./kernel-fixture";
test.use({ locale: "ber" });
test("resolves system and configured language values through actual shared owners", /** Exercises actual state and value owners across browser realms. @param fixtures - Browser fixtures. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "OfficeSystemLanguageFixture", [
    { module: "src/i18nlangtag/inc/mslangid.ts", names: ["MsLangId"] },
    { module: "src/udkapi/com/sun/star/lang/Locale.ts", names: ["Locale"] },
    {
      module: "src/i18npool/source/localedata/localedata.ts",
      names: ["getLocaleDecimalSeparator", "getLocaleMeasurementSystem"],
    },
    { module: "src/sc/inc/docoptio.ts", names: ["ScDocOptions"] },
    { module: "src/editeng/inc/tstpitem.ts", names: ["SvxTabStop"] },
  ]);
  const result = await page.evaluate(
    /** Runs real state and controls only the test host input in Worker. @returns Observations. */ async () => {
      const read =
        /** Reads platform state,updates real configured scalars and observes actual consumers. @returns Values. */ () => {
          const n = Reflect.get(globalThis, "OfficeSystemLanguageFixture"),
            m = n.MsLangId;
          const text =
            /** Reads logical native UTF16. @param value - Actual string. @returns Text. */ (value: {
              getStr(): Uint16Array;
              getLength(): number;
            }) => String.fromCharCode(...value.getStr().subarray(0, value.getLength()));
          const locale = m.getFallbackLocale(new n.Locale()),
            initial = [
              m.getSystemLanguage(),
              m.getSystemUILanguage(),
              text(locale.Language),
              text(locale.Country),
            ];
          m.LanguageTagAccess.setConfiguredSystemLanguage(1031);
          m.setConfiguredSystemUILanguage(1041);
          const changed = m.getFallbackLocale(new n.Locale()),
            configured = [
              m.getConfiguredSystemLanguage(),
              m.getConfiguredSystemUILanguage(),
              m.getRealLanguage(0),
              m.getRealLanguage(1024),
              m.getRealLanguage(2048),
              m.getRealLanguage(1279),
              text(changed.Language),
              text(changed.Country),
              n.getLocaleDecimalSeparator(new n.Locale()),
              n.getLocaleMeasurementSystem(new n.Locale()),
              new n.ScDocOptions().GetTabDistance(),
              new n.SvxTabStop(10).GetDecimal(),
            ];
          m.LanguageTagAccess.setConfiguredSystemLanguage(0);
          m.setConfiguredSystemUILanguage(0);
          const restored = m.getFallbackLocale(new n.Locale());
          return {
            hostLanguage: navigator.language,
            initial,
            configured,
            restored: [
              m.getConfiguredSystemLanguage(),
              m.getConfiguredSystemUILanguage(),
              text(restored.Language),
              text(restored.Country),
            ],
          };
        };
      const script = Array.from(document.scripts).find(
        /** Finds the real bundled owners. @param s - Script. @returns Match. */ (s) =>
          s.textContent?.includes(';globalThis["OfficeSystemLanguageFixture"]='),
      )?.textContent;
      if (!script) throw Error("Missing actual source bundle");
      const url = URL.createObjectURL(
          new Blob(
            [
              script,
              "\nself.onmessage=e=>{Object.defineProperty(navigator,'language',{value:e.data,configurable:true});postMessage({value:(",
              read.toString(),
              ")(),dom:typeof document});};",
            ],
            { type: "text/javascript" },
          ),
        ),
        worker = new Worker(url);
      try {
        const other = await new Promise<{ value: unknown; dom: string }>(
          /** Awaits the real Worker result. @param resolve - Success. @param reject - Failure. @returns Nothing. */ (
            resolve,
            reject,
          ) => {
            worker.onmessage =
              /** Receives cloned observations. @param e - Message. @returns Nothing. */ (e) =>
                resolve(e.data);
            worker.onerror = /** Reports Worker failure. @param e - Error. @returns Nothing. */ (
              e,
            ) => reject(Error(e.message));
            worker.postMessage(navigator.language);
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
    hostLanguage: "ber",
    initial: [2143, 2143, "kab", "DZ"],
    configured: [1031, 1041, 1031, 1031, 1031, 1041, "de", "DE", ",", "metric", 709, ","],
    restored: [2143, 2143, "kab", "DZ"],
  };
  expect(result).toEqual({ main: expected, other: { value: expected, dom: "undefined" } });
});
