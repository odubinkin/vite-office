/** @fileoverview Verifies Writer search shortcuts, focus, and replacement history in Chromium. */

import { readFile } from "node:fs/promises";
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

  await page.keyboard.press("Control+a");
  await page.getByRole("menuitem", { name: "Format", exact: true }).click();
  await page.getByRole("menuitem", { name: "Character…", exact: true }).click();
  const character = page.getByRole("dialog", { name: "Character", exact: true });
  await expect(character.getByRole("tab", { name: "Font", exact: true })).toBeFocused();
  await character.getByRole("spinbutton", { name: "Size", exact: true }).fill("24");
  await character.getByRole("tab", { name: "Borders", exact: true }).click();
  await character.getByRole("button", { name: "All Four Borders", exact: true }).click();
  await character.getByRole("button", { name: "OK", exact: true }).click();
  await expect(page.getByLabel("Writer document body", { exact: true })).toBeFocused();
  const run = editor.getByText("cat scatter cat", { exact: true });
  await expect(run).toHaveCSS("font-size", "32px");
  const border = editor.locator('span[style*="box-decoration-break"]');
  await expect(border).toHaveCSS("border-top-style", "solid");
  await page.keyboard.press("Control+z");
  await expect(run).not.toHaveCSS("font-size", "32px");
  await expect(border).toHaveCount(0);
});

test("Writer replaces body matches around a comment and restores them with one undo", /** Uses the ordinary annotation and replacement controls. @param fixtures - Playwright fixtures. @param fixtures.page - Chromium page. @returns Test completion. */ async ({
  page,
}) => {
  await page.goto("/writer");
  const editor = page.getByRole("textbox", { name: "Writer document text", exact: true });
  await editor.fill("hit inside hit");
  await page.keyboard.press("End");
  for (let i = 0; i < " hit".length; i++) await page.keyboard.press("ArrowLeft");
  await page.getByRole("button", { name: "Comment", exact: true }).click();
  const comment = page.getByRole("textbox", { name: "Comment — Unknown Author" });
  await expect(comment).toBeFocused();
  await page.keyboard.insertText("hit in the comment");

  await editor.click();
  await page.keyboard.press("Control+h");
  const dialog = page.getByRole("dialog", { name: "Find and Replace", exact: true });
  await dialog.getByLabel("Find", { exact: true }).fill("hit");
  await dialog.getByLabel("Replace with", { exact: true }).fill("matched");
  await dialog.getByRole("button", { name: "Replace All", exact: true }).click();
  await expect(dialog.getByRole("status")).toHaveText("Search key replaced 2 times.");
  await expect(editor).toHaveText("matched inside\uFFF9 matched");
  await expect(comment).toHaveText("hit in the comment");

  await page.keyboard.press("Escape");
  await page.keyboard.press("Control+z");
  await expect(editor).toHaveText("hit inside\uFFF9 hit");
  await expect(comment).toHaveText("hit in the comment");
});

