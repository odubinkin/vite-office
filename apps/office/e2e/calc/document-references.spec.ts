/** @fileoverview Actual Calc local-reference formula editing in Chromium and a DOM-free Worker. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "../shared/kernel-fixture";

test("propagates actual cell references in browser and Worker", /** No browser-owned cell array or fake document backend participates. @param fixtures - Browser page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "CalcReferenceFixture", [
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
            CalcReferenceFixture: typeof import("../../src/sc/inc/document") &
              typeof import("../../src/sc/inc/address") &
              typeof import("../../src/formula/inc/grammar") &
              typeof import("../../src/i18nlangtag/source/isolang/isolang.tables");
          }
        ).CalcReferenceFixture;
        const doc = new n.ScDocument(),
          a = new n.ScAddress(0, 0, 0),
          b = new n.ScAddress(1, 0, 0),
          c = new n.ScAddress(2, 0, 0),
          grammar = n.FormulaGrammar.Grammar.GRAM_ODFF;
        doc.InsertTab(0, n.unicode("Data"));
        doc.SetValue(a, 3);
        doc.SetFormula(b, n.unicode("=[.A1]+1"), grammar);
        doc.SetFormula(c, n.unicode("=[.B1]*2"), grammar);
        const initial = doc.GetValue(c);
        doc.SetValue(a, 7);
        const dirty = doc.GetFormulaCell(c)?.GetDirty(),
          changed = doc.GetValue(c);
        doc.SetFormula(b, n.unicode("=[.C1]"), grammar);
        const cycle = doc.GetErrCode(c);
        doc.SetValue(b, 10);
        const replaced = doc.GetValue(c),
          detached = doc.GetBroadcaster(a) === null;
        doc.SetEmptyCell(c);
        return {
          initial,
          dirty,
          changed,
          cycle,
          replaced,
          detached,
          cleared: doc.GetBroadcaster(b) === null,
          tree: doc.GetFormulaCodeInTree(),
        };
      }
      const script = Array.from(document.scripts).find(
        /** Locates the actual source bundle. @param script - DOM script. @returns Match. */ (
          script,
        ) => script.textContent?.includes(';globalThis["CalcReferenceFixture"]='),
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
    initial: 8,
    dirty: true,
    changed: 16,
    cycle: 522,
    replaced: 20,
    detached: true,
    cleared: true,
    tree: 0,
  };
  expect(result.main).toEqual(expected);
  expect(result.other).toEqual({ value: expected, dom: "undefined" });
});
