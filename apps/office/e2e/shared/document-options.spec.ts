/** @fileoverview Actual Calc calculation options and shared locale/default dependencies run without DOM in a dedicated Worker. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "./kernel-fixture";
test.use({ locale: "en-US" });
test("uses actual Calc option defaults and copies in Chromium and a DOM-free Worker", /** Exercises source owners in browser realms. @param fixtures - Browser fixtures. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "OfficeDocumentOptionsFixture", [
    { module: "src/sc/inc/docoptio.ts", names: ["ScDocOptions", "ScTpCalcItem"] },
  ]);
  const result = await page.evaluate(
    /** Runs actual initialized values and a dedicated Worker. @returns Observations. */ async () => {
      const read =
        /** Creates real options and checks value/cached-mode semantics. @returns Primitive observations. */ () => {
          const n = Reflect.get(globalThis, "OfficeDocumentOptionsFixture"),
            a = new n.ScDocOptions();
          const day = [0],
            month = [0],
            year = [0];
          a.GetDate(day, month, year);
          const defaults = [
            a.GetIterCount(),
            a.GetIterEps(),
            ...day,
            ...month,
            ...year,
            a.GetYear2000(),
            a.GetStdPrecision(),
            a.GetTabDistance(),
            a.GetFormulaSearchType(),
          ];
          a.SetFormulaWildcardsEnabled(false);
          const copy = new n.ScDocOptions(a),
            before = a.equals(copy);
          a.GetFormulaSearchType();
          const after = a.equals(copy);
          copy.GetFormulaSearchType();
          const normalized = a.equals(copy);
          copy.SetIgnoreLineBreaks(true);
          const ignored = a.equals(copy),
            item = new n.ScTpCalcItem(42, copy),
            clone = item.Clone();
          return {
            defaults,
            before,
            after,
            normalized,
            ignored,
            item: [
              clone.Which(),
              clone.GetDocOptions().IsIgnoreLineBreaks(),
              clone.equals(item),
              clone.GetDocOptions() !== item.GetDocOptions(),
            ],
          };
        };
      const script = Array.from(document.scripts).find(
        /** Locates the real installed owner bundle. @param s - Script. @returns Match. */ (s) =>
          s.textContent?.includes(';globalThis["OfficeDocumentOptionsFixture"]='),
      )?.textContent;
      if (!script) throw Error("Missing actual source bundle");
      const url = URL.createObjectURL(
          new Blob(
            [
              script,
              "\nself.onmessage=()=>postMessage({value:(",
              read.toString(),
              ")(),dom:typeof document});",
            ],
            { type: "text/javascript" },
          ),
        ),
        worker = new Worker(url);
      try {
        const other = await new Promise<{ value: unknown; dom: string }>(
          /** Awaits worker observations. @param resolve - Success. @param reject - Failure. @returns Nothing. */ (
            resolve,
            reject,
          ) => {
            worker.onmessage =
              /** Reads the actual cloned result. @param e - Message. @returns Nothing. */ (e) =>
                resolve(e.data);
            worker.onerror = /** Reports a worker failure. @param e - Error. @returns Nothing. */ (
              e,
            ) => reject(Error(e.message));
            worker.postMessage(null);
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
    defaults: [100, 0.001, 30, 12, 1899, 1950, 65535, 720, 2],
    before: true,
    after: false,
    normalized: true,
    ignored: true,
    item: [42, true, true, true],
  };
  expect(result).toEqual({ main: expected, other: { value: expected, dom: "undefined" } });
});
