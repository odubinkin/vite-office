/** @fileoverview Verifies actual Chromium selected cell list toggles share one native rule and atomic history. */
import { expect, test } from "@playwright/test";
for (const section of ["body", "table cells"] as const)
  for (const kind of ["Ordered List", "Unordered List"] as const) {
    test(
      "Writer selected " + section + " toggle " + kind + " as one list range",
      /** Checks actual DOM selection, native command state and grouped history. @param fixtures - Browser fixtures. @param fixtures.page - Chromium page. @returns Completion. */ async ({
        page,
      }) => {
        await page.goto("/writer");
        if (section === "table cells") {
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
        } else {
          const initial = page.getByRole("textbox", { name: "Writer document text", exact: true });
          await initial.fill("First");
          await initial.press("End");
          await initial.press("Enter");
        }
        const first = page.getByRole("textbox", {
            name: section === "table cells" ? "Row 1 column 1 paragraph 1" : "Writer document text",
            exact: true,
          }),
          secondLabel =
            section === "table cells" ? "Row 1 column 2 paragraph 1" : "Writer paragraph 2",
          second = page.getByRole("textbox", { name: secondLabel, exact: true });
        if (section === "table cells") await first.fill("First");
        await second.fill("Second");
        await first.evaluate(
          /** Creates a real native selection across two table cells. @param element - First paragraph. @param endLabel - Last paragraph label. @returns Nothing. */ (
            element,
            endLabel,
          ) => {
            const end = document.querySelector('[aria-label="' + endLabel + '"]'),
              selection = window.getSelection();
            if (end === null || selection === null)
              throw new Error("Missing native cell selection");
            const range = document.createRange();
            range.setStart(element.firstChild ?? element, 1);
            range.setEnd(end.firstChild ?? end, 3);
            selection.removeAllRanges();
            selection.addRange(range);
            document.dispatchEvent(new Event("selectionchange"));
          },
          secondLabel,
        );
        await page.getByRole("button", { name: "Format", exact: true }).click();
        await page.getByRole("menuitem", { name: "Lists", exact: true }).click();
        await page.getByRole("menuitemradio", { name: kind, exact: true }).click();
        const expected = kind === "Ordered List" ? "numbered" : "bullet",
          firstId = await first.getAttribute("data-writer-paragraph-id"),
          secondId = await second.getAttribute("data-writer-paragraph-id"),
          firstMarker = page.locator('[data-writer-list-marker="' + firstId + '"]'),
          secondMarker = page.locator('[data-writer-list-marker="' + secondId + '"]');
        await expect(first).toHaveAttribute("data-list-kind", expected);
        await expect(second).toHaveAttribute("data-list-kind", expected);
        await expect(firstMarker).toHaveText(kind === "Ordered List" ? "1." : "•");
        await expect(secondMarker).toHaveText(kind === "Ordered List" ? "2." : "•");
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
        await page.getByRole("menuitemradio", { name: kind, exact: true }).click();
        await expect(first).toHaveAttribute("data-list-kind", "none");
        await expect(second).toHaveAttribute("data-list-kind", "none");
        await page.keyboard.press("Control+z");
        await expect(first).toHaveAttribute("data-list-kind", expected);
        await expect(second).toHaveAttribute("data-list-kind", expected);
        await expect(first).toHaveText("First");
        await expect(second).toHaveText("Second");
      },
    );
  }
