/** @fileoverview Actual numeric Calc formula editing in Chromium and a DOM-free Worker. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "../shared/kernel-fixture";

test("edits actual numeric formula cells in browser and Worker", /** No browser-owned cell array or fake document backend participates. @param fixtures - Browser page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "CalcFormulaFixture", [
    { module: "src/sc/inc/document.ts", names: ["ScDocument"] },
    { module: "src/sc/inc/address.ts", names: ["ScAddress"] },
    { module: "src/formula/inc/grammar.ts", names: ["FormulaGrammar"] },
    { module: "src/i18nlangtag/source/isolang/isolang.tables.ts", names: ["unicode"] },
  ]);
  const result = await page.evaluate(
    /** Exercises compiled real kernel exports in both runtimes. @returns Managed observations. */ async () => {
      /** Runs public document operations without DOM dependencies. @returns Scalar content observations. */
      function read() {
        const n = (
          globalThis as unknown as {
            CalcFormulaFixture: typeof import("../../src/sc/inc/document") &
              typeof import("../../src/sc/inc/address") &
              typeof import("../../src/formula/inc/grammar") &
              typeof import("../../src/i18nlangtag/source/isolang/isolang.tables");
          }
        ).CalcFormulaFixture;
        const doc = new n.ScDocument(),
          pos = new n.ScAddress(0, 0, 0),
          grammar = n.FormulaGrammar.Grammar.GRAM_ODFF;
        doc.InsertTab(0, n.unicode("Data"));
        doc.SetFormula(pos, n.unicode("=1+2*3"), grammar);
        const dirty = doc.GetFormulaCell(pos)?.GetDirty(),
          numeric = doc.GetValue(pos),
          calculated = doc.GetFormulaCell(pos)?.GetDirty();
        doc.SetFormula(pos, n.unicode("=1/0"), grammar);
        const error = doc.GetErrCode(pos),
          errorValue = doc.GetValue(pos);
        doc.SetFormula(pos, n.unicode("=2^3^2"), grammar);
        const power = doc.GetValue(pos);
        doc.InsertTab(0, n.unicode("First"));
        const shifted = doc.GetFormulaCell(new n.ScAddress(0, 0, 1))?.aPos.Tab();
        doc.SetEmptyCell(new n.ScAddress(0, 0, 1));
        return {
          dirty,
          numeric,
          calculated,
          error,
          errorValue,
          power,
          shifted,
          cleared: doc.GetCellType(new n.ScAddress(0, 0, 1)),
        };
      }
      const script = Array.from(document.scripts).find(
        /** Locates the actual source bundle. @param script - DOM script. @returns Match. */ (
          script,
        ) => script.textContent?.includes(';globalThis["CalcFormulaFixture"]='),
      )?.textContent;
      if (!script) throw Error("Missing Calc kernel fixture");
      const url = URL.createObjectURL(
          new Blob(
            [script, "\npostMessage({value:(", read.toString(), ")(),dom:typeof document});"],
            { type: "text/javascript" },
          ),
        ),
        worker = new Worker(url);
      try {
        const other = await new Promise<{ value: unknown; dom: string }>(
          /** Receives real Worker observations. @param resolve - Success. @param reject - Failure. @returns Nothing. */ (
            resolve,
            reject,
          ) => {
            worker.onmessage =
              /** Returns the Worker payload. @param event - Message. @returns Nothing. */ (
                event,
              ) => resolve(event.data);
            worker.onerror =
              /** Reports actual runtime errors. @param event - Worker error. @returns Nothing. */ (
                event,
              ) => reject(Error(event.message));
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
    dirty: true,
    numeric: 7,
    calculated: false,
    error: 532,
    errorValue: 0,
    power: 64,
    shifted: 1,
    cleared: 0,
  };
  expect(result.main).toEqual(expected);
  expect(result.other).toEqual({ value: expected, dom: "undefined" });
});
