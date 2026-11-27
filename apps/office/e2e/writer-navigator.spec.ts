/** @fileoverview Verifies the modeless Writer Navigator menu, shortcut and native cursor activation. */
import { expect, test } from "@playwright/test";
import { openBrowserMenu } from "../test-support/menu-pointer-e2e";

test("Writer Navigator tracks one heading while the cursor moves in the heading root", /** Ports the pinned tdf114724 heading tracking workflow. @param fixtures - Browser test inputs. @param fixtures.page - Writer page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/writer", { waitUntil: "domcontentloaded" });
  const paragraphs = page.locator("[data-writer-paragraph-id]");
  await paragraphs.first().click();
  for (let index = 1; index <= 4; index++) {
    if (index > 1) await page.keyboard.press("Enter");
    await page.keyboard.insertText(`HEADING ${index}`);
  }
  const formatting = page.getByRole("toolbar", { name: "Writer formatting toolbar" });
  const style = formatting.getByRole("combobox", { name: "Paragraph style", exact: true });
  for (let index = 0; index < 4; index++) {
    await paragraphs.nth(index).click();
    await formatting.getByRole("button", { name: "Show Paragraph style", exact: true }).click();
    await page
      .locator(`id=${await style.getAttribute("aria-controls")}`)
      .getByRole("option", { name: "Heading 1", exact: true })
      .click();
  }
  await paragraphs.first().click();
  await page.keyboard.press("F5");
  const navigator = page.getByRole("dialog", { name: "Navigator", exact: true });
  await navigator.getByRole("button", { name: "Content Navigation View" }).click();
  const selected = navigator.getByRole("treeitem", { selected: true });
  await paragraphs.first().click();
  await expect(selected).toHaveText("HEADING 1");
  for (let index = 0; index < 3; index++) await page.keyboard.press("ArrowDown");
  await expect(selected).toHaveText("HEADING 4");
  for (let index = 0; index < 3; index++) await page.keyboard.press("ArrowUp");
  await expect(selected).toHaveText("HEADING 1");
  await navigator.getByRole("button", { name: "Content Navigation View" }).click();
  await expect(navigator.getByRole("tree")).not.toHaveAttribute("aria-multiselectable");
});

test("Writer Navigator opens the selected bookmark and deletes all marks in one undo step", /** Verifies real bookmark slot dispatch and grouped deletion in Chromium. @param fixtures - Browser test inputs. @param fixtures.page - Writer page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/writer");
  const editor = page.getByRole("textbox", { name: "Writer document text" });
  await editor.fill("Bookmark positions");
  const bookmark = page.getByRole("dialog", { name: "Bookmark", exact: true });
  for (const [key, name] of [
    ["Home", "Earlier"],
    ["End", "Later"],
  ] as const) {
    await editor.press(key);
    await openBrowserMenu(page, "Insert");
    await page.getByRole("menuitem", { name: /^Bookmark/u }).click();
    await bookmark.getByLabel("Name", { exact: true }).fill(name);
    await bookmark.getByRole("button", { name: "Insert", exact: true }).click();
    await expect(bookmark).toBeHidden();
  }
  const standard = page.getByRole("toolbar", { name: "Writer standard toolbar" });
  const undo = standard.getByRole("button", { name: "Undo", exact: true });
  await page.keyboard.press("F5");
  const navigator = page.getByRole("dialog", { name: "Navigator", exact: true });
  const earlier = navigator.getByRole("treeitem", { name: "Earlier", exact: true });
  const later = navigator.getByRole("treeitem", { name: "Later", exact: true });
  await earlier.dblclick();
  await navigator.getByRole("button", { name: "Edit Bookmark", exact: true }).click();
  await expect(bookmark.getByRole("listbox").locator("option:checked")).toHaveText("Earlier");
  await bookmark.getByRole("button", { name: "Rename", exact: true }).click();
  const rename = page.getByRole("dialog", { name: "Rename object: Earlier", exact: true });
  await rename.getByLabel("New name").fill("Renamed");
  await rename.getByRole("button", { name: "OK", exact: true }).click();
  await bookmark.getByRole("button", { name: "Close", exact: true }).last().click();
  await expect(navigator.getByRole("treeitem", { name: "Renamed", exact: true })).toBeVisible();
  await undo.click();
  await expect(earlier).toBeVisible();
  await navigator.getByRole("treeitem", { name: "Bookmarks", exact: true }).click();
  await navigator.getByRole("button", { name: "Delete All Bookmarks", exact: true }).click();
  await expect(
    navigator.getByRole("button", { name: "Delete All Bookmarks", exact: true }),
  ).toBeHidden();
  await undo.click();
  await navigator.getByRole("treeitem", { name: "Bookmarks", exact: true }).click();
  await expect(earlier).toBeVisible();
  await expect(later).toBeVisible();
  await expect(editor).toHaveText("Bookmark positions");
});

test("Writer Navigator moves selected chapters together in the heading root", /** Verifies native tree modifiers, one history action, and retained selection. @param fixtures - Browser test inputs. @param fixtures.page - Writer page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/writer", { waitUntil: "domcontentloaded" });
  const paragraphs = page.locator("[data-writer-paragraph-id]");
  await paragraphs.first().click();
  await page.keyboard.insertText("First");
  await page.keyboard.press("Enter");
  await page.keyboard.insertText("Second");
  await page.keyboard.press("Enter");
  await page.keyboard.insertText("Third");
  const formatting = page.getByRole("toolbar", { name: "Writer formatting toolbar" });
  const style = formatting.getByRole("combobox", { name: "Paragraph style", exact: true });
  for (let index = 0; index < 3; index++) {
    await paragraphs.nth(index).click();
    await formatting.getByRole("button", { name: "Show Paragraph style", exact: true }).click();
    await page
      .locator(`id=${await style.getAttribute("aria-controls")}`)
      .getByRole("option", { name: "Heading 1", exact: true })
      .click();
  }
  await page.keyboard.press("F5");
  const navigator = page.getByRole("dialog", { name: "Navigator", exact: true });
  const tree = navigator.getByRole("tree");
  const first = tree.getByRole("treeitem", { name: "First", exact: true });
  const second = tree.getByRole("treeitem", { name: "Second", exact: true });
  await first.click();
  await navigator.getByRole("button", { name: "Content Navigation View" }).click();
  await expect(tree).toHaveAttribute("aria-multiselectable", "true");
  await second.click({ modifiers: ["ControlOrMeta"] });
  await expect(first).toHaveAttribute("aria-selected", "true");
  await expect(second).toHaveAttribute("aria-selected", "true");
  const down = navigator.getByRole("button", { name: "Move Heading Down" });
  await down.click();
  await expect(down).toBeFocused();
  await expect(paragraphs).toHaveText(["Third", "First", "Second"]);
  await expect(first).toHaveAttribute("aria-selected", "true");
  await expect(second).toHaveAttribute("aria-selected", "true");
  await page
    .getByRole("toolbar", { name: "Writer standard toolbar" })
    .getByRole("button", { name: "Undo", exact: true })
    .click();
  await expect(paragraphs).toHaveText(["First", "Second", "Third"]);
});

test("Writer Navigator opens from View and returns the cursor to a native heading", /** Exercises the upstream-shaped Navigator title, controls and outline tree. @param fixtures - Browser test inputs. @param fixtures.page - Writer page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/writer", { waitUntil: "domcontentloaded" });
  const first = page.locator("[data-writer-paragraph-id]").first();
  await first.click();
  await page.keyboard.insertText("Document chapter");
  const style = page
    .getByRole("toolbar", { name: "Writer formatting toolbar" })
    .getByRole("combobox", { name: "Paragraph style", exact: true });
  await style
    .locator("..")
    .getByRole("button", { name: "Show Paragraph style", exact: true })
    .click();
  const stylePopup = page.locator(`id=${await style.getAttribute("aria-controls")}`);
  await stylePopup.getByRole("option", { name: "Heading 1", exact: true }).click();
  await first.click();
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await page.keyboard.insertText("Other text");

  await openBrowserMenu(page, "View");
  const command = page.getByRole("menuitemcheckbox", { name: "Navigator", exact: true });
  await expect(command).toHaveAttribute("aria-checked", "false");
  await command.click();
  const navigator = page.getByRole("dialog", { name: "Navigator", exact: true });
  const heading = navigator.getByRole("treeitem", { name: "Document chapter", exact: true });
  await expect(navigator.getByRole("spinbutton", { name: "Go to page", exact: true })).toHaveValue(
    "1",
  );
  await expect(heading).toBeVisible();
  await heading.dblclick();
  await expect
    .poll(
      /** Reads the live browser caret after the native navigation. @returns Current text. */
      () =>
        page.evaluate(
          /** Reads the painted paragraph containing the browser caret. @returns Text or absence. */
          () =>
            globalThis
              .getSelection()
              ?.focusNode?.parentElement?.closest("[data-writer-paragraph-id]")?.textContent,
        ),
    )
    .toBe("Document chapter");
  await navigator.getByRole("button", { name: "Close Navigator", exact: true }).click();
  await expect(navigator).toBeHidden();
  await page.keyboard.press("F5");
  await expect(navigator).toBeVisible();
  await expect(heading).toBeVisible();
});

