/** @fileoverview Checks local keyboard ownership before Writer accelerators in Chromium. */
import { expect, test } from "@playwright/test";

for (const width of [1280, 390]) {
  test(`Writer consumed accelerator ownership at width ${width}`, /** Checks actual selection, consumed and unconsumed formatting, then editing. @param fixtures - Browser fixtures. @returns Nothing. */ async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/writer");
    const editor = page.getByLabel("Writer document body", { exact: true });
    await editor.focus();
    await page.keyboard.insertText("SelectionStart");
    await editor.press("Control+a");
    const selection = await editor.evaluate(
      /** Reads the editor-owned SelectAll range. @param element - Editing host. @returns Selection ownership. */
      (element) => {
        const current = window.getSelection();
        return (
          current !== null &&
          !current.isCollapsed &&
          element.contains(current.anchorNode) &&
          element.contains(current.focusNode)
        );
      },
    );
    expect(selection).toBe(true);
    await page.keyboard.insertText("OwnedPlain");
    await expect(editor).not.toContainText("SelectionStart");
    const sidebar = page.getByRole("complementary", { name: "Writer properties sidebar" });
    const owner = sidebar.getByRole("button", { name: "Start", exact: true });
    await owner.evaluate(
      /** Installs one local owner without stopping bubbling to global accelerators. @param element - Existing Sidebar control. @returns Nothing. */
      (element) => {
        /** Consumes one Bold key after the separate modifier keydown.
         * @param event - Local key.
         * @returns Nothing.
         */
        function consume(event: Event): void {
          if (event instanceof KeyboardEvent && event.ctrlKey && event.key === "b") {
            event.preventDefault();
            element.removeEventListener("keydown", consume);
          }
        }
        element.addEventListener("keydown", consume);
      },
    );
    await owner.focus();
    await owner.press("Control+b");
    await expect(owner).toBeFocused();
    await editor.focus();
    await page.keyboard.insertText("AfterConsumed");
    await expect(editor).toContainText("AfterConsumed");
    await expect(editor.locator("strong").filter({ hasText: "AfterConsumed" })).toHaveCount(0);
    await owner.focus();
    await owner.press("Control+b");
    await editor.focus();
    await page.keyboard.insertText("AfterFallback");
    await expect(editor.locator("strong")).toContainText("AfterFallback");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
}
