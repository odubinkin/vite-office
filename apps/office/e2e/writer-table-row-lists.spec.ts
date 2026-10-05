/** @fileoverview Verifies actual selected table-row list commands use all native boxes and atomic history. */
import { expect, test } from "@playwright/test";
for (const kind of ["Ordered List", "Unordered List"] as const) {
  test(
    "Writer table row native list commands " + kind,
    /** Checks real row selection, native list state and grouped UndoRedo. @param fixtures - Browser fixtures. @param fixtures.page - Chromium page. @returns Completion. */ async ({
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
        second = page.getByRole("textbox", { name: "Row 1 column 2 paragraph 1", exact: true }),
        neighbor = page.getByRole("textbox", { name: "Row 2 column 1 paragraph 1", exact: true });
      await first.fill("First");
      await second.fill("Second");
      await neighbor.fill("Neighbor");
      await page.getByRole("button", { name: "Select row 1 in Table1" }).click();
      await page.getByRole("button", { name: "Format", exact: true }).click();
      await page.getByRole("menuitem", { name: "Lists", exact: true }).click();
      await page.getByRole("menuitemradio", { name: kind, exact: true }).click();
      const expected = kind === "Ordered List" ? "numbered" : "bullet",
        firstId = await first.getAttribute("data-writer-paragraph-id"),
        secondId = await second.getAttribute("data-writer-paragraph-id");
      await expect(first).toHaveAttribute("data-list-kind", expected);
      await expect(second).toHaveAttribute("data-list-kind", expected);
      await expect(page.locator('[data-writer-list-marker="' + firstId + '"]')).toHaveText(
        kind === "Ordered List" ? "1." : "•",
      );
      await expect(page.locator('[data-writer-list-marker="' + secondId + '"]')).toHaveText(
        kind === "Ordered List" ? "2." : "•",
      );
      await expect(neighbor).toHaveAttribute("data-list-kind", "none");
      await page.keyboard.press("Control+z");
      await expect(first).toHaveAttribute("data-list-kind", "none");
      await expect(second).toHaveAttribute("data-list-kind", "none");
      await page.keyboard.press("Control+y");
      await expect(first).toHaveAttribute("data-list-kind", expected);
      await expect(second).toHaveAttribute("data-list-kind", expected);
      await page.getByRole("button", { name: "Format", exact: true }).click();
      await page.getByRole("menuitem", { name: "Lists", exact: true }).click();
      await expect(page.getByRole("menuitemradio", { name: kind, exact: true })).toHaveAttribute(
        "aria-checked",
        "true",
      );
      await page.getByRole("menuitem", { name: "Demote Outline Level", exact: true }).click();
      await expect(first).toHaveAttribute("data-list-level", "1");
      await expect(second).toHaveAttribute("data-list-level", "1");
      await page.keyboard.press("Control+z");
      await expect(first).toHaveAttribute("data-list-level", "0");
      await expect(second).toHaveAttribute("data-list-level", "0");
      await page.keyboard.press("Control+y");
      await expect(first).toHaveAttribute("data-list-level", "1");
      await expect(second).toHaveAttribute("data-list-level", "1");
      await page.getByRole("button", { name: "Format", exact: true }).click();
      await page.getByRole("menuitem", { name: "Lists", exact: true }).click();
      await page.getByRole("menuitemradio", { name: kind, exact: true }).click();
      await expect(first).toHaveAttribute("data-list-kind", "none");
      await expect(second).toHaveAttribute("data-list-kind", "none");
      await page.keyboard.press("Control+z");
      await expect(first).toHaveAttribute("data-list-kind", expected);
      await expect(second).toHaveAttribute("data-list-kind", expected);
      await expect(first).toHaveText("First");
      await expect(second).toHaveText("Second");
      await expect(neighbor).toHaveText("Neighbor");
      await expect(neighbor).toHaveAttribute("data-list-kind", "none");
    },
  );
}
