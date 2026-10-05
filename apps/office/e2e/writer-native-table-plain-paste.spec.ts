/** @fileoverview Checks real Chromium selected-row plain multiline paste and native document undo. */
import { test, expect } from "@playwright/test";
for (const text of ["X", "A\nB\n"]) {
  test(
    "Writer native plain table clipboard " +
      JSON.stringify(text) +
      " preserves cells and inherited bold history",
    /** Coordinates native ASCII insertion and retained history. @param root0 - Native operation input. @param root0.page - Native operation input. @returns Operation result. */ async ({
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
      const first = page.getByLabel("Row 1 column 1 paragraph 1", { exact: true }),
        second = page.getByLabel("Row 1 column 2 paragraph 1", { exact: true }),
        keep = page.getByLabel("Row 2 column 1 paragraph 1", { exact: true });
      await first.click();
      await page.keyboard.type("First");
      await page.keyboard.press("Enter");
      await page.getByRole("button", { name: "Bold", exact: true }).click();
      await page.getByLabel("Row 1 column 1 paragraph 2", { exact: true }).click();
      await page.keyboard.type("Tail");
      await page.keyboard.press("Tab");
      await page.keyboard.type("Second");
      await page.keyboard.press("Tab");
      await page.keyboard.type("Keep");
      await expect(second).toHaveText("Second");
      await expect(keep).toHaveText("Keep");
      await page.getByRole("button", { name: "Select row 1 in Table1" }).click();
      const table = page.getByRole("table", { name: "Table1" });
      await first.evaluate(
        /** Coordinates native ASCII insertion and retained history. @param element - Native operation input. @param value - Native operation input. @returns Operation result. */ (
          element,
          value,
        ) => {
          const clipboardData = new DataTransfer();
          clipboardData.setData("text/plain", value);
          element.dispatchEvent(
            new ClipboardEvent("paste", { bubbles: true, cancelable: true, clipboardData }),
          );
        },
        text,
      );
      await expect(first).toHaveText("First");
      await expect(keep).toHaveText("Keep");
      await expect(second).toHaveText("Second" + (text === "X" ? "X" : "A"));
      const tail = page.getByLabel("Row 1 column 1 paragraph 2", { exact: true });
      await expect(tail).toHaveText("Tail" + (text === "X" ? "X" : "A"));
      await expect(tail.locator("strong")).toContainText(text === "X" ? "X" : "A");
      if (text !== "X") {
        await expect(page.getByLabel("Row 1 column 1 paragraph 3", { exact: true })).toHaveText(
          "B",
        );
        await expect(page.getByLabel("Row 1 column 2 paragraph 2", { exact: true })).toHaveText(
          "B",
        );
      }
      await expect(table.locator("th, td")).toHaveCount(4);
      await expect(table.locator('[data-writer-editor-selected="true"]')).toHaveCount(2);
      await page.getByRole("button", { name: "Undo", exact: true }).click();
      await expect(tail).toHaveText("Tail");
      await expect(second).toHaveText("Second");
      await expect(page.getByLabel("Row 1 column 1 paragraph 3", { exact: true })).toHaveCount(0);
      await expect(table.locator('[data-writer-editor-selected="true"]')).toHaveCount(2);
      await page.getByRole("button", { name: "Redo", exact: true }).click();
      await expect(tail).toHaveText("Tail" + (text === "X" ? "X" : "A"));
      await expect(second).toHaveText("Second" + (text === "X" ? "X" : "A"));
      await expect(keep).toHaveText("Keep");
      await expect(table.locator('[data-writer-editor-selected="true"]')).toHaveCount(2);
    },
  );
}
