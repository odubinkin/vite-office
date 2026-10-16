/** @fileoverview Actual minimal Calc document editing in Chromium and a DOM-free Worker. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "../shared/kernel-fixture";

test("edits the same actual scalar document chain in browser and Worker", /** No browser-owned cell array or fake document backend participates. @param fixtures - Browser page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "CalcScalarFixture", [
    { module: "src/sc/inc/document.ts", names: ["ScDocument"] },
    { module: "src/sc/inc/address.ts", names: ["ScAddress", "SC_TAB_APPEND", "MAXROW"] },
    { module: "src/i18nlangtag/source/isolang/isolang.tables.ts", names: ["text", "unicode"] },
  ]);
  const result = await page.evaluate(
    /** Exercises compiled real kernel exports in both runtimes. @returns Managed observations. */ async () => {
      /** Runs public document operations without DOM dependencies. @returns Scalar content observations. */
      function read() {
        const n = (
          globalThis as unknown as {
            CalcScalarFixture: typeof import("../../src/sc/inc/document") &
              typeof import("../../src/sc/inc/address") &
              typeof import("../../src/i18nlangtag/source/isolang/isolang.tables");
          }
        ).CalcScalarFixture;
        const doc = new n.ScDocument(),
          a1 = new n.ScAddress(0, 0, 0),
          last = new n.ScAddress(2, n.MAXROW, 0);
        doc.InsertTab(n.SC_TAB_APPEND, n.unicode("Data"));
        doc.SetValue(a1, 12.5);
        doc.SetTextCell(last, n.unicode("literal"));
        const numeric = doc.GetValue(a1),
          string = n.text(doc.GetSharedString(last).getString());
        doc.SetTextCell(a1, n.unicode("=1+2"));
        const literal = n.text(doc.GetSharedString(a1).getString());
        doc.SetEmptyCell(last);
        doc.InsertTab(0, n.unicode("First"));
        return {
          numeric,
          string,
          literal,
          cleared: doc.GetCellType(new n.ScAddress(2, n.MAXROW, 1)),
          shifted: n.text(doc.GetSharedString(new n.ScAddress(0, 0, 1)).getString()),
          sheets: doc.GetTableCount(),
        };
      }
      const script = Array.from(document.scripts).find(
        /** Locates the actual source bundle. @param script - DOM script. @returns Match. */ (
          script,
        ) => script.textContent?.includes(';globalThis["CalcScalarFixture"]='),
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
    numeric: 12.5,
    string: "literal",
    literal: "=1+2",
    cleared: 0,
    shifted: "=1+2",
    sheets: 2,
  };
  expect(result.main).toEqual(expected);
  expect(result.other).toEqual({ value: expected, dom: "undefined" });
});
