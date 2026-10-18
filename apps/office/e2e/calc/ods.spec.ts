/** @fileoverview Actual ODS byte/document import-edit-export in Chromium and a DOM-free Worker. */
import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { installKernelFixture } from "../shared/kernel-fixture";
test("loads native ODS data and edits/saves the same real document in page and Worker", /** Prepared upstream data bytes are input only;all native source references are absent during execution. @param fixtures - Page. @returns Completion. */ async ({
  page,
}) => {
  const input = Array.from(readFileSync("apps/office/e2e/calc/fixtures/basic-cell-content.ods"));
  await page.goto("/");
  await installKernelFixture(page, "CalcODSFixture", [
    { module: "src/sc/inc/document.ts", names: ["ScDocument"] },
    { module: "src/sc/inc/address.ts", names: ["ScAddress"] },
    { module: "src/formula/inc/grammar.ts", names: ["FormulaGrammar"] },
    {
      module: "src/sc/source/filter/xml/xmlwrap.ts",
      names: ["readOdsDocument", "writeOdsDocument"],
    },
    { module: "src/i18nlangtag/source/isolang/isolang.tables.ts", names: ["unicode", "text"] },
  ]);
  const result = await page.evaluate(
    /** Executes the actual same kernel and native data input in both runtimes. @param nativeInput - Native ODS data. @returns Observations. */ async (
      nativeInput,
    ) => {
      /** Uses only real public document/filter APIs. @param data - ODS bytes. @returns Actual observations. */
      async function read(data: number[]) {
        const n = (
          globalThis as unknown as {
            CalcODSFixture: typeof import("../../src/sc/inc/document") &
              typeof import("../../src/sc/inc/address") &
              typeof import("../../src/formula/inc/grammar") &
              typeof import("../../src/sc/source/filter/xml/xmlwrap") &
              typeof import("../../src/i18nlangtag/source/isolang/isolang.tables");
          }
        ).CalcODSFixture;
        const diagnostics: unknown[] = [],
          native = await n.readOdsDocument(new Uint8Array(data), {
            onDiagnostic:
              /** Records real unsupported format metadata. @param value - Diagnostic. @returns Nothing. */ (
                value,
              ) => diagnostics.push(value),
          });
        const doc = new n.ScDocument(),
          a = new n.ScAddress(0, 0, 0),
          b = new n.ScAddress(1, 0, 0),
          c = new n.ScAddress(3, 100, 0);
        doc.InsertTab(0, n.unicode("Data"));
        doc.InsertTab(1, n.unicode("Empty"));
        doc.SetValue(a, 2.5);
        doc.SetFormula(b, n.unicode("=[.$A$1]*2"), n.FormulaGrammar.Grammar.GRAM_ODFF);
        doc.SetTextCell(c, n.unicode(" x\t&😀 "));
        const loaded = await n.readOdsDocument(n.writeOdsDocument(doc)),
          first = loaded.GetValue(b);
        loaded.SetValue(a, 7);
        const again = await n.readOdsDocument(n.writeOdsDocument(loaded));
        return {
          first,
          edited: again.GetValue(b),
          literal: n.text(again.GetSharedString(c).getString()),
          sheets: again.GetTableCount(),
          nativeText: n.text(native.GetSharedString(new n.ScAddress(1, 1, 0)).getString()),
          nativeNumber: native.GetValue(new n.ScAddress(1, 2, 0)),
          diagnosed: diagnostics.length > 0,
        };
      }
      const script = Array.from(document.scripts).find(
        /** Locates the actual bundled modules. @param script - Script. @returns Match. */ (
          script,
        ) => script.textContent?.includes(';globalThis["CalcODSFixture"]='),
      )?.textContent;
      if (!script) throw Error("Missing ODS kernel fixture");
      const url = URL.createObjectURL(
          new Blob(
            [
              script,
              "\nonmessage=async(e)=>{postMessage({value:await(",
              read.toString(),
              ")(e.data),dom:typeof document})};",
            ],
            { type: "text/javascript" },
          ),
        ),
        worker = new Worker(url);
      try {
        const other = new Promise<{ value: unknown; dom: string }>(
          /** Receives actual worker execution. @param resolve - Success. @param reject - Failure. @returns Nothing. */ (
            resolve,
            reject,
          ) => {
            worker.onmessage = /** Delivers output. @param event - Event. @returns Nothing. */ (
              event,
            ) => resolve(event.data);
            worker.onerror =
              /** Reports real worker failure. @param event - Event. @returns Nothing. */ (event) =>
                reject(Error(event.message));
          },
        );
        worker.postMessage(nativeInput);
        return { main: await read(nativeInput), other: await other };
      } finally {
        worker.terminate();
        URL.revokeObjectURL(url);
      }
    },
    input,
  );
  const expected = {
    first: 5,
    edited: 14,
    literal: " x\t&😀 ",
    sheets: 2,
    nativeText: "LibreOffice Calc",
    nativeNumber: 12345,
    diagnosed: true,
  };
  expect(result.main).toEqual(expected);
  expect(result.other).toEqual({ value: expected, dom: "undefined" });
});
