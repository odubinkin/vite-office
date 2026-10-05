/** @fileoverview Checks real Chromium cell input, structural history and formatting through the shared Writer editing owner. */
import { expect, test } from "@playwright/test";
test("Writer table cell typing, split, join and formatting use document history", /** Checks actual browser input and isolated neighboring cells. @param root0 - Fixtures. @param root0.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/writer");
  await page.getByRole("button", { name: "Insert Table" }).click();
  await page
    .getByLabel("Table size")
    .locator("..")
    .getByRole("button", { name: "More Options" })
    .click();
  await page
    .getByRole("dialog", { name: "Insert Table" })
    .getByRole("button", { name: "Insert" })
    .click();
  const first = page.getByLabel("Row 1 column 1 paragraph 1", { exact: true });
  const neighbor = page.getByLabel("Row 1 column 2 paragraph 1", { exact: true });
  await first.click();
  await page.keyboard.type("ABC");
  await expect(first).toHaveText("ABC");
  await page.keyboard.press("Control+z");
  await expect(first).toHaveText("");
  await page.keyboard.press("Control+y");
  await expect(first).toHaveText("ABC");
  await page.keyboard.press("Enter");
  const trailing = page.getByLabel("Row 1 column 1 paragraph 2", { exact: true });
  await expect(trailing).toBeVisible();
  await page.keyboard.type("DEF");
  await expect(trailing).toHaveText("DEF");
  await expect(first).toHaveText("ABC");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await expect
    .poll(
      /** Reads actual selected text before the native caret. @returns Prefix length. */ () =>
        trailing.evaluate(
          /** Measures the browser caret in this cell paragraph. @param element - Actual paragraph. @returns Prefix length or an invalid sentinel. */ (
            element,
          ) => {
            const selection = window.getSelection();
            if (
              selection?.focusNode === null ||
              selection?.focusNode === undefined ||
              !element.contains(selection.focusNode)
            )
              return -1;
            const range = document.createRange();
            range.selectNodeContents(element);
            range.setEnd(selection.focusNode, selection.focusOffset);
            return range.toString().length;
          },
        ),
    )
    .toBe(0);
  await page.keyboard.press("Backspace");
  await expect(first).toHaveText("ABCDEF");
  await expect(trailing).toHaveCount(0);
  await page.keyboard.press("Control+z");
  await expect(first).toHaveText("ABC");
  await expect(trailing).toHaveText("DEF");
  await page.keyboard.press("Control+y");
  await expect(first).toHaveText("ABCDEF");
  await expect(trailing).toHaveCount(0);
  await first.evaluate(
    /** Selects the actual native DOM text for the keyboard formatting intent. @param element - Cell paragraph. @returns Nothing. */ (
      element,
    ) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    },
  );
  await page.keyboard.press("Control+b");
  await expect(first.locator("strong")).toHaveText("ABCDEF");
  await page.keyboard.press("Control+z");
  await expect(first.locator("strong")).toHaveCount(0);
  await expect(neighbor).toHaveText("");
  await expect(page.getByRole("textbox", { name: "Writer document text" })).toHaveText("");
  await neighbor.click();
  await page.keyboard.type("Other");
  await expect(neighbor).toHaveText("Other");
  await expect(first).toHaveText("ABCDEF");
});
