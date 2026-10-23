/** @fileoverview Actual range formula execution in Chromium and a DOM-free Worker. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "../shared/kernel-fixture";

test("executes native range formulas and area dependencies in browser and Worker", /** No browser-owned cell array or fake document backend participates. @param fixtures - Browser page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "CalcRangeFixture", [
    { module: "src/sc/inc/document.ts", names: ["ScDocument"] },
    { module: "src/sc/inc/address.ts", names: ["ScAddress"] },
    { module: "src/formula/inc/grammar.ts", names: ["FormulaGrammar"] },
    { module: "src/i18nlangtag/source/isolang/isolang.tables.ts", names: ["unicode", "text"] },
  ]);
  const result = await page.evaluate(
    /** Exercises compiled real kernel exports in both runtimes. @returns Managed observations. */ async () => {
      /** Runs public document operations without DOM dependencies. @returns RPN observations. */
      function read() {
        const n = (
          globalThis as unknown as {
            CalcRangeFixture: typeof import("../../src/sc/inc/document") &
              typeof import("../../src/sc/inc/address") &
              typeof import("../../src/formula/inc/grammar") &
              typeof import("../../src/i18nlangtag/source/isolang/isolang.tables");
          }
        ).CalcRangeFixture;
        const doc = new n.ScDocument(),
          a = new n.ScAddress(0, 0, 0),
          p = new n.ScAddress(1, 0, 0),
          g = n.FormulaGrammar.Grammar.GRAM_NATIVE;
        doc.InsertTab(0, n.unicode("Data"));
        doc.SetValue(a, 4);
        doc.SetValue(new n.ScAddress(0, 2, 0), 6);
        doc.SetFormula(p, n.unicode("=SUM(A1:A3)+AVERAGE(A1:A3)+SUMSQ(A1:A3)+PRODUCT(A1:A3)"), g);
        const initial = doc.GetValue(p);
        doc.SetValue(a, 10);
        const changed = doc.GetValue(p);
        const cell = doc.GetFormulaCell(p);
        if (!cell) throw Error("Missing actual formula cell");
        const source = n.text(cell.GetFormula(n.FormulaGrammar.Grammar.GRAM_ODFF));
        doc.SetFormula(p, n.unicode('=SUM("2")'), g);
        return {
          initial,
          changed,
          source,
          error: doc.GetErrCode(p),
          cellBroadcast: doc.GetBroadcaster(a) !== null,
        };
      }
      const script = Array.from(document.scripts).find(
        /** Locates the actual source bundle. @param script - DOM script. @returns Match. */ (
          script,
        ) => script.textContent?.includes(';globalThis["CalcRangeFixture"]='),
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
    initial: 91,
    changed: 220,
    source: "=SUM([.A1:.A3])+AVERAGE([.A1:.A3])+SUMSQ([.A1:.A3])+PRODUCT([.A1:.A3])",
    error: 519,
    cellBroadcast: false,
  };
  expect(result.main).toEqual(expected);
  expect(result.other).toEqual({ value: expected, dom: "undefined" });
});
