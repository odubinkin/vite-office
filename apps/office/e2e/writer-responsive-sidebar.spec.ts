/** @fileoverview Verifies that the Writer sidebar command matches the reachable narrow-screen panel. */

import { expect, test } from "@playwright/test";

test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });

test("sidebar remains reachable and its checked state follows visibility on a touch viewport", /** Runs the focused test callback. @param argument1 - Input for this operation. @returns Operation result. */ async ({
  page,
}): Promise<void> => {
  await page.goto("/writer");

  const sidebar = page.getByRole("complementary", { name: "Writer properties sidebar" });
  await expect(sidebar).toBeVisible();
  await expect(sidebar.getByRole("heading", { name: "Paragraph" })).toBeVisible();

  await page.getByRole("button", { name: "View" }).click();
  const toggle = page.getByRole("menuitemcheckbox", { name: "Sidebar" });
  await expect(toggle).toHaveAttribute("aria-checked", "true");
  await toggle.click();
  await expect(sidebar).toHaveCount(0);

  await page.getByRole("button", { name: "View" }).click();
  await expect(page.getByRole("menuitemcheckbox", { name: "Sidebar" })).toHaveAttribute(
    "aria-checked",
    "false",
  );
  await page.getByRole("menuitemcheckbox", { name: "Sidebar" }).click();
  await expect(sidebar).toBeVisible();
  await sidebar.getByRole("button", { name: "Start" }).focus();
  await expect(sidebar.getByRole("button", { name: "Start" })).toBeFocused();
});

test("the page stays within the viewport while the document and modal scroll", /** Checks mobile containment. @param page - Browser page fixture. @returns Nothing. */ async ({
  page,
}) => {
  await page.goto("/writer");
  const canvas = page.getByRole("region", { name: "Writer document canvas" });
  const size = await page.evaluate(
    /** Reads viewport geometry. @returns Document and viewport dimensions. */ () => ({
      documentWidth: document.documentElement.scrollWidth,
      documentHeight: document.documentElement.scrollHeight,
      viewportWidth: innerWidth,
      viewportHeight: innerHeight,
    }),
  );
  expect(size.documentWidth).toBe(size.viewportWidth);
  expect(size.documentHeight).toBe(size.viewportHeight);
  expect(
    await canvas.evaluate(
      /** Checks canvas overflow. @param element - Canvas element. @returns Whether canvas scrolls. */ (
        element,
      ) => element.scrollWidth > element.clientWidth,
    ),
  ).toBe(true);

  await page.setViewportSize({ width: 390, height: 340 });
  await page.getByRole("button", { name: "Format" }).click();
  await page.getByRole("menuitem", { name: "Paragraph…" }).click();
  const panel = page.locator("[data-writer-modal-panel]");
  await expect(panel).toBeVisible();
  expect(
    await panel.evaluate(
      /** Checks dialog overflow. @param element - Modal panel. @returns Whether panel scrolls. */ (
        element,
      ) => element.scrollHeight > element.clientHeight,
    ),
  ).toBe(true);
  expect(
    await page.evaluate(
      /** Reads document height. @returns Height in pixels. */ () =>
        document.documentElement.scrollHeight,
    ),
  ).toBe(340);
});

test("the mobile table grid dismisses outside and More Options opens the full dialog", /** Checks the pinned quick control on a touch viewport. @param fixtures - Browser fixtures. @returns Nothing. */ async ({
  page,
}) => {
  await page.goto("/writer");
  const insertTable = page.getByRole("button", { name: "Insert Table" });
  await insertTable.click();
  await expect(page.getByRole("button", { name: "More Options" })).toBeVisible();
  await page
    .getByRole("region", { name: "Writer document canvas" })
    .click({ position: { x: 20, y: 20 } });
  await expect(page.getByRole("button", { name: "More Options" })).toHaveCount(0);
  await insertTable.click();
  await page.getByRole("button", { name: "More Options" }).click();
  await expect(page.getByRole("dialog", { name: "Insert Table" })).toBeVisible();
  await page
    .getByRole("dialog", { name: "Insert Table" })
    .getByRole("button", { name: "Cancel" })
    .click();
  await insertTable.click();
  await page.getByRole("button", { name: "2 columns, 2 rows" }).click();
  await expect(page.getByRole("table", { name: "Table1" })).toBeVisible();
});