test("Writer replaces a match across a comment marker and restores the comment on undo", /** Checks removal and restoration through normal browser commands. @param fixtures - Playwright fixtures. @param fixtures.page - Chromium page. @returns Test completion. */ async ({
  page,
}) => {
  await page.goto("/writer");
  const editor = page.getByRole("textbox", { name: "Writer document text", exact: true });
  await editor.fill("hit");
  await page.keyboard.press("End");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await page.getByRole("button", { name: "Comment", exact: true }).click();
  const comment = page.getByRole("textbox", { name: "Comment — Unknown Author" });
  await expect(comment).toBeFocused();
  await page.keyboard.insertText("Comment inside the match");

  await editor.click();
  await page.keyboard.press("Control+h");
  const dialog = page.getByRole("dialog", { name: "Find and Replace", exact: true });
  await dialog.getByLabel("Find", { exact: true }).fill("hit");
  await dialog.getByLabel("Replace with", { exact: true }).fill("matched");
  await dialog.getByRole("button", { name: "Replace All", exact: true }).click();
  await expect(dialog.getByRole("status")).toHaveText("Search key replaced 1 times.");
  await expect(editor).toHaveText("matched");
  await expect(comment).toHaveCount(0);

  await page.keyboard.press("Escape");
  await page.keyboard.press("Control+z");
  await expect(editor).toHaveText("h\uFFF9it");
  await expect(comment).toHaveText("Comment inside the match");
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
  await page.keyboard.press("Control+a");
  await page.getByRole("menuitem", { name: "Format", exact: true }).click();
  await page.getByRole("menuitem", { name: "Character…", exact: true }).click();
  const noteCharacter = page.getByRole("dialog", { name: "Character", exact: true });
  await expect(noteCharacter.getByRole("tab", { name: "Font", exact: true })).toBeFocused();
  await noteCharacter.getByRole("spinbutton", { name: "Size", exact: true }).fill("20");
  await noteCharacter.getByRole("button", { name: "OK", exact: true }).click();
  await expect(comment).toBeFocused();
  await expect(comment.locator("span").first()).toHaveCSS("font-size", "26.6667px");
  await page.keyboard.press("Control+z");
  await expect(comment.locator("span").first()).not.toHaveCSS("font-size", "26.6667px");
  await page.keyboard.press("Escape");
  await expect(page.getByLabel("Writer document body", { exact: true })).toBeFocused();

  const commentActions = page.getByLabel("Comment actions", { exact: true });
  await commentActions.click();
  await page.getByRole("button", { name: "Resolve", exact: true }).click();
  await expect(page.getByText("Resolved", { exact: true })).toBeVisible();
  await commentActions.click();
  await page.getByRole("button", { name: "Unresolve", exact: true }).click();
  await expect(page.getByText("Resolved", { exact: true })).toBeHidden();
  await commentActions.click();
  await page.getByRole("button", { name: "Resolve Thread", exact: true }).click();
  await expect(page.getByText("Resolved", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Writer document body", { exact: true })).toBeFocused();
  await commentActions.click();
  await page.getByRole("button", { name: "Unresolve Thread", exact: true }).click();
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
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await commentActions.click();
  await page.getByRole("button", { name: "Delete Comment", exact: true }).click();
  await expect(comment).toHaveCount(0);
  await expect(page.getByLabel("Writer document body", { exact: true })).toBeFocused();
  await undo.click();
  await expect(comment).toHaveText("Find this annotation");
  await commentActions.click();
  await page.getByRole("button", { name: "Reply", exact: true }).click();
  const reply = comment.last();
  await expect(reply).toBeFocused();
  await expect(reply).toContainText('"Find this annotation"');
  await page.keyboard.insertText("Browser reply");
  await expect(reply.locator("p").last()).toHaveText("Browser reply");

  const replyActions = page
    .locator("article")
    .filter({ hasText: "Browser reply" })
    .getByLabel("Comment actions", { exact: true });
  const promote = page.getByRole("button", { name: "Promote Comment", exact: true });
  await replyActions.click();
  await promote.click();
  await expect(page.getByLabel("Writer document body", { exact: true })).toBeFocused();
  await expect(reply.locator("p").last()).toHaveText("Browser reply");
  await replyActions.click();
  await expect(promote).toHaveCount(0);

  await page.getByRole("button", { name: "Format All Comments…" }).click();
  const character = page.getByRole("dialog", { name: "Character", exact: true });
  await expect(character.getByRole("tab", { name: "Font", exact: true })).toBeFocused();
  await character.getByRole("spinbutton", { name: "Size", exact: true }).fill("17");
  await character.getByRole("tab", { name: "Font Effects", exact: true }).click();
  await character.getByRole("combobox", { name: "Emphasis mark" }).selectOption({ label: "Dot" });
  await character.getByRole("combobox", { name: "Position" }).selectOption({ label: "Below text" });
  await character.getByRole("combobox", { name: "Underlining" }).selectOption("1");
  await character.getByRole("checkbox", { name: "Individual words" }).check();
  await character.getByRole("button", { name: "OK", exact: true }).click();
  const replyText = reply.locator("p").last().locator("span").first();
  const firstNoteText = comment.first().locator("p").first().locator("span").first();
  for (const portion of [replyText, firstNoteText]) {
    await expect(portion).toHaveCSS("font-size", "22.6667px");
    await expect(portion).toHaveCSS("text-emphasis-style", /^(filled )?dot$/);
    await expect(portion).toHaveCSS("text-emphasis-position", /^under( right)?$/);
  }
  await expect(
    reply.locator("p").last().locator('[style*="text-decoration-line: underline"]'),
  ).toHaveText(["Browser", "reply"]);
  await undo.click();
  await expect(
    reply.locator("p").last().locator('[style*="text-decoration-line: underline"]'),
  ).toHaveCount(0);
  await expect(replyText).toHaveCSS("text-emphasis-style", "none");
  await expect(firstNoteText).toHaveCSS("text-emphasis-style", "none");

  await replyActions.click();
  await page.evaluate(
    /** Enables the original shared Writer setting for the browser query. @returns Nothing. */ () =>
      localStorage.setItem("org.openoffice.Office.Common/Misc/QueryDeleteAllComments", "true"),
  );
  await page.getByRole("button", { name: "Delete All Comments", exact: true }).click();
  const deleteQuery = page.getByRole("dialog", { name: "Confirm delete" });
  await expect(deleteQuery.getByRole("button", { name: "No", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(deleteQuery).toHaveCount(0);
  await expect(comment).toHaveCount(2);

  await replyActions.click();
  await page.getByRole("button", { name: "Delete All Comments", exact: true }).click();
  await deleteQuery.getByRole("button", { name: "Yes", exact: true }).click();
  await expect(comment).toHaveCount(0);
  await expect(page.getByLabel("Writer document body", { exact: true })).toBeFocused();
  await undo.click();
  await expect(comment).toHaveCount(2);
});

test("Writer keeps emphasis from formatted replacement after reopening the exported ODT", /** Checks the computed style, undo and ODT reopen through the production UI. @param fixtures - Playwright fixtures. @param fixtures.page - Chromium page. @returns Test completion. */ async ({
  page,
}) => {
  await page.goto("/writer");
  const editor = page.getByRole("textbox", { name: "Writer document text", exact: true });
  await editor.fill("plain marked plain");
  await page.keyboard.press("Control+h");
  const dialog = page.getByRole("dialog", { name: "Find and Replace", exact: true });
  await dialog.getByLabel("Find", { exact: true }).fill("marked");
  await dialog.getByText("Other options", { exact: true }).click();
  await dialog.getByLabel("Replace with", { exact: true }).fill("marked");
  await dialog.getByRole("button", { name: "Format…" }).click();
  const replacement = page.getByRole("dialog", { name: "Replace", exact: true });
  await replacement.getByRole("tab", { name: "Font Effects" }).click();
  await replacement.getByRole("combobox", { name: "Emphasis mark" }).selectOption({ label: "Dot" });
  await replacement
    .getByRole("combobox", { name: "Position" })
    .selectOption({ label: "Below text" });
  await replacement.getByRole("button", { name: "OK" }).click();
  await dialog.getByRole("button", { name: "Replace All", exact: true }).click();

  const marked = editor.getByText("marked", { exact: true });
  await expect(marked).toHaveCSS("text-emphasis-style", /^(filled )?dot$/);
  await expect(marked).toHaveCSS("text-emphasis-position", /^under( right)?$/);
  await page.keyboard.press("Escape");
  await page.keyboard.press("Control+z");
  await expect(editor).toHaveText("plain marked plain");
  await expect(editor.locator('[style*="text-emphasis-style"]')).toHaveCount(0);
  await page.keyboard.press("Control+y");
  await expect(marked).toHaveCSS("text-emphasis-position", /^under( right)?$/);

  const pending = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File", exact: true }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download ODT" }).click();
  const path = await (await pending).path();
  if (path === null) throw new Error("Missing exported ODT.");

  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: await readFile(path),
    mimeType: "application/vnd.oasis.opendocument.text",
    name: "emphasis.odt",
  });
  await expect(page.getByRole("dialog", { name: "Open", exact: true })).toHaveCount(0);
  await expect(editor).toHaveText("plain marked plain");
  await expect(marked).toHaveCSS("text-emphasis-style", /^(filled )?dot$/);
  await expect(marked).toHaveCSS("text-emphasis-position", /^under( right)?$/);
});

test("Writer applies paragraph hyphenation and preserves a character exception", /** Exercises the native checkbox and spin controls through the production search dialog. @param fixtures - Playwright fixtures. @param fixtures.page - Chromium page. @returns Test completion. */ async ({
  page,
}) => {
  await page.goto("/writer");
  const editor = page.getByRole("textbox", { name: "Writer document text", exact: true });
  await editor.fill("Paragraph to format");
  await page.keyboard.press("Control+h");
  const dialog = page.getByRole("dialog", { name: "Find and Replace", exact: true });
  await dialog.getByLabel("Find", { exact: true }).fill("format");
  await dialog.getByText("Other options", { exact: true }).click();
  await dialog.getByLabel("Replace with", { exact: true }).fill("format");
  await dialog.getByRole("button", { name: "Format…" }).click();
  const replacement = page.getByRole("dialog", { name: "Replace", exact: true });
  await replacement.getByRole("tab", { name: "Text Flow" }).click();

  const automatic = replacement.getByRole("checkbox", { name: "Automatically", exact: true });
  const lead = replacement.getByRole("spinbutton", { name: "Characters at line end", exact: true });
  await expect(lead).toBeDisabled();
  await automatic.click();
  await automatic.click();
  await expect(lead).toBeEnabled();
  await lead.fill("3");
  await replacement.getByRole("button", { name: "OK" }).click();
  await expect(dialog.getByText(/3 characters at end of line/)).toBeVisible();
  await dialog.getByRole("button", { name: "Replace All", exact: true }).click();
  await expect(dialog.getByRole("status")).toHaveText(/replaced 1 time/);

  await dialog.getByLabel("Find", { exact: true }).focus();
  await dialog.getByRole("button", { name: "Attributes…" }).click();
  const attributes = page.getByRole("dialog", { name: "Attributes", exact: true });
  await attributes.getByRole("checkbox", { name: "Hyphenation", exact: true }).check();
  await attributes.getByRole("button", { name: "OK" }).click();
  await dialog.getByRole("button", { name: "Find All", exact: true }).click();
  await expect(dialog.getByRole("status")).toHaveText("One match found.");

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(editor).toHaveCSS("hyphens", "auto");
  await page.getByRole("menuitem", { name: "Format", exact: true }).click();
  await page.getByRole("menuitem", { name: "Paragraph…", exact: true }).click();
  const paragraph = page.getByRole("dialog", { name: "Paragraph", exact: true });
  const flow = paragraph.getByRole("tab", { name: "Text Flow", exact: true });
  await flow.click();
  const paragraphLead = paragraph.getByRole("spinbutton", {
    name: "Characters at line end",
    exact: true,
  });
  await expect(paragraphLead).toHaveValue("3");
  await paragraphLead.fill("4");
  await paragraph.getByRole("tab", { name: "Tabs", exact: true }).click();
  await flow.click();
  await expect(paragraphLead).toHaveValue("4");
  await paragraph.getByRole("button", { name: "OK", exact: true }).click();
  await expect(editor).toHaveCSS("hyphenate-limit-chars", "4 4 2");
  await expect(editor).toHaveCSS("font-optical-sizing", "auto");
  await editor.press("Home");
  for (let offset = 0; offset < "Paragraph".length; offset++)
    await editor.press("Shift+ArrowRight");
  await page.getByRole("menuitem", { name: "Format", exact: true }).click();
  await page.getByRole("menuitem", { name: "Character…", exact: true }).click();
  const character = page.getByRole("dialog", { name: "Character", exact: true });
  await character.getByRole("tab", { name: "Position", exact: true }).click();
  const excluded = character.getByRole("checkbox", {
    name: "Exclude from hyphenation",
    exact: true,
  });
  const optical = character
    .getByRole("group", { name: "Optical Font Sizing", exact: true })
    .getByRole("checkbox", { name: "Auto", exact: true });
  await expect(excluded).not.toBeChecked();
  await expect(optical).toBeChecked();
  await excluded.check();
  await optical.uncheck();
  await character.getByRole("button", { name: "OK", exact: true }).click();
  const word = editor.getByText("Paragraph", { exact: true });
  await expect(word).toHaveCSS("hyphens", "manual");
  await expect(word).toHaveCSS("font-optical-sizing", "none");
  await expect(editor.getByText("to format", { exact: true })).toHaveCSS("hyphens", "auto");
  await expect(editor).toHaveText("Paragraph to format");
});

test("Writer preserves independent word-only lines when reopening an ODT", /** Drives the native Character Font Effects page and ODT round-trip. @param fixtures - Playwright fixtures. @param fixtures.page - Chromium page. @returns Test completion. */ async ({
  page,
}) => {
  await page.goto("/writer");
  const editor = page.getByRole("textbox", { name: "Writer document text", exact: true });
  await editor.fill("two lines");
  await editor.press("Control+a");
  await page.getByRole("menuitem", { name: "Format", exact: true }).click();
  await page.getByRole("menuitem", { name: "Character…", exact: true }).click();
  const character = page.getByRole("dialog", { name: "Character", exact: true });
  await character.getByRole("tab", { name: "Font Effects", exact: true }).click();

  const wordLines = character.getByRole("checkbox", { name: "Individual words", exact: true });
  await expect(wordLines).toBeDisabled();
  const overlinePalette = character.getByLabel("Overline color palette", { exact: true });
  await expect(overlinePalette).toHaveAttribute("aria-disabled", "true");
  await character.getByRole("combobox", { name: "Overlining", exact: true }).selectOption("2");
  await overlinePalette.click();
  await character.getByRole("button", { name: "Overline color #ff0000", exact: true }).click();
  await character.getByRole("combobox", { name: "Underlining", exact: true }).selectOption("1");
  await character.getByLabel("Underline color palette", { exact: true }).click();
  await character.getByRole("button", { name: "Underline color #2a6099", exact: true }).click();
  await wordLines.check();
  await character.getByRole("button", { name: "OK", exact: true }).click();

  const overline = editor.locator('[style*="text-decoration-line: overline"]');
  const underline = editor.locator('[style*="text-decoration-line: underline"]');
  await expect(overline.first()).toHaveCSS("text-decoration-style", "double");
  await expect(overline.first()).toHaveCSS("text-decoration-color", "rgb(255, 0, 0)");
  await expect(underline.first()).toHaveCSS("text-decoration-color", "rgb(42, 96, 153)");

  await expect(overline).toHaveText(["two", "lines"]);
  await expect(underline).toHaveText(["two", "lines"]);
  expect(await editor.textContent()).toBe("two lines");

  const pending = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File", exact: true }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download ODT" }).click();
  const path = await (await pending).path();
  if (path === null) throw new Error("Missing exported ODT.");

  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: await readFile(path),
    mimeType: "application/vnd.oasis.opendocument.text",
    name: "line-effects.odt",
  });
  await expect(page.getByRole("dialog", { name: "Open", exact: true })).toHaveCount(0);
  await expect(editor).toHaveText("two lines");
  await expect(overline).toHaveText(["two", "lines"]);
  await expect(underline).toHaveText(["two", "lines"]);
  await expect(overline.first()).toHaveCSS("text-decoration-style", "double");
  await expect(overline.first()).toHaveCSS("text-decoration-color", "rgb(255, 0, 0)");
  await expect(underline.first()).toHaveCSS("text-decoration-color", "rgb(42, 96, 153)");

  await editor.press("Control+a");
  await page.getByRole("menuitem", { name: "Format", exact: true }).click();
  await page.getByRole("menuitem", { name: "Character…", exact: true }).click();
  await character.getByRole("tab", { name: "Font Effects", exact: true }).click();
  await expect(wordLines).toBeChecked();
  await character.getByLabel("Font Color palette", { exact: true }).click();
  await character.getByRole("button", { name: "Font Color #00a933", exact: true }).click();
  await overlinePalette.click();
  await character.getByRole("button", { name: "Automatic", exact: true }).click();
  await character.getByRole("button", { name: "OK", exact: true }).click();
  await expect(overline.first()).toHaveCSS("text-decoration-color", "rgb(0, 169, 51)");
  await expect(underline.first()).toHaveCSS("text-decoration-color", "rgb(42, 96, 153)");
});

