/** @fileoverview Exercises native column sizing, module units, cancellation, history and ODT at desktop/mobile widths. */
import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { FieldUnit } from "../src/tools/inc/fldunit";
import { WRITER_LAYOUT_PREFERENCES_KEY } from "../src/sw/browser/storage/writer-layout-preferences-store";
import { readOdtDocument } from "../src/sw/source/filter/xml/swxml";

for (const viewport of [1280, 390])
  for (const unit of [FieldUnit.CM, FieldUnit.INCH]) {
    test(`Native Column Width dialog units=${unit} viewport=${viewport}`, /** Checks ordinary menu, native manager and package roundtrip. @param fixtures - Browser fixtures. @param fixtures.page - Browser. @param info - Evidence paths. @returns Completion. */ async ({
      page,
    }, info) => {
      await page.setViewportSize({ width: viewport, height: 900 });
      await page.addInitScript(
        /** Configures the actual module's persisted unit before startup. @param value - Explicit configuration. @returns Nothing. */ (
          value,
        ) => localStorage.setItem(value.key, JSON.stringify({ "Other/MeasureUnit": value.unit })),
        { key: WRITER_LAYOUT_PREFERENCES_KEY, unit },
      );
      await page.goto("/writer");
      await page.getByRole("button", { name: "Insert Table", exact: true }).click();
      await page.getByRole("button", { name: "2 columns, 2 rows", exact: true }).click();
      /** Opens the original menu command including native menu overflow. @returns Completion. */
      async function open() {
        if (viewport === 390)
          await page.getByRole("menuitem", { name: "More menus", exact: true }).click();
        await page.getByRole("menuitem", { name: "Table", exact: true }).click();
        await page.getByRole("menuitem", { name: "Size", exact: true }).click();
        await page.getByRole("menuitem", { name: "Column Width…", exact: true }).click();
        return page.getByRole("dialog", { name: "Column Width", exact: true });
      }
      let dialog = await open();
      const before = await dialog
        .getByRole("spinbutton", { name: "Width", exact: true })
        .inputValue();
      expect(before).toBe(unit === FieldUnit.CM ? "7.62 cm" : "3.00″");
      await dialog.getByRole("spinbutton", { name: "Column", exact: true }).fill("2");
      await dialog.getByRole("spinbutton", { name: "Width", exact: true }).fill("1 in");
      await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
      dialog = await open();
      await expect(dialog.getByRole("spinbutton", { name: "Column", exact: true })).toHaveValue(
        "1",
      );
      await expect(dialog.getByRole("spinbutton", { name: "Width", exact: true })).toHaveValue(
        before,
      );
      await dialog.getByRole("spinbutton", { name: "Column", exact: true }).fill("2");
      await dialog.getByRole("spinbutton", { name: "Width", exact: true }).fill("1 in");
      await dialog.getByRole("spinbutton", { name: "Width", exact: true }).blur();
      await expect(dialog.getByRole("spinbutton", { name: "Width", exact: true })).toHaveValue(
        unit === FieldUnit.CM ? "2.54 cm" : "1.00″",
      );
      const columnBounds = await dialog
          .getByRole("spinbutton", { name: "Column", exact: true })
          .boundingBox(),
        widthBounds = await dialog
          .getByRole("spinbutton", { name: "Width", exact: true })
          .boundingBox();
      if (!columnBounds || !widthBounds) throw new Error("Missing source grid geometry");
      expect(columnBounds.x).toBe(widthBounds.x);
      await page.screenshot({ path: info.outputPath("column-width-dialog.png") });
      await dialog.getByRole("button", { name: "OK", exact: true }).click();
      const column = page
        .getByRole("complementary", { name: "Writer properties sidebar" })
        .getByRole("spinbutton", { name: "Column width", exact: true });
      await expect(column).toHaveValue(unit === FieldUnit.CM ? "12.70 cm" : "5.00″");
      await page.getByRole("button", { name: "Undo", exact: true }).click();
      await expect(column).toHaveValue(before);
      await page.getByRole("button", { name: "Redo", exact: true }).click();
      await expect(column).toHaveValue(unit === FieldUnit.CM ? "12.70 cm" : "5.00″");
      const pending = page.waitForEvent("download");
      await page.getByRole("menuitem", { name: "File", exact: true }).click();
      await page.getByRole("menuitem", { name: "Export…", exact: true }).click();
      await page.getByRole("button", { name: "Download ODT", exact: true }).click();
      const artifact = info.outputPath("column-width-dialog.odt");
      await (await pending).saveAs(artifact);
      const opened = await readOdtDocument(new Uint8Array(await readFile(artifact)), {
        title: "Column Width",
      });
      try {
        expect(opened.document.GetTables()[0]?.GetColumnWidths()).toEqual([7200, 1440]);
      } finally {
        opened.document.Dispose();
      }
    });
  }
