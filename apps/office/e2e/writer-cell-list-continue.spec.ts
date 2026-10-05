/** @fileoverview Verifies native Continue Numbering menu state, cell list labels and history in Chromium. */
import { expect, test } from "@playwright/test";
for (const initial of ["plain", "bullet"] as const) {
  test(
    "Writer Continue Numbering joins a " + initial + " table cell to the preceding list",
    /** Exercises actual cell menu dispatch and caret/history. @param fixtures - Browser fixtures. @param fixtures.page - Chromium page. @returns Completion. */ async ({
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
      const first = page.getByRole("textbox", { name: "Row 1 column 1 paragraph 1", exact: true }),
        second = page.getByRole("textbox", { name: "Row 1 column 2 paragraph 1", exact: true });
      await first.fill("First");
      await page.getByRole("button", { name: "Format", exact: true }).click();
      await page.getByRole("menuitem", { name: "Lists", exact: true }).click();
      await expect(page.getByRole("menuitem", { name: "Add to List", exact: true })).toBeDisabled();
      await page.getByRole("menuitemradio", { name: "Ordered List", exact: true }).click();
      const firstId = await first.getAttribute("data-writer-paragraph-id");
      await expect(page.locator('[data-writer-list-marker="' + firstId + '"]')).toHaveText("1.");
      await second.fill("Second");
      if (initial === "bullet") {
        await page.getByRole("button", { name: "Format", exact: true }).click();
        await page.getByRole("menuitem", { name: "Lists", exact: true }).click();
        await page.getByRole("menuitemradio", { name: "Unordered List", exact: true }).click();
      }
      await page.getByRole("button", { name: "Format", exact: true }).click();
      await page.getByRole("menuitem", { name: "Lists", exact: true }).click();
      const continuation = page.getByRole("menuitem", { name: "Add to List", exact: true });
      await expect(continuation).toBeEnabled();
      await continuation.click();
      const secondId = await second.getAttribute("data-writer-paragraph-id"),
        marker = page.locator('[data-writer-list-marker="' + secondId + '"]');
      await expect(page.getByLabel("Writer document body", { exact: true })).toBeFocused();
      expect(
        await second.evaluate(
          /** Checks the restored native caret remains in this paragraph under the shared editing host. @param element - Current paragraph. @returns Whether the DOM selection belongs to it. */ (
            element,
          ) => element.contains(window.getSelection()?.focusNode ?? null),
        ),
      ).toBe(true);
      await expect(second).toHaveAttribute("data-list-kind", "numbered");
      await expect(marker).toHaveText("2.");
      await expect(second).toHaveText("Second");
      await page.keyboard.insertText(":Continued");
      await expect(second).toHaveText("Second:Continued");
      await expect(first).toHaveText("First");
      await page.keyboard.press("Control+z");
      await expect(second).toHaveText("Second");
      await second.press("Control+z");
      await expect(second).toHaveAttribute(
        "data-list-kind",
        initial === "plain" ? "none" : "bullet",
      );
      await second.press("Control+y");
      await expect(marker).toHaveText("2.");
      await expect(page.locator('[data-writer-list-marker="' + firstId + '"]')).toHaveText("1.");
      await expect(second).toHaveText("Second");
    },
  );
}