test("Writer Navigator heading tools move and relevel the selected chapter", /** Uses the real editing surface and heading tools, including movement without sublevels. @param fixtures - Browser test inputs. @param fixtures.page - Writer page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/writer", { waitUntil: "domcontentloaded" });
  const paragraphs = page.locator("[data-writer-paragraph-id]");
  await paragraphs.first().click();
  await page.keyboard.insertText("First");
  await page.keyboard.press("Enter");
  await page.keyboard.insertText("Child");
  await page.keyboard.press("Enter");
  await page.keyboard.insertText("Second");
  const style = page
    .getByRole("toolbar", { name: "Writer formatting toolbar" })
    .getByRole("combobox", { name: "Paragraph style", exact: true });
  for (const [index, heading] of ["Heading 1", "Heading 2", "Heading 1"].entries()) {
    await paragraphs.nth(index).click();
    await style
      .locator("..")
      .getByRole("button", { name: "Show Paragraph style", exact: true })
      .click();
    await page
      .locator(`id=${await style.getAttribute("aria-controls")}`)
      .getByRole("option", { name: heading, exact: true })
      .click();
  }
  await page.keyboard.press("F5");
  const navigator = page.getByRole("dialog", { name: "Navigator", exact: true });
  const tools = navigator.getByRole("toolbar", { name: "Heading Tools" });
  await expect(tools).toBeHidden();
  const first = navigator.getByRole("treeitem", { name: "First", exact: true });
  const child = navigator.getByRole("treeitem", { name: "Child", exact: true });
  await first.click();
  await expect(tools.getByRole("button")).toHaveCount(4);
  await tools.getByRole("button", { name: "Move Heading Down" }).click();
  await expect(paragraphs).toHaveText(["Second", "First", "Child"]);
  await expect(first).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ControlOrMeta+z");
  await expect(paragraphs).toHaveText(["First", "Child", "Second"]);
  await tools
    .getByRole("button", { name: "Move Heading Down" })
    .click({ modifiers: ["ControlOrMeta"] });
  await expect(paragraphs).toHaveText(["Child", "Second", "First"]);
  await page.keyboard.press("ControlOrMeta+z");
  await expect(paragraphs).toHaveText(["First", "Child", "Second"]);
  await tools.getByRole("button", { name: "Demote Outline Level" }).click();
  const outlineLevel = navigator.getByRole("combobox", { name: "Show Up to Outline Level" });
  await outlineLevel.selectOption("2");
  await expect(child).toBeHidden();
  await tools.getByRole("button", { name: "Promote Outline Level" }).click();
  await expect(child).toBeVisible();
});

test("Writer Navigator context menus change tracking and keep native preferences after reload", /** Exercises row-specific checkboxes, a keyboard submenu and browser persistence. @param fixtures - Browser test inputs. @param fixtures.page - Writer page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/writer", { waitUntil: "domcontentloaded" });
  const editor = page.getByRole("textbox", { name: "Writer document text" });
  const navigator = page.getByRole("dialog", { name: "Navigator", exact: true });
  const context = page.getByRole("menu", { name: "Navigator context menu" });
  const headings = navigator.getByRole("treeitem", { name: "Headings", exact: true });
  const tableTracking = context.getByRole("menuitemcheckbox", { name: "Table Tracking" });
  const bookmarkTracking = context.getByRole("menuitemcheckbox", { name: "Bookmark Tracking" });
  const outlineTracking = context.getByRole("menuitem", { name: "Outline Tracking" });
  const outlineMenu = context.getByRole("menu", { name: "Outline Tracking menu" });
  await editor.click();
  await page.keyboard.press("F5");
  await headings.press("Shift+F10");
  await expect(context).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(outlineTracking).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(outlineMenu.getByRole("menuitemradio", { name: "Default" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await expect(headings).toBeFocused();
  await expect(context).toBeHidden();
  for (const [category, toggle] of [
    ["Tables", tableTracking],
    ["Bookmarks", bookmarkTracking],
  ] as const) {
    const row = navigator.getByRole("treeitem", { name: category, exact: true });
    await row.click({ button: "right" });
    await expect(outlineTracking).toHaveCount(0);
    await expect(toggle).toHaveAttribute("aria-checked", "true");
    await toggle.click();
    await expect(row).toBeFocused();
  }
  await page.reload({ waitUntil: "domcontentloaded" });
  await editor.click();
  await page.keyboard.press("F5");
  for (const [category, toggle] of [
    ["Tables", tableTracking],
    ["Bookmarks", bookmarkTracking],
  ] as const) {
    await navigator
      .getByRole("treeitem", { name: category, exact: true })
      .click({ button: "right" });
    await expect(toggle).toHaveAttribute("aria-checked", "false");
    await page.keyboard.press("Escape");
    await expect(context).toBeHidden();
    await expect(navigator).toBeVisible();
  }
  await headings.click({ button: "right" });
  await outlineTracking.click();
  await expect(outlineMenu.getByRole("menuitemradio", { name: "Off" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
});
