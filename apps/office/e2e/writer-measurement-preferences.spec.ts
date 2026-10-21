/** @fileoverview Exercises fresh locale defaults,actual Options,persistent axis units and physical ODT geometry in Chromium. */
import { openBrowserMenu } from "../test-support/menu-pointer-e2e";
import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
import { FieldUnit as F } from "../src/tools/inc/fldunit";
import { WRITER_LAYOUT_PREFERENCES_KEY } from "../src/sw/browser/storage/writer-layout-preferences-store";
import { readOdtDocument } from "../src/sw/source/filter/xml/swxml";

// This file explicitly uses fresh profiles;the historical Writer project CM fixture does not apply.
test.use({ storageState: { cookies: [], origins: [] }, locale: "en-US" });

/** Opens the real application Options command. @param page - Browser. @returns Dialog. */
async function options(page: Page) {
  await openBrowserMenu(page, "Tools");
  await page.getByRole("menuitem", { name: "Options…", exact: true }).click();
  return page.getByRole("dialog", { name: "Options", exact: true });
}
/** Opens the real Writer Page Style command. @param page - Browser. @returns Dialog. */
async function pageStyle(page: Page) {
  await openBrowserMenu(page, "Format");
  await page.getByRole("menuitem", { name: "Page Style…", exact: true }).click();
  return page.getByRole("dialog", { name: "Page Style", exact: true });
}

for (const [locale, unit, suffix] of [
  ["en-US", F.INCH, "in"],
  ["de-DE", F.CM, "cm"],
] as const) {
  test.describe(`fresh ${locale}`, /** Declares the real host-locale context. @returns Nothing. */ () => {
    test.use({ locale });
    test("uses the upstream measurement-system default without persisted settings", /** Checks fresh browser locale and dimensional display. @param fixtures - Browser fixtures. @param fixtures.page - Actual browser. @returns Completion. */ async ({
      page,
    }) => {
      await page.goto("/writer");
      const dialog = await options(page);
      await expect(
        dialog.getByRole("combobox", { name: "Measurement unit", exact: true }),
      ).toHaveValue(String(unit));
      expect(
        await page.evaluate(
          /** Reads only the public configuration transport. @param key - Native subtree browser key. @returns Persisted value or absence. */ (
            key,
          ) => localStorage.getItem(key),
          WRITER_LAYOUT_PREFERENCES_KEY,
        ),
      ).toBeNull();
      await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
      const style = await pageStyle(page);
      await expect(
        style.getByRole("spinbutton", { name: `Width (${suffix})`, exact: true }),
      ).toBeVisible();
      if (locale === "de-DE")
        await expect(
          style.getByRole("spinbutton", { name: "Width (cm)", exact: true }),
        ).toHaveValue(/,/u);
      await style.getByRole("button", { name: "Cancel", exact: true }).click();
    });
  });
}

