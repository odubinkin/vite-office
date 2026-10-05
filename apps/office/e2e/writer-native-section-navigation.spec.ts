/** @fileoverview Checks real Chromium Ctrl Home End and Shift selection over native cell sections. */
import { expect, test } from "@playwright/test";
test("Writer Ctrl Home End follows native cell and table boundaries", /** Checks real keyboard,subsequent typing and preserved neighbors. @param root0 - Browser fixture. @param root0.page - Chromium. @returns Completion. */ async ({
  page,
}) => {
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
    second = page.getByLabel("Row 1 column 2 paragraph 1", { exact: true }),
    last = page.getByLabel("Row 2 column 2 paragraph 1", { exact: true });
  await first.click();
  await page.keyboard.type("First");
  await page.keyboard.press("Tab");
  await page.keyboard.type("Second");
  await page.keyboard.press("Enter");
  const tail = page.getByLabel("Row 1 column 2 paragraph 2", { exact: true });
  await page.keyboard.type("Tail");
  await page.keyboard.press("Control+Home");
  await page.keyboard.type("X");
  await expect(second).toHaveText("XSecond");
  await expect(tail).toHaveText("Tail");
  await page.keyboard.press("Control+Home");
  await page.keyboard.press("Control+Home");
  await page.keyboard.type("Y");
  await expect(first).toHaveText("YFirst");
  await expect(body).toHaveText("Before");
  await page.keyboard.press("Control+Home");
  await page.keyboard.press("Control+Home");
  await page.keyboard.type("Z");
  await expect(body).toHaveText("ZBefore");
  await expect(first).toHaveText("YFirst");
  await second.click();
  await page.keyboard.press("Control+End");
  await page.keyboard.type("E");
  await expect(tail).toHaveText("TailE");
  await page.keyboard.press("Control+End");
  await page.keyboard.type("L");
  await expect(last).toHaveText("L");
  await expect(second).toHaveText("XSecond");
  await expect(first).toHaveText("YFirst");
});
test("Writer Shift Ctrl Home selects cell paragraphs through native point and mark", /** Checks actual browser selection,selection kill and subsequent typing history. @param root0 - Browser fixture. @param root0.page - Chromium. @returns Completion. */ async ({
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
    second = page.getByLabel("Row 1 column 2 paragraph 1", { exact: true });
  await first.click();
  await page.keyboard.type("Keep");
  await page.keyboard.press("Tab");
  await page.keyboard.type("Second");
  await page.keyboard.press("Enter");
  const tail = page.getByLabel("Row 1 column 2 paragraph 2", { exact: true });
  await page.keyboard.type("Tail");
  await page.keyboard.press("Control+Shift+Home");
  expect(
    await page.evaluate(
      /** Reads real browser selected cell content. @returns Selected text. */ () =>
        window.getSelection()?.toString(),
    ),
  ).toContain("Second");
  await page.keyboard.press("Control+Home");
  await page.keyboard.type("X");
  await expect(second).toHaveText("Second");
  await expect(tail).toHaveText("Tail");
  await expect(first).toHaveText("XKeep");
  await page.keyboard.press("Control+z");
  await expect(second).toHaveText("Second");
  await expect(first).toHaveText("Keep");
});

test("Writer inherited table editing host keeps split join and typing history", /** Checks real cell input after removing nested editing hosts. @param root0 - Browser fixture. @param root0.page - Chromium. @returns Completion. */ async ({
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
    second = page.getByLabel("Row 1 column 2 paragraph 1", { exact: true });
  await first.click();
  await page.keyboard.type("Keep");
  await page.keyboard.press("Tab");
  await page.keyboard.type("AB");
  await page.keyboard.press("Enter");
  const tail = page.getByLabel("Row 1 column 2 paragraph 2", { exact: true });
  await page.keyboard.type("CD");
  await expect(second).not.toHaveAttribute("contenteditable");
  await expect(tail).not.toHaveAttribute("contenteditable");
  await expect(second.locator("xpath=ancestor::*[@data-writer-table]")).not.toHaveAttribute(
    "contenteditable",
  );
  await page.keyboard.press("Control+Home");
  await page.keyboard.press("Control+End");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("Backspace");
  await expect(tail).toHaveCount(0);
  await expect(second).toHaveText("ABCD");
  await page.keyboard.press("Control+z");
  await expect(second).toHaveText("AB");
  await expect(tail).toHaveText("CD");
  await page.keyboard.press("Control+y");
  await expect(tail).toHaveCount(0);
  await expect(second).toHaveText("ABCD");
  await expect(first).toHaveText("Keep");
});