test("Writer keeps original text through case effects, ODT reopen and search replacement", /** Checks native case items through the production dialogs and browser paint. @param fixtures - Playwright fixtures. @param fixtures.page - Chromium page. @returns Test completion. */ async ({
  page,
}) => {
  await page.goto("/writer");
  const editor = page.getByRole("textbox", { name: "Writer document text", exact: true });
  await editor.fill("alpha-beta gamma");
  await editor.press("Control+a");
  await page.getByRole("menuitem", { name: "Format", exact: true }).click();
  await page.getByRole("menuitem", { name: "Character…", exact: true }).click();
  const character = page.getByRole("dialog", { name: "Character", exact: true });
  await character.getByRole("tab", { name: "Font Effects", exact: true }).click();
  await character.getByRole("combobox", { name: "Effects", exact: true }).selectOption({
    label: "Capitalize Every Word",
  });
  await character.getByRole("button", { name: "OK", exact: true }).click();
  const initials = editor.locator('[style*="text-transform: uppercase"]');
  await expect(initials).toHaveText(["a", "g"]);
  expect(await editor.textContent()).toBe("alpha-beta gamma");

  const pending = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File", exact: true }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download ODT" }).click();
  const path = await (await pending).path();
  if (path === null) throw new Error("Missing exported ODT.");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: await readFile(path),
    mimeType: "application/vnd.oasis.opendocument.text",
    name: "case-effects.odt",
  });
  await expect(page.getByRole("dialog", { name: "Open", exact: true })).toHaveCount(0);
  await expect(initials).toHaveText(["a", "g"]);
  expect(await editor.textContent()).toBe("alpha-beta gamma");

  await page.keyboard.press("Control+h");
  const search = page.getByRole("dialog", { name: "Find and Replace", exact: true });
  await search.getByLabel("Find", { exact: true }).fill("gamma");
  await search.getByText("Other options", { exact: true }).click();
  await search.getByLabel("Replace with", { exact: true }).fill("gamma");
  await search.getByRole("button", { name: "Format…" }).click();
  const replacement = page.getByRole("dialog", { name: "Replace", exact: true });
  await replacement.getByRole("tab", { name: "Font Effects", exact: true }).click();
  await replacement.getByRole("combobox", { name: "Effects", exact: true }).selectOption({
    label: "Small capitals",
  });
  await replacement.getByRole("button", { name: "OK", exact: true }).click();
  await search.getByRole("button", { name: "Replace All", exact: true }).click();
  const smallCaps = editor.locator('[style*="font-variant-caps: small-caps"]');
  await expect(smallCaps).toHaveText("gamma");
  expect(await editor.textContent()).toBe("alpha-beta gamma");
});

