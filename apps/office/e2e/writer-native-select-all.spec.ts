/** @fileoverview Checks actual Chromium Select All context and cell editing history without upstream dependencies. */
import { expect, test, type Page } from "@playwright/test";
/** Creates an actual native table between body paragraphs. @param page - Chromium page. @returns Cell locators. */
async function fixture(page: Page) {
  await page.goto("/writer");
  const body = page.getByRole("textbox", { name: "Writer document text" });
  await body.click();
  await page.keyboard.type("Before");
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
    second = page.getByLabel("Row 1 column 2 paragraph 1", { exact: true });
  await first.click();
  await page.keyboard.type("First");
  await page.keyboard.press("Tab");
  await page.keyboard.type("Second");
  await page.keyboard.press("Enter");
  await page.keyboard.type("Tail");
  const tail = page.getByLabel("Row 1 column 2 paragraph 2", { exact: true });
  return { body, first, second, tail };
}
/** Reads actual browser selection text. @param page - Chromium page. @returns Native DOM range text. */
async function selected(page: Page) {
  return page.evaluate(
    /** Reads the restored selection. @returns Selected text. */ () =>
      window.getSelection()?.toString() ?? "",
  );
}
test("Writer Select All escalates cell table and outer text", /** Checks actual Ctrl intent and displayed native boxes. @param root0 - Browser fixture. @param root0.page - Chromium. @returns Completion. */ async ({
  page,
}) => {
  const f = await fixture(page),
    boxes = page.locator('[data-writer-editor-selected="true"]');
  await page.keyboard.press("Control+a");
  expect(await selected(page)).toContain("Second");
  expect(await selected(page)).toContain("Tail");
  expect(await selected(page)).not.toContain("First");
  expect(await selected(page)).not.toContain("Before");
  await expect(boxes).toHaveCount(0);
  await page.keyboard.press("Control+a");
  expect(await selected(page)).toContain("First");
  expect(await selected(page)).not.toContain("Before");
  await expect(boxes).toHaveCount(4);
  await page.keyboard.press("Control+a");
  expect(await selected(page)).toContain("Before");
  expect(await selected(page)).toContain("First");
  expect(await selected(page)).toContain("Tail");
  await expect(boxes).toHaveCount(0);
  await expect(f.body).toHaveText("Before");
  await expect(f.second).toHaveText("Second");
  await expect(f.tail).toHaveText("Tail");
});
test("Writer cell Select All replacement retains neighbors and native undo redo", /** Checks real beforeinput after a native cell range. @param root0 - Browser fixture. @param root0.page - Chromium. @returns Completion. */ async ({
  page,
}) => {
  const f = await fixture(page);
  await page.keyboard.press("Control+a");
  await page.keyboard.type("Replacement");
  await expect(f.second).toHaveText("Replacement");
  await expect(f.tail).toHaveCount(0);
  await expect(f.first).toHaveText("First");
  await expect(f.body).toHaveText("Before");
  await page.keyboard.press("Control+z");
  await expect(f.second).toHaveText("R");
  await page.keyboard.press("Control+z");
  await expect(f.second).toHaveText("Second");
  await expect(f.tail).toHaveText("Tail");
  await page.keyboard.press("Control+y");
  await expect(f.second).toHaveText("R");
  await page.keyboard.press("Control+y");
  await expect(f.second).toHaveText("Replacement");
  await expect(f.tail).toHaveCount(0);
  await expect(f.first).toHaveText("First");
  await expect(f.body).toHaveText("Before");
});
test("Writer empty cell Select All immediately selects the native table", /** Checks empty native section without an artificial repeat counter. @param root0 - Browser fixture. @param root0.page - Chromium. @returns Completion. */ async ({
  page,
}) => {
  await fixture(page);
  await page.getByLabel("Row 2 column 1 paragraph 1", { exact: true }).click();
  await page.keyboard.press("Control+a");
  await expect(page.locator('[data-writer-editor-selected="true"]')).toHaveCount(4);
  expect(await selected(page)).toContain("First");
  expect(await selected(page)).not.toContain("Before");
});
