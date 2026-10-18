/** @fileoverview Actual native legacy-name conversion and defined-tag ownership execute in Chromium and a DOM-free Worker. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "./kernel-fixture";

test("uses actual native legacy-name conversion and defined mappings", /** Exercises source-owned functions in two browser realms. @param fixtures - Browser. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "OfficeLanguageNamesFixture", [
    { module: "src/i18nlangtag/inc/mslangid.ts", names: ["MsLangId"] },
    { module: "src/i18nlangtag/source/isolang/isolang.tables.ts", names: ["unicode", "text"] },
  ]);
  const result = await page.evaluate(
    /** Calls genuine shared owners and executes the same function in an actual Worker. @returns Observations. */ async () => {
      const read =
        /** Reads actual Unicode overload and fresh mapping owners. @returns Values. */ () => {
          const n = Reflect.get(globalThis, "OfficeLanguageNamesFixture"),
            convert =
              /** Calls actual Unicode overload. @param language - Name. @param country - Selector. @param skip - Original flag. @returns Raw ID. */ (
                language: string,
                country: string,
                skip: boolean,
              ) =>
                n.MsLangId.Conversion.convertIsoNamesToLanguage(
                  n.unicode(language),
                  n.unicode(country),
                  skip,
                ),
            values = [
              convert("C", "", true),
              convert("GERMAN", "", true),
              convert("sr", "LATIN", true),
              convert("en", "KI", false),
              convert("en", "NG", false),
              convert("en", "SL", false),
              convert("", "US", false),
              convert("", "german", false),
              convert("ku", "IQ", false),
            ],
            tags = n.MsLangId.getDefinedLanguagetags();
          tags[0].maBcp47.clear();
          tags[0].mnLang = 0;
          const fresh = n.MsLangId.getDefinedLanguagetags();
          return {
            values,
            count: fresh.length,
            first: [n.text(fresh[0].maBcp47), fresh[0].mnLang],
            second: [n.text(tags[1].maBcp47), tags[1].mnLang],
          };
        };
      const script = Array.from(document.scripts).find(
        /** Finds actual source bundle. @param s - Script. @returns Match. */ (s) =>
          s.textContent?.includes(';globalThis["OfficeLanguageNamesFixture"]='),
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
    values: [1033, 1031, 2074, 2057, 43017, 1023, 1033, 1031, 1170],
    count: 643,
    first: ["ca-ES-valencia", 2051],
    second: ["ca-ES-valencia", 32771],
  };
  expect(result).toEqual({ main: expected, other: { value: expected, dom: "undefined" } });
});
