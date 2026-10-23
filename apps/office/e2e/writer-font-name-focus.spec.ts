/** @fileoverview Actual editable font-name focus, available popup rows and raw-name acceptance in production Writer. */
import { expect, test } from "@playwright/test";
import { pickComboBoxEntry } from "./shared/combo-box";
for (const width of [1280, 390]) {
  test(`Writer editable font-name acceptance width=${width}`, /** Checks real font dispatch, retained document caret, cancellation and normal Tab focus. @param fixtures - Browser page. @param testInfo - Screenshot output. @returns Completion. */ async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/writer");
    const toolbar = page.getByRole("toolbar", { name: "Writer formatting toolbar" });
    const font = toolbar.getByRole("combobox", { name: "Font name", exact: true });
    const editor = page.getByLabel("Writer document body", { exact: true });
    await editor.click();
    await page.keyboard.insertText("FontFocus");
    await pickComboBoxEntry(font, "Liberation Mono");
    await expect(font).toHaveValue("Liberation Mono");
    await expect
      .poll(
        /** Reads actual document focus ownership. @returns Whether client owns focus. */
        () =>
          editor.evaluate(
            /** Checks the real active element without moving focus. @param element - Editing host. @returns Whether focused within. */
            (element) => element.contains(document.activeElement),
          ),
      )
      .toBe(true);
    await page.keyboard.insertText(":Pick");
    await expect(editor).toContainText("FontFocus:Pick");
    await font.fill("Missing: & 字");
    await font.press("Escape");
    await expect(font).toHaveValue("Liberation Mono");
    await font.fill("Liberation Sans");
    await font.press("Tab");
    await expect(toolbar.getByRole("combobox", { name: "Font size", exact: true })).toBeFocused();
    await expect(font).toHaveValue("Liberation Sans");
    await font.fill("Missing: & 字");
    await font.press("Enter");
    await expect(font).toHaveValue("Missing: & 字");
    await font.locator("..").locator("[data-office-combobox-toggle]").click();
    const popupId = await font.getAttribute("aria-controls");
    const popup = page.locator(`id=${popupId}`);
    await expect(
      popup.locator("[data-office-combobox-main-option]").filter({ hasText: "Missing: & 字" }),
    ).toHaveCount(0);
    await expect(
      popup.locator("[data-office-combobox-recent-option]").filter({ hasText: "Missing: & 字" }),
    ).toHaveCount(1);
    await expect(popup.getByRole("option", { name: "OpenSymbol", exact: true })).toHaveCount(1);
    const rect = await popup.boundingBox();
    expect(rect?.x).toBeGreaterThanOrEqual(0);
    expect((rect?.x ?? 0) + (rect?.width ?? 0)).toBeLessThanOrEqual(width);
    await page.screenshot({
      path: testInfo.outputPath("editable-font-popup.png"),
      fullPage: true,
      scale: "css",
    });
    await font.press("Escape");
    await page.keyboard.insertText(":Enter");
    await expect(editor).toContainText("FontFocus:Pick:Enter");
  });
}
