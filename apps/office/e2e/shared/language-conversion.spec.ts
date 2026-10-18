/** @fileoverview Actual shared language conversion and corrected text/Calc defaults run in Chromium and a DOM-free Worker. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "./kernel-fixture";
test.use({ locale: "ber" });
test("uses native language tables and corrected real consumers in both browser realms", /** Exercises actual shared value owners. @param fixtures - Browser fixtures. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "OfficeLanguageFixture", [
    { module: "src/i18nlangtag/inc/mslangid.ts", names: ["MsLangId"] },
    { module: "src/udkapi/com/sun/star/lang/Locale.ts", names: ["Locale"] },
    { module: "src/sal/inc/rtl/ustring.ts", names: ["OUString"] },
    {
      module: "src/i18npool/source/localedata/localedata.ts",
      names: ["getLocaleDecimalSeparator", "getLocaleMeasurementSystem"],
    },
    { module: "src/sc/inc/docoptio.ts", names: ["ScDocOptions"] },
    { module: "src/editeng/inc/tstpitem.ts", names: ["SvxTabStop"] },
  ]);
  const result = await page.evaluate(
    /** Compares real actual core owners across an isolated Worker. @returns Primitive observations. */ async () => {
      const read =
        /** Executes native table conversion and real current consumers. @returns Values. */ () => {
          const n = Reflect.get(globalThis, "OfficeLanguageFixture"),
            c = n.MsLangId.Conversion;
          const u =
            /** Builds an actual shared known-length value. @param s - Logical text. @returns Value. */ (
              s: string,
            ) =>
              new n.OUString(
                Uint16Array.from(
                  { length: s.length },
                  /** Copies original units. @param _ - Unused. @param i - Offset. @returns Unit. */ (
                    _,
                    i,
                  ) => s.charCodeAt(i),
                ),
                s.length,
              );
          const locale =
            /** Creates actual native Locale fields. @param language - Field. @param country - Field. @param variant - Field. @returns Locale. */ (
              language: string,
              country = "",
              variant = "",
            ) => new n.Locale(u(language), u(country), u(variant));
          const text =
            /** Reads logical native UTF16. @param v - Actual shared value. @returns Text. */ (v: {
              getStr(): Uint16Array;
              getLength(): number;
            }) => String.fromCharCode(...v.getStr().subarray(0, v.getLength()));
          const values =
            /** Reads real Locale fields. @param v - Actual Locale. @returns Fields. */ (v: {
              Language: unknown;
              Country: unknown;
              Variant: unknown;
            }) => [
              text(v.Language as Parameters<typeof text>[0]),
              text(v.Country as Parameters<typeof text>[0]),
              text(v.Variant as Parameters<typeof text>[0]),
            ];
          const out = locale("retain", "ZZ", "old"),
            borrow = out.Language;
          c.convertLanguageToLocaleImpl(35849, out, false);
          const forward = values(out),
            stable = out.Language === borrow;
          c.convertLanguageToLocaleImpl(65535, out, false);
          const preserved = values(out),
            fallback = c.lookupFallbackLocale(locale("ber")),
            emptyQualified = c.lookupFallbackLocale(locale("qlt"));
          return {
            hostLanguage: navigator.language,
            forward,
            stable,
            preserved,
            reverse: c.convertLocaleToLanguageImpl(locale("qlt", "GB", "EN-gb-OED")),
            fallback: values(fallback),
            emptyQualified: values(emptyQualified),
            private: values(c.getOverride(locale("qlt", "", "x-default"))),
            decimal: n.getLocaleDecimalSeparator(locale("ber")),
            measurement: n.getLocaleMeasurementSystem(locale("ber")),
            tabDecimal: new n.SvxTabStop(10).GetDecimal(),
            tabDistance: new n.ScDocOptions().GetTabDistance(),
          };
        };
      const script = Array.from(document.scripts).find(
        /** Finds the real bundled owners. @param s - Script. @returns Match. */ (s) =>
          s.textContent?.includes(';globalThis["OfficeLanguageFixture"]='),
      )?.textContent;
      if (!script) throw Error("Missing actual source bundle");
      const url = URL.createObjectURL(
          new Blob(
            [
              script,
              "\nself.onmessage=e=>{Object.defineProperty(navigator, 'language', {value:e.data,configurable:true});postMessage({value:(",
              read.toString(),
              ")(),dom:typeof document});};",
            ],
            { type: "text/javascript" },
          ),
        ),
        worker = new Worker(url);
      try {
        const other = await new Promise<{ value: unknown; dom: string }>(
          /** Awaits Worker observations. @param resolve - Success. @param reject - Failure. @returns Nothing. */ (
            resolve,
            reject,
          ) => {
            worker.onmessage =
              /** Reads actual cloned output. @param e - Message. @returns Nothing. */ (e) =>
                resolve(e.data);
            worker.onerror = /** Reports a Worker failure. @param e - Error. @returns Nothing. */ (
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
    forward: ["qlt", "GB", "en-GB-oxendict"],
    stable: true,
    preserved: ["qlt", "GB", "en-GB-oxendict"],
    reverse: 37897,
    fallback: ["kab", "DZ", ""],
    emptyQualified: ["qlt", "ES", "ca-ES-valencia"],
    private: ["qlt", "", "x-default"],
    decimal: ",",
    measurement: "metric",
    tabDecimal: ",",
    tabDistance: 709,
  };
  expect(result).toEqual({ main: expected, other: { value: expected, dom: "undefined" } });
});
