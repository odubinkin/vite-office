/** @fileoverview Actual editable style acceptance and native naming/update controls at desktop and narrow widths. */
import { expect, test } from "@playwright/test";
for (const width of [1280, 390]) {
  test(`Writer editable by-example style and naming width=${width}`, /** Checks actual production controls, native history and modal focus. @param fixtures - Chromium page. @param testInfo - Artifact destination. @returns Completion. */ async ({
    page,
  }, testInfo) => {
    const errors: string[] = [];
    page.on(
      "pageerror",
      /** Retains actual browser failures. @param error - Browser exception. @returns Nothing. */
      (error) => {
        errors.push(error.message);
      },
    );
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/writer");
    const editor = page.getByLabel("Writer document body", { exact: true }),
      toolbar = page.getByRole("toolbar", { name: "Writer formatting toolbar" });
    await editor.click();
    await page.keyboard.insertText("ByExampleBrowserProof");
    const input = toolbar.getByRole("combobox", { name: "Paragraph style", exact: true });
    await input.fill("Browser: & 字");
    await input.press("Enter");
    await expect(input).toHaveValue("Browser: & 字");
    await expect(editor).toBeFocused();
    await toolbar.getByRole("button", { name: "Update", exact: true }).click();
    await toolbar.getByRole("button", { name: "New Style from Selection", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "New Style from Selection", exact: true });
    const name = dialog.getByRole("textbox", { name: "Style name", exact: true });
    await expect(name).toBeFocused();
    await name.fill("Second example");
    await dialog.getByRole("button", { name: "OK", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(input).toHaveValue("Second example");
    await editor.press("Control+z");
    await expect(input).toHaveValue("Browser: & 字");
    await editor.press("Control+Shift+z");
    await expect(input).toHaveValue("Second example");
    await input.fill("Discarded draft");
    await input.press("Escape");
    await expect(input).toHaveValue("Second example");
    await expect(editor).toBeFocused();
    await page.screenshot({ path: testInfo.outputPath("style-by-example.png"), fullPage: true });
    expect(errors).toEqual([]);
  });
}
