/** @fileoverview Checks style-box acceptance, travel and client focus before real continued typing. */
import { expect, test, type Locator, type Page } from "@playwright/test";
import { createDocument } from "../src/sfx2/source/doc/objsh";
import { SwDoc } from "../src/sw/source/core/doc/doc";
import { SwDocShell } from "../src/sw/source/uibase/app/docsh";
import { SwWrtShell } from "../src/sw/source/uibase/wrtsh/wrtsh1";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";

/** Opens an owned ODT and places a real paragraph-end cursor before toolbar focus. @param page - Browser page. @param width - Viewport width. @returns Product locators. */
async function openOwnedStyleDocument(page: Page, width: number) {
  const metadata = createDocument({ id: "style-focus", suiteId: "writer", title: "Style focus" }),
    document = new SwDoc();
  document.MakeTextFormatColl("Owned: A & 字", document.GetDfltTextFormatColl(), "OwnedA");
  document.MakeTextFormatColl("Owned: B & 字", document.GetDfltTextFormatColl(), "OwnedB");
  const owner = new SwDocShell(document, metadata),
    shell = new SwWrtShell(owner);
  shell.SetParagraphStyle("OwnedA");
  shell.Insert("FirstStyleFocus");
  shell.SplitNode();
  shell.SetParagraphStyle("default");
  shell.Insert("UntouchedStyleFocus");
  const bytes = writeOdtDocument(document, metadata);
  owner.Close();
  await page.setViewportSize({ width, height: 800 });
  await page.goto("/writer");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: Buffer.from(bytes),
    mimeType: "application/vnd.oasis.opendocument.text",
    name: "style-focus.odt",
  });
  const editor = page.getByLabel("Writer document body", { exact: true }),
    select = page.getByRole("combobox", { name: "Paragraph style", exact: true });
  const paragraph = page
      .locator("[data-writer-paragraph-id]")
      .filter({ hasText: "FirstStyleFocus" }),
    untouched = page
      .locator("[data-writer-paragraph-id]")
      .filter({ hasText: "UntouchedStyleFocus" });
  await expect(paragraph).toHaveAttribute("data-style", "OwnedA");
  await paragraph.click();
  await page.keyboard.press("End");
  return {
    editor,
    select,
    paragraph,
    untouched,
    untouchedStyle: await untouched.getAttribute("style"),
  };
}

/** Verifies focus belongs to the owning editing host or its paragraph without changing browser focus. @param editor - Owning client. @returns Assertion completion. */
async function expectClientFocus(editor: Locator): Promise<void> {
  await expect
    .poll(
      /** Reads actual client ownership of focus. @returns Browser focus predicate. */ async () =>
        editor.evaluate(
          /** Checks the native active element. @param element - Editing host. @returns Whether focus belongs to this client. */ (
            element,
          ) => element.contains(element.ownerDocument.activeElement),
        ),
    )
    .toBe(true);
}

for (const width of [1280, 390]) {
  test(`Writer direct style choice focus width=${width}`, /** Checks actual accepted style focus before text insertion and real history. @param fixtures - Browser page. @param testInfo - Screenshot output. @returns Completion. */ async ({
    page,
  }, testInfo) => {
    const fixture = await openOwnedStyleDocument(page, width);
    await fixture.select.focus();
    await fixture.select.selectOption("OwnedB");
    await expectClientFocus(fixture.editor);
    await expect(fixture.paragraph).toHaveAttribute("data-style", "OwnedB");
    await page.keyboard.insertText(":Pick");
    await expect(fixture.paragraph).toHaveText("FirstStyleFocus:Pick");
    await page.keyboard.press("Control+z");
    await expect(fixture.paragraph).toHaveText("FirstStyleFocus");
    await page.keyboard.press("Control+z");
    await expect(fixture.select).toHaveValue("OwnedA");
    await page.keyboard.press("Control+Shift+z");
    await expect(fixture.select).toHaveValue("OwnedB");
    await fixture.select.focus();
    await fixture.select.selectOption("OwnedB");
    await expectClientFocus(fixture.editor);
    await page.keyboard.press("Control+z");
    await expect(fixture.select).toHaveValue("OwnedA");
    await expect(fixture.untouched).toHaveText("UntouchedStyleFocus");
    await expect(fixture.untouched).toHaveAttribute("style", fixture.untouchedStyle as string);
    await page.screenshot({
      path: testInfo.outputPath("direct-style-focus.png"),
      scale: "css",
      fullPage: true,
    });
  });
  test(`Writer keyboard style choice focus width=${width}`, /** Checks noncommitting travel, Escape, Enter and Tab before continued typing. @param fixtures - Browser page. @param testInfo - Screenshot output. @returns Completion. */ async ({
    page,
  }, testInfo) => {
    const fixture = await openOwnedStyleDocument(page, width),
      undo = page.getByRole("button", { name: "Undo", exact: true });
    await fixture.select.focus();
    await page.keyboard.press("ArrowDown");
    await expect(fixture.select).toHaveValue("OwnedB");
    await expect(fixture.select).toBeFocused();
    await expect(fixture.paragraph).toHaveAttribute("data-style", "OwnedA");
    await expect(undo).toBeDisabled();
    await page.keyboard.press("Enter");
    await expectClientFocus(fixture.editor);
    await expect(fixture.paragraph).toHaveAttribute("data-style", "OwnedB");
    await page.keyboard.insertText(":Enter");
    await expect(fixture.paragraph).toHaveText("FirstStyleFocus:Enter");
    await page.keyboard.press("Control+z");
    await page.keyboard.press("Control+z");
    await expect(fixture.select).toHaveValue("OwnedA");
    await fixture.select.focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Escape");
    await expectClientFocus(fixture.editor);
    await expect(fixture.select).toHaveValue("OwnedA");
    await expect(undo).toBeDisabled();
    await fixture.select.focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("combobox", { name: "Font name", exact: true })).toBeFocused();
    await expect(fixture.paragraph).toHaveAttribute("data-style", "OwnedB");
    await page.keyboard.press("Shift+Tab");
    await expect(fixture.select).toBeFocused();
    await page.keyboard.press("Enter");
    await expectClientFocus(fixture.editor);
    await page.keyboard.insertText(":Tab");
    await expect(fixture.paragraph).toHaveText("FirstStyleFocus:Tab");
    await page.keyboard.press("Control+z");
    await page.keyboard.press("Control+z");
    await expect(fixture.select).toHaveValue("OwnedA");
    await expect(fixture.untouched).toHaveText("UntouchedStyleFocus");
    await expect(fixture.untouched).toHaveAttribute("style", fixture.untouchedStyle as string);
    await page.screenshot({
      path: testInfo.outputPath("keyboard-style-focus.png"),
      scale: "css",
      fullPage: true,
    });
  });
}
