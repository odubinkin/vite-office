/** @fileoverview Actual sparse Calc cell traversal in Chromium and a DOM-free Worker. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "../shared/kernel-fixture";

test("traverses actual sparse cells by row in browser and Worker", /** No browser-owned cell array or fake document backend participates. @param fixtures - Browser page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "CalcIteratorFixture", [
    { module: "src/sc/inc/document.ts", names: ["ScDocument"] },
    { module: "src/sc/inc/address.ts", names: ["ScAddress"] },
    { module: "src/sc/inc/dociter.ts", names: ["ScHorizontalCellIterator"] },
    { module: "src/formula/inc/grammar.ts", names: ["FormulaGrammar"] },
    { module: "src/i18nlangtag/source/isolang/isolang.tables.ts", names: ["unicode"] },
  ]);
  const result = await page.evaluate(
    /** Exercises compiled real kernel exports in both runtimes. @returns Managed observations. */ async () => {
      /** Runs public document operations without DOM dependencies. @returns Scalar content observations. */
      function read() {
        const n = (
          globalThis as unknown as {
            CalcIteratorFixture: typeof import("../../src/sc/inc/document") &
              typeof import("../../src/sc/inc/address") &
              typeof import("../../src/sc/inc/dociter") &
              typeof import("../../src/formula/inc/grammar") &
              typeof import("../../src/i18nlangtag/source/isolang/isolang.tables");
          }
        ).CalcIteratorFixture;
        const doc = new n.ScDocument();
        doc.InsertTab(0, n.unicode("Data"));
        for (const [c, r, v] of [
          [4, 900000, 7],
          [0, 2, 2],
          [3, 2, 3],
          [0, 7, 4],
        ] as const)
          doc.SetValue(new n.ScAddress(c, r, 0), v);
        const pos = new n.ScAddress(2, 2, 0);
        doc.SetFormula(pos, n.unicode("=[.A3]+1"), n.FormulaGrammar.Grammar.GRAM_ODFF);
        const iterator = new n.ScHorizontalCellIterator(doc, 0, 0, 0, 16383, 1048575),
          col: [number] = [-1],
          row: [number] = [-1],
          cells: unknown[] = [];
        for (let cell = iterator.GetNext(col, row); cell; cell = iterator.GetNext(col, row))
          cells.push([col[0], row[0], cell.getType(), cell.getFormula() ? null : cell.getDouble()]);
        return {
          cells,
          dirty: doc.GetFormulaCell(pos)?.GetDirty(),
          allocated: doc.FetchTable(0)?.GetAllocatedColumnsCount(),
        };
      }
      const script = Array.from(document.scripts).find(
        /** Locates the actual source bundle. @param script - DOM script. @returns Match. */ (
          script,
        ) => script.textContent?.includes(';globalThis["CalcIteratorFixture"]='),
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
    cells: [
      [0, 2, 1, 2],
      [2, 2, 3, null],
      [3, 2, 1, 3],
      [0, 7, 1, 4],
      [4, 900000, 1, 7],
    ],
    dirty: true,
    allocated: 5,
  };
  expect(result.main).toEqual(expected);
  expect(result.other).toEqual({ value: expected, dom: "undefined" });
});
