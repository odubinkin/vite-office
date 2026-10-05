/** @fileoverview Exercises Chromium native cell numbering Backspace and ShiftBackspace. */
import { expect, test } from "@playwright/test";
test("Writer Backspace hides a cell marker and ShiftBackspace restores native numbering", /** Exercises actual keyboard modifiers,history and empty removal. @param fixtures - Browser fixtures. @param fixtures.page - Chromium page. @returns Completion. */ async ({
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
  const cell = page.getByRole("textbox", { name: "Row 1 column 1 paragraph 1", exact: true }),
    neighbor = page.getByRole("textbox", { name: "Row 1 column 2 paragraph 1", exact: true });
  await cell.click();
  await page.keyboard.type("Item");
  await page.getByRole("button", { name: "Format", exact: true }).click();
  await page.getByRole("menuitem", { name: "Lists", exact: true }).click();
  await page.getByRole("menuitemradio", { name: "Ordered List", exact: true }).click();
  for (let i = 0; i < 4; i++) await cell.press("ArrowLeft");
  await expect
    .poll(
      /** Reads actual DOM prefix length at the native cell caret. @returns Prefix length. */ () =>
        cell.evaluate(
          /** Measures actual text before the browser caret. @param element - Editable host. @returns Prefix length or stale sentinel. */ (
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
  await cell.press("Backspace");
  await expect(cell).toHaveText("Item");
  await expect(cell).toHaveAttribute("data-list-kind", "numbered");
  expect(
    await cell.evaluate(
      /** Reads rendered marker content. @param p - Editable host. @returns Marker text. */ (p) =>
        p.parentElement?.textContent,
    ),
  ).toBe("Item");
  await cell.press("Shift+Backspace");
  await expect(cell).toHaveText("Item");
  expect(
    await cell.evaluate(
      /** Reads native counted marker projection. @param p - Editable host. @returns Marker text. */ (
        p,
      ) => p.parentElement?.textContent,
    ),
  ).toContain("1.");
  await cell.press("Control+z");
  expect(
    await cell.evaluate(
      /** Reads marker history after Undo. @param p - Editable host. @returns Marker text. */ (p) =>
        p.parentElement?.textContent,
    ),
  ).toBe("Item");
  await cell.press("Control+y");
  expect(
    await cell.evaluate(
      /** Reads marker history after Redo. @param p - Editable host. @returns Marker text. */ (p) =>
        p.parentElement?.textContent,
    ),
  ).toContain("1.");
  await cell.evaluate(
    /** Selects only actual cell text before native selection deletion. @param element - Editable cell. @returns Nothing. */ (
      element,
    ) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    },
  );
  await cell.press("Backspace");
  await expect(cell).toHaveText("");
  await cell.press("Backspace");
  await expect(cell).toHaveAttribute("data-list-kind", "numbered");
  await cell.press("Backspace");
  await expect(cell).toHaveAttribute("data-list-kind", "none");
  await expect(
    page.getByRole("textbox", { name: "Row 1 column 1 paragraph 2", exact: true }),
  ).toHaveCount(0);
  await expect(neighbor).toHaveText("");
});