test("Writer retains outline and shadow across ODT and gives relief paint precedence", /** Exercises the original Font Effects dependencies and rendered text. @param fixtures - Playwright fixtures. @param fixtures.page - Chromium page. @returns Test completion. */ async ({
  page,
}) => {
  await page.goto("/writer");
  const editor = page.getByRole("textbox", { name: "Writer document text", exact: true });
  await editor.fill("text paint");
  await editor.press("Control+a");
  await page.getByRole("menuitem", { name: "Format", exact: true }).click();
  await page.getByRole("menuitem", { name: "Character…", exact: true }).click();
  const character = page.getByRole("dialog", { name: "Character", exact: true });
  await character.getByRole("tab", { name: "Font Effects", exact: true }).click();
  const outline = character.getByRole("checkbox", { name: "Outline", exact: true });
  const shadow = character.getByRole("checkbox", { name: "Shadow", exact: true });
  const relief = character.getByRole("combobox", { name: "Relief", exact: true });
  await outline.check();
  await shadow.check();
  await relief.selectOption({ label: "Embossed" });
  await expect(outline).toBeDisabled();
  await expect(shadow).toBeDisabled();
  await relief.selectOption("0");
  await expect(outline).toBeChecked();
  await expect(shadow).toBeChecked();
  await character.getByRole("button", { name: "OK", exact: true }).click();

  const outlined = editor.locator('[style*="-webkit-text-stroke"]');
  await expect(outlined).toHaveCSS("-webkit-text-stroke-width", "1px");
  await expect(outlined).toHaveCSS("text-shadow", "rgb(192, 192, 192) 2px 2px 0px");

  const pending = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File", exact: true }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download ODT" }).click();
  const path = await (await pending).path();
  if (path === null) throw new Error("Missing exported ODT.");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: await readFile(path),
    mimeType: "application/vnd.oasis.opendocument.text",
    name: "outline-shadow.odt",
  });
  await expect(page.getByRole("dialog", { name: "Open", exact: true })).toHaveCount(0);
  await expect(outlined).toHaveCSS("-webkit-text-stroke-width", "1px");
  await expect(outlined).toHaveCSS("text-shadow", "rgb(192, 192, 192) 2px 2px 0px");

  await page.keyboard.press("Control+h");
  const search = page.getByRole("dialog", { name: "Find and Replace", exact: true });
  await search.getByLabel("Find", { exact: true }).fill("paint");
  await search.getByText("Other options", { exact: true }).click();
  await search.getByLabel("Replace with", { exact: true }).fill("paint");
  await search.getByRole("button", { name: "Format…" }).click();
  const replacement = page.getByRole("dialog", { name: "Replace", exact: true });
  await replacement.getByRole("tab", { name: "Font Effects", exact: true }).click();
  await replacement.getByRole("combobox", { name: "Relief", exact: true }).selectOption({
    label: "Engraved",
  });
  await replacement.getByRole("button", { name: "OK", exact: true }).click();
  await search.getByRole("button", { name: "Replace All", exact: true }).click();
  const engraved = editor.getByText("paint", { exact: true });
  await expect(engraved).toHaveCSS("text-shadow", "rgb(0, 0, 0) -1px -1px 0px");
  await expect(engraved).toHaveCSS("-webkit-text-stroke-width", "0px");
  await expect(editor).toHaveText("text paint");
});

