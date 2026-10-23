/** @fileoverview Native tabulator controls, module units, history and real ODT export/reopen at desktop and mobile widths. */
import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { openBrowserMenu } from "../test-support/menu-pointer-e2e";
import { readOdtDocument } from "../src/sw/source/filter/xml/swxml";
import { SvxTabStopItem, SvxTabAdjust } from "../src/editeng/inc/tstpitem";
import { RES_PARATR_TABSTOP } from "../src/sw/inc/hintids";
for (const [width, inch] of [
  [1280, false],
  [390, false],
  [1280, true],
] as const) {
  test(`Native tabulator dialog width=${width} inch=${inch}`, /** Uses actual production controls and physical downloaded package. @param fixtures - Browser fixtures. @param fixtures.page - Chromium page. @param info - Artifact paths. @returns Completion. */ async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on(
      "pageerror",
      /** Observes real runtime failures. @param error - Browser error. @returns Nothing. */ (
        error,
      ) => {
        errors.push(error.message);
      },
    );
    await page.goto("/writer");
    if (inch) {
      await openBrowserMenu(page, "Tools");
      await page.getByRole("menuitem", { name: "Options…", exact: true }).click();
      const options = page.getByRole("dialog", { name: "Options", exact: true });
      await options
        .getByRole("combobox", { name: "Measurement unit", exact: true })
        .selectOption("8");
      await options.getByRole("button", { name: "OK", exact: true }).click();
    }
    await page
      .getByRole("textbox", { name: "Writer document text", exact: true })
      .fill("Native\ttabulator");
    /** Opens the actual paragraph dialog and visits the original Tabs page. @returns Completion. */
    async function openTabs() {
      await openBrowserMenu(page, "Format");
      await page.getByRole("menuitem", { name: "Paragraph…", exact: true }).click();
      await page.getByRole("tab", { name: "Tabs", exact: true }).click();
      return page.getByRole("dialog", { name: "Paragraph", exact: true });
    }
    let dialog = await openTabs();
    await expect(
      dialog.getByRole("group", { name: "Type", exact: true }).getByRole("radio"),
    ).toHaveCount(4);
    await expect(
      dialog.getByRole("group", { name: "Fill Character", exact: true }).getByRole("radio"),
    ).toHaveCount(5);
    await dialog
      .getByRole("combobox", { name: "Position", exact: true })
      .fill(inch ? "1 in" : "2.54 cm");
    await dialog.getByRole("radio", { name: "Decimal", exact: true }).check();
    await dialog.getByRole("textbox", { name: "Decimal character", exact: true }).fill(";");
    await dialog.getByRole("radio", { name: "Character", exact: true }).check();
    await dialog.getByRole("textbox", { name: "Fill character", exact: true }).fill("·");
    await dialog.getByRole("button", { name: "New", exact: true }).click();
    await expect(
      dialog.getByRole("option", { name: inch ? "1.00″" : "2.54 cm", exact: true }),
    ).toHaveCount(1);
    await dialog.getByRole("tab", { name: "Text Flow", exact: true }).click();
    await dialog.getByRole("tab", { name: "Tabs", exact: true }).click();
    await expect(dialog.getByRole("radio", { name: "Decimal", exact: true })).toBeChecked();
    const bounds = await dialog.boundingBox();
    expect(bounds?.x).toBeGreaterThanOrEqual(0);
    expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(width);
    expect(
      await page.evaluate(
        /** Reads actual root horizontal overflow. @returns CSS pixels. */ () =>
          document.documentElement.scrollWidth - window.innerWidth,
      ),
    ).toBeLessThanOrEqual(1);
    await page.screenshot({ path: info.outputPath("tabs.png") });
    await dialog.getByRole("button", { name: "OK", exact: true }).click();
    await expect(page.getByRole("button", { name: "Tab stop 1", exact: true })).toHaveCount(1);
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(page.getByRole("button", { name: "Tab stop 1", exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "Redo", exact: true }).click();
    dialog = await openTabs();
    await expect(
      dialog.getByRole("textbox", { name: "Decimal character", exact: true }),
    ).toHaveValue(";");
    await expect(dialog.getByRole("textbox", { name: "Fill character", exact: true })).toHaveValue(
      "·",
    );
    await dialog.getByRole("button", { name: "Delete All", exact: true }).click();
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    const download = page.waitForEvent("download");
    await openBrowserMenu(page, "File");
    await page.getByRole("menuitem", { name: "Export…", exact: true }).click();
    await page.getByRole("button", { name: "Download ODT", exact: true }).click();
    const path = info.outputPath("tabs.odt");
    await (await download).saveAs(path);
    const loaded = await readOdtDocument(new Uint8Array(await readFile(path)), { title: "Tabs" });
    try {
      const item = loaded.document.paragraphs[0]?.GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem;
      expect(item.Count()).toBe(1);
      expect(item.At(0).GetTabPos()).toBe(1440);
      expect(item.At(0).GetAdjustment()).toBe(SvxTabAdjust.Decimal);
      expect(item.At(0).GetDecimal()).toBe(";");
      expect(item.At(0).GetFill()).toBe("·");
    } finally {
      loaded.document.Dispose();
    }
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer", exact: true }).click();
    await page.getByLabel("Browse").setInputFiles(path);
    dialog = await openTabs();
    await expect(dialog.getByRole("radio", { name: "Decimal", exact: true })).toBeChecked();
    await expect(dialog.getByRole("textbox", { name: "Fill character", exact: true })).toHaveValue(
      "·",
    );
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    expect(errors).toEqual([]);
  });
}
