/** @fileoverview Actual Calc formula serialization in Chromium and a DOM-free Worker. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "../shared/kernel-fixture";

test("serializes actual formula tokens in browser and Worker", /** No browser-owned cell array or fake document backend participates. @param fixtures - Browser page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "CalcOutputFixture", [
    { module: "src/sc/inc/document.ts", names: ["ScDocument"] },
    { module: "src/sc/inc/address.ts", names: ["ScAddress"] },
    { module: "src/formula/inc/grammar.ts", names: ["FormulaGrammar"] },
    { module: "src/i18nlangtag/source/isolang/isolang.tables.ts", names: ["unicode", "text"] },
  ]);
  const result = await page.evaluate(
    /** Exercises compiled real kernel exports in both runtimes. @returns Managed observations. */ async () => {
      /** Runs public document operations without DOM dependencies. @returns Scalar content observations. */
      function read() {
        const n = (
          globalThis as unknown as {
            CalcOutputFixture: typeof import("../../src/sc/inc/document") &
              typeof import("../../src/sc/inc/address") &
              typeof import("../../src/formula/inc/grammar") &
              typeof import("../../src/i18nlangtag/source/isolang/isolang.tables");
          }
        ).CalcOutputFixture;
        const doc = new n.ScDocument(),
          a = new n.ScAddress(0, 0, 0),
          b = new n.ScAddress(1, 0, 0),
          grammar = n.FormulaGrammar.Grammar.GRAM_ODFF;
        doc.InsertTab(0, n.unicode("Data"));
        doc.SetValue(a, 3);
        doc.SetFormula(b, n.unicode("==[.$A$1]+1.2345678901234567"), grammar);
        const cell = doc.GetFormulaCell(b);
        if (!cell) throw Error("Missing formula");
        const serialized = cell.GetFormula(grammar),
          formula = n.text(serialized);
        serialized.dispose();
        doc.SetFormula(b, n.unicode(formula), grammar);
        const first = doc.GetValue(b);
        doc.SetValue(a, 5);
        return { formula, first, edited: doc.GetValue(b) };
      }
      const script = Array.from(document.scripts).find(
        /** Locates the actual source bundle. @param script - DOM script. @returns Match. */ (
          script,
        ) => script.textContent?.includes(';globalThis["CalcOutputFixture"]='),
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
    formula: "==[.$A$1]+1.23456789012346",
    first: 4.23456789012346,
    edited: 6.23456789012346,
  };
  expect(result.main).toEqual(expected);
  expect(result.other).toEqual({ value: expected, dom: "undefined" });
});