test("Writer restores manual position and pair kerning when reopening Character", /** Checks the native Position form and the browser's text geometry. @param fixtures - Playwright fixtures. @param fixtures.page - Chromium page. @returns Test completion. */ async ({
  page,
}) => {
  await page.goto("/writer");
  const editor = page.getByRole("textbox", { name: "Writer document text", exact: true });
  await editor.fill("Position remains");
  await expect(editor).toHaveCSS("font-kerning", "normal");
  await editor.press("Home");
  for (let offset = 0; offset < "Position".length; offset++) await editor.press("Shift+ArrowRight");
  await page.getByRole("menuitem", { name: "Format", exact: true }).click();
  await page.getByRole("menuitem", { name: "Character…", exact: true }).click();
  const character = page.getByRole("dialog", { name: "Character", exact: true });
  const positionTab = character.getByRole("tab", { name: "Position", exact: true });
  await positionTab.click();

  const automatic = character.getByRole("checkbox", { name: "Automatic", exact: true });
  const shift = character.getByRole("spinbutton", { name: "Raise/lower by", exact: true });
  const size = character.getByRole("spinbutton", { name: "Relative font size", exact: true });
  const pairKerning = character.getByRole("checkbox", { name: "Pair kerning", exact: true });
  await character.getByRole("radio", { name: "Superscript", exact: true }).check();
  await expect(automatic).toBeChecked();
  await expect(shift).toBeDisabled();
  await automatic.uncheck();
  await shift.fill("37");
  await size.fill("70");
  await expect(pairKerning).toBeChecked();
  await pairKerning.uncheck();
  await character.getByRole("button", { name: "OK", exact: true }).click();

  const scripted = editor.locator('[data-native-escapement="37"]');
  await expect(scripted).toHaveAttribute("data-native-escapement-height", "70");
  await expect(scripted.locator(":scope > span")).not.toHaveCSS("vertical-align", "baseline");
  await expect(scripted.getByText("Position", { exact: true })).toHaveCSS("font-kerning", "none");
  await expect(editor).toHaveText("Position remains");

  const pending = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File", exact: true }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download ODT" }).click();
  const path = await (await pending).path();
  if (path === null) throw new Error("Missing exported ODT.");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: await readFile(path),
    mimeType: "application/vnd.oasis.opendocument.text",
    name: "character-position.odt",
  });
  await expect(page.getByRole("dialog", { name: "Open", exact: true })).toHaveCount(0);
  await expect(editor).toHaveText("Position remains");
  await expect(editor).toHaveCSS("font-kerning", "normal");
  await expect(scripted.getByText("Position", { exact: true })).toHaveCSS("font-kerning", "none");

  await editor.press("Home");
  for (let offset = 0; offset < "Position".length; offset++) await editor.press("Shift+ArrowRight");
  await page.getByRole("menuitem", { name: "Format", exact: true }).click();
  await page.getByRole("menuitem", { name: "Character…", exact: true }).click();
  await positionTab.click();
  await expect(character.getByRole("radio", { name: "Superscript", exact: true })).toBeChecked();
  await expect(automatic).not.toBeChecked();
  await expect(shift).toHaveValue("37");
  await expect(size).toHaveValue("70");
  await expect(pairKerning).not.toBeChecked();
});

