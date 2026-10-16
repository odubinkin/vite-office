/** @fileoverview Actual shared arithmetic formula compilation in Chromium and a DOM-free Worker. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "../shared/kernel-fixture";

test("compiles actual arithmetic tokens in browser and Worker", /** No browser-owned cell array or fake document backend participates. @param fixtures - Browser page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "CalcCompilerFixture", [
    { module: "src/formula/inc/FormulaCompiler.ts", names: ["FormulaCompiler"] },
    { module: "src/formula/inc/tokenarray.ts", names: ["FormulaTokenArray"] },
    { module: "src/formula/inc/token.ts", names: ["FormulaByteToken"] },
    { module: "src/formula/inc/opcode.ts", names: ["OpCode"] },
  ]);
  const result = await page.evaluate(
    /** Exercises compiled real kernel exports in both runtimes. @returns Managed observations. */ async () => {
      /** Runs public document operations without DOM dependencies. @returns RPN observations. */
      function read() {
        const n = (
          globalThis as unknown as {
            CalcCompilerFixture: typeof import("../../src/formula/inc/FormulaCompiler") &
              typeof import("../../src/formula/inc/tokenarray") &
              typeof import("../../src/formula/inc/token") &
              typeof import("../../src/formula/inc/opcode");
          }
        ).CalcCompilerFixture;
        const array = new n.FormulaTokenArray();
        array.AddDouble(1);
        array.AddToken(new n.FormulaByteToken(n.OpCode.ocAdd));
        array.AddDouble(2);
        array.AddToken(new n.FormulaByteToken(n.OpCode.ocMul));
        array.AddDouble(3);
        array.SetRecalcModeForced();
        const subtotal = new n.FormulaCompiler(array).CompileTokenArray();
        const code = Array.from(array.Tokens());
        return {
          subtotal,
          error: array.GetCodeError(),
          forced: array.IsRecalcModeForced(),
          order: Array.from(
            array.RPNTokens(),
            /** Maps actual source token identities. @param token - RPN token. @returns Source index. */ (
              token,
            ) => code.indexOf(token),
          ),
        };
      }
      const script = Array.from(document.scripts).find(
        /** Locates the actual source bundle. @param script - DOM script. @returns Match. */ (
          script,
        ) => script.textContent?.includes(';globalThis["CalcCompilerFixture"]='),
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
  const expected = { subtotal: false, error: 0, forced: true, order: [0, 2, 4, 3, 1] };
  expect(result.main).toEqual(expected);
  expect(result.other).toEqual({ value: expected, dom: "undefined" });
});
