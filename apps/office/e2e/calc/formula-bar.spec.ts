/** @fileoverview Actual shared-style formula bar executes native empty-block AutoSum,history and browser ODS persistence. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "../shared/kernel-fixture";
for (const width of [1280, 390])
  test(`fills selected formulas with Sum and reopens saved ODS at ${width}px`, /** Actual production controls retain native range/caret/focus and persistence behavior. @param fixtures - Browser. @returns Completion. */ async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    const errors: string[] = [];
    page.on(
      "pageerror",
      /** Records actual application failures. @param error - Browser error. @returns Nothing. */ (
        error,
      ) => {
        errors.push(error.message);
      },
    );
    await page.goto("/calc");
    const grid = page.getByRole("grid"),
      name = page.getByRole("textbox", { name: "Name Box" });
    await grid.getByRole("gridcell", { name: "A1", exact: true }).click();
    for (const value of ["Block totals", "2", "3"]) {
      await page.keyboard.type(value);
      await page.keyboard.press("Enter");
    }
    await name.fill("B2");
    await name.press("Enter");
    for (const value of ["4", "6"]) {
      await page.keyboard.type(value);
      await page.keyboard.press("Enter");
    }
    await name.fill("A4");
    await name.press("Enter");
    await grid.getByRole("gridcell", { name: "B5", exact: true }).click({ modifiers: ["Shift"] });
    const sum = page.getByRole("button", { name: "Sum", exact: true });
    await expect(sum).toBeEnabled();
    await sum.click();
    await expect(grid).toBeFocused();
    for (const [address, value] of [
      ["A4", "5"],
      ["B4", "10"],
      ["A5", "8"],
      ["B5", "16"],
    ] as const)
      await expect(grid.getByRole("gridcell", { name: address, exact: true })).toHaveText(value);
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(grid.getByRole("gridcell", { name: "B5", exact: true })).toHaveText("");
    await expect(grid.getByRole("gridcell", { name: "B3", exact: true })).toHaveText("6");
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    await expect(grid.getByRole("gridcell", { name: "B5", exact: true })).toHaveText("16");
    await grid.focus();
    await page.keyboard.press("ControlOrMeta+s");
    await installKernelFixture(page, "CalcSumPersistenceFixture", [
      { module: "src/sc/browser/workflows/calc-ods-io.ts", names: ["createCalcDocumentStore"] },
      { module: "src/sc/source/filter/xml/xmlwrap.ts", names: ["readOdsDocument"] },
      { module: "src/sc/inc/address.ts", names: ["ScAddress"] },
      { module: "src/i18nlangtag/source/isolang/isolang.tables.ts", names: ["text"] },
    ]);
    await expect
      .poll(
        /** Reads only the actual browser-primary ODS through original import and formula owners. @returns Stored value and source. */ () =>
          page.evaluate(
            /** Inspects committed ODS without a substitute workbook. @returns Observed saved result. */ async () => {
              const n = (
                globalThis as unknown as {
                  CalcSumPersistenceFixture: typeof import("../../src/sc/browser/workflows/calc-ods-io") &
                    typeof import("../../src/sc/source/filter/xml/xmlwrap") &
                    typeof import("../../src/sc/inc/address") &
                    typeof import("../../src/i18nlangtag/source/isolang/isolang.tables");
                }
              ).CalcSumPersistenceFixture;
              const store = n.createCalcDocumentStore(),
                record = (await store.list()).find(
                  /** Selects actual automatic title. @param item - Stored metadata. @returns Match. */ (
                    item,
                  ) => item.title === "Block totals",
                );
              if (!record) return null;
              const saved = await store.load(record.id);
              if (!saved) return null;
              const doc = await n.readOdsDocument(saved.content);
              try {
                const cell = doc.GetFormulaCell(new n.ScAddress(1, 4, 0));
                return {
                  value: doc.GetValue(new n.ScAddress(1, 4, 0)),
                  formula: cell ? n.text(cell.GetFormula(doc.GetGrammar())) : "",
                };
              } finally {
                doc.Dispose();
              }
            },
          ),
        { timeout: 20000 },
      )
      .toEqual({ value: 16, formula: "=SUM(B3:B4)" });
    await page.reload();
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("button", { name: "Block totals", exact: true }).click();
    await expect(grid.getByRole("gridcell", { name: "B5", exact: true })).toHaveText("16");
    await name.fill("B5");
    await name.press("Enter");
    await expect(page.getByRole("textbox", { name: "Input line" })).toHaveValue("=SUM(B3:B4)");
    await page.screenshot({ path: test.info().outputPath(`sum-block-${width}.png`) });
    expect(errors).toEqual([]);
  });