for (const viewport of [1280, 390]) {
  test(`Options preserve units through reload,New and genuine ODT reopen width=${viewport}`, /** Exercises persistent preferences separately from physical document bytes. @param fixtures - Browser fixtures. @param fixtures.page - Actual browser. @param info - Test artifact paths. @returns Completion. */ async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: viewport, height: 900 });
    await page.goto("/writer");
    const original = await page.locator('[data-writer-page="1"]').boundingBox();
    if (original === null) throw new Error("Missing original physical page");
    let dialog = await options(page);
    await dialog
      .getByRole("combobox", { name: "Measurement unit", exact: true })
      .selectOption(String(F.CM));
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    dialog = await options(page);
    await expect(
      dialog.getByRole("combobox", { name: "Measurement unit", exact: true }),
    ).toHaveValue(String(F.INCH));
    await dialog
      .getByRole("combobox", { name: "Measurement unit", exact: true })
      .selectOption(String(F.MM));
    await dialog.getByRole("button", { name: "Reset", exact: true }).click();
    await expect(
      dialog.getByRole("combobox", { name: "Measurement unit", exact: true }),
    ).toHaveValue(String(F.INCH));
    await dialog
      .getByRole("combobox", { name: "Measurement unit", exact: true })
      .selectOption(String(F.MM));
    await dialog.getByRole("button", { name: "Apply", exact: true }).click();
    await expect(dialog).toBeVisible();
    await dialog.getByRole("treeitem", { name: "View", exact: true }).click();
    await expect(
      dialog.getByRole("combobox", { name: "Measurement unit", exact: true }),
    ).toHaveCount(0);
    await dialog
      .getByRole("combobox", { name: "Horizontal ruler unit", exact: true })
      .selectOption(String(F.INCH));
    await dialog
      .getByRole("combobox", { name: "Vertical ruler unit", exact: true })
      .selectOption(String(F.POINT));
    await dialog.screenshot({ path: info.outputPath("measurement-options.png") });
    await dialog.getByRole("button", { name: "OK", exact: true }).click();
    expect((await page.locator('[data-writer-page="1"]').boundingBox())?.width).toBeCloseTo(
      original.width,
      1,
    );
    await expect(
      page.locator('[aria-label="Writer horizontal ruler"] [data-ruler-tick="16"]').first(),
    ).toHaveText("1");
    await expect(
      page.locator('[aria-label="Writer vertical ruler"] [data-ruler-tick="3"]').first(),
    ).toHaveText("36");
    const expected = {
      "Other/MeasureUnit": F.MM,
      "Window/HorizontalRulerUnit": F.INCH,
      "Window/VerticalRulerUnit": F.POINT,
    };
    expect(
      await page.evaluate(
        /** Reads actual persisted native properties. @param key - Browser subtree key. @returns Decoded record. */ (
          key,
        ) => JSON.parse(String(localStorage.getItem(key))),
        WRITER_LAYOUT_PREFERENCES_KEY,
      ),
    ).toEqual(expected);
    await page.reload();
    dialog = await options(page);
    await expect(
      dialog.getByRole("combobox", { name: "Measurement unit", exact: true }),
    ).toHaveValue(String(F.MM));
    await dialog.getByRole("treeitem", { name: "View", exact: true }).click();
    await expect(
      dialog.getByRole("combobox", { name: "Horizontal ruler unit", exact: true }),
    ).toHaveValue(String(F.INCH));
    await expect(
      dialog.getByRole("combobox", { name: "Vertical ruler unit", exact: true }),
    ).toHaveValue(String(F.POINT));
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    const style = await pageStyle(page);
    await style.screenshot({ path: info.outputPath("measurement-page-style.png") });
    await style.getByRole("spinbutton", { name: "Width (mm)", exact: true }).fill("200 mm");
    await style.getByRole("button", { name: "OK", exact: true }).click();
    const pending = page.waitForEvent("download");
    await page.getByRole("menuitem", { name: "File", exact: true }).click();
    await page.getByRole("menuitem", { name: "Export…", exact: true }).click();
    await page.getByRole("button", { name: "Download ODT", exact: true }).click();
    const artifact = info.outputPath("measurement-geometry.odt");
    await (await pending).saveAs(artifact);
    const bytes = await readFile(artifact);
    const imported = await readOdtDocument(new Uint8Array(bytes), {
      title: "Measurement geometry",
    });
    expect(imported.document.GetPageDesc().GetValue().width).toBe(11339);
    imported.document.Dispose();
    await page.getByRole("menuitem", { name: "File", exact: true }).click();
    await page.getByRole("menuitem", { name: "New Document", exact: true }).click();
    dialog = await options(page);
    await expect(
      dialog.getByRole("combobox", { name: "Measurement unit", exact: true }),
    ).toHaveValue(String(F.MM));
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer", exact: true }).click();
    await page.getByLabel("Browse", { exact: true }).setInputFiles({
      buffer: bytes,
      mimeType: "application/vnd.oasis.opendocument.text",
      name: "measurement-geometry.odt",
    });
    const reopened = await pageStyle(page);
    await expect(
      reopened.getByRole("spinbutton", { name: "Width (mm)", exact: true }),
    ).toHaveAttribute("aria-valuenow", "200.01");
    await reopened.getByRole("button", { name: "Cancel", exact: true }).click();
    expect(
      await page.evaluate(
        /** Confirms document Open did not replace module configuration. @param key - Browser key. @returns Persisted properties. */ (
          key,
        ) => JSON.parse(String(localStorage.getItem(key))),
        WRITER_LAYOUT_PREFERENCES_KEY,
      ),
    ).toEqual(expected);
    await page.screenshot({ path: info.outputPath("measurement-preferences.png"), fullPage: true });
  });
}
