/** @fileoverview Verifies Writer search shortcuts, focus, and replacement history in Chromium. */

import { expect, test } from "@playwright/test";

test("Writer Find and Replace restores editor focus and undoes all replacements together", /** Drives the browser shortcuts and checks the visible document. @param fixtures - Playwright fixtures. @param fixtures.page - Chromium page. @returns Test completion. */ async ({
  page,
}) => {
  await page.goto("/writer");
  const editor = page.getByRole("textbox", { name: "Writer document text", exact: true });
  await editor.fill("cat scatter cat");
  await page.keyboard.press("Control+f");

  const findBar = page.getByRole("toolbar", { name: "Find", exact: true });
  const query = findBar.getByRole("combobox", { name: "Find", exact: true });
  await expect(query).toBeFocused();
  await query.fill("cat");
  await findBar.getByRole("button", { name: "Find and Replace", exact: true }).click();

  const dialog = page.getByRole("dialog", { name: "Find and Replace", exact: true });
  await expect(dialog.getByLabel("Find", { exact: true })).toHaveValue("cat");
  await dialog.getByLabel("Replace with", { exact: true }).fill("dog");
  await dialog.getByRole("checkbox", { name: "Whole words only" }).check();
  await dialog.getByRole("button", { name: "Replace All", exact: true }).click();
  await expect(dialog.getByRole("status")).toHaveText("Search key replaced 2 times.");
  await expect(editor).toHaveText("dog scatter dog");

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page.getByLabel("Writer document body", { exact: true })).toBeFocused();
  await page.keyboard.press("Control+z");
  await expect(editor).toHaveText("cat scatter cat");
});

test("Writer inserts a comment, finds its text and undoes note formatting", /** Drives the ordinary comment and search controls in Chromium. @param fixtures - Playwright fixtures. @param fixtures.page - Chromium page. @returns Test completion. */ async ({
  page,
}) => {
  await page.goto("/writer");
  await page.getByRole("textbox", { name: "Writer document text", exact: true }).fill("Body text");
  await page.getByRole("button", { name: "Comment", exact: true }).click();
  const comment = page.getByRole("textbox", { name: "Comment — Unknown Author" });
  await expect(comment).toBeFocused();
  await page.keyboard.insertText("Find this annotation");
  await expect(comment).toHaveText("Find this annotation");
  await page.keyboard.press("Escape");
  await expect(page.getByLabel("Writer document body", { exact: true })).toBeFocused();

  const commentActions = page.getByLabel("Comment actions", { exact: true });
  await commentActions.click();
  await page.getByRole("button", { name: "Resolve", exact: true }).click();
  await expect(page.getByText("Resolved", { exact: true })).toBeVisible();
  await commentActions.click();
  await page.getByRole("button", { name: "Unresolve", exact: true }).click();
  await expect(page.getByText("Resolved", { exact: true })).toBeHidden();

  const viewMenu = page.getByRole("menuitem", { name: "View", exact: true });
  await viewMenu.click();
  const showComments = page.getByRole("menuitemcheckbox", { name: "Show Comments", exact: true });
  await expect(showComments).toHaveAttribute("aria-checked", "true");
  await showComments.click();
  await expect(comment).toBeHidden();
  await viewMenu.click();
  await expect(showComments).toHaveAttribute("aria-checked", "false");
  await showComments.click();
  await expect(comment).toBeVisible();

  await page.keyboard.press("Control+h");
  const dialog = page.getByRole("dialog", { name: "Find and Replace", exact: true });
  const notes = dialog.getByRole("checkbox", { name: "Comments" });
  if (!(await notes.isVisible())) await dialog.getByText("Other options").click();
  await notes.check();
  await dialog.getByLabel("Find", { exact: true }).fill("annotation");
  await dialog.getByRole("button", { name: "Find Next", exact: true }).click();
  await expect(comment).toBeFocused();
  const selected = await page.evaluate(
    /** Reads the annotation's native browser selection. @returns Matched text. */ () =>
      document.getSelection()?.toString(),
  );
  expect(selected).toBe("annotation");
  const toolbar = page.getByRole("toolbar", { name: "Writer formatting toolbar" });
  const bold = toolbar.getByRole("button", { name: "Bold", exact: true });
  await bold.click();
  await expect(bold).toHaveAttribute("aria-pressed", "true");
  await expect(comment.locator("span").filter({ hasText: /^annotation$/u })).toHaveCSS(
    "font-weight",
    "700",
  );
  await toolbar.getByLabel("Font Color palette", { exact: true }).click();
  await toolbar.getByRole("button", { name: "Font Color #ff0000", exact: true }).click();
  await toolbar.getByLabel("Character Highlighting Color palette", { exact: true }).click();
  await toolbar
    .getByRole("button", { name: "Character Highlighting Color #ffff00", exact: true })
    .click();
  const formatted = comment.locator("span").filter({ hasText: /^annotation$/u });
  await expect(formatted).toHaveCSS("color", "rgb(255, 0, 0)");
  await expect(formatted).toHaveCSS("background-color", "rgb(255, 255, 0)");
  const undo = page.getByRole("button", { name: "Undo", exact: true });
  await undo.click();
  await expect(formatted).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await undo.click();
  await expect(formatted).not.toHaveCSS("color", "rgb(255, 0, 0)");
  await undo.click();
  await expect(comment).toHaveText("Find this annotation");
  await expect(comment.locator("span[style*='font-weight']")).toHaveCount(0);

  const subscript = toolbar.getByRole("button", { name: "Subscript", exact: true });
  await subscript.click();
  await expect(subscript).toHaveAttribute("aria-pressed", "true");
  await expect(formatted).toHaveCSS("vertical-align", "sub");
  const paragraph = comment.locator("p");
  const originalHeight = await paragraph.evaluate(
    /** Reads the browser's natural line height with Writer styles applied. @param element - Note paragraph. @returns Height in CSS pixels. */
    (element) => Number.parseFloat(getComputedStyle(element).lineHeight),
  );
  await toolbar.getByRole("button", { name: "Line Spacing", exact: true }).click();
  await page
    .getByRole("dialog", { name: "Line Spacing", exact: true })
    .getByRole("button", { name: "Spacing: 1.5", exact: true })
    .click();
  await expect(paragraph).toHaveCSS("line-height", `${originalHeight * 1.5}px`);
  await undo.click();
  await expect(paragraph).toHaveCSS("line-height", `${originalHeight}px`);
});
