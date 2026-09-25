/** @fileoverview Verifies browser print shows document pages without Writer chrome. */

import { expect, test } from "@playwright/test";

test("Print appears in upstream locations and print media keeps only pages", /** Checks browser printing. @param page - Browser page fixture. @returns Nothing. */ async ({
  page,
}) => {
  await page.goto("/writer");
  const editor = page.getByRole("textbox", { name: "Writer document text" });
  await editor.fill("Print proof");
  await page.getByRole("button", { name: "File" }).click();
  await expect(page.getByRole("menuitem", { name: "Print" })).toBeVisible();
  await page.getByRole("button", { name: "File" }).click();
  await expect(
    page.getByRole("toolbar", { name: "Writer standard toolbar" }).getByRole("button", {
      name: "Print",
    }),
  ).toBeVisible();

  await page.emulateMedia({ media: "print" });
  await expect(page.getByRole("document", { name: "Page 1" })).toBeVisible();
  expect(
    await editor.evaluate(
      /** Reads the editor display. @param element - Editor element. @returns CSS display. */ (
        element,
      ) => getComputedStyle(element).display,
    ),
  ).not.toBe("none");
  expect(
    await page
      .locator('[aria-label="Writer standard toolbar"]')
      .evaluate(
        /** Reads the toolbar display. @param element - Toolbar element. @returns CSS display. */ (
          element,
        ) => getComputedStyle(element).display,
      ),
  ).toBe("none");
  expect(
    await page
      .locator('[aria-label="Writer properties sidebar"]')
      .evaluate(
        /** Reads the sidebar display. @param element - Sidebar element. @returns CSS display. */ (
          element,
        ) => getComputedStyle(element).display,
      ),
  ).toBe("none");
});