test("Writer lays out scaled and rotated text and fits rotation to the current line", /** Drives the native Position page against mounted text and the Writer selection. @param fixtures - Playwright fixtures. @param fixtures.page - Chromium page. @returns Test completion. */ async ({
  page,
}) => {
  await page.goto("/writer");
  const editor = page.getByRole("textbox", { name: "Writer document text", exact: true });
  const text = "Rotated characters";
  await editor.fill(text);
  const character = page.getByRole("dialog", { name: "Character", exact: true });
  /** Opens Position over the selected model text. @returns Completion after the tab opens. */
  async function openPosition(): Promise<void> {
    await editor.press("Control+a");
    await page.getByRole("menuitem", { name: "Format", exact: true }).click();
    await page.getByRole("menuitem", { name: "Character…", exact: true }).click();
    await character.getByRole("tab", { name: "Position", exact: true }).click();
  }
  await openPosition();
  const scale = character.getByRole("spinbutton", { name: "Scaling", exact: true });
  const fit = character.getByRole("checkbox", { name: "Fit to line", exact: true });
  await expect(scale).toHaveValue("100");
  await expect(fit).toBeDisabled();
  await scale.fill("140");
  await character.getByRole("button", { name: "OK", exact: true }).click();
  const scaled = editor
    .locator('[data-writer-character-scale="140"]')
    .filter({ hasText: "Rotated" });
  await expect(scaled).toHaveCSS("transform", "matrix(1.4, 0, 0, 1, 0, 0)");
  expect(
    parseFloat(
      await scaled.evaluate(
        /** Reads actual inline layout space reserved by the scaled glyphs. @param element - Browser text portion. @returns CSS margin. */
        (element) => getComputedStyle(element).marginInlineEnd,
      ),
    ),
  ).toBeGreaterThan(0);
  await expect(editor).toHaveText(text);

  await openPosition();
  await expect(scale).toHaveValue("140");
  await character.getByRole("radio", { name: "90°", exact: true }).check();
  await fit.check();
  const fitted = Number(await scale.inputValue());
  expect(fitted).toBeGreaterThan(0);
  expect(fitted).toBeLessThan(100);
  await fit.uncheck();
  await expect(scale).toHaveValue("140");
  await fit.check();
  await character.getByRole("button", { name: "OK", exact: true }).click();
  const rotated = editor.locator('[data-writer-character-rotation="900"]');
  await expect(rotated).toHaveCSS("writing-mode", "sideways-lr");
  await expect(rotated).toHaveAttribute("data-writer-character-scale", String(fitted));
  await expect(editor).toHaveText(text);

  await openPosition();
  await expect(fit).toBeChecked();
  await expect(scale).toHaveValue(String(fitted));
  await character.getByRole("radio", { name: "270°", exact: true }).check();
  await character.getByRole("button", { name: "OK", exact: true }).click();
  await expect(editor.locator('[data-writer-character-rotation="2700"]')).toHaveCSS(
    "writing-mode",
    "sideways-rl",
  );
  await expect(editor).toHaveText(text);
});

