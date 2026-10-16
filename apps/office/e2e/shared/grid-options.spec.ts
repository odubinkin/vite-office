/** @fileoverview Real Calc/shared grid values run in Chromium and a DOM-free dedicated Worker. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "./kernel-fixture";
test.use({ locale: "en-US" });
test("uses shared base construction and explicit Calc grid defaults in both browser realms", /** Exercises real initialized core values. @param fixtures - Browser fixtures. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "OfficeGridOptionsFixture", [
    { module: "src/sc/inc/viewopti.ts", names: ["ScGridOptions"] },
    { module: "src/svx/inc/optgrid.ts", names: ["SvxOptionsGrid"] },
  ]);
  const result = await page.evaluate(
    /** Compares actual browser and Worker values. @returns Observations. */ async () => {
      const read =
        /** Runs actual source construction/copy/reset. @returns Primitive values. */ () => {
          const n = Reflect.get(globalThis, "OfficeGridOptionsFixture"),
            a = new n.ScGridOptions();
          const initial = [
            a.GetFieldDrawX(),
            a.GetFieldDivisionX(),
            a.GetFieldDrawY(),
            a.GetFieldDivisionY(),
            a.GetUseGridSnap(),
            a.GetSynchronize(),
            a.GetGridVisible(),
          ];
          const base = new n.SvxOptionsGrid();
          base.SetFieldDrawX(-1);
          base.SetGridVisible(true);
          const copy = new n.ScGridOptions(base),
            copied = [copy.GetFieldDrawX(), copy.GetGridVisible()];
          base.SetFieldDrawX(1);
          copy.SetDefaults();
          a.SetDefaults();
          const reset = [
            copy.GetFieldDrawX(),
            copy.GetFieldDivisionX(),
            copy.GetFieldDrawY(),
            copy.GetFieldDivisionY(),
            copy.GetUseGridSnap(),
            copy.GetSynchronize(),
            copy.GetGridVisible(),
          ];
          return { initial, copied, reset, equal: copy.equals(a) };
        };
      const script = Array.from(document.scripts).find(
        /** Finds real bundled owners. @param s - Script. @returns Match. */ (s) =>
          s.textContent?.includes(';globalThis["OfficeGridOptionsFixture"]='),
      )?.textContent;
      if (!script) throw Error("Missing real source bundle");
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
          /** Awaits actual Worker results. @param resolve - Success. @param reject - Failure. @returns Nothing. */ (
            resolve,
            reject,
          ) => {
            worker.onmessage =
              /** Receives cloned observations. @param e - Message. @returns Nothing. */ (e) =>
                resolve(e.data);
            worker.onerror = /** Reports Worker failure. @param e - Error. @returns Nothing. */ (
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
    initial: [100, 0, 100, 0, false, true, false],
    copied: [4294967295, true],
    reset: [1270, 1, 1270, 1, false, true, false],
    equal: true,
  };
  expect(result).toEqual({ main: expected, other: { value: expected, dom: "undefined" } });
});
