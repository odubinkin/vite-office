/** @fileoverview Native group code ownership and selective area notifications in Chromium and a DOM-free Worker. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "../shared/kernel-fixture";

test("shares actual formula code and delivers grouped changes in browser and Worker", /** No browser-owned cell array or fake document backend participates. @param fixtures - Browser page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "CalcGroupFixture", [
    { module: "src/sc/inc/document.ts", names: ["ScDocument"] },
    { module: "src/sc/inc/address.ts", names: ["ScAddress", "ScRange"] },
    { module: "src/sc/inc/formulacell.ts", names: ["ScFormulaCell", "ScFormulaCellGroup"] },
    { module: "src/sc/inc/compiler.ts", names: ["ScCompiler"] },
    { module: "src/formula/inc/grammar.ts", names: ["FormulaGrammar"] },
    { module: "src/i18nlangtag/source/isolang/isolang.tables.ts", names: ["unicode", "text"] },
  ]);
  const result = await page.evaluate(
    /** Exercises compiled real kernel exports in both runtimes. @returns Managed observations. */ async () => {
      /** Runs public document operations without DOM dependencies. @returns RPN observations. */
      function read() {
        const n = (
          globalThis as unknown as {
            CalcGroupFixture: typeof import("../../src/sc/inc/document") &
              typeof import("../../src/sc/inc/address") &
              typeof import("../../src/sc/inc/formulacell") &
              typeof import("../../src/sc/inc/compiler") &
              typeof import("../../src/formula/inc/grammar") &
              typeof import("../../src/i18nlangtag/source/isolang/isolang.tables");
          }
        ).CalcGroupFixture;
        const doc = new n.ScDocument(),
          g = n.FormulaGrammar.Grammar.GRAM_NATIVE;
        doc.InsertTab(0, n.unicode("Data"));
        for (let row = 0; row < 5; row++) doc.SetValue(new n.ScAddress(0, row, 0), row + 1);
        const position = new n.ScAddress(1, 0, 0),
          compiler = new n.ScCompiler(doc, position, g),
          code = compiler.CompileString(n.unicode("=SUM(A1:A3)")),
          group = new n.ScFormulaCellGroup(),
          cells: InstanceType<typeof n.ScFormulaCell>[] = [];
        compiler.CompileTokenArray();
        group.setCode(code);
        group.mnLength = 3;
        for (let row = 0; row < 3; row++) {
          const cell = new n.ScFormulaCell(doc, new n.ScAddress(1, row, 0), group, g);
          if (!row) group.mpTopCell = cell;
          doc.SetFormulaCell(cell.aPos, cell);
          cells.push(cell);
        }
        for (const cell of cells) cell.EndListeningTo(doc);
        const column = doc.FetchTable(0)?.FetchColumn(1),
          range = new n.ScRange(0, 0, 0, 0, 2, 0);
        if (!column) throw Error("Missing actual formula column");
        const pointer = column.GetFormulaCellBlockAddress(0, [0]);
        if (!pointer) throw Error("Missing actual formula block");
        const listener = group.getAreaListener(pointer, range, false, false);
        doc.StartListeningArea(listener.getListeningRange(), true, listener);
        const initial = cells.map(
          /** Reads the actual formula result. @param cell - Actual cell. @returns Value. */ (
            cell,
          ) => cell.GetValue(),
        );
        doc.SetValue(new n.ScAddress(0, 1, 0), 20);
        const changed = cells.map(
            /** Reads the actual formula result. @param cell - Actual cell. @returns Value. */ (
              cell,
            ) => cell.GetValue(),
          ),
          member = cells[1],
          last = cells[2];
        if (!member || !last) throw Error("Missing actual group members");
        const copy = member.Clone(new n.ScAddress(2, 4, 0)),
          detached = {
            value: copy.GetValue(),
            shared: copy.IsShared(),
            independent: copy.GetCode() !== member.GetCode(),
            source: n.text(copy.GetFormula(g)),
          };
        copy.Dispose();
        const sharedCode = cells.every(
            /** Compares actual shared code identity. @param cell - Actual cell. @returns Shared. */ (
              cell,
            ) => cell.GetCode() === group.mpCode,
          ),
          hashPresent = group.mpCode !== null && group.mpCode.GetHash() !== 0n;
        group.endAllGroupListening(doc);
        last.SetCellGroup(null);
        group.mnLength = 2;
        last.StartListeningTo(doc);
        const shorter = group.getAreaListener(pointer, range, false, false);
        doc.StartListeningArea(shorter.getListeningRange(), true, shorter);
        doc.SetValue(new n.ScAddress(0, 3, 0), 40);
        const shortened = cells.map(
            /** Reads the actual formula result. @param cell - Actual cell. @returns Value. */ (
              cell,
            ) => cell.GetValue(),
          ),
          independentLast = last.GetCode() !== group.mpCode;
        doc.Dispose();
        return { initial, changed, detached, sharedCode, hashPresent, shortened, independentLast };
      }
      const script = Array.from(document.scripts).find(
        /** Locates the actual source bundle. @param script - DOM script. @returns Match. */ (
          script,
        ) => script.textContent?.includes(';globalThis["CalcGroupFixture"]='),
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
    initial: [6, 9, 12],
    changed: [24, 27, 12],
    detached: { value: 27, shared: false, independent: true, source: "=SUM(B5:B7)" },
    sharedCode: true,
    hashPresent: true,
    shortened: [24, 63, 48],
    independentLast: true,
  };
  expect(result.main).toEqual(expected);
  expect(result.other).toEqual({ value: expected, dom: "undefined" });
});