test("Writer paints the chosen alignment on a justified paragraph's last line", /** Exercises the ordinary paragraph command and rendered alignment after accepting and undoing. @param fixtures - Playwright fixtures. @param fixtures.page - Chromium page. @returns Test completion. */ async ({
  page,
}) => {
  await page.goto("/writer");
  const editor = page.getByRole("textbox", { name: "Writer document text", exact: true });
  await editor.fill("Justified paragraph with a centered last line");
  const format = page.getByRole("menuitem", { name: "Format", exact: true });
  const paragraphMenu = page.getByRole("menuitem", { name: "Paragraph…", exact: true });
  const dialog = page.getByRole("dialog", { name: "Paragraph", exact: true });

  await format.click();
  await paragraphMenu.click();
  await dialog.getByRole("tab", { name: "Alignment", exact: true }).click();
  await dialog.getByRole("radio", { name: "Justified", exact: true }).check();
  await dialog.getByRole("combobox", { name: "Last line", exact: true }).selectOption({
    label: "Centered",
  });
  await dialog.getByRole("button", { name: "OK", exact: true }).click();
  await expect(editor).toHaveCSS("text-align", "justify");
  await expect(editor).toHaveCSS("text-align-last", "center");

  await format.click();
  await paragraphMenu.click();
  await dialog.getByRole("tab", { name: "Alignment", exact: true }).click();
  await expect(dialog.getByRole("radio", { name: "Justified", exact: true })).toBeChecked();
  await expect(dialog.getByRole("combobox", { name: "Last line", exact: true })).toHaveValue("3");
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.keyboard.press("Control+z");
  await expect(editor).toHaveCSS("text-align-last", "auto");
});
