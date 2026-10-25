/** @fileoverview Production numbering object-bar context,pointer caret,history and imported continuation at desktop/narrow widths. */
import { expect, test } from "@playwright/test";
for (const width of [1280, 390])
  test(`Writer numbering object toolbar width=${width}`, /** Exercises only actual production UI with no runtime injection. @param fixtures - Browser fixtures. @param fixtures.page - Actual Chromium page. @returns Completion. */ async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on(
      "pageerror",
      /** Captures actual uncaught browser errors. @param e - Page error. @returns Nothing. */ (
        e,
      ) => {
        errors.push(e.message);
      },
    );
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/writer");
    const editor = page.getByRole("textbox", { name: "Writer document text", exact: true });
    const bar = page.getByRole("toolbar", { name: "Writer numbering toolbar" });
    await expect(bar).toBeHidden();
    await editor.fill("List body");
    await page
      .getByRole("toolbar", { name: "Writer formatting toolbar" })
      .getByRole("button", { name: "Ordered List", exact: true })
      .click();
    await expect(bar).toBeVisible();
    const down = bar.getByRole("button", { name: "Demote Outline Level" }),
      up = bar.getByRole("button", { name: "Promote Outline Level" });
    await expect(up).toBeDisabled();
    await editor.click();
    await page.keyboard.press("End");
    await down.click();
    await expect(page.locator("[data-writer-editing-host]")).toBeFocused();
    await expect(editor).toHaveAttribute("data-list-level", "1");
    await page.keyboard.type("!");
    await expect(editor).toHaveText("List body!");
    await page
      .getByRole("toolbar", { name: "Writer standard toolbar" })
      .getByRole("button", { name: "Undo", exact: true })
      .click();
    await expect(editor).toHaveText("List body");
    await page
      .getByRole("toolbar", { name: "Writer standard toolbar" })
      .getByRole("button", { name: "Undo", exact: true })
      .click();
    await expect(editor).toHaveAttribute("data-list-level", "0");
    await page
      .getByRole("toolbar", { name: "Writer standard toolbar" })
      .getByRole("button", { name: "Redo", exact: true })
      .click();
    await expect(editor).toHaveAttribute("data-list-level", "1");
    await page.screenshot({
      path: `output/playwright/writer-full-checkpoint/9N3MFW-numbering-${width}.png`,
    });
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer" }).click();
    await page
      .getByLabel("Browse")
      .setInputFiles("apps/office/src/sw/qa/extras/uiwriter/data/tdf113213_addToList.odt");
    await expect(page.getByRole("dialog", { name: "Open", exact: true })).toBeHidden();
    const last = page.getByRole("textbox", { name: "Writer paragraph 6", exact: true });
    await page.getByRole("textbox", { name: "Writer paragraph 5", exact: true }).press("Home");
    await page.keyboard.press("Shift+ArrowDown");
    await expect(bar).toBeVisible();
    const add = bar.getByRole("button", { name: "Add to List" });
    await expect(add).toBeEnabled();
    await add.click();
    await expect(last).toHaveAttribute("data-list-level", "0");
    await expect(last).toHaveAttribute("data-list-marker", "3");
    expect(errors).toEqual([]);
  });
