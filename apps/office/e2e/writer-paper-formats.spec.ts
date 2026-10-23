/** @fileoverview Complete source Writer paper catalog, manual/known orientation distinction, history and actual physical ODT download/reopen at desktop/mobile widths. */
import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { openBrowserMenu } from "../test-support/menu-pointer-e2e";
import { readOdtDocument } from "../src/sw/source/filter/xml/swxml";
/** Opens the original Page Style command surface. @param page - Actual browser. @returns Dialog. */
async function style(page: Page) {
  await openBrowserMenu(page, "Format");
  await page.getByRole("menuitem", { name: "Page Style…", exact: true }).click();
  return page.getByRole("dialog", { name: "Page Style", exact: true });
}
for (const width of [1280, 390]) {
  test(`Native full paper formats, geometry history and ODT ${width}`, /** Uses original menus/metric controls, no private frame injection. @param fixtures - Browser fixture. @param fixtures.page - Actual browser. @param info - Artifact paths. @returns Completion. */ async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/writer");
    let dialog = await style(page);
    const formats = dialog.getByLabel("Paper format", { exact: true });
    await expect(formats.locator("option")).toHaveCount(37);
    await expect(formats.locator("option").first()).toHaveText("A6");
    await formats.selectOption({ label: "A3" });
    await expect(dialog.getByLabel("Width (cm)", { exact: true })).toHaveValue("29.70 cm");
    await expect(dialog.getByLabel("Height (cm)", { exact: true })).toHaveValue("42.00 cm");
    await formats.selectOption({ label: "Legal" });
    await expect(dialog.getByLabel("Height (cm)", { exact: true })).toHaveValue("35.56 cm");
    await dialog.getByLabel("Landscape", { exact: true }).check();
    await expect(dialog.getByLabel("Width (cm)", { exact: true })).toHaveValue("35.56 cm");
    await formats.selectOption({ label: "DL Envelope" });
    await expect(dialog.getByLabel("Width (cm)", { exact: true })).toHaveValue("22.00 cm");
    await expect(dialog.getByLabel("Height (cm)", { exact: true })).toHaveValue("11.00 cm");
    await dialog.getByLabel("Portrait", { exact: true }).check();
    await expect(dialog.getByLabel("Width (cm)", { exact: true })).toHaveValue("11.00 cm");
    await formats.selectOption({ label: "User" });
    await expect(dialog.getByLabel("Height (cm)", { exact: true })).toHaveValue("22.00 cm");
    await dialog.getByLabel("Width (cm)", { exact: true }).fill("21 cm");
    await dialog.getByLabel("Width (cm)", { exact: true }).press("Tab");
    await dialog.getByLabel("Height (cm)", { exact: true }).fill("29.7 cm");
    await dialog.getByLabel("Height (cm)", { exact: true }).press("Tab");
    await expect(formats).toHaveValue("4");
    await dialog.getByLabel("Width (cm)", { exact: true }).fill("29.7 cm");
    await dialog.getByLabel("Width (cm)", { exact: true }).press("Tab");
    await dialog.getByLabel("Height (cm)", { exact: true }).fill("21 cm");
    await dialog.getByLabel("Height (cm)", { exact: true }).press("Tab");
    await expect(dialog.getByLabel("Landscape", { exact: true })).toBeChecked();
    await expect(formats).toHaveValue("11");
    await page.screenshot({ path: info.outputPath("native-paper-dialog.png") });
    await dialog.getByRole("button", { name: "OK", exact: true }).click();
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    dialog = await style(page);
    await expect(dialog.getByLabel("Portrait", { exact: true })).toBeChecked();
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    dialog = await style(page);
    await expect(dialog.getByLabel("Paper format", { exact: true })).toHaveValue("4");
    await expect(dialog.getByLabel("Landscape", { exact: true })).toBeChecked();
    await expect(dialog.getByLabel("Width (cm)", { exact: true })).toHaveValue("29.70 cm");
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    const download = page.waitForEvent("download");
    await openBrowserMenu(page, "File");
    await page.getByRole("menuitem", { name: "Export…", exact: true }).click();
    await page.getByRole("button", { name: "Download ODT", exact: true }).click();
    const artifact = info.outputPath("paper.odt");
    await (await download).saveAs(artifact);
    const imported = await readOdtDocument(new Uint8Array(await readFile(artifact)), {
      title: "Native physical paper",
    });
    try {
      expect(imported.document.GetPageDesc().GetValue()).toMatchObject({
        width: 16838,
        height: 11906,
        landscape: true,
      });
      expect(imported.document.GetPageDesc().GetValue()).not.toHaveProperty("paperFormat");
    } finally {
      imported.document.Dispose();
    }
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer" }).click();
    await page.getByLabel("Browse").setInputFiles(artifact);
    dialog = await style(page);
    await expect(dialog.getByLabel("Paper format", { exact: true })).toHaveValue("4");
    await expect(dialog.getByLabel("Landscape", { exact: true })).toBeChecked();
    await expect(dialog.getByLabel("Width (cm)", { exact: true })).toHaveValue("29.70 cm");
    await expect(dialog.getByLabel("Height (cm)", { exact: true })).toHaveValue("21.00 cm");
  });
}
